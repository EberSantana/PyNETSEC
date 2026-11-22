import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileCode2,
  FilePlus2,
  FileText,
  FolderOpen,
  Loader2,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_SANDBOX_FILES,
  SANDBOX_LAB_HOSTS,
  SANDBOX_TEMPLATES,
  SandboxTemplate,
} from '../data/sandboxDefaults';
import {
  ensurePyodideReady,
  getPyodideStatus,
  PyodideStatus,
  subscribePyodideStatus,
} from '../services/pyodideEngine';
import {
  resetSandboxPythonMemory,
  runSandboxPythonCode,
  runSandboxShellCommand,
  syncFilesToSandbox,
} from '../services/pyodideSandbox';
import { SandboxTerminalLine } from '../types/ctf';

interface SandboxViewProps {
  files: Record<string, string>;
  onFilesChange: (nextFiles: Record<string, string>) => void;
  studentUsername: string;
}

const QUICK_SHELL_COMMANDS = [
  'ls',
  'hosts',
  'cat logs/acesso.log',
  'python3 scripts/scanner_etico.py',
  'python3 scripts/analisar_log.py',
];

const QUICK_REPL_SNIPPETS = [
  'import os; os.listdir(".")',
  'import socket; s = socket.socket(); s.connect_ex(("10.0.0.10", 80))',
  'import hashlib; hashlib.sha256(b"pysec").hexdigest()[:16]',
];

export function SandboxView({
  files,
  onFilesChange,
  studentUsername,
}: SandboxViewProps) {
  const fileNames = useMemo(() => Object.keys(files).sort(), [files]);
  const [selectedFile, setSelectedFile] = useState<string>(
    files['scripts/scanner_etico.py'] ? 'scripts/scanner_etico.py' : fileNames[0] ?? 'README.txt'
  );
  const [editorDraft, setEditorDraft] = useState<string>(files[selectedFile] ?? '');
  const [isDirty, setIsDirty] = useState(false);

  // New file creation state
  const [creatingFile, setCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Terminal state
  const [terminalMode, setTerminalMode] = useState<'shell' | 'repl'>('shell');
  const [cwd, setCwd] = useState('/workspace');
  const [commandInput, setCommandInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>(getPyodideStatus());
  const [terminalLines, setTerminalLines] = useState<SandboxTerminalLine[]>([
    {
      id: 'welcome-1',
      kind: 'info',
      text: 'Sandbox Python Persistente · Diretório /workspace sincronizado localmente.',
    },
    {
      id: 'welcome-2',
      kind: 'info',
      text: 'Digite "help" para comandos do shell, "hosts" para ver a rede virtual de sockets, ou alterne para Python REPL (>>>).',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const safeUser =
    studentUsername
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 14) || 'aluno';

  // Ensure Pyodide is loaded and synced when Sandbox mounts
  useEffect(() => {
    const unsub = subscribePyodideStatus(setPyodideStatus);
    ensurePyodideReady()
      .then(() => syncFilesToSandbox(files))
      .catch(() => {});
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor synced when selectedFile changes or external Python updates that file
  useEffect(() => {
    if (!files[selectedFile] && fileNames.length > 0) {
      setSelectedFile(fileNames[0]);
      setEditorDraft(files[fileNames[0]] ?? '');
      setIsDirty(false);
    } else if (!isDirty) {
      setEditorDraft(files[selectedFile] ?? '');
    }
  }, [selectedFile, files, fileNames, isDirty]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [terminalLines]);

  const appendLines = (lines: Omit<SandboxTerminalLine, 'id'>[]) => {
    const stamp = Date.now();
    setTerminalLines((prev) =>
      [
        ...prev,
        ...lines.map((line, idx) => ({
          ...line,
          id: `${stamp}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        })),
      ].slice(-200)
    );
  };

  const handleSelectFile = (name: string) => {
    if (isDirty && selectedFile && files[selectedFile] !== undefined) {
      const updated = { ...files, [selectedFile]: editorDraft };
      onFilesChange(updated);
      syncFilesToSandbox(updated).catch(() => {});
    }
    setSelectedFile(name);
    setEditorDraft(files[name] ?? '');
    setIsDirty(false);
  };

  const handleSaveCurrentFile = async (): Promise<Record<string, string>> => {
    const updated = { ...files, [selectedFile]: editorDraft };
    onFilesChange(updated);
    setIsDirty(false);
    await syncFilesToSandbox(updated);
    return updated;
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFileName
      .trim()
      .replace(/^\/+/, '')
      .replace(/\.\./g, '');
    if (!cleaned) return;
    const starter = cleaned.endsWith('.py')
      ? `# ${cleaned}\nprint("Script ${cleaned} pronto!")\n`
      : '';
    const updated = { ...files, [cleaned]: files[cleaned] ?? starter };
    onFilesChange(updated);
    setSelectedFile(cleaned);
    setEditorDraft(updated[cleaned]);
    setIsDirty(false);
    setNewFileName('');
    setCreatingFile(false);
    await syncFilesToSandbox(updated);
    appendLines([{ kind: 'info', text: `Arquivo criado no /workspace: ${cleaned}` }]);
  };

  const handleDeleteFile = async (name: string) => {
    if (fileNames.length <= 1) return;
    const updated = { ...files };
    delete updated[name];
    onFilesChange(updated);
    if (selectedFile === name) {
      const next = Object.keys(updated).sort()[0] ?? '';
      setSelectedFile(next);
      setEditorDraft(updated[next] ?? '');
      setIsDirty(false);
    }
    await syncFilesToSandbox(updated);
    appendLines([{ kind: 'info', text: `Arquivo removido: ${name}` }]);
  };

  const handleResetWorkspace = async () => {
    const fresh = { ...DEFAULT_SANDBOX_FILES };
    onFilesChange(fresh);
    setSelectedFile('scripts/scanner_etico.py');
    setEditorDraft(fresh['scripts/scanner_etico.py']);
    setIsDirty(false);
    await syncFilesToSandbox(fresh);
    appendLines([
      {
        kind: 'info',
        text: 'Sistema de arquivos /workspace restaurado para os arquivos padrão do laboratório.',
      },
    ]);
  };

  const handleLoadTemplate = async (tpl: SandboxTemplate) => {
    const updated = { ...files, [tpl.filename]: tpl.code };
    onFilesChange(updated);
    setSelectedFile(tpl.filename);
    setEditorDraft(tpl.code);
    setIsDirty(false);
    await syncFilesToSandbox(updated);
    appendLines([
      {
        kind: 'info',
        text: `Template "${tpl.label}" carregado em /workspace/${tpl.filename}. Clique em "Executar no Terminal" ou rode python3 ${tpl.filename}.`,
      },
    ]);
  };

  const handleRunActiveFileInTerminal = async () => {
    if (isExecuting) return;
    const syncedFiles = await handleSaveCurrentFile();
    setIsExecuting(true);

    const promptPrefix = `${safeUser}@pysec:${cwd}$`;
    appendLines([
      {
        kind: 'prompt',
        prefix: promptPrefix,
        text: `python3 ${selectedFile}`,
      },
    ]);

    const res = await runSandboxPythonCode(
      syncedFiles[selectedFile] ?? '',
      selectedFile,
      false,
      syncedFiles
    );
    setCwd(res.cwd);
    onFilesChange(res.files);
    setIsDirty(false);
    if (res.files[selectedFile] !== undefined) {
      setEditorDraft(res.files[selectedFile]);
    }

    const outLines: Omit<SandboxTerminalLine, 'id'>[] = [];
    if (res.stdout) {
      outLines.push({ kind: 'stdout', text: res.stdout.replace(/\n$/, '') });
    }
    if (!res.ok) {
      if (res.translatedError) {
        outLines.push({
          kind: 'error-tip',
          text: `${res.translatedError.title} — ${res.translatedError.explanation} Dica: ${res.translatedError.tip}`,
        });
      }
      if (res.stderr) {
        outLines.push({ kind: 'stderr', text: res.stderr.replace(/\n$/, '') });
      }
    } else if (!res.stdout) {
      outLines.push({
        kind: 'info',
        text: `(concluído em ${res.durationMs} ms sem saída no print)`,
      });
    }
    appendLines(outLines);
    setIsExecuting(false);
  };

  const handleExecuteTerminalCommand = async (rawCommand?: string) => {
    const cmd = (rawCommand ?? commandInput).trim();
    if (!cmd || isExecuting) return;

    setCommandInput('');
    setCmdHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)].slice(0, 40));
    setHistoryCursor(-1);

    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLines([]);
      return;
    }

    const latestFiles = isDirty ? await handleSaveCurrentFile() : files;
    const prefix = terminalMode === 'repl' ? '>>>' : `${safeUser}@pysec:${cwd}$`;

    appendLines([{ kind: 'prompt', prefix, text: cmd }]);
    setIsExecuting(true);

    const res =
      terminalMode === 'repl'
        ? await runSandboxPythonCode(cmd, 'repl.py', true, latestFiles)
        : await runSandboxShellCommand(cmd, latestFiles);

    setCwd(res.cwd);
    onFilesChange(res.files);
    if (!isDirty && res.files[selectedFile] !== undefined) {
      setEditorDraft(res.files[selectedFile]);
    }

    const nextLines: Omit<SandboxTerminalLine, 'id'>[] = [];
    if (res.stdout) {
      nextLines.push({ kind: 'stdout', text: res.stdout.replace(/\n$/, '') });
    }
    if (!res.ok) {
      if (res.translatedError) {
        nextLines.push({
          kind: 'error-tip',
          text: `${res.translatedError.title} — ${res.translatedError.explanation}`,
        });
      }
      if (res.stderr) {
        nextLines.push({ kind: 'stderr', text: res.stderr.replace(/\n$/, '') });
      }
    }
    if (nextLines.length > 0) {
      appendLines(nextLines);
    }

    setIsExecuting(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteTerminalCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = Math.min(historyCursor + 1, cmdHistory.length - 1);
      setHistoryCursor(nextIdx);
      setCommandInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyCursor <= 0) {
        setHistoryCursor(-1);
        setCommandInput('');
      } else {
        const nextIdx = historyCursor - 1;
        setHistoryCursor(nextIdx);
        setCommandInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Tab' && terminalMode === 'shell') {
      e.preventDefault();
      const parts = commandInput.split(' ');
      const last = parts[parts.length - 1] ?? '';
      if (!last) return;
      const match = fileNames.find((f) => f.startsWith(last));
      if (match) {
        parts[parts.length - 1] = match;
        setCommandInput(parts.join(' '));
      }
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setEditorDraft(`${editorDraft.slice(0, start)}    ${editorDraft.slice(end)}`);
      setIsDirty(true);
      window.requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSaveCurrentFile();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunActiveFileInTerminal();
    }
  };

  const handleResetPythonMemory = async () => {
    await resetSandboxPythonMemory();
    appendLines([
      {
        kind: 'info',
        text: 'Memória do interpretador Python (variáveis do REPL e binds locais) reiniciada.',
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Pyodide Loading Banner if first time */}
      {(pyodideStatus === 'loading-script' || pyodideStatus === 'loading-wasm') && (
        <div className="flex items-center gap-2.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-200">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
          <span>
            Inicializando Python 3 persistente e sistema de arquivos virtual /workspace...
          </span>
        </div>
      )}

      {/* Main 12-Col Sandbox Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (4 cols): Virtual Filesystem Explorer + Safe Virtual Network */}
        <aside className="flex flex-col gap-5 lg:col-span-4">
          {/* Filesystem Explorer */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  Arquivos (/workspace)
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCreatingFile((v) => !v)}
                  title="Novo arquivo"
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
                >
                  <FilePlus2 className="h-3.5 w-3.5" />
                  Novo
                </button>
                <button
                  type="button"
                  onClick={handleResetWorkspace}
                  title="Restaurar arquivos padrão"
                  className="cursor-pointer rounded-md border border-slate-700 p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {creatingFile && (
              <form onSubmit={handleCreateFile} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ex.: scripts/teste.py"
                  autoFocus
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#090D16] px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-[#05131C] hover:bg-cyan-300"
                >
                  Criar
                </button>
              </form>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Arquivos criados via Python (<code className="text-slate-200">open()</code>) ou
              shell aparecem aqui e ficam salvos no navegador.
            </p>

            <div className="mt-4 max-h-[260px] space-y-1 overflow-y-auto pr-1">
              {fileNames.map((name) => {
                const isSelected = name === selectedFile;
                const isPy = name.endsWith('.py');
                return (
                  <div
                    key={name}
                    className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-100'
                        : 'border-transparent bg-[#090D16] text-slate-300 hover:border-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectFile(name)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left font-mono"
                    >
                      {isPy ? (
                        <FileCode2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">{name}</span>
                    </button>

                    {fileNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(name)}
                        aria-label={`Remover ${name}`}
                        className="cursor-pointer rounded p-1 text-slate-500 opacity-70 transition-colors hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Virtual Lab Network Reference (Safe Sockets) */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">
                Rede Virtual Segura (socket)
              </h2>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              O módulo <code className="text-cyan-300">socket</code> do Python conversa em
              memória com estes hosts simulados — sem gerar tráfego real na rede da escola.
            </p>

            <div className="mt-4 divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#090D16]">
              {SANDBOX_LAB_HOSTS.map((item) => (
                <div key={item.host} className="p-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <code className="font-mono font-semibold text-cyan-300">
                      {item.host}
                    </code>
                    <span className="text-slate-400">{item.label}</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-emerald-300/90 tabular-nums">
                    Portas abertas: {item.openPorts.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN (8 cols): File Editor + Persistent Terminal */}
        <section className="flex flex-col gap-5 lg:col-span-8">
          {/* File Editor Panel */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-xs">
                <FileCode2 className="h-4 w-4 text-cyan-400" />
                <span className="font-mono font-semibold text-slate-100">
                  /workspace/{selectedFile}
                </span>
                {isDirty && (
                  <span className="text-amber-300">· não salvo</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCurrentFile()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090D16] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 whitespace-nowrap"
                >
                  <Save className="h-3.5 w-3.5" />
                  Salvar
                </button>
                {selectedFile.endsWith('.py') && (
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={handleRunActiveFileInTerminal}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Executar no Terminal
                  </button>
                )}
              </div>
            </div>

            {/* Experiment Templates Strip */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 bg-[#0B111E] px-4 py-2">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                Experimentos:
              </span>
              {SANDBOX_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  title={tpl.description}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="cursor-pointer rounded-md border border-slate-800 bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap shrink-0"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <textarea
              value={editorDraft}
              onChange={(e) => {
                setEditorDraft(e.target.value);
                setIsDirty(true);
              }}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={`Editor do arquivo ${selectedFile}`}
              className="code-editor min-h-[210px] w-full resize-y bg-[#060911] p-4 font-mono text-sm leading-6 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Persistent Interactive Terminal (Shell & Python REPL) */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            {/* Terminal Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
                <button
                  type="button"
                  onClick={() => setTerminalMode('shell')}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    terminalMode === 'shell'
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Shell (bash + python3)
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalMode('repl')}
                  className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                    terminalMode === 'repl'
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Python REPL (&gt;&gt;&gt;)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPythonMemory}
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 whitespace-nowrap"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reiniciar Memória
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalLines([])}
                  className="cursor-pointer rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 whitespace-nowrap"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Quick clickable commands strip */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 bg-[#0B111E] px-4 py-2">
              <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                Atalhos:
              </span>
              {(terminalMode === 'shell' ? QUICK_SHELL_COMMANDS : QUICK_REPL_SNIPPETS).map(
                (cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleExecuteTerminalCommand(cmd)}
                    className="cursor-pointer rounded-md border border-slate-800 bg-[#090D16] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap shrink-0"
                  >
                    {cmd}
                  </button>
                )
              )}
            </div>

            {/* Terminal Output Area */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="h-[290px] overflow-y-auto bg-[#060911] p-4 font-mono text-xs leading-relaxed sm:text-[13px]"
            >
              {terminalLines.map((line) => {
                if (line.kind === 'prompt') {
                  return (
                    <div key={line.id} className="mt-2 first:mt-0">
                      <span className="font-semibold text-cyan-400">{line.prefix} </span>
                      <span className="text-slate-100">{line.text}</span>
                    </div>
                  );
                }
                if (line.kind === 'stdout') {
                  return (
                    <pre
                      key={line.id}
                      className="mt-1 whitespace-pre-wrap break-words text-emerald-300"
                    >
                      {line.text}
                    </pre>
                  );
                }
                if (line.kind === 'error-tip') {
                  return (
                    <div
                      key={line.id}
                      className="mt-1.5 rounded-lg border border-amber-400/35 bg-amber-400/10 px-3 py-2 font-sans text-xs text-amber-200"
                    >
                      {line.text}
                    </div>
                  );
                }
                if (line.kind === 'stderr') {
                  return (
                    <pre
                      key={line.id}
                      className="mt-1 whitespace-pre-wrap break-words text-rose-300"
                    >
                      {line.text}
                    </pre>
                  );
                }
                return (
                  <div key={line.id} className="mt-1 text-slate-400">
                    {line.text}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Interactive Prompt Input Bar */}
            <div className="flex items-center gap-2 border-t border-slate-800 bg-[#080C15] px-4 py-3 font-mono text-xs sm:text-[13px]">
              <span className="shrink-0 font-semibold text-cyan-400">
                {terminalMode === 'repl' ? '>>>' : `${safeUser}@pysec:${cwd}$`}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                disabled={isExecuting}
                placeholder={
                  terminalMode === 'repl'
                    ? 'Digite Python persistente (ex.: x = 42 ou import socket)...'
                    : 'Digite um comando (ex.: ls, cat README.txt, python3 scripts/scanner_etico.py)...'
                }
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Linha de comando do terminal Sandbox"
                className="min-w-0 flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={isExecuting || !commandInput.trim()}
                onClick={() => handleExecuteTerminalCommand()}
                className="cursor-pointer rounded-md bg-cyan-400/15 px-3 py-1 font-sans text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/25 disabled:opacity-40 whitespace-nowrap"
              >
                {isExecuting ? 'Rodando...' : 'Enter'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
