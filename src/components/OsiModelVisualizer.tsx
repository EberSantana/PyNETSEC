import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowUp,
  Cable,
  Cpu,
  Globe,
  KeyRound,
  Layers,
  Network,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
} from 'lucide-react';
import { NetworkPacketFrame, NetworkVisualEvent } from '../types/ctf';

interface OsiModelVisualizerProps {
  event: NetworkVisualEvent | null;
  activePacket: NetworkPacketFrame | null;
}

interface OsiLayerSpec {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  pdu: string;
  shortRole: string;
  description: string;
  examples: string;
  headerTag: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  accentDot: string;
  icon: typeof Layers;
}

/**
 * As 7 camadas do Modelo OSI.
 * Armazenadas da 7 (topo) até a 1 (base) para renderização visual em pilha vertical
 * (onde a Camada 1 fica na base e a Camada 7 no topo — leitura de baixo para cima).
 */
const OSI_LAYERS_TOP_DOWN: OsiLayerSpec[] = [
  {
    number: 7,
    name: 'Aplicação',
    pdu: 'Dados',
    shortRole: 'Serviços diretos ao usuário e programas',
    description:
      'Fornece serviços de rede diretamente aos programas e usuários finais (ex.: HTTP/HTTPS, SMTP, POP3, DNS).',
    examples: 'HTTP/HTTPS · DNS · SMTP · POP3 · SSH · WHOIS',
    headerTag: 'APP',
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/60',
    accentBg: 'bg-cyan-500/12',
    accentDot: '#22D3EE',
    icon: Globe,
  },
  {
    number: 6,
    name: 'Apresentação',
    pdu: 'Dados formatados',
    shortRole: 'Formatação, tradução, compressão e criptografia',
    description:
      'Formata, traduz, comprime e criptografa os dados para que o sistema receptor os compreenda (ex.: JSON, TLS/SSL).',
    examples: 'TLS/SSL · UTF-8 · JSON · GZIP · Base64',
    headerTag: 'TLS/FMT',
    accentText: 'text-sky-300',
    accentBorder: 'border-sky-400/60',
    accentBg: 'bg-sky-500/12',
    accentDot: '#38BDF8',
    icon: KeyRound,
  },
  {
    number: 5,
    name: 'Sessão',
    pdu: 'Dados de sessão',
    shortRole: 'Estabelece, sincroniza e encerra sessões',
    description:
      'Estabelece, gerencia, sincroniza e encerra sessões de comunicação entre sistemas (ex.: NFS, SMB).',
    examples: 'NFS · SMB · RPC · Tokens / Controle de Diálogo',
    headerTag: 'SESS',
    accentText: 'text-indigo-300',
    accentBorder: 'border-indigo-400/60',
    accentBg: 'bg-indigo-500/12',
    accentDot: '#818CF8',
    icon: ShieldCheck,
  },
  {
    number: 4,
    name: 'Transporte',
    pdu: 'Segmentos / Datagramas',
    shortRole: 'Entrega ponta a ponta, portas e confiabilidade',
    description:
      'Garante a entrega de dados ponta a ponta entre aplicações, com controle de fluxo e confiabilidade ou baixa latência (ex.: TCP e UDP).',
    examples: 'TCP (SYN/ACK, confiável) · UDP (rápido) · Portas',
    headerTag: 'TCP/UDP',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/60',
    accentBg: 'bg-emerald-500/12',
    accentDot: '#10B981',
    icon: Cpu,
  },
  {
    number: 3,
    name: 'Rede',
    pdu: 'Pacotes',
    shortRole: 'Endereçamento IP e escolha da melhor rota',
    description:
      'Faz o endereçamento lógico (IPv4/IPv6) e escolhe o melhor caminho para encaminhar pacotes entre redes diferentes (ex.: roteador).',
    examples: 'IPv4 · IPv6 · ICMP (ping) · Roteador · TTL',
    headerTag: 'IP',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-400/60',
    accentBg: 'bg-amber-500/12',
    accentDot: '#FBBF24',
    icon: Network,
  },
  {
    number: 2,
    name: 'Enlace de Dados',
    pdu: 'Quadros (Frames)',
    shortRole: 'Quadros na rede local, MAC e controle de erros',
    description:
      'Organiza os bits em quadros (frames), identifica dispositivos na mesma rede local por endereços MAC e trata erros físicos (ex.: Ethernet, switch).',
    examples: 'Ethernet · Endereço MAC · Switch · Wi-Fi (802.11) · FCS',
    headerTag: 'MAC',
    accentText: 'text-orange-300',
    accentBorder: 'border-orange-400/60',
    accentBg: 'bg-orange-500/12',
    accentDot: '#FB923C',
    icon: Layers,
  },
  {
    number: 1,
    name: 'Física',
    pdu: 'Bits (0s e 1s)',
    shortRole: 'Sinais elétricos, ópticos ou de rádio no meio',
    description:
      'Transmite bits brutos (0s e 1s) por sinais elétricos, ópticos ou de rádio via cabos, conectores, Wi-Fi e Bluetooth.',
    examples: 'Cabos UTP/Fibra · RJ45 · Wi-Fi (RF) · Bluetooth · 0s e 1s',
    headerTag: 'BITS',
    accentText: 'text-rose-300',
    accentBorder: 'border-rose-400/60',
    accentBg: 'bg-rose-500/12',
    accentDot: '#FB7185',
    icon: Cable,
  },
];

interface OsiScenarioPreset {
  id: string;
  label: string;
  summary: string;
  layerContext: Record<number, string>;
  bitsPreview: string;
  activeHighlightLayers: number[];
}

const SCENARIO_PRESETS: OsiScenarioPreset[] = [
  {
    id: 'https',
    label: 'HTTPS (Web Segura)',
    summary: 'Requisição GET /portal criptografada com TLS atravessando todas as 7 camadas.',
    bitsPreview: '01001000 01010100 01010100 01010000 00101111 00110001 00101110 00110001',
    activeHighlightLayers: [7, 6, 4, 3, 2, 1],
    layerContext: {
      7: 'Navegador gera a requisição HTTP: GET /portal HTTP/1.1 Host: portal.if.edu.br',
      6: 'TLS 1.3 criptografa os dados e aplica compressão para ninguém ler a senha no caminho.',
      5: 'Mantém a sessão TLS/HTTP sincronizada entre o navegador e o servidor web.',
      4: 'TCP divide os dados em segmentos com porta de origem :52100 e destino :443 (confiável).',
      3: 'IPv4 adiciona cabeçalho com Origem 192.168.10.15 → Destino 10.0.0.10 e TTL=64.',
      2: 'Ethernet encapsula em quadro (frame) com MAC do aluno → MAC do roteador + checksum FCS.',
      1: 'Placa de rede converte o quadro em pulsos elétricos / ondas Wi-Fi (0s e 1s) no meio físico.',
    },
  },
  {
    id: 'ping',
    label: 'Ping (ICMP)',
    summary: 'Teste de conectividade que atua principalmente na Camada 3 (Rede) sem usar portas TCP/UDP.',
    bitsPreview: '00001000 00000000 11110111 11111111 00011010 00101011 00000000 00000001',
    activeHighlightLayers: [3, 2, 1],
    layerContext: {
      7: 'Utilitário ping apenas exibe o resultado no terminal; o protocolo ICMP roda abaixo na Camada 3.',
      6: 'Não há criptografia TLS nem codificação JSON no pacote ICMP simples.',
      5: 'Não cria sessão persistente: cada Echo Request tem apenas um número de sequência (seq=1, 2...).',
      4: 'ICMP não usa TCP nem UDP — por isso o ping não testa portas específicas (como 80 ou 443).',
      3: 'Camada principal do ping! Monta pacote ICMP Tipo 8 (Echo Request) com IP 192.168.10.15 → 10.0.0.10 e TTL=64.',
      2: 'Quadro Ethernet entrega o pacote IP até o MAC do gateway local 192.168.10.1.',
      1: 'Bits 0s e 1s viajam pelo cabo/Wi-Fi até o roteador e de lá até o servidor alvo.',
    },
  },
  {
    id: 'nmap',
    label: 'Nmap (TCP SYN)',
    summary: 'Varredura de portas focada na Camada 4 (Transporte TCP) e banners da Camada 7.',
    bitsPreview: '01000101 00000000 00000000 00111100 10101100 10111000 00000000 01010000',
    activeHighlightLayers: [7, 4, 3, 2, 1],
    layerContext: {
      7: 'No modo -sV, lê o banner da aplicação (ex.: nginx 1.24.0, OpenSSH 8.9, MySQL 5.7).',
      6: 'Identifica se a porta negocia criptografia TLS/SSL (como na porta 443).',
      5: 'No scan half-open (-sS), o Nmap envia RST antes mesmo de abrir uma sessão completa.',
      4: 'Camada principal do Nmap! Dispara TCP SYN para cada porta: SYN-ACK = aberta, RST-ACK = fechada, silêncio = filtrada.',
      3: 'Roteia os pacotes IP até 10.0.0.10; firewalls de camada 3/4 podem descartar portas como 8080.',
      2: 'Switch encaminha os quadros Ethernet usando os endereços MAC na sub-rede do laboratório.',
      1: 'Transmissão física dos sinais digitais pelo enlace de rede do laboratório.',
    },
  },
  {
    id: 'dns',
    label: 'DNS (nslookup)',
    summary: 'Tradução de nomes para IP combinando Camada 7 (DNS) sobre Camada 4 (UDP porta 53).',
    bitsPreview: '10001010 00011100 00000001 00000000 00000000 00000001 00000000 00000000',
    activeHighlightLayers: [7, 4, 3, 2, 1],
    layerContext: {
      7: 'Protocolo DNS formula a pergunta: "Qual o registro A (IPv4) de portal.if.edu.br?"',
      6: 'Codifica os rótulos do domínio no formato binário DNS padronizado.',
      5: 'Usa um ID de transação (ex.: 0x8a1c) para associar a resposta à pergunta original.',
      4: 'Usa UDP porta 53 (baixa latência, sem handshake) para responder em poucos milissegundos.',
      3: 'Endereça o pacote IP ao servidor resolvedor 10.0.0.20 (dns.if.lab).',
      2: 'Envia o quadro Ethernet pelo switch local usando o endereço MAC do servidor DNS.',
      1: 'Bits transmitidos pelo cabo/rádio até a placa de rede do servidor 10.0.0.20.',
    },
  },
];

// Animation step sequence: 0..6 = Encapsulation (Origin 7 -> 1), 7 = Physical Wire (Bits), 8..14 = Decapsulation (Target 1 -> 7)
interface EncapStep {
  phase: 'encap' | 'wire' | 'decap';
  layer: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  side: 'origin' | 'wire' | 'target';
  label: string;
}

const ENCAP_STEPS: EncapStep[] = [
  { phase: 'encap', layer: 7, side: 'origin', label: 'Origem · L7 Aplicação cria os dados' },
  { phase: 'encap', layer: 6, side: 'origin', label: 'Origem · L6 Apresentação formata/cifra' },
  { phase: 'encap', layer: 5, side: 'origin', label: 'Origem · L5 Sessão controla o diálogo' },
  { phase: 'encap', layer: 4, side: 'origin', label: 'Origem · L4 Transporte adiciona TCP/UDP' },
  { phase: 'encap', layer: 3, side: 'origin', label: 'Origem · L3 Rede adiciona cabeçalho IP' },
  { phase: 'encap', layer: 2, side: 'origin', label: 'Origem · L2 Enlace monta o Quadro (MAC)' },
  { phase: 'encap', layer: 1, side: 'origin', label: 'Origem · L1 Física converte em Bits (0 e 1)' },
  { phase: 'wire', layer: 1, side: 'wire', label: 'Meio Físico · Bits trafegam por cabo/Wi-Fi' },
  { phase: 'decap', layer: 1, side: 'target', label: 'Destino · L1 Física recebe os sinais (0 e 1)' },
  { phase: 'decap', layer: 2, side: 'target', label: 'Destino · L2 Enlace valida MAC e remove quadro' },
  { phase: 'decap', layer: 3, side: 'target', label: 'Destino · L3 Rede confere IP destino' },
  { phase: 'decap', layer: 4, side: 'target', label: 'Destino · L4 Transporte entrega à porta correta' },
  { phase: 'decap', layer: 5, side: 'target', label: 'Destino · L5 Sessão sincroniza a conversa' },
  { phase: 'decap', layer: 6, side: 'target', label: 'Destino · L6 Apresentação decifra/decodifica' },
  { phase: 'decap', layer: 7, side: 'target', label: 'Destino · L7 Aplicação lê os dados finais' },
];

function buildDynamicLayerContext(
  event: NetworkVisualEvent,
  packet: NetworkPacketFrame
): Record<number, string> {
  const isHttpPlaintext =
    packet.proto === 'HTTP' || packet.payload.toLowerCase().includes('texto puro');
  const isDns = packet.proto === 'DNS' || event.tool === 'nslookup';
  const isIcmp = packet.proto === 'ICMP' || event.tool === 'ping';
  const isWhois = packet.proto === 'WHOIS' || event.tool === 'whois';
  const isTls = packet.dst.endsWith(':443') || packet.src.endsWith(':443');

  return {
    7: isIcmp
      ? `Ferramenta "${event.tool}" exibe estatísticas no terminal; o pacote trafega com ICMP na Camada 3.`
      : isDns
        ? `Aplicação DNS envia/recebe consulta: "${packet.payload}".`
        : isWhois
          ? `Cliente WHOIS consulta titularidade: "${packet.payload}".`
          : `Aplicação (${packet.proto}) processa payload: "${packet.payload}".`,
    6: isTls
      ? 'TLS 1.3 criptografa o conteúdo na porta 443 — um sniffer na rede não consegue ler os dados.'
      : isHttpPlaintext
        ? 'ALERTA DE SEGURANÇA: Sem TLS/SSL na Camada 6! Os dados seguem em texto puro e podem ser lidos por um sniffer.'
        : 'Codificação ASCII/UTF-8 padrão dos cabeçalhos e texto do pacote capturado.',
    5: isIcmp
      ? 'ICMP não mantém sessão; usa identificador e número de sequência para parear pergunta e resposta.'
      : `Controla o diálogo ativo entre ${packet.src} e ${packet.dst} (${packet.flags}).`,
    4: isIcmp
      ? 'ICMP atua direto sobre IP (Camada 3), sem cabeçalho TCP ou UDP.'
      : isDns
        ? `UDP (sem handshake, baixa latência) entrega datagrama à porta 53 (${packet.src} → ${packet.dst}).`
        : `TCP controla portas e flags [${packet.flags}] entre ${packet.src} e ${packet.dst}.`,
    3: `IPv4 roteia o pacote (${packet.bytes} B · TTL ${packet.ttl}) de ${packet.src.split(':')[0]} para ${packet.dst.split(':')[0]}.`,
    2: `Enlace Ethernet organiza o pacote em quadro (Frame) com endereço MAC local (eth0-lab) e verifica erros (FCS).`,
    1: `Camada Física transmite ${packet.bytes * 8} bits (0s e 1s) por sinais elétricos ou ondas Wi-Fi no enlace do laboratório.`,
  };
}

export function OsiModelVisualizer({ event, activePacket }: OsiModelVisualizerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('https');
  const [selectedLayerNum, setSelectedLayerNum] = useState<number>(7);
  const [isAnimating, setIsAnimating] = useState(false);
  const [encapIndex, setEncapIndex] = useState<number>(0);

  const useLiveCapture = Boolean(event && activePacket);

  const activePreset = useMemo(
    () => SCENARIO_PRESETS.find((p) => p.id === selectedPresetId) ?? SCENARIO_PRESETS[0],
    [selectedPresetId]
  );

  // Dynamic context per layer (either from live sandbox packet or chosen preset)
  const layerContextMap = useMemo(() => {
    if (useLiveCapture && event && activePacket) {
      return buildDynamicLayerContext(event, activePacket);
    }
    return activePreset.layerContext;
  }, [useLiveCapture, event, activePacket, activePreset]);

  // Auto-advance encapsulation/decapsulation animation
  useEffect(() => {
    if (!isAnimating) return;
    const timer = window.setTimeout(() => {
      setEncapIndex((prev) => {
        const next = prev + 1;
        if (next >= ENCAP_STEPS.length) {
          setIsAnimating(false);
          return prev;
        }
        setSelectedLayerNum(ENCAP_STEPS[next].layer);
        return next;
      });
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [isAnimating, encapIndex]);

  const currentEncapStep = ENCAP_STEPS[encapIndex];
  const selectedLayer =
    OSI_LAYERS_TOP_DOWN.find((l) => l.number === selectedLayerNum) ?? OSI_LAYERS_TOP_DOWN[0];

  const handleToggleAnimation = () => {
    if (!isAnimating) {
      if (encapIndex >= ENCAP_STEPS.length - 1) {
        setEncapIndex(0);
        setSelectedLayerNum(7);
      } else {
        setSelectedLayerNum(ENCAP_STEPS[encapIndex].layer);
      }
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  };

  const handleStepEncap = () => {
    setIsAnimating(false);
    const next = (encapIndex + 1) % ENCAP_STEPS.length;
    setEncapIndex(next);
    setSelectedLayerNum(ENCAP_STEPS[next].layer);
  };

  const handleResetEncap = () => {
    setIsAnimating(false);
    setEncapIndex(0);
    setSelectedLayerNum(7);
  };

  // How many headers have wrapped around the data at this point in encapsulation
  const wrappedHeadersCount = useMemo(() => {
    if (currentEncapStep.phase === 'encap') {
      // L7 -> 1, L6 -> 2, ..., L1 -> 7
      return 8 - currentEncapStep.layer;
    }
    if (currentEncapStep.phase === 'wire') return 7;
    // Decapsulation: L1 -> 7, L2 -> 6, ..., L7 -> 1
    return 8 - currentEncapStep.layer;
  }, [currentEncapStep]);

  const headerBlocks = [
    { layer: 2, label: 'MAC (L2)', tone: 'border-orange-400/50 bg-orange-500/15 text-orange-200' },
    { layer: 3, label: 'IP (L3)', tone: 'border-amber-400/50 bg-amber-500/15 text-amber-200' },
    { layer: 4, label: 'TCP/UDP (L4)', tone: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' },
    { layer: 5, label: 'SESS (L5)', tone: 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200' },
    { layer: 6, label: 'TLS/FMT (L6)', tone: 'border-sky-400/50 bg-sky-500/15 text-sky-200' },
    { layer: 7, label: 'DADOS (L7)', tone: 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100' },
    { layer: 2, label: 'FCS (L2)', tone: 'border-orange-400/40 bg-orange-500/10 text-orange-300' },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Context & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#090D16] px-4 py-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-bold text-slate-100">
              Modelo OSI — As 7 Camadas (1 Física na base → 7 Aplicação no topo)
            </span>
            {useLiveCapture && event && activePacket && (
              <span className="font-mono text-[11px] text-emerald-300">
                · Sincronizado com {event.tool} #{activePacket.seq} ({activePacket.proto})
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Clique em qualquer camada para inspecionar ou anime o encapsulamento (descida 7 → 1) e
            desencapsulamento (subida 1 → 7).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleAnimation}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
          >
            {isAnimating ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pausar fluxo
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Animar 7 → 1 → 7
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepEncap}
            title="Avançar uma camada"
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500"
          >
            <StepForward className="h-3.5 w-3.5" />
            Passo
          </button>

          <button
            type="button"
            onClick={handleResetEncap}
            title="Reiniciar encapsulamento"
            aria-label="Reiniciar encapsulamento"
            className="cursor-pointer rounded-lg border border-slate-700 bg-[#111827] p-1.5 text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Example Protocol Selector (when inspecting without an active live packet, or to compare) */}
      {!useLiveCapture && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Cenário didático:</span>
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPresetId(preset.id)}
              className={`cursor-pointer rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedPresetId === preset.id
                  ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
                  : 'border-slate-800 bg-[#090D16] text-slate-300 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Main 12-Col OSI Interactive Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT (7 cols): Interactive 7-Layer Stack (Origin -> Wire -> Target) */}
        <div className="rounded-xl border border-slate-800 bg-[#060911] p-4 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <ArrowDown className="h-3.5 w-3.5" />
              ORIGEM (Encapsula 7 → 1)
            </span>
            <span className="hidden text-slate-500 sm:inline">
              Ordem real: 1 (base) até 7 (topo)
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              DESTINO (Desencapsula 1 → 7)
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="space-y-1.5">
            {OSI_LAYERS_TOP_DOWN.map((layer) => {
              const Icon = layer.icon;
              const isSelected = selectedLayerNum === layer.number;
              const isOriginActive =
                currentEncapStep.side === 'origin' && currentEncapStep.layer === layer.number;
              const isTargetActive =
                currentEncapStep.side === 'target' && currentEncapStep.layer === layer.number;
              const isWireActive =
                currentEncapStep.side === 'wire' && layer.number === 1;

              return (
                <button
                  key={layer.number}
                  type="button"
                  onClick={() => {
                    setIsAnimating(false);
                    setSelectedLayerNum(layer.number);
                  }}
                  className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? `${layer.accentBorder} ${layer.accentBg}`
                      : 'border-slate-800/90 bg-[#0B111E] hover:border-slate-700'
                  }`}
                >
                  {/* Origin Side Active Marker */}
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums ${
                        isSelected
                          ? `${layer.accentText} bg-[#060911]`
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {layer.number}
                    </span>

                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? layer.accentText : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-slate-100' : 'text-slate-200'
                          }`}
                        >
                          {layer.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          · {layer.pdu}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-slate-400">
                        {layer.shortRole}
                      </p>
                    </div>
                  </div>

                  {/* Live Traversal Status Indicator */}
                  <div className="flex shrink-0 items-center gap-2 font-mono text-[10px]">
                    {isOriginActive && (
                      <span className="rounded border border-cyan-400/60 bg-cyan-500/20 px-1.5 py-0.5 font-semibold text-cyan-200">
                        ↓ ENCAPSULANDO
                      </span>
                    )}
                    {isWireActive && (
                      <span className="rounded border border-rose-400/60 bg-rose-500/20 px-1.5 py-0.5 font-semibold text-rose-200">
                        0101 → MEIO FÍSICO
                      </span>
                    )}
                    {isTargetActive && (
                      <span className="rounded border border-emerald-400/60 bg-emerald-500/20 px-1.5 py-0.5 font-semibold text-emerald-200">
                        ↑ DESENCAPSULANDO
                      </span>
                    )}
                    {!isOriginActive && !isTargetActive && !isWireActive && (
                      <span className="hidden text-slate-500 sm:inline">{layer.headerTag}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Physical Medium Animated Bit Stream (Camada 1) */}
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-[#090D16] px-3 py-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-rose-300 font-semibold">
                MEIO FÍSICO (CAMADA 1 · BITS 0s e 1s)
              </span>
              <span className="text-slate-400">{currentEncapStep.label}</span>
            </div>
            <div className="relative mt-1.5 overflow-hidden rounded bg-[#05080F] px-2.5 py-1.5 font-mono text-[11px] text-cyan-300/90">
              <motion.div
                key={`bits-${encapIndex}`}
                initial={prefersReducedMotion ? { x: 0 } : { x: currentEncapStep.phase === 'wire' ? -30 : 0 }}
                animate={prefersReducedMotion ? { x: 0 } : { x: currentEncapStep.phase === 'wire' ? 30 : 0 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="truncate tracking-wider"
              >
                {activePreset.bitsPreview} · 01101100 01100001 01100010
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): Layer Deep-Dive + Live Encapsulation "Russian Doll" Wrapper */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#090D16] p-4 lg:col-span-5">
          <div className="space-y-3">
            {/* Selected Layer Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`font-bold ${selectedLayer.accentText}`}>
                    CAMADA {selectedLayer.number} DE 7
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">PDU: {selectedLayer.pdu}</span>
                </div>
                <h3 className="mt-0.5 text-base font-bold text-slate-100">
                  {selectedLayer.number}. {selectedLayer.name}
                </h3>
              </div>
              <selectedLayer.icon className={`h-5 w-5 shrink-0 ${selectedLayer.accentText}`} />
            </div>

            {/* Official Concept Explanation */}
            <p className="text-xs leading-relaxed text-slate-200">
              {selectedLayer.description}
            </p>

            {/* Protocols & Devices */}
            <div className="rounded-lg border border-slate-800 bg-[#060911] px-3 py-2">
              <span className="block font-mono text-[10px] text-slate-500">
                PROTOCOLOS, TECNOLOGIAS E EQUIPAMENTOS
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-slate-200">
                {selectedLayer.examples}
              </span>
            </div>

            {/* What happens in THIS layer in practice right now */}
            <div
              className={`rounded-lg border px-3 py-2.5 ${selectedLayer.accentBorder} ${selectedLayer.accentBg}`}
            >
              <span className={`block font-mono text-[10px] font-semibold ${selectedLayer.accentText}`}>
                {useLiveCapture && event
                  ? `NA PRÁTICA (SEU COMANDO ${event.tool.toUpperCase()})`
                  : `NA PRÁTICA (${activePreset.label.toUpperCase()})`}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-100">
                {layerContextMap[selectedLayer.number]}
              </p>
            </div>
          </div>

          {/* Encapsulation Header Nesting Visualizer */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200">
                Encapsulamento do Pacote
              </span>
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                {currentEncapStep.layer === 1
                  ? 'Convertido em Bits (0s e 1s)'
                  : `${wrappedHeadersCount} camada(s) montadas`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#060911] p-2 font-mono text-[10px]">
              {headerBlocks.map((blk, idx) => {
                const isIncluded = blk.layer >= currentEncapStep.layer;
                const isFocused = blk.layer === selectedLayerNum;
                return (
                  <span
                    key={`${blk.label}-${idx}`}
                    className={`rounded border px-1.5 py-1 transition-all ${
                      isFocused
                        ? `${blk.tone} ring-1 ring-white/40`
                        : isIncluded
                          ? blk.tone
                          : 'border-slate-800/70 bg-slate-950/60 text-slate-600'
                    }`}
                  >
                    {blk.label}
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Ao descer da Camada 7 para a 1, cada camada adiciona seu cabeçalho. No destino, o
              processo se inverte (1 → 7), removendo cada envelope até entregar os dados ao programa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
