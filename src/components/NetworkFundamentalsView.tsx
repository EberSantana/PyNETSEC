import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Cable,
  CheckCircle2,
  Eye,
  Globe,
  Network,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  NETWORK_TOPOLOGIES,
  NETWORK_TYPES,
  NetworkTypeItem,
  TopologyItem,
  TRANSMISSION_MEDIA,
  TransmissionMediumItem,
  TRANSMISSION_MODES,
  TransmissionModeItem,
} from '../data/networkFundamentals';
import { EverydayProtocolsModule } from './EverydayProtocolsModule';

type ModuleTab = 'types' | 'topologies' | 'media' | 'modes' | 'protocols';

interface NetworkFundamentalsViewProps {
  onOpenSandbox?: () => void;
}

const MODULE_TABS: { id: ModuleTab; label: string; subtitle: string; icon: typeof Globe }[] = [
  { id: 'types', label: 'Tipos de Rede', subtitle: 'PAN · LAN · WLAN · CAN · MAN · WAN · SAN · VPN', icon: Globe },
  { id: 'topologies', label: 'Topologias de Rede', subtitle: 'Estrela · Anel · Barramento · Árvore · Mesh · Híbrida', icon: Network },
  { id: 'media', label: 'Meios de Transmissão', subtitle: 'Guiados (cabo) e Não Guiados (sem fio)', icon: Cable },
  { id: 'modes', label: 'Modos de Transmissão', subtitle: 'Simplex · Half-Duplex · Full-Duplex', icon: ArrowLeftRight },
  { id: 'protocols', label: 'Protocolos no Dia a Dia', subtitle: 'HTTP/S · DNS · DHCP · SMB · F12 · Wireshark', icon: Eye },
];

export function NetworkFundamentalsView({ onOpenSandbox }: NetworkFundamentalsViewProps) {
  const [activeTab, setActiveTab] = useState<ModuleTab>('types');

  return (
    <div className="space-y-6">
      {/* 5-Module Switcher */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${
                isActive
                  ? 'border-cyan-400/70 bg-cyan-400/10'
                  : 'border-slate-800 bg-[#111827] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${isActive ? 'text-cyan-100' : 'text-slate-100'}`}>
                  {tab.label}
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-slate-400">
                {tab.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Interactive Module */}
      {activeTab === 'types' && <NetworkTypesModule />}
      {activeTab === 'topologies' && <TopologiesModule />}
      {activeTab === 'media' && <TransmissionMediaModule />}
      {activeTab === 'modes' && <TransmissionModesModule />}
      {activeTab === 'protocols' && <EverydayProtocolsModule onOpenSandbox={onOpenSandbox} />}
    </div>
  );
}

/* ============================================================================
 * 1. PRINCIPAIS TIPOS DE REDE (PAN, LAN, WLAN, CAN, MAN, WAN, SAN, VPN)
 * ========================================================================== */
function NetworkTypesModule() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<NetworkTypeItem['id']>('lan');
  const selected = NETWORK_TYPES.find((t) => t.id === selectedId) ?? NETWORK_TYPES[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 5 cols: Selector list */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-5">
        <h2 className="text-base font-bold text-slate-100">Principais Tipos de Rede</h2>
        <p className="mt-1 text-xs text-slate-400">
          Selecione um tipo para ver o alcance geográfico, a arquitetura animada e os casos reais de uso.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {NETWORK_TYPES.map((item) => {
            const isSelected = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/70 bg-cyan-400/12'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {item.acronym}
                    </span>
                    <span className="truncate text-xs font-medium text-slate-300">
                      {item.ptName}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {item.rangeLabel}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-slate-500">
                  {item.id === 'vpn' ? 'Túnel' : item.id === 'san' ? 'Storage' : `#${item.rangeMetersRank}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 7 cols: Animated Visual Stage + Details */}
      <div className="flex flex-col gap-5 lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-5 py-3.5">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {selected.acronym} · {selected.fullName}
              </span>
              <h3 className="text-lg font-bold text-slate-50">{selected.ptName}</h3>
            </div>
            <span className="font-mono text-xs text-emerald-300 tabular-nums">
              {selected.rangeLabel}
            </span>
          </div>

          {/* Animated SVG Illustration per Network Type */}
          <div className="bg-[#060911] p-4">
            <NetworkTypeSvg type={selected.id} reduced={Boolean(prefersReducedMotion)} />
            <p className="mt-2 text-center text-xs text-slate-400">{selected.diagramCaption}</p>
          </div>

          {/* Structured Specs */}
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] text-slate-500">ALCANCE TÍPICO</span>
                <span className="mt-0.5 block text-xs font-semibold text-cyan-200">
                  {selected.rangeLabel}
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] text-slate-500">DESEMPENHO / TECNOLOGIA</span>
                <span className="mt-0.5 block text-xs font-semibold text-emerald-200">
                  {selected.speedLabel}
                </span>
              </div>
            </div>

            <ul className="space-y-2 text-sm leading-relaxed text-slate-200">
              {selected.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-slate-800 bg-[#090D16] px-4 py-3 text-xs">
              <span className="font-mono text-[10px] font-semibold text-slate-500">EXEMPLOS PRÁTICOS</span>
              <p className="mt-1 text-slate-200">{selected.examples}</p>
            </div>
          </div>
        </div>

        {/* Scale Bar: PAN -> LAN -> CAN -> MAN -> WAN */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-100">Escala Geográfica das Redes</span>
            <span className="font-mono text-[11px] text-slate-400">10 m → Global</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(['pan', 'lan', 'wlan', 'can', 'man', 'wan'] as const).map((id) => {
              const info = NETWORK_TYPES.find((t) => t.id === id)!;
              const isCurrent = selected.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={`cursor-pointer rounded-lg border px-2 py-2 text-center transition-colors ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                      : 'border-slate-800 bg-[#090D16] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{info.acronym}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    {id === 'pan'
                      ? '≤ 10 m'
                      : id === 'lan'
                        ? 'Sala/Casa'
                        : id === 'wlan'
                          ? 'Wi-Fi'
                          : id === 'can'
                            ? 'Campus'
                            : id === 'man'
                              ? 'Cidade'
                              : 'Mundo'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkTypeSvg({ type, reduced }: { type: NetworkTypeItem['id']; reduced: boolean }) {
  const pulseAnim = reduced ? undefined : { cx: [110, 490], opacity: [0.3, 1, 0.3] };

  if (type === 'vpn') {
    return (
      <svg viewBox="0 0 600 180" className="h-auto w-full select-none" role="img" aria-label="Diagrama VPN">
        <rect width="600" height="180" fill="#060911" rx="10" />
        {/* Public internet cloud box */}
        <rect x="190" y="34" width="220" height="112" rx="16" fill="#170E1A" stroke="#FB7185" strokeDasharray="5 4" strokeOpacity="0.6" />
        <text x="300" y="54" textAnchor="middle" fill="#FDA4AF" fontSize="10" fontFamily="JetBrains Mono, monospace">
          INTERNET PÚBLICA (NÃO CONFIÁVEL)
        </text>
        {/* Encrypted tunnel cylinder */}
        <rect x="145" y="76" width="310" height="36" rx="18" fill="#06283D" stroke="#22D3EE" strokeWidth="2" />
        <text x="300" y="98" textAnchor="middle" fill="#A5F3FC" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          TÚNEL CRIPTOGRAFADO (AES / TLS)
        </text>
        {!reduced && (
          <motion.circle
            cy="94"
            r="5"
            fill="#10B981"
            initial={{ cx: 155 }}
            animate={{ cx: [155, 445] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Left Remote User */}
        <rect x="26" y="64" width="110" height="60" rx="10" fill="#0C1424" stroke="#22D3EE" />
        <text x="81" y="90" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">Usuário Remoto</text>
        <text x="81" y="108" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">Cliente VPN</text>
        {/* Right Corporate Server */}
        <rect x="464" y="64" width="110" height="60" rx="10" fill="#0C1424" stroke="#10B981" />
        <text x="519" y="90" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">Rede Empresa</text>
        <text x="519" y="108" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">Gateway VPN</text>
      </svg>
    );
  }

  if (type === 'pan') {
    return (
      <svg viewBox="0 0 600 180" className="h-auto w-full select-none" role="img" aria-label="Diagrama PAN">
        <rect width="600" height="180" fill="#060911" rx="10" />
        <circle cx="300" cy="90" r="72" fill="#082F49" fillOpacity="0.22" stroke="#22D3EE" strokeDasharray="4 4" strokeOpacity="0.5" />
        <text x="300" y="172" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono, monospace">
          RAIO DE ALCANCE: ATÉ 10 METROS (BLUETOOTH)
        </text>
        <line x1="170" y1="90" x2="300" y2="90" stroke="#22D3EE" strokeDasharray="4 3" />
        <line x1="300" y1="90" x2="430" y2="62" stroke="#22D3EE" strokeDasharray="4 3" />
        <line x1="300" y1="90" x2="430" y2="118" stroke="#22D3EE" strokeDasharray="4 3" />
        {!reduced && (
          <motion.circle
            cy="90"
            r="4.5"
            fill="#22D3EE"
            animate={{ cx: [175, 295] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
        <rect x="255" y="65" width="90" height="50" rx="10" fill="#0C1424" stroke="#22D3EE" strokeWidth="1.8" />
        <text x="300" y="94" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">Smartphone</text>
        <rect x="92" y="68" width="84" height="44" rx="9" fill="#0C1424" stroke="#38BDF8" />
        <text x="134" y="94" textAnchor="middle" fill="#E2E8F0" fontSize="10.5">Fone BT</text>
        <rect x="424" y="40" width="96" height="40" rx="9" fill="#0C1424" stroke="#38BDF8" />
        <text x="472" y="64" textAnchor="middle" fill="#E2E8F0" fontSize="10.5">Smartwatch</text>
        <rect x="424" y="100" width="96" height="40" rx="9" fill="#0C1424" stroke="#38BDF8" />
        <text x="472" y="124" textAnchor="middle" fill="#E2E8F0" fontSize="10.5">Teclado BT</text>
      </svg>
    );
  }

  if (type === 'san') {
    return (
      <svg viewBox="0 0 600 180" className="h-auto w-full select-none" role="img" aria-label="Diagrama SAN">
        <rect width="600" height="180" fill="#060911" rx="10" />
        <line x1="150" y1="60" x2="260" y2="90" stroke="#10B981" strokeWidth="2" />
        <line x1="150" y1="120" x2="260" y2="90" stroke="#10B981" strokeWidth="2" />
        <line x1="340" y1="90" x2="450" y2="55" stroke="#22D3EE" strokeWidth="2" />
        <line x1="340" y1="90" x2="450" y2="90" stroke="#22D3EE" strokeWidth="2" />
        <line x1="340" y1="90" x2="450" y2="125" stroke="#22D3EE" strokeWidth="2" />
        {!reduced && (
          <motion.circle
            cy="90"
            r="5"
            fill="#10B981"
            animate={{ cx: [155, 445] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <rect x="40" y="38" width="110" height="40" rx="8" fill="#0C1424" stroke="#10B981" />
        <text x="95" y="62" textAnchor="middle" fill="#F1F5F9" fontSize="10.5" fontWeight="700">Servidor Web</text>
        <rect x="40" y="102" width="110" height="40" rx="8" fill="#0C1424" stroke="#10B981" />
        <text x="95" y="126" textAnchor="middle" fill="#F1F5F9" fontSize="10.5" fontWeight="700">Servidor BD</text>
        <rect x="255" y="64" width="90" height="52" rx="10" fill="#083344" stroke="#22D3EE" strokeWidth="1.8" />
        <text x="300" y="88" textAnchor="middle" fill="#A5F3FC" fontSize="10.5" fontWeight="700">Fabric SAN</text>
        <text x="300" y="103" textAnchor="middle" fill="#67E8F9" fontSize="9" fontFamily="JetBrains Mono, monospace">Fibre Channel</text>
        {[40, 75, 110].map((y, idx) => (
          <g key={y}>
            <rect x="450" y={y} width="112" height="28" rx="6" fill="#0C1424" stroke="#22D3EE" />
            <text x="506" y={y + 18} textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="JetBrains Mono, monospace">
              Storage Array #{idx + 1}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // Generic crisp multi-node diagram for LAN, WLAN, CAN, MAN, WAN
  const labelsByType: Record<string, { left: string; mid: string; right: string; badge: string }> = {
    lan: { left: 'Estações (PCs)', mid: 'Switch Ethernet', right: 'Servidor Local', badge: 'CABO PAR TRANÇADO · ALTA VELOCIDADE' },
    wlan: { left: 'Notebooks / Celulares', mid: 'Access Point (Wi-Fi)', right: 'Roteador LAN', badge: 'SEM FIO · IEEE 802.11 (2.4 / 5 GHz)' },
    can: { left: 'Prédio Informática', mid: 'Backbone Campus', right: 'Prédio Biblioteca', badge: 'FIBRA ÓPTICA ENTRE PRÉDIOS PRÓXIMOS' },
    man: { left: 'Filial Centro', mid: 'Anel Metropolitano', right: 'Filial Zona Norte', badge: 'COBERTURA MUNICIPAL · DEZENAS DE KM' },
    wan: { left: 'Rede Brasil (LAN)', mid: 'Internet / Roteadores', right: 'Servidor Europa', badge: 'CABOS SUBMARINOS / SATÉLITE · GLOBAL' },
  };
  const cfg = labelsByType[type] ?? labelsByType.lan;

  return (
    <svg viewBox="0 0 600 180" className="h-auto w-full select-none" role="img" aria-label={`Diagrama ${type}`}>
      <rect width="600" height="180" fill="#060911" rx="10" />
      <line x1="150" y1="90" x2="450" y2="90" stroke="#1E293B" strokeWidth="4" />
      <line
        x1="150"
        y1="90"
        x2="450"
        y2="90"
        stroke="#22D3EE"
        strokeWidth="2"
        strokeDasharray={type === 'wlan' ? '5 5' : undefined}
        opacity="0.7"
      />
      {pulseAnim && (
        <motion.circle
          cy="90"
          r="6"
          fill="#22D3EE"
          animate={pulseAnim}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <rect x="26" y="62" width="132" height="56" rx="10" fill="#0C1424" stroke="#22D3EE" />
      <text x="92" y="94" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">{cfg.left}</text>

      <rect x="230" y="56" width="140" height="68" rx="12" fill="#083344" stroke="#38BDF8" strokeWidth="1.8" />
      <text x="300" y="94" textAnchor="middle" fill="#E0F2FE" fontSize="11" fontWeight="700">{cfg.mid}</text>

      <rect x="442" y="62" width="132" height="56" rx="10" fill="#0C1424" stroke="#10B981" />
      <text x="508" y="94" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">{cfg.right}</text>

      <text x="300" y="160" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono, monospace">
        {cfg.badge}
      </text>
    </svg>
  );
}

/* ============================================================================
 * 2. TIPOS DE TOPOLOGIA DE REDE (INTERATIVE FAULT SIMULATION)
 * ========================================================================== */
function TopologiesModule() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<TopologyItem['id']>('star');
  const [failedNode, setFailedNode] = useState<string | null>(null);

  const selected = NETWORK_TOPOLOGIES.find((t) => t.id === selectedId) ?? NETWORK_TOPOLOGIES[0];

  const handleSelectTopology = (id: TopologyItem['id']) => {
    setSelectedId(id);
    setFailedNode(null);
  };

  const toggleNodeFault = (nodeId: string) => {
    setFailedNode((prev) => (prev === nodeId ? null : nodeId));
  };

  // Compute human-readable real-time impact message when a failure is simulated
  const faultImpact = (() => {
    if (!failedNode) {
      return {
        tone: 'ok' as const,
        text: `Rede operando normalmente. ${selected.faultTip}`,
      };
    }
    if (selected.id === 'star') {
      if (failedNode === 'HUB') {
        return {
          tone: 'critical' as const,
          text: 'FALHA TOTAL: O Switch central parou! Como todos dependem dele, nenhum dispositivo consegue se comunicar.',
        };
      }
      return {
        tone: 'partial' as const,
        text: `FALHA ISOLADA: Apenas ${failedNode} ficou fora do ar. Todos os outros computadores continuam se comunicando normalmente pelo Switch!`,
      };
    }
    if (selected.id === 'ring') {
      return {
        tone: 'critical' as const,
        text: `ANEL INTERROMPIDO: A falha em ${failedNode} abriu o circuito fechado — o tráfego em anel simples parou para toda a rede.`,
      };
    }
    if (selected.id === 'bus') {
      if (failedNode === 'BUS') {
        return {
          tone: 'critical' as const,
          text: 'BARRAMENTO ROMPIDO: O cabo principal foi cortado! Todos os dispositivos perderam o sinal simultaneamente.',
        };
      }
      return {
        tone: 'partial' as const,
        text: `Nó ${failedNode} desconectado. Os outros continuam no barramento, mas sujeitos a congestionamento no canal único.`,
      };
    }
    if (selected.id === 'tree') {
      if (failedNode === 'ROOT') {
        return {
          tone: 'critical' as const,
          text: 'SWITCH RAIZ CAIU: Os dois departamentos perderam comunicação entre si, embora ainda tenham links locais.',
        };
      }
      if (failedNode === 'SW1' || failedNode === 'SW2') {
        return {
          tone: 'partial' as const,
          text: `SUB-REDE ISOLADA: O ramo do ${failedNode} caiu, mas o outro departamento continua operando normalmente!`,
        };
      }
      return {
        tone: 'partial' as const,
        text: `FALHA ISOLADA: Apenas a estação ${failedNode} caiu; a hierarquia da árvore permanece intacta.`,
      };
    }
    if (selected.id === 'mesh') {
      return {
        tone: 'resilient' as const,
        text: `TOLERÂNCIA A FALHAS ATIVA: ${failedNode} falhou, mas os demais nós continuam 100% conectados usando os enlaces redundantes da malha!`,
      };
    }
    // hybrid
    if (failedNode === 'RING') {
      return {
        tone: 'partial' as const,
        text: 'SETOR EM ANEL PAROU: O departamento em anel foi interrompido, mas o departamento em Estrela continua funcionando!',
      };
    }
    if (failedNode === 'SW') {
      return {
        tone: 'partial' as const,
        text: 'SETOR EM ESTRELA PAROU: O switch da Estrela caiu, mas o setor em Anel mantém sua comunicação interna.',
      };
    }
    return {
      tone: 'partial' as const,
      text: `Nó ${failedNode} falhou dentro do modelo híbrido — o impacto depende da topologia do setor onde ocorreu a falha.`,
    };
  })();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 4 cols: 6 Topologies Selector */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-4">
        <h2 className="text-base font-bold text-slate-100">Topologias de Rede</h2>
        <p className="mt-1 text-xs text-slate-400">
          Escolha uma topologia e clique nos equipamentos do diagrama para simular falhas reais.
        </p>

        <div className="mt-4 space-y-2">
          {NETWORK_TOPOLOGIES.map((topo) => {
            const isSelected = topo.id === selected.id;
            return (
              <button
                key={topo.id}
                type="button"
                onClick={() => handleSelectTopology(topo.id)}
                className={`w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/70 bg-cyan-400/12'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div className={`text-xs font-bold ${isSelected ? 'text-cyan-200' : 'text-slate-100'}`}>
                  {topo.name}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">{topo.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 8 cols: Interactive Fault Simulator Canvas + Pros/Cons */}
      <div className="flex flex-col gap-5 lg:col-span-8">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-5 py-3.5">
            <div>
              <h3 className="text-base font-bold text-slate-50">{selected.name}</h3>
              <p className="text-xs text-slate-400">{selected.subtitle}</p>
            </div>
            {failedNode && (
              <button
                type="button"
                onClick={() => setFailedNode(null)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar rede
              </button>
            )}
          </div>

          {/* Interactive SVG Topology Stage */}
          <div className="bg-[#060911] p-4">
            <TopologyInteractiveSvg
              topology={selected.id}
              failedNode={failedNode}
              onToggleFault={toggleNodeFault}
              reduced={Boolean(prefersReducedMotion)}
            />

            {/* Live Impact Banner */}
            <div
              className={`mt-3 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
                faultImpact.tone === 'critical'
                  ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                  : faultImpact.tone === 'partial'
                    ? 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                    : faultImpact.tone === 'resilient'
                      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-[#090D16] text-slate-300'
              }`}
            >
              {faultImpact.tone === 'critical' ? (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              ) : faultImpact.tone === 'partial' ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <span>{faultImpact.text}</span>
            </div>
          </div>

          {/* Description + Pros / Cons */}
          <div className="space-y-4 p-5">
            <p className="text-sm leading-relaxed text-slate-200">{selected.description}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                <span className="font-mono text-[10px] font-bold text-emerald-300">VANTAGENS</span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-200">
                  {selected.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3.5">
                <span className="font-mono text-[10px] font-bold text-rose-300">DESVANTAGENS</span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-200">
                  {selected.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#090D16] px-4 py-2.5 text-xs text-slate-300">
              <span className="font-semibold text-cyan-300">Onde é usada: </span>
              {selected.realWorldUse}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopologyInteractiveSvg({
  topology,
  failedNode,
  onToggleFault,
  reduced,
}: {
  topology: TopologyItem['id'];
  failedNode: string | null;
  onToggleFault: (id: string) => void;
  reduced: boolean;
}) {
  const renderNode = (
    id: string,
    x: number,
    y: number,
    label: string,
    isCentral = false,
    isDown = false
  ) => (
    <g
      key={id}
      transform={`translate(${x}, ${y})`}
      onClick={() => onToggleFault(id)}
      className="cursor-pointer"
    >
      <circle
        r={isCentral ? 26 : 20}
        fill={isDown ? '#3F0A18' : isCentral ? '#083344' : '#0C1424'}
        stroke={isDown ? '#FB7185' : isCentral ? '#22D3EE' : '#10B981'}
        strokeWidth={isCentral ? 2.2 : 1.6}
      />
      <text
        y={isDown ? -1 : 4}
        textAnchor="middle"
        fill={isDown ? '#FDA4AF' : '#F1F5F9'}
        fontSize="10"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {label}
      </text>
      {isDown && (
        <text
          y="10"
          textAnchor="middle"
          fill="#FB7185"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
        >
          FALHA
        </text>
      )}
    </g>
  );

  if (topology === 'star') {
    const hubDown = failedNode === 'HUB';
    const leaves = [
      { id: 'PC1', x: 140, y: 55 },
      { id: 'PC2', x: 460, y: 55 },
      { id: 'PC3', x: 140, y: 185 },
      { id: 'PC4', x: 460, y: 185 },
      { id: 'PC5', x: 300, y: 210 },
    ];
    return (
      <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
        {leaves.map((n) => {
          const linkDead = hubDown || failedNode === n.id;
          return (
            <line
              key={n.id}
              x1={300}
              y1={115}
              x2={n.x}
              y2={n.y}
              stroke={linkDead ? '#FB7185' : '#22D3EE'}
              strokeWidth="2"
              strokeDasharray={linkDead ? '4 4' : undefined}
              opacity={linkDead ? 0.5 : 0.8}
            />
          );
        })}
        {!reduced && !hubDown && failedNode !== 'PC1' && failedNode !== 'PC2' && (
          <motion.circle
            r="5"
            fill="#22D3EE"
            animate={{ cx: [140, 300, 460], cy: [55, 115, 55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {renderNode('HUB', 300, 115, 'SWITCH', true, hubDown)}
        {leaves.map((n) => renderNode(n.id, n.x, n.y, n.id, false, hubDown || failedNode === n.id))}
      </svg>
    );
  }

  if (topology === 'ring') {
    const ringBroken = Boolean(failedNode);
    const pts = [
      { id: 'PC1', x: 300, y: 36 },
      { id: 'PC2', x: 440, y: 88 },
      { id: 'PC3', x: 390, y: 196 },
      { id: 'PC4', x: 210, y: 196 },
      { id: 'PC5', x: 160, y: 88 },
    ];
    return (
      <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
        {pts.map((p, idx) => {
          const next = pts[(idx + 1) % pts.length];
          return (
            <line
              key={p.id}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={ringBroken ? '#FB7185' : '#22D3EE'}
              strokeWidth="2.2"
              strokeDasharray={ringBroken ? '5 4' : undefined}
              opacity={ringBroken ? 0.5 : 0.85}
            />
          );
        })}
        {!reduced && !ringBroken && (
          <motion.circle
            r="5"
            fill="#10B981"
            animate={{
              cx: [300, 440, 390, 210, 160, 300],
              cy: [36, 88, 196, 196, 88, 36],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {pts.map((p) => renderNode(p.id, p.x, p.y, p.id, false, failedNode === p.id || ringBroken))}
      </svg>
    );
  }

  if (topology === 'bus') {
    const busBroken = failedNode === 'BUS';
    const pcs = [
      { id: 'PC1', x: 120, y: 58 },
      { id: 'PC2', x: 240, y: 184 },
      { id: 'PC3', x: 360, y: 58 },
      { id: 'PC4', x: 480, y: 184 },
    ];
    return (
      <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
        {/* Main clickable backbone */}
        <g onClick={() => onToggleFault('BUS')} className="cursor-pointer">
          <rect x="46" y="110" width="14" height="22" rx="3" fill="#475569" />
          <rect x="540" y="110" width="14" height="22" rx="3" fill="#475569" />
          <line
            x1="60"
            y1="121"
            x2="540"
            y2="121"
            stroke={busBroken ? '#FB7185' : '#FBBF24'}
            strokeWidth="5"
            strokeDasharray={busBroken ? '10 6' : undefined}
          />
          <text
            x="300"
            y="141"
            textAnchor="middle"
            fill={busBroken ? '#FDA4AF' : '#FDE68A'}
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            {busBroken ? 'BARRAMENTO CORTADO (CLIQUE PARA RESTAURAR)' : 'BARRAMENTO PRINCIPAL (CLIQUE PARA SIMULAR CORTE)'}
          </text>
        </g>
        {pcs.map((pc) => (
          <line
            key={pc.id}
            x1={pc.x}
            y1={pc.y}
            x2={pc.x}
            y2={121}
            stroke={busBroken || failedNode === pc.id ? '#FB7185' : '#94A3B8'}
            strokeWidth="2"
          />
        ))}
        {!reduced && !busBroken && (
          <motion.circle
            cy="121"
            r="5.5"
            fill="#22D3EE"
            animate={{ cx: [120, 480] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        )}
        {pcs.map((pc) => renderNode(pc.id, pc.x, pc.y, pc.id, false, busBroken || failedNode === pc.id))}
      </svg>
    );
  }

  if (topology === 'tree') {
    const rootDown = failedNode === 'ROOT';
    const sw1Down = rootDown || failedNode === 'SW1';
    const sw2Down = rootDown || failedNode === 'SW2';
    return (
      <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
        <line x1="300" y1="42" x2="170" y2="112" stroke={sw1Down ? '#FB7185' : '#22D3EE'} strokeWidth="2.2" />
        <line x1="300" y1="42" x2="430" y2="112" stroke={sw2Down ? '#FB7185' : '#22D3EE'} strokeWidth="2.2" />
        <line x1="170" y1="112" x2="105" y2="195" stroke={sw1Down || failedNode === 'PC1' ? '#FB7185' : '#10B981'} strokeWidth="1.8" />
        <line x1="170" y1="112" x2="235" y2="195" stroke={sw1Down || failedNode === 'PC2' ? '#FB7185' : '#10B981'} strokeWidth="1.8" />
        <line x1="430" y1="112" x2="365" y2="195" stroke={sw2Down || failedNode === 'PC3' ? '#FB7185' : '#10B981'} strokeWidth="1.8" />
        <line x1="430" y1="112" x2="495" y2="195" stroke={sw2Down || failedNode === 'PC4' ? '#FB7185' : '#10B981'} strokeWidth="1.8" />
        {!reduced && !rootDown && !sw1Down && !sw2Down && (
          <motion.circle
            r="5"
            fill="#22D3EE"
            animate={{ cx: [105, 170, 300, 430, 495], cy: [195, 112, 42, 112, 195] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {renderNode('ROOT', 300, 42, 'RAIZ', true, rootDown)}
        {renderNode('SW1', 170, 112, 'SW-A', true, sw1Down)}
        {renderNode('SW2', 430, 112, 'SW-B', true, sw2Down)}
        {renderNode('PC1', 105, 195, 'PC1', false, sw1Down || failedNode === 'PC1')}
        {renderNode('PC2', 235, 195, 'PC2', false, sw1Down || failedNode === 'PC2')}
        {renderNode('PC3', 365, 195, 'PC3', false, sw2Down || failedNode === 'PC3')}
        {renderNode('PC4', 495, 195, 'PC4', false, sw2Down || failedNode === 'PC4')}
      </svg>
    );
  }

  if (topology === 'mesh') {
    const nodes = [
      { id: 'N1', x: 300, y: 36 },
      { id: 'N2', x: 455, y: 98 },
      { id: 'N3', x: 395, y: 204 },
      { id: 'N4', x: 205, y: 204 },
      { id: 'N5', x: 145, y: 98 },
    ];
    const edges: Array<[typeof nodes[0], typeof nodes[0]]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        edges.push([nodes[i], nodes[j]]);
      }
    }
    // Dynamic reroute path avoiding failed node
    const route =
      failedNode === 'N1'
        ? { cx: [145, 205, 395, 455], cy: [98, 204, 204, 98] }
        : { cx: [145, 300, 455], cy: [98, 36, 98] };

    return (
      <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
        {edges.map(([a, b]) => {
          const dead = failedNode === a.id || failedNode === b.id;
          return (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={dead ? '#475569' : '#22D3EE'}
              strokeWidth={dead ? 1 : 1.7}
              strokeDasharray={dead ? '3 4' : undefined}
              opacity={dead ? 0.35 : 0.7}
            />
          );
        })}
        {!reduced && (
          <motion.circle
            r="5.5"
            fill="#10B981"
            animate={route}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {nodes.map((n) => renderNode(n.id, n.x, n.y, n.id, false, failedNode === n.id))}
      </svg>
    );
  }

  // Hybrid (Star on Left + Ring on Right)
  const swDown = failedNode === 'SW';
  const ringDown = failedNode === 'RING';
  return (
    <svg viewBox="0 0 600 245" className="h-auto w-full select-none">
      {/* Backbone between Star and Ring */}
      <line x1="165" y1="120" x2="365" y2="120" stroke={swDown || ringDown ? '#FB7185' : '#FBBF24'} strokeWidth="2.5" />
      {/* Star side */}
      <line x1="165" y1="120" x2="80" y2="55" stroke={swDown ? '#FB7185' : '#22D3EE'} strokeWidth="1.8" />
      <line x1="165" y1="120" x2="80" y2="185" stroke={swDown ? '#FB7185' : '#22D3EE'} strokeWidth="1.8" />
      <line x1="165" y1="120" x2="165" y2="42" stroke={swDown ? '#FB7185' : '#22D3EE'} strokeWidth="1.8" />
      {/* Ring side */}
      <polygon
        points="365,120 450,55 520,120 450,185"
        fill="none"
        stroke={ringDown ? '#FB7185' : '#10B981'}
        strokeWidth="2"
        strokeDasharray={ringDown ? '4 4' : undefined}
      />
      {!reduced && !swDown && !ringDown && (
        <motion.circle
          r="5"
          fill="#22D3EE"
          animate={{ cx: [80, 165, 365, 450, 520], cy: [55, 120, 120, 55, 120] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <text x="125" y="226" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
        SETOR A · ESTRELA
      </text>
      <text x="445" y="226" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
        SETOR B · ANEL
      </text>
      {renderNode('SW', 165, 120, 'SWITCH', true, swDown)}
      {renderNode('E1', 80, 55, 'PC1', false, swDown || failedNode === 'E1')}
      {renderNode('E2', 80, 185, 'PC2', false, swDown || failedNode === 'E2')}
      {renderNode('E3', 165, 42, 'PC3', false, swDown || failedNode === 'E3')}
      {renderNode('RING', 365, 120, 'R1', true, ringDown)}
      {renderNode('R2', 450, 55, 'R2', false, ringDown)}
      {renderNode('R3', 520, 120, 'R3', false, ringDown)}
      {renderNode('R4', 450, 185, 'R4', false, ringDown)}
    </svg>
  );
}

/* ============================================================================
 * 3. MEIOS DE COMUNICAÇÃO / TRANSMISSÃO (GUIADOS vs NÃO GUIADOS)
 * ========================================================================== */
function TransmissionMediaModule() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<TransmissionMediumItem['id']>('twisted-pair');
  const [obstacleOn, setObstacleOn] = useState(false);

  const selected = TRANSMISSION_MEDIA.find((m) => m.id === selectedId) ?? TRANSMISSION_MEDIA[0];
  const guided = TRANSMISSION_MEDIA.filter((m) => m.category === 'guided');
  const unguided = TRANSMISSION_MEDIA.filter((m) => m.category === 'unguided');

  const signalBlocked = obstacleOn && !selected.passesObstacles;
  const signalDegraded = obstacleOn && selected.passesObstacles && selected.emiImmunity !== 'Alta (Imune)';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left 5 cols: Guided + Unguided Selector */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-5">
        <div>
          <h2 className="text-base font-bold text-slate-100">Meios de Transmissão</h2>
          <p className="mt-1 text-xs text-slate-400">
            Caminhos físicos (guiados) ou sem fio (não guiados) por onde os sinais de dados viajam.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300">
            <Cable className="h-3.5 w-3.5" />
            MEIOS GUIADOS (COM FIO)
          </div>
          <div className="space-y-1.5">
            {guided.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  selected.id === m.id
                    ? 'border-cyan-400/70 bg-cyan-400/12'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">{m.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{m.emiImmunity}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{m.connectorOrBand}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-300">
            <Wifi className="h-3.5 w-3.5" />
            MEIOS NÃO GUIADOS (SEM FIO)
          </div>
          <div className="space-y-1.5">
            {unguided.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  selected.id === m.id
                    ? 'border-emerald-400/70 bg-emerald-400/12'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">{m.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {m.passesObstacles ? 'Atravessa paredes' : 'Linha de visada'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{m.connectorOrBand}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right 7 cols: Interactive Signal Propagation Simulator */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
          <div>
            <span className="font-mono text-[11px] text-cyan-300">
              {selected.category === 'guided' ? 'MEIO GUIADO (COM FIO)' : 'MEIO NÃO GUIADO (SEM FIO)'}
            </span>
            <h3 className="text-base font-bold text-slate-50">{selected.name}</h3>
          </div>

          <button
            type="button"
            onClick={() => setObstacleOn((v) => !v)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              obstacleOn
                ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                : 'border-slate-700 bg-[#090D16] text-slate-200 hover:border-amber-400/50'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {obstacleOn
              ? selected.category === 'guided'
                ? 'Ruído Eletromagnético ATIVO'
                : 'Parede / Obstáculo ATIVO'
              : selected.category === 'guided'
                ? 'Testar Ruído Eletromagnético'
                : 'Colocar Parede no Caminho'}
          </button>
        </div>

        {/* Signal Propagation SVG */}
        <div className="bg-[#060911] p-4">
          <svg viewBox="0 0 600 175" className="h-auto w-full select-none" role="img" aria-label={`Simulação ${selected.name}`}>
            {/* Emitter & Receiver */}
            <rect x="24" y="58" width="96" height="58" rx="10" fill="#0C1424" stroke="#22D3EE" />
            <text x="72" y="90" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">Emissor</text>
            <rect x="480" y="58" width="96" height="58" rx="10" fill="#0C1424" stroke={signalBlocked ? '#FB7185' : '#10B981'} />
            <text x="528" y="90" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">Receptor</text>

            {/* Conduit / Medium line */}
            {selected.category === 'guided' ? (
              <rect
                x="120"
                y="74"
                width="360"
                height="26"
                rx="6"
                fill={selected.id === 'fiber' ? '#082F49' : '#0F172A'}
                stroke={selected.id === 'fiber' ? '#38BDF8' : '#475569'}
              />
            ) : (
              <line x1="120" y1="87" x2="480" y2="87" stroke="#1E293B" strokeDasharray="4 6" strokeWidth="2" />
            )}

            {/* Animated Signal Wave / Light / Radio Beam */}
            {!prefersReducedMotion && (
              <motion.circle
                cy="87"
                r={selected.id === 'fiber' ? 6 : 7}
                fill={
                  signalBlocked
                    ? '#FB7185'
                    : selected.id === 'fiber'
                      ? '#38BDF8'
                      : selected.id === 'infrared'
                        ? '#FB7185'
                        : signalDegraded
                          ? '#FBBF24'
                          : '#10B981'
                }
                animate={{
                  cx: signalBlocked ? [130, 290] : [130, 470],
                  opacity: signalBlocked ? [1, 1, 0] : [0.4, 1, 0.4],
                }}
                transition={{ duration: selected.id === 'fiber' ? 0.9 : 1.8, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Obstacle / EMI Visual */}
            {obstacleOn && (
              <g>
                {selected.category === 'guided' ? (
                  <>
                    <rect x="255" y="20" width="90" height="34" rx="8" fill="#451A03" stroke="#FBBF24" />
                    <text x="300" y="41" textAnchor="middle" fill="#FDE68A" fontSize="10" fontWeight="700">
                      RUÍDO EMI
                    </text>
                    <line x1="300" y1="54" x2="300" y2="74" stroke="#FBBF24" strokeDasharray="3 3" strokeWidth="2" />
                  </>
                ) : (
                  <>
                    <rect x="292" y="28" width="16" height="118" rx="3" fill="#4C0519" stroke="#FB7185" strokeWidth="1.5" />
                    <text x="300" y="20" textAnchor="middle" fill="#FDA4AF" fontSize="10" fontWeight="700">
                      PAREDE / OBSTÁCULO
                    </text>
                  </>
                )}
              </g>
            )}

            <text
              x="300"
              y="162"
              textAnchor="middle"
              fill={signalBlocked ? '#FDA4AF' : signalDegraded ? '#FDE68A' : '#6EE7B7'}
              fontSize="10.5"
              fontFamily="JetBrains Mono, monospace"
            >
              {signalBlocked
                ? 'SINAL BLOQUEADO PELO OBSTÁCULO (EXIGE LINHA DE VISADA)'
                : signalDegraded
                  ? 'SINAL CHEGA COM ATENUAÇÃO / RUÍDO PARCIAL'
                  : 'SINAL ÍNTEGRO NO RECEPTOR'}
            </text>
          </svg>
        </div>

        {/* Details */}
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <span className="block font-mono text-[10px] text-slate-500">TIPO DE SINAL</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-100">{selected.signalType}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <span className="block font-mono text-[10px] text-slate-500">CONECTOR / FAIXA</span>
              <span className="mt-0.5 block text-xs font-semibold text-cyan-200">{selected.connectorOrBand}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <span className="block font-mono text-[10px] text-slate-500">ALCANCE TÍPICO</span>
              <span className="mt-0.5 block text-xs font-semibold text-emerald-200">{selected.typicalRange}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-200">{selected.description}</p>

          <div
            className={`rounded-xl border px-4 py-3 text-xs ${
              signalBlocked
                ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                : obstacleOn
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                  : 'border-slate-800 bg-[#090D16] text-slate-300'
            }`}
          >
            <span className="font-semibold text-slate-100">Comportamento frente a interferências/obstáculos: </span>
            {selected.obstacleBehavior}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#090D16] px-4 py-2.5 text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Exemplos reais: </span>
            {selected.examples}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. MODOS DE TRANSMISSÃO (SIMPLEX · HALF-DUPLEX · FULL-DUPLEX)
 * ========================================================================== */
function TransmissionModesModule() {
  const prefersReducedMotion = useReducedMotion();
  const [modeId, setModeId] = useState<TransmissionModeItem['id']>('simplex');
  const [testAction, setTestAction] = useState<'idle' | 'a-to-b' | 'b-to-a' | 'both'>('a-to-b');
  const [pulseKey, setPulseKey] = useState(0);

  const selected = TRANSMISSION_MODES.find((m) => m.id === modeId) ?? TRANSMISSION_MODES[0];

  const triggerTest = (action: 'a-to-b' | 'b-to-a' | 'both') => {
    setTestAction(action);
    setPulseKey((k) => k + 1);
  };

  const feedback = (() => {
    if (testAction === 'a-to-b') {
      return {
        ok: true,
        text: `Fluxo A → B entregue com sucesso no modo ${selected.name}.`,
      };
    }
    if (testAction === 'b-to-a') {
      if (modeId === 'simplex') {
        return {
          ok: false,
          text: 'BLOQUEADO NO SIMPLEX: O dispositivo B é apenas receptor! Não existe canal de retorno (ex.: um rádio FM não envia áudio de volta para a emissora).',
        };
      }
      return {
        ok: true,
        text: `Fluxo B → A entregue com sucesso! No modo ${selected.name}, a comunicação é bidirecional.`,
      };
    }
    // both simultaneously
    if (modeId === 'simplex') {
      return {
        ok: false,
        text: 'IMPOSSÍVEL NO SIMPLEX: Apenas o sentido A → B existe; B não consegue transmitir.',
      };
    }
    if (modeId === 'half-duplex') {
      return {
        ok: false,
        text: 'COLISÃO / CANAL OCUPADO NO HALF-DUPLEX! Como existe um único canal compartilhado, A e B não podem falar ao mesmo tempo — precisam se revezar (como em um walkie-talkie).',
      };
    }
    return {
      ok: true,
      text: 'SUCESSO TOTAL NO FULL-DUPLEX! A e B transmitem e recebem simultaneamente em vias separadas (TX e RX) sem colisão, garantindo maior desempenho e menor latência.',
    };
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Mode Selector (4 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-4">
          <h2 className="text-base font-bold text-slate-100">Modos de Transmissão</h2>
          <p className="mt-1 text-xs text-slate-400">
            Selecione o modo e teste enviar dados de A, de B ou dos dois ao mesmo tempo.
          </p>

          <div className="mt-4 space-y-2.5">
            {TRANSMISSION_MODES.map((m) => {
              const isSelected = m.id === modeId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setModeId(m.id);
                    setTestAction('a-to-b');
                    setPulseKey((k) => k + 1);
                  }}
                  className={`w-full cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-cyan-400/70 bg-cyan-400/12'
                      : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${isSelected ? 'text-cyan-200' : 'text-slate-100'}`}>
                      {m.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{m.directionLabel}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{m.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Channel Lab (8 cols) */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-50">
                Simulador Interativo: {selected.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => triggerTest('a-to-b')}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  testAction === 'a-to-b'
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                    : 'border-slate-700 bg-[#090D16] text-slate-300 hover:border-slate-500'
                }`}
              >
                Enviar A → B
              </button>
              <button
                type="button"
                onClick={() => triggerTest('b-to-a')}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  testAction === 'b-to-a'
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200'
                    : 'border-slate-700 bg-[#090D16] text-slate-300 hover:border-slate-500'
                }`}
              >
                Enviar B → A
              </button>
              <button
                type="button"
                onClick={() => triggerTest('both')}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  testAction === 'both'
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
                    : 'border-slate-700 bg-[#090D16] text-slate-300 hover:border-slate-500'
                }`}
              >
                Enviar A e B juntos
              </button>
            </div>
          </div>

          <div className="bg-[#060911] p-4">
            <svg viewBox="0 0 600 170" className="h-auto w-full select-none" role="img" aria-label={`Animação ${selected.name}`}>
              {/* Device A & B */}
              <rect x="24" y="48" width="110" height="72" rx="12" fill="#0C1424" stroke="#22D3EE" strokeWidth="1.6" />
              <text x="79" y="80" textAnchor="middle" fill="#F1F5F9" fontSize="12" fontWeight="700">Dispositivo A</text>
              <text x="79" y="98" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                {modeId === 'simplex' ? 'SÓ TRANSMISSOR' : 'TX / RX'}
              </text>

              <rect x="466" y="48" width="110" height="72" rx="12" fill="#0C1424" stroke="#10B981" strokeWidth="1.6" />
              <text x="521" y="80" textAnchor="middle" fill="#F1F5F9" fontSize="12" fontWeight="700">Dispositivo B</text>
              <text x="521" y="98" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                {modeId === 'simplex' ? 'SÓ RECEPTOR' : 'TX / RX'}
              </text>

              {/* Channel tracks */}
              {modeId === 'full-duplex' ? (
                <>
                  <line x1="134" y1="68" x2="466" y2="68" stroke="#22D3EE" strokeWidth="3" opacity="0.6" />
                  <line x1="134" y1="102" x2="466" y2="102" stroke="#10B981" strokeWidth="3" opacity="0.6" />
                  <text x="300" y="56" textAnchor="middle" fill="#67E8F9" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                    VIA 1: A → B (SIMULTÂNEA)
                  </text>
                  <text x="300" y="122" textAnchor="middle" fill="#6EE7B7" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                    VIA 2: B → A (SIMULTÂNEA)
                  </text>
                </>
              ) : (
                <>
                  <line x1="134" y1="84" x2="466" y2="84" stroke="#334155" strokeWidth="4" />
                  <text x="300" y="64" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
                    {modeId === 'simplex' ? 'CANAL UNIDIRECIONAL (APENAS A → B)' : 'CANAL ÚNICO COMPARTILHADO (1 POR VEZ)'}
                  </text>
                </>
              )}

              {/* Animated Packets */}
              {!prefersReducedMotion && testAction === 'a-to-b' && (
                <motion.circle
                  key={`ab-${pulseKey}`}
                  cy={modeId === 'full-duplex' ? 68 : 84}
                  r="8"
                  fill="#22D3EE"
                  animate={{ cx: [148, 452] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {!prefersReducedMotion && testAction === 'b-to-a' && modeId !== 'simplex' && (
                <motion.circle
                  key={`ba-${pulseKey}`}
                  cy={modeId === 'full-duplex' ? 102 : 84}
                  r="8"
                  fill="#10B981"
                  animate={{ cx: [452, 148] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {!prefersReducedMotion && testAction === 'both' && modeId === 'full-duplex' && (
                <>
                  <motion.circle
                    key={`both-ab-${pulseKey}`}
                    cy="68"
                    r="8"
                    fill="#22D3EE"
                    animate={{ cx: [148, 452] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    key={`both-ba-${pulseKey}`}
                    cy="102"
                    r="8"
                    fill="#10B981"
                    animate={{ cx: [452, 148] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}

              {!prefersReducedMotion && testAction === 'both' && modeId === 'half-duplex' && (
                <>
                  <motion.circle
                    key={`col-a-${pulseKey}`}
                    cy="84"
                    r="8"
                    fill="#FB7185"
                    animate={{ cx: [148, 290] }}
                    transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  <motion.circle
                    key={`col-b-${pulseKey}`}
                    cy="84"
                    r="8"
                    fill="#FBBF24"
                    animate={{ cx: [452, 310] }}
                    transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  <circle cx="300" cy="84" r="16" fill="none" stroke="#FB7185" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="300" y="114" textAnchor="middle" fill="#FDA4AF" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                    COLISÃO!
                  </text>
                </>
              )}
            </svg>

            <div
              className={`mt-3 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
                feedback.ok
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-400/50 bg-rose-500/10 text-rose-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          </div>

          <div className="p-5 text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Exemplos reais: </span>
            {selected.examples}
          </div>
        </div>
      </div>

      {/* Quick Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
        <div className="border-b border-slate-800 px-5 py-3.5">
          <h3 className="text-sm font-bold text-slate-100">Comparação Rápida dos Modos de Transmissão</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#090D16] font-mono text-[11px] text-slate-400">
              <tr>
                <th className="px-4 py-3">Característica</th>
                <th className="px-4 py-3 text-cyan-300">Simplex</th>
                <th className="px-4 py-3 text-amber-300">Half-Duplex</th>
                <th className="px-4 py-3 text-emerald-300">Full-Duplex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-300">Sentido</td>
                <td className="px-4 py-3">Unidirecional</td>
                <td className="px-4 py-3">Bidirecional</td>
                <td className="px-4 py-3">Bidirecional</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-300">Simultaneidade</td>
                <td className="px-4 py-3">Não se aplica</td>
                <td className="px-4 py-3">Não (um por vez)</td>
                <td className="px-4 py-3 text-emerald-300 font-semibold">Sim (ao mesmo tempo)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-300">Desempenho / Latência</td>
                <td className="px-4 py-3">Simples, sem retorno</td>
                <td className="px-4 py-3">Maior latência pela alternância</td>
                <td className="px-4 py-3 text-emerald-300 font-semibold">Maior desempenho e menor latência</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-300">Exemplos</td>
                <td className="px-4 py-3 text-slate-400">Rádio broadcast, teclado → monitor</td>
                <td className="px-4 py-3 text-slate-400">Walkie-talkie, redes antigas com hub</td>
                <td className="px-4 py-3 text-slate-400">Telefone, redes com switch</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
