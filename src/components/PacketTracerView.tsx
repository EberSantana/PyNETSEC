import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cable,
  CheckCircle2,
  Cpu,
  Laptop,
  Monitor,
  MousePointer2,
  Network,
  Play,
  Plus,
  Power,
  Radio,
  RotateCcw,
  Router as RouterIcon,
  Send,
  Server,
  Settings2,
  Terminal,
  Trash2,
  Wifi,
  BookOpen,
} from 'lucide-react';
import {
  CABLE_META,
  DEVICE_META,
  generateRandomMac,
  PACKET_TRACER_PRESETS,
  PTCableType,
  PTDevice,
  PTDeviceType,
  PTLink,
  PTPacketHop,
  PTProtocol,
} from '../data/packetTracerPresets';
import {
  executePacketTracerCommand,
  getNetworkAddress,
  isSameSubnet,
  isValidIpv4,
  maskToPrefix,
  PTArpEntry,
} from '../services/packetTracerEngine';

type ToolMode =
  | 'select'
  | 'cable-ethernet'
  | 'cable-crossover'
  | 'cable-fiber'
  | 'cable-wireless'
  | 'send-pdu'
  | 'delete';

type RightPanelTab = 'cli' | 'config' | 'guide';

interface TerminalLine {
  id: string;
  kind: 'prompt' | 'info' | 'stdout' | 'error' | 'success';
  deviceName?: string;
  text: string;
}

const CANVAS_W = 880;
const CANVAS_H = 510;

const PROTOCOL_STYLE: Record<
  PTProtocol,
  { stroke: string; fill: string; text: string; badgeBg: string }
> = {
  ARP: { stroke: '#F59E0B', fill: '#FEF3C7', text: 'text-amber-300', badgeBg: '#451A03' },
  ICMP: { stroke: '#22D3EE', fill: '#CFFAFE', text: 'text-cyan-300', badgeBg: '#083344' },
  DHCP: { stroke: '#34D399', fill: '#D1FAE5', text: 'text-emerald-300', badgeBg: '#064E3B' },
  DNS: { stroke: '#A78BFA', fill: '#EDE9FE', text: 'text-violet-300', badgeBg: '#2E1065' },
  TCP: { stroke: '#38BDF8', fill: '#E0F2FE', text: 'text-sky-300', badgeBg: '#0C4A6E' },
  HTTP: { stroke: '#4ADE80', fill: '#DCFCE7', text: 'text-emerald-300', badgeBg: '#052E16' },
  DROP: { stroke: '#FB7185', fill: '#FFE4E6', text: 'text-rose-300', badgeBg: '#4C0519' },
};

function clonePreset(presetId: string) {
  const found = PACKET_TRACER_PRESETS.find((p) => p.id === presetId) ?? PACKET_TRACER_PRESETS[0];
  return {
    preset: found,
    devices: found.devices.map((d) => ({
      ...d,
      interfaces: d.interfaces ? d.interfaces.map((i) => ({ ...i })) : undefined,
      services: d.services ? { ...d.services } : undefined,
      dhcpPool: d.dhcpPool ? { ...d.dhcpPool } : undefined,
      dnsRecords: d.dnsRecords ? { ...d.dnsRecords } : undefined,
    })),
    links: found.links.map((l) => ({ ...l })),
  };
}

function renderDeviceGlyph(type: PTDeviceType, accent: string) {
  switch (type) {
    case 'pc':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-15" y="-13" width="30" height="20" rx="2.5" fill="#0B1220" />
          <line x1="-6" y1="7" x2="-6" y2="12" />
          <line x1="6" y1="7" x2="6" y2="12" />
          <line x1="-11" y1="12" x2="11" y2="12" />
        </g>
      );
    case 'laptop':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-13" y="-12" width="26" height="17" rx="2" fill="#0B1220" />
          <path d="M-17 5 L17 5 L14 11 L-14 11 Z" fill="#0F172A" />
        </g>
      );
    case 'switch':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-19" y="-11" width="38" height="22" rx="3" fill="#0B1220" />
          <path d="M-11 -4 L8 -4 M5 -7 L8 -4 L5 -1" />
          <path d="M11 4 L-8 4 M-5 1 L-8 4 L-5 7" />
        </g>
      );
    case 'router':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="0" cy="0" r="18" fill="#0B1220" />
          <path d="M0 -11 L0 11 M-3 -8 L0 -11 L3 -8 M-3 8 L0 11 L3 8" />
          <path d="M-11 0 L11 0 M-8 -3 L-11 0 L-8 3 M8 -3 L11 0 L8 3" />
        </g>
      );
    case 'server':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-13" y="-16" width="26" height="32" rx="3" fill="#0B1220" />
          <line x1="-8" y1="-8" x2="8" y2="-8" />
          <line x1="-8" y1="0" x2="8" y2="0" />
          <line x1="-8" y1="8" x2="3" y2="8" />
          <circle cx="7" cy="8" r="1.5" fill={accent} stroke="none" />
        </g>
      );
    case 'ap':
      return (
        <g stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-14" y="2" width="28" height="10" rx="2.5" fill="#0B1220" />
          <path d="M-5 -2 A 7 7 0 0 1 5 -2" />
          <path d="M-10 -6 A 13 13 0 0 1 10 -6" />
          <circle cx="0" cy="7" r="1.4" fill={accent} stroke="none" />
        </g>
      );
  }
}

export function PacketTracerView() {
  const initial = useMemo(() => clonePreset('lan-star'), []);
  const [activePresetId, setActivePresetId] = useState<string>('lan-star');
  const [devices, setDevices] = useState<PTDevice[]>(initial.devices);
  const [links, setLinks] = useState<PTLink[]>(initial.links);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    initial.devices[1]?.id ?? initial.devices[0]?.id ?? null
  );
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [pendingSourceId, setPendingSourceId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightPanelTab>('cli');

  // Dragging state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const didDragMoveRef = useRef(false);

  // ARP table per deviceId
  const [arpTables, setArpTables] = useState<Record<string, PTArpEntry[]>>({});

  // CLI Terminal state
  const [cliInput, setCliInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      kind: 'info',
      text: 'PyNetSec Packet Tracer pronto. Selecione um dispositivo no mapa e execute comandos (ex.: ping 192.168.10.50, ip addr, nslookup, dhclient, traceroute).',
    },
  ]);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Packet animation state
  const [capturedHops, setCapturedHops] = useState<PTPacketHop[]>([]);
  const [animQueue, setAnimQueue] = useState<PTPacketHop[]>([]);
  const [animHopIndex, setAnimHopIndex] = useState<number>(0);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [hopDurationMs, setHopDurationMs] = useState<number>(680);
  const [inspectedHopId, setInspectedHopId] = useState<string | null>(null);
  const [newDnsHost, setNewDnsHost] = useState('');
  const [newDnsIp, setNewDnsIp] = useState('');

  const activePreset = useMemo(
    () => PACKET_TRACER_PRESETS.find((p) => p.id === activePresetId) ?? PACKET_TRACER_PRESETS[0],
    [activePresetId]
  );

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const selectedLink = useMemo(
    () => links.find((l) => l.id === selectedLinkId) ?? null,
    [links, selectedLinkId]
  );

  // Auto-scroll CLI terminal when new lines arrive
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [terminalLines]);

  // Smooth requestAnimationFrame animation for packet hops
  useEffect(() => {
    if (!isAnimating || animQueue.length === 0) return;
    let frameId = 0;
    let startTs = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTs;
      const t = Math.min(1, elapsed / hopDurationMs);
      setAnimProgress(t);
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else if (animHopIndex < animQueue.length - 1) {
        setAnimHopIndex((prev) => prev + 1);
        setAnimProgress(0);
        startTs = performance.now();
        frameId = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
        setAnimProgress(1);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating, animQueue, animHopIndex, hopDurationMs]);

  const startPacketAnimation = useCallback((hops: PTPacketHop[]) => {
    if (hops.length === 0) return;
    setCapturedHops(hops);
    setAnimQueue(hops);
    setAnimHopIndex(0);
    setAnimProgress(0);
    setInspectedHopId(hops[0].id);
    setIsAnimating(true);
  }, []);

  const loadPreset = (presetId: string) => {
    const next = clonePreset(presetId);
    setActivePresetId(presetId);
    setDevices(next.devices);
    setLinks(next.links);
    const defaultFocus =
      next.devices.find((d) => d.type === 'pc' || d.type === 'laptop')?.id ??
      next.devices[0]?.id ??
      null;
    setSelectedDeviceId(defaultFocus);
    setSelectedLinkId(null);
    setPendingSourceId(null);
    setToolMode('select');
    setArpTables({});
    setCapturedHops([]);
    setAnimQueue([]);
    setIsAnimating(false);
    setInspectedHopId(null);
    setTerminalLines([
      {
        id: `load-${Date.now()}`,
        kind: 'info',
        text: `Cenário carregado: ${next.preset.title} (${next.preset.subtitle}). ${next.preset.objective}`,
      },
    ]);
  };

  const addDeviceToCanvas = (type: PTDeviceType) => {
    const count = devices.filter((d) => d.type === type).length + 1;
    const prefix = DEVICE_META[type].defaultPrefix;
    const id = `${type}-${Date.now().toString(36)}`;
    const col = devices.length % 4;
    const row = Math.floor(devices.length / 4) % 3;
    const x = Math.min(770, Math.max(110, 150 + col * 185 + (row % 2) * 35));
    const y = Math.min(430, Math.max(90, 120 + row * 140));
    const mac = generateRandomMac(devices.length + count * 7);

    const newDev: PTDevice = {
      id,
      name: `${prefix}-${String(count).padStart(2, '0')}`,
      type,
      x,
      y,
      ip: type === 'switch' || type === 'ap' ? '' : `192.168.10.${20 + devices.length}`,
      mask: type === 'switch' || type === 'ap' ? '' : '255.255.255.0',
      gateway: type === 'pc' || type === 'laptop' || type === 'server' ? '192.168.10.1' : '',
      dns: type === 'pc' || type === 'laptop' ? '192.168.10.50' : '',
      mac,
      up: true,
      ...(type === 'router'
        ? {
            ip: '192.168.10.1',
            mask: '255.255.255.0',
            interfaces: [
              {
                id: 'fa0/0',
                name: 'fa0/0',
                ip: '192.168.10.1',
                mask: '255.255.255.0',
                mac,
                up: true,
                subnetLabel: 'Sub-rede A',
              },
              {
                id: 'fa0/1',
                name: 'fa0/1',
                ip: '10.0.20.1',
                mask: '255.255.255.0',
                mac: generateRandomMac(devices.length + 43),
                up: true,
                subnetLabel: 'Sub-rede B',
              },
            ],
          }
        : {}),
      ...(type === 'server'
        ? {
            services: { http: true, dns: true, dhcp: false },
            dhcpPool: {
              startIp: '192.168.10.100',
              endIp: '192.168.10.150',
              mask: '255.255.255.0',
              gateway: '192.168.10.1',
              dns: `192.168.10.${20 + devices.length}`,
            },
            dnsRecords: {
              'novo-servidor.local': `192.168.10.${20 + devices.length}`,
            },
          }
        : {}),
    };

    setDevices((prev) => [...prev, newDev]);
    setSelectedDeviceId(id);
    setSelectedLinkId(null);
    setToolMode('select');
    setRightTab('config');
  };

  const updateDevice = useCallback((deviceId: string, patch: Partial<PTDevice>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, ...patch } : d))
    );
  }, []);

  const deleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    setLinks((prev) => prev.filter((l) => l.fromId !== deviceId && l.toId !== deviceId));
    if (selectedDeviceId === deviceId) setSelectedDeviceId(null);
    if (pendingSourceId === deviceId) setPendingSourceId(null);
  };

  const toggleLinkStatus = (linkId: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, up: !l.up } : l))
    );
  };

  const deleteLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    if (selectedLinkId === linkId) setSelectedLinkId(null);
  };

  const runCliCommand = useCallback(
    (commandText: string, overrideDeviceId?: string) => {
      const targetId = overrideDeviceId ?? selectedDeviceId;
      const dev = devices.find((d) => d.id === targetId);
      if (!dev) {
        setTerminalLines((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            kind: 'error',
            text: 'Selecione um dispositivo na topologia antes de executar comandos.',
          },
        ]);
        return;
      }

      if (overrideDeviceId && overrideDeviceId !== selectedDeviceId) {
        setSelectedDeviceId(overrideDeviceId);
      }

      const trimmed = commandText.trim();
      if (!trimmed) return;

      const deviceArp = arpTables[dev.id] ?? [];
      const res = executePacketTracerCommand(trimmed, dev, devices, links, deviceArp);

      if (res.clearTerminal) {
        setTerminalLines([]);
        return;
      }

      if (res.updatedDevicePatch) {
        updateDevice(dev.id, res.updatedDevicePatch);
      }

      if (res.learnedArp && res.learnedArp.length > 0) {
        setArpTables((prev) => {
          const existing = prev[dev.id] ?? [];
          const merged = [...existing];
          res.learnedArp!.forEach((entry) => {
            if (!merged.some((e) => e.ip === entry.ip)) {
              merged.push(entry);
            }
          });
          return { ...prev, [dev.id]: merged };
        });
      }

      const promptLine: TerminalLine = {
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        kind: 'prompt',
        deviceName: dev.name,
        text: trimmed,
      };
      const outLines: TerminalLine[] = res.lines.map((l, i) => ({
        id: `o-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        kind: l.kind,
        text: l.text,
      }));

      setTerminalLines((prev) => [...prev, promptLine, ...outLines].slice(-120));
      setCmdHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)].slice(0, 30));
      setHistoryCursor(-1);

      if (res.hops.length > 0) {
        startPacketAnimation(res.hops);
      }
    },
    [selectedDeviceId, devices, links, arpTables, updateDevice, startPacketAnimation]
  );

  // Convert pointer event into SVG 880x510 coordinates
  const clientToSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_H;
    return { x, y };
  };

  const handleDevicePointerDown = (e: React.PointerEvent, device: PTDevice) => {
    e.stopPropagation();
    if (toolMode !== 'select') return;
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    dragOffsetRef.current = { dx: pt.x - device.x, dy: pt.y - device.y };
    didDragMoveRef.current = false;
    setDraggingId(device.id);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    const nx = Math.max(52, Math.min(CANVAS_W - 52, pt.x - dragOffsetRef.current.dx));
    const ny = Math.max(48, Math.min(CANVAS_H - 58, pt.y - dragOffsetRef.current.dy));
    didDragMoveRef.current = true;
    setDevices((prev) =>
      prev.map((d) => (d.id === draggingId ? { ...d, x: Math.round(nx), y: Math.round(ny) } : d))
    );
  };

  const handleCanvasPointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  const handleDeviceClick = (e: React.MouseEvent, device: PTDevice) => {
    e.stopPropagation();
    if (didDragMoveRef.current) {
      didDragMoveRef.current = false;
      return;
    }

    if (toolMode === 'delete') {
      deleteDevice(device.id);
      return;
    }

    if (toolMode.startsWith('cable-')) {
      const cableType = toolMode.replace('cable-', '') as PTCableType;
      if (!pendingSourceId) {
        setPendingSourceId(device.id);
        return;
      }
      if (pendingSourceId === device.id) {
        setPendingSourceId(null);
        return;
      }
      const alreadyLinked = links.some(
        (l) =>
          (l.fromId === pendingSourceId && l.toId === device.id) ||
          (l.fromId === device.id && l.toId === pendingSourceId)
      );
      if (!alreadyLinked) {
        const newLink: PTLink = {
          id: `lk-${Date.now().toString(36)}`,
          fromId: pendingSourceId,
          toId: device.id,
          cableType,
          up: true,
          speedLabel: CABLE_META[cableType].speed,
        };
        setLinks((prev) => [...prev, newLink]);
      }
      setPendingSourceId(null);
      return;
    }

    if (toolMode === 'send-pdu') {
      if (!pendingSourceId) {
        setPendingSourceId(device.id);
        setSelectedDeviceId(device.id);
        return;
      }
      if (pendingSourceId === device.id) {
        setPendingSourceId(null);
        return;
      }
      const dstIp =
        device.type === 'router' && device.interfaces?.length
          ? device.interfaces[0].ip
          : device.ip;
      setRightTab('cli');
      if (!dstIp) {
        setTerminalLines((prev) => [
          ...prev,
          {
            id: `pdu-err-${Date.now()}`,
            kind: 'error',
            text: `Não foi possível enviar pacote PDU para ${device.name}: o destino ainda não tem IP configurado.`,
          },
        ]);
      } else {
        runCliCommand(`ping ${dstIp}`, pendingSourceId);
      }
      setPendingSourceId(null);
      return;
    }

    // Default select mode
    setSelectedDeviceId(device.id);
    setSelectedLinkId(null);
  };

  const handleLinkClick = (e: React.MouseEvent, link: PTLink) => {
    e.stopPropagation();
    if (toolMode === 'delete') {
      deleteLink(link.id);
      return;
    }
    setSelectedLinkId(link.id);
    setSelectedDeviceId(null);
  };

  // Current animated packet coordinates
  const activeAnimHop =
    animQueue.length > 0 ? animQueue[Math.min(animHopIndex, animQueue.length - 1)] : null;

  const activePacketPos = useMemo(() => {
    if (!activeAnimHop) return null;
    const fromDev = devices.find((d) => d.id === activeAnimHop.fromId);
    const toDev = devices.find((d) => d.id === activeAnimHop.toId);
    if (!fromDev || !toDev) return null;
    const t = isAnimating ? animProgress : 1;
    return {
      x: fromDev.x + (toDev.x - fromDev.x) * t,
      y: fromDev.y + (toDev.y - fromDev.y) * t,
    };
  }, [activeAnimHop, devices, isAnimating, animProgress]);

  const inspectedHop = useMemo(
    () => capturedHops.find((h) => h.id === inspectedHopId) ?? activeAnimHop ?? null,
    [capturedHops, inspectedHopId, activeAnimHop]
  );

  // Subnet mismatch warning for selected host
  const selectedGatewayWarning = useMemo(() => {
    if (!selectedDevice || selectedDevice.type === 'router' || selectedDevice.type === 'switch' || selectedDevice.type === 'ap') {
      return null;
    }
    if (!selectedDevice.ip || !selectedDevice.mask || !selectedDevice.gateway) return null;
    if (!isValidIpv4(selectedDevice.ip) || !isValidIpv4(selectedDevice.mask) || !isValidIpv4(selectedDevice.gateway)) {
      return 'Verifique o formato dos endereços IPv4 (ex.: 192.168.10.11).';
    }
    if (!isSameSubnet(selectedDevice.ip, selectedDevice.gateway, selectedDevice.mask)) {
      return `O Gateway (${selectedDevice.gateway}) está fora da sub-rede ${getNetworkAddress(selectedDevice.ip, selectedDevice.mask)}/${maskToPrefix(selectedDevice.mask)}.`;
    }
    return null;
  }, [selectedDevice]);

  // Live topology stats
  const activeLinksCount = links.filter((l) => l.up).length;
  const configuredHostsCount = devices.filter((d) => isValidIpv4(d.ip)).length;
  const pendingSourceDevice = pendingSourceId
    ? devices.find((d) => d.id === pendingSourceId)
    : null;

  return (
    <div className="space-y-5">
      {/* Header & Scenario Selector Strip */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium text-cyan-300">
              Simulador Interativo de Redes · Estilo Packet Tracer
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-50 [text-wrap:balance]">
              Monte topologias, configure IPs e veja pacotes e comandos funcionando ao vivo
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-400">
              Escolha um ambiente básico pronto ou comece do zero. Arraste equipamentos, ligue ou
              rompa cabos, edite endereços IPv4/Gateway e execute{' '}
              <code className="font-mono text-cyan-300">ping</code>,{' '}
              <code className="font-mono text-cyan-300">traceroute</code>,{' '}
              <code className="font-mono text-cyan-300">dhclient</code>,{' '}
              <code className="font-mono text-cyan-300">nslookup</code> e{' '}
              <code className="font-mono text-cyan-300">curl</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 tabular-nums shrink-0">
            <span>
              Equipamentos: <strong className="font-mono text-slate-100">{devices.length}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>
              Enlaces UP:{' '}
              <strong className="font-mono text-emerald-400">
                {activeLinksCount}/{links.length}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>
              Com IP: <strong className="font-mono text-cyan-300">{configuredHostsCount}</strong>
            </span>
          </div>
        </div>

        {/* 6 Basic Network Environments Selector */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PACKET_TRACER_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? 'border-cyan-400 bg-[#162033]'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div>
                  <p
                    className={`text-[11px] font-medium ${
                      active ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    {preset.networkType}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-100">{preset.title}</p>
                </div>
                <p className="mt-2 font-mono text-[11px] text-slate-400">{preset.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Toolbar: Interaction Tools + Add Devices + Playback */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-3.5 xl:flex-row xl:items-center xl:justify-between">
        {/* Interaction Tools */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#090D16] p-1">
          {[
            { id: 'select' as ToolMode, label: 'Mover / Selecionar', icon: MousePointer2 },
            { id: 'cable-ethernet' as ToolMode, label: 'Cabo Direto', icon: Cable },
            { id: 'cable-crossover' as ToolMode, label: 'Crossover', icon: Cable },
            { id: 'cable-fiber' as ToolMode, label: 'Fibra', icon: Activity },
            { id: 'cable-wireless' as ToolMode, label: 'Wi-Fi', icon: Wifi },
            { id: 'send-pdu' as ToolMode, label: 'Enviar Pacote (PDU)', icon: Send },
            { id: 'delete' as ToolMode, label: 'Apagar', icon: Trash2 },
          ].map((tool) => {
            const Icon = tool.icon;
            const active = toolMode === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setToolMode(tool.id);
                  setPendingSourceId(null);
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? tool.id === 'delete'
                      ? 'bg-rose-500 text-white'
                      : tool.id === 'send-pdu'
                        ? 'bg-emerald-400 text-[#05131C]'
                        : 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tool.label}
              </button>
            );
          })}
        </div>

        {/* Add Devices Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium text-slate-400 whitespace-nowrap">
            Adicionar:
          </span>
          {(
            [
              { type: 'pc', label: 'PC', icon: Monitor },
              { type: 'laptop', label: 'Notebook', icon: Laptop },
              { type: 'switch', label: 'Switch', icon: Network },
              { type: 'router', label: 'Roteador', icon: RouterIcon },
              { type: 'server', label: 'Servidor', icon: Server },
              { type: 'ap', label: 'Wi-Fi AP', icon: Radio },
            ] as Array<{ type: PTDeviceType; label: string; icon: typeof Monitor }>
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => addDeviceToCanvas(item.type)}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-[#090D16] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-200 whitespace-nowrap"
              >
                <Plus className="h-3 w-3 text-cyan-400" />
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Educational Sandbox Split: Left Interactive Stage (7 cols) | Right Inspector & CLI (5 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT ZONE: Interactive Topology Canvas + Live Packet Sniffer */}
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            {/* Canvas Top Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-slate-100">{activePreset.title}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-slate-400">
                  {toolMode === 'select'
                    ? 'Arraste dispositivos ou clique em cabos para simular falhas'
                    : toolMode === 'send-pdu'
                      ? pendingSourceDevice
                        ? `Origem: ${pendingSourceDevice.name} — clique no destino para disparar Ping PDU`
                        : 'Clique no dispositivo de origem e depois no destino'
                      : toolMode === 'delete'
                        ? 'Clique em qualquer equipamento ou cabo para remover'
                        : pendingSourceDevice
                          ? `Ligando a partir de ${pendingSourceDevice.name} — clique no segundo equipamento`
                          : 'Clique no primeiro equipamento para iniciar o cabo'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label="Velocidade da animação de pacotes"
                  value={hopDurationMs}
                  onChange={(e) => setHopDurationMs(Number(e.target.value))}
                  className="cursor-pointer rounded-md border border-slate-700 bg-[#090D16] px-2 py-1 text-[11px] text-slate-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value={1100}>Velocidade: Lento</option>
                  <option value={680}>Velocidade: Normal</option>
                  <option value={340}>Velocidade: Rápido</option>
                </select>
                {capturedHops.length > 0 && (
                  <button
                    type="button"
                    onClick={() => startPacketAnimation(capturedHops)}
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 whitespace-nowrap"
                  >
                    <Play className="h-3 w-3" />
                    Rever Pacotes
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => loadPreset(activePresetId)}
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#090D16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap"
                >
                  <RotateCcw className="h-3 w-3" />
                  Resetar
                </button>
              </div>
            </div>

            {/* Interactive SVG Topology Blueprint */}
            <div className="relative bg-[#060911]">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerUp}
                onClick={() => {
                  setSelectedLinkId(null);
                  if (pendingSourceId) setPendingSourceId(null);
                }}
                className="block h-auto w-full select-none touch-none"
                role="img"
                aria-label="Área interativa de montagem de topologia de rede"
              >
                <defs>
                  <pattern
                    id="pt-grid"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1.5" cy="1.5" r="1" fill="#1E293B" />
                  </pattern>
                </defs>

                <rect width={CANVAS_W} height={CANVAS_H} fill="url(#pt-grid)" />

                {/* Subnet visual regions for Routed LAN preset */}
                {activePresetId === 'routed-lans' && (
                  <g pointerEvents="none">
                    <rect
                      x="28"
                      y="32"
                      width="320"
                      height="410"
                      rx="14"
                      fill="#0EA5E9"
                      fillOpacity="0.04"
                      stroke="#0EA5E9"
                      strokeOpacity="0.22"
                      strokeDasharray="6 4"
                    />
                    <text x="44" y="56" fill="#7DD3FC" fontSize="11" fontFamily="monospace">
                      Sub-rede A · 192.168.10.0/24 (Alunos)
                    </text>

                    <rect
                      x="525"
                      y="32"
                      width="325"
                      height="410"
                      rx="14"
                      fill="#10B981"
                      fillOpacity="0.04"
                      stroke="#10B981"
                      strokeOpacity="0.22"
                      strokeDasharray="6 4"
                    />
                    <text x="541" y="56" fill="#6EE7B7" fontSize="11" fontFamily="monospace">
                      Sub-rede B · 10.0.20.0/24 (Servidores)
                    </text>
                  </g>
                )}

                {/* Empty canvas prompt */}
                {devices.length === 0 && (
                  <g pointerEvents="none">
                    <text
                      x={CANVAS_W / 2}
                      y={CANVAS_H / 2 - 12}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="15"
                      fontWeight="600"
                    >
                      Bancada vazia — adicione equipamentos na barra acima
                    </text>
                    <text
                      x={CANVAS_W / 2}
                      y={CANVAS_H / 2 + 14}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="12"
                    >
                      Ex.: clique em "+ PC", "+ Switch" e ligue-os com "Cabo Direto"
                    </text>
                  </g>
                )}

                {/* Network Links / Cables */}
                {links.map((link) => {
                  const a = devices.find((d) => d.id === link.fromId);
                  const b = devices.find((d) => d.id === link.toId);
                  if (!a || !b) return null;

                  const isLinkActive = link.up && a.up && b.up;
                  const isSelected = selectedLinkId === link.id;
                  const isHopActive =
                    isAnimating && activeAnimHop?.linkId === link.id;

                  const strokeColor = !link.up
                    ? '#F43F5E'
                    : isHopActive
                      ? PROTOCOL_STYLE[activeAnimHop.protocol].stroke
                      : link.cableType === 'fiber'
                        ? '#A78BFA'
                        : link.cableType === 'crossover'
                          ? '#F59E0B'
                          : link.cableType === 'wireless'
                            ? '#34D399'
                            : '#38BDF8';

                  const dashArray = !link.up
                    ? '6 6'
                    : link.cableType === 'crossover'
                      ? '7 4'
                      : link.cableType === 'wireless'
                        ? '3 5'
                        : undefined;

                  const midX = (a.x + b.x) / 2;
                  const midY = (a.y + b.y) / 2;

                  // Endpoint status indicators (like Packet Tracer link triangles/dots)
                  const dx = b.x - a.x;
                  const dy = b.y - a.y;
                  const dist = Math.hypot(dx, dy) || 1;
                  const ux = dx / dist;
                  const uy = dy / dist;
                  const endAX = a.x + ux * 36;
                  const endAY = a.y + uy * 36;
                  const endBX = b.x - ux * 36;
                  const endBY = b.y - uy * 36;

                  return (
                    <g
                      key={link.id}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="cursor-pointer"
                    >
                      {/* Wide invisible click hitbox */}
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="transparent"
                        strokeWidth="16"
                      />

                      {/* Visible cable */}
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={strokeColor}
                        strokeWidth={isSelected || isHopActive ? 3.5 : 2.2}
                        strokeOpacity={isLinkActive ? 0.9 : 0.45}
                        strokeDasharray={dashArray}
                      />

                      {/* Link status dots near device ports */}
                      <circle
                        cx={endAX}
                        cy={endAY}
                        r="3.8"
                        fill={isLinkActive ? '#10B981' : '#F43F5E'}
                        stroke="#060911"
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={endBX}
                        cy={endBY}
                        r="3.8"
                        fill={isLinkActive ? '#10B981' : '#F43F5E'}
                        stroke="#060911"
                        strokeWidth="1.2"
                      />

                      {/* Broken cable badge */}
                      {!link.up && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-26"
                            y="-10"
                            width="52"
                            height="20"
                            rx="5"
                            fill="#4C0519"
                            stroke="#F43F5E"
                            strokeWidth="1.2"
                          />
                          <text
                            textAnchor="middle"
                            y="3.5"
                            fill="#FECDD3"
                            fontSize="9.5"
                            fontFamily="monospace"
                            fontWeight="700"
                          >
                            DOWN ×
                          </text>
                        </g>
                      )}

                      {/* Interface labels on router links */}
                      {link.toInterface && link.up && (
                        <text
                          x={endBX - uy * 12}
                          y={endBY + ux * 12}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {link.toInterface}
                        </text>
                      )}
                      {link.fromInterface && link.up && (
                        <text
                          x={endAX - uy * 12}
                          y={endAY + ux * 12}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {link.fromInterface}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Network Devices */}
                {devices.map((dev) => {
                  const isSelected = selectedDeviceId === dev.id;
                  const isPendingSrc = pendingSourceId === dev.id;
                  const accent = !dev.up
                    ? '#64748B'
                    : dev.type === 'router'
                      ? '#38BDF8'
                      : dev.type === 'switch'
                        ? '#22D3EE'
                        : dev.type === 'server'
                          ? '#34D399'
                          : dev.type === 'ap'
                            ? '#A78BFA'
                            : '#E2E8F0';

                  const primaryLabel =
                    dev.type === 'router' && dev.interfaces?.length
                      ? dev.interfaces
                          .filter((i) => i.up && i.ip)
                          .map((i) => i.ip)
                          .join(' | ')
                      : dev.ip
                        ? `${dev.ip}/${maskToPrefix(dev.mask || '255.255.255.0')}`
                        : dev.type === 'switch' || dev.type === 'ap'
                          ? DEVICE_META[dev.type].layer
                          : 'Sem IP (configure ou DHCP)';

                  return (
                    <g
                      key={dev.id}
                      transform={`translate(${dev.x}, ${dev.y})`}
                      onPointerDown={(e) => handleDevicePointerDown(e, dev)}
                      onClick={(e) => handleDeviceClick(e, dev)}
                      className={toolMode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    >
                      {/* Selection or pending connection ring */}
                      {(isSelected || isPendingSrc) && (
                        <circle
                          cx="0"
                          cy="0"
                          r="32"
                          fill="none"
                          stroke={isPendingSrc ? '#34D399' : '#22D3EE'}
                          strokeWidth="2"
                          strokeDasharray={isPendingSrc ? '5 3' : undefined}
                        />
                      )}

                      {/* Device circular node backdrop */}
                      <circle
                        cx="0"
                        cy="0"
                        r="26"
                        fill={isSelected ? '#162236' : '#0F172A'}
                        stroke={!dev.up ? '#F43F5E' : isSelected ? '#22D3EE' : '#334155'}
                        strokeWidth={isSelected ? '2' : '1.4'}
                      />

                      {renderDeviceGlyph(dev.type, accent)}

                      {/* Powered-off marker */}
                      {!dev.up && (
                        <g transform="translate(18, -18)">
                          <circle r="8" fill="#4C0519" stroke="#FB7185" strokeWidth="1.2" />
                          <text
                            textAnchor="middle"
                            y="3.5"
                            fill="#FFE4E6"
                            fontSize="9"
                            fontWeight="700"
                          >
                            OFF
                          </text>
                        </g>
                      )}

                      {/* Device Name */}
                      <text
                        y="41"
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="11.5"
                        fontWeight="700"
                      >
                        {dev.name}
                      </text>

                      {/* IPv4 / Layer subtitle */}
                      <text
                        y="55"
                        textAnchor="middle"
                        fill={
                          !dev.ip && (dev.type === 'pc' || dev.type === 'laptop')
                            ? '#FBBF24'
                            : '#94A3B8'
                        }
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {primaryLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Animated Packet Envelope (PDU) traveling across links */}
                {activePacketPos && activeAnimHop && (
                  <g
                    transform={`translate(${activePacketPos.x}, ${activePacketPos.y})`}
                    pointerEvents="none"
                  >
                    <rect
                      x="-31"
                      y="-13"
                      width="62"
                      height="26"
                      rx="6"
                      fill={PROTOCOL_STYLE[activeAnimHop.protocol].badgeBg}
                      stroke={PROTOCOL_STYLE[activeAnimHop.protocol].stroke}
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fill={PROTOCOL_STYLE[activeAnimHop.protocol].fill}
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {activeAnimHop.protocol}
                    </text>
                  </g>
                )}
              </svg>

              {/* Selected Link Quick Bar (Simulate Cable Break / Restore) */}
              {selectedLink && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#0B111E] px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Cable className="h-4 w-4 text-cyan-400" />
                    <span>
                      Enlace:{' '}
                      <strong className="text-slate-50">
                        {devices.find((d) => d.id === selectedLink.fromId)?.name} ↔{' '}
                        {devices.find((d) => d.id === selectedLink.toId)?.name}
                      </strong>{' '}
                      · {CABLE_META[selectedLink.cableType].label} ({selectedLink.speedLabel}) ·{' '}
                      <strong
                        className={selectedLink.up ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {selectedLink.up ? 'ATIVO (UP)' : 'ROMPIDO (DOWN)'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLinkStatus(selectedLink.id)}
                      className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        selectedLink.up
                          ? 'border border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25'
                          : 'border border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                      }`}
                    >
                      {selectedLink.up ? 'Simular Rompimento (DOWN)' : 'Restaurar Cabo (UP)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLink(selectedLink.id)}
                      className="cursor-pointer rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 whitespace-nowrap"
                    >
                      Remover Cabo
                    </button>
                  </div>
                </div>
              )}

              {/* Live Active Packet Narrative Bar */}
              {inspectedHop && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0B1220] px-4 py-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono font-bold ${
                        PROTOCOL_STYLE[inspectedHop.protocol].text
                      }`}
                    >
                      [{inspectedHop.protocol}]
                    </span>
                    <span className="font-semibold text-slate-100">{inspectedHop.summary}</span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="text-slate-400">{inspectedHop.detail}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                    {inspectedHop.layer} · Salto {inspectedHop.step}/{capturedHops.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Live Packet Capture Log (Sniffer Table) */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs">
              <span className="font-semibold text-slate-100">
                Captura de Pacotes em Tempo Real (Sniffer PDU)
              </span>
              <span className="font-mono text-slate-400 tabular-nums">
                {capturedHops.length} quadro(s) capturado(s)
              </span>
            </div>

            {capturedHops.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                Execute um comando no terminal ao lado (ex.:{' '}
                <code className="font-mono text-cyan-300">ping</code>,{' '}
                <code className="font-mono text-cyan-300">dhclient</code> ou{' '}
                <code className="font-mono text-cyan-300">curl</code>) ou use{' '}
                <strong className="text-slate-300">Enviar Pacote (PDU)</strong> para inspecionar
                cada quadro trafegando nos cabos.
              </div>
            ) : (
              <div className="max-h-[210px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#090D16] text-[11px] text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Protocolo</th>
                      <th className="px-3 py-2 font-medium">Trajeto do Salto</th>
                      <th className="px-3 py-2 font-medium">Evento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {capturedHops.map((hop, idx) => {
                      const active =
                        (isAnimating && animHopIndex === idx) ||
                        (!isAnimating && inspectedHopId === hop.id);
                      return (
                        <tr
                          key={hop.id}
                          onClick={() => {
                            setIsAnimating(false);
                            setAnimHopIndex(idx);
                            setAnimProgress(1);
                            setInspectedHopId(hop.id);
                          }}
                          className={`cursor-pointer transition-colors ${
                            active ? 'bg-cyan-400/10' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="px-3 py-2 font-mono text-slate-400 tabular-nums">
                            {String(hop.step).padStart(2, '0')}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`font-mono font-bold ${PROTOCOL_STYLE[hop.protocol].text}`}
                            >
                              {hop.protocol}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-300">
                            {hop.srcLabel} → {hop.dstLabel}
                          </td>
                          <td className="px-3 py-2 text-slate-300">{hop.summary}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Terminal CLI + Device Config + Scenario Guide (5 cols) */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden lg:col-span-5">
          {/* Segmented Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3.5 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
              <button
                type="button"
                onClick={() => setRightTab('cli')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  rightTab === 'cli'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                Terminal CLI
              </button>
              <button
                type="button"
                onClick={() => setRightTab('config')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  rightTab === 'config'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Configurar IP
              </button>
              <button
                type="button"
                onClick={() => setRightTab('guide')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  rightTab === 'guide'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Guia
              </button>
            </div>

            {/* Active Device Selector */}
            {devices.length > 0 && (
              <select
                aria-label="Selecionar equipamento ativo"
                value={selectedDeviceId ?? ''}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value || null);
                  setSelectedLinkId(null);
                }}
                className="max-w-[165px] cursor-pointer rounded-md border border-slate-700 bg-[#090D16] px-2 py-1 font-mono text-xs text-cyan-200 focus:border-cyan-400 focus:outline-none"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.ip ? `(${d.ip})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* TAB 1: TERMINAL CLI */}
          {rightTab === 'cli' && (
            <div className="flex flex-1 flex-col">
              {/* Quick-Run Suggested Scenario Commands */}
              <div className="border-b border-slate-800 bg-[#0B111E] px-4 py-3">
                <p className="text-[11px] font-medium text-slate-400">
                  Comandos rápidos deste cenário (clique para executar):
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activePreset.suggestedCommands.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => runCliCommand(item.command, item.deviceId)}
                      className="cursor-pointer rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 font-mono text-[11px] text-cyan-200 transition-colors hover:border-cyan-400/70 hover:bg-cyan-400/10 whitespace-nowrap"
                    >
                      $ {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => runCliCommand('help')}
                    className="cursor-pointer rounded-md border border-slate-800 bg-[#090D16] px-2.5 py-1 font-mono text-[11px] text-slate-400 transition-colors hover:text-slate-200 whitespace-nowrap"
                  >
                    help
                  </button>
                </div>
              </div>

              {/* Scrollable Terminal Log */}
              <div className="flex-1 min-h-[330px] max-h-[430px] overflow-y-auto bg-[#060911] p-4 font-mono text-xs leading-relaxed space-y-1.5">
                {terminalLines.map((line) => (
                  <div
                    key={line.id}
                    className={
                      line.kind === 'prompt'
                        ? 'pt-1.5 text-slate-100'
                        : line.kind === 'success'
                          ? 'text-emerald-300'
                          : line.kind === 'error'
                            ? 'text-rose-300'
                            : line.kind === 'info'
                              ? 'text-cyan-300'
                              : 'text-slate-300'
                    }
                  >
                    {line.kind === 'prompt' ? (
                      <span>
                        <span className="font-semibold text-emerald-400">
                          root@{line.deviceName ?? 'host'}:~$
                        </span>{' '}
                        {line.text}
                      </span>
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono">{line.text}</pre>
                    )}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* Command Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!cliInput.trim()) return;
                  runCliCommand(cliInput);
                  setCliInput('');
                }}
                className="flex items-center gap-2 border-t border-slate-800 bg-[#0B111E] px-3.5 py-3"
              >
                <span className="font-mono text-xs font-semibold text-emerald-400 shrink-0">
                  {selectedDevice ? `${selectedDevice.name}$` : 'sem-host$'}
                </span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' && cmdHistory.length > 0) {
                      e.preventDefault();
                      const nextIdx = Math.min(cmdHistory.length - 1, historyCursor + 1);
                      setHistoryCursor(nextIdx);
                      setCliInput(cmdHistory[nextIdx]);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (historyCursor <= 0) {
                        setHistoryCursor(-1);
                        setCliInput('');
                      } else {
                        const nextIdx = historyCursor - 1;
                        setHistoryCursor(nextIdx);
                        setCliInput(cmdHistory[nextIdx]);
                      }
                    }
                  }}
                  placeholder="Digite ping, traceroute, ip addr, dhclient, nslookup, curl..."
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                >
                  Executar
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CONFIGURAR DISPOSITIVO */}
          {rightTab === 'config' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedDevice ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Clique em um dispositivo no mapa de rede para editar IP, Máscara, Gateway, DNS e
                  serviços.
                </div>
              ) : (
                <>
                  {/* Device Header + Power Toggle */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                    <div>
                      <p className="text-[11px] font-medium text-cyan-300">
                        {DEVICE_META[selectedDevice.type].label} · {DEVICE_META[selectedDevice.type].layer}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">
                        MAC: {selectedDevice.mac}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateDevice(selectedDevice.id, { up: !selectedDevice.up })}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          selectedDevice.up
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            : 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {selectedDevice.up ? 'Ligado (UP)' : 'Desligado (OFF)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDevice(selectedDevice.id)}
                        title="Remover equipamento"
                        className="cursor-pointer rounded-lg border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-rose-500/50 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hostname */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Nome do Equipamento
                    </label>
                    <input
                      type="text"
                      value={selectedDevice.name}
                      onChange={(e) => updateDevice(selectedDevice.id, { name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Router Multi-Interfaces Editor */}
                  {selectedDevice.type === 'router' && selectedDevice.interfaces ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-200">
                          Interfaces do Roteador (Camada 3)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = selectedDevice.interfaces?.length ?? 0;
                            const nextIfaces = [
                              ...(selectedDevice.interfaces ?? []),
                              {
                                id: `fa0/${idx}`,
                                name: `fa0/${idx}`,
                                ip: `10.0.${30 + idx * 10}.1`,
                                mask: '255.255.255.0',
                                mac: generateRandomMac(idx * 17 + 9),
                                up: true,
                                subnetLabel: `LAN ${idx + 1}`,
                              },
                            ];
                            updateDevice(selectedDevice.id, { interfaces: nextIfaces });
                          }}
                          className="cursor-pointer text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
                        >
                          + Nova Interface
                        </button>
                      </div>

                      {selectedDevice.interfaces.map((iface, idx) => (
                        <div
                          key={iface.id}
                          className="rounded-xl border border-slate-800 bg-[#090D16] p-3 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-cyan-300">
                              {iface.name} {iface.subnetLabel ? `· ${iface.subnetLabel}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = selectedDevice.interfaces!.map((item, i) =>
                                  i === idx ? { ...item, up: !item.up } : item
                                );
                                updateDevice(selectedDevice.id, { interfaces: next });
                              }}
                              className={`cursor-pointer rounded px-2 py-0.5 font-mono text-[11px] font-semibold ${
                                iface.up
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {iface.up ? 'no shutdown (UP)' : 'shutdown (DOWN)'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-400">IPv4</label>
                              <input
                                type="text"
                                value={iface.ip}
                                onChange={(e) => {
                                  const next = selectedDevice.interfaces!.map((item, i) =>
                                    i === idx ? { ...item, ip: e.target.value } : item
                                  );
                                  updateDevice(selectedDevice.id, {
                                    interfaces: next,
                                    ...(idx === 0 ? { ip: e.target.value } : {}),
                                  });
                                }}
                                className="mt-1 w-full rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400">Máscara</label>
                              <input
                                type="text"
                                value={iface.mask}
                                onChange={(e) => {
                                  const next = selectedDevice.interfaces!.map((item, i) =>
                                    i === idx ? { ...item, mask: e.target.value } : item
                                  );
                                  updateDevice(selectedDevice.id, {
                                    interfaces: next,
                                    ...(idx === 0 ? { mask: e.target.value } : {}),
                                  });
                                }}
                                className="mt-1 w-full rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Standard Host / Server / Switch IP Config */
                    <div className="space-y-3">
                      {(selectedDevice.type === 'pc' || selectedDevice.type === 'laptop') && (
                        <button
                          type="button"
                          onClick={() => {
                            setRightTab('cli');
                            runCliCommand('dhclient', selectedDevice.id);
                          }}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20"
                        >
                          <Wifi className="h-3.5 w-3.5" />
                          Obter IP automaticamente via DHCP (dhclient)
                        </button>
                      )}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300">
                            Endereço IPv4
                          </label>
                          <input
                            type="text"
                            value={selectedDevice.ip}
                            onChange={(e) => updateDevice(selectedDevice.id, { ip: e.target.value })}
                            placeholder="192.168.10.11"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300">
                            Máscara de Sub-rede
                          </label>
                          <input
                            type="text"
                            value={selectedDevice.mask}
                            onChange={(e) =>
                              updateDevice(selectedDevice.id, { mask: e.target.value })
                            }
                            placeholder="255.255.255.0"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300">
                            Gateway Padrão
                          </label>
                          <input
                            type="text"
                            value={selectedDevice.gateway}
                            onChange={(e) =>
                              updateDevice(selectedDevice.id, { gateway: e.target.value })
                            }
                            placeholder="192.168.10.1"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300">
                            Servidor DNS
                          </label>
                          <input
                            type="text"
                            value={selectedDevice.dns}
                            onChange={(e) => updateDevice(selectedDevice.id, { dns: e.target.value })}
                            placeholder="192.168.10.50"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {selectedGatewayWarning && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                          <span>{selectedGatewayWarning}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Services Section for Servers & Routers */}
                  {(selectedDevice.type === 'server' || selectedDevice.type === 'router') && (
                    <div className="space-y-3 border-t border-slate-800 pt-3.5">
                      <p className="text-xs font-semibold text-slate-200">
                        Serviços de Rede Ativos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { key: 'http', label: 'Web HTTP (80)' },
                            { key: 'dns', label: 'DNS (53)' },
                            { key: 'dhcp', label: 'DHCP (67/68)' },
                          ] as const
                        ).map((svc) => {
                          const enabled = Boolean(selectedDevice.services?.[svc.key]);
                          return (
                            <button
                              key={svc.key}
                              type="button"
                              onClick={() =>
                                updateDevice(selectedDevice.id, {
                                  services: {
                                    ...selectedDevice.services,
                                    [svc.key]: !enabled,
                                  },
                                  ...(svc.key === 'dhcp' && !selectedDevice.dhcpPool
                                    ? {
                                        dhcpPool: {
                                          startIp: '192.168.10.100',
                                          endIp: '192.168.10.150',
                                          mask: '255.255.255.0',
                                          gateway: selectedDevice.gateway || selectedDevice.ip,
                                          dns: selectedDevice.ip,
                                        },
                                      }
                                    : {}),
                                })
                              }
                              className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-[11px] font-semibold transition-colors ${
                                enabled
                                  ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
                                  : 'border-slate-800 bg-[#090D16] text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {svc.label}
                              <div className="mt-0.5 font-mono text-[10px]">
                                {enabled ? 'ATIVO' : 'OFF'}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* DNS Records Editor */}
                      {selectedDevice.services?.dns && (
                        <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3 space-y-2">
                          <p className="text-[11px] font-semibold text-slate-300">
                            Registros DNS (Zona A)
                          </p>
                          <div className="space-y-1 font-mono text-[11px]">
                            {Object.entries(selectedDevice.dnsRecords ?? {}).map(([host, ip]) => (
                              <div
                                key={host}
                                className="flex items-center justify-between text-slate-300"
                              >
                                <span>{host}</span>
                                <span className="text-cyan-300">{ip}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              value={newDnsHost}
                              onChange={(e) => setNewDnsHost(e.target.value)}
                              placeholder="site.local"
                              className="min-w-0 flex-1 rounded border border-slate-700 bg-[#111827] px-2 py-1 font-mono text-[11px] text-slate-100 focus:border-cyan-400 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={newDnsIp}
                              onChange={(e) => setNewDnsIp(e.target.value)}
                              placeholder="192.168.10.50"
                              className="w-28 rounded border border-slate-700 bg-[#111827] px-2 py-1 font-mono text-[11px] text-slate-100 focus:border-cyan-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newDnsHost.trim() || !isValidIpv4(newDnsIp)) return;
                                updateDevice(selectedDevice.id, {
                                  dnsRecords: {
                                    ...(selectedDevice.dnsRecords ?? {}),
                                    [newDnsHost.trim().toLowerCase()]: newDnsIp.trim(),
                                  },
                                });
                                setNewDnsHost('');
                                setNewDnsIp('');
                              }}
                              className="cursor-pointer rounded bg-cyan-400 px-2 py-1 text-[11px] font-semibold text-[#05131C]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: GUIA DO CENÁRIO & LEGENDA */}
          {rightTab === 'guide' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3.5">
                <p className="font-semibold text-cyan-300">{activePreset.networkType}</p>
                <h3 className="mt-1 text-sm font-bold text-slate-100">{activePreset.title}</h3>
                <p className="mt-1.5 leading-relaxed text-slate-300">{activePreset.description}</p>
                <div className="mt-3 border-t border-cyan-400/20 pt-2.5 text-slate-200">
                  <strong className="text-cyan-200">Atividade prática:</strong>{' '}
                  {activePreset.objective}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-200">Check-list rápido da bancada</p>
                {[
                  {
                    ok: devices.length >= 2,
                    label: 'Pelo menos 2 dispositivos posicionados no mapa',
                  },
                  {
                    ok: activeLinksCount >= 1,
                    label: 'Ao menos 1 enlace físico ou Wi-Fi ativo (UP)',
                  },
                  {
                    ok: configuredHostsCount >= 2,
                    label: 'Pelo menos 2 equipamentos com IPv4 válido configurado',
                  },
                  {
                    ok: capturedHops.some((h) => h.ok),
                    label: 'Pacote transmitido com sucesso e capturado no Sniffer',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#090D16] px-3 py-2"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        item.ok ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <span className={item.ok ? 'text-slate-100' : 'text-slate-400'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="font-semibold text-slate-200">Guia de Cabos e Protocolos</p>
                <div className="space-y-1.5 text-slate-400">
                  <p>
                    <strong className="text-sky-300">Cabo Direto (UTP):</strong> PC ↔ Switch ou
                    Switch ↔ Roteador.
                  </p>
                  <p>
                    <strong className="text-amber-300">Cabo Crossover:</strong> PC ↔ PC direto
                    (sem switch).
                  </p>
                  <p>
                    <strong className="text-violet-300">Fibra Óptica:</strong> Interligação de
                    alta velocidade (10 Gbps) entre Switches e Roteadores.
                  </p>
                  <p>
                    <strong className="text-emerald-300">Link Wi-Fi:</strong> Notebooks e PCs
                    conectados a um Access Point (AP).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
