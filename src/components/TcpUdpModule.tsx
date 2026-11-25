import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  SkipForward,
  Zap,
} from 'lucide-react';
import {
  PORT_RANGE_SUMMARY,
  PORT_STATUS_LEGEND,
  PortRangeCategory,
  PortStatus,
  PortTransport,
  TCP_UDP_PORTS,
} from '../data/tcpUdpPorts';

type TransportProtocol = 'tcp' | 'udp';

interface SimulationStep {
  id: number;
  phase: string;
  direction: 'c2s' | 's2c' | 'drop' | 'idle';
  packetLabel: string;
  title: string;
  explanation: string;
  sentCount: number;
  deliveredInOrder: number;
  retransmissions: number;
  latencyMs: number;
  isLossEvent?: boolean;
  isRetransmit?: boolean;
}

interface HeaderField {
  id: string;
  name: string;
  bits: string;
  colSpan: string;
  explanation: string;
}

interface ScenarioQuizItem {
  id: string;
  scenario: string;
  context: string;
  correct: TransportProtocol;
  reason: string;
}

const TCP_STEPS_NORMAL: SimulationStep[] = [
  {
    id: 0,
    phase: 'Handshake 1/3',
    direction: 'c2s',
    packetLabel: 'SYN (seq=100)',
    title: '1. Pedido de Conexão (SYN)',
    explanation:
      'Antes de enviar qualquer dado, o cliente envia um pacote SYN perguntando: "Servidor, você está pronto para conversar? Vamos começar na sequência 100."',
    sentCount: 1,
    deliveredInOrder: 0,
    retransmissions: 0,
    latencyMs: 14,
  },
  {
    id: 1,
    phase: 'Handshake 2/3',
    direction: 's2c',
    packetLabel: 'SYN-ACK (ack=101)',
    title: '2. Aceite do Servidor (SYN-ACK)',
    explanation:
      'O servidor confirma o pedido do cliente (ACK=101) e envia o próprio sincronismo (SYN), reservando memória e porta para a sessão.',
    sentCount: 2,
    deliveredInOrder: 0,
    retransmissions: 0,
    latencyMs: 28,
  },
  {
    id: 2,
    phase: 'Handshake 3/3',
    direction: 'c2s',
    packetLabel: 'ACK (Conexão Aberta)',
    title: '3. Confirmação Final (Three-Way Handshake concluído)',
    explanation:
      'O cliente responde com ACK. O túnel confiável está estabelecido e os dois lados agora controlam sequência, erros e velocidade.',
    sentCount: 3,
    deliveredInOrder: 0,
    retransmissions: 0,
    latencyMs: 42,
  },
  {
    id: 3,
    phase: 'Dados #1 e #2',
    direction: 'c2s',
    packetLabel: 'DATA #1 · #2',
    title: '4. Envio Numerado de Segmentos',
    explanation:
      'O arquivo é fatiado em segmentos numerados (#1, #2, #3) para que o destino consiga remontar tudo na ordem exata, mesmo que cheguem por rotas diferentes.',
    sentCount: 5,
    deliveredInOrder: 2,
    retransmissions: 0,
    latencyMs: 58,
  },
  {
    id: 4,
    phase: 'Confirmação',
    direction: 's2c',
    packetLabel: 'ACK (#1, #2 OK)',
    title: '5. Recibo de Entrega (ACK)',
    explanation:
      'O servidor confirma que recebeu #1 e #2 sem corrupção (validado pelo Checksum) e autoriza o envio do próximo segmento.',
    sentCount: 6,
    deliveredInOrder: 2,
    retransmissions: 0,
    latencyMs: 72,
  },
  {
    id: 5,
    phase: 'Conclusão',
    direction: 'c2s',
    packetLabel: 'DATA #3 + FIN',
    title: '6. Entrega Completa e Encerramento Seguro',
    explanation:
      'O segmento #3 chega, todos os dados são entregues íntegros à aplicação (ex.: navegador ou download) e a conexão é encerrada ordenadamente com FIN/ACK.',
    sentCount: 7,
    deliveredInOrder: 3,
    retransmissions: 0,
    latencyMs: 88,
  },
];

const TCP_STEPS_LOSS: SimulationStep[] = [
  {
    id: 0,
    phase: 'Handshake',
    direction: 'c2s',
    packetLabel: 'SYN ↔ SYN-ACK ↔ ACK',
    title: '1. Conexão Estabelecida (3-Way Handshake)',
    explanation:
      'Cliente e servidor completam o aperto de mão em 3 etapas. Agora o TCP acompanha cada segmento enviado com um cronômetro (timeout).',
    sentCount: 3,
    deliveredInOrder: 0,
    retransmissions: 0,
    latencyMs: 42,
  },
  {
    id: 1,
    phase: 'Segmento #1',
    direction: 'c2s',
    packetLabel: 'DATA #1 → OK',
    title: '2. Segmento #1 entregue e confirmado',
    explanation:
      'O segmento #1 atravessa a rede sem problemas e o servidor confirma com ACK #1.',
    sentCount: 4,
    deliveredInOrder: 1,
    retransmissions: 0,
    latencyMs: 56,
  },
  {
    id: 2,
    phase: 'Perda na Rede',
    direction: 'drop',
    packetLabel: 'DATA #2 ✕ PERDIDO',
    title: '3. Segmento #2 se perdeu no congestionamento!',
    explanation:
      'Um roteador congestionado descartou o pacote #2 no meio do caminho. O servidor ainda recebe o #3, mas segura ele no buffer esperando o #2 para não entregar fora de ordem.',
    sentCount: 5,
    deliveredInOrder: 1,
    retransmissions: 0,
    latencyMs: 95,
    isLossEvent: true,
  },
  {
    id: 3,
    phase: 'Retransmissão',
    direction: 'c2s',
    packetLabel: 'REENVIO DATA #2',
    title: '4. TCP detecta falta de ACK e retransmite #2',
    explanation:
      'Como o recibo ACK #2 não chegou no prazo, o TCP reenvia automaticamente o segmento #2 e reduz temporariamente a velocidade (controle de congestionamento).',
    sentCount: 6,
    deliveredInOrder: 2,
    retransmissions: 1,
    latencyMs: 148,
    isRetransmit: true,
  },
  {
    id: 4,
    phase: 'Reordenação',
    direction: 's2c',
    packetLabel: 'ACK #3 (1, 2, 3 OK)',
    title: '5. Reordenação Completa e Integridade 100%',
    explanation:
      'Com o #2 recuperado, o destino junta #1 + #2 + #3 na ordem perfeita e entrega à aplicação sem nenhum byte corrompido — custando um pouco mais de tempo (latência).',
    sentCount: 7,
    deliveredInOrder: 3,
    retransmissions: 1,
    latencyMs: 164,
  },
];

const UDP_STEPS_NORMAL: SimulationStep[] = [
  {
    id: 0,
    phase: 'Sem Handshake',
    direction: 'c2s',
    packetLabel: 'DGRAM #1 (8B hdr)',
    title: '1. Envio Imediato — Zero Handshake',
    explanation:
      'O UDP não pede permissão nem abre sessão. Ele adiciona um cabeçalho minúsculo de 8 bytes e dispara o datagrama #1 direto para o IP e porta de destino.',
    sentCount: 1,
    deliveredInOrder: 1,
    retransmissions: 0,
    latencyMs: 9,
  },
  {
    id: 1,
    phase: 'Fluxo Contínuo',
    direction: 'c2s',
    packetLabel: 'DGRAM #2',
    title: '2. Disparo Contínuo sem Esperar ACK',
    explanation:
      'Sem aguardar confirmação do pacote #1, o remetente já envia o datagrama #2. Ideal para áudio, vídeo ao vivo e posição de personagens em jogos.',
    sentCount: 2,
    deliveredInOrder: 2,
    retransmissions: 0,
    latencyMs: 18,
  },
  {
    id: 2,
    phase: 'Baixa Latência',
    direction: 'c2s',
    packetLabel: 'DGRAM #3',
    title: '3. Entrega Ultrarrápida (Menor Atraso)',
    explanation:
      'Todos os 3 datagramas chegaram em tempo real com menos tráfego de controle e metade da latência do TCP.',
    sentCount: 3,
    deliveredInOrder: 3,
    retransmissions: 0,
    latencyMs: 26,
  },
];

const UDP_STEPS_LOSS: SimulationStep[] = [
  {
    id: 0,
    phase: 'Envio Imediato',
    direction: 'c2s',
    packetLabel: 'DGRAM #1 → OK',
    title: '1. Datagrama #1 entregue em tempo real',
    explanation:
      'O primeiro quadro de voz/jogo chega em apenas 9 ms, sem handshake e sem espera.',
    sentCount: 1,
    deliveredInOrder: 1,
    retransmissions: 0,
    latencyMs: 9,
  },
  {
    id: 1,
    phase: 'Perda na Rede',
    direction: 'drop',
    packetLabel: 'DGRAM #2 ✕ PERDIDO',
    title: '2. Datagrama #2 perdido — UDP não para para reenviar',
    explanation:
      'O pacote #2 se perde na rede. Como o UDP não usa confirmação (ACK) nem retransmissão, o remetente nem sabe da perda e segue enviando os próximos quadros.',
    sentCount: 2,
    deliveredInOrder: 1,
    retransmissions: 0,
    latencyMs: 18,
    isLossEvent: true,
  },
  {
    id: 2,
    phase: 'Tempo Real Mantido',
    direction: 'c2s',
    packetLabel: 'DGRAM #3 → OK',
    title: '3. Datagrama #3 chega na hora sem congelar a chamada',
    explanation:
      'Numa videochamada ou jogo online, receber o quadro atrasado de 2 segundos atrás seria inútil. Perde-se um micro-instante do #2, mas o #3 mantém tudo fluido e ao vivo.',
    sentCount: 3,
    deliveredInOrder: 2,
    retransmissions: 0,
    latencyMs: 27,
  },
];

const TCP_HEADER_FIELDS: HeaderField[] = [
  {
    id: 'src-port',
    name: 'Porta de Origem',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Identifica qual programa/aba no seu dispositivo enviou os dados (ex.: porta temporária 51422).',
  },
  {
    id: 'dst-port',
    name: 'Porta de Destino',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Indica qual serviço no servidor deve receber o segmento (ex.: 443 HTTPS, 22 SSH, 25 SMTP).',
  },
  {
    id: 'seq',
    name: 'Número de Sequência (SEQ)',
    bits: '32 bits',
    colSpan: 'col-span-12',
    explanation: 'Numera cada byte enviado para permitir remontar os dados na ordem exata e detectar pedaços faltantes.',
  },
  {
    id: 'ack',
    name: 'Número de Confirmação (ACK)',
    bits: '32 bits',
    colSpan: 'col-span-12',
    explanation: 'Informa ao remetente qual o próximo byte esperado — funcionando como o "recibo" oficial de entrega.',
  },
  {
    id: 'flags',
    name: 'Flags (SYN, ACK, FIN, RST, PSH)',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Controlam o ciclo de vida da conexão: abrir (SYN), confirmar (ACK), encerrar (FIN) ou abortar (RST).',
  },
  {
    id: 'window',
    name: 'Janela (Window Size)',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Controle de fluxo: avisa quantos bytes o receptor consegue receber agora sem encher sua memória.',
  },
  {
    id: 'checksum',
    name: 'Checksum + Ponteiro Urgente',
    bits: '32 bits',
    colSpan: 'col-span-12',
    explanation: 'Soma de verificação matemática que detecta se algum bit foi corrompido durante o trajeto na rede.',
  },
];

const UDP_HEADER_FIELDS: HeaderField[] = [
  {
    id: 'udp-src',
    name: 'Porta de Origem',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Identifica a aplicação remetente (opcional em respostas simples, mas usada para retorno).',
  },
  {
    id: 'udp-dst',
    name: 'Porta de Destino',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Direciona o datagrama ao serviço correto no destino (ex.: 53 DNS, 67/68 DHCP, 123 NTP).',
  },
  {
    id: 'udp-len',
    name: 'Comprimento (Length)',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Tamanho total do datagrama UDP (cabeçalho de 8 bytes + carga útil de dados).',
  },
  {
    id: 'udp-chk',
    name: 'Checksum',
    bits: '16 bits',
    colSpan: 'col-span-6',
    explanation: 'Verificação básica de integridade. Se houver erro, o datagrama é simplesmente descartado (sem reenvio).',
  },
];

const COMPARISON_ROWS = [
  {
    criterion: 'Tipo de comunicação',
    tcp: 'Orientado à conexão (abre sessão antes com 3-Way Handshake)',
    udp: 'Sem conexão (envia datagramas imediatamente)',
  },
  {
    criterion: 'Confiabilidade',
    tcp: 'Alta — garante entrega com recibos (ACK) e retransmissão',
    udp: 'Melhor esforço — não garante entrega nem reenvia perdas',
  },
  {
    criterion: 'Ordem dos pacotes',
    tcp: 'Garantida — remonta segmentos na ordem exata (SEQ)',
    udp: 'Não garantida — pacotes podem chegar fora de ordem',
  },
  {
    criterion: 'Controle de fluxo / congestionamento',
    tcp: 'Sim — ajusta velocidade conforme rede e receptor',
    udp: 'Não — envia na taxa definida pela aplicação',
  },
  {
    criterion: 'Tamanho do cabeçalho',
    tcp: '20 a 60 bytes (mais controle, maior sobrecarga)',
    udp: '8 bytes fixos (extremamente leve)',
  },
  {
    criterion: 'Velocidade e Latência',
    tcp: 'Latência moderada (handshake + confirmações)',
    udp: 'Latência mínima (mais rápido em tempo real)',
  },
  {
    criterion: 'Broadcast / Multicast',
    tcp: 'Não suporta (sempre ponto a ponto 1:1)',
    udp: 'Suporta (1 para vários — essencial para DHCP e IPTV)',
  },
  {
    criterion: 'Aplicações e Portas típicas',
    tcp: 'HTTP (80), HTTPS (443), SSH (22), FTP (21), SMTP (25)',
    udp: 'DNS (53), DHCP (67/68), VoIP/Meet, Jogos Online, QUIC (443)',
  },
];

const SCENARIO_QUIZ: ScenarioQuizItem[] = [
  {
    id: 'q1',
    scenario: 'Download de um instalador do sistema operacional (4,2 GB)',
    context: 'Se apenas 1 único byte vier corrompido ou faltando, o instalador não abre.',
    correct: 'tcp',
    reason: 'TCP é obrigatório aqui: ele confere cada segmento, reenvia partes perdidas e garante que o arquivo chegue 100% idêntico ao original.',
  },
  {
    id: 'q2',
    scenario: 'Chamada de voz e vídeo ao vivo no Discord ou Google Meet',
    context: 'A conversa precisa acontecer em tempo real; pausar para esperar um frame perdido trava o áudio.',
    correct: 'udp',
    reason: 'UDP é o ideal: prioriza latência mínima. Um micro-chiado de 20 ms é aceitável, mas esperar retransmissão destruiria a fluidez da conversa.',
  },
  {
    id: 'q3',
    scenario: 'Acesso ao site do banco e envio de um Pix via HTTPS',
    context: 'Os dados financeiros e o aperto de mão TLS exigem ordem exata e zero perda.',
    correct: 'tcp',
    reason: 'HTTPS tradicional opera sobre TCP (porta 443), assegurando entrega confiável, ordenada e íntegra de toda transação.',
  },
  {
    id: 'q4',
    scenario: 'Partida competitiva de jogo online (FPS / Battle Royale)',
    context: 'A posição dos jogadores é atualizada 60 vezes por segundo; dados antigos não servem mais.',
    correct: 'udp',
    reason: 'Jogos de ação usam UDP para enviar atualizações constantes com o menor ping possível — se um pacote cai, o próximo já traz a posição atual.',
  },
  {
    id: 'q5',
    scenario: 'Consulta rápida de DNS (traduzir "if.edu.br" em IP)',
    context: 'A pergunta e a resposta cabem em um único pacote pequeno e precisam acontecer antes da página abrir.',
    correct: 'udp',
    reason: 'Consultas DNS padrão usam UDP na porta 53 para evitar o atraso de 3 etapas do handshake TCP em cada site que você acessa.',
  },
];

export function TcpUdpModule() {
  const prefersReducedMotion = useReducedMotion();

  // Simulator state
  const [simProtocol, setSimProtocol] = useState<TransportProtocol>('tcp');
  const [simulateLoss, setSimulateLoss] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Header inspector state
  const [headerTab, setHeaderTab] = useState<TransportProtocol>('tcp');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('seq');

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, TransportProtocol>>({});

  const steps =
    simProtocol === 'tcp'
      ? simulateLoss
        ? TCP_STEPS_LOSS
        : TCP_STEPS_NORMAL
      : simulateLoss
        ? UDP_STEPS_LOSS
        : UDP_STEPS_NORMAL;

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)] ?? steps[0];

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 2100);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, steps.length]);

  const handleSwitchProtocol = (next: TransportProtocol) => {
    setSimProtocol(next);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleToggleLoss = (loss: boolean) => {
    setSimulateLoss(loss);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (stepIndex >= steps.length - 1) {
        setStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setStepIndex((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
  };

  const handleResetSim = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const activeHeaderFields = headerTab === 'tcp' ? TCP_HEADER_FIELDS : UDP_HEADER_FIELDS;
  const activeField =
    activeHeaderFields.find((f) => f.id === selectedFieldId) ?? activeHeaderFields[0];

  const handleSwitchHeaderTab = (next: TransportProtocol) => {
    setHeaderTab(next);
    setSelectedFieldId(next === 'tcp' ? 'seq' : 'udp-len');
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = SCENARIO_QUIZ.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div className="space-y-6">
      {/* 1. O QUE SÃO E QUAL SUA FUNCIONALIDADE EM REDES */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-mono font-semibold text-cyan-300">
            Camada 4 do Modelo OSI · Camada de Transporte
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Multiplexação por Portas · Confiabilidade vs. Velocidade
          </span>
        </div>

        <h2 className="mt-2 text-xl font-bold text-slate-50">
          Protocolos TCP e UDP: Para que servem e como funcionam em redes
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-300">
          Enquanto o protocolo <strong className="text-slate-100">IP</strong> (Camada 3) sabe
          levar um pacote até o computador certo na internet, são o{' '}
          <strong className="text-cyan-300">TCP</strong> e o{' '}
          <strong className="text-emerald-300">UDP</strong> (Camada 4 — Transporte) que decidem{' '}
          <strong className="text-slate-100">qual programa</strong> dentro desse computador vai
          receber os dados (por meio das <strong className="text-slate-100">portas</strong>) e{' '}
          <strong className="text-slate-100">como esses dados serão entregues</strong>: com
          garantia total de integridade ou com a maior velocidade possível.
        </p>

        {/* Functional Role of Transport Layer: 3 core responsibilities */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-[#071225] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Layers className="h-4 w-4 shrink-0" />
              1. Endereçamento por Portas
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Permite rodar vários aplicativos ao mesmo tempo no mesmo IP: o navegador usa a porta{' '}
              <code className="font-mono text-cyan-200">443</code>, o DNS usa a{' '}
              <code className="font-mono text-emerald-200">53</code> e o SSH usa a{' '}
              <code className="font-mono text-cyan-200">22</code>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Cpu className="h-4 w-4 shrink-0" />
              2. Segmentação de Dados
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Divide arquivos ou fluxos grandes em blocos menores (segmentos TCP ou datagramas UDP)
              que cabem na rede física sem travar outros usuários.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Gauge className="h-4 w-4 shrink-0" />
              3. Controle da Entrega
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Define o equilíbrio da comunicação: garantir zero erro com confirmações e reenvios
              (<strong className="text-cyan-200">TCP</strong>) ou eliminar atrasos priorizando tempo
              real (<strong className="text-emerald-200">UDP</strong>).
            </p>
          </div>
        </div>

        {/* Two side-by-side protocol summary blocks */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* TCP Summary */}
          <div className="rounded-xl border border-cyan-500/35 bg-[#071225] p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-cyan-200">
                  TCP — Transmission Control Protocol
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  Orientado à conexão · Confiável · Entrega ordenada
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-400" />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-100">Para que serve:</strong> Transportar dados que não
              podem sofrer nenhuma perda ou inversão de ordem — como páginas web, senhas, arquivos,
              e-mails e comandos remotos.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-100">Como funciona:</strong> Estabelece uma conexão
              prévia com o <em>Three-Way Handshake</em> (<code className="font-mono text-cyan-300">SYN → SYN-ACK → ACK</code>),
              numera cada segmento, exige confirmação de recebimento, reenvia o que se perder e
              ajusta a velocidade quando a rede congestiona.
            </p>
            <p className="mt-2.5 text-xs text-slate-400">
              <strong className="text-cyan-300">Analogia:</strong> Carta registrada com aviso de
              recebimento — você só considera entregue quando o destinatário assina o recibo.
            </p>
          </div>

          {/* UDP Summary */}
          <div className="rounded-xl border border-emerald-500/35 bg-[#071225] p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-emerald-200">
                  UDP — User Datagram Protocol
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  Sem conexão · Leve (8 bytes) · Latência ultrabaixa
                </p>
              </div>
              <Zap className="h-5 w-5 shrink-0 text-emerald-400" />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-100">Para que serve:</strong> Aplicações onde{' '}
              <em>velocidade e tempo real</em> importam mais do que recuperar um pacote isolado —
              como chamadas de áudio/vídeo, jogos online, lives, DNS e DHCP.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-100">Como funciona:</strong> Envia datagramas direto ao
              destino sem handshake, sem esperar confirmação (ACK) e sem retransmitir pacotes
              perdidos. Também permite <em>broadcast</em> e <em>multicast</em> (um para muitos).
            </p>
            <p className="mt-2.5 text-xs text-slate-400">
              <strong className="text-emerald-300">Analogia:</strong> Transmissão de rádio ao vivo
              — o sinal segue fluindo continuamente sem pausar para repetir uma palavra perdida.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SIMULADOR INTERATIVO PASSO A PASSO (TWO-ZONE SANDBOX) */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-50">
              Simulador Visual: TCP vs. UDP na Prática
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Alterne entre TCP e UDP e ative a perda de pacote para ver como cada protocolo reage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Protocol Segmented Switch */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#071225] p-1">
              <button
                type="button"
                onClick={() => handleSwitchProtocol('tcp')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  simProtocol === 'tcp'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                TCP (Confiável)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchProtocol('udp')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  simProtocol === 'udp'
                    ? 'bg-emerald-400 text-[#05131C]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                UDP (Rápido)
              </button>
            </div>

            {/* Network Condition Switch */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#071225] p-1">
              <button
                type="button"
                onClick={() => handleToggleLoss(false)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  !simulateLoss
                    ? 'bg-slate-200 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rede Estável
              </button>
              <button
                type="button"
                onClick={() => handleToggleLoss(true)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  simulateLoss
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Perder Pacote #2
              </button>
            </div>
          </div>
        </div>

        {/* Two-Zone Split: 7 cols Stage + 5 cols Step Controls & Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT: Animated SVG Wire Stage + Live Telemetry */}
          <div className="border-b border-slate-800 bg-[#050E1D] p-5 lg:col-span-7 lg:border-r lg:border-b-0">
            <TransportStageSvg
              protocol={simProtocol}
              step={currentStep}
              reduced={Boolean(prefersReducedMotion)}
            />

            {/* Step Explanation Box */}
            <div
              className={`mt-4 rounded-xl border p-4 ${
                currentStep.isLossEvent
                  ? 'border-rose-500/45 bg-rose-500/10'
                  : currentStep.isRetransmit
                    ? 'border-amber-400/45 bg-amber-400/10'
                    : simProtocol === 'tcp'
                      ? 'border-cyan-400/35 bg-[#071225]'
                      : 'border-emerald-400/35 bg-[#071225]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  className={`font-bold ${
                    currentStep.isLossEvent
                      ? 'text-rose-200'
                      : currentStep.isRetransmit
                        ? 'text-amber-200'
                        : simProtocol === 'tcp'
                          ? 'text-cyan-200'
                          : 'text-emerald-200'
                  }`}
                >
                  {currentStep.title}
                </span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  Etapa {stepIndex + 1}/{steps.length} · {currentStep.phase}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                {currentStep.explanation}
              </p>
            </div>

            {/* Live Tabular Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-3">
                <span className="block text-[11px] text-slate-400">Cabeçalho</span>
                <span className="mt-0.5 block font-mono text-sm font-bold text-slate-100 tabular-nums">
                  {simProtocol === 'tcp' ? '20 bytes' : '8 bytes'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-3">
                <span className="block text-[11px] text-slate-400">Entregues OK</span>
                <span className="mt-0.5 block font-mono text-sm font-bold text-emerald-300 tabular-nums">
                  {currentStep.deliveredInOrder}/3 dados
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-3">
                <span className="block text-[11px] text-slate-400">Retransmissões</span>
                <span
                  className={`mt-0.5 block font-mono text-sm font-bold tabular-nums ${
                    currentStep.retransmissions > 0 ? 'text-amber-300' : 'text-slate-200'
                  }`}
                >
                  {currentStep.retransmissions}
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#071225] p-3">
                <span className="block text-[11px] text-slate-400">Tempo Acumulado</span>
                <span className="mt-0.5 block font-mono text-sm font-bold text-cyan-300 tabular-nums">
                  {currentStep.latencyMs} ms
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Playback Controls + Interactive Timeline */}
          <div className="flex flex-col justify-between gap-4 p-5 lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    simProtocol === 'tcp'
                      ? 'bg-cyan-400 text-[#05131C] hover:bg-cyan-300'
                      : 'bg-emerald-400 text-[#05131C] hover:bg-emerald-300'
                  }`}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isPlaying ? 'Pausar' : stepIndex >= steps.length - 1 ? 'Repetir' : 'Reproduzir'}
                </button>
                <button
                  type="button"
                  onClick={handleStepForward}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#071225] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 whitespace-nowrap"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Próximo passo
                </button>
                <button
                  type="button"
                  onClick={handleResetSim}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reiniciar
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {steps.map((s, idx) => {
                  const isCurrent = idx === stepIndex;
                  const isPast = idx < stepIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setStepIndex(idx);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                        isCurrent
                          ? s.isLossEvent
                            ? 'border-rose-400/70 bg-rose-500/12 text-rose-100'
                            : simProtocol === 'tcp'
                              ? 'border-cyan-400/70 bg-cyan-400/12 text-cyan-100'
                              : 'border-emerald-400/70 bg-emerald-400/12 text-emerald-100'
                          : isPast
                            ? 'border-slate-800 bg-[#071225] text-slate-300'
                            : 'border-slate-800/70 bg-[#071225]/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">{s.title}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {s.packetLabel}
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-slate-500 tabular-nums">
                        {s.latencyMs} ms
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {simulateLoss
                ? simProtocol === 'tcp'
                  ? 'Observe: com perda no pacote #2, o TCP demorou mais (164 ms), porém entregou 3/3 dados completos e na ordem certa.'
                  : 'Observe: com perda no pacote #2, o UDP terminou em apenas 27 ms sem travar o fluxo, aceitando entregar 2/3 dados.'
                : 'Dica: clique em "Perder Pacote #2" no topo para enxergar a maior diferença prática entre TCP e UDP.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. ANATOMIA DO CABEÇALHO + TABELA COMPARATIVA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 cols: Interactive Header Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-5 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-50">Anatomia do Cabeçalho</h3>
              <p className="text-xs text-slate-400">
                Clique em cada campo para entender por que o TCP é mais completo e o UDP mais leve.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1">
              <button
                type="button"
                onClick={() => handleSwitchHeaderTab('tcp')}
                className={`cursor-pointer rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                  headerTab === 'tcp'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TCP (20 B)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchHeaderTab('udp')}
                className={`cursor-pointer rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                  headerTab === 'udp'
                    ? 'bg-emerald-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                UDP (8 B)
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-2">
            {activeHeaderFields.map((field) => {
              const selected = field.id === activeField.id;
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`${field.colSpan} cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? headerTab === 'tcp'
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                        : 'border-emerald-400 bg-emerald-400/15 text-emerald-100'
                      : 'border-slate-800 bg-[#071225] text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{field.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
                    {field.bits}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-[#050E1D] p-4">
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-bold ${
                  headerTab === 'tcp' ? 'text-cyan-300' : 'text-emerald-300'
                }`}
              >
                {activeField.name}
              </span>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {activeField.bits}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
              {activeField.explanation}
            </p>
          </div>
        </div>

        {/* Right 7 cols: Full Technical Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36] lg:col-span-7">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-base font-bold text-slate-50">Comparativo Direto: TCP × UDP</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Resumo rápido para provas, projetos de rede e análise de tráfego.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="border-b border-slate-800 bg-[#071225] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Característica</th>
                  <th className="px-4 py-3 font-semibold text-cyan-300">TCP</th>
                  <th className="px-4 py-3 font-semibold text-emerald-300">UDP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.criterion} className="hover:bg-[#0B111E]">
                    <td className="px-4 py-3 font-semibold text-slate-200">{row.criterion}</td>
                    <td className="px-4 py-3 text-slate-300">{row.tcp}</td>
                    <td className="px-4 py-3 text-slate-300">{row.udp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. DESAFIO INTERATIVO: QUAL PROTOCOLO ESCOLHER? */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-50">
              Teste seu Conhecimento: TCP ou UDP?
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Escolha o protocolo mais adequado para cada situação real de rede e confira o motivo.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="text-slate-400">
              Acertos:{' '}
              <strong className="font-mono text-emerald-300">
                {correctCount}/{SCENARIO_QUIZ.length}
              </strong>
            </span>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={() => setAnswers({})}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Refazer
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {SCENARIO_QUIZ.map((item, idx) => {
            const chosen = answers[item.id];
            const isCorrect = chosen === item.correct;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-[#071225] p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      0{idx + 1}. {item.scenario}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{item.context}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: 'tcp' }))}
                      className={`cursor-pointer rounded-lg border px-3.5 py-2 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                        chosen === 'tcp'
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
                            : 'border-rose-400 bg-rose-500/20 text-rose-200'
                          : 'border-slate-700 bg-[#0F1E36] text-slate-200 hover:border-cyan-400/60'
                      }`}
                    >
                      Usar TCP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: 'udp' }))}
                      className={`cursor-pointer rounded-lg border px-3.5 py-2 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                        chosen === 'udp'
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
                            : 'border-rose-400 bg-rose-500/20 text-rose-200'
                          : 'border-slate-700 bg-[#0F1E36] text-slate-200 hover:border-emerald-400/60'
                      }`}
                    >
                      Usar UDP
                    </button>
                  </div>
                </div>

                {chosen && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                      isCorrect
                        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                        : 'border-amber-400/35 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    )}
                    <div>
                      <strong>
                        {isCorrect
                          ? 'Correto!'
                          : `Na prática usa-se ${item.correct.toUpperCase()}.`}
                      </strong>{' '}
                      {item.reason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LISTA INTERATIVA DE PORTAS TCP E UDP (IANA) */}
      <TcpUdpPortsDirectory />
    </div>
  );
}

function TcpUdpPortsDirectory() {
  const [query, setQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'all' | PortRangeCategory>('all');
  const [transportFilter, setTransportFilter] = useState<'all' | PortTransport>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PortStatus>('all');

  const q = query.trim().toLowerCase();
  const filteredPorts = TCP_UDP_PORTS.filter((entry) => {
    if (rangeFilter !== 'all' && entry.range !== rangeFilter) return false;
    if (transportFilter !== 'all') {
      if (transportFilter === 'TCP' && !entry.transport.includes('TCP')) return false;
      if (transportFilter === 'UDP' && !entry.transport.includes('UDP')) return false;
      if (transportFilter === 'TCP/UDP' && entry.transport !== 'TCP/UDP') return false;
    }
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (!q) return true;
    return (
      entry.port.toLowerCase().includes(q) ||
      entry.service.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.transport.toLowerCase().includes(q)
    );
  });

  const getStatusClass = (status: PortStatus) => {
    if (status === 'Oficial') return 'text-emerald-300';
    if (status === 'Conflito') return 'text-rose-300';
    if (status === 'Não-oficial') return 'text-amber-300';
    return 'text-slate-400';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
      <div className="border-b border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-mono font-semibold text-cyan-300">
            Referência IANA · 0 a 65535
          </span>
          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
            Exibindo {filteredPorts.length} de {TCP_UDP_PORTS.length} registros
          </span>
        </div>

        <h3 className="mt-1.5 text-lg font-bold text-slate-50">
          Lista de Portas dos Protocolos TCP e UDP
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Consulte as portas mais importantes de redes, web, e-mail, bancos de dados, VPN e
          administração — organizadas pelos 3 intervalos oficiais da IANA e status de registro.
        </p>

        {/* 3 Official IANA Port Ranges */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {PORT_RANGE_SUMMARY.map((item) => {
            const active = rangeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRangeFilter(active ? 'all' : item.id)}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-cyan-400/70 bg-cyan-400/10'
                    : 'border-slate-800 bg-[#071225] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
                    {item.rangeLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {active ? 'Filtro ativo' : 'Filtrar faixa'}
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-100">{item.title}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-[#071225] p-3.5 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
          {PORT_STATUS_LEGEND.map((item) => (
            <div key={item.status} className="leading-relaxed">
              <strong className={getStatusClass(item.status)}>{item.status}:</strong>{' '}
              <span className="text-slate-400">{item.meaning}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[230px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por porta (443, 53, 3306), serviço (SSH, DNS, VPN, MySQL)..."
              aria-label="Buscar portas TCP e UDP"
              className="w-full rounded-lg border border-slate-700 bg-[#071225] py-2 pr-3 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1">
            {(['all', 'TCP', 'UDP', 'TCP/UDP'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTransportFilter(t)}
                className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  transportFilter === t
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'Todos' : t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1">
            {(['all', 'Oficial', 'Não-oficial', 'Conflito'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`cursor-pointer rounded px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-200 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'Status: Todos' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Tabular Ports List */}
      <div className="max-h-[460px] overflow-auto bg-[#050E1D]">
        {filteredPorts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Nenhuma porta encontrada com os filtros atuais. Tente buscar por{' '}
            <span className="font-mono text-cyan-300">22</span>,{' '}
            <span className="font-mono text-cyan-300">53</span>,{' '}
            <span className="font-mono text-cyan-300">443</span> ou{' '}
            <span className="font-mono text-cyan-300">MySQL</span>.
          </div>
        ) : (
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="sticky top-0 z-10 border-b border-slate-800 bg-[#0B111E] text-[11px] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Porta</th>
                <th className="px-4 py-3 font-semibold">Protocolo</th>
                <th className="px-4 py-3 font-semibold">Serviço / Aplicação</th>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 font-semibold">Status IANA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredPorts.map((entry) => (
                <tr key={`${entry.port}-${entry.service}`} className="hover:bg-[#0D1424]">
                  <td className="px-4 py-2.5 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {entry.port}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                    {entry.transport}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-100 whitespace-nowrap">
                    {entry.service}
                  </td>
                  <td className="px-4 py-2.5 leading-relaxed text-slate-300">
                    {entry.description}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-semibold whitespace-nowrap ${getStatusClass(
                      entry.status
                    )}`}
                  >
                    {entry.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TransportStageSvg({
  protocol,
  step,
  reduced,
}: {
  protocol: TransportProtocol;
  step: SimulationStep;
  reduced: boolean;
}) {
  const accent = protocol === 'tcp' ? '#3BE37A' : '#10B981';
  const packetFill = step.isLossEvent
    ? '#FB7185'
    : step.isRetransmit
      ? '#FBBF24'
      : accent;

  const animX =
    step.direction === 'c2s'
      ? [145, 455]
      : step.direction === 's2c'
        ? [455, 145]
        : step.direction === 'drop'
          ? [145, 300]
          : [300, 300];

  const animY = step.direction === 's2c' ? 124 : 74;

  return (
    <svg
      viewBox="0 0 600 200"
      className="h-auto w-full select-none"
      role="img"
      aria-label={`Simulação de envio de pacotes ${protocol.toUpperCase()}`}
    >
      <rect width="600" height="200" rx="12" fill="#071225" stroke="#1E293B" />

      {/* Upper TX lane (Client -> Server) */}
      <line x1="145" y1="74" x2="455" y2="74" stroke="#1E293B" strokeWidth="3" />
      <text
        x="300"
        y="52"
        textAnchor="middle"
        fill="#64748B"
        fontSize="9.5"
        fontFamily="JetBrains Mono, monospace"
      >
        ENVIO CLIENTE → SERVIDOR ({protocol.toUpperCase()})
      </text>

      {/* Lower RX lane (Server -> Client) */}
      <line
        x1="145"
        y1="124"
        x2="455"
        y2="124"
        stroke="#1E293B"
        strokeWidth="3"
        strokeDasharray={protocol === 'udp' ? '4 5' : undefined}
      />
      <text
        x="300"
        y="150"
        textAnchor="middle"
        fill="#64748B"
        fontSize="9.5"
        fontFamily="JetBrains Mono, monospace"
      >
        {protocol === 'tcp'
          ? 'CONFIRMAÇÃO SERVIDOR → CLIENTE (SYN-ACK / ACK)'
          : 'SEM CANAL DE CONFIRMAÇÃO (UDP NÃO EXIGE ACK)'}
      </text>

      {/* Mid-network router checkpoint */}
      <circle
        cx="300"
        cy="74"
        r="14"
        fill={step.isLossEvent ? '#3F0A18' : '#0C1424'}
        stroke={step.isLossEvent ? '#FB7185' : '#334155'}
        strokeWidth="1.6"
      />
      <text
        x="300"
        y="78"
        textAnchor="middle"
        fill={step.isLossEvent ? '#FDA4AF' : '#94A3B8'}
        fontSize="9"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {step.isLossEvent ? '✕' : 'NET'}
      </text>

      {/* Animated Packet Capsule */}
      <motion.g
        key={`${protocol}-${step.id}-${step.packetLabel}`}
        initial={{ x: animX[0], opacity: 1 }}
        animate={
          reduced
            ? { x: step.direction === 'drop' ? 300 : animX[1], opacity: 1 }
            : step.direction === 'drop'
              ? { x: [145, 300], opacity: [1, 1, 0.2] }
              : { x: animX, opacity: [0.85, 1, 1] }
        }
        transition={{
          duration: 1.4,
          repeat: Infinity,
          repeatDelay: 0.4,
          ease: 'easeInOut',
        }}
      >
        <rect
          x="-64"
          y={animY - 14}
          width="128"
          height="28"
          rx="8"
          fill="#050E1D"
          stroke={packetFill}
          strokeWidth="1.8"
        />
        <text
          x="0"
          y={animY + 4}
          textAnchor="middle"
          fill={packetFill}
          fontSize="9.5"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {step.packetLabel}
        </text>
      </motion.g>

      {/* Client Box */}
      <rect x="24" y="48" width="120" height="104" rx="12" fill="#0C1424" stroke={accent} strokeWidth="1.8" />
      <text x="84" y="84" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
        Cliente
      </text>
      <text x="84" y="102" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
        Porta :51422
      </text>
      <text x="84" y="122" textAnchor="middle" fill={accent} fontSize="9" fontFamily="JetBrains Mono, monospace">
        {protocol === 'tcp' ? 'Controla ACK' : 'Dispara direto'}
      </text>

      {/* Server Box */}
      <rect x="456" y="48" width="120" height="104" rx="12" fill="#0C1424" stroke="#38BDF8" strokeWidth="1.8" />
      <text x="516" y="84" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
        Servidor
      </text>
      <text x="516" y="102" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
        {protocol === 'tcp' ? 'Porta :443' : 'Porta :53 / VoIP'}
      </text>
      <text x="516" y="122" textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace">
        {protocol === 'tcp' ? 'Reordena SEQ' : 'Tempo real'}
      </text>

      {/* Bottom Protocol Mode Footnote */}
      <text
        x="300"
        y="184"
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="9.5"
        fontFamily="JetBrains Mono, monospace"
      >
        {protocol === 'tcp'
          ? 'TCP · 100% INTEGRIDADE E ORDEM GARANTIDA (HANDSHAKE + ACK + REENVIO)'
          : 'UDP · VELOCIDADE MÁXIMA E BAIXA LATÊNCIA (SEM HANDSHAKE E SEM REENVIO)'}
      </text>
    </svg>
  );
}
