import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  KeyRound,
  Lock,
  Radar,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import {
  DEFENSE_PILLAR_GUIDES,
  DEFENSE_THEORY_MISSIONS,
  DefenseTheoryMission,
  IDS_VS_IPS_COMPARISON,
} from '../data/infoSecData';
import { DefenseMissionCompletion } from '../types/ctf';

interface DefenseMissionsSectionProps {
  completedDefenseMissions: Record<string, DefenseMissionCompletion>;
  onCompleteDefenseMission: (completion: DefenseMissionCompletion) => void;
  onOpenBadges: () => void;
  onOpenDefenseBadgeCard?: (missionId: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function DefenseMissionsSection({
  completedDefenseMissions,
  onCompleteDefenseMission,
  onOpenBadges,
  onOpenDefenseBadgeCard,
}: DefenseMissionsSectionProps) {
  const [activePillarId, setActivePillarId] = useState<'firewall' | 'criptografia' | 'ids-ips'>(
    'firewall'
  );
  const [idsSimMode, setIdsSimMode] = useState<'ids' | 'ips'>('ids');
  const [activeMissionId, setActiveMissionId] = useState<string>(DEFENSE_THEORY_MISSIONS[0].id);
  const [answersByMission, setAnswersByMission] = useState<
    Record<string, Record<string, number>>
  >({});

  const activePillar = useMemo(
    () => DEFENSE_PILLAR_GUIDES.find((p) => p.id === activePillarId) ?? DEFENSE_PILLAR_GUIDES[0],
    [activePillarId]
  );

  const activeMission: DefenseTheoryMission = useMemo(
    () =>
      DEFENSE_THEORY_MISSIONS.find((m) => m.id === activeMissionId) ??
      DEFENSE_THEORY_MISSIONS[0],
    [activeMissionId]
  );

  const unlockedCount = DEFENSE_THEORY_MISSIONS.filter((m) =>
    Boolean(completedDefenseMissions[m.id])
  ).length;

  const currentAnswers = answersByMission[activeMission.id] ?? {};
  const answeredCount = activeMission.questions.filter(
    (q) => currentAnswers[q.id] !== undefined
  ).length;
  const correctCount = activeMission.questions.filter(
    (q) => currentAnswers[q.id] === q.correctIndex
  ).length;
  const allAnswered = answeredCount === activeMission.questions.length;
  const missionAlreadyUnlocked = Boolean(completedDefenseMissions[activeMission.id]);
  const passedThisAttempt = allAnswered && correctCount === activeMission.questions.length;

  const nextMission = useMemo(() => {
    const idx = DEFENSE_THEORY_MISSIONS.findIndex((m) => m.id === activeMission.id);
    if (idx < 0 || idx >= DEFENSE_THEORY_MISSIONS.length - 1) return null;
    return DEFENSE_THEORY_MISSIONS[idx + 1];
  }, [activeMission.id]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    const nextMissionAnswers = {
      ...currentAnswers,
      [questionId]: optionIdx,
    };

    setAnswersByMission((prev) => ({
      ...prev,
      [activeMission.id]: nextMissionAnswers,
    }));

    const totalQuestions = activeMission.questions.length;
    const totalAnsweredNow = activeMission.questions.filter(
      (q) => nextMissionAnswers[q.id] !== undefined
    ).length;
    const totalCorrectNow = activeMission.questions.filter(
      (q) => nextMissionAnswers[q.id] === q.correctIndex
    ).length;

    if (totalAnsweredNow === totalQuestions && totalCorrectNow === totalQuestions) {
      onCompleteDefenseMission({
        missionId: activeMission.id,
        badgeId: activeMission.badgeId,
        badgeTitle: activeMission.badgeTitle,
        badgeCode: activeMission.badgeCode,
        completedAt:
          completedDefenseMissions[activeMission.id]?.completedAt ?? new Date().toISOString(),
        score: totalCorrectNow,
        total: totalQuestions,
      });
    }
  };

  const handleRetryMission = () => {
    setAnswersByMission((prev) => ({
      ...prev,
      [activeMission.id]: {},
    }));
  };

  const getMissionIcon = (pillar: DefenseTheoryMission['pillar']) => {
    if (pillar === 'firewall') return Flame;
    if (pillar === 'criptografia') return KeyRound;
    if (pillar === 'ids-ips') return Radar;
    return ShieldCheck;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Defense Curriculum + Profile Badges Progress */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold text-cyan-300">
              Segurança da Informação · Arquitetura de Defesa Blue Team
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-50">
              Firewall, Criptografia e IDS/IPS na Prática
            </h2>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300">
              Domine os três pilares essenciais de defesa de redes e sistemas, compare o
              comportamento passivo do IDS com o bloqueio ativo inline do IPS e complete as 4
              missões teóricas de múltipla escolha para desbloquear novas badges no seu perfil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="rounded-xl border border-slate-800 bg-[#090D16] px-4 py-2.5 text-xs tabular-nums">
              <p className="text-slate-400">Badges de Defesa no Perfil</p>
              <p className="mt-0.5 font-mono text-base font-bold text-emerald-400">
                {unlockedCount}/{DEFENSE_THEORY_MISSIONS.length}
                <span className="ml-1.5 text-xs font-normal text-slate-400">desbloqueadas</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenBadges}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 whitespace-nowrap"
            >
              <Award className="h-4 w-4 text-cyan-300" />
              Ver Badges no Perfil
            </button>
          </div>
        </div>
      </section>

      {/* BLOCK 1: 3 Core Defense Pillars Study Panel */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-cyan-300">
              Etapa 1 · Conceitos Fundamentais de Defesa
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-50">
              Explore cada camada antes das missões teóricas
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Selecione um pilar para ver mecanismos, exemplos reais e armadilhas comuns
          </p>
        </div>

        {/* 3 Pillar Selector Buttons */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {DEFENSE_PILLAR_GUIDES.map((guide) => {
            const isActive = guide.id === activePillar.id;
            const Icon =
              guide.id === 'firewall'
                ? Flame
                : guide.id === 'criptografia'
                  ? KeyRound
                  : Radar;
            const accentText =
              guide.accent === 'emerald'
                ? 'text-emerald-300'
                : guide.accent === 'amber'
                  ? 'text-amber-300'
                  : 'text-cyan-300';

            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setActivePillarId(guide.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                  isActive
                    ? 'border-cyan-400 bg-[#162033]'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`font-mono font-semibold ${accentText}`}>
                      Defesa {guide.step}
                    </span>
                    <Icon className={`h-4 w-4 shrink-0 ${accentText}`} />
                  </div>
                  <h4 className="mt-1.5 text-sm font-bold text-slate-100">{guide.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{guide.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Deep Dive */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-slate-800 bg-[#090D16] p-5 lg:col-span-7">
            <div>
              <p className="text-xs font-semibold text-cyan-300">
                Defesa {activePillar.step} · Papel Principal
              </p>
              <h4 className="mt-1 text-lg font-bold text-slate-50">{activePillar.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{activePillar.coreRole}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {activePillar.howItWorks}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              {activePillar.mechanisms.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-slate-800 bg-[#111827] p-3.5"
                >
                  <p className="text-xs font-semibold text-slate-100">{item.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="rounded-xl border border-slate-800 bg-[#060911] p-4">
              <p className="text-xs font-semibold text-cyan-300">
                {activePillar.practicalExampleTitle}
              </p>
              <pre className="mt-2.5 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                {activePillar.practicalExample}
              </pre>
            </div>

            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div>
                  <p className="text-xs font-semibold text-amber-200">
                    Erro comum de iniciantes
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
                    {activePillar.commonMistake}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive IDS vs. IPS Visual Flow & Comparison Table */}
        {activePillar.id === 'ids-ips' && (
          <div className="mt-6 space-y-5 border-t border-slate-800 pt-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  Comparativo Visual · Passivo vs. Inline
                </p>
                <h4 className="mt-0.5 text-base font-bold text-slate-50">
                  Como o mesmo pacote malicioso atravessa um IDS vs. um IPS
                </h4>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setIdsSimMode('ids')}
                  className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    idsSimMode === 'ids'
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-300 hover:text-slate-100'
                  }`}
                >
                  IDS (Passivo · Alerta)
                </button>
                <button
                  type="button"
                  onClick={() => setIdsSimMode('ips')}
                  className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    idsSimMode === 'ips'
                      ? 'bg-emerald-400 text-[#05131C]'
                      : 'text-slate-300 hover:text-slate-100'
                  }`}
                >
                  IPS (Ativo · Bloqueio Inline)
                </button>
              </div>
            </div>

            {/* Interactive SVG Architecture Flow */}
            <div className="rounded-xl border border-slate-800 bg-[#060911] p-4">
              <svg
                viewBox="0 0 840 210"
                className="h-auto w-full"
                role="img"
                aria-label={
                  idsSimMode === 'ids'
                    ? 'Diagrama de fluxo de um IDS passivo monitorando cópia do tráfego'
                    : 'Diagrama de fluxo de um IPS ativo bloqueando pacote malicioso inline'
                }
              >
                {/* Node 1: Attacker */}
                <rect
                  x="20"
                  y="32"
                  width="155"
                  height="64"
                  rx="12"
                  fill="#1F1220"
                  stroke="#FB7185"
                  strokeWidth="1.5"
                />
                <text x="97" y="59" textAnchor="middle" fill="#FDA4AF" fontSize="13" fontWeight="700">
                  Atacante / Internet
                </text>
                <text x="97" y="79" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  Payload: SQLi / Exploit
                </text>

                {idsSimMode === 'ids' ? (
                  <>
                    {/* Main line direct to Switch/TAP -> Server */}
                    <line
                      x1="175"
                      y1="64"
                      x2="330"
                      y2="64"
                      stroke="#FB7185"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                    <rect
                      x="330"
                      y="32"
                      width="160"
                      height="64"
                      rx="12"
                      fill="#111827"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                    />
                    <text x="410" y="59" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="700">
                      Switch / Porta SPAN
                    </text>
                    <text x="410" y="79" textAnchor="middle" fill="#94A3B8" fontSize="11">
                      Espelha cópia do tráfego
                    </text>

                    {/* Packet continues to Server */}
                    <line x1="490" y1="64" x2="650" y2="64" stroke="#FB7185" strokeWidth="2.5" />
                    <polygon points="650,64 640,58 640,70" fill="#FB7185" />
                    <text x="570" y="52" textAnchor="middle" fill="#FDA4AF" fontSize="10" fontWeight="600">
                      Pacote passa ao alvo
                    </text>

                    {/* Mirrored copy down to IDS */}
                    <line
                      x1="410"
                      y1="96"
                      x2="410"
                      y2="136"
                      stroke="#22D3EE"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <rect
                      x="315"
                      y="136"
                      width="190"
                      height="56"
                      rx="12"
                      fill="#0B1F2E"
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                    />
                    <text x="410" y="161" textAnchor="middle" fill="#67E8F9" fontSize="13" fontWeight="700">
                      Sensor IDS (Passivo)
                    </text>
                    <text x="410" y="179" textAnchor="middle" fill="#CBD5E1" fontSize="11">
                      Gera Alerta → SOC / SIEM
                    </text>

                    {/* Server reached */}
                    <rect
                      x="655"
                      y="32"
                      width="165"
                      height="64"
                      rx="12"
                      fill="#1E1B18"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                    />
                    <text x="737" y="59" textAnchor="middle" fill="#FDE68A" fontSize="13" fontWeight="700">
                      Servidor Protegido
                    </text>
                    <text x="737" y="79" textAnchor="middle" fill="#FBBF24" fontSize="11">
                      Recebe pacote (alerta ativo)
                    </text>
                  </>
                ) : (
                  <>
                    {/* Packet reaches IPS inline */}
                    <line x1="175" y1="64" x2="315" y2="64" stroke="#FB7185" strokeWidth="2.5" />
                    <polygon points="315,64 305,58 305,70" fill="#FB7185" />

                    {/* Inline IPS Box */}
                    <rect
                      x="320"
                      y="26"
                      width="200"
                      height="76"
                      rx="12"
                      fill="#08241C"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <text x="420" y="55" textAnchor="middle" fill="#6EE7B7" fontSize="13" fontWeight="700">
                      IPS Inline (Ativo)
                    </text>
                    <text x="420" y="74" textAnchor="middle" fill="#A7F3D0" fontSize="11">
                      Inspeciona &amp; Aplica DROP
                    </text>
                    <text x="420" y="91" textAnchor="middle" fill="#94A3B8" fontSize="10">
                      + registra alerta no SIEM
                    </text>

                    {/* Blocked path to server */}
                    <line
                      x1="520"
                      y1="64"
                      x2="650"
                      y2="64"
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="4 6"
                    />
                    <text x="585" y="52" textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="700">
                      DROP / BLOQUEADO
                    </text>

                    {/* Dropped packet indicator */}
                    <line x1="420" y1="102" x2="420" y2="146" stroke="#FB7185" strokeWidth="2" />
                    <rect
                      x="325"
                      y="146"
                      width="190"
                      height="44"
                      rx="10"
                      fill="#231018"
                      stroke="#F43F5E"
                      strokeWidth="1.5"
                    />
                    <text x="420" y="172" textAnchor="middle" fill="#FDA4AF" fontSize="11" fontWeight="700">
                      Exploit descartado em linha
                    </text>

                    {/* Server safe */}
                    <rect
                      x="655"
                      y="32"
                      width="165"
                      height="64"
                      rx="12"
                      fill="#09201B"
                      stroke="#10B981"
                      strokeWidth="1.5"
                    />
                    <text x="737" y="59" textAnchor="middle" fill="#A7F3D0" fontSize="13" fontWeight="700">
                      Servidor Protegido
                    </text>
                    <text x="737" y="79" textAnchor="middle" fill="#34D399" fontSize="11">
                      Ameaça neutralizada
                    </text>
                  </>
                )}
              </svg>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                {idsSimMode === 'ids'
                  ? 'Modo IDS: o sensor recebe uma cópia do tráfego via porta espelhada (SPAN/TAP). Não adiciona latência e não derruba a rede por falso positivo, mas não impede o pacote malicioso de alcançar o servidor — depende da resposta do analista ou integração externa.'
                  : 'Modo IPS: posicionado em linha (inline), todo pacote precisa passar pela inspeção antes de seguir ao servidor. Bloqueia exploits automaticamente (DROP / TCP RST), porém exige calibração cuidadosa para evitar falsos positivos que afetem usuários legítimos.'}
              </p>
            </div>

            {/* Clean IDS vs. IPS Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090D16]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#060911] text-slate-300">
                    <th className="px-4 py-3 font-semibold">Critério</th>
                    <th className="px-4 py-3 font-semibold text-cyan-300">
                      IDS (Detecção de Intrusão)
                    </th>
                    <th className="px-4 py-3 font-semibold text-emerald-300">
                      IPS (Prevenção de Intrusão)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {IDS_VS_IPS_COMPARISON.map((row) => (
                    <tr key={row.criterion}>
                      <td className="px-4 py-3 font-semibold text-slate-200 whitespace-nowrap">
                        {row.criterion}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{row.ids}</td>
                      <td className="px-4 py-3 text-slate-300">{row.ips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* BLOCK 2: 4 Theoretical Multiple-Choice Missions that Unlock Profile Badges */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-emerald-300">
              Etapa 2 · Missões Teóricas de Múltipla Escolha
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-50">
              Conquiste Badges de Defesa no seu Perfil
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Responda corretamente às 3 situações técnicas de cada missão para desbloquear sua
              badge oficial em Conquistas e gerar o cartão Lock-Screen.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-300 tabular-nums shrink-0">
            Progresso: <strong className="text-emerald-400">{unlockedCount}</strong>/
            {DEFENSE_THEORY_MISSIONS.length} badges
          </span>
        </div>

        {/* 4 Mission Selector Cards */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEFENSE_THEORY_MISSIONS.map((mission) => {
            const isSelected = mission.id === activeMission.id;
            const isUnlocked = Boolean(completedDefenseMissions[mission.id]);
            const Icon = getMissionIcon(mission.pillar);

            return (
              <button
                key={mission.id}
                type="button"
                onClick={() => setActiveMissionId(mission.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400 bg-[#162033]'
                    : isUnlocked
                      ? 'border-emerald-500/40 bg-[#090D16] hover:border-emerald-400/70'
                      : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-cyan-300">
                      {mission.id} · {mission.pillarLabel}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                  </div>
                  <h4 className="mt-1.5 text-sm font-bold text-slate-100">{mission.title}</h4>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
                  <span className={isUnlocked ? 'font-semibold text-emerald-300' : 'text-slate-400'}>
                    Badge: {mission.badgeTitle}
                  </span>
                  {!isUnlocked && <Lock className="h-3 w-3 shrink-0 text-slate-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Mission Challenge Card */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#090D16] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                <span className="font-mono font-semibold text-cyan-300">
                  Missão Teórica {activeMission.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeMission.pillarLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  Recompensa: +{activeMission.badgePoints} XP em Badge
                </span>
              </div>
              <h4 className="mt-1 text-xl font-bold text-slate-50">{activeMission.title}</h4>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300">
                {activeMission.briefing}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 shrink-0">
              {missionAlreadyUnlocked ? (
                <ShieldCheck className="h-7 w-7 shrink-0 text-emerald-400" />
              ) : (
                <Shield className="h-7 w-7 shrink-0 text-slate-500" />
              )}
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  {missionAlreadyUnlocked ? 'Badge Desbloqueada' : 'Badge Alvo'}
                </p>
                <p className="text-sm font-bold text-slate-100">{activeMission.badgeTitle}</p>
                <p className="font-mono text-[11px] text-cyan-300">{activeMission.badgeCode}</p>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="mt-5 space-y-5">
            {activeMission.questions.map((q, qIdx) => {
              const selectedIdx = currentAnswers[q.id];
              const isAnswered = selectedIdx !== undefined;
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-800 bg-[#111827] p-5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
                    <span className="font-mono font-semibold text-cyan-300">
                      Questão {qIdx + 1} de {activeMission.questions.length}
                    </span>
                    {isAnswered && (
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Correta
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Revisar conceito
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 rounded-lg border border-slate-800 bg-[#090D16] px-3.5 py-2.5 text-xs leading-relaxed text-slate-300">
                    <strong className="text-slate-100">Cenário:</strong> {q.scenario}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-slate-50">{q.question}</p>

                  <div className="mt-3.5 grid grid-cols-1 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const picked = selectedIdx === optIdx;
                      const rightOption = optIdx === q.correctIndex;

                      let btnStyle =
                        'border-slate-800 bg-[#090D16] text-slate-200 hover:border-cyan-400/50 hover:bg-slate-800/40';
                      if (isAnswered) {
                        if (rightOption) {
                          btnStyle =
                            'border-emerald-400/60 bg-emerald-400/10 text-emerald-100';
                        } else if (picked && !rightOption) {
                          btnStyle = 'border-rose-500/60 bg-rose-500/10 text-rose-100';
                        } else {
                          btnStyle = 'border-slate-800/60 bg-[#090D16]/60 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-xs leading-relaxed transition-colors disabled:cursor-default ${btnStyle}`}
                        >
                          <span className="mt-0.5 font-mono font-bold text-cyan-300 shrink-0">
                            {OPTION_LETTERS[optIdx]}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isAnswered && rightOption && (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          )}
                          {isAnswered && picked && !rightOption && (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`mt-3.5 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed ${
                        isCorrect
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                          : 'border-amber-400/35 bg-amber-400/10 text-amber-100'
                      }`}
                    >
                      <strong className="font-semibold">Explicação técnica:</strong>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mission Completion / Result Footer */}
          <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              {passedThisAttempt || missionAlreadyUnlocked ? (
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : allAnswered ? (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              ) : (
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
              )}
              <div>
                <p className="text-sm font-bold text-slate-100">
                  {passedThisAttempt
                    ? `Badge "${activeMission.badgeTitle}" desbloqueada no seu perfil!`
                    : missionAlreadyUnlocked && !allAnswered
                      ? `Você já conquistou "${activeMission.badgeTitle}" — responda novamente quando quiser revisar.`
                      : allAnswered
                        ? `Resultado: ${correctCount}/${activeMission.questions.length} acertos. Acerte todas as 3 para desbloquear a badge.`
                        : `Progresso da missão: ${answeredCount}/${activeMission.questions.length} respondidas · Meta: 3/3 acertos`}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {passedThisAttempt || missionAlreadyUnlocked
                    ? `${activeMission.badgeSubtitle} · Salva automaticamente no perfil local.`
                    : 'Leia a explicação técnica de cada alternativa para consolidar o conceito de defesa.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetryMission}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090D16] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Tentar Novamente
                </button>
              )}

              {(passedThisAttempt || missionAlreadyUnlocked) && onOpenDefenseBadgeCard && (
                <button
                  type="button"
                  onClick={() => onOpenDefenseBadgeCard(activeMission.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20 whitespace-nowrap"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Cartão Lock-Screen
                </button>
              )}

              {(passedThisAttempt || missionAlreadyUnlocked) && (
                <button
                  type="button"
                  onClick={onOpenBadges}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                >
                  <Award className="h-3.5 w-3.5" />
                  Ver no Perfil
                </button>
              )}

              {nextMission && (passedThisAttempt || missionAlreadyUnlocked) && (
                <button
                  type="button"
                  onClick={() => setActiveMissionId(nextMission.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/40 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/15 whitespace-nowrap"
                >
                  Próxima ({nextMission.id})
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
