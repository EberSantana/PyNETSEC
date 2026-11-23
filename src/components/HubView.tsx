import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Flag,
  Flame,
  Layers,
  Lightbulb,
  Lock,
  Network,
  Play,
  Search,
  Shield,
  Terminal,
  Unlock,
} from 'lucide-react';
import { CIRCUITS, MISSIONS, getStudentRankTitle } from '../data/missions';
import {
  CircuitId,
  CompletedMissionRecord,
  LabWorkspaceMode,
  Mission,
  StudentProfile,
} from '../types/ctf';

interface HubViewProps {
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  completedDrillsCount: number;
  totalDrillsCount: number;
  defenseBadgesCount: number;
  totalDefenseBadges: number;
  freeNavigationMode: boolean;
  isMissionUnlocked: (mission: Mission) => boolean;
  nextRecommendedMission: Mission;
  onStartMission: (mission: Mission) => void;
  onOpenStudy: (circuitId?: CircuitId) => void;
  onOpenStudyForMission: (missionId: string) => void;
  onOpenLabMode: (mode: LabWorkspaceMode) => void;
  onToggleFreeNavigation: (enabled: boolean) => void;
  onOpenProfileDrawer: (tab?: 'profile' | 'sheets') => void;
}

const CIRCUIT_STUDY_LABEL: Record<CircuitId, string> = {
  1: 'Estudo: Python Prático',
  2: 'Estudo: Python Redes & TCP/UDP',
  3: 'Estudo: Segurança da Informação',
  4: 'Estudo: Fundamentos de Redes',
  5: 'Estudo: Linux Essencial',
};

export function HubView({
  profile,
  completedMissions,
  completedDrillsCount,
  totalDrillsCount,
  defenseBadgesCount,
  totalDefenseBadges,
  freeNavigationMode,
  isMissionUnlocked,
  nextRecommendedMission,
  onStartMission,
  onOpenStudy,
  onOpenStudyForMission,
  onOpenLabMode,
  onToggleFreeNavigation,
  onOpenProfileDrawer,
}: HubViewProps) {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitId>(
    nextRecommendedMission.circuit
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

  const completedCount = Object.keys(completedMissions).length;
  const totalMissions = MISSIONS.length;
  const totalPoints = Object.values(completedMissions).reduce(
    (sum, item) => sum + item.pontos,
    0
  );
  const progressPercent = Math.round((completedCount / totalMissions) * 100);
  const rankTitle = getStudentRankTitle(completedCount);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const baseMissions = normalizedQuery
    ? MISSIONS.filter(
        (m) =>
          m.id.toLowerCase().includes(normalizedQuery) ||
          m.title.toLowerCase().includes(normalizedQuery) ||
          m.topic.toLowerCase().includes(normalizedQuery) ||
          m.hints[0].toLowerCase().includes(normalizedQuery)
      )
    : MISSIONS.filter((m) => m.circuit === selectedCircuit);

  const displayedMissions = baseMissions.filter((m) => {
    const done = Boolean(completedMissions[m.id]);
    if (statusFilter === 'pending') return !done;
    if (statusFilter === 'done') return done;
    return true;
  });

  const activeCircuitInfo =
    CIRCUITS.find((c) => c.id === selectedCircuit) ?? CIRCUITS[0];

  const activeCircuitMissions = MISSIONS.filter((m) => m.circuit === selectedCircuit);
  const nextMissionInCircuit =
    activeCircuitMissions.find((m) => !completedMissions[m.id] && isMissionUnlocked(m)) ??
    activeCircuitMissions.find((m) => isMissionUnlocked(m)) ??
    activeCircuitMissions[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner: Focused Single Anchor + Clear Resume Action */}
      <section className="cyber-grid-bg rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-8">
            <div>
              <p className="text-xs font-medium text-cyan-300">
                PyNetSec · Sistema Interativo de Python, Redes, Linux e Segurança da Informação
              </p>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl [text-wrap:balance]">
                Estude a teoria, conquiste a trilha CTF e pratique no laboratório sem sair do navegador.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                Um fluxo contínuo de aprendizagem: domine os conceitos em 4 pilares de estudo,
                resolva 50 missões progressivas com dicas integradas e experimente livremente em
                Python, ferramentas de rede e terminal Linux.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartMission(nextRecommendedMission)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                <Play className="h-4 w-4 fill-current" />
                {completedCount === 0
                  ? `Começar ${nextRecommendedMission.id}: ${nextRecommendedMission.title}`
                  : `Continuar ${nextRecommendedMission.id}: ${nextRecommendedMission.title}`}
              </button>

              <button
                type="button"
                onClick={() => onOpenStudy(nextRecommendedMission.circuit)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
              >
                <BookOpen className="h-4 w-4" />
                Estudar teoria do Circuito 0{nextRecommendedMission.circuit}
              </button>

              {!profile.aluno.trim() && (
                <button
                  type="button"
                  onClick={() => onOpenProfileDrawer('profile')}
                  className="cursor-pointer rounded-lg border border-slate-700 bg-[#090D16] px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                >
                  Informar Nome e Turma
                </button>
              )}
            </div>
          </div>

          {/* Right Summary Panel (Single Elevation) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#090D16] p-5 lg:col-span-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progresso PyNetSec</span>
                <span className="font-mono font-semibold text-cyan-300 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                <div>
                  <p className="text-xs text-slate-400">Flags Capturadas</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-50 tabular-nums">
                    {completedCount}
                    <span className="text-sm font-normal text-slate-500">
                      /{totalMissions}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pontuação PyNetSec</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                    {totalPoints}
                    <span className="ml-1 text-xs font-normal text-slate-500">XP</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Patente atual</span>
                <span className="font-semibold text-slate-100">{rankTitle}</span>
              </div>
              <div className="mt-2 flex items-center justify-between tabular-nums">
                <span>Badges de Defesa</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {defenseBadgesCount}/{totalDefenseBadges}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Operador</span>
                <span className="max-w-[180px] truncate text-slate-200">
                  {profile.aluno.trim()
                    ? `${profile.aluno} · ${profile.turma}`
                    : 'Sessão local (anônimo)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Fluid Study Cycle Strip: Estudar -> Trilha CTF -> Laboratório */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onOpenStudy(selectedCircuit)}
          className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-800 bg-[#111827] p-5 text-left transition-colors hover:border-cyan-400/60"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-cyan-300">
              <span className="font-mono font-semibold">01. Estudar</span>
              <BookOpen className="h-4 w-4 text-cyan-400" />
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-100 group-hover:text-cyan-200">
              Centro de Estudos Guiado
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              4 pilares completos: Python Prático, Redes &amp; TCP/UDP, Segurança da Informação e
              Linux Essencial.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs tabular-nums">
            <span className="text-slate-400">
              {completedDrillsCount}/{totalDrillsCount} treinos concluídos
            </span>
            <span className="flex items-center gap-1 font-semibold text-cyan-300">
              Abrir Estudo
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>

        <a
          href="#trilha-modulos"
          className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-[#111827] p-5 text-left transition-colors hover:border-cyan-400/60"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-mono font-semibold">02. Trilha CTF</span>
              <Flag className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-100 group-hover:text-emerald-200">
              50 Missões em 5 Circuitos
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Desafios práticos com dicas integradas, correção automática em Python e revisão
              instantânea da aula.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs tabular-nums">
            <span className="text-slate-400">
              {completedCount}/{totalMissions} flags capturadas
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-300">
              Explorar Circuitos
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </a>

        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#111827] p-5 text-left">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span className="font-mono font-semibold">03. Laboratório</span>
              <Terminal className="h-4 w-4 text-amber-300" />
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-100">
              Bancada Prática Unificada
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Alterne sem atrito entre a missão ativa, Sandbox Python/Redes (ping, nmap, sniff) e o
              Terminal Linux.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3 text-xs">
            <button
              type="button"
              onClick={() => onOpenLabMode('sandbox')}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#090D16] px-2.5 py-1.5 font-medium text-cyan-200 transition-colors hover:border-cyan-400/60 whitespace-nowrap"
            >
              <Code2 className="h-3.5 w-3.5" />
              Sandbox Python
            </button>
            <button
              type="button"
              onClick={() => onOpenLabMode('linux')}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#090D16] px-2.5 py-1.5 font-medium text-emerald-200 transition-colors hover:border-emerald-400/60 whitespace-nowrap"
            >
              <Terminal className="h-3.5 w-3.5" />
              Terminal Linux
            </button>
          </div>
        </div>
      </section>

      {/* Workspace Toolbar: 5 Integrated Modules + Teacher Free Mode Toggle */}
      <section id="trilha-modulos" className="mt-10 scroll-mt-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">
              Trilha PyNetSec · 5 Módulos Integrados (50 Missões)
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Cada módulo conecta sua teoria de estudo às missões práticas correspondentes. Escolha
              um circuito ou busque qualquer tema abaixo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleFreeNavigation(!freeNavigationMode)}
            className={`flex cursor-pointer items-center gap-2 self-start rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 sm:self-auto ${
              freeNavigationMode
                ? 'border-amber-400/50 bg-amber-400/10 text-amber-200'
                : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-700'
            }`}
          >
            {freeNavigationMode ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-amber-300" />
                Modo Livre (Professor): Ativado
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Modo Progressivo (Desbloquear tudo)
              </>
            )}
          </button>
        </div>

        {/* 5 Circuit Selector Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CIRCUITS.map((circuit) => {
            const list = MISSIONS.filter((m) => m.circuit === circuit.id);
            const done = list.filter((m) => Boolean(completedMissions[m.id])).length;
            const pct = list.length > 0 ? Math.round((done / list.length) * 100) : 0;
            const isSelected = !normalizedQuery && selectedCircuit === circuit.id;
            const Icon =
              circuit.id === 1
                ? Code2
                : circuit.id === 2
                  ? Network
                  : circuit.id === 3
                    ? Shield
                    : circuit.id === 4
                      ? Layers
                      : Terminal;

            return (
              <button
                key={circuit.id}
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCircuit(circuit.id);
                }}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/70 bg-[#162033]'
                    : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-cyan-300">
                      {circuit.code} · {circuit.accentLabel}
                    </span>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-50">
                    {circuit.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-300">
                    {CIRCUIT_STUDY_LABEL[circuit.id]}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {circuit.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        done === list.length ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 tabular-nums">
                    <span className="truncate">{list.length} missões</span>
                    <span
                      className={`shrink-0 font-mono ${
                        done === list.length ? 'font-semibold text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {done}/{list.length}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Circuit Mission List + Guided 1-2 Flow Bar + Filter & Search */}
      <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111827]">
        <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-50">
                {normalizedQuery
                  ? `Resultados da busca (${displayedMissions.length}/${totalMissions} missões)`
                  : `${activeCircuitInfo.code}: ${activeCircuitInfo.title}`}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {normalizedQuery
                  ? `Filtrando todas as 50 missões por "${searchQuery.trim()}"`
                  : activeCircuitInfo.subtitle}
              </p>
            </div>

            {!normalizedQuery && (
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedCircuit === 3 && (
                  <span className="flex items-center gap-1.5 text-xs text-rose-300">
                    <Flame className="h-4 w-4 shrink-0" />
                    Chefão Duplo 20A &amp; 20B
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onOpenStudy(selectedCircuit)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 whitespace-nowrap"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  1º Estudar {activeCircuitInfo.code}
                </button>
                {nextMissionInCircuit && (
                  <button
                    type="button"
                    disabled={!isMissionUnlocked(nextMissionInCircuit)}
                    onClick={() => onStartMission(nextMissionInCircuit)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    2º Praticar {nextMissionInCircuit.id}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'pending', label: 'Pendentes' },
                  { id: 'done', label: 'Concluídas' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tema (TCP, OSI, chmod, ping)..."
                aria-label="Buscar missões do CTF"
                className="w-64 rounded-lg border border-slate-700 bg-[#090D16] py-1.5 pr-3 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {displayedMissions.length === 0 ? (
            <div className="px-6 py-10 text-center text-xs text-slate-400">
              {normalizedQuery ? (
                <>
                  Nenhuma missão encontrada para &ldquo;{searchQuery.trim()}&rdquo;. Tente termos
                  como <span className="font-mono text-cyan-300">OSI</span>,{' '}
                  <span className="font-mono text-cyan-300">TCP</span>,{' '}
                  <span className="font-mono text-cyan-300">Linux</span>,{' '}
                  <span className="font-mono text-cyan-300">chmod</span> ou{' '}
                  <span className="font-mono text-cyan-300">DNS</span>.
                </>
              ) : (
                <>Nenhuma missão corresponde ao filtro selecionado neste módulo.</>
              )}
            </div>
          ) : (
            displayedMissions.map((mission) => {
              const doneRecord = completedMissions[mission.id];
              const unlocked = isMissionUnlocked(mission);
              const isBoss =
                mission.id === 'M20A' || mission.id === 'M20B' || mission.id === 'M50';

              const roleText =
                mission.teamRole === 'blue'
                  ? 'Blue Team'
                  : mission.teamRole === 'red'
                    ? 'Red Team'
                    : mission.teamRole === 'linux'
                      ? 'Terminal Linux'
                      : mission.teamRole === 'network'
                        ? 'Redes'
                        : 'Python Base';

              return (
                <div
                  key={mission.id}
                  className="flex flex-col justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-800/30 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 tabular-nums">
                      <span className="font-mono font-semibold text-cyan-300">
                        {mission.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{mission.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          mission.teamRole === 'red'
                            ? 'text-rose-300'
                            : mission.teamRole === 'blue'
                              ? 'text-sky-300'
                              : mission.teamRole === 'linux'
                                ? 'text-emerald-300'
                                : 'text-slate-400'
                        }
                      >
                        {roleText}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{mission.durationMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span>{mission.points} XP</span>
                    </div>

                    <h4
                      className={`mt-1 text-base font-semibold ${
                        unlocked ? 'text-slate-100' : 'text-slate-500'
                      }`}
                    >
                      {mission.title}
                    </h4>

                    {/* Always-present concise mission hint */}
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-amber-200/85">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                      <span>
                        <strong className="font-semibold text-amber-300">Dica:</strong>{' '}
                        {mission.hints[0]}
                      </span>
                    </p>

                    {doneRecord && (
                      <p className="mt-1 font-mono text-xs text-emerald-400">
                        Capturada: {doneRecord.flag}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {doneRecord ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
                        <CheckCircle2 className="h-4 w-4" />
                        Concluída
                      </span>
                    ) : !unlocked ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <Lock className="h-3.5 w-3.5" />
                        Bloqueada
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onOpenStudyForMission(mission.id)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Estudar
                    </button>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onStartMission(mission)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:cursor-not-allowed disabled:opacity-40 ${
                        doneRecord
                          ? 'border border-slate-700 bg-[#090D16] text-slate-200 hover:border-slate-500'
                          : isBoss && unlocked
                            ? 'bg-rose-500 text-white hover:bg-rose-400'
                            : 'bg-cyan-400 text-[#05131C] hover:bg-cyan-300'
                      }`}
                    >
                      {doneRecord ? 'Praticar de novo' : 'Abrir Missão'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
