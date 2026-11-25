import {
  ArrowRight,
  Award,
  CheckCircle2,
  Flag,
  Flame,
  History,
  KeyRound,
  Lock,
  Radar,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { DEFENSE_THEORY_MISSIONS, DefenseTheoryMission } from '../data/infoSecData';
import { MISSIONS, getStudentRankTitle } from '../data/missions';
import {
  CompletedMissionRecord,
  DefenseMissionCompletion,
  Mission,
  RunHistoryEntry,
  StudentProfile,
} from '../types/ctf';
import { CardPaletteId, LockScreenCardData } from './LockScreenCardModal';

interface BadgesViewProps {
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  completedDefenseMissions: Record<string, DefenseMissionCompletion>;
  runHistory: RunHistoryEntry[];
  onOpenLockScreenCard: (card: LockScreenCardData) => void;
  onStartMission: (mission: Mission) => void;
  onOpenDefenseStudy: () => void;
}

export function BadgesView({
  profile,
  completedMissions,
  completedDefenseMissions,
  runHistory,
  onOpenLockScreenCard,
  onStartMission,
  onOpenDefenseStudy,
}: BadgesViewProps) {
  const completedList = MISSIONS.filter((m) => Boolean(completedMissions[m.id]));
  const unlockedDefenseList = DEFENSE_THEORY_MISSIONS.filter((m) =>
    Boolean(completedDefenseMissions[m.id])
  );
  const totalPoints = Object.values(completedMissions).reduce(
    (sum, item) => sum + item.pontos,
    0
  );
  const rankTitle = getStudentRankTitle(completedList.length);

  const openOverallCard = () => {
    onOpenLockScreenCard({
      missionCode: `PYNETSEC ${completedList.length}/${MISSIONS.length}`,
      title: rankTitle,
      flag:
        completedList.length > 0
          ? completedMissions[completedList[completedList.length - 1].id].flag
          : 'FLAG{jornada_iniciada_pynetsec}',
      studentName: profile.aluno.trim() || 'Operador PyNetSec',
      turma: profile.turma.trim() || 'Ensino Médio Técnico',
      points: totalPoints,
      rankTitle: `${completedList.length} missões · ${unlockedDefenseList.length}/${DEFENSE_THEORY_MISSIONS.length} badges`,
      defaultPalette: 'cyan',
    });
  };

  const openMissionCard = (mission: Mission) => {
    const palette: CardPaletteId =
      mission.teamRole === 'red'
        ? 'crimson'
        : mission.circuit === 1
          ? 'emerald'
          : 'cyan';
    onOpenLockScreenCard({
      missionCode: `MISSÃO ${mission.id}`,
      title: mission.title,
      flag: mission.flag,
      studentName: profile.aluno.trim() || 'Operador PyNetSec',
      turma: profile.turma.trim() || 'Ensino Médio Técnico',
      points: mission.points,
      rankTitle,
      defaultPalette: palette,
    });
  };

  const openDefenseBadgeCard = (mission: DefenseTheoryMission) => {
    onOpenLockScreenCard({
      missionCode: `SEGURANÇA · ${mission.id}`,
      title: mission.badgeTitle,
      flag: mission.badgeCode,
      studentName: profile.aluno.trim() || 'Operador PyNetSec',
      turma: profile.turma.trim() || 'Ensino Médio Técnico',
      points: mission.badgePoints,
      rankTitle: `Badge de Defesa · ${mission.pillarLabel}`,
      badgeLabel: 'BADGE DE DEFESA DESBLOQUEADA',
      defaultPalette: mission.badgePalette,
    });
  };

  const getDefenseIcon = (pillar: DefenseTheoryMission['pillar']) => {
    if (pillar === 'firewall') return Flame;
    if (pillar === 'criptografia') return KeyRound;
    if (pillar === 'ids-ips') return Radar;
    return ShieldCheck;
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header + Overall Lock-Screen Card CTA */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium text-cyan-300">
            Perfil de Conquistas · Badges de Defesa &amp; Cofre de Flags
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-50">
            Suas Conquistas PyNetSec
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 tabular-nums">
            Patente atual: <strong className="text-slate-100">{rankTitle}</strong> ·{' '}
            <strong className="text-emerald-400">
              {unlockedDefenseList.length}/{DEFENSE_THEORY_MISSIONS.length}
            </strong>{' '}
            Badges de Defesa · {completedList.length}/{MISSIONS.length} Flags · {totalPoints} XP
            acumulados
          </p>
        </div>

        <button
          type="button"
          onClick={openOverallCard}
          className="flex cursor-pointer items-center gap-2 self-start rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap sm:self-auto"
        >
          <Smartphone className="h-4 w-4" />
          Prévia Lock-Screen da Patente
        </button>
      </div>

      {/* Defense Badges Section (Segurança da Informação) */}
      <section className="mt-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-slate-50">
              Badges de Defesa · Segurança da Informação
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Desbloqueadas ao completar as missões teóricas de Firewall, Criptografia, IDS/IPS e
              Defesa em Profundidade no Centro de Estudos.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs tabular-nums shrink-0">
            <span className="text-slate-400">
              <strong className="font-mono text-emerald-400">
                {unlockedDefenseList.length}/{DEFENSE_THEORY_MISSIONS.length}
              </strong>{' '}
              desbloqueadas
            </span>
            <button
              type="button"
              onClick={onOpenDefenseStudy}
              className="flex cursor-pointer items-center gap-1 font-semibold text-cyan-300 transition-colors hover:text-cyan-200 whitespace-nowrap"
            >
              Ir para Missões de Defesa
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {DEFENSE_THEORY_MISSIONS.map((mission) => {
            const record = completedDefenseMissions[mission.id];
            const unlocked = Boolean(record);
            const Icon = getDefenseIcon(mission.pillar);

            return (
              <div
                key={mission.id}
                className={`flex flex-col justify-between rounded-xl border p-5 ${
                  unlocked
                    ? 'border-emerald-500/40 bg-[#0F1E36]'
                    : 'border-slate-800 bg-[#0D1321]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                    <span className="font-mono font-semibold text-cyan-300">
                      {mission.id} · {mission.pillarLabel}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        unlocked
                          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                          : 'border-slate-800 bg-[#071225] text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-bold ${
                          unlocked ? 'text-slate-50' : 'text-slate-400'
                        }`}
                      >
                        {mission.badgeTitle}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {unlocked
                          ? `Conquistada em ${new Date(record.completedAt).toLocaleDateString('pt-BR')}`
                          : 'Missão teórica pendente'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {mission.badgeSubtitle}
                  </p>

                  {unlocked && (
                    <div className="mt-3 truncate rounded-lg border border-emerald-500/25 bg-[#050E1D] px-3 py-1.5 font-mono text-[11px] text-emerald-300">
                      {mission.badgeCode}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  {unlocked ? (
                    <>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {record.score}/{record.total} acertos
                      </span>
                      <button
                        type="button"
                        onClick={() => openDefenseBadgeCard(mission)}
                        className="flex cursor-pointer items-center gap-1.5 font-semibold text-cyan-300 transition-colors hover:text-cyan-200 whitespace-nowrap"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        Ver Lock-Screen
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenDefenseStudy}
                      className="flex w-full cursor-pointer items-center justify-between font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                    >
                      <span>Desbloquear em Estudar</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Captured Flags Grid */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-50">Flags Capturadas</h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {completedList.length} desbloqueada(s)
          </span>
        </div>

        {completedList.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-[#0F1E36] p-10 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-600" />
            <h3 className="mt-3 text-base font-semibold text-slate-200">
              Nenhuma Flag capturada ainda
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
              Valide sua primeira missão no Laboratório para colecionar Flags e gerar cartões
              exclusivos de tela de bloqueio 9:16.
            </p>
            <button
              type="button"
              onClick={() => onStartMission(MISSIONS[0])}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05131C] hover:bg-cyan-300"
            >
              Ir para Missão M01
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedList.map((mission) => {
              const record = completedMissions[mission.id];
              return (
                <div
                  key={mission.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0F1E36] p-5"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
                      <span className="font-mono font-semibold text-cyan-300">
                        {mission.id} · +{mission.points} XP
                      </span>
                      <span>
                        {new Date(record.completedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-slate-100">
                      {mission.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-[#050E1D] px-3 py-2 font-mono text-xs text-emerald-300">
                      <Flag className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{record.flag}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] text-slate-400">
                      {record.syncStatus === 'synced' || record.syncStatus === 'duplicate'
                        ? 'Sincronizada no Sheets'
                        : 'Salva localmente'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openMissionCard(mission)}
                      className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Ver Lock-Screen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Local Session Execution History */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-50">
            Histórico Recente da Sessão Local
          </h2>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
          {runHistory.length === 0 ? (
            <p className="p-6 text-xs text-slate-400">
              Suas execuções Python no laboratório aparecerão registradas aqui automaticamente.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {runHistory.slice(0, 15).map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col justify-between gap-2 px-5 py-3.5 text-xs sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-cyan-300">
                        {entry.missaoId}
                      </span>
                      <span className="text-slate-200">{entry.missaoTitle}</span>
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      <span
                        className={
                          entry.status === 'validated'
                            ? 'font-semibold text-emerald-400'
                            : entry.status === 'error'
                              ? 'font-semibold text-rose-400'
                              : 'text-slate-400'
                        }
                      >
                        {entry.status === 'validated'
                          ? 'Validada'
                          : entry.status === 'error'
                            ? 'Erro'
                            : 'Executada'}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-slate-400">
                      {entry.outputPreview}
                    </p>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-slate-500 tabular-nums">
                    {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    · {entry.durationMs} ms
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
