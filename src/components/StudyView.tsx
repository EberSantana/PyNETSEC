import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  HelpCircle,
  Loader2,
  Lock,
  Network,
  Play,
  Repeat,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { CIRCUITS, getMissionById } from '../data/missions';
import { STUDY_LESSONS } from '../data/studyLessons';
import {
  ensurePyodideReady,
  getPyodideStatus,
  PyodideStatus,
  runPythonMission,
  subscribePyodideStatus,
} from '../services/pyodideEngine';
import {
  CircuitId,
  Mission,
  PyodideExecutionResult,
  StudyLesson,
} from '../types/ctf';
import { NetworkFundamentalsView } from './NetworkFundamentalsView';
import { LinuxLabView } from './LinuxLabView';
import { ProtocolosLessonSection } from './ProtocolosLessonSection';

export type StudyTrack = 'python' | 'protocolos' | 'networks' | 'linux';

interface StudyViewProps {
  activeLessonId: string;
  activeTrack?: StudyTrack;
  onChangeTrack?: (track: StudyTrack) => void;
  completedDrills: Record<string, boolean>;
  isMissionUnlocked: (mission: Mission) => boolean;
  onSelectLesson: (lessonId: string) => void;
  onCompleteDrill: (drillId: string) => void;
  onGoToMission: (mission: Mission) => void;
  onOpenSandbox?: () => void;
}

export function StudyView({
  activeLessonId,
  activeTrack,
  onChangeTrack,
  completedDrills,
  isMissionUnlocked,
  onSelectLesson,
  onCompleteDrill,
  onGoToMission,
  onOpenSandbox,
}: StudyViewProps) {
  const activeLesson: StudyLesson = useMemo(
    () => STUDY_LESSONS.find((l) => l.id === activeLessonId) ?? STUDY_LESSONS[0],
    [activeLessonId]
  );

  const [internalTrack, setInternalTrack] = useState<StudyTrack>(activeTrack ?? 'python');
  const studyTrack = activeTrack ?? internalTrack;
  const setStudyTrack = (next: StudyTrack) => {
    setInternalTrack(next);
    onChangeTrack?.(next);
  };
  const [circuitFilter, setCircuitFilter] = useState<CircuitId>(activeLesson.circuit);
  const [practiceTab, setPracticeTab] = useState<'drills' | 'sandbox'>('drills');
  const [activeDrillIdx, setActiveDrillIdx] = useState<number>(0);
  const [drillCode, setDrillCode] = useState<string>(activeLesson.drills[0].starterCode);
  const [sandboxCode, setSandboxCode] = useState<string>(
    activeLesson.sandboxExamples[0].code
  );
  const [showHint, setShowHint] = useState(false);

  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>(getPyodideStatus());
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<PyodideExecutionResult | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<{
    passed: boolean;
    text: string;
  } | null>(null);

  // Lazy-load Pyodide only when student opens StudyView
  useEffect(() => {
    const unsub = subscribePyodideStatus(setPyodideStatus);
    ensurePyodideReady().catch(() => {});
    return unsub;
  }, []);

  // Sync editor state when switching lesson
  useEffect(() => {
    setCircuitFilter(activeLesson.circuit);
    setActiveDrillIdx(0);
    setDrillCode(activeLesson.drills[0].starterCode);
    setSandboxCode(activeLesson.sandboxExamples[0].code);
    setExecResult(null);
    setDrillFeedback(null);
    setShowHint(false);
  }, [activeLesson]);

  const activeDrill = activeLesson.drills[activeDrillIdx] ?? activeLesson.drills[0];

  const handleSelectDrill = (index: number) => {
    const drill = activeLesson.drills[index];
    if (!drill) return;
    setActiveDrillIdx(index);
    setDrillCode(drill.starterCode);
    setExecResult(null);
    setDrillFeedback(null);
    setShowHint(false);
  };

  const handleRunPractice = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setDrillFeedback(null);

    const codeToRun = practiceTab === 'drills' ? drillCode : sandboxCode;
    const result = await runPythonMission(undefined, codeToRun);
    setExecResult(result);
    setIsRunning(false);

    if (practiceTab === 'drills' && result.ok) {
      const check = activeDrill.validate(result.stdout);
      setDrillFeedback({ passed: check.passed, text: check.feedback });
      if (check.passed) {
        onCompleteDrill(activeDrill.id);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    setter: (next: string) => void
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setter(`${value.slice(0, start)}    ${value.slice(end)}`);
      window.requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunPractice();
    }
  };

  const filteredLessons = STUDY_LESSONS.filter((l) => l.circuit === circuitFilter);
  const totalDrillsCount = STUDY_LESSONS.reduce((acc, l) => acc + l.drills.length, 0);
  const completedDrillsCount = Object.values(completedDrills).filter(Boolean).length;

  const editorCode = practiceTab === 'drills' ? drillCode : sandboxCode;
  const setEditorCode = practiceTab === 'drills' ? setDrillCode : setSandboxCode;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-cyan-300">
            Ambiente de Estudo · Python, Segurança, Redes e Linux
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-50">
            {studyTrack === 'protocolos'
              ? 'Protocolos de Transporte: TCP vs. UDP'
              : studyTrack === 'networks'
                ? 'Fundamentos de Redes na Prática'
                : studyTrack === 'linux'
                  ? 'Ambiente Linux Interativo'
                  : 'Aprenda os comandos antes das missões'}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            {studyTrack === 'protocolos'
              ? 'Entenda em detalhes como funcionam TCP e UDP na Camada 4, compare cabeçalhos, handshake e confiabilidade, e descubra quando usar cada protocolo antes das missões de redes.'
              : studyTrack === 'networks'
                ? 'Explore de forma interativa os tipos de rede, topologias com simulação de falhas, meios de transmissão, protocolos do dia a dia, TCP e UDP, configuração básica e soluções de problemas.'
                : studyTrack === 'linux'
                  ? 'Pratique a estrutura de diretórios FHS, manipulação de arquivos, pacotes APT, buscas, editores nano e vim, usuários, permissões, redes, firewall e compactação direto no terminal simulado.'
                  : 'Leia o guia rápido, teste exemplos reais no Python do navegador e faça os 3 treinos curtos de repetição para ganhar confiança antes de entrar no CTF.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Top-level Study Track Switcher */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-[#111827] p-1">
            <button
              type="button"
              onClick={() => setStudyTrack('python')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                studyTrack === 'python'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Aulas de Python
            </button>
            <button
              type="button"
              onClick={() => setStudyTrack('protocolos')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                studyTrack === 'protocolos'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              TCP vs. UDP
            </button>
            <button
              type="button"
              onClick={() => setStudyTrack('networks')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                studyTrack === 'networks'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              Fundamentos de Redes
            </button>
            <button
              type="button"
              onClick={() => setStudyTrack('linux')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                studyTrack === 'linux'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Terminal Linux
            </button>
          </div>

          {studyTrack === 'python' && (
            <div className="text-xs text-slate-400 tabular-nums">
              <span className="text-slate-500">Treinos: </span>
              <span className="font-mono font-semibold text-emerald-400">
                {completedDrillsCount}/{totalDrillsCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {studyTrack === 'protocolos' ? (
        <div className="mt-6">
          <ProtocolosLessonSection
            isMissionUnlocked={isMissionUnlocked}
            onGoToMission={onGoToMission}
            onPracticePythonDrills={() => {
              onSelectLesson('L10');
              setStudyTrack('python');
            }}
            onOpenNetworkSimulator={() => setStudyTrack('networks')}
          />
        </div>
      ) : studyTrack === 'networks' ? (
        <div className="mt-6">
          <NetworkFundamentalsView onOpenSandbox={onOpenSandbox} />
        </div>
      ) : studyTrack === 'linux' ? (
        <div className="mt-6">
          <LinuxLabView />
        </div>
      ) : (
      <>
      {/* Circuit Filter + Horizontal Lesson Strip */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#111827] p-1.5 border border-slate-800 w-fit">
          {CIRCUITS.filter((c) => STUDY_LESSONS.some((l) => l.circuit === c.id)).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCircuitFilter(c.id);
                const first = STUDY_LESSONS.find((l) => l.circuit === c.id);
                if (first && activeLesson.circuit !== c.id) {
                  onSelectLesson(first.id);
                }
              }}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                circuitFilter === c.id
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {c.code}: {c.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredLessons.map((lesson) => {
            const doneInLesson = lesson.drills.filter(
              (d) => Boolean(completedDrills[d.id])
            ).length;
            const isSelected = lesson.id === activeLesson.id;
            const allDone = doneInLesson === lesson.drills.length;

            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400 bg-[#162033]'
                    : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
                    <span className="font-mono font-semibold text-cyan-300">
                      Aula {String(lesson.order).padStart(2, '0')}
                    </span>
                    <span className={allDone ? 'font-semibold text-emerald-400' : ''}>
                      {doneInLesson}/{lesson.drills.length} treinos
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-sm font-bold text-slate-100">
                    {lesson.title}
                  </h2>
                </div>
                <p className="mt-2 text-xs text-slate-400">{lesson.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pyodide Status Notice */}
      {(pyodideStatus === 'loading-script' || pyodideStatus === 'loading-wasm') && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-200">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
          <span>Preparando interpretador Python 3 (Pyodide) para os exercícios ao vivo...</span>
        </div>
      )}

      {/* Split Workspace: Left Reading & Command Guide | Right Repetition Drills & Live Sandbox */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Micro-Leitura + Tabela de Comandos + Link para Missões */}
        <section className="flex flex-col gap-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-cyan-300">
                <BookOpen className="h-3.5 w-3.5" />
                Aula {String(activeLesson.order).padStart(2, '0')} · {activeLesson.readTimeMinutes} min de leitura
              </span>
              <span>{activeLesson.subtitle}</span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-50">
              {activeLesson.title}
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              {activeLesson.intro.map((text, idx) => (
                <p key={idx}>{text}</p>
              ))}
            </div>

            {activeLesson.id === 'L10' && (
              <button
                type="button"
                onClick={() => setStudyTrack('protocolos')}
                className="mt-4 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 text-left text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 shrink-0 text-cyan-300" />
                  Abrir guia visual completo de TCP vs. UDP (Cabeçalhos, Tabela e Casos de Uso)
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            )}

            {/* Command Cheat-Sheet Table */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-200">
                Guia Rápido de Comandos
              </h3>
              <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-800 bg-[#090D16]">
                <div className="divide-y divide-slate-800/80">
                  {activeLesson.commandTable.map((row, idx) => (
                    <div key={idx} className="p-3.5">
                      <code className="font-mono text-xs font-semibold text-cyan-300">
                        {row.command}
                      </code>
                      <p className="mt-1 text-xs text-slate-300">{row.meaning}</p>
                      <p className="mt-1 font-mono text-[11px] text-slate-500">
                        Ex.: {row.example}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Jump directly to linked CTF Missions */}
            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-xs font-medium text-slate-400">
                Pronto para testar no CTF? Missões ligadas a esta aula:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeLesson.relatedMissionIds.map((mId) => {
                  const mission = getMissionById(mId);
                  const unlocked = isMissionUnlocked(mission);
                  return (
                    <button
                      key={mId}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onGoToMission(mission)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500"
                    >
                      {!unlocked && <Lock className="h-3 w-3" />}
                      <span>
                        {mission.id}: {mission.title}
                      </span>
                      {unlocked && <ArrowRight className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Treino de Repetição (3 drills) & Sandbox Livre */}
        <section className="flex flex-col gap-5 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setPracticeTab('drills');
                    setExecResult(null);
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    practiceTab === 'drills'
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Treino por Repetição (3 passos)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPracticeTab('sandbox');
                    setExecResult(null);
                    setDrillFeedback(null);
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    practiceTab === 'sandbox'
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Sandbox Livre
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (practiceTab === 'drills') {
                    setDrillCode(activeDrill.starterCode);
                    setDrillFeedback(null);
                  } else {
                    setSandboxCode(activeLesson.sandboxExamples[0].code);
                  }
                  setExecResult(null);
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resetar
              </button>
            </div>

            {/* Sub-header: Drill selector OR Sandbox example buttons */}
            {practiceTab === 'drills' ? (
              <div className="border-b border-slate-800 bg-[#0B111E] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {activeLesson.drills.map((drill, idx) => {
                    const done = Boolean(completedDrills[drill.id]);
                    const selected = idx === activeDrillIdx;
                    return (
                      <button
                        key={drill.id}
                        type="button"
                        onClick={() => handleSelectDrill(idx)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                          selected
                            ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                            : done
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        <span>Passo {drill.step}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3.5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold text-cyan-300">
                      {activeDrill.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-100">{activeDrill.prompt}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowHint((v) => !v)}
                    className="flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-amber-400/35 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-400/20 whitespace-nowrap sm:self-auto"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    {showHint ? 'Ocultar dica' : 'Ver dica'}
                  </button>
                </div>

                {showHint && (
                  <p className="mt-2.5 rounded-lg border border-amber-400/25 bg-[#090D16] px-3 py-2 font-mono text-xs text-amber-200">
                    Dica: {activeDrill.hint}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-[#0B111E] px-4 py-3">
                <span className="text-xs text-slate-400">Carregar exemplo pronto:</span>
                {activeLesson.sandboxExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSandboxCode(ex.code);
                      setExecResult(null);
                    }}
                    className="cursor-pointer rounded-md border border-slate-700 bg-[#111827] px-3 py-1 text-xs font-medium text-cyan-200 transition-colors hover:border-cyan-400/60"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            {/* Code Editor */}
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, editorCode, setEditorCode)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Editor Python do ambiente de estudo"
              className="code-editor min-h-[210px] w-full resize-y bg-[#060911] p-4 font-mono text-sm leading-6 text-slate-100 focus:outline-none"
            />

            {/* Run Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#111827] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={handleRunPractice}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 disabled:opacity-50"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  {practiceTab === 'drills' ? 'Testar Repetição' : 'Executar no Sandbox'}
                </button>

                {practiceTab === 'drills' &&
                  drillFeedback?.passed &&
                  activeDrillIdx < activeLesson.drills.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleSelectDrill(activeDrillIdx + 1)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-400/15 px-3.5 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/25"
                    >
                      Próximo passo ({activeDrillIdx + 2}/3)
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
              </div>

              <span className="text-xs text-slate-500">Ctrl+Enter para rodar</span>
            </div>
          </div>

          {/* Live Console Output */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Resultado na Hora (Python 3)
              </span>
              {execResult && (
                <span className="font-mono text-slate-500 tabular-nums">
                  {execResult.durationMs} ms
                </span>
              )}
            </div>

            <div className="min-h-[140px] bg-[#060911] p-4 space-y-3">
              {drillFeedback && (
                <div
                  className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                    drillFeedback.passed
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                      : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                  }`}
                >
                  {drillFeedback.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  )}
                  <span>{drillFeedback.text}</span>
                </div>
              )}

              {execResult?.translatedError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs">
                  <p className="font-semibold text-rose-200">
                    {execResult.translatedError.title}
                  </p>
                  <p className="mt-1 text-rose-100/90">
                    {execResult.translatedError.explanation}
                  </p>
                  <p className="mt-1.5 font-medium text-amber-200">
                    Dica: {execResult.translatedError.tip}
                  </p>
                </div>
              )}

              {!execResult ? (
                <p className="font-mono text-xs text-slate-500">
                  Altere o código acima e clique em testar para ver o resultado imediato aqui.
                </p>
              ) : execResult.stdout ? (
                <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-emerald-300">
                  {execResult.stdout}
                </pre>
              ) : execResult.ok ? (
                <p className="font-mono text-xs text-slate-400">
                  Executado sem erros (sem saída no print).
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      </>
      )}
    </div>
  );
}
