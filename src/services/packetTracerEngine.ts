import {
  PTDevice,
  PTInterface,
  PTLink,
  PTPacketHop,
  PTProtocol,
} from '../data/packetTracerPresets';

export interface PTArpEntry {
  ip: string;
  mac: string;
  deviceName: string;
  iface: string;
}

export interface PTCommandExecutionResult {
  lines: Array<{ kind: 'info' | 'stdout' | 'error' | 'success'; text: string }>;
  hops: PTPacketHop[];
  updatedDevicePatch?: Partial<PTDevice>;
  learnedArp?: PTArpEntry[];
  clearTerminal?: boolean;
}

export function isValidIpv4(ip: string): boolean {
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

export function ipToInt(ip: string): number {
  const [a, b, c, d] = ip.trim().split('.').map(Number);
  return (((a << 24) >>> 0) + ((b << 16) >>> 0) + ((c << 8) >>> 0) + (d >>> 0)) >>> 0;
}

export function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

export function maskToPrefix(mask: string): number {
  if (!isValidIpv4(mask)) return 24;
  const n = ipToInt(mask);
  let count = 0;
  for (let i = 31; i >= 0; i -= 1) {
    if ((n & (1 << i)) !== 0) count += 1;
    else break;
  }
  return count;
}

export function prefixToMask(prefix: number): string {
  const clamped = Math.max(0, Math.min(32, prefix));
  const maskInt = clamped === 0 ? 0 : (0xffffffff << (32 - clamped)) >>> 0;
  return intToIp(maskInt);
}

export function getNetworkAddress(ip: string, mask: string): string {
  if (!isValidIpv4(ip) || !isValidIpv4(mask)) return '';
  return intToIp((ipToInt(ip) & ipToInt(mask)) >>> 0);
}

export function isSameSubnet(ipA: string, ipB: string, mask: string): boolean {
  if (!isValidIpv4(ipA) || !isValidIpv4(ipB) || !isValidIpv4(mask)) return false;
  const m = ipToInt(mask);
  return ((ipToInt(ipA) & m) >>> 0) === ((ipToInt(ipB) & m) >>> 0);
}

/** Collect all active IP/Mask pairs owned by a device (single IP or multi-interface Router). */
export function getDeviceEndpoints(device: PTDevice): Array<{ ip: string; mask: string; mac: string; iface: string }> {
  if (device.type === 'router' && device.interfaces && device.interfaces.length > 0) {
    return device.interfaces
      .filter((i) => i.up && isValidIpv4(i.ip) && isValidIpv4(i.mask))
      .map((i) => ({ ip: i.ip.trim(), mask: i.mask.trim(), mac: i.mac, iface: i.name }));
  }
  if (isValidIpv4(device.ip) && isValidIpv4(device.mask)) {
    return [{ ip: device.ip.trim(), mask: device.mask.trim(), mac: device.mac, iface: 'eth0' }];
  }
  return [];
}

/** Find a device owning a specific IPv4 address. */
export function findDeviceByIp(
  devices: PTDevice[],
  ip: string
): { device: PTDevice; endpoint: { ip: string; mask: string; mac: string; iface: string } } | null {
  const target = ip.trim();
  for (const device of devices) {
    const endpoints = getDeviceEndpoints(device);
    const match = endpoints.find((ep) => ep.ip === target);
    if (match) return { device, endpoint: match };
  }
  return null;
}

interface PathSegment {
  fromId: string;
  toId: string;
  linkId: string;
}

/**
 * BFS over L2-transparent devices (switches & APs) to reach targetId without crossing a router.
 * Optionally allows stopping AT a router if targetId is that router.
 */
function findL2Path(
  sourceId: string,
  targetId: string,
  devices: PTDevice[],
  links: PTLink[]
): PathSegment[] | null {
  if (sourceId === targetId) return [];
  const devMap = new Map(devices.map((d) => [d.id, d]));
  const srcDev = devMap.get(sourceId);
  const dstDev = devMap.get(targetId);
  if (!srcDev?.up || !dstDev?.up) return null;

  const visited = new Set<string>([sourceId]);
  const queue: Array<{ nodeId: string; path: PathSegment[] }> = [{ nodeId: sourceId, path: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const link of links) {
      if (!link.up) continue;
      let nextId: string | null = null;
      if (link.fromId === current.nodeId) nextId = link.toId;
      else if (link.toId === current.nodeId) nextId = link.fromId;
      if (!nextId || visited.has(nextId)) continue;

      const nextDev = devMap.get(nextId);
      if (!nextDev || !nextDev.up) continue;

      const nextPath = [...current.path, { fromId: current.nodeId, toId: nextId, linkId: link.id }];
      if (nextId === targetId) return nextPath;

      // Only Switches and APs forward L2 frames transparently across ports
      if (nextDev.type === 'switch' || nextDev.type === 'ap') {
        visited.add(nextId);
        queue.push({ nodeId: nextId, path: nextPath });
      }
    }
  }
  return null;
}

/**
 * Find full L2/L3 routed path between two devices using realistic subnet + gateway rules.
 */
export interface RouteResolution {
  ok: boolean;
  segments: PathSegment[];
  routerHops: PTDevice[];
  reason?: string;
  dropAtDeviceId?: string;
  nextHopIp?: string;
  nextHopDevice?: PTDevice;
}

export function resolveRouteBetweenDevices(
  src: PTDevice,
  dstIp: string,
  devices: PTDevice[],
  links: PTLink[]
): RouteResolution {
  if (!src.up) {
    return { ok: false, segments: [], routerHops: [], reason: `${src.name} está desligado.` };
  }

  const srcEndpoints = getDeviceEndpoints(src);
  if (srcEndpoints.length === 0) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `${src.name} não possui IPv4/máscara válidos configurados. Configure um IP ou rode dhclient.`,
    };
  }

  const targetMatch = findDeviceByIp(devices, dstIp);
  if (!targetMatch) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `Nenhum dispositivo na topologia possui o IP ${dstIp}.`,
      dropAtDeviceId: src.id,
    };
  }

  const dst = targetMatch.device;
  if (!dst.up) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `O destino ${dst.name} (${dstIp}) está desligado (interface DOWN).`,
      dropAtDeviceId: src.id,
    };
  }

  if (src.id === dst.id) {
    return { ok: true, segments: [], routerHops: [] };
  }

  // Check if source has an interface in the same subnet as dstIp
  const matchingSrcEp = srcEndpoints.find((ep) => isSameSubnet(ep.ip, dstIp, ep.mask));
  if (matchingSrcEp) {
    const l2 = findL2Path(src.id, dst.id, devices, links);
    if (l2) {
      return {
        ok: true,
        segments: l2,
        routerHops: [],
        nextHopIp: dstIp,
        nextHopDevice: dst,
      };
    }
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `${src.name} e ${dst.name} estão na mesma sub-rede (${getNetworkAddress(matchingSrcEp.ip, matchingSrcEp.mask)}/${maskToPrefix(matchingSrcEp.mask)}), mas não há cabo ativo ligando-os (verifique cabos ou switches desligados).`,
      dropAtDeviceId: src.id,
    };
  }

  // Different subnet: need default gateway!
  const gwIp = src.gateway.trim();
  if (!isValidIpv4(gwIp)) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `Destino ${dstIp} está em outra sub-rede e ${src.name} não tem Gateway Padrão configurado.`,
      dropAtDeviceId: src.id,
    };
  }

  const primaryEp = srcEndpoints[0];
  if (!isSameSubnet(primaryEp.ip, gwIp, primaryEp.mask)) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `Gateway ${gwIp} não pertence à mesma sub-rede de ${src.name} (${primaryEp.ip}/${maskToPrefix(primaryEp.mask)}).`,
      dropAtDeviceId: src.id,
    };
  }

  const gwMatch = findDeviceByIp(devices, gwIp);
  if (!gwMatch || gwMatch.device.type !== 'router') {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `Gateway ${gwIp} não corresponde a uma interface ativa de Roteador na topologia.`,
      dropAtDeviceId: src.id,
    };
  }

  const router = gwMatch.device;
  const pathToRouter = findL2Path(src.id, router.id, devices, links);
  if (!pathToRouter) {
    return {
      ok: false,
      segments: [],
      routerHops: [],
      reason: `Não há enlace físico ativo entre ${src.name} e o roteador gateway ${router.name} (${gwIp}).`,
      dropAtDeviceId: src.id,
    };
  }

  // Check if the router has an interface in the destination subnet (or can hop to another router)
  const routerEndpoints = getDeviceEndpoints(router);
  const egressEp = routerEndpoints.find((ep) => isSameSubnet(ep.ip, dstIp, ep.mask));
  if (!egressEp) {
    // Try 2nd-hop router connected via L2/link
    for (const candidate of devices) {
      if (candidate.type !== 'router' || candidate.id === router.id || !candidate.up) continue;
      const candEps = getDeviceEndpoints(candidate);
      const sharedSubnet = routerEndpoints.some((re) =>
        candEps.some((ce) => isSameSubnet(re.ip, ce.ip, re.mask))
      );
      const reachesDst = candEps.some((ce) => isSameSubnet(ce.ip, dstIp, ce.mask));
      if (sharedSubnet && reachesDst) {
        const hop1 = findL2Path(router.id, candidate.id, devices, links);
        const hop2 = findL2Path(candidate.id, dst.id, devices, links);
        if (hop1 && hop2) {
          return {
            ok: true,
            segments: [...pathToRouter, ...hop1, ...hop2],
            routerHops: [router, candidate],
            nextHopIp: gwIp,
            nextHopDevice: router,
          };
        }
      }
    }

    return {
      ok: false,
      segments: pathToRouter,
      routerHops: [router],
      reason: `O roteador ${router.name} recebeu o pacote, mas não possui interface na sub-rede de destino (${dstIp}).`,
      dropAtDeviceId: router.id,
    };
  }

  const pathRouterToDst = findL2Path(router.id, dst.id, devices, links);
  if (!pathRouterToDst) {
    return {
      ok: false,
      segments: pathToRouter,
      routerHops: [router],
      reason: `O roteador ${router.name} possui a rota pela interface ${egressEp.iface} (${egressEp.ip}), mas o cabo até ${dst.name} está desconectado ou DOWN.`,
      dropAtDeviceId: router.id,
    };
  }

  // Also verify return path (destination needs gateway back to source subnet!)
  if (dst.type !== 'router') {
    const dstGw = dst.gateway.trim();
    if (!isValidIpv4(dstGw) || !isSameSubnet(dstGw, egressEp.ip, egressEp.mask)) {
      return {
        ok: false,
        segments: [...pathToRouter, ...pathRouterToDst],
        routerHops: [router],
        reason: `O pacote chegou em ${dst.name}, mas ${dst.name} não possui Gateway Padrão válido (${egressEp.ip}) para responder de volta à rede de ${src.name}.`,
        dropAtDeviceId: dst.id,
      };
    }
  }

  return {
    ok: true,
    segments: [...pathToRouter, ...pathRouterToDst],
    routerHops: [router],
    nextHopIp: gwIp,
    nextHopDevice: router,
  };
}

function makeHops(
  segments: PathSegment[],
  devices: PTDevice[],
  protocol: PTProtocol,
  layer: string,
  summary: string,
  detail: string,
  ok: boolean,
  startStep: number
): PTPacketHop[] {
  const devMap = new Map(devices.map((d) => [d.id, d]));
  return segments.map((seg, idx) => {
    const fromDev = devMap.get(seg.fromId);
    const toDev = devMap.get(seg.toId);
    return {
      id: `${Date.now()}-${startStep + idx}-${Math.random().toString(36).slice(2, 6)}`,
      step: startStep + idx,
      fromId: seg.fromId,
      toId: seg.toId,
      linkId: seg.linkId,
      protocol,
      layer,
      srcLabel: fromDev ? `${fromDev.name}${fromDev.ip ? ` (${fromDev.ip})` : ''}` : seg.fromId,
      dstLabel: toDev ? `${toDev.name}${toDev.ip ? ` (${toDev.ip})` : ''}` : seg.toId,
      summary,
      detail,
      ok,
    };
  });
}

function reverseSegments(segments: PathSegment[]): PathSegment[] {
  return [...segments]
    .reverse()
    .map((s) => ({ fromId: s.toId, toId: s.fromId, linkId: s.linkId }));
}

function findReachableDhcpServer(
  src: PTDevice,
  devices: PTDevice[],
  links: PTLink[]
): { server: PTDevice; segments: PathSegment[] } | null {
  for (const dev of devices) {
    if (dev.id === src.id || !dev.up) continue;
    if (dev.services?.dhcp && dev.dhcpPool) {
      const path = findL2Path(src.id, dev.id, devices, links);
      if (path) return { server: dev, segments: path };
    }
  }
  return null;
}

function allocateDhcpIp(server: PTDevice, devices: PTDevice[]): string | null {
  if (!server.dhcpPool) return null;
  const start = ipToInt(server.dhcpPool.startIp);
  const end = ipToInt(server.dhcpPool.endIp);
  const usedIps = new Set<string>();
  devices.forEach((d) => {
    getDeviceEndpoints(d).forEach((ep) => usedIps.add(ep.ip));
  });
  for (let ipInt = start; ipInt <= end; ipInt += 1) {
    const candidate = intToIp(ipInt);
    if (!usedIps.has(candidate)) return candidate;
  }
  return null;
}

/** Resolve hostname via the device's configured DNS server. */
function resolveDnsHostname(
  src: PTDevice,
  hostname: string,
  devices: PTDevice[],
  links: PTLink[],
  startStep: number
): {
  ok: boolean;
  ip?: string;
  dnsServer?: PTDevice;
  hops: PTPacketHop[];
  error?: string;
} {
  const cleanHost = hostname.trim().toLowerCase();
  const dnsIp = src.dns.trim();
  if (!isValidIpv4(dnsIp)) {
    return {
      ok: false,
      hops: [],
      error: `DNS não configurado em ${src.name}. Defina um Servidor DNS para resolver "${cleanHost}".`,
    };
  }

  const route = resolveRouteBetweenDevices(src, dnsIp, devices, links);
  const dnsMatch = findDeviceByIp(devices, dnsIp);
  if (!route.ok || !dnsMatch || !dnsMatch.device.services?.dns) {
    return {
      ok: false,
      hops: [],
      error:
        route.reason ??
        `Servidor DNS ${dnsIp} inacessível ou serviço DNS desativado.`,
    };
  }

  const dnsServer = dnsMatch.device;
  const records = dnsServer.dnsRecords ?? {};
  const resolved = records[cleanHost];

  const reqHops = makeHops(
    route.segments,
    devices,
    'DNS',
    'Camada 7 (DNS · UDP/53)',
    `DNS Query: ${cleanHost}?`,
    `Consulta de nome ${cleanHost} enviada ao servidor DNS ${dnsServer.name} (${dnsIp}).`,
    true,
    startStep
  );
  const repHops = makeHops(
    reverseSegments(route.segments),
    devices,
    'DNS',
    'Camada 7 (DNS · UDP/53)',
    resolved ? `DNS Reply: ${cleanHost} → ${resolved}` : `DNS NXDOMAIN: ${cleanHost}`,
    resolved
      ? `Servidor DNS respondeu o registro A: ${cleanHost} = ${resolved}.`
      : `Domínio ${cleanHost} não encontrado na zona do servidor ${dnsServer.name}.`,
    Boolean(resolved),
    startStep + reqHops.length
  );

  if (!resolved) {
    return {
      ok: false,
      dnsServer,
      hops: [...reqHops, ...repHops],
      error: `NXDOMAIN: domínio "${cleanHost}" não existe no servidor DNS ${dnsServer.name} (${dnsIp}).`,
    };
  }

  return {
    ok: true,
    ip: resolved,
    dnsServer,
    hops: [...reqHops, ...repHops],
  };
}

/** Execute a simulated network CLI command from the perspective of `src`. */
export function executePacketTracerCommand(
  rawCommand: string,
  src: PTDevice,
  devices: PTDevice[],
  links: PTLink[],
  arpTable: PTArpEntry[]
): PTCommandExecutionResult {
  const trimmed = rawCommand.trim();
  if (!trimmed) return { lines: [], hops: [] };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg1 = parts[1] ?? '';
  const arg2 = parts[2] ?? '';
  const arg3 = parts[3] ?? '';

  if (cmd === 'clear' || cmd === 'cls') {
    return { lines: [], hops: [], clearTerminal: true };
  }

  if (cmd === 'help' || cmd === '?') {
    return {
      hops: [],
      lines: [
        { kind: 'info', text: 'Comandos disponíveis neste dispositivo:' },
        { kind: 'stdout', text: '  ip addr / ifconfig / ipconfig     → Mostra IPs, máscara, MAC e gateway' },
        { kind: 'stdout', text: '  ip route / route -n               → Exibe tabela de roteamento' },
        { kind: 'stdout', text: '  ping <ip|domínio>                 → Envia ARP + ICMP Echo animado na topologia' },
        { kind: 'stdout', text: '  traceroute <ip|domínio>           → Mapeia saltos (roteadores) até o destino' },
        { kind: 'stdout', text: '  dhclient / ipconfig /renew        → Solicita IP automático (DHCP DORA)' },
        { kind: 'stdout', text: '  nslookup <domínio>                → Consulta registro A no servidor DNS' },
        { kind: 'stdout', text: '  curl <ip|domínio>                 → Simula Handshake TCP + HTTP GET' },
        { kind: 'stdout', text: '  arp -a / ip neigh                 → Mostra tabela ARP (IP ↔ MAC)' },
        { kind: 'stdout', text: '  set ip <ip> <máscara> [gateway]   → Configura IPv4 diretamente pelo terminal' },
        { kind: 'stdout', text: '  show ip interface brief           → Resumo Cisco IOS de interfaces' },
        { kind: 'stdout', text: '  clear                             → Limpa o console' },
      ],
    };
  }

  // ip addr / ifconfig / ipconfig
  if (
    cmd === 'ifconfig' ||
    (cmd === 'ipconfig' && arg1.toLowerCase() !== '/renew') ||
    (cmd === 'ip' && (arg1 === 'addr' || arg1 === 'a' || arg1 === 'address'))
  ) {
    if (!src.up) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: `${src.name} está desligado. Ligue o dispositivo no inspetor.` }],
      };
    }
    const lines: PTCommandExecutionResult['lines'] = [];
    if (src.type === 'router' && src.interfaces?.length) {
      src.interfaces.forEach((iface: PTInterface) => {
        const cidr = isValidIpv4(iface.mask) ? maskToPrefix(iface.mask) : 24;
        lines.push({
          kind: 'stdout',
          text: `${iface.name}: <${iface.up ? 'BROADCAST,MULTICAST,UP' : 'DOWN'}>  ${iface.subnetLabel ?? ''}`,
        });
        lines.push({
          kind: 'stdout',
          text: `    inet ${iface.ip || '(sem IP)'}/${cidr}  netmask ${iface.mask || '-'}  ether ${iface.mac}`,
        });
      });
    } else {
      const cidr = isValidIpv4(src.mask) ? maskToPrefix(src.mask) : 0;
      lines.push({
        kind: 'stdout',
        text: `eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP`,
      });
      lines.push({
        kind: 'stdout',
        text: `    link/ether ${src.mac} brd ff:ff:ff:ff:ff:ff`,
      });
      lines.push({
        kind: 'stdout',
        text: src.ip
          ? `    inet ${src.ip}/${cidr}  mask ${src.mask}  gateway ${src.gateway || '(nenhum)'}  dns ${src.dns || '(nenhum)'}`
          : `    inet (nenhum endereço IPv4 configurado — use "set ip ..." ou "dhclient")`,
      });
    }
    return { hops: [], lines };
  }

  // show ip interface brief
  if (cmd === 'show' && arg1.toLowerCase() === 'ip') {
    const lines: PTCommandExecutionResult['lines'] = [
      { kind: 'info', text: 'Interface        IP-Address       Mask             Status    Protocol' },
    ];
    if (src.type === 'router' && src.interfaces?.length) {
      src.interfaces.forEach((i) => {
        lines.push({
          kind: 'stdout',
          text: `${i.name.padEnd(16)} ${(i.ip || 'unassigned').padEnd(16)} ${(i.mask || '-').padEnd(16)} ${i.up ? 'up       ' : 'admin dn '} ${i.up ? 'up' : 'down'}`,
        });
      });
    } else {
      lines.push({
        kind: 'stdout',
        text: `${'FastEthernet0'.padEnd(16)} ${(src.ip || 'unassigned').padEnd(16)} ${(src.mask || '-').padEnd(16)} ${src.up ? 'up       ' : 'down     '} ${src.up ? 'up' : 'down'}`,
      });
    }
    return { hops: [], lines };
  }

  // ip route / route -n
  if ((cmd === 'ip' && (arg1 === 'route' || arg1 === 'r')) || cmd === 'route') {
    const lines: PTCommandExecutionResult['lines'] = [
      { kind: 'info', text: `Tabela de Roteamento — ${src.name}` },
    ];
    const eps = getDeviceEndpoints(src);
    if (eps.length === 0) {
      lines.push({ kind: 'error', text: 'Nenhuma rota ativa (interface sem IP configurado).' });
      return { hops: [], lines };
    }
    eps.forEach((ep) => {
      const net = getNetworkAddress(ep.ip, ep.mask);
      const cidr = maskToPrefix(ep.mask);
      lines.push({
        kind: 'stdout',
        text: `${net}/${cidr} dev ${ep.iface} proto kernel scope link src ${ep.ip}`,
      });
    });
    if (isValidIpv4(src.gateway)) {
      lines.push({
        kind: 'success',
        text: `default via ${src.gateway} dev eth0 proto static`,
      });
    } else if (src.type !== 'router') {
      lines.push({
        kind: 'info',
        text: '(sem rota default — comunicação restrita à sub-rede local)',
      });
    }
    return { hops: [], lines };
  }

  // arp -a / ip neigh
  if (cmd === 'arp' || (cmd === 'ip' && (arg1 === 'neigh' || arg1 === 'n'))) {
    const lines: PTCommandExecutionResult['lines'] = [
      { kind: 'info', text: `Tabela ARP / Vizinhos L2 — ${src.name}` },
    ];
    if (arpTable.length === 0) {
      lines.push({
        kind: 'stdout',
        text: '(cache ARP vazio — execute um ping para descobrir endereços MAC na rede local)',
      });
    } else {
      arpTable.forEach((entry) => {
        lines.push({
          kind: 'stdout',
          text: `${entry.ip.padEnd(16)} dev ${entry.iface} lladdr ${entry.mac} REACHABLE (${entry.deviceName})`,
        });
      });
    }
    return { hops: [], lines };
  }

  // set ip <ip> <mask> [gateway]
  if (cmd === 'set' && arg1.toLowerCase() === 'ip') {
    const nextIp = arg2;
    const nextMask = arg3 || '255.255.255.0';
    const nextGw = parts[4] ?? src.gateway;
    if (!isValidIpv4(nextIp) || !isValidIpv4(nextMask)) {
      return {
        hops: [],
        lines: [
          {
            kind: 'error',
            text: 'Uso: set ip <IPv4> <Máscara> [Gateway]  (Ex.: set ip 192.168.1.20 255.255.255.0)',
          },
        ],
      };
    }
    return {
      hops: [],
      updatedDevicePatch: {
        ip: nextIp,
        mask: nextMask,
        gateway: nextGw,
      },
      lines: [
        {
          kind: 'success',
          text: `Interface eth0 de ${src.name} atualizada: ${nextIp}/${maskToPrefix(nextMask)}${nextGw ? ` · Gateway ${nextGw}` : ''}.`,
        },
      ],
    };
  }

  // dhclient / ipconfig /renew
  if (cmd === 'dhclient' || (cmd === 'ipconfig' && arg1.toLowerCase() === '/renew')) {
    if (!src.up) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: `${src.name} está desligado.` }],
      };
    }
    const found = findReachableDhcpServer(src, devices, links);
    if (!found) {
      return {
        hops: [],
        lines: [
          { kind: 'stdout', text: `DHCPDISCOVER on eth0 to 255.255.255.255 port 67...` },
          {
            kind: 'error',
            text: 'Nenhum servidor DHCP alcançável no segmento local (verifique cabos ou ative o serviço DHCP em um Servidor/Roteador).',
          },
        ],
      };
    }

    const allocated = allocateDhcpIp(found.server, devices);
    if (!allocated || !found.server.dhcpPool) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: `Pool DHCP de ${found.server.name} esgotado.` }],
      };
    }

    const pool = found.server.dhcpPool;
    const rev = reverseSegments(found.segments);
    const h1 = makeHops(
      found.segments,
      devices,
      'DHCP',
      'Camada 7 (DHCP · UDP 68→67)',
      'DHCP DISCOVER (Broadcast)',
      `${src.name} busca servidor DHCP na LAN.`,
      true,
      1
    );
    const h2 = makeHops(
      rev,
      devices,
      'DHCP',
      'Camada 7 (DHCP · UDP 67→68)',
      `DHCP OFFER (${allocated})`,
      `${found.server.name} oferece IP ${allocated}/${maskToPrefix(pool.mask)}.`,
      true,
      1 + h1.length
    );
    const h3 = makeHops(
      found.segments,
      devices,
      'DHCP',
      'Camada 7 (DHCP · UDP 68→67)',
      `DHCP REQUEST (${allocated})`,
      `${src.name} aceita e solicita oficialmente o IP ${allocated}.`,
      true,
      1 + h1.length + h2.length
    );
    const h4 = makeHops(
      rev,
      devices,
      'DHCP',
      'Camada 7 (DHCP · UDP 67→68)',
      `DHCP ACK (Concedido!)`,
      `${found.server.name} confirma concessão + Gateway ${pool.gateway} + DNS ${pool.dns}.`,
      true,
      1 + h1.length + h2.length + h3.length
    );

    return {
      hops: [...h1, ...h2, ...h3, ...h4],
      updatedDevicePatch: {
        ip: allocated,
        mask: pool.mask,
        gateway: pool.gateway,
        dns: pool.dns,
        name: src.name.replace(' (Sem IP)', ''),
      },
      learnedArp: [
        {
          ip: found.server.ip,
          mac: found.server.mac,
          deviceName: found.server.name,
          iface: 'eth0',
        },
      ],
      lines: [
        { kind: 'stdout', text: `DHCPDISCOVER on eth0 to 255.255.255.255 port 67` },
        { kind: 'stdout', text: `DHCPOFFER of ${allocated} from ${found.server.ip} (${found.server.name})` },
        { kind: 'stdout', text: `DHCPREQUEST for ${allocated} on eth0 to ${found.server.ip}` },
        { kind: 'success', text: `DHCPACK of ${allocated}/${maskToPrefix(pool.mask)} · Gateway: ${pool.gateway} · DNS: ${pool.dns}` },
      ],
    };
  }

  // nslookup <domain>
  if (cmd === 'nslookup' || cmd === 'dig') {
    if (!arg1) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: 'Uso: nslookup <domínio>  (Ex.: nslookup portal.escola.local)' }],
      };
    }
    const res = resolveDnsHostname(src, arg1, devices, links, 1);
    if (!res.ok) {
      return {
        hops: res.hops,
        lines: [{ kind: 'error', text: res.error ?? 'Falha na resolução DNS.' }],
      };
    }
    return {
      hops: res.hops,
      lines: [
        { kind: 'info', text: `Server:  ${res.dnsServer?.name} (${res.dnsServer?.ip})` },
        { kind: 'stdout', text: `Address: ${res.dnsServer?.ip}#53` },
        { kind: 'success', text: `Name:    ${arg1.toLowerCase()}  →  Address: ${res.ip}` },
      ],
    };
  }

  // ping <ip|domain>
  if (cmd === 'ping') {
    if (!arg1) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: 'Uso: ping <IP ou domínio>  (Ex.: ping 192.168.10.50)' }],
      };
    }
    let targetIp = arg1;
    let allHops: PTPacketHop[] = [];
    const lines: PTCommandExecutionResult['lines'] = [];

    if (!isValidIpv4(targetIp)) {
      const dnsRes = resolveDnsHostname(src, targetIp, devices, links, 1);
      allHops = [...allHops, ...dnsRes.hops];
      if (!dnsRes.ok || !dnsRes.ip) {
        return {
          hops: allHops,
          lines: [{ kind: 'error', text: dnsRes.error ?? `Não foi possível resolver ${targetIp}.` }],
        };
      }
      lines.push({ kind: 'info', text: `DNS resolveu ${targetIp} → ${dnsRes.ip}` });
      targetIp = dnsRes.ip;
    }

    const route = resolveRouteBetweenDevices(src, targetIp, devices, links);
    if (!route.ok) {
      if (route.segments.length > 0) {
        const failHops = makeHops(
          route.segments,
          devices,
          'DROP',
          'Camada 3 (Erro de Rota)',
          `Pacote descartado`,
          route.reason ?? 'Destino inalcançável.',
          false,
          allHops.length + 1
        );
        allHops = [...allHops, ...failHops];
      }
      lines.push({ kind: 'stdout', text: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.` });
      lines.push({ kind: 'error', text: `Falha: ${route.reason}` });
      lines.push({ kind: 'error', text: `--- ${targetIp} ping statistics: 3 transmitted, 0 received, 100% packet loss ---` });
      return { hops: allHops, lines };
    }

    // Add ARP step if next-hop IP isn't already in ARP table
    const learned: PTArpEntry[] = [];
    if (route.nextHopIp && route.nextHopDevice) {
      const alreadyKnown = arpTable.some((e) => e.ip === route.nextHopIp);
      const arpPath = findL2Path(src.id, route.nextHopDevice.id, devices, links);
      if (!alreadyKnown && arpPath && arpPath.length > 0) {
        const arpReq = makeHops(
          arpPath,
          devices,
          'ARP',
          'Camada 2 (ARP · Broadcast)',
          `ARP Who-has ${route.nextHopIp}?`,
          `${src.name} pergunta na LAN qual endereço MAC pertence a ${route.nextHopIp}.`,
          true,
          allHops.length + 1
        );
        const arpRep = makeHops(
          reverseSegments(arpPath),
          devices,
          'ARP',
          'Camada 2 (ARP · Unicast)',
          `ARP Reply: ${route.nextHopDevice.mac}`,
          `${route.nextHopDevice.name} responde seu MAC ${route.nextHopDevice.mac}.`,
          true,
          allHops.length + 1 + arpReq.length
        );
        allHops = [...allHops, ...arpReq, ...arpRep];
        learned.push({
          ip: route.nextHopIp,
          mac: route.nextHopDevice.mac,
          deviceName: route.nextHopDevice.name,
          iface: 'eth0',
        });
      }
    }

    const reqHops = makeHops(
      route.segments,
      devices,
      'ICMP',
      'Camada 3 (ICMP Echo Request)',
      `ICMP Echo Request → ${targetIp}`,
      `Pacote de teste enviado de ${src.name} (${src.ip}) até ${targetIp}.`,
      true,
      allHops.length + 1
    );
    const repHops = makeHops(
      reverseSegments(route.segments),
      devices,
      'ICMP',
      'Camada 3 (ICMP Echo Reply)',
      `ICMP Echo Reply ← ${targetIp}`,
      `Resposta confirmada de ${targetIp} retornando para ${src.name}.`,
      true,
      allHops.length + 1 + reqHops.length
    );
    allHops = [...allHops, ...reqHops, ...repHops];

    const ttl = Math.max(1, 64 - route.routerHops.length);
    const baseMs = 0.6 + route.segments.length * 0.45 + route.routerHops.length * 1.8;
    lines.push({ kind: 'stdout', text: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.` });
    for (let seq = 1; seq <= 3; seq += 1) {
      const rtt = (baseMs + seq * 0.14).toFixed(2);
      lines.push({
        kind: 'success',
        text: `64 bytes from ${targetIp}: icmp_seq=${seq} ttl=${ttl} time=${rtt} ms`,
      });
    }
    lines.push({
      kind: 'info',
      text: `--- ${targetIp} ping statistics: 3 transmitted, 3 received, 0% packet loss (${route.routerHops.length} roteador(es) no caminho) ---`,
    });

    return { hops: allHops, lines, learnedArp: learned };
  }

  // traceroute / tracert
  if (cmd === 'traceroute' || cmd === 'tracert') {
    if (!arg1) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: 'Uso: traceroute <IP ou domínio>  (Ex.: traceroute 10.0.20.50)' }],
      };
    }
    let targetIp = arg1;
    let allHops: PTPacketHop[] = [];
    const lines: PTCommandExecutionResult['lines'] = [];

    if (!isValidIpv4(targetIp)) {
      const dnsRes = resolveDnsHostname(src, targetIp, devices, links, 1);
      allHops = [...allHops, ...dnsRes.hops];
      if (!dnsRes.ok || !dnsRes.ip) {
        return { hops: allHops, lines: [{ kind: 'error', text: dnsRes.error ?? 'Erro DNS.' }] };
      }
      targetIp = dnsRes.ip;
    }

    const route = resolveRouteBetweenDevices(src, targetIp, devices, links);
    if (!route.ok) {
      return {
        hops: allHops,
        lines: [
          { kind: 'stdout', text: `traceroute to ${targetIp}, 30 hops max` },
          { kind: 'error', text: ` 1  * * *  (${route.reason})` },
        ],
      };
    }

    const traceHops = makeHops(
      route.segments,
      devices,
      'ICMP',
      'Camada 3 (Traceroute · TTL)',
      `Probe TTL → ${targetIp}`,
      `Rastreando cada salto L3 no caminho até ${targetIp}.`,
      true,
      allHops.length + 1
    );
    allHops = [...allHops, ...traceHops];

    lines.push({ kind: 'info', text: `traceroute to ${targetIp} (${targetIp}), 30 hops max` });
    let hopNum = 1;
    route.routerHops.forEach((router) => {
      const ep = getDeviceEndpoints(router)[0];
      lines.push({
        kind: 'stdout',
        text: ` ${hopNum}  ${router.name} (${ep?.ip ?? router.ip})   ${(1.2 * hopNum).toFixed(2)} ms   ${(1.3 * hopNum).toFixed(2)} ms`,
      });
      hopNum += 1;
    });
    const dstMatch = findDeviceByIp(devices, targetIp);
    lines.push({
      kind: 'success',
      text: ` ${hopNum}  ${dstMatch?.device.name ?? targetIp} (${targetIp})   ${(1.5 * hopNum).toFixed(2)} ms   [Destino alcançado]`,
    });

    return { hops: allHops, lines };
  }

  // curl / http <ip|domain>
  if (cmd === 'curl' || cmd === 'http') {
    if (!arg1) {
      return {
        hops: [],
        lines: [{ kind: 'error', text: 'Uso: curl <IP ou domínio>  (Ex.: curl portal.escola.local)' }],
      };
    }
    const cleanTarget = arg1.replace(/^https?:\/\//i, '').split('/')[0];
    let targetIp = cleanTarget;
    let allHops: PTPacketHop[] = [];
    const lines: PTCommandExecutionResult['lines'] = [];

    if (!isValidIpv4(targetIp)) {
      const dnsRes = resolveDnsHostname(src, targetIp, devices, links, 1);
      allHops = [...allHops, ...dnsRes.hops];
      if (!dnsRes.ok || !dnsRes.ip) {
        return { hops: allHops, lines: [{ kind: 'error', text: dnsRes.error ?? 'Erro DNS.' }] };
      }
      lines.push({ kind: 'info', text: `Resolvido ${cleanTarget} → ${dnsRes.ip}` });
      targetIp = dnsRes.ip;
    }

    const route = resolveRouteBetweenDevices(src, targetIp, devices, links);
    const dstMatch = findDeviceByIp(devices, targetIp);
    if (!route.ok || !dstMatch) {
      return {
        hops: allHops,
        lines: [{ kind: 'error', text: route.reason ?? `Conexão recusada por ${targetIp}.` }],
      };
    }

    const rev = reverseSegments(route.segments);
    const syn = makeHops(route.segments, devices, 'TCP', 'Camada 4 (TCP · Porta 80)', 'TCP SYN', `Iniciando Three-Way Handshake com ${dstMatch.device.name}:80.`, true, allHops.length + 1);
    allHops = [...allHops, ...syn];

    if (!dstMatch.device.services?.http) {
      const rst = makeHops(rev, devices, 'DROP', 'Camada 4 (TCP · RST)', 'TCP RST (Porta 80 fechada)', `${dstMatch.device.name} recusou: serviço HTTP está desativado.`, false, allHops.length + 1);
      return {
        hops: [...allHops, ...rst],
        lines: [
          ...lines,
          { kind: 'error', text: `curl: (7) Failed to connect to ${targetIp} port 80: Connection refused (ative HTTP no inspetor de ${dstMatch.device.name}).` },
        ],
      };
    }

    const synAck = makeHops(rev, devices, 'TCP', 'Camada 4 (TCP · Porta 80)', 'TCP SYN-ACK', `${dstMatch.device.name} aceita conexão na porta 80.`, true, allHops.length + 1);
    const ack = makeHops(route.segments, devices, 'TCP', 'Camada 4 (TCP · Porta 80)', 'TCP ACK', `Conexão TCP estabelecida (ESTABLISHED).`, true, allHops.length + 1 + synAck.length);
    const httpGet = makeHops(route.segments, devices, 'HTTP', 'Camada 7 (HTTP)', `GET / HTTP/1.1`, `Solicitando página inicial de ${cleanTarget}.`, true, allHops.length + 1 + synAck.length + ack.length);
    const httpOk = makeHops(rev, devices, 'HTTP', 'Camada 7 (HTTP)', 'HTTP/1.1 200 OK', `Servidor ${dstMatch.device.name} entregou HTML com sucesso.`, true, allHops.length + 1 + synAck.length + ack.length + httpGet.length);

    return {
      hops: [...allHops, ...synAck, ...ack, ...httpGet, ...httpOk],
      lines: [
        ...lines,
        { kind: 'stdout', text: `> TCP 3-Way Handshake concluído com ${targetIp}:80` },
        { kind: 'stdout', text: `> GET / HTTP/1.1  Host: ${cleanTarget}` },
        { kind: 'success', text: `< HTTP/1.1 200 OK  Server: PyNetSec-HTTP (${dstMatch.device.name})` },
        { kind: 'stdout', text: `<html><body><h1>Portal ativo em ${dstMatch.device.name} (${targetIp})</h1></body></html>` },
      ],
    };
  }

  return {
    hops: [],
    lines: [
      {
        kind: 'error',
        text: `Comando "${trimmed}" não reconhecido. Digite "help" para listar os comandos de rede suportados.`,
      },
    ],
  };
}
