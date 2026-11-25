import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  StepBack,
  StepForward,
  XCircle,
} from 'lucide-react';
import { NetworkPacketFrame, NetworkVisualEvent } from '../types/ctf';
import { OsiModelVisualizer } from './OsiModelVisualizer';

interface NetworkMonitorProps {
  event: NetworkVisualEvent | null;
  onRunDemoCommand: (cmd: string) => void;
  isExecuting: boolean;
}

const TOOL_DEMOS: {
  tool: NetworkVisualEvent['tool'];
  label: string;
  cmd: string;
}[] = [
  { tool: 'ping', label: 'ping', cmd: 'ping -c 3 10.0.0.10' },
  { tool: 'nmap', label: 'nmap', cmd: 'nmap -sV 10.0.0.10' },
  { tool: 'whois', label: 'whois', cmd: 'whois phish-alerta.lab' },
  { tool: 'nslookup', label: 'nslookup', cmd: 'nslookup portal.if.edu.br' },
  { tool: 'sniff', label: 'sniff', cmd: 'sniff -c 8' },
  { tool: 'socket', label: 'socket.py', cmd: 'python3 scripts/scanner_etico.py' },
];

interface VisualPalette {
  stroke: string;
  fill: string;
  badge: string;
  text: string;
}

function getPacketPalette(pkt: NetworkPacketFrame): VisualPalette {
  if (pkt.severity === 'alert' || pkt.direction === 'drop') {
    return {
      stroke: '#FB7185',
      fill: '#4C0519',
      badge: 'border-rose-400/50 bg-rose-500/15 text-rose-200',
      text: 'text-rose-300',
    };
  }
  if (pkt.severity === 'warn') {
    return {
      stroke: '#FBBF24',
      fill: '#451A03',
      badge: 'border-amber-400/50 bg-amber-500/15 text-amber-200',
      text: 'text-amber-300',
    };
  }
  if (pkt.severity === 'ok' || pkt.direction === 'rx') {
    return {
      stroke: '#10B981',
      fill: '#022C22',
      badge: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200',
      text: 'text-emerald-300',
    };
  }
  return {
    stroke: '#3BE37A',
    fill: '#083344',
    badge: 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200',
    text: 'text-cyan-300',
  };
}

function getNodeMetadata(event: NetworkVisualEvent) {
  switch (event.tool) {
    case 'ping':
      return {
        leftTitle: 'Terminal Aluno',
        leftSub: '192.168.10.15',
        midTitle: 'Roteador (Gateway)',
        midSub: '192.168.10.1 · L3',
        rightTitle: event.target,
        rightSub: event.resolvedIp,
      };
    case 'nmap':
      return {
        leftTitle: 'Scanner Nmap',
        leftSub: '192.168.10.15',
        midTitle: 'Firewall / Filtro',
        midSub: 'Inspeção L3/L4',
        rightTitle: event.target,
        rightSub: event.resolvedIp,
      };
    case 'whois':
      return {
        leftTitle: 'Terminal Aluno',
        leftSub: 'Cliente WHOIS',
        midTitle: 'Servidor WHOIS',
        midSub: 'TCP Porta 43',
        rightTitle: event.org ? event.org.slice(0, 22) : 'Base Registradora',
        rightSub: event.resolvedIp,
      };
    case 'nslookup':
      return {
        leftTitle: 'Terminal Aluno',
        leftSub: '192.168.10.15',
        midTitle: 'Resolvedor DNS',
        midSub: '10.0.0.20 · UDP :53',
        rightTitle: 'Zona Autoritativa',
        rightSub: event.resolvedIp,
      };
    case 'sniff':
      return {
        leftTitle: 'Rede Interna',
        leftSub: '192.168.10.0/24',
        midTitle: 'Sniffer eth0-lab',
        midSub: 'Modo Promíscuo',
        rightTitle: 'Servidor / Externo',
        rightSub: '10.0.0.10 · 185.220.*',
      };
    case 'socket':
    default:
      return {
        leftTitle: 'Python socket()',
        leftSub: '192.168.10.15',
        midTitle: 'Switch Virtual',
        midSub: 'Rede Segura Lab',
        rightTitle: event.target,
        rightSub: event.resolvedIp,
      };
  }
}

export function NetworkMonitor({
  event,
  onRunDemoCommand,
  isExecuting,
}: NetworkMonitorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [monitorTab, setMonitorTab] = useState<'flow' | 'osi'>('flow');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slowMode, setSlowMode] = useState(false);
  const [sessionTotals, setSessionTotals] = useState({ tx: 0, rx: 0, bytes: 0, alerts: 0 });

  const lastCountedEventId = useRef<string | null>(null);
  const packetListRef = useRef<HTMLDivElement | null>(null);

  const packets = useMemo<NetworkPacketFrame[]>(() => {
    if (!event) return [];
    if (event.packets && event.packets.length > 0) return event.packets;
    return [
      {
        seq: 1,
        direction: 'tx',
        proto: 'TCP',
        src: '192.168.10.15',
        dst: event.resolvedIp,
        flags: event.tool.toUpperCase(),
        bytes: 64,
        ttl: 64,
        payload: event.summary,
        explanation: event.summary,
        severity: event.success ? 'ok' : 'alert',
      },
    ];
  }, [event]);

  const nodes = useMemo(() => (event ? getNodeMetadata(event) : null), [event]);

  // Reset playback and update real session packet counters when a new command executes
  useEffect(() => {
    if (!event) return;
    setActiveIndex(0);
    setIsPlaying(true);
    setCollapsed(false);

    if (lastCountedEventId.current !== event.id) {
      lastCountedEventId.current = event.id;
      const list = event.packets ?? [];
      const txAdd = list.filter((p) => p.direction === 'tx').length;
      const rxAdd = list.filter((p) => p.direction === 'rx').length;
      const bytesAdd = list.reduce((acc, p) => acc + (p.bytes || 0), 0);
      const alertAdd = list.filter((p) => p.severity === 'alert' || p.direction === 'drop').length;
      setSessionTotals((prev) => ({
        tx: prev.tx + txAdd,
        rx: prev.rx + rxAdd,
        bytes: prev.bytes + bytesAdd,
        alerts: prev.alerts + alertAdd,
      }));
    }
  }, [event]);

  // Auto-advance packet playback
  useEffect(() => {
    if (!event || !isPlaying || packets.length <= 1 || collapsed) return;
    const stepMs = slowMode ? 2600 : 1550;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => {
        if (prev + 1 >= packets.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [event, isPlaying, activeIndex, packets.length, slowMode, collapsed]);

  // Keep active row scrolled into view smoothly inside the packet table
  useEffect(() => {
    if (!packetListRef.current) return;
    const activeEl = packetListRef.current.querySelector<HTMLElement>(
      `[data-pkt-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex]);

  const activePacket = packets[Math.min(activeIndex, Math.max(packets.length - 1, 0))] ?? null;
  const palette = activePacket ? getPacketPalette(activePacket) : null;

  // Determine which ports from event.ports have already received an answer up to activeIndex
  const revealedPortSet = useMemo(() => {
    const set = new Set<number>();
    if (!event?.ports?.length) return set;
    for (let i = 0; i <= activeIndex && i < packets.length; i++) {
      const p = packets[i];
      if (p.direction === 'rx' || p.direction === 'drop') {
        const srcPortStr = p.src.split(':')[1];
        const dstPortStr = p.dst.split(':')[1];
        const portNum = Number(srcPortStr || dstPortStr);
        if (!Number.isNaN(portNum) && portNum > 0) {
          set.add(portNum);
        }
      }
    }
    return set;
  }, [event, packets, activeIndex]);

  // Compute SVG motion coordinates for the active packet
  const motionCoords = useMemo(() => {
    if (!activePacket) {
      return { x: [148, 732], y: [92, 92], targetNode: 'right' as const };
    }
    if (activePacket.direction === 'tx') {
      return {
        x: [148, 440, 732],
        y: [92, 72, 92],
        targetNode: 'right' as const,
      };
    }
    if (activePacket.direction === 'rx') {
      return {
        x: [732, 440, 148],
        y: [134, 154, 134],
        targetNode: 'left' as const,
      };
    }
    // drop / timeout stops at center firewall/gateway
    return {
      x: [148, 440],
      y: [92, 72],
      targetNode: 'center' as const,
    };
  }, [activePacket]);

  const animDuration = slowMode ? 1.9 : 1.05;

  return (
    <section
      aria-label="Network Monitor — Visualizador de Pacotes"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h2 className="text-sm font-bold text-slate-100">
                Network Monitor
              </h2>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {sessionTotals.tx + sessionTotals.rx > 0
                  ? `· TX ${sessionTotals.tx} · RX ${sessionTotals.rx} · ${sessionTotals.bytes} B${
                      sessionTotals.alerts > 0 ? ` · ${sessionTotals.alerts} alerta(s)` : ''
                    }`
                  : '· Aguardando captura de tráfego'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {event
                ? `Captura ativa: ${event.tool} → ${event.target} (${event.resolvedIp})`
                : 'Representação gráfica animada dos pacotes entre seu terminal e o alvo.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher: Fluxo de Pacotes vs Modelo OSI (7 Camadas) */}
          <div className="flex items-center gap-1 rounded-lg bg-[#071225] p-1">
            <button
              type="button"
              onClick={() => {
                setMonitorTab('flow');
                setCollapsed(false);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                monitorTab === 'flow'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Fluxo de Pacotes
            </button>
            <button
              type="button"
              onClick={() => {
                setMonitorTab('osi');
                setCollapsed(false);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                monitorTab === 'osi'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Modelo OSI (7 Camadas)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TOOL_DEMOS.map((item) => {
              const active = event?.tool === item.tool;
              return (
                <button
                  key={item.tool}
                  type="button"
                  disabled={isExecuting}
                  onClick={() => onRunDemoCommand(item.cmd)}
                  className={`cursor-pointer rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                    active
                      ? 'border-cyan-400/70 bg-cyan-400/15 text-cyan-200'
                      : 'border-slate-800 bg-[#071225] text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir Network Monitor' : 'Recolher Network Monitor'}
            className="cursor-pointer rounded-md border border-slate-700 p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 sm:p-5">
          {monitorTab === 'osi' ? (
            <OsiModelVisualizer event={event} activePacket={activePacket} />
          ) : !event || !activePacket || !palette || !nodes ? (
            /* Empty Ready State */
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-slate-800 bg-[#050E1D] px-5 py-6 text-center sm:flex-row sm:text-left">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100">
                  Observe os pacotes trafegando em tempo real entre o terminal e o alvo
                </p>
                <p className="max-w-2xl text-xs leading-relaxed text-slate-400">
                  Rode comandos de rede (<code className="font-mono text-cyan-300">ping</code>,{' '}
                  <code className="font-mono text-cyan-300">nmap</code>,{' '}
                  <code className="font-mono text-cyan-300">whois</code>,{' '}
                  <code className="font-mono text-cyan-300">nslookup</code>,{' '}
                  <code className="font-mono text-cyan-300">sniff</code>) ou um script Python com{' '}
                  <code className="font-mono text-cyan-300">socket</code> para acompanhar o fluxo
                  gráfico TX/RX, cabeçalhos e as 7 camadas do Modelo OSI.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMonitorTab('osi')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0F1E36] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Ver Modelo OSI
                </button>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => onRunDemoCommand('nmap -sV 10.0.0.10')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 disabled:opacity-50 whitespace-nowrap"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Iniciar captura (nmap)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1. ANIMATED SVG TOPOLOGY & DUAL-CHANNEL PACKET BUS */}
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#050E1D]">
                <svg
                  viewBox="0 0 880 226"
                  role="img"
                  aria-label={`Fluxo gráfico de pacotes ${activePacket.proto} entre ${nodes.leftTitle} e ${nodes.rightTitle}`}
                  className="block h-auto w-full select-none"
                >
                  <defs>
                    <pattern
                      id="nm-grid"
                      width="28"
                      height="28"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 28 0 L 0 0 0 28"
                        fill="none"
                        stroke="#1E293B"
                        strokeWidth="0.7"
                        opacity="0.45"
                      />
                    </pattern>
                    <linearGradient id="tx-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3BE37A" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#3BE37A" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#3BE37A" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="rx-grad" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#10B981" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="pkt-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Engineering Grid Background */}
                  <rect width="880" height="226" fill="url(#nm-grid)" />

                  {/* Lane Labels */}
                  <text
                    x="440"
                    y="24"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.08em"
                  >
                    TX · SAÍDA (TERMINAL → ALVO)
                  </text>
                  <text
                    x="440"
                    y="212"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.08em"
                  >
                    RX · RETORNO (ALVO → TERMINAL)
                  </text>

                  {/* Upper TX Bus Track */}
                  <path
                    d="M 148 92 Q 440 52 732 92"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3"
                  />
                  <path
                    d="M 148 92 Q 440 52 732 92"
                    fill="none"
                    stroke={activePacket.direction === 'tx' ? 'url(#tx-grad)' : activePacket.direction === 'drop' ? '#FB7185' : 'transparent'}
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    opacity={activePacket.direction === 'tx' || activePacket.direction === 'drop' ? 0.9 : 0}
                  />

                  {/* Lower RX Bus Track */}
                  <path
                    d="M 732 134 Q 440 174 148 134"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3"
                  />
                  <path
                    d="M 732 134 Q 440 174 148 134"
                    fill="none"
                    stroke={activePacket.direction === 'rx' ? 'url(#rx-grad)' : 'transparent'}
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    opacity={activePacket.direction === 'rx' ? 0.9 : 0}
                  />

                  {/* Directional Chevrons on Tracks */}
                  <polygon points="292,73 283,68 285,78" fill="#334155" />
                  <polygon points="592,73 583,68 585,78" fill="#334155" />
                  <polygon points="588,153 597,148 595,158" fill="#334155" />
                  <polygon points="288,153 297,148 295,158" fill="#334155" />

                  {/* LEFT NODE: Terminal */}
                  <g transform="translate(26, 60)">
                    <rect
                      width="124"
                      height="106"
                      rx="14"
                      fill="#0C1424"
                      stroke={activePacket.direction === 'rx' ? '#10B981' : '#3BE37A'}
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                    />
                    <rect x="44" y="16" width="36" height="24" rx="4" fill="#050E1D" stroke="#3BE37A" strokeWidth="1.5" />
                    <path d="M 52 25 L 57 29 L 52 33 M 61 33 L 70 33" stroke="#3BE37A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    <text
                      x="62"
                      y="64"
                      textAnchor="middle"
                      fill="#F1F5F9"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {nodes.leftTitle}
                    </text>
                    <text
                      x="62"
                      y="82"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {nodes.leftSub}
                    </text>
                  </g>

                  {/* CENTER NODE: Router / Firewall / DNS / Sniffer */}
                  <g transform="translate(376, 70)">
                    <rect
                      width="128"
                      height="86"
                      rx="14"
                      fill="#0C1424"
                      stroke={activePacket.direction === 'drop' ? '#FB7185' : '#475569'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="64"
                      cy="24"
                      r="9"
                      fill="#050E1D"
                      stroke={activePacket.direction === 'drop' ? '#FB7185' : '#94A3B8'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="64"
                      cy="24"
                      r="3"
                      fill={activePacket.direction === 'drop' ? '#FB7185' : '#3BE37A'}
                    />
                    <text
                      x="64"
                      y="52"
                      textAnchor="middle"
                      fill="#F1F5F9"
                      fontSize="11.5"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {nodes.midTitle}
                    </text>
                    <text
                      x="64"
                      y="68"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {nodes.midSub}
                    </text>
                  </g>

                  {/* RIGHT NODE: Target Host */}
                  <g transform="translate(730, 60)">
                    <rect
                      width="124"
                      height="106"
                      rx="14"
                      fill="#0C1424"
                      stroke={event.success ? '#10B981' : '#FB7185'}
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                    />
                    {/* Server rack icon */}
                    <rect x="44" y="15" width="36" height="10" rx="2.5" fill="#050E1D" stroke={event.success ? '#10B981' : '#FB7185'} strokeWidth="1.3" />
                    <rect x="44" y="29" width="36" height="10" rx="2.5" fill="#050E1D" stroke={event.success ? '#10B981' : '#FB7185'} strokeWidth="1.3" />
                    <circle cx="72" cy="20" r="1.8" fill={event.success ? '#10B981' : '#FB7185'} />
                    <circle cx="72" cy="34" r="1.8" fill={event.success ? '#3BE37A' : '#FB7185'} />
                    <text
                      x="62"
                      y="64"
                      textAnchor="middle"
                      fill="#F1F5F9"
                      fontSize="11.5"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {nodes.rightTitle.length > 16
                        ? `${nodes.rightTitle.slice(0, 15)}…`
                        : nodes.rightTitle}
                    </text>
                    <text
                      x="62"
                      y="82"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {nodes.rightSub.length > 17
                        ? `${nodes.rightSub.slice(0, 16)}…`
                        : nodes.rightSub}
                    </text>
                  </g>

                  {/* Trailing Stream Particles (convey data flow motion) */}
                  {!prefersReducedMotion &&
                    [0.12, 0.24].map((delay, idx) => (
                      <motion.circle
                        key={`trail-${event.id}-${activeIndex}-${idx}`}
                        r={idx === 0 ? 4.5 : 3}
                        fill={palette.stroke}
                        opacity={0.45 - idx * 0.14}
                        initial={{ cx: motionCoords.x[0], cy: motionCoords.y[0], opacity: 0 }}
                        animate={{
                          cx: motionCoords.x,
                          cy: motionCoords.y,
                          opacity: [0, 0.55 - idx * 0.15, 0],
                        }}
                        transition={{
                          duration: animDuration,
                          delay,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}

                  {/* Primary Animated Data Packet Capsule */}
                  <motion.g
                    key={`pkt-${event.id}-${activeIndex}`}
                    initial={
                      prefersReducedMotion
                        ? { x: 440, y: activePacket.direction === 'rx' ? 154 : 72 }
                        : { x: motionCoords.x[0], y: motionCoords.y[0], opacity: 0.4, scale: 0.9 }
                    }
                    animate={
                      prefersReducedMotion
                        ? { x: 440, y: activePacket.direction === 'rx' ? 154 : 72, opacity: 1 }
                        : {
                            x: motionCoords.x,
                            y: motionCoords.y,
                            opacity: [0.5, 1, 1],
                            scale: [0.92, 1.04, 1],
                          }
                    }
                    transition={{
                      duration: animDuration,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Packet Core Capsule */}
                    <rect
                      x="-64"
                      y="-16"
                      width="128"
                      height="32"
                      rx="8"
                      fill={palette.fill}
                      stroke={palette.stroke}
                      strokeWidth="1.8"
                      filter="url(#pkt-glow)"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {activePacket.proto} · {activePacket.flags.slice(0, 12)}
                    </text>
                    <text
                      x="0"
                      y="10"
                      textAnchor="middle"
                      fill={palette.stroke}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {activePacket.bytes > 0 ? `${activePacket.bytes} B · TTL ${activePacket.ttl}` : 'SEM RESPOSTA'}
                    </text>
                  </motion.g>

                  {/* Drop / Firewall Impact Ring when packet is blocked */}
                  {activePacket.direction === 'drop' && (
                    <motion.g
                      key={`drop-${event.id}-${activeIndex}`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 0.85], scale: [0.6, 1.12, 1] }}
                      transition={{ delay: animDuration * 0.72, duration: 0.35 }}
                      transform="translate(440, 72)"
                    >
                      <circle r="20" fill="none" stroke="#FB7185" strokeWidth="2" strokeDasharray="4 3" />
                    </motion.g>
                  )}
                </svg>

                {/* Playback Control Strip Anchored to Bottom of SVG Canvas */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/90 bg-[#071225] px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tabular-nums">
                    <span className={`font-semibold ${palette.text}`}>
                      Pacote #{activePacket.seq} de {packets.length}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300">
                      {activePacket.src} → {activePacket.dst}
                    </span>
                    {activePacket.latencyMs !== undefined && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-emerald-300">{activePacket.latencyMs} ms</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPlaying && activeIndex >= packets.length - 1) {
                          setActiveIndex(0);
                        }
                        setIsPlaying((p) => !p);
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Reproduzir
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveIndex((prev) => (prev - 1 + packets.length) % packets.length);
                      }}
                      title="Pacote anterior"
                      aria-label="Pacote anterior"
                      className="cursor-pointer rounded-lg border border-slate-700 bg-[#0F1E36] p-1.5 text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
                    >
                      <StepBack className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveIndex((prev) => (prev + 1) % packets.length);
                      }}
                      title="Próximo pacote"
                      aria-label="Próximo pacote"
                      className="cursor-pointer rounded-lg border border-slate-700 bg-[#0F1E36] p-1.5 text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
                    >
                      <StepForward className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveIndex(0);
                        setIsPlaying(true);
                      }}
                      title="Reiniciar sequência"
                      aria-label="Reiniciar sequência"
                      className="cursor-pointer rounded-lg border border-slate-700 bg-[#0F1E36] p-1.5 text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSlowMode((s) => !s)}
                      title="Alternar velocidade didática"
                      className="cursor-pointer rounded-lg border border-slate-700 bg-[#0F1E36] px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-300 transition-colors hover:border-slate-500 tabular-nums"
                    >
                      {slowMode ? '0.6x' : '1.0x'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. LIVE PORT MATRIX (Shown automatically on nmap or Python socket port scans) */}
              {event.ports && event.ports.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-[#071225] p-3.5">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-200">
                      Mapa de Portas TCP em {event.resolvedIp}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {revealedPortSet.size} de {event.ports.length} porta(s) respondida(s)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {event.ports.map((p) => {
                      const revealed = revealedPortSet.has(p.port);
                      const isOpen = revealed && p.state === 'open';
                      const isFiltered = revealed && p.state === 'filtered';
                      const isRiskyMysql = isOpen && p.port === 3306;

                      return (
                        <div
                          key={p.port}
                          className={`rounded-lg border px-2.5 py-2 transition-colors ${
                            !revealed
                              ? 'border-slate-800 bg-[#050E1D] text-slate-500'
                              : isRiskyMysql
                                ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
                                : isOpen
                                  ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                                  : isFiltered
                                    ? 'border-amber-400/50 bg-amber-500/10 text-amber-200'
                                    : 'border-slate-800 bg-[#0B111E] text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 font-mono text-xs font-bold tabular-nums">
                            <span>:{p.port}</span>
                            {!revealed ? (
                              <span className="text-[10px] text-cyan-400">SYN</span>
                            ) : isOpen ? (
                              <CheckCircle2
                                className={`h-3.5 w-3.5 ${
                                  isRiskyMysql ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              />
                            ) : isFiltered ? (
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-600" />
                            )}
                          </div>
                          <div className="mt-0.5 truncate font-mono text-[10px]">
                            {p.service}
                          </div>
                          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {!revealed
                              ? 'sondando'
                              : isRiskyMysql
                                ? 'open (!)'
                                : p.state}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. SPLIT LIVE PACKET STREAM LOG + DEEP PACKET INSPECTOR */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Packet Stream Table (7 cols) */}
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#050E1D] lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-[#071225] px-3.5 py-2 text-[11px]">
                    <span className="font-semibold text-slate-200">
                      Fluxo de Pacotes (clique em qualquer linha para inspecionar)
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {packets.length} quadro(s)
                    </span>
                  </div>
                  <div
                    ref={packetListRef}
                    className="max-h-[195px] divide-y divide-slate-800/70 overflow-y-auto font-mono text-[11px]"
                  >
                    {packets.map((pkt, idx) => {
                      const isCurrent = idx === activeIndex;
                      const isFuture = idx > activeIndex && isPlaying;
                      const pStyle = getPacketPalette(pkt);
                      return (
                        <button
                          key={`${event.id}-row-${pkt.seq}`}
                          type="button"
                          data-pkt-index={idx}
                          onClick={() => {
                            setIsPlaying(false);
                            setActiveIndex(idx);
                          }}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors ${
                            isCurrent
                              ? 'bg-cyan-400/12 text-slate-100'
                              : isFuture
                                ? 'text-slate-600 hover:bg-slate-900/70 hover:text-slate-300'
                                : 'text-slate-300 hover:bg-slate-900/70'
                          }`}
                        >
                          <span className="w-5 shrink-0 text-slate-500 tabular-nums">
                            #{pkt.seq}
                          </span>
                          <span className="w-4 shrink-0">
                            {pkt.direction === 'tx' ? (
                              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                            ) : pkt.direction === 'rx' ? (
                              <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                            )}
                          </span>
                          <span className={`w-12 shrink-0 font-semibold ${pStyle.text}`}>
                            {pkt.proto}
                          </span>
                          <span
                            className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${pStyle.badge}`}
                          >
                            {pkt.flags}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-slate-400">
                            {pkt.payload}
                          </span>
                          <span className="hidden shrink-0 text-slate-500 tabular-nums sm:inline">
                            {pkt.bytes}B
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Packet Header & Educational Inspector (5 cols) */}
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-[#071225] p-4 lg:col-span-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        Inspetor do Pacote #{activePacket.seq}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${palette.badge}`}
                      >
                        {activePacket.proto} · {activePacket.flags}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-800/80 bg-[#050E1D] p-2.5 font-mono text-[11px] tabular-nums">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-500">ORIGEM</span>
                        <span className="block truncate text-cyan-300">{activePacket.src}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-500">DESTINO</span>
                        <span className="block truncate text-emerald-300">{activePacket.dst}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">TAMANHO / TTL</span>
                        <span className="text-slate-200">
                          {activePacket.bytes} B · TTL {activePacket.ttl}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">DIREÇÃO</span>
                        <span className={palette.text}>
                          {activePacket.direction === 'tx'
                            ? 'TX (Saída)'
                            : activePacket.direction === 'rx'
                              ? 'RX (Retorno)'
                              : 'DROP (Descartado)'}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-800/80 bg-[#050E1D] px-3 py-2 font-mono text-[11px] text-slate-200 break-words">
                      <span className="mr-1.5 text-slate-500">PAYLOAD:</span>
                      {activePacket.payload}
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300">
                      {activePacket.explanation}
                    </p>

                    <button
                      type="button"
                      onClick={() => setMonitorTab('osi')}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Inspecionar este pacote nas 7 Camadas OSI
                    </button>
                  </div>

                  {/* Clickable Packet Timeline Progress */}
                  <div
                    className="grid gap-1 pt-1"
                    style={{
                      gridTemplateColumns: `repeat(${packets.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {packets.map((pkt, idx) => (
                      <button
                        key={`prog-${pkt.seq}`}
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveIndex(idx);
                        }}
                        aria-label={`Ir para pacote ${pkt.seq}`}
                        className={`h-1.5 cursor-pointer rounded-full transition-colors ${
                          idx === activeIndex
                            ? 'bg-cyan-400'
                            : idx < activeIndex
                              ? 'bg-emerald-500/70'
                              : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
