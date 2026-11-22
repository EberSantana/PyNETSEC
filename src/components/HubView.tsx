import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Shield,
  Terminal,
  Unlock,
  Network,
  Flame,
} from 'lucide-react';
import { CIRCUITS, MISSIONS, getStudentRankTitle } from '../data/missions';
import {
  CircuitId,
  CompletedMissionRecord,
  Mission,
  StudentProfile,
} from '../types/ctf';

interface HubViewProps {
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  completedDrillsCount: number;
  totalDrillsCount: number;
  freeNavigationMode: boolean;
  isMissionUnlocked: (mission: Mission) => boolean;
  nextRecommendedMission: Mission;
  onStartMission: (mission: Mission) => void;
  onOpenStudy: (circuitId?: CircuitId) => void;
  onOpenSandbox: () => void;
  onToggleFreeNavigation: (enabled: boolean) => void;
  onOpenProfileDrawer: (tab?: 'profile' | 'sheets') => void;
}

export function HubView({
  profile,
  completedMissions,
  completedDrillsCount,
  totalDrillsCount,
  freeNavigationMode,
  isMissionUnlocked,
  nextRecommendedMission,
  onStartMission,
  onOpenStudy,
  onOpenSandbox,
  onToggleFreeNavigation,
  onOpenProfileDrawer,
}: HubViewProps) {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitId>(
    nextRecommendedMission.circuit
  );

  const completedCount = Object.keys(completedMissions).length;
  const totalMissions = MISSIONS.length;
  const totalPoints = Object.values(completedMissions).reduce(
    (sum, item) => sum + item.pontos,
    0
  );
  const progressPercent = Math.round((completedCount / totalMissions) * 100);
  const rankTitle = getStudentRankTitle(completedCount);

  const circuitMissions = MISSIONS.filter((m) => m.circuit === selectedCircuit);
  const activeCircuitInfo =
    CIRCUITS.find((c) => c.id === selectedCircuit) ?? CIRCUITS[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner: Focused Single Anchor + Clear Resume Action */}
      <section className="cyber-grid-bg rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-8">
            <div>
              <p className="text-xs font-medium text-cyan-300">
                TrilhaRali · Módulo Interativo · Python + Redes + Segurança (Pyodide)
              </p>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                Domine Python para Redes e Segurança na prática, direto no navegador.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                Sem instalação e sem bloqueio de firewall. Leia em 3 minutos, complete 1 ou 2
                linhas no código pré-preenchido, execute Python real em WebAssembly e capture
                as Flags até o Chefão Duplo (Blue Team 20A e Red Team 20B).
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
                Ambiente de Estudo ({completedDrillsCount}/{totalDrillsCount})
              </button>

              <button
                type="button"
                onClick={onOpenSandbox}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-[#090D16] px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
              >
                <Terminal className="h-4 w-4 text-cyan-400" />
                Sandbox Livre
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
                <span>Progresso na Trilha</span>
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
                  <p className="text-xs text-slate-400">Pontuação PySec</p>
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
              <div className="mt-2 flex items-center justify-between">
                <span>Operador</span>
                <span className="truncate max-w-[180px] text-slate-200">
                  {profile.aluno.trim()
                    ? `${profile.aluno} · ${profile.turma}`
                    : 'Sessão local (anônimo)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Toolbar: Circuit Selector + Teacher Free Mode Toggle */}
      <section className="mt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">
              Trilha Progressiva em 3 Circuitos
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              O motor Python (Pyodide) só é carregado sob demanda quando você entra em uma
              missão.
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

        {/* 3 Circuit Selector Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CIRCUITS.map((circuit) => {
            const list = MISSIONS.filter((m) => m.circuit === circuit.id);
            const done = list.filter((m) => Boolean(completedMissions[m.id])).length;
            const isSelected = selectedCircuit === circuit.id;
            const Icon =
              circuit.id === 1 ? Terminal : circuit.id === 2 ? Network : Shield;

            return (
              <button
                key={circuit.id}
                type="button"
                onClick={() => setSelectedCircuit(circuit.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/70 bg-[#162033]'
                    : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-cyan-300">
                      {circuit.code} · {circuit.accentLabel}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-50">
                    {circuit.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {circuit.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400 tabular-nums">
                  <span>{circuit.subtitle.split('·')[1]?.trim()}</span>
                  <span
                    className={
                      done === list.length ? 'font-semibold text-emerald-400' : 'text-slate-300'
                    }
                  >
                    {done}/{list.length} concluídas
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Circuit Mission List */}
      <section className="mt-8 rounded-2xl border border-slate-800 bg-[#111827]">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-50">
              {activeCircuitInfo.code}: {activeCircuitInfo.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {activeCircuitInfo.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {selectedCircuit === 3 && (
              <div className="flex items-center gap-2 text-xs text-rose-300">
                <Flame className="h-4 w-4 shrink-0" />
                <span>Fase Final Dupla: 20A Blue Team e 20B Red Team</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onOpenStudy(selectedCircuit)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 whitespace-nowrap"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Estudar aulas do {activeCircuitInfo.code}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {circuitMissions.map((mission) => {
            const doneRecord = completedMissions[mission.id];
            const unlocked = isMissionUnlocked(mission);
            const isBoss = mission.id === 'M20A' || mission.id === 'M20B';

            const roleText =
              mission.teamRole === 'blue'
                ? 'Blue Team'
                : mission.teamRole === 'red'
                  ? 'Red Team'
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

                  {doneRecord && (
                    <p className="mt-1 font-mono text-xs text-emerald-400">
                      Capturada: {doneRecord.flag}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
          })}
        </div>
      </section>
    </div>
  );
}
