import { Flag, History, Smartphone, Award, ArrowRight } from 'lucide-react';
import { MISSIONS, getStudentRankTitle } from '../data/missions';
import {
  CompletedMissionRecord,
  Mission,
  RunHistoryEntry,
  StudentProfile,
} from '../types/ctf';
import { CardPaletteId, LockScreenCardData } from './LockScreenCardModal';

interface BadgesViewProps {
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  runHistory: RunHistoryEntry[];
  onOpenLockScreenCard: (card: LockScreenCardData) => void;
  onStartMission: (mission: Mission) => void;
}

export function BadgesView({
  profile,
  completedMissions,
  runHistory,
  onOpenLockScreenCard,
  onStartMission,
}: BadgesViewProps) {
  const completedList = MISSIONS.filter((m) => Boolean(completedMissions[m.id]));
  const totalPoints = Object.values(completedMissions).reduce(
    (sum, item) => sum + item.pontos,
    0
  );
  const rankTitle = getStudentRankTitle(completedList.length);

  const openOverallCard = () => {
    onOpenLockScreenCard({
      missionCode: `PYSEC ${completedList.length}/${MISSIONS.length}`,
      title: rankTitle,
      flag:
        completedList.length > 0
          ? completedMissions[completedList[completedList.length - 1].id].flag
          : 'FLAG{jornada_iniciada_pysec}',
      studentName: profile.aluno.trim() || 'Operador PySec',
      turma: profile.turma.trim() || 'Ensino Médio Técnico',
      points: totalPoints,
      rankTitle: `${completedList.length} missões concluídas`,
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
      studentName: profile.aluno.trim() || 'Operador PySec',
      turma: profile.turma.trim() || 'Ensino Médio Técnico',
      points: mission.points,
      rankTitle,
      defaultPalette: palette,
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header + Overall Lock-Screen Card CTA */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium text-cyan-300">
            Cofre de Flags · Cartões 9:16 Lock-Screen
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-50">
            Suas Conquistas PySec
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 tabular-nums">
            Patente atual: <strong className="text-slate-100">{rankTitle}</strong> ·{' '}
            {completedList.length}/{MISSIONS.length} Flags · {totalPoints} XP acumulados
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

      {/* Captured Flags Grid */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-50">Flags Capturadas</h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {completedList.length} desbloqueada(s)
          </span>
        </div>

        {completedList.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center">
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
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#111827] p-5"
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
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-[#060911] px-3 py-2 font-mono text-xs text-emerald-300">
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

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
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
