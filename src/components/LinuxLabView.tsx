import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FolderTree,
  Play,
  RotateCcw,
  Search,
  Terminal,
  Trophy,
} from 'lucide-react';
import {
  LINUX_COMMAND_CATEGORIES,
  LINUX_FHS_DIRECTORIES,
  LINUX_PRACTICE_CHALLENGES,
} from '../data/linuxCheatsheet';
import {
  autocompleteLinuxInput,
  createInitialLinuxState,
  LinuxState,
  runLinuxCommand,
  saveEditorFile,
} from '../services/linuxSimulator';

interface TerminalEntry {
  id: string;
  kind: 'prompt' | 'stdout' | 'stderr' | 'info';
  prefix?: string;
  text: string;
}

interface ActiveEditor {
  editor: 'nano' | 'vim';
  path: string;
  content: string;
  savedContent: string;
  vimMode: 'normal' | 'insert' | 'command';
  vimCmd: string;
  statusMsg: string;
  clipboard: string;
  undoStack: string[];
  searchQuery: string;
  showSearch: boolean;
}

const NETWORK_CONCEPTS_MINI = [
  { term: 'TCP', desc: 'Transmission Control Protocol — transmissão confiável e ordenada de dados (handshake, confirmação de entrega).' },
  { term: 'UDP', desc: 'User Datagram Protocol — transmissão mais rápida e leve, sem handshake (usado em DNS, streaming e jogos).' },
  { term: 'DNS', desc: 'Sistema de nomes que traduz o endereço digitado (ex.: portal.if.edu.br) para o endereço IP do servidor.' },
  { term: 'CDN', desc: 'Content Delivery Network — servidores distribuídos que replicam conteúdo mais perto da máquina do usuário para reduzir latência.' },
];

export function LinuxLabView() {
  const [linuxState, setLinuxState] = useState<LinuxState>(() => createInitialLinuxState());
  const [leftTab, setLeftTab] = useState<'dirs' | 'guide' | 'challenges'>('dirs');
  const [guideSearch, setGuideSearch] = useState('');
  const [openCategoryId, setOpenCategoryId] = useState<string>('files');
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  // Terminal state
  const [input, setInput] = useState('');
  const [histCursor, setHistCursor] = useState(-1);
  const [reverseSearchOpen, setReverseSearchOpen] = useState(false);
  const [reverseQuery, setReverseQuery] = useState('');
  const [lines, setLines] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      kind: 'info',
      text: 'Ubuntu Lab PyNetSec (Simulador Linux Interativo) · Diretórios FHS, Bash, APT, Permissões, Rede, Nano e Vim prontos.',
    },
    {
      id: 'init-2',
      kind: 'info',
      text: 'Dica: Use Tab para autocompletar, ↑/↓ para histórico, Ctrl+R para buscar comandos anteriores ou clique em qualquer pasta/comando ao lado.',
    },
  ]);

  // Interactive Nano / Vim Editor overlay inside terminal
  const [editor, setEditor] = useState<ActiveEditor | null>(null);

  const termEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [lines]);

  const promptPrefix = useMemo(() => {
    const user = linuxState.isRoot ? 'root' : linuxState.currentUser;
    const home = `/home/${linuxState.currentUser}`;
    const displayPath = linuxState.cwd === home ? '~' : linuxState.cwd.startsWith(`${home}/`) ? `~${linuxState.cwd.slice(home.length)}` : linuxState.cwd;
    const symbol = linuxState.isRoot ? '#' : '$';
    return `${user}@pynetsec-linux:${displayPath}${symbol}`;
  }, [linuxState]);

  const reverseSearchMatch = useMemo(() => {
    if (!reverseQuery.trim()) return linuxState.history[linuxState.history.length - 1] ?? '';
    const q = reverseQuery.toLowerCase();
    for (let i = linuxState.history.length - 1; i >= 0; i--) {
      if (linuxState.history[i].toLowerCase().includes(q)) return linuxState.history[i];
    }
    return '';
  }, [reverseQuery, linuxState.history]);

  const executeCommand = (rawCmd?: string) => {
    const cmdText = (rawCmd ?? input).trim();
    if (!cmdText) return;

    setInput('');
    setHistCursor(-1);
    setReverseSearchOpen(false);
    setReverseQuery('');

    const res = runLinuxCommand(linuxState, cmdText);
    setLinuxState(res.state);

    // Check Linux practice challenges
    if (res.commandExecuted && !res.stderr) {
      setCompletedChallenges((prev) => {
        const next = { ...prev };
        for (const ch of LINUX_PRACTICE_CHALLENGES) {
          if (ch.check(res.commandExecuted)) next[ch.id] = true;
        }
        return next;
      });
    }

    if (res.clear) {
      setLines([]);
      return;
    }

    const stamp = Date.now();
    const batch: TerminalEntry[] = [
      { id: `${stamp}-p`, kind: 'prompt', prefix: promptPrefix, text: cmdText },
    ];
    if (res.stdout) {
      batch.push({ id: `${stamp}-o`, kind: 'stdout', text: res.stdout.replace(/\n$/, '') });
    }
    if (res.stderr) {
      batch.push({ id: `${stamp}-e`, kind: 'stderr', text: res.stderr.replace(/\n$/, '') });
    }
    setLines((prev) => [...prev, ...batch].slice(-220));

    if (res.openEditor) {
      setEditor({
        editor: res.openEditor.editor,
        path: res.openEditor.path,
        content: res.openEditor.content,
        savedContent: res.openEditor.content,
        vimMode: 'normal',
        vimCmd: '',
        statusMsg:
          res.openEditor.editor === 'nano'
            ? `Editando ${res.openEditor.path} — Ctrl+O salva, Ctrl+X sai`
            : `"${res.openEditor.path}" — Modo NORMAL (tecle "i" para inserir, ":x" para salvar e sair)`,
        clipboard: '',
        undoStack: [res.openEditor.content],
        searchQuery: '',
        showSearch: false,
      });
    } else {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      setReverseSearchOpen((v) => !v);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setInput((cur) => autocompleteLinuxInput(linuxState, cur));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = linuxState.history;
      if (hist.length === 0) return;
      const nextCursor = Math.min(histCursor + 1, hist.length - 1);
      setHistCursor(nextCursor);
      setInput(hist[hist.length - 1 - nextCursor]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histCursor <= 0) {
        setHistCursor(-1);
        setInput('');
      } else {
        const nextCursor = histCursor - 1;
        setHistCursor(nextCursor);
        setInput(linuxState.history[linuxState.history.length - 1 - nextCursor]);
      }
    }
  };

  /* ---- Interactive Editor Handlers (Nano & Vim) ---- */
  const handleSaveEditor = (closeAfter = false) => {
    if (!editor) return;
    setLinuxState((prev) => saveEditorFile(prev, editor.path, editor.content));
    if (closeAfter) {
      setLines((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ed`,
          kind: 'info',
          text: `[${editor.editor}] Arquivo salvo em ${editor.path} (${editor.content.length} bytes).`,
        },
      ]);
      setEditor(null);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setEditor((prev) =>
        prev ? { ...prev, savedContent: prev.content, statusMsg: `Gravado com sucesso em ${prev.path}!` } : null
      );
    }
  };

  const handleCloseEditorWithoutSave = () => {
    if (!editor) return;
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}-edq`, kind: 'info', text: `[${editor.editor}] Editor fechado.` },
    ]);
    setEditor(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!editor) return;
    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      handleSaveEditor(false);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      handleCloseEditorWithoutSave();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      setEditor((prev) => (prev ? { ...prev, showSearch: !prev.showSearch } : null));
    } else if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const el = e.currentTarget;
      const lineIdx = editor.content.slice(0, el.selectionStart).split('\n').length - 1;
      const arr = editor.content.split('\n');
      const cut = arr.splice(lineIdx, 1)[0] ?? '';
      setEditor((prev) =>
        prev
          ? { ...prev, content: arr.join('\n'), clipboard: cut, statusMsg: 'Linha recortada (Ctrl+K). Use Ctrl+U para colar.' }
          : null
      );
    } else if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      if (!editor.clipboard) return;
      setEditor((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content ? `${prev.content}\n${prev.clipboard}` : prev.clipboard,
              statusMsg: 'Conteúdo colado (Ctrl+U).',
            }
          : null
      );
    }
  };

  const runVimCommandLine = (cmdRaw: string) => {
    if (!editor) return;
    const c = cmdRaw.trim();
    if (c === ':w' || c === ':W') {
      handleSaveEditor(false);
      setEditor((prev) => (prev ? { ...prev, vimMode: 'normal', vimCmd: '' } : null));
    } else if (c === ':x' || c === ':X' || c === ':wq') {
      handleSaveEditor(true);
    } else if (c === ':q!') {
      handleCloseEditorWithoutSave();
    } else if (c === ':q') {
      if (editor.content !== editor.savedContent) {
        setEditor((prev) =>
          prev
            ? {
                ...prev,
                vimMode: 'normal',
                vimCmd: '',
                statusMsg: 'Alterações não salvas! Use :x para salvar e sair, ou :q! para sair sem salvar.',
              }
            : null
        );
      } else {
        handleCloseEditorWithoutSave();
      }
    } else if (c.startsWith(':%s/') || c.startsWith(':s/')) {
      const parts = c.split('/');
      const findStr = parts[1];
      const replStr = parts[2] ?? '';
      if (findStr) {
        const replaced = c.startsWith(':%s/')
          ? editor.content.split(findStr).join(replStr)
          : editor.content.replace(findStr, replStr);
        setEditor((prev) =>
          prev
            ? {
                ...prev,
                content: replaced,
                undoStack: [...prev.undoStack, replaced],
                vimMode: 'normal',
                vimCmd: '',
                statusMsg: `Substituído "${findStr}" → "${replStr}"`,
              }
            : null
        );
      }
    } else if (c.startsWith('/')) {
      const term = c.slice(1);
      const count = term ? editor.content.toLowerCase().split(term.toLowerCase()).length - 1 : 0;
      setEditor((prev) =>
        prev
          ? {
              ...prev,
              vimMode: 'normal',
              vimCmd: '',
              statusMsg: term ? `Busca "/${term}": ${count} ocorrência(s) encontrada(s).` : 'Busca vazia.',
            }
          : null
      );
    } else {
      setEditor((prev) =>
        prev ? { ...prev, vimMode: 'normal', vimCmd: '', statusMsg: `Comando desconhecido: ${c}` } : null
      );
    }
  };

  const filteredCategories = useMemo(() => {
    const q = guideSearch.trim().toLowerCase();
    if (!q) return LINUX_COMMAND_CATEGORIES;
    return LINUX_COMMAND_CATEGORIES.map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.commands.length > 0);
  }, [guideSearch]);

  const completedCount = Object.values(completedChallenges).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT PANEL (5 cols): FHS Directory Explorer + Searchable Guide + Challenges */}
      <aside className="flex flex-col gap-4 lg:col-span-5">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
          {/* Switcher */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-[#071225] p-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeftTab('dirs')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 transition-colors ${
                leftTab === 'dirs' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              Diretórios
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('guide')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 transition-colors ${
                leftTab === 'guide' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Comandos
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('challenges')}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 transition-colors ${
                leftTab === 'challenges' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              Desafios ({completedCount}/{LINUX_PRACTICE_CHALLENGES.length})
            </button>
          </div>

          {/* TAB 1: Diretórios FHS */}
          {leftTab === 'dirs' && (
            <div className="p-4">
              <p className="text-xs text-slate-400">
                Estrutura padrão do Linux. Clique em qualquer diretório para navegar com{' '}
                <code className="font-mono text-cyan-300">cd</code> e listar seu conteúdo no terminal:
              </p>
              <div className="mt-3 max-h-[470px] space-y-1.5 overflow-y-auto pr-1">
                {LINUX_FHS_DIRECTORIES.map((d) => {
                  const isCurrent =
                    linuxState.cwd === d.path || (d.path === '~' && linuxState.cwd === '/home/aluno');
                  return (
                    <button
                      key={d.path}
                      type="button"
                      onClick={() => {
                        executeCommand(`cd ${d.path}`);
                      }}
                      className={`flex w-full cursor-pointer items-start justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        isCurrent
                          ? 'border-cyan-400/60 bg-cyan-400/12'
                          : 'border-slate-800 bg-[#071225] hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-cyan-300">{d.label}</span>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-300">{d.description}</p>
                      </div>
                      <Play className="mt-1 h-3 w-3 shrink-0 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Guia Pesquisável de Comandos */}
          {leftTab === 'guide' && (
            <div className="p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  placeholder="Filtrar comando (ex.: grep, chmod, tar, nano, ufw)..."
                  className="w-full rounded-lg border border-slate-700 bg-[#071225] py-2 pr-3 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-3 max-h-[430px] space-y-2.5 overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const isOpen = Boolean(guideSearch.trim()) || openCategoryId === cat.id;
                  return (
                    <div key={cat.id} className="overflow-hidden rounded-xl border border-slate-800 bg-[#071225]">
                      <button
                        type="button"
                        onClick={() => setOpenCategoryId(cat.id)}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-xs font-bold text-slate-100 hover:bg-slate-900"
                      >
                        <span>{cat.title}</span>
                        <span className="font-mono text-[10px] text-cyan-300">
                          {cat.commands.length} itens
                        </span>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-800/70 border-t border-slate-800">
                          {cat.commands.map((item) => (
                            <button
                              key={item.cmd}
                              type="button"
                              onClick={() => item.runnable && executeCommand(item.runnable)}
                              className="flex w-full cursor-pointer items-start justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-cyan-400/10"
                            >
                              <div className="min-w-0">
                                <code className="block font-mono text-[11px] font-semibold text-cyan-300 break-words">
                                  {item.cmd}
                                </code>
                                <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                                  {item.desc}
                                </p>
                              </div>
                              {item.runnable && (
                                <span className="shrink-0 rounded border border-slate-700 bg-[#0F1E36] px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                                  Testar
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Networking Concepts + Shortcuts Reference Card */}
                <div className="rounded-xl border border-slate-800 bg-[#071225] p-3 text-[11px]">
                  <div className="font-mono text-[10px] font-bold text-emerald-300">
                    CONCEITOS DE REDE E ATALHOS DO TERMINAL
                  </div>
                  <div className="mt-2 space-y-1.5 text-slate-300">
                    {NETWORK_CONCEPTS_MINI.map((c) => (
                      <p key={c.term}>
                        <strong className="font-mono text-cyan-300">{c.term}:</strong> {c.desc}
                      </p>
                    ))}
                    <p className="border-t border-slate-800 pt-1.5 text-slate-400">
                      <strong className="text-slate-200">Atalhos Linux:</strong> Ctrl+Alt+T (abrir
                      terminal) · Ctrl+Shift+C / Ctrl+Shift+V (copiar/colar) · Ctrl+R (buscar no
                      histórico) · Tab (autocompletar).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Desafios Práticos Guiados */}
          {leftTab === 'challenges' && (
            <div className="space-y-2.5 p-4">
              <p className="text-xs text-slate-400">
                Execute os comandos no terminal ao lado para completar cada desafio Linux automaticamente:
              </p>
              {LINUX_PRACTICE_CHALLENGES.map((ch) => {
                const done = Boolean(completedChallenges[ch.id]);
                return (
                  <div
                    key={ch.id}
                    className={`rounded-xl border p-3 ${
                      done
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-800 bg-[#071225]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                          {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          <span>{ch.title}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-300">{ch.goal}</p>
                        <p className="mt-1 font-mono text-[10px] text-cyan-300">
                          Dica: {ch.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL (7 cols): Interactive Linux Terminal + Nano / Vim Editors */}
      <section className="flex flex-col gap-4 lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
          {/* Terminal Title Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-100">
                {editor ? `${editor.editor.toUpperCase()} — ${editor.path}` : promptPrefix}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReverseSearchOpen((v) => !v)}
                className="cursor-pointer rounded-md border border-slate-700 bg-[#071225] px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200"
              >
                Ctrl+R Histórico
              </button>
              <button
                type="button"
                onClick={() => setLines([])}
                className="cursor-pointer rounded-md border border-slate-700 bg-[#071225] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
              >
                clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinuxState(createInitialLinuxState());
                  setEditor(null);
                  setLines([
                    {
                      id: `${Date.now()}-rst`,
                      kind: 'info',
                      text: 'Ambiente Linux restaurado para o estado inicial.',
                    },
                  ]);
                }}
                title="Reiniciar máquina Linux virtual"
                className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#071225] px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="h-3 w-3" />
                Resetar
              </button>
            </div>
          </div>

          {/* Quick Command Chips */}
          {!editor && (
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 bg-[#0B111E] px-4 py-2">
              {[
                'ls -lah',
                'cat -n notas.txt',
                "grep -i 'erro' /var/log/syslog",
                'ifconfig',
                'netstat -at',
                'sudo ufw app list',
                'nano notas.txt',
                'vim notas.txt',
              ].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  className="shrink-0 cursor-pointer rounded-md border border-slate-800 bg-[#071225] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap"
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}

          {/* INTERACTIVE NANO / VIM MODE OR BASH TERMINAL */}
          {editor ? (
            <div className="flex h-[460px] flex-col bg-[#050E1D] font-mono text-xs">
              {/* Editor Top Status */}
              <div className="flex items-center justify-between bg-slate-200 px-3 py-1 font-bold text-[#05131C]">
                <span>
                  {editor.editor === 'nano' ? 'GNU nano 7.2' : `VIM 9.1 [${editor.vimMode.toUpperCase()}]`}
                </span>
                <span className="truncate">{editor.path}</span>
                <span>{editor.content !== editor.savedContent ? 'Modificado' : 'Salvo'}</span>
              </div>

              {/* Nano Search Bar if open */}
              {editor.editor === 'nano' && editor.showSearch && (
                <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0B111E] px-3 py-1.5">
                  <span className="text-cyan-300">Buscar (Ctrl+W):</span>
                  <input
                    type="text"
                    value={editor.searchQuery}
                    onChange={(e) => setEditor({ ...editor, searchQuery: e.target.value })}
                    placeholder="Digite palavra..."
                    className="flex-1 bg-transparent text-slate-100 focus:outline-none"
                  />
                  <span className="text-emerald-300">
                    {editor.searchQuery
                      ? `${editor.content.toLowerCase().split(editor.searchQuery.toLowerCase()).length - 1} encontrado(s)`
                      : ''}
                  </span>
                </div>
              )}

              {/* Editor Textarea */}
              <textarea
                value={editor.content}
                readOnly={editor.editor === 'vim' && editor.vimMode !== 'insert'}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditor((prev) =>
                    prev ? { ...prev, content: val, undoStack: [...prev.undoStack.slice(-20), val] } : null
                  );
                }}
                onKeyDown={(e) => {
                  if (editor.editor === 'nano') {
                    handleNanoKeyDown(e);
                  } else if (editor.vimMode === 'insert') {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditor((prev) =>
                        prev ? { ...prev, vimMode: 'normal', statusMsg: 'Modo NORMAL (use :w, :x, :q!, dd, u, /palavra)' } : null
                      );
                    }
                  } else if (editor.vimMode === 'normal') {
                    if (e.key === 'i' || e.key === 'I') {
                      e.preventDefault();
                      setEditor((prev) =>
                        prev ? { ...prev, vimMode: 'insert', statusMsg: '-- INSERÇÃO -- (pressione Esc para voltar ao modo NORMAL)' } : null
                      );
                    } else if (e.key === ':' || e.key === '/') {
                      e.preventDefault();
                      setEditor((prev) => (prev ? { ...prev, vimMode: 'command', vimCmd: e.key } : null));
                    } else if (e.key === 'u') {
                      e.preventDefault();
                      if (editor.undoStack.length > 1) {
                        const nextStack = editor.undoStack.slice(0, -1);
                        setEditor((prev) =>
                          prev
                            ? {
                                ...prev,
                                content: nextStack[nextStack.length - 1],
                                undoStack: nextStack,
                                statusMsg: 'Alteração desfeita (u).',
                              }
                            : null
                        );
                      }
                    } else if (e.key === 'd') {
                      e.preventDefault();
                      const arr = editor.content.split('\n');
                      arr.pop();
                      const nextVal = arr.join('\n');
                      setEditor((prev) =>
                        prev
                          ? {
                              ...prev,
                              content: nextVal,
                              undoStack: [...prev.undoStack, nextVal],
                              statusMsg: 'Última linha removida (dd).',
                            }
                          : null
                      );
                    }
                  }
                }}
                autoFocus
                spellCheck={false}
                className="flex-1 resize-none bg-[#050E1D] p-4 leading-6 text-slate-100 focus:outline-none"
              />

              {/* Vim Command Line (:w, :x, :q!, /busca) */}
              {editor.editor === 'vim' && editor.vimMode === 'command' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runVimCommandLine(editor.vimCmd);
                  }}
                  className="flex items-center gap-2 border-t border-slate-700 bg-[#0B111E] px-3 py-1.5"
                >
                  <input
                    type="text"
                    autoFocus
                    value={editor.vimCmd}
                    onChange={(e) => setEditor({ ...editor, vimCmd: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditor({ ...editor, vimMode: 'normal', vimCmd: '' });
                      }
                    }}
                    className="flex-1 bg-transparent text-amber-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded bg-cyan-400 px-2 py-0.5 text-[11px] font-bold text-[#05131C]"
                  >
                    Enter
                  </button>
                </form>
              )}

              {/* Status & Interactive Action Footer */}
              <div className="border-t border-slate-800 bg-[#0B111E] px-3 py-2 space-y-2">
                <div className="text-[11px] text-amber-300">{editor.statusMsg}</div>

                {editor.editor === 'nano' ? (
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSaveEditor(false)}
                      className="cursor-pointer rounded border border-cyan-400/50 bg-cyan-400/15 px-2 py-0.5 text-cyan-200"
                    >
                      ^O Salvar
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseEditorWithoutSave}
                      className="cursor-pointer rounded border border-rose-400/50 bg-rose-400/15 px-2 py-0.5 text-rose-200"
                    >
                      ^X Sair
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditor({ ...editor, showSearch: !editor.showSearch })}
                      className="cursor-pointer rounded border border-slate-700 bg-[#071225] px-2 py-0.5 text-slate-300"
                    >
                      ^W Buscar
                    </button>
                    <span className="text-slate-500">
                      ^K Recortar · ^U Colar · Alt+A Marcar · Alt+6 Copiar · Alt+G Linha · Alt+R Substituir
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setEditor({
                          ...editor,
                          vimMode: editor.vimMode === 'insert' ? 'normal' : 'insert',
                          statusMsg:
                            editor.vimMode === 'insert'
                              ? 'Modo NORMAL ativo.'
                              : '-- INSERÇÃO -- digite livremente e clique Esc para salvar.',
                        })
                      }
                      className="cursor-pointer rounded border border-cyan-400/50 bg-cyan-400/15 px-2 py-0.5 text-cyan-200"
                    >
                      {editor.vimMode === 'insert' ? 'Esc (Normal)' : 'i (Inserir)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEditor(false)}
                      className="cursor-pointer rounded border border-emerald-400/50 bg-emerald-400/15 px-2 py-0.5 text-emerald-200"
                    >
                      :w Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEditor(true)}
                      className="cursor-pointer rounded border border-cyan-400/50 bg-cyan-400/15 px-2 py-0.5 text-cyan-200"
                    >
                      :x Salvar e Sair
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseEditorWithoutSave}
                      className="cursor-pointer rounded border border-rose-400/50 bg-rose-400/15 px-2 py-0.5 text-rose-200"
                    >
                      :q! Sair sem Salvar
                    </button>
                    <span className="text-slate-500">
                      dd Deleta linha · u Desfaz · /palavra Busca · :%s/a/b/g Substitui
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Bash Terminal Output */}
              <div
                onClick={() => inputRef.current?.focus()}
                className="h-[385px] overflow-y-auto bg-[#050E1D] p-4 font-mono text-xs leading-relaxed sm:text-[13px]"
              >
                {lines.map((line) => {
                  if (line.kind === 'prompt') {
                    return (
                      <div key={line.id} className="mt-2 first:mt-0">
                        <span className="font-semibold text-emerald-400">{line.prefix} </span>
                        <span className="text-slate-100">{line.text}</span>
                      </div>
                    );
                  }
                  if (line.kind === 'stdout') {
                    return (
                      <pre key={line.id} className="mt-1 whitespace-pre-wrap break-words text-slate-200">
                        {line.text}
                      </pre>
                    );
                  }
                  if (line.kind === 'stderr') {
                    return (
                      <pre key={line.id} className="mt-1 whitespace-pre-wrap break-words text-rose-300">
                        {line.text}
                      </pre>
                    );
                  }
                  return (
                    <div key={line.id} className="mt-1 text-cyan-300/80">
                      {line.text}
                    </div>
                  );
                })}
                <div ref={termEndRef} />
              </div>

              {/* Ctrl+R Reverse Search Strip */}
              {reverseSearchOpen && (
                <div className="flex flex-wrap items-center gap-2 border-t border-cyan-500/30 bg-[#0B1526] px-4 py-2 font-mono text-xs">
                  <span className="text-cyan-300">(reverse-i-search):</span>
                  <input
                    type="text"
                    autoFocus
                    value={reverseQuery}
                    onChange={(e) => setReverseQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && reverseSearchMatch) {
                        e.preventDefault();
                        executeCommand(reverseSearchMatch);
                      } else if (e.key === 'Escape') {
                        setReverseSearchOpen(false);
                      }
                    }}
                    placeholder="digite parte de um comando anterior..."
                    className="min-w-[140px] flex-1 bg-transparent text-slate-100 focus:outline-none"
                  />
                  {reverseSearchMatch && (
                    <button
                      type="button"
                      onClick={() => executeCommand(reverseSearchMatch)}
                      className="cursor-pointer rounded bg-cyan-400/20 px-2 py-0.5 text-cyan-200"
                    >
                      Executar: {reverseSearchMatch}
                    </button>
                  )}
                </div>
              )}

              {/* Prompt Input Line */}
              <div className="flex items-center gap-2 border-t border-slate-800 bg-[#080C15] px-4 py-3 font-mono text-xs sm:text-[13px]">
                <span className="shrink-0 font-semibold text-emerald-400">{promptPrefix}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTerminalKeyDown}
                  placeholder="Digite um comando Linux (ex.: ls -la, mkdir -p a/b, chmod 755 projetos/diagnostico.sh)..."
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Linha de comando do ambiente Linux"
                  className="min-w-0 flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!input.trim()}
                  onClick={() => executeCommand()}
                  className="cursor-pointer rounded-md bg-emerald-400/15 px-3 py-1 font-sans text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/25 disabled:opacity-40 whitespace-nowrap"
                >
                  Enter
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
