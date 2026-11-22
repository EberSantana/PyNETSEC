import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  History,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { CODE_PRESETS, MISSIONS } from '../data/missions';
import {
  ensurePyodideReady,
  getPyodideStatus,
  PyodideStatus,
  runPythonMission,
  subscribePyodideStatus,
} from '../services/pyodideEngine';
import {
  CompletedMissionRecord,
  LabWorkspaceMode,
  Mission,
  PurpleReflection,
  PyodideExecutionResult,
  RunHistoryEntry,
} from '../types/ctf';
import { SandboxView } from './SandboxView';

interface LabViewProps {
  mode: LabWorkspaceMode;
  onModeChange: (mode: LabWorkspaceMode) => void;
  sandboxFiles: Record<string, string>;
  onSandboxFilesChange: (files: Record<string, string>) => void;
  studentUsername: string;
  mission: Mission;
  code: string;
  completedMissions: Record<string, CompletedMissionRecord>;
  runHistory: RunHistoryEntry[];
  purpleReflection: PurpleReflection | null;
  isMissionUnlocked: (mission: Mission) => boolean;
  onCodeChange: (missionId: string, nextCode: string) => void;
  onSelectMission: (mission: Mission) => void;
  onBackToHub: () => void;
  onOpenStudyForMission: (missionId: string) => void;
  onMissionValidated: (mission: Mission, result: PyodideExecutionResult) => Promise<void>;
  onRecordRun: (entry: RunHistoryEntry) => void;
  onSavePurpleReflection: (correction1: string, correction2: string) => void;
}

export function LabView({
  mode,
  onModeChange,
  sandboxFiles,
  onSandboxFilesChange,
  studentUsername,
  mission,
  code,
  completedMissions,
  runHistory,
  purpleReflection,
  isMissionUnlocked,
  onCodeChange,
  onSelectMission,
  onBackToHub,
  onOpenStudyForMission,
  onMissionValidated,
  onRecordRun,
  onSavePurpleReflection,
}: LabViewProps) {
  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>(getPyodideStatus());
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<PyodideExecutionResult | null>(null);
  const [validationMessage, setValidationMessage] = useState<{
    passed: boolean;
    text: string;
  } | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2>(1);
  const [consoleTab, setConsoleTab] = useState<'output' | 'history'>('output');
  const [showRawTraceback, setShowRawTraceback] = useState(false);
  const [purpleFix1, setPurpleFix1] = useState(purpleReflection?.correction1 ?? '');
  const [purpleFix2, setPurpleFix2] = useState(purpleReflection?.correction2 ?? '');
  const [purpleSavedNotice, setPurpleSavedNotice] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Lazy-load Pyodide ONLY when the Lab workspace is mounted!
  useEffect(() => {
    const unsub = subscribePyodideStatus(setPyodideStatus);
    ensurePyodideReady().catch(() => {
      // Status listener handles error display cleanly
    });
    return unsub;
  }, []);

  // Reset per-mission local UI feedback when switching missions (Dica 1 always visible)
  useEffect(() => {
    setExecResult(null);
    setValidationMessage(null);
    setHintLevel(1);
    setShowRawTraceback(false);
    setConsoleTab('output');
  }, [mission.id]);

  const currentIndex = MISSIONS.findIndex((m) => m.id === mission.id);
  const prevMission = currentIndex > 0 ? MISSIONS[currentIndex - 1] : null;
  const nextMission =
    currentIndex >= 0 && currentIndex < MISSIONS.length - 1
      ? MISSIONS[currentIndex + 1]
      : null;

  const isCompleted = Boolean(completedMissions[mission.id]);
  const missionHistory = useMemo(
    () => runHistory.filter((entry) => entry.missaoId === mission.id).slice(0, 12),
    [runHistory, mission.id]
  );

  const lineNumbers = useMemo(() => {
    const count = Math.max(12, code.split('\n').length);
    return Array.from({ length: count }, (_, idx) => idx + 1);
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = `${code.slice(0, start)}    ${code.slice(end)}`;
      onCodeChange(mission.id, next);
      window.requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun(false);
    }
  };

  const handleInsertPreset = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      onCodeChange(mission.id, `${code}\n${snippet}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const prefix = start > 0 && code[start - 1] !== '\n' ? '\n' : '';
    const next = `${code.slice(0, start)}${prefix}${snippet}${code.slice(end)}`;
    onCodeChange(mission.id, next);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length + snippet.length;
      el.selectionStart = el.selectionEnd = cursor;
    });
  };

  const handleRun = async (shouldValidate: boolean) => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleTab('output');
    setValidationMessage(null);
    setShowRawTraceback(false);

    const result = await runPythonMission(mission.setupPython, code);
    setExecResult(result);
    setIsRunning(false);

    if (!result.ok) {
      onRecordRun({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        missaoId: mission.id,
        missaoTitle: mission.title,
        timestamp: new Date().toISOString(),
        status: 'error',
        durationMs: result.durationMs,
        outputPreview: result.translatedError?.title ?? 'Erro de execução',
      });
      return;
    }

    if (shouldValidate) {
      const check = mission.validate(result.stdout, code);
      setValidationMessage({ passed: check.passed, text: check.feedback });
      onRecordRun({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        missaoId: mission.id,
        missaoTitle: mission.title,
        timestamp: new Date().toISOString(),
        status: check.passed ? 'validated' : 'ok',
        durationMs: result.durationMs,
        outputPreview: (result.stdout.trim() || '(sem saída)').slice(0, 90),
      });

      if (check.passed) {
        await onMissionValidated(mission, result);
      }
    } else {
      onRecordRun({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        missaoId: mission.id,
        missaoTitle: mission.title,
        timestamp: new Date().toISOString(),
        status: 'ok',
        durationMs: result.durationMs,
        outputPreview: (result.stdout.trim() || '(sem saída)').slice(0, 90),
      });
    }
  };

  const handleRevealHint = () => {
    setHintLevel(2);
  };

  const handlePurpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpleFix1.trim() || !purpleFix2.trim()) return;
    onSavePurpleReflection(purpleFix1.trim(), purpleFix2.trim());
    setPurpleSavedNotice(true);
    window.setTimeout(() => setPurpleSavedNotice(false), 2600);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Compact Workspace Breadcrumb, Lab Mode Switcher (Missão CTF | Sandbox), & Navigator */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-slate-100 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar à Trilha
          </button>

          {/* Lab Mode Segmented Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#111827] p-1">
            <button
              type="button"
              onClick={() => onModeChange('mission')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'mission'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              Missão CTF ({mission.id})
            </button>
            <button
              type="button"
              onClick={() => onModeChange('sandbox')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'sandbox'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Sandbox Livre
            </button>
          </div>

          {mode === 'mission' && (
            <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
              <span>Circuito 0{mission.circuit}</span>
              <span aria-hidden="true">·</span>
              <span>{mission.points} XP</span>
              {isCompleted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Concluída
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {mode === 'mission' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prevMission}
              onClick={() => prevMission && onSelectMission(prevMission)}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <button
              type="button"
              disabled={!nextMission || !isMissionUnlocked(nextMission)}
              onClick={() => nextMission && onSelectMission(nextMission)}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
            >
              Próxima
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Terminal persistente · Sockets simulados · Arquivos salvos em /workspace
          </p>
        )}
      </div>

      {mode === 'sandbox' ? (
        <SandboxView
          files={sandboxFiles}
          onFilesChange={onSandboxFilesChange}
          studentUsername={studentUsername}
        />
      ) : (
        <>

      {/* Pyodide On-Demand Loading Notice (Only shown while initializing or on error) */}
      {(pyodideStatus === 'loading-script' || pyodideStatus === 'loading-wasm') && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-200">
          <div className="flex items-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            <span>
              {pyodideStatus === 'loading-script'
                ? 'Carregando motor Python sob demanda (Pyodide)...'
                : 'Inicializando interpretador Python 3 em WebAssembly (apenas na primeira vez)...'}
            </span>
          </div>
          <span className="hidden font-mono text-[11px] text-cyan-300/80 sm:inline">
            100% local no navegador
          </span>
        </div>
      )}

      {pyodideStatus === 'error' && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
            <span>
              Falha ao baixar o Pyodide WebAssembly da CDN. Verifique a conexão do laboratório.
            </span>
          </div>
          <button
            type="button"
            onClick={() => ensurePyodideReady().catch(() => {})}
            className="cursor-pointer rounded-md border border-rose-400/50 px-3 py-1 font-semibold text-rose-100 hover:bg-rose-500/20"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Two-Zone Split-Screen Layout (42% Micro-Leitura | 58% Editor & Console) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT ZONE: Micro-Leitura + Exemplo + Objetivo + Dicas em Camadas */}
        <aside className="flex flex-col gap-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {mission.topic} · Regra dos {mission.durationMinutes} min
              </span>
              {mission.teamRole === 'blue' && (
                <span className="font-semibold text-sky-300">Blue Team</span>
              )}
              {mission.teamRole === 'red' && (
                <span className="font-semibold text-rose-300">Red Team Ético</span>
              )}
              {mission.teamRole === 'linux' && (
                <span className="font-semibold text-emerald-300">Terminal Linux</span>
              )}
              {mission.teamRole === 'network' && (
                <span className="font-semibold text-cyan-300">Redes</span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-50">{mission.title}</h1>

            {/* Micro-leitura (3–4 short lines) */}
            <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300">
              {mission.microLesson.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Visual Example */}
            <div className="mt-5">
              <p className="text-xs font-medium text-slate-400">{mission.exampleTitle}</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-800 bg-[#060911] p-4 font-mono text-xs leading-relaxed text-cyan-200">
                {mission.exampleCode}
              </pre>
            </div>

            {/* Objective + Quick Study Link */}
            <div className="mt-5 rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-cyan-300">Objetivo da Missão</p>
                <button
                  type="button"
                  onClick={() => onOpenStudyForMission(mission.id)}
                  className="flex cursor-pointer items-center gap-1 text-xs font-medium text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Revisar na aula
                </button>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-100">
                {mission.objective}
              </p>
            </div>

            {/* Mission Hint Always Visible + Optional Structure Hint 2 */}
            <div className="mt-5 border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-amber-300">
                  Dica da Missão ({hintLevel}/2 reveladas)
                </span>
                <button
                  type="button"
                  onClick={handleRevealHint}
                  disabled={hintLevel >= 2}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {hintLevel < 2 ? 'Ver Dica 2 (estrutura)' : 'Dica completa aberta'}
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="rounded-lg border border-amber-400/30 bg-[#090D16] p-3.5 text-xs leading-relaxed text-slate-200">
                  <p className="font-semibold text-amber-300">Dica 1 · Orientação da Missão</p>
                  <p className="mt-1">{mission.hints[0]}</p>
                </div>

                {hintLevel >= 2 && (
                  <div className="rounded-lg border border-amber-400/40 bg-[#090D16] p-3.5 text-xs leading-relaxed text-slate-200">
                    <p className="font-semibold text-amber-300">
                      Dica 2 · Estrutura da linha
                    </p>
                    <p className="mt-1 font-mono text-amber-100">{mission.hints[1]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bonus Purple Team Reflection after Mission 20B (from PDF p. 4) */}
          {mission.hasPurpleBonus && isCompleted && (
            <div className="rounded-2xl border border-sky-400/30 bg-[#111827] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Desafio Bônus · Mentalidade Purple Team</span>
              </div>
              <h3 className="mt-1.5 text-base font-bold text-slate-50">
                Como você corrigiria as duas falhas exploradas na 20B?
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Conectando o Red Team de volta à defesa da Missão 20A, proponha duas medidas
                práticas para impedir que o ataque funcione no servidor real.
              </p>

              <form onSubmit={handlePurpleSubmit} className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="purple-fix-1"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Correção 1 (sobre a pasta /backup exposta)
                  </label>
                  <input
                    id="purple-fix-1"
                    type="text"
                    value={purpleFix1}
                    onChange={(e) => setPurpleFix1(e.target.value)}
                    placeholder="Ex.: Remover /backup do acesso público e restringir permissões"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="purple-fix-2"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Correção 2 (sobre o PIN de 4 dígitos)
                  </label>
                  <input
                    id="purple-fix-2"
                    type="text"
                    value={purpleFix2}
                    onChange={(e) => setPurpleFix2(e.target.value)}
                    placeholder="Ex.: Exigir senha forte + bloquear IP após 5 falhas (rate limit)"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-sky-400 px-4 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-sky-300"
                  >
                    Salvar Proposta Purple Team
                  </button>
                  {purpleSavedNotice && (
                    <span className="text-xs font-medium text-emerald-400">
                      Proposta registrada!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </aside>

        {/* RIGHT ZONE: Code Editor + Quick Presets + Action Controls + Terminal Console */}
        <section className="flex flex-col gap-5 lg:col-span-7">
          {/* Code Editor Panel */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            {/* Editor Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span className="font-mono font-medium">missao_{mission.id.toLowerCase()}.py</span>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-slate-400">Ctrl+Enter para executar</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onCodeChange(mission.id, mission.starterCode);
                  setValidationMessage(null);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resetar Código
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 bg-[#0B111E] px-4 py-2">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                Presets:
              </span>
              {CODE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.description}
                  onClick={() => handleInsertPreset(preset.snippet)}
                  className="cursor-pointer rounded-md border border-slate-800 bg-[#111827] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap shrink-0"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {/* Editor with Line Numbers */}
            <div className="flex bg-[#060911]">
              <div
                aria-hidden="true"
                className="select-none border-r border-slate-800/80 bg-[#080C15] px-3 py-4 text-right font-mono text-xs leading-6 text-slate-600 tabular-nums"
              >
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => onCodeChange(mission.id, e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Editor de código Python"
                className="code-editor min-h-[290px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-slate-100 focus:outline-none sm:min-h-[320px]"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#111827] px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleRun(false)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-[#090D16] px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/60 hover:text-cyan-200 disabled:opacity-50 whitespace-nowrap"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <Play className="h-4 w-4 text-cyan-400" />
                  )}
                  Executar
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleRun(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 disabled:opacity-50 whitespace-nowrap"
                >
                  <Flag className="h-4 w-4" />
                  Validar Missão
                </button>
              </div>

              <span className="text-xs text-slate-500 tabular-nums">
                {pyodideStatus === 'ready'
                  ? 'Python 3 (Pyodide) pronto'
                  : pyodideStatus === 'error'
                    ? 'Erro no Pyodide'
                    : 'Preparando Python 3...'}
              </span>
            </div>
          </div>

          {/* Console Output & Local History Panel */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
                <button
                  type="button"
                  onClick={() => setConsoleTab('output')}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    consoleTab === 'output'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Console de Saída
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleTab('history')}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors tabular-nums ${
                    consoleTab === 'history'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Histórico ({missionHistory.length})
                </button>
              </div>

              {execResult && (
                <span className="flex items-center gap-1 font-mono text-xs text-slate-400 tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {execResult.durationMs} ms
                </span>
              )}
            </div>

            <div className="min-h-[180px] bg-[#060911] p-4">
              {consoleTab === 'output' ? (
                <div className="space-y-4">
                  {/* Validation Feedback Banner */}
                  {validationMessage && (
                    <div
                      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
                        validationMessage.passed
                          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                          : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                      }`}
                    >
                      {validationMessage.passed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {validationMessage.passed
                            ? 'Missão validada!'
                            : 'Quase lá — ajuste e tente novamente'}
                        </p>
                        <p className="mt-0.5">{validationMessage.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Translated Friendly Portuguese Error Card */}
                  {execResult?.translatedError && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-rose-200">
                            {execResult.translatedError.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-rose-100/90">
                            {execResult.translatedError.explanation}
                          </p>
                          <p className="mt-2 text-xs font-medium text-amber-200">
                            Dica rápida: {execResult.translatedError.tip}
                          </p>

                          <button
                            type="button"
                            onClick={() => setShowRawTraceback((v) => !v)}
                            className="mt-3 cursor-pointer text-[11px] font-medium text-rose-300 underline underline-offset-4 hover:text-rose-100"
                          >
                            {showRawTraceback
                              ? 'Ocultar erro técnico do Python'
                              : 'Ver mensagem original do Python'}
                          </button>

                          {showRawTraceback && (
                            <pre className="mt-2 overflow-x-auto rounded-lg border border-rose-500/20 bg-[#060911] p-3 font-mono text-[11px] text-rose-200/80">
                              {execResult.translatedError.rawError}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stdout Output */}
                  {!execResult ? (
                    <p className="font-mono text-xs text-slate-500">
                      Clique em &quot;Executar&quot; para testar seu script ou em &quot;Validar
                      Missão&quot; para capturar a Flag.
                    </p>
                  ) : execResult.stdout ? (
                    <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-emerald-300">
                      {execResult.stdout}
                    </pre>
                  ) : execResult.ok ? (
                    <p className="font-mono text-xs text-slate-400">
                      Script executado sem erros, mas nenhum texto foi impresso com print().
                    </p>
                  ) : null}
                </div>
              ) : missionHistory.length === 0 ? (
                <p className="font-mono text-xs text-slate-500">
                  Nenhuma execução registrada nesta missão ainda.
                </p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {missionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span
                          className={`font-semibold ${
                            item.status === 'validated'
                              ? 'text-emerald-400'
                              : item.status === 'error'
                                ? 'text-rose-400'
                                : 'text-cyan-300'
                          }`}
                        >
                          {item.status === 'validated'
                            ? 'Validada'
                            : item.status === 'error'
                              ? 'Erro'
                              : 'Executada'}
                        </span>
                        <p className="mt-0.5 truncate font-mono text-slate-300">
                          {item.outputPreview}
                        </p>
                      </div>
                      <div className="shrink-0 text-right font-mono text-[11px] text-slate-500 tabular-nums">
                        <div>
                          {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                        <div>{item.durationMs} ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
}
