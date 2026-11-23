import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
  WifiOff,
  Zap,
} from 'lucide-react';

type SimProtocol = 'tcp' | 'udp';

interface PacketStep {
  id: string;
  index: number;
  direction: 'c2s' | 's2c';
  badge: string;
  detailLine: string;
  flags: string;
  seq?: number;
  ack?: number;
  headerBytes: number;
  payloadBytes: number;
  latencyMs: number;
  dropped?: boolean;
  retransmit?: boolean;
  clientStateAfter: string;
  serverStateAfter: string;
  title: string;
  explanation: string;
  activeHeaderFields: string[];
}

function buildSteps(protocol: SimProtocol, simulateLoss: boolean): PacketStep[] {
  if (protocol === 'tcp') {
    const base: PacketStep[] = [
      {
        id: 'tcp-syn',
        index: 1,
        direction: 'c2s',
        badge: 'SYN',
        detailLine: 'seq=100 · win=65535 · 20B',
        flags: 'SYN',
        seq: 100,
        headerBytes: 20,
        payloadBytes: 0,
        latencyMs: 18,
        clientStateAfter: 'SYN_SENT',
        serverStateAfter: 'LISTEN',
        title: '1º Passo do Handshake · SYN (Pedido de Conexão)',
        explanation:
          'O cliente envia um segmento com a flag SYN e escolhe um Número de Sequência Inicial (seq=100) para sincronizar a sessão antes de transmitir qualquer dado.',
        activeHeaderFields: ['Porta Origem/Destino', 'SEQ = 100', 'Flag SYN', 'Window Size'],
      },
      {
        id: 'tcp-synack',
        index: 2,
        direction: 's2c',
        badge: 'SYN-ACK',
        detailLine: 'seq=300 · ack=101 · 20B',
        flags: 'SYN, ACK',
        seq: 300,
        ack: 101,
        headerBytes: 20,
        payloadBytes: 0,
        latencyMs: 18,
        clientStateAfter: 'SYN_SENT',
        serverStateAfter: 'SYN_RCVD',
        title: '2º Passo do Handshake · SYN-ACK (Aceite do Servidor)',
        explanation:
          'O servidor aceita a conexão na porta 443, confirma o pacote do cliente com ack=101 (100+1) e informa seu próprio número inicial (seq=300).',
        activeHeaderFields: ['Porta Origem/Destino', 'SEQ = 300', 'ACK = 101', 'Flags SYN + ACK'],
      },
      {
        id: 'tcp-ack',
        index: 3,
        direction: 'c2s',
        badge: 'ACK',
        detailLine: 'seq=101 · ack=301 · 20B',
        flags: 'ACK',
        seq: 101,
        ack: 301,
        headerBytes: 20,
        payloadBytes: 0,
        latencyMs: 16,
        clientStateAfter: 'ESTABLISHED',
        serverStateAfter: 'ESTABLISHED',
        title: '3º Passo do Handshake · ACK (Sessão Estabelecida)',
        explanation:
          'O cliente confirma o número do servidor (ack=301). O Three-Way Handshake terminou: ambos entram em ESTABLISHED e podem trocar dados confiáveis.',
        activeHeaderFields: ['SEQ = 101', 'ACK = 301', 'Flag ACK', 'Checksum'],
      },
    ];

    if (simulateLoss) {
      return [
        ...base,
        {
          id: 'tcp-data-drop',
          index: 4,
          direction: 'c2s',
          badge: 'DATA #1 (PERDIDO)',
          detailLine: 'seq=101 · len=512B · 20B',
          flags: 'PSH, ACK',
          seq: 101,
          ack: 301,
          headerBytes: 20,
          payloadBytes: 512,
          latencyMs: 45,
          dropped: true,
          clientStateAfter: 'ESTABLISHED (aguardando ACK)',
          serverStateAfter: 'ESTABLISHED',
          title: 'Pacote de Dados Perdido no Caminho',
          explanation:
            'Um roteador congestionado descarta o segmento DATA #1 antes de chegar ao servidor. Como o cliente não recebe o ACK dentro do tempo limite (RTO), ele detecta a falha.',
          activeHeaderFields: ['SEQ = 101', 'Flag PSH + ACK', 'Temporizador RTO'],
        },
        {
          id: 'tcp-data-retransmit',
          index: 5,
          direction: 'c2s',
          badge: 'RETRANSMIT DATA #1',
          detailLine: 'seq=101 · len=512B · 20B',
          flags: 'PSH, ACK',
          seq: 101,
          ack: 301,
          headerBytes: 20,
          payloadBytes: 512,
          latencyMs: 19,
          retransmit: true,
          clientStateAfter: 'ESTABLISHED',
          serverStateAfter: 'ESTABLISHED',
          title: 'Retransmissão Automática TCP',
          explanation:
            'O TCP reenvia automaticamente o mesmo segmento (seq=101) sem que a aplicação precise se preocupar. O servidor recebe os 512 bytes intactos.',
          activeHeaderFields: ['SEQ = 101 (mesmo)', 'Flag PSH + ACK', 'Checksum OK'],
        },
        {
          id: 'tcp-data-ack',
          index: 6,
          direction: 's2c',
          badge: 'ACK (DATA #1)',
          detailLine: 'seq=301 · ack=613 · 20B',
          flags: 'ACK',
          seq: 301,
          ack: 613,
          headerBytes: 20,
          payloadBytes: 0,
          latencyMs: 17,
          clientStateAfter: 'ESTABLISHED · 100% OK',
          serverStateAfter: 'ESTABLISHED · 100% OK',
          title: 'Confirmação de Recebimento (Entrega Garantida)',
          explanation:
            'O servidor responde com ack=613 (101 + 512 bytes). Mesmo com perda na rede, 100% dos dados chegaram ordenados e íntegros.',
          activeHeaderFields: ['ACK = 613', 'Flag ACK', 'Window Size'],
        },
      ];
    }

    return [
      ...base,
      {
        id: 'tcp-data',
        index: 4,
        direction: 'c2s',
        badge: 'DATA #1 (GET /arquivo)',
        detailLine: 'seq=101 · len=512B · 20B',
        flags: 'PSH, ACK',
        seq: 101,
        ack: 301,
        headerBytes: 20,
        payloadBytes: 512,
        latencyMs: 18,
        clientStateAfter: 'ESTABLISHED',
        serverStateAfter: 'ESTABLISHED',
        title: 'Envio de Dados Numerados',
        explanation:
          'Com o túnel lógico aberto, o cliente transmite 512 bytes de carga útil marcados com seq=101 e flag PSH para entrega imediata à aplicação.',
        activeHeaderFields: ['SEQ = 101', 'Flag PSH + ACK', 'Checksum'],
      },
      {
        id: 'tcp-data-ack',
        index: 5,
        direction: 's2c',
        badge: 'ACK (DATA #1)',
        detailLine: 'seq=301 · ack=613 · 20B',
        flags: 'ACK',
        seq: 301,
        ack: 613,
        headerBytes: 20,
        payloadBytes: 0,
        latencyMs: 17,
        clientStateAfter: 'ESTABLISHED',
        serverStateAfter: 'ESTABLISHED',
        title: 'Servidor Confirma Recebimento (ACK)',
        explanation:
          'O servidor soma 101 + 512 e responde com ack=613, garantindo ao cliente que todos os bytes chegaram sem erro.',
        activeHeaderFields: ['ACK = 613', 'Flag ACK', 'Window Size'],
      },
      {
        id: 'tcp-fin',
        index: 6,
        direction: 'c2s',
        badge: 'FIN / ACK',
        detailLine: 'Encerramento limpo · 20B',
        flags: 'FIN, ACK',
        seq: 613,
        ack: 301,
        headerBytes: 20,
        payloadBytes: 0,
        latencyMs: 16,
        clientStateAfter: 'CLOSED',
        serverStateAfter: 'CLOSED',
        title: 'Encerramento Controlado da Sessão (FIN)',
        explanation:
          'Ao terminar a transferência, o cliente envia FIN para fechar a conexão de forma ordenada e liberar memória nos dois lados.',
        activeHeaderFields: ['Flag FIN + ACK', 'SEQ = 613'],
      },
    ];
  }

  // UDP Flow: Zero handshake, direct datagrams
  return [
    {
      id: 'udp-d1',
      index: 1,
      direction: 'c2s',
      badge: 'DGRAM #1 (Quadro 1)',
      detailLine: 'len=520B (8B hdr + 512B) · Sem Handshake',
      flags: 'NENHUMA (UDP)',
      headerBytes: 8,
      payloadBytes: 512,
      latencyMs: 12,
      clientStateAfter: 'STATELESS',
      serverStateAfter: 'PORTA 5004 ABERTA',
      title: '1º Datagrama Enviado Imediatamente (0 Handshake)',
      explanation:
        'Sem perder tempo com SYN/ACK, o cliente encapsula o 1º quadro de vídeo/áudio em um cabeçalho mínimo de apenas 8 bytes e dispara direto pela rede.',
      activeHeaderFields: ['Porta Origem (51200)', 'Porta Destino (5004)', 'Length = 520B', 'Checksum'],
    },
    {
      id: 'udp-d2',
      index: 2,
      direction: 'c2s',
      badge: simulateLoss ? 'DGRAM #2 (PERDIDO)' : 'DGRAM #2 (Quadro 2)',
      detailLine: 'len=520B (8B hdr + 512B) · Sem ACK',
      flags: 'NENHUMA (UDP)',
      headerBytes: 8,
      payloadBytes: 512,
      latencyMs: 12,
      dropped: simulateLoss,
      clientStateAfter: 'STATELESS',
      serverStateAfter: simulateLoss ? 'QUADRO #2 DESCARTADO' : 'PORTA 5004 ABERTA',
      title: simulateLoss
        ? '2º Datagrama Perdido — Sem Retransmissão!'
        : '2º Datagrama em Sequência Contínua',
      explanation: simulateLoss
        ? 'O datagrama #2 some na rede, mas o UDP não aguarda confirmação nem reenvia. Em uma live ou jogo online, parar tudo para buscar um quadro velho causaria travamento.'
        : 'Sem esperar resposta do pacote anterior, o cliente já envia o quadro #2 com latência mínima e overhead constante de 8 bytes.',
      activeHeaderFields: ['Porta Origem/Destino', 'Length = 520B', 'Sem SEQ / Sem ACK'],
    },
    {
      id: 'udp-d3',
      index: 3,
      direction: 'c2s',
      badge: 'DGRAM #3 (Quadro 3)',
      detailLine: 'len=520B (8B hdr + 512B) · Fluxo contínuo',
      flags: 'NENHUMA (UDP)',
      headerBytes: 8,
      payloadBytes: 512,
      latencyMs: 12,
      clientStateAfter: 'STATELESS',
      serverStateAfter: 'RECEBENDO EM TEMPO REAL',
      title: '3º Datagrama Segue em Frente Sem Travar',
      explanation: simulateLoss
        ? 'O quadro #3 chega normalmente em 12 ms e o streaming continua fluido — uma microfalha de milissegundos quase imperceptível, sem atraso acumulado.'
        : 'O fluxo continua com velocidade máxima: todos os 3 datagramas foram entregues usando apenas 24 bytes totais de cabeçalho.',
      activeHeaderFields: ['Porta Origem/Destino', 'Length = 520B', 'Checksum'],
    },
    {
      id: 'udp-d4',
      index: 4,
      direction: 's2c',
      badge: 'RESPOSTA RÁPIDA (ex.: DNS / Estado)',
      detailLine: 'len=72B (8B hdr + 64B) · Sem encerramento',
      flags: 'NENHUMA (UDP)',
      headerBytes: 8,
      payloadBytes: 64,
      latencyMs: 11,
      clientStateAfter: 'STATELESS (concluído)',
      serverStateAfter: 'STATELESS (concluído)',
      title: 'Resposta Direta Sem Precisar de FIN',
      explanation:
        'Se o serviço precisar responder (como DNS ou estado de partida), o servidor devolve um datagrama único de 8 bytes de cabeçalho — sem sessão para encerrar.',
      activeHeaderFields: ['Porta Origem (5004)', 'Porta Destino (51200)', 'Length = 72B'],
    },
  ];
}

export function NetworkProtocolVisualizer() {
  const [protocol, setProtocol] = useState<SimProtocol>('tcp');
  const [simulateLoss, setSimulateLoss] = useState<boolean>(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.5>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [travelProgress, setTravelProgress] = useState<number>(1);
  const [completedCount, setCompletedCount] = useState<number>(1);

  const rafRef = useRef<number | null>(null);

  const steps = useMemo(
    () => buildSteps(protocol, simulateLoss),
    [protocol, simulateLoss]
  );

  // Reset animation cleanly whenever protocol or loss mode changes
  useEffect(() => {
    setIsPlaying(false);
    setActiveStepIdx(0);
    setCompletedCount(1);
    setTravelProgress(1);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [protocol, simulateLoss]);

  // Animate packet flight along the active wire arrow
  useEffect(() => {
    if (!isPlaying) return;

    const currentStep = steps[activeStepIdx];
    if (!currentStep) {
      setIsPlaying(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const durationMs = prefersReducedMotion ? 220 : Math.round(1350 / speed);
    let startTime: number | null = null;
    let pauseTimer: number | null = null;

    setTravelProgress(0);

    const tick = (ts: number) => {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(1, elapsed / durationMs);
      setTravelProgress(t);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCompletedCount((prev) => Math.max(prev, activeStepIdx + 1));
        if (activeStepIdx < steps.length - 1) {
          pauseTimer = window.setTimeout(() => {
            setActiveStepIdx((prev) => prev + 1);
          }, Math.round(380 / speed));
        } else {
          setIsPlaying(false);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pauseTimer) window.clearTimeout(pauseTimer);
    };
  }, [isPlaying, activeStepIdx, steps, speed]);

  const activeStep = steps[activeStepIdx] ?? steps[0];

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (activeStepIdx >= steps.length - 1 && travelProgress >= 1) {
      setActiveStepIdx(0);
      setCompletedCount(0);
      setTravelProgress(0);
    } else if (travelProgress >= 1 && activeStepIdx < steps.length - 1) {
      setActiveStepIdx((prev) => prev + 1);
    }
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (activeStepIdx < steps.length - 1) {
      const nextIdx = activeStepIdx + 1;
      setActiveStepIdx(nextIdx);
      setCompletedCount(nextIdx + 1);
      setTravelProgress(1);
    } else {
      setActiveStepIdx(0);
      setCompletedCount(1);
      setTravelProgress(1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIdx(0);
    setCompletedCount(1);
    setTravelProgress(1);
  };

  const handleSelectStep = (idx: number) => {
    setIsPlaying(false);
    setActiveStepIdx(idx);
    setCompletedCount(idx + 1);
    setTravelProgress(1);
  };

  // Live metrics up to activeStepIdx
  const visibleSteps = steps.slice(0, Math.max(completedCount, activeStepIdx + 1));
  const totalHeaderBytes = visibleSteps.reduce((sum, s) => sum + s.headerBytes, 0);
  const totalLatencyMs = visibleSteps.reduce((sum, s) => sum + s.latencyMs, 0);
  const droppedInFlow = visibleSteps.some((s) => s.dropped);
  const recoveredInFlow = visibleSteps.some((s) => s.retransmit);

  // SVG Layout geometry
  const clientX = 130;
  const serverX = 590;
  const topY = 78;
  const rowGap = 48;
  const svgHeight = Math.max(350, topY + steps.length * rowGap + 42);

  const accentHex = protocol === 'tcp' ? '#22D3EE' : '#F59E0B';
  const accentSoft = protocol === 'tcp' ? 'rgba(34, 211, 238, 0.14)' : 'rgba(245, 158, 11, 0.14)';

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 xl:flex-row xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-300">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Simulador Interativo de Pacotes · Camada 4
            </span>
            <span aria-hidden="true">·</span>
            <span>Veja o vai-e-vem entre Cliente e Servidor</span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold text-slate-50 sm:text-2xl">
            Visualizador: Handshake TCP (3 Vias) vs. Envio Direto UDP
          </h2>
        </div>

        {/* Protocol Switcher + Packet Loss Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#090D16] p-1">
            <button
              type="button"
              onClick={() => setProtocol('tcp')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                protocol === 'tcp'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              TCP (Handshake 3 Vias)
            </button>
            <button
              type="button"
              onClick={() => setProtocol('udp')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                protocol === 'udp'
                  ? 'bg-amber-400 text-[#1C1104]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              UDP (Envio Simples)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSimulateLoss((v) => !v)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              simulateLoss
                ? 'border-rose-400/50 bg-rose-500/15 text-rose-200'
                : 'border-slate-700 bg-[#090D16] text-slate-300 hover:border-slate-500'
            }`}
          >
            <WifiOff className="h-3.5 w-3.5" />
            {simulateLoss ? 'Perda de Pacote: ATIVA' : 'Simular Perda de Pacote'}
          </button>
        </div>
      </div>

      {/* Playback Controls Strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#090D16] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                {activeStepIdx >= steps.length - 1 && travelProgress >= 1
                  ? 'Simular Novamente'
                  : 'Simular Fluxo'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 whitespace-nowrap"
          >
            <StepForward className="h-3.5 w-3.5 text-cyan-300" />
            Próximo Passo
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reiniciar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 tabular-nums">
          <span>
            Etapa:{' '}
            <strong className="font-mono text-slate-100">
              {activeStepIdx + 1}/{steps.length}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <span>Velocidade:</span>
            {([0.75, 1, 1.5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`cursor-pointer rounded px-2 py-1 font-mono text-[11px] font-semibold transition-colors ${
                  speed === s
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Zone Educational Layout: Left SVG Sequence Stage | Right Inspector Deck */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT STAGE: Animated Sequence Diagram + Live Metrics */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060911] p-4">
            <svg
              viewBox={`0 0 720 ${svgHeight}`}
              className="h-auto w-full min-w-[540px]"
              role="img"
              aria-label={`Diagrama interativo do fluxo ${protocol.toUpperCase()} entre Cliente e Servidor`}
            >
              <defs>
                <marker
                  id="arrow-cyan"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#22D3EE" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                </marker>
                <marker
                  id="arrow-emerald"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
                </marker>
                <marker
                  id="arrow-rose"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#FB7185" />
                </marker>
              </defs>

              {/* Subtle background guide grid */}
              <rect x="0" y="0" width="720" height={svgHeight} fill="#060911" rx="8" />

              {/* Client Node Header */}
              <rect
                x="32"
                y="14"
                width="196"
                height="50"
                rx="10"
                fill="#111827"
                stroke={accentHex}
                strokeOpacity="0.55"
                strokeWidth="1.5"
              />
              <text
                x={clientX}
                y="34"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="13"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Cliente (Navegador / App)
              </text>
              <text
                x={clientX}
                y="52"
                textAnchor="middle"
                fill={accentHex}
                fontSize="10.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                192.168.10.15 · {activeStep.clientStateAfter}
              </text>

              {/* Server Node Header */}
              <rect
                x="492"
                y="14"
                width="196"
                height="50"
                rx="10"
                fill="#111827"
                stroke={accentHex}
                strokeOpacity="0.55"
                strokeWidth="1.5"
              />
              <text
                x={serverX}
                y="34"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="13"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {protocol === 'tcp' ? 'Servidor Web (443/TCP)' : 'Servidor Live (5004/UDP)'}
              </text>
              <text
                x={serverX}
                y="52"
                textAnchor="middle"
                fill={accentHex}
                fontSize="10.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                10.0.0.10 · {activeStep.serverStateAfter}
              </text>

              {/* Vertical Lifelines */}
              <line
                x1={clientX}
                y1="66"
                x2={clientX}
                y2={svgHeight - 16}
                stroke="#1E293B"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <line
                x1={serverX}
                y1="66"
                x2={serverX}
                y2={svgHeight - 16}
                stroke="#1E293B"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              {/* Time Axis Label */}
              <text
                x="14"
                y={svgHeight / 2}
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
                transform={`rotate(-90 14 ${svgHeight / 2})`}
              >
                TEMPO (ms) →
              </text>

              {/* Packet Exchange Arrows */}
              {steps.map((step, idx) => {
                const isFuture = idx > activeStepIdx && idx >= completedCount;
                const isCurrent = idx === activeStepIdx;
                const yStart = topY + idx * rowGap + 12;
                const yEnd = yStart + 20;

                const xStart = step.direction === 'c2s' ? clientX + 8 : serverX - 8;
                const xFullEnd = step.direction === 'c2s' ? serverX - 8 : clientX + 8;

                // Dropped packet terminates at ~54% across the wire
                const effectiveMaxT = step.dropped ? 0.54 : 1;
                const currentT = isCurrent
                  ? Math.min(effectiveMaxT, travelProgress * effectiveMaxT)
                  : isFuture
                    ? 0
                    : effectiveMaxT;

                const xNow = xStart + (xFullEnd - xStart) * currentT;
                const yNow = yStart + (yEnd - yStart) * currentT;

                const strokeColor = step.dropped
                  ? '#FB7185'
                  : step.retransmit
                    ? '#10B981'
                    : protocol === 'tcp'
                      ? '#22D3EE'
                      : '#F59E0B';

                const markerUrl = step.dropped
                  ? 'url(#arrow-rose)'
                  : step.retransmit
                    ? 'url(#arrow-emerald)'
                    : protocol === 'tcp'
                      ? 'url(#arrow-cyan)'
                      : 'url(#arrow-amber)';

                const midX = (clientX + serverX) / 2;
                const labelY = yStart - 2;

                return (
                  <g
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className="cursor-pointer"
                    opacity={isFuture ? 0.25 : 1}
                  >
                    {/* Subtle highlight band for active step */}
                    {isCurrent && (
                      <rect
                        x={clientX - 18}
                        y={yStart - 16}
                        width={serverX - clientX + 36}
                        height={rowGap - 2}
                        rx="8"
                        fill={step.dropped ? 'rgba(251, 113, 133, 0.08)' : accentSoft}
                      />
                    )}

                    {/* Faint full-path guide */}
                    <line
                      x1={xStart}
                      y1={yStart}
                      x2={step.dropped ? xStart + (xFullEnd - xStart) * 0.54 : xFullEnd}
                      y2={step.dropped ? yStart + (yEnd - yStart) * 0.54 : yEnd}
                      stroke="#334155"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Active/Completed Wire Arrow */}
                    {currentT > 0.02 && (
                      <line
                        x1={xStart}
                        y1={yStart}
                        x2={xNow}
                        y2={yNow}
                        stroke={strokeColor}
                        strokeWidth={isCurrent ? 2.8 : 2}
                        markerEnd={!step.dropped || currentT < 0.52 ? markerUrl : undefined}
                      />
                    )}

                    {/* Packet Loss X Marker */}
                    {step.dropped && currentT >= 0.52 && (
                      <g transform={`translate(${xNow}, ${yNow})`}>
                        <circle r="10" fill="#1F0B14" stroke="#FB7185" strokeWidth="2" />
                        <line x1="-4" y1="-4" x2="4" y2="4" stroke="#FB7185" strokeWidth="2" />
                        <line x1="4" y1="-4" x2="-4" y2="4" stroke="#FB7185" strokeWidth="2" />
                        <text
                          x="16"
                          y="4"
                          fill="#FDA4AF"
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          DESCARTADO
                        </text>
                      </g>
                    )}

                    {/* Moving Packet Envelope on Active Step */}
                    {isCurrent && (!step.dropped || currentT < 0.52) && (
                      <g transform={`translate(${xNow}, ${yNow})`}>
                        <rect
                          x="-24"
                          y="-10"
                          width="48"
                          height="20"
                          rx="5"
                          fill="#090D16"
                          stroke={strokeColor}
                          strokeWidth="1.8"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill={strokeColor}
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {protocol.toUpperCase()}
                        </text>
                      </g>
                    )}

                    {/* Step Index Dot on Sender Lifeline */}
                    <circle
                      cx={step.direction === 'c2s' ? clientX : serverX}
                      cy={yStart}
                      r="4"
                      fill={isFuture ? '#334155' : strokeColor}
                    />

                    {/* Packet Label & Header Details */}
                    <text
                      x={midX}
                      y={labelY}
                      textAnchor="middle"
                      fill={isCurrent ? '#F8FAFC' : '#CBD5E1'}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      #{step.index} {step.badge}
                    </text>
                    <text
                      x={midX}
                      y={yEnd + 7}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {step.detailLine}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Live Quantitative Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3.5">
              <p className="text-[11px] text-slate-400">Pacotes Trafegados</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
                {visibleSteps.length}
                <span className="text-xs font-normal text-slate-500">/{steps.length}</span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3.5">
              <p className="text-[11px] text-slate-400">Overhead Cabeçalho</p>
              <p
                className={`mt-1 font-mono text-lg font-bold tabular-nums ${
                  protocol === 'tcp' ? 'text-cyan-300' : 'text-amber-300'
                }`}
              >
                {totalHeaderBytes} B
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3.5">
              <p className="text-[11px] text-slate-400">Tempo Acumulado</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
                {totalLatencyMs} ms
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3.5">
              <p className="text-[11px] text-slate-400">Entrega dos Dados</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold">
                {protocol === 'tcp' ? (
                  recoveredInFlow || !droppedInFlow ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      100% Garantida
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Recuperando...
                    </span>
                  )
                ) : droppedInFlow ? (
                  <span className="inline-flex items-center gap-1 text-rose-300">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Com Perda (Sem ACK)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Zap className="h-3.5 w-3.5 shrink-0" />
                    Best-Effort Rápido
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT DECK: Current Packet Inspector + Clickable Step Timeline */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Active Step Detailed Annotation */}
          <div className="rounded-xl border border-slate-800 bg-[#090D16] p-5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={`font-mono font-semibold ${
                  activeStep.dropped
                    ? 'text-rose-300'
                    : protocol === 'tcp'
                      ? 'text-cyan-300'
                      : 'text-amber-300'
                }`}
              >
                Passo {activeStep.index} ·{' '}
                {activeStep.direction === 'c2s' ? 'Cliente → Servidor' : 'Servidor → Cliente'}
              </span>
              <span className="font-mono text-slate-400 tabular-nums">
                {activeStep.headerBytes}B hdr · {activeStep.latencyMs}ms
              </span>
            </div>

            <h3 className="mt-2 text-base font-bold text-slate-50">{activeStep.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {activeStep.explanation}
            </p>

            {/* Active Header Fields */}
            <div className="mt-4 border-t border-slate-800 pt-3.5">
              <p className="text-[11px] font-semibold text-slate-400">
                Campos ativos no cabeçalho {protocol.toUpperCase()} ({activeStep.headerBytes} bytes):
              </p>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-mono text-slate-200">
                {activeStep.activeHeaderFields.map((field, i) => (
                  <span key={field}>
                    {i > 0 && <span className="mr-2 text-slate-600">·</span>}
                    <span className={protocol === 'tcp' ? 'text-cyan-200' : 'text-amber-200'}>
                      {field}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Clickable Timeline List */}
          <div className="rounded-xl border border-slate-800 bg-[#090D16] p-4">
            <p className="text-xs font-semibold text-slate-300">
              Linha do Tempo da Troca (clique em qualquer etapa para inspecionar)
            </p>
            <div className="mt-3 space-y-1.5">
              {steps.map((step, idx) => {
                const isSelected = idx === activeStepIdx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? protocol === 'tcp'
                          ? 'border-cyan-400/60 bg-cyan-400/10 text-slate-50'
                          : 'border-amber-400/60 bg-amber-400/10 text-slate-50'
                        : 'border-slate-800/80 bg-[#111827] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          step.dropped
                            ? 'text-rose-400'
                            : step.retransmit
                              ? 'text-emerald-400'
                              : protocol === 'tcp'
                                ? 'text-cyan-300'
                                : 'text-amber-300'
                        }`}
                      >
                        0{step.index}
                      </span>
                      <span className="truncate font-mono font-semibold">{step.badge}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-slate-400">
                      {step.direction === 'c2s' ? 'C → S' : 'S → C'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Takeaway Comparison */}
          <div className="rounded-xl border border-slate-800 bg-[#0B111E] p-4 text-xs leading-relaxed text-slate-300">
            <strong className={protocol === 'tcp' ? 'text-cyan-300' : 'text-amber-300'}>
              Resumo da Simulação ({protocol.toUpperCase()}):
            </strong>{' '}
            {protocol === 'tcp'
              ? simulateLoss
                ? 'Mesmo perdendo o segmento DATA #1, o TCP detectou a falta de ACK, retransmitiu automaticamente e entregou 100% do arquivo íntegro — pagando apenas alguns milissegundos extras.'
                : 'O TCP precisou de 3 pacotes iniciais (SYN, SYN-ACK, ACK) antes de enviar dados, mas garantiu confirmação, ordem e encerramento limpo.'
              : simulateLoss
                ? 'Sem handshake e sem confirmação, o UDP descartou o quadro #2 perdido e continuou entregando o #3 imediatamente — mantendo latência mínima para streaming ao vivo ou jogos.'
                : 'O UDP enviou os dados já no 1º pacote com apenas 8 bytes de cabeçalho por datagrama, atingindo latência bem menor do que o TCP.'}
          </div>
        </div>
      </div>
    </section>
  );
}
