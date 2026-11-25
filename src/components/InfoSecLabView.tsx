import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Bug,
  CheckCircle2,
  Eye,
  FileText,
  Flame,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Network,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Target,
  Users,
  XCircle,
} from 'lucide-react';
import {
  ATTACKER_PROFILES,
  ATTACK_ANATOMY_STEPS,
  ATTACK_FLOWS,
  BIBLIOGRAPHY_REFS,
  COURSE_SYLLABUS,
  CRYPTO_CONCEPTS,
  DEFENSE_THEORY_MISSIONS,
  DIKW_STAGES,
  EXTRA_ATTRIBUTES,
  INFOSEC_QUIZ,
  MALWARE_CATALOG,
  OFFICE_SECURITY_FLAWS,
  ORG_PRIORITIES,
  PERIMETER_DEFENSES,
  PHYSICAL_SECURITY_CATEGORIES,
  PSI_STANDARDS,
  RISK_CONCENTRIC_LAYERS,
  SECURITY_MYTHS,
  TCPIP_VULNERABILITIES,
  TRIAD_PILLARS,
} from '../data/infoSecData';
import { getMissionById } from '../data/missions';
import { DefenseMissionCompletion, Mission } from '../types/ctf';
import { DefenseMissionsSection } from './DefenseMissionsSection';

interface InfoSecLabViewProps {
  isMissionUnlocked: (mission: Mission) => boolean;
  onGoToMission: (mission: Mission) => void;
  completedDefenseMissions: Record<string, DefenseMissionCompletion>;
  onCompleteDefenseMission: (completion: DefenseMissionCompletion) => void;
  onOpenBadges: () => void;
  onOpenDefenseBadgeCard?: (missionId: string) => void;
}

type InfoSecTab =
  | 'defense-missions'
  | 'fundamentals'
  | 'triad-psi'
  | 'attacks'
  | 'malware-crypto'
  | 'defenses-risk'
  | 'quiz';

const RELATED_CTF_IDS = ['M16', 'M17', 'M18', 'M19', 'M20A', 'M20B'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function applyCaesarCipher(input: string, shift: number, mode: 'encrypt' | 'decrypt'): string {
  const normalizedShift = ((mode === 'encrypt' ? shift : -shift) % 26 + 26) % 26;
  return input
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('')
    .map((ch) => {
      const idx = ALPHABET.indexOf(ch);
      if (idx === -1) return ch;
      return ALPHABET[(idx + normalizedShift) % 26];
    })
    .join('');
}

export function InfoSecLabView({
  isMissionUnlocked,
  onGoToMission,
  completedDefenseMissions,
  onCompleteDefenseMission,
  onOpenBadges,
  onOpenDefenseBadgeCard,
}: InfoSecLabViewProps) {
  const [activeTab, setActiveTab] = useState<InfoSecTab>('defense-missions');

  // Tab 1: 8 Errors game + DIKW + Myths
  const [foundFlaws, setFoundFlaws] = useState<number[]>([]);
  const [selectedFlawId, setSelectedFlawId] = useState<number | null>(null);
  const [activeDikwId, setActiveDikwId] = useState<'dados' | 'informacao' | 'conhecimento'>('dados');
  const [revealedMyths, setRevealedMyths] = useState<Record<string, boolean>>({});

  // Tab 2: Triad + Org priorities + PSI
  const [activePillarId, setActivePillarId] = useState<'confidencialidade' | 'integridade' | 'disponibilidade'>('confidencialidade');
  const [activeOrgId, setActiveOrgId] = useState<string>('banco');
  const [psiView, setPsiView] = useState<'components' | 'routers' | 'servers'>('components');

  // Tab 3: Attack flows + 9 steps anatomy + TCP/IP vulns
  const [activeFlowId, setActiveFlowId] = useState<'normal' | 'interrupcao' | 'interceptacao' | 'modificacao' | 'fabricacao'>('interceptacao');
  const [activeAnatomyStep, setActiveAnatomyStep] = useState<number>(1);
  const [activeVulnLayerId, setActiveVulnLayerId] = useState<string>('l4-app');

  // Tab 4: Malware + Caesar lab
  const [activeMalwareId, setActiveMalwareId] = useState<string>('virus');
  const [caesarText, setCaesarText] = useState<string>('SEGURANCA DA INFORMACAO');
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [caesarMode, setCaesarMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Tab 5: Defenses + Risk calculator
  const [activeDefenseId, setActiveDefenseId] = useState<'firewall' | 'proxy' | 'ids' | 'ssl'>('firewall');
  const [riskAsset, setRiskAsset] = useState<string>('Servidor de Notas / Banco de Dados');
  const [riskImpact, setRiskImpact] = useState<number>(5);
  const [riskVuln, setRiskVuln] = useState<number>(3);
  const [riskProb, setRiskProb] = useState<number>(4);

  // Tab 6: Quiz
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const selectedFlaw = useMemo(
    () => OFFICE_SECURITY_FLAWS.find((f) => f.id === selectedFlawId) ?? null,
    [selectedFlawId]
  );

  const activeDikw = useMemo(
    () => DIKW_STAGES.find((d) => d.id === activeDikwId) ?? DIKW_STAGES[0],
    [activeDikwId]
  );

  const activePillar = useMemo(
    () => TRIAD_PILLARS.find((p) => p.id === activePillarId) ?? TRIAD_PILLARS[0],
    [activePillarId]
  );

  const activeOrg = useMemo(
    () => ORG_PRIORITIES.find((o) => o.id === activeOrgId) ?? ORG_PRIORITIES[0],
    [activeOrgId]
  );

  const activeFlow = useMemo(
    () => ATTACK_FLOWS.find((f) => f.id === activeFlowId) ?? ATTACK_FLOWS[0],
    [activeFlowId]
  );

  const activeStepData = useMemo(
    () => ATTACK_ANATOMY_STEPS.find((s) => s.step === activeAnatomyStep) ?? ATTACK_ANATOMY_STEPS[0],
    [activeAnatomyStep]
  );

  const activeVulnLayer = useMemo(
    () => TCPIP_VULNERABILITIES.find((l) => l.id === activeVulnLayerId) ?? TCPIP_VULNERABILITIES[0],
    [activeVulnLayerId]
  );

  const activeMalware = useMemo(
    () => MALWARE_CATALOG.find((m) => m.id === activeMalwareId) ?? MALWARE_CATALOG[0],
    [activeMalwareId]
  );

  const activeDefense = useMemo(
    () => PERIMETER_DEFENSES.find((d) => d.id === activeDefenseId) ?? PERIMETER_DEFENSES[0],
    [activeDefenseId]
  );

  const caesarResult = useMemo(
    () => applyCaesarCipher(caesarText, caesarShift, caesarMode),
    [caesarText, caesarShift, caesarMode]
  );

  const shiftedAlphabet = useMemo(() => {
    const k = ((caesarShift % 26) + 26) % 26;
    return ALPHABET.slice(k) + ALPHABET.slice(0, k);
  }, [caesarShift]);

  const riskScore = riskImpact * riskVuln * riskProb; // max 125
  const riskMeta = useMemo(() => {
    if (riskScore >= 80) {
      return {
        label: 'Crítico',
        color: 'text-rose-300 border-rose-500/40 bg-rose-500/10',
        action:
          'Intervenção imediata obrigatória: aplicar patch/controle técnico, isolar segmento de rede, ativar MFA e validar backup/DRP.',
      };
    }
    if (riskScore >= 45) {
      return {
        label: 'Alto',
        color: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
        action:
          'Prioridade alta no plano de segurança: reduzir vulnerabilidades com hardening, revisão de privilégios e monitoramento no IDS.',
      };
    }
    if (riskScore >= 20) {
      return {
        label: 'Moderado',
        color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
        action:
          'Mitigar via política de segurança (PSI), treinamento de usuários e controles preventivos proporcionais ao valor do ativo.',
      };
    }
    return {
      label: 'Baixo',
      color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
      action:
        'Risco aceitável sob monitoramento contínuo: manter auditoria periódica e boas práticas de rotina.',
    };
  }, [riskScore]);

  const handleSpotFlaw = (id: number) => {
    setFoundFlaws((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelectedFlawId(id);
  };

  const quizAnsweredCount = Object.keys(quizAnswers).length;
  const quizCorrectCount = INFOSEC_QUIZ.filter(
    (q) => quizAnswers[q.id] === q.correctIndex
  ).length;

  const unlockedDefenseBadges = DEFENSE_THEORY_MISSIONS.filter((m) =>
    Boolean(completedDefenseMissions[m.id])
  ).length;

  const tabs: { id: InfoSecTab; label: string; icon: typeof Shield }[] = [
    {
      id: 'defense-missions',
      label: `Defesa & Badges (${unlockedDefenseBadges}/${DEFENSE_THEORY_MISSIONS.length})`,
      icon: Award,
    },
    { id: 'fundamentals', label: 'Fundamentos & 8 Erros', icon: Eye },
    { id: 'triad-psi', label: 'Tríade CID & Normas', icon: ShieldCheck },
    { id: 'attacks', label: 'Ataques & 9 Etapas', icon: Target },
    { id: 'malware-crypto', label: 'Malware & Criptografia', icon: Bug },
    { id: 'defenses-risk', label: 'Defesas, Física & Riscos', icon: Flame },
    { id: 'quiz', label: 'Quiz & Bibliografia', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-module Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-[#0F1E36] p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* TAB 0: DEFESA (FIREWALL, CRIPTO, IDS/IPS) & MISSÕES DE BADGES      */}
      {/* ================================================================= */}
      {activeTab === 'defense-missions' && (
        <DefenseMissionsSection
          completedDefenseMissions={completedDefenseMissions}
          onCompleteDefenseMission={onCompleteDefenseMission}
          onOpenBadges={onOpenBadges}
          onOpenDefenseBadgeCard={onOpenDefenseBadgeCard}
        />
      )}

      {/* ================================================================= */}
      {/* TAB 1: FUNDAMENTOS, EMENTA & JOGO DOS 8 ERROS                     */}
      {/* ================================================================= */}
      {activeTab === 'fundamentals' && (
        <div className="space-y-6">
          {/* Course Syllabus Banner */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-xs font-semibold text-cyan-300">
                  {COURSE_SYLLABUS.course} · {COURSE_SYLLABUS.grade}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-50">
                  {COURSE_SYLLABUS.discipline} — Ementa & Trilha Interativa
                </h2>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-300">
                  {COURSE_SYLLABUS.ementa}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#071225] px-4 py-3 text-xs shrink-0">
                <p className="text-slate-400">Carga Horária</p>
                <p className="mt-0.5 font-mono font-semibold text-cyan-300 tabular-nums">
                  {COURSE_SYLLABUS.workload}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Eixo: {COURSE_SYLLABUS.axis}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COURSE_SYLLABUS.units.map((unit) => (
                <div
                  key={unit.number}
                  className="rounded-xl border border-slate-800 bg-[#071225] p-4"
                >
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    Unidade {unit.number}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-100">{unit.title}</h3>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {unit.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Game: Jogo dos 8 Erros de Segurança da Informação */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-semibold text-amber-300">
                  Desafio Prático de Abertura · Auditoria de Escritório
                </span>
                <h3 className="mt-0.5 text-xl font-bold text-slate-50">
                  Jogo dos 8 Erros da Segurança da Informação
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Clique nos 8 pontos vulneráveis na cena abaixo (ou na lista de inspeção) para identificar falhas físicas, de confidencialidade e disponibilidade.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="rounded-lg border border-slate-700 bg-[#071225] px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                  {foundFlaws.length}/8 encontrados
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFoundFlaws(OFFICE_SECURITY_FLAWS.map((f) => f.id));
                    setSelectedFlawId(1);
                  }}
                  className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20 whitespace-nowrap"
                >
                  Revelar Todos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFoundFlaws([]);
                    setSelectedFlawId(null);
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Interactive Office Audit Scene */}
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#050E1D] aspect-[16/10]">
                  <svg
                    viewBox="0 0 800 500"
                    className="h-full w-full"
                    role="img"
                    aria-label="Cena interativa de escritório para o jogo dos 8 erros de segurança da informação"
                  >
                    {/* Wall & Floor */}
                    <rect x="0" y="0" width="800" height="350" fill="#0B1220" />
                    <rect x="0" y="350" width="800" height="150" fill="#080D18" />
                    <line x1="0" y1="350" x2="800" y2="350" stroke="#1E293B" strokeWidth="2" />

                    {/* Calendar & Clock on wall */}
                    <rect x="145" y="45" width="90" height="95" rx="6" fill="#0F1E36" stroke="#334155" strokeWidth="2" />
                    <rect x="145" y="45" width="90" height="24" rx="4" fill="#1E293B" />
                    <text x="190" y="61" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">CALENDARIO</text>
                    <circle cx="430" cy="85" r="34" fill="#0F1E36" stroke="#334155" strokeWidth="2" />
                    <line x1="430" y1="85" x2="430" y2="62" stroke="#38BDF8" strokeWidth="2.5" />
                    <line x1="430" y1="85" x2="448" y2="85" stroke="#94A3B8" strokeWidth="2" />

                    {/* Long Desk */}
                    <rect x="55" y="295" width="690" height="20" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                    <rect x="75" y="315" width="18" height="145" fill="#172033" />
                    <rect x="705" y="315" width="18" height="145" fill="#172033" />

                    {/* #1 Software Box "Word" */}
                    <rect x="72" y="242" width="76" height="53" rx="4" fill="#172554" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="110" y="273" textAnchor="middle" fill="#BAE6FD" fontSize="13" fontWeight="bold" fontFamily="monospace">WORD</text>

                    {/* #2 Unlocked Monitor "BUDGET" */}
                    <rect x="195" y="198" width="135" height="90" rx="8" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                    <rect x="206" y="209" width="113" height="68" rx="4" fill="#052E16" stroke="#10B981" strokeWidth="1.5" />
                    <text x="262" y="236" textAnchor="middle" fill="#6EE7B7" fontSize="11" fontWeight="bold" fontFamily="monospace">ORCAMENTO</text>
                    <text x="262" y="253" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontFamily="monospace">SIGILOSO</text>
                    <rect x="245" y="288" width="35" height="7" fill="#475569" />

                    {/* #3 Backup Boxes right next to PCs */}
                    <rect x="385" y="218" width="96" height="36" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="433" y="241" textAnchor="middle" fill="#FDE68A" fontSize="11" fontFamily="monospace">Backup 1</text>
                    <rect x="385" y="258" width="96" height="36" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="433" y="281" textAnchor="middle" fill="#FDE68A" fontSize="11" fontFamily="monospace">Backup 2</text>

                    {/* #4 Hot Coffee Cup on top of monitor 2 */}
                    <rect x="536" y="158" width="34" height="38" rx="4" fill="#7C2D12" stroke="#FB923C" strokeWidth="2" />
                    <path d="M570 167 C582 167, 582 186, 570 186" fill="none" stroke="#FB923C" strokeWidth="2" />
                    <path d="M544 150 Q549 138 544 128 M554 150 Q559 138 554 128 M563 150 Q568 138 563 128" fill="none" stroke="#94A3B8" strokeWidth="1.5" />

                    {/* #5 Monitor 2 with Sticky Notes (Passwords) */}
                    <rect x="515" y="198" width="145" height="90" rx="8" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                    <rect x="526" y="209" width="123" height="68" rx="4" fill="#0F1E36" stroke="#334155" strokeWidth="1.5" />
                    {/* Sticky notes */}
                    <rect x="580" y="220" width="24" height="22" fill="#FACC15" />
                    <rect x="608" y="224" width="24" height="22" fill="#FDE047" />
                    <rect x="595" y="247" width="24" height="22" fill="#F59E0B" />
                    <text x="615" y="218" fill="#FEF08A" fontSize="9" fontFamily="monospace">SENHAS</text>
                    <rect x="570" y="288" width="35" height="7" fill="#475569" />

                    {/* #6 Telephone */}
                    <rect x="76" y="325" width="58" height="32" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                    <text x="105" y="345" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="monospace">FONE</text>

                    {/* #7 Loose Power Cable & Exposed Outlet */}
                    <rect x="128" y="395" width="32" height="52" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                    <circle cx="144" cy="410" r="5" fill="#0F172A" stroke="#94A3B8" />
                    <circle cx="144" cy="431" r="5" fill="#EF4444" />
                    <path
                      d="M144 431 C144 480, 230 485, 220 440 C210 395, 170 430, 175 315"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />

                    {/* #8 Open Filing Cabinet Drawer */}
                    <rect x="385" y="335" width="120" height="125" rx="4" fill="#0F1E36" stroke="#475569" strokeWidth="2" />
                    <rect x="395" y="348" width="100" height="46" rx="3" fill="#1E293B" stroke="#F43F5E" strokeWidth="2" />
                    <rect x="405" y="338" width="80" height="18" fill="#CBD5E1" />
                    <text x="445" y="376" textAnchor="middle" fill="#FCA5A5" fontSize="10" fontFamily="monospace">GAVETA ABERTA</text>
                    <rect x="395" y="404" width="100" height="44" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
                  </svg>

                  {/* Clickable Hotspots */}
                  {OFFICE_SECURITY_FLAWS.map((flaw) => {
                    const isFound = foundFlaws.includes(flaw.id);
                    const isSelected = selectedFlawId === flaw.id;
                    return (
                      <button
                        key={flaw.id}
                        type="button"
                        onClick={() => handleSpotFlaw(flaw.id)}
                        style={{ left: `${flaw.xPercent}%`, top: `${flaw.yPercent}%` }}
                        title={isFound ? flaw.title : 'Clique para inspecionar este ponto'}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-transform hover:scale-110 ${
                          isSelected
                            ? 'border-cyan-300 bg-cyan-400 text-[#05131C] scale-110'
                            : isFound
                              ? 'border-emerald-400 bg-emerald-500/90 text-[#05131C]'
                              : 'border-rose-400/80 bg-rose-500/25 text-rose-100 hover:bg-rose-500/45'
                        }`}
                      >
                        {isFound ? flaw.id : '?'}
                      </button>
                    );
                  })}
                </div>

                {/* Quick selector chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {OFFICE_SECURITY_FLAWS.map((flaw) => {
                    const isFound = foundFlaws.includes(flaw.id);
                    return (
                      <button
                        key={flaw.id}
                        type="button"
                        onClick={() => handleSpotFlaw(flaw.id)}
                        className={`cursor-pointer rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                          selectedFlawId === flaw.id
                            ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                            : isFound
                              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                              : 'border-slate-800 bg-[#071225] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isFound ? flaw.shortLabel : `Ponto #${flaw.id}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Audit Details Panel */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#071225] p-5 lg:col-span-5">
                {selectedFlaw ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-rose-300">
                        ERRO #{selectedFlaw.id} IDENTIFICADO
                      </span>
                      <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                        Impacto: {selectedFlaw.category}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-50">
                      {selectedFlaw.title}
                    </h4>

                    <p className="text-xs leading-relaxed text-slate-300">
                      {selectedFlaw.description}
                    </p>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                      <p className="text-[11px] font-semibold text-emerald-300">
                        Contramedida recomendada
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-100/90">
                        {selectedFlaw.remediation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                    <ShieldAlert className="h-9 w-9 text-amber-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-100">
                      Inicie a inspeção do escritório
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-slate-400">
                      Clique nos marcadores vermelhos na imagem ao lado para descobrir os 8 erros clássicos de Segurança da Informação.
                    </p>
                  </div>
                )}

                <div className="mt-5 border-t border-slate-800 pt-3.5 text-xs text-slate-400">
                  <strong className="text-slate-200">Reflexão histórica:</strong> A Segurança da Informação não surgiu com a computação — já existia na Antiguidade (ex.: Cifra de César) e evoluiu com a 2ª Guerra, Guerra Fria e Era da Nuvem (IaaS, PaaS, SaaS).
                </div>
              </div>
            </div>
          </section>

          {/* DIKW Ladder + People / Process / Technology */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-7">
              <h3 className="text-base font-bold text-slate-50">
                Dado × Informação = Conhecimento (Ativo de Informação)
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Segundo a ISO/IEC 13335, um <strong className="text-slate-200">Ativo</strong> é qualquer coisa que tenha valor para a organização — esteja em papel, disco rígido ou na memória das pessoas.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {DIKW_STAGES.map((stage, idx) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveDikwId(stage.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeDikwId === stage.id
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                        : 'border-slate-800 bg-[#071225] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-cyan-400">0{idx + 1}</span>
                    {stage.title}
                    <span className="text-[11px] text-slate-500">({stage.metaphor})</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-[#071225] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">{activeDikw.title}</span>
                  <span className="font-mono text-xs text-cyan-300">
                    Analogia: {activeDikw.metaphor}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{activeDikw.definition}</p>
                <div className="rounded-lg border border-slate-800 bg-[#050E1D] px-3 py-2 font-mono text-xs text-emerald-300">
                  Exemplo: {activeDikw.example}
                </div>
              </div>
            </section>

            {/* Triangle: Pessoas, Processos, Ferramentas */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-5">
              <h3 className="text-base font-bold text-slate-50">
                Os 3 Pilares Operacionais da Segurança
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Apenas comprar um antivírus não basta: segurança exige equilíbrio contínuo entre três frentes.
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="rounded-xl border border-cyan-500/30 bg-[#071225] p-3.5">
                  <p className="text-xs font-bold text-cyan-300">1. Pessoas</p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Cultura de segurança, capacitação técnica e conscientização constante contra engenharia social.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-[#071225] p-3.5">
                  <p className="text-xs font-bold text-emerald-300">2. Processos</p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Metodologia, normas (ISO 27001/27002), políticas (PSI) e procedimentos de auditoria e resposta.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-[#071225] p-3.5">
                  <p className="text-xs font-bold text-amber-300">3. Ferramentas</p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Recursos físicos e lógicos: firewalls, criptografia, MFA, IDS, backups, biometria e nobreaks.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Myths vs Reality Interactive Cards */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-base font-bold text-slate-50">
                  Mitos sobre Segurança da Informação — Clique para Desmentir
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  “O esforço para proteger a informação depende do valor da informação — e você nunca estará 100% seguro na Internet.”
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allRevealed = SECURITY_MYTHS.every((m) => revealedMyths[m.id]);
                  if (allRevealed) {
                    setRevealedMyths({});
                  } else {
                    const next: Record<string, boolean> = {};
                    SECURITY_MYTHS.forEach((m) => {
                      next[m.id] = true;
                    });
                    setRevealedMyths(next);
                  }
                }}
                className="cursor-pointer self-start rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap sm:self-auto"
              >
                {SECURITY_MYTHS.every((m) => revealedMyths[m.id])
                  ? 'Recolher Todos'
                  : 'Revelar Todas as Realidades'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {SECURITY_MYTHS.map((myth) => {
                const isOpen = Boolean(revealedMyths[myth.id]);
                return (
                  <button
                    key={myth.id}
                    type="button"
                    onClick={() =>
                      setRevealedMyths((prev) => ({ ...prev, [myth.id]: !prev[myth.id] }))
                    }
                    className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                      isOpen
                        ? 'border-rose-400/40 bg-[#0D1322]'
                        : 'border-slate-800 bg-[#071225] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                        Mito · {myth.riskTag}
                      </span>
                      <p className="mt-1.5 text-xs font-semibold text-slate-100">
                        {myth.statement}
                      </p>
                    </div>

                    {isOpen ? (
                      <p className="mt-3 border-t border-slate-800 pt-2.5 text-xs leading-relaxed text-emerald-200">
                        <strong className="text-emerald-400">Realidade: </strong>
                        {myth.reality}
                      </p>
                    ) : (
                      <p className="mt-3 text-[11px] font-medium text-cyan-300">
                        Clique para ver por que é falso →
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: TRÍADE CID, ATRIBUTOS, NORMAS ISO & PSI                    */}
      {/* ================================================================= */}
      {activeTab === 'triad-psi' && (
        <div className="space-y-6">
          {/* Interactive CIA Triad */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <h2 className="text-xl font-bold text-slate-50">
              A Tríade da Segurança da Informação (CID)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Base da NBR ISO/IEC 17799 / 27002: selecione cada vértice para explorar definição, ameaças e mecanismos de proteção.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Interactive Triangle Selector */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#071225] p-5 lg:col-span-5">
                <svg viewBox="0 0 320 260" className="w-full max-w-[300px]">
                  <polygon
                    points="160,26 42,226 278,226"
                    fill="#0D1628"
                    stroke="#334155"
                    strokeWidth="2"
                  />
                  <text
                    x="160"
                    y="158"
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    SEGURANÇA DA
                  </text>
                  <text
                    x="160"
                    y="174"
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    INFORMAÇÃO
                  </text>

                  {/* Top Vertex: Confidencialidade */}
                  <g
                    onClick={() => setActivePillarId('confidencialidade')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="92"
                      y="10"
                      width="136"
                      height="34"
                      rx="8"
                      fill={activePillarId === 'confidencialidade' ? '#3BE37A' : '#0F1E36'}
                      stroke="#3BE37A"
                      strokeWidth="2"
                    />
                    <text
                      x="160"
                      y="31"
                      textAnchor="middle"
                      fill={activePillarId === 'confidencialidade' ? '#05131C' : '#BAE6FD'}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Confidencialidade
                    </text>
                  </g>

                  {/* Bottom Left: Integridade */}
                  <g
                    onClick={() => setActivePillarId('integridade')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="10"
                      y="212"
                      width="118"
                      height="34"
                      rx="8"
                      fill={activePillarId === 'integridade' ? '#34D399' : '#0F1E36'}
                      stroke="#34D399"
                      strokeWidth="2"
                    />
                    <text
                      x="69"
                      y="233"
                      textAnchor="middle"
                      fill={activePillarId === 'integridade' ? '#05131C' : '#A7F3D0'}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Integridade
                    </text>
                  </g>

                  {/* Bottom Right: Disponibilidade */}
                  <g
                    onClick={() => setActivePillarId('disponibilidade')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="184"
                      y="212"
                      width="126"
                      height="34"
                      rx="8"
                      fill={activePillarId === 'disponibilidade' ? '#FBBF24' : '#0F1E36'}
                      stroke="#FBBF24"
                      strokeWidth="2"
                    />
                    <text
                      x="247"
                      y="233"
                      textAnchor="middle"
                      fill={activePillarId === 'disponibilidade' ? '#05131C' : '#FDE68A'}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Disponibilidade
                    </text>
                  </g>
                </svg>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {TRIAD_PILLARS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePillarId(p.id)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        activePillarId === p.id
                          ? 'bg-cyan-400 text-[#05131C]'
                          : 'border border-slate-800 bg-[#0F1E36] text-slate-300 hover:text-slate-100'
                      }`}
                    >
                      {p.shortCode} · {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Pillar Details */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#071225] p-5 lg:col-span-7">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-50">{activePillar.title}</h3>
                    <span className="rounded-md border border-cyan-400/35 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-200">
                      Pilar {activePillar.shortCode}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-200">
                    {activePillar.definition}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                      <p className="text-[11px] font-bold text-rose-300">Como é violada</p>
                      <p className="mt-1 text-xs text-rose-100/90">{activePillar.violation}</p>
                    </div>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                      <p className="text-[11px] font-bold text-amber-300">Exemplo real</p>
                      <p className="mt-1 text-xs text-amber-100/90">{activePillar.threatExample}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-emerald-300">
                      Como proteger na prática:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                      {activePillar.controls.map((ctrl, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{ctrl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra 6 Attributes */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-100">
                Propriedades Complementares de Segurança
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EXTRA_ATTRIBUTES.map((attr) => (
                  <div
                    key={attr.name}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-4"
                  >
                    <p className="text-xs font-bold text-cyan-300">{attr.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {attr.definition}
                    </p>
                    <p className="mt-2 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                      <strong className="text-slate-300">Mecanismo: </strong>
                      {attr.mechanism}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Organizational Priorities + ISO Norms & PSI */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Org Priorities Simulator */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-5">
              <h3 className="text-base font-bold text-slate-50">
                Prioridade por Tipo de Organização
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Cada instituição atribui pesos distintos aos atributos de segurança conforme o seu negócio.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {ORG_PRIORITIES.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setActiveOrgId(org.id)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeOrgId === org.id
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'border border-slate-800 bg-[#071225] text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {org.organization}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-2.5">
                <p className="text-xs font-medium text-cyan-200">{activeOrg.topPriority}</p>
                {activeOrg.ranking.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100">{item.pillar}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.level === 'Crítico'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/35'
                            : item.level === 'Alto'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                        }`}
                      >
                        {item.level}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Norms + PSI */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-7">
              <h3 className="text-base font-bold text-slate-50">
                Normas ISO & Política de Segurança da Informação (PSI)
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                A PSI é o primeiro passo para elevar a consciência de segurança e orientar pessoas e configurações na organização.
              </p>

              {/* ISO Cards */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {PSI_STANDARDS.norms.map((n) => (
                  <div
                    key={n.code}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-3.5"
                  >
                    <p className="font-mono text-xs font-bold text-cyan-300">{n.code}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-200">{n.focus}</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* PSI Switcher */}
              <div className="mt-5">
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-[#071225] p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setPsiView('components')}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      psiView === 'components'
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    4 Componentes da PSI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPsiView('routers')}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      psiView === 'routers'
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    Exemplo: PSI Roteadores
                  </button>
                  <button
                    type="button"
                    onClick={() => setPsiView('servers')}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      psiView === 'servers'
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    Exemplo: PSI Servidores (MFA)
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-slate-800 bg-[#071225] p-4">
                  {psiView === 'components' && (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {PSI_STANDARDS.components.map((comp) => (
                        <div
                          key={comp.name}
                          className="rounded-lg border border-slate-800/80 bg-[#0F1E36] p-3"
                        >
                          <p className="text-xs font-bold text-cyan-300">{comp.name}</p>
                          <p className="mt-1 text-xs text-slate-300">{comp.question}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {psiView === 'routers' && (
                    <ul className="space-y-2 text-xs text-slate-300">
                      {PSI_STANDARDS.routerPolicyRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-cyan-400">0{idx + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {psiView === 'servers' && (
                    <ul className="space-y-2 text-xs text-slate-300">
                      {PSI_STANDARDS.serverAuthPolicyRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-emerald-400">0{idx + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: ATAQUES, FLUXOS, INVASORES & ANATOMIA EM 9 ETAPAS          */}
      {/* ================================================================= */}
      {activeTab === 'attacks' && (
        <div className="space-y-6">
          {/* Interactive 4 Attack Flows SVG Visualizer */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-50">
                  Fluxos de Ataque vs. Atributo Violado
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Compare o fluxo normal com Interrupção, Interceptação, Modificação e Fabricação (ataques Passivos vs. Ativos).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ATTACK_FLOWS.map((flow) => (
                  <button
                    key={flow.id}
                    type="button"
                    onClick={() => setActiveFlowId(flow.id)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeFlowId === flow.id
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'border border-slate-800 bg-[#071225] text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {flow.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* SVG Diagram */}
              <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-[#050E1D] p-5 lg:col-span-6">
                <svg viewBox="0 0 460 220" className="w-full max-w-[440px]">
                  <defs>
                    <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#3BE37A" />
                    </marker>
                    <marker id="arrowRose" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#FB7185" />
                    </marker>
                  </defs>

                  {/* Origin Node */}
                  <circle cx="80" cy="70" r="30" fill="#0F1E36" stroke="#3BE37A" strokeWidth="2.5" />
                  <text x="80" y="75" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="bold">O</text>
                  <text x="80" y="28" textAnchor="middle" fill="#94A3B8" fontSize="11">Origem</text>

                  {/* Destination Node */}
                  <circle cx="380" cy="70" r="30" fill="#0F1E36" stroke="#34D399" strokeWidth="2.5" />
                  <text x="380" y="75" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="bold">D</text>
                  <text x="380" y="28" textAnchor="middle" fill="#94A3B8" fontSize="11">Destino</text>

                  {/* Flow variations */}
                  {activeFlow.id === 'normal' && (
                    <line
                      x1="112"
                      y1="70"
                      x2="342"
                      y2="70"
                      stroke="#3BE37A"
                      strokeWidth="3"
                      markerEnd="url(#arrowCyan)"
                    />
                  )}

                  {activeFlow.id === 'interrupcao' && (
                    <>
                      <line x1="112" y1="70" x2="215" y2="70" stroke="#FB7185" strokeWidth="3" />
                      <line x1="215" y1="54" x2="245" y2="86" stroke="#FB7185" strokeWidth="4" />
                      <line x1="245" y1="54" x2="215" y2="86" stroke="#FB7185" strokeWidth="4" />
                      <line
                        x1="255"
                        y1="70"
                        x2="344"
                        y2="70"
                        stroke="#334155"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                      />
                      <text x="230" y="120" textAnchor="middle" fill="#FDA4AF" fontSize="12" fontWeight="bold">
                        Canal Interrompido (DoS / Corte)
                      </text>
                    </>
                  )}

                  {activeFlow.id === 'interceptacao' && (
                    <>
                      <line
                        x1="112"
                        y1="70"
                        x2="342"
                        y2="70"
                        stroke="#3BE37A"
                        strokeWidth="3"
                        markerEnd="url(#arrowCyan)"
                      />
                      <line
                        x1="230"
                        y1="70"
                        x2="230"
                        y2="132"
                        stroke="#FB7185"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        markerEnd="url(#arrowRose)"
                      />
                      <circle cx="230" cy="168" r="28" fill="#4C0519" stroke="#FB7185" strokeWidth="2.5" />
                      <text x="230" y="173" textAnchor="middle" fill="#FFE4E6" fontSize="15" fontWeight="bold">I</text>
                      <text x="230" y="212" textAnchor="middle" fill="#FDA4AF" fontSize="11">
                        Intruso espiona sem alterar (Passivo)
                      </text>
                    </>
                  )}

                  {activeFlow.id === 'modificacao' && (
                    <>
                      <line
                        x1="112"
                        y1="70"
                        x2="344"
                        y2="70"
                        stroke="#334155"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M108 82 Q165 135 202 156"
                        fill="none"
                        stroke="#FB7185"
                        strokeWidth="2.5"
                        markerEnd="url(#arrowRose)"
                      />
                      <path
                        d="M258 156 Q295 135 348 84"
                        fill="none"
                        stroke="#FB7185"
                        strokeWidth="2.5"
                        markerEnd="url(#arrowRose)"
                      />
                      <circle cx="230" cy="168" r="28" fill="#4C0519" stroke="#FB7185" strokeWidth="2.5" />
                      <text x="230" y="173" textAnchor="middle" fill="#FFE4E6" fontSize="15" fontWeight="bold">M</text>
                      <text x="230" y="212" textAnchor="middle" fill="#FDA4AF" fontSize="11">
                        Intercepta e altera conteúdo (MITM)
                      </text>
                    </>
                  )}

                  {activeFlow.id === 'fabricacao' && (
                    <>
                      <path
                        d="M256 154 Q305 125 348 84"
                        fill="none"
                        stroke="#FB7185"
                        strokeWidth="3"
                        markerEnd="url(#arrowRose)"
                      />
                      <circle cx="230" cy="168" r="28" fill="#4C0519" stroke="#FB7185" strokeWidth="2.5" />
                      <text x="230" y="173" textAnchor="middle" fill="#FFE4E6" fontSize="15" fontWeight="bold">F</text>
                      <text x="230" y="212" textAnchor="middle" fill="#FDA4AF" fontSize="11">
                        Injeta mensagem forjada fingindo ser O
                      </text>
                    </>
                  )}
                </svg>
              </div>

              {/* Flow Metadata */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-[#071225] p-5 lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-slate-50">{activeFlow.title}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      activeFlow.attackClass === 'Normal'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35'
                        : activeFlow.attackClass === 'Passivo'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/35'
                    }`}
                  >
                    Classe: {activeFlow.attackClass}
                  </span>
                  <span className="rounded-md border border-slate-700 bg-[#0F1E36] px-2 py-0.5 text-[11px] text-slate-300">
                    {activeFlow.shireyGroup}
                  </span>
                </div>

                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
                  <strong>Atributo violado: </strong>
                  {activeFlow.violatedAttribute}
                </div>

                <p className="text-xs leading-relaxed text-slate-300">{activeFlow.description}</p>

                <div className="rounded-lg border border-slate-800 bg-[#0F1E36] p-3 text-xs text-slate-300">
                  <strong className="text-cyan-300">Exemplo prático: </strong>
                  {activeFlow.realExample}
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                  <strong className="text-emerald-300">Prevenção: </strong>
                  {activeFlow.prevention}
                </div>
              </div>
            </div>
          </section>

          {/* 9-Step Attack Anatomy Interactive Timeline */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <h3 className="text-lg font-bold text-slate-50">
              Anatomia de um Ataque — As 9 Etapas Clássicas
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Explore como um invasor evolui do reconhecimento inicial até a persistência ou negação de serviço — e como a defesa quebra cada elo.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {ATTACK_ANATOMY_STEPS.map((st) => (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setActiveAnatomyStep(st.step)}
                  className={`flex cursor-pointer flex-col items-start rounded-xl border p-2.5 text-left transition-colors ${
                    activeAnatomyStep === st.step
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                      : 'border-slate-800 bg-[#071225] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
                    0{st.step}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold leading-tight">
                    {st.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-[#071225] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    ETAPA 0{activeStepData.step} DE 09 · {activeStepData.englishName}
                  </span>
                  <h4 className="mt-0.5 text-base font-bold text-slate-50">
                    {activeStepData.name}
                  </h4>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={activeAnatomyStep === 1}
                    onClick={() => setActiveAnatomyStep((s) => Math.max(1, s - 1))}
                    className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={activeAnatomyStep === 9}
                    onClick={() => setActiveAnatomyStep((s) => Math.min(9, s + 1))}
                    className="cursor-pointer rounded-lg bg-cyan-400 px-3 py-1 text-xs font-semibold text-[#05131C] hover:bg-cyan-300 disabled:opacity-40 whitespace-nowrap"
                  >
                    Próxima Etapa
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                {activeStepData.summary}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-[#0F1E36] p-3.5">
                  <p className="text-[11px] font-bold text-amber-300">Técnicas Comuns</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {activeStepData.techniques.map((t, idx) => (
                      <li key={idx}>• {t}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0F1E36] p-3.5">
                  <p className="text-[11px] font-bold text-cyan-300">Ferramentas / Sinais</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeStepData.toolsOrSignals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="rounded border border-slate-700 bg-[#071225] px-2 py-0.5 font-mono text-[11px] text-slate-200"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <p className="text-[11px] font-bold text-emerald-300">Como Defender (Blue Team)</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/90">
                    {activeStepData.defense}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Attackers + TCP/IP Layer Vulnerabilities */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Attackers */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-5">
              <h3 className="text-base font-bold text-slate-50">
                Conhecendo os Invasores & Origem
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Ataques podem ter origem <strong className="text-slate-200">Externa</strong>, <strong className="text-slate-200">Interna</strong> ou ambas.
              </p>

              <div className="mt-4 space-y-3">
                {ATTACKER_PROFILES.map((prof) => (
                  <div
                    key={prof.id}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${
                          prof.accent === 'cyan'
                            ? 'text-cyan-300'
                            : prof.accent === 'rose'
                              ? 'text-rose-300'
                              : 'text-amber-300'
                        }`}
                      >
                        {prof.name}
                      </span>
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{prof.intent}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Nível técnico: {prof.skillLevel}</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-400">
                      {prof.traits.map((tr, idx) => (
                        <li key={idx}>• {tr}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* TCP/IP Vulnerabilities by Layer */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-7">
              <h3 className="text-base font-bold text-slate-50">
                Vulnerabilidades nas 4 Camadas do Modelo TCP/IP
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Clique em cada camada da pilha TCP/IP para inspecionar falhas críticas (SQLi, Travessia de Diretórios, Senhas Default, SYN Flood, ARP Poisoning).
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="flex flex-col gap-2 sm:col-span-4">
                  {TCPIP_VULNERABILITIES.map((layer, idx) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveVulnLayerId(layer.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                        activeVulnLayerId === layer.id
                          ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                          : 'border-slate-800 bg-[#071225] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-slate-400">
                        CAMADA {4 - idx}
                      </span>
                      <p className="text-xs font-bold">{layer.layer}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#071225] p-4 space-y-3 sm:col-span-8">
                  <div>
                    <h4 className="text-sm font-bold text-cyan-300">
                      Camada: {activeVulnLayer.layer}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-400">{activeVulnLayer.role}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-rose-300">Principais Ameaças</p>
                    <ul className="mt-1.5 space-y-1.5 text-xs text-slate-300">
                      {activeVulnLayer.threats.map((th, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                          <span>{th}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-[11px] font-bold text-emerald-300">Contramedidas</p>
                    <ul className="mt-1.5 space-y-1.5 text-xs text-emerald-100/90">
                      {activeVulnLayer.countermeasures.map((cm, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: MALWARE & LABORATÓRIO DE CRIPTOGRAFIA                      */}
      {/* ================================================================= */}
      {activeTab === 'malware-crypto' && (
        <div className="space-y-6">
          {/* Malware Catalog Explorer */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <h2 className="text-xl font-bold text-slate-50">
              Códigos Maliciosos (Malware) & Matriz Comparativa
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Programas desenvolvidos para executar ações danosas — clique em cada família para ver propagação, subtipos e comportamento.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {MALWARE_CATALOG.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMalwareId(m.id)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeMalwareId === m.id
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'border border-slate-800 bg-[#071225] text-slate-300 hover:text-slate-100'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-[#071225] p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-bold text-rose-300">{activeMalware.name}</h3>
                  <p className="text-xs text-slate-400">{activeMalware.tagline}</p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-200">
                {activeMalware.definition}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-[#0F1E36] p-3.5">
                  <p className="text-[11px] font-bold text-cyan-300">Como é obtido</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {activeMalware.howObtained.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0F1E36] p-3.5">
                  <p className="text-[11px] font-bold text-amber-300">Propagação</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {activeMalware.propagation}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0F1E36] p-3.5">
                  <p className="text-[11px] font-bold text-rose-300">Ações Maliciosas Comuns</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {activeMalware.commonActions.map((act, idx) => (
                      <li key={idx}>• {act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {activeMalware.subtypes && (
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {activeMalware.subtypes.map((sub, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800/80 bg-[#0D1322] p-3 text-xs"
                    >
                      <span className="font-bold text-amber-200">{sub.name}: </span>
                      <span className="text-slate-300">{sub.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comparative Matrix (Tabela 4.1) */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-[#071225]">
              <table className="w-full min-w-[660px] text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#0D1322] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Código Malicioso</th>
                    <th className="px-3 py-3 text-center font-semibold">Rede Automática</th>
                    <th className="px-3 py-3 text-center font-semibold">Via E-mail</th>
                    <th className="px-3 py-3 text-center font-semibold">Replica-se</th>
                    <th className="px-3 py-3 text-center font-semibold">Furta Dados</th>
                    <th className="px-3 py-3 text-center font-semibold">Retorno Invasor</th>
                    <th className="px-3 py-3 text-center font-semibold">Fica Oculto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {MALWARE_CATALOG.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setActiveMalwareId(m.id)}
                      className={`cursor-pointer transition-colors ${
                        activeMalwareId === m.id ? 'bg-cyan-400/10' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="px-4 py-2.5 font-semibold text-slate-100">{m.name}</td>
                      {[
                        m.matrix.autoNetwork,
                        m.matrix.byEmail,
                        m.matrix.selfReplicates,
                        m.matrix.stealsData,
                        m.matrix.remoteReturn,
                        m.matrix.hidesItself,
                      ].map((val, idx) => (
                        <td key={idx} className="px-3 py-2.5 text-center">
                          {val ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Interactive Cryptography Lab */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-50">
                  Laboratório de Criptografia (Cifra de César + Criptografia Moderna)
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Criptografia = <em className="text-slate-200">Cryptós</em> (oculto) + <em className="text-slate-200">Gráphein</em> (escrita). Experimente ao vivo o deslocamento do Código de César!
                </p>
              </div>
              <span className="font-mono text-xs text-cyan-300">
                B + {caesarShift} → {ALPHABET[(1 + caesarShift) % 26]}
              </span>
            </div>

            {/* Live Caesar Cipher Playground */}
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-[#071225] p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="caesar-input"
                      className="text-xs font-semibold text-slate-200"
                    >
                      Mensagem de Entrada
                    </label>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0F1E36] p-0.5">
                      <button
                        type="button"
                        onClick={() => setCaesarMode('encrypt')}
                        className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                          caesarMode === 'encrypt'
                            ? 'bg-cyan-400 text-[#05131C]'
                            : 'text-slate-400 hover:text-slate-100'
                        }`}
                      >
                        Cifrar (+{caesarShift})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCaesarMode('decrypt')}
                        className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                          caesarMode === 'decrypt'
                            ? 'bg-amber-400 text-[#05131C]'
                            : 'text-slate-400 hover:text-slate-100'
                        }`}
                      >
                        Decifrar (-{caesarShift})
                      </button>
                    </div>
                  </div>

                  <input
                    id="caesar-input"
                    type="text"
                    value={caesarText}
                    onChange={(e) => setCaesarText(e.target.value)}
                    placeholder="Digite uma mensagem para cifrar..."
                    className="w-full rounded-lg border border-slate-700 bg-[#050E1D] px-3.5 py-2.5 font-mono text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="caesar-shift"
                      className="text-xs font-medium text-slate-300 tabular-nums"
                    >
                      Chave (deslocamento): <strong className="font-mono text-cyan-300">{caesarShift}</strong>
                    </label>
                    <input
                      id="caesar-shift"
                      type="range"
                      min={1}
                      max={25}
                      value={caesarShift}
                      onChange={(e) => setCaesarShift(Number(e.target.value))}
                      className="flex-1 accent-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCaesarText(caesarResult);
                        setCaesarMode((m) => (m === 'encrypt' ? 'decrypt' : 'encrypt'));
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Inverter
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#050E1D] p-4 lg:col-span-5">
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-300">
                      Saída {caesarMode === 'encrypt' ? 'Cifrada' : 'Decifrada'}
                    </p>
                    <p className="mt-2 break-all font-mono text-base font-bold text-emerald-300">
                      {caesarResult || '—'}
                    </p>
                  </div>

                  <div className="mt-4 overflow-x-auto border-t border-slate-800 pt-2.5 font-mono text-[10px] leading-5">
                    <div className="text-slate-400 tracking-widest">{ALPHABET}</div>
                    <div className="text-cyan-300 tracking-widest">{shiftedAlphabet}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Pillars of Modern Cryptography */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {CRYPTO_CONCEPTS.map((cc) => (
                <div
                  key={cc.id}
                  className="rounded-xl border border-slate-800 bg-[#071225] p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-cyan-300" />
                      <h3 className="text-sm font-bold text-slate-100">{cc.title}</h3>
                    </div>
                    <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 whitespace-nowrap">
                      {cc.badge}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{cc.summary}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    <strong className="text-slate-200">Como funciona: </strong>
                    {cc.howItWorks}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cc.algorithms.map((alg) => (
                      <span
                        key={alg}
                        className="rounded border border-slate-700 bg-[#0F1E36] px-2 py-0.5 font-mono text-[11px] text-amber-200"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-slate-800/80 pt-2.5 text-[11px] text-emerald-300">
                    Garante: {cc.guarantees.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: DEFESAS DE PERÍMETRO, SEGURANÇA FÍSICA & RISCOS            */}
      {/* ================================================================= */}
      {activeTab === 'defenses-risk' && (
        <div className="space-y-6">
          {/* Perimeter Defenses */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-50">
                  Mecanismos de Proteção: Firewall, Proxy, IDS e SSL/TLS
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Segurança lógica pode atuar em <strong className="text-slate-200">Hosts</strong> (mais personalizada, porém trabalhosa) e na <strong className="text-slate-200">Rede</strong> (centralizada nos ativos de borda).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERIMETER_DEFENSES.map((def) => (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => setActiveDefenseId(def.id)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeDefenseId === def.id
                        ? 'bg-cyan-400 text-[#05131C]'
                        : 'border border-slate-800 bg-[#071225] text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {def.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-5 space-y-3 lg:col-span-7">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-300" />
                  <div>
                    <h3 className="text-base font-bold text-slate-50">{activeDefense.name}</h3>
                    <p className="text-xs text-slate-400">{activeDefense.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">
                  {activeDefense.definition}
                </p>

                <p className="rounded-lg border border-cyan-500/25 bg-[#0D1322] px-3.5 py-2 text-xs text-cyan-200">
                  <strong>Analogia: </strong>
                  {activeDefense.analogy}
                </p>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeDefense.functions.map((fn, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{fn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture Placement Visual */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#050E1D] p-5 lg:col-span-5">
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Onde atua na Arquitetura Corporativa
                  </p>
                  <p className="mt-1 text-xs text-cyan-300">{activeDefense.placement}</p>
                </div>

                <div className="my-4 grid grid-cols-3 items-center gap-2 text-center font-mono text-[11px]">
                  <div className="rounded-lg border border-slate-700 bg-[#0F1E36] p-3 text-slate-300">
                    <Network className="mx-auto h-4 w-4 text-cyan-300" />
                    <p className="mt-1 font-bold">LAN</p>
                    <p className="text-[10px] text-slate-500">Usuários</p>
                  </div>
                  <div className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-amber-200">
                    <ShieldCheck className="mx-auto h-4 w-4 text-amber-300" />
                    <p className="mt-1 font-bold">{activeDefense.name}</p>
                    <p className="text-[10px] text-amber-300/80">Controle / DMZ</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-[#0F1E36] p-3 text-slate-300">
                    <Server className="mx-auto h-4 w-4 text-rose-300" />
                    <p className="mt-1 font-bold">Internet</p>
                    <p className="text-[10px] text-slate-500">Rede Pública</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg border border-slate-800 bg-[#0F1E36] p-2.5 text-slate-300">
                    <strong className="text-cyan-300">Hosts:</strong> proteção personalizada por máquina (mais trabalhoso).
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0F1E36] p-2.5 text-slate-300">
                    <strong className="text-amber-300">Rede:</strong> proteção coletiva nos ativos (menos granular).
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Physical Security + Interactive Risk Calculator */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Physical & Environmental Security */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-6">
              <h3 className="text-base font-bold text-slate-50">
                Segurança Física & Ambiental de Datacenter
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Mesmo com firewall perfeito, um incêndio, inundação, falta de energia ou intruso físico pode parar toda a operação.
              </p>

              <div className="mt-4 space-y-4">
                {PHYSICAL_SECURITY_CATEGORIES.map((cat) => (
                  <div
                    key={cat.title}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-4 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-cyan-300">{cat.title}</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold text-rose-300">Ameaças</p>
                        <ul className="mt-1 space-y-1 text-xs text-slate-300">
                          {cat.threats.map((t, idx) => (
                            <li key={idx}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-300">Soluções</p>
                        <ul className="mt-1 space-y-1 text-xs text-slate-300">
                          {cat.solutions.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Risk Management Calculator */}
            <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6 lg:col-span-6">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-300" />
                <h3 className="text-base font-bold text-slate-50">
                  Calculadora de Gerenciamento de Riscos
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                “Você não pode se proteger de algo que não conhece.” Combine <strong className="text-slate-200">Valor do Bem × Vulnerabilidade × Ameaça</strong>.
              </p>

              <div className="mt-4 space-y-4 rounded-xl border border-slate-800 bg-[#071225] p-4">
                <div>
                  <label htmlFor="risk-asset" className="text-xs font-semibold text-slate-300">
                    Ativo (Bem) sob análise
                  </label>
                  <select
                    id="risk-asset"
                    value={riskAsset}
                    onChange={(e) => setRiskAsset(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#050E1D] px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Servidor de Notas / Banco de Dados">Servidor de Notas / Banco de Dados</option>
                    <option value="Roteador de Borda & Firewall">Roteador de Borda & Firewall</option>
                    <option value="Estação de Trabalho Administrativa">Estação de Trabalho Administrativa</option>
                    <option value="Sala de Servidores / Datacenter">Sala de Servidores / Datacenter</option>
                  </select>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Valor / Impacto do Ativo</span>
                      <span className="font-mono font-bold text-cyan-300 tabular-nums">{riskImpact}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={riskImpact}
                      onChange={(e) => setRiskImpact(Number(e.target.value))}
                      className="mt-1 w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Grau de Vulnerabilidade (Fraqueza)</span>
                      <span className="font-mono font-bold text-amber-300 tabular-nums">{riskVuln}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={riskVuln}
                      onChange={(e) => setRiskVuln(Number(e.target.value))}
                      className="mt-1 w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Probabilidade da Ameaça</span>
                      <span className="font-mono font-bold text-rose-300 tabular-nums">{riskProb}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={riskProb}
                      onChange={(e) => setRiskProb(Number(e.target.value))}
                      className="mt-1 w-full accent-rose-400"
                    />
                  </div>
                </div>

                <div className={`rounded-xl border p-3.5 ${riskMeta.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">
                      Nível de Risco ({riskAsset})
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums">
                      {riskScore}/125 · {riskMeta.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed opacity-90">{riskMeta.action}</p>
                </div>
              </div>

              {/* 4 Concentric Layers */}
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-200">
                  Camadas Concêntricas de Análise de Risco
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RISK_CONCENTRIC_LAYERS.map((item) => (
                    <div
                      key={item.layer}
                      className="rounded-lg border border-slate-800 bg-[#071225] p-2.5 text-xs"
                    >
                      <p className="font-semibold text-cyan-300">{item.layer}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 6: QUIZ INTERATIVO, MISSÕES CTF & BIBLIOGRAFIA                */}
      {/* ================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-50">
                  Simulado Diagnóstico — Segurança da Informação (10 Questões)
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Teste seus conhecimentos sobre Tríade CID, Fluxos de Ataque, Malware, Criptografia, Perímetro e Riscos.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-lg border border-slate-700 bg-[#071225] px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                  Acertos: {quizCorrectCount}/{INFOSEC_QUIZ.length} ({quizAnsweredCount} resp.)
                </span>
                <button
                  type="button"
                  onClick={() => setQuizAnswers({})}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Refazer
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {INFOSEC_QUIZ.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const hasAnswered = chosen !== undefined;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono font-bold text-cyan-300 tabular-nums">
                        Q{String(qIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded border border-slate-800 bg-[#0F1E36] px-2 py-0.5 text-slate-400">
                        {q.topic}
                      </span>
                    </div>

                    <p className="text-xs font-semibold leading-relaxed text-slate-100">
                      {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = chosen === optIdx;
                        const isRight = optIdx === q.correctIndex;
                        let cls =
                          'border-slate-800 bg-[#0F1E36] text-slate-300 hover:border-slate-600';
                        if (hasAnswered) {
                          if (isRight) {
                            cls =
                              'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-semibold';
                          } else if (isChosen && !isRight) {
                            cls = 'border-rose-500/60 bg-rose-500/15 text-rose-200';
                          } else {
                            cls = 'border-slate-800/60 bg-[#0B111E] text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${cls}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isRight && (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            )}
                            {hasAnswered && isChosen && !isRight && (
                              <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <p className="rounded-lg border border-slate-800 bg-[#0F1E36] px-3 py-2 text-[11px] leading-relaxed text-slate-300">
                        <strong className="text-cyan-300">Explicação: </strong>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Linked CTF Missions */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <h3 className="text-base font-bold text-slate-50">
              Aplicar na Prática — Missões CTF de Cibersegurança
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Coloque criptografia, hashes, auditoria de logs e defesa em ação no Circuito 03:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RELATED_CTF_IDS.map((mId) => {
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
          </section>

          {/* Bibliography */}
          <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-300" />
              <h3 className="text-base font-bold text-slate-50">
                Referências Bibliográficas da Disciplina
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <FileText className="h-3.5 w-3.5" />
                  Bibliografia Básica
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-300">
                  {BIBLIOGRAPHY_REFS.basic.map((ref, idx) => (
                    <li key={idx}>• {ref}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#071225] p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Layers className="h-3.5 w-3.5" />
                  Bibliografia Complementar & Normas
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-slate-300">
                  {BIBLIOGRAPHY_REFS.complementary.map((ref, idx) => (
                    <li key={idx}>• {ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
