export type PTDeviceType = 'pc' | 'laptop' | 'switch' | 'router' | 'server' | 'ap';

export type PTCableType = 'ethernet' | 'crossover' | 'fiber' | 'wireless';

export type PTProtocol = 'ARP' | 'ICMP' | 'DHCP' | 'DNS' | 'TCP' | 'HTTP' | 'DROP';

export interface PTInterface {
  id: string;
  name: string;
  ip: string;
  mask: string;
  mac: string;
  up: boolean;
  subnetLabel?: string;
}

export interface PTDevice {
  id: string;
  name: string;
  type: PTDeviceType;
  x: number;
  y: number;
  ip: string;
  mask: string;
  gateway: string;
  dns: string;
  mac: string;
  up: boolean;
  interfaces?: PTInterface[];
  services?: {
    http?: boolean;
    dns?: boolean;
    dhcp?: boolean;
  };
  dhcpPool?: {
    startIp: string;
    endIp: string;
    mask: string;
    gateway: string;
    dns: string;
  };
  dnsRecords?: Record<string, string>;
}

export interface PTLink {
  id: string;
  fromId: string;
  toId: string;
  cableType: PTCableType;
  up: boolean;
  speedLabel: string;
  fromInterface?: string;
  toInterface?: string;
}

export interface PTPacketHop {
  id: string;
  step: number;
  fromId: string;
  toId: string;
  linkId: string;
  protocol: PTProtocol;
  layer: string;
  srcLabel: string;
  dstLabel: string;
  summary: string;
  detail: string;
  ok: boolean;
}

export interface PTScenarioTask {
  id: string;
  label: string;
  hint: string;
}

export interface PTScenarioPreset {
  id: string;
  networkType: string;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  suggestedCommands: Array<{ label: string; command: string; deviceId?: string }>;
  devices: PTDevice[];
  links: PTLink[];
}

export const DEVICE_META: Record<
  PTDeviceType,
  { label: string; shortLabel: string; layer: string; defaultPrefix: string }
> = {
  pc: { label: 'Computador (PC)', shortLabel: 'PC', layer: 'Host L3–L7', defaultPrefix: 'PC' },
  laptop: { label: 'Notebook', shortLabel: 'NB', layer: 'Host Wi-Fi/LAN', defaultPrefix: 'NB' },
  switch: { label: 'Switch L2', shortLabel: 'SW', layer: 'Camada 2 (Enlace)', defaultPrefix: 'SW' },
  router: { label: 'Roteador L3', shortLabel: 'R', layer: 'Camada 3 (Rede)', defaultPrefix: 'R' },
  server: { label: 'Servidor (Web/DNS/DHCP)', shortLabel: 'SRV', layer: 'Serviços L7', defaultPrefix: 'SRV' },
  ap: { label: 'Access Point Wi-Fi', shortLabel: 'AP', layer: 'Camada 2 (WLAN)', defaultPrefix: 'AP' },
};

export const CABLE_META: Record<
  PTCableType,
  { label: string; speed: string; description: string }
> = {
  ethernet: {
    label: 'Cabo Direto (UTP)',
    speed: '1 Gbps',
    description: 'Liga dispositivos diferentes (PC ↔ Switch, Switch ↔ Roteador).',
  },
  crossover: {
    label: 'Cabo Crossover',
    speed: '1 Gbps',
    description: 'Liga dispositivos iguais diretamente (PC ↔ PC ou Switch ↔ Switch).',
  },
  fiber: {
    label: 'Fibra Óptica',
    speed: '10 Gbps',
    description: 'Backbone de alta velocidade e longas distâncias entre switches/roteadores.',
  },
  wireless: {
    label: 'Link Wi-Fi (802.11)',
    speed: '300 Mbps',
    description: 'Conexão sem fio entre Notebook/PC e Access Point.',
  },
};

export function generateRandomMac(seed: number): string {
  const hex = (n: number) => ((n * 37 + 19) % 256).toString(16).padStart(2, '0').toUpperCase();
  return `02:50:F2:${hex(seed)}:${hex(seed + 11)}:${hex(seed + 29)}`;
}

export const PACKET_TRACER_PRESETS: PTScenarioPreset[] = [
  {
    id: 'lan-star',
    networkType: 'LAN · Topologia Estrela',
    title: 'LAN Estrela com Switch e Servidor',
    subtitle: 'Sub-rede 192.168.10.0/24',
    description:
      'Ambiente clássico de laboratório escolar: estações ligadas a um Switch L2 central e um servidor interno com Web (HTTP) e DNS ativos.',
    objective:
      'Teste ping entre PC-01 e SRV-WEB, resolva o domínio portal.escola.local com nslookup e observe ARP + ICMP + TCP/HTTP fluindo pelo Switch.',
    suggestedCommands: [
      { label: 'ip addr', command: 'ip addr', deviceId: 'pc-1' },
      { label: 'ping SRV-WEB', command: 'ping 192.168.10.50', deviceId: 'pc-1' },
      { label: 'nslookup portal', command: 'nslookup portal.escola.local', deviceId: 'pc-1' },
      { label: 'curl portal', command: 'curl portal.escola.local', deviceId: 'pc-1' },
      { label: 'arp -a', command: 'arp -a', deviceId: 'pc-1' },
    ],
    devices: [
      {
        id: 'sw-1',
        name: 'SW-LAB01',
        type: 'switch',
        x: 430,
        y: 225,
        ip: '192.168.10.2',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:1A:2B:10:00:02',
        up: true,
      },
      {
        id: 'pc-1',
        name: 'PC-01',
        type: 'pc',
        x: 155,
        y: 120,
        ip: '192.168.10.11',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '192.168.10.50',
        mac: '00:1A:2B:10:00:11',
        up: true,
      },
      {
        id: 'pc-2',
        name: 'PC-02',
        type: 'pc',
        x: 155,
        y: 335,
        ip: '192.168.10.12',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '192.168.10.50',
        mac: '00:1A:2B:10:00:12',
        up: true,
      },
      {
        id: 'pc-3',
        name: 'PC-03',
        type: 'pc',
        x: 430,
        y: 390,
        ip: '192.168.10.13',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '192.168.10.50',
        mac: '00:1A:2B:10:00:13',
        up: true,
      },
      {
        id: 'srv-1',
        name: 'SRV-WEB',
        type: 'server',
        x: 705,
        y: 225,
        ip: '192.168.10.50',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '192.168.10.50',
        mac: '00:1A:2B:10:00:50',
        up: true,
        services: { http: true, dns: true, dhcp: true },
        dhcpPool: {
          startIp: '192.168.10.100',
          endIp: '192.168.10.150',
          mask: '255.255.255.0',
          gateway: '192.168.10.1',
          dns: '192.168.10.50',
        },
        dnsRecords: {
          'portal.escola.local': '192.168.10.50',
          'srv-web.local': '192.168.10.50',
          'pc-01.local': '192.168.10.11',
          'pc-02.local': '192.168.10.12',
        },
      },
    ],
    links: [
      { id: 'l-1', fromId: 'pc-1', toId: 'sw-1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'l-2', fromId: 'pc-2', toId: 'sw-1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'l-3', fromId: 'pc-3', toId: 'sw-1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'l-4', fromId: 'srv-1', toId: 'sw-1', cableType: 'fiber', up: true, speedLabel: '10 Gbps' },
    ],
  },
  {
    id: 'point-to-point',
    networkType: 'P2P · Ponto a Ponto',
    title: 'Conexão Direta (Cabo Crossover)',
    subtitle: 'Sub-rede 192.168.1.0/24',
    description:
      'Dois computadores ligados diretamente sem switch. Note que o PC-B está em outra sub-rede de propósito para o aluno corrigir o IP!',
    objective:
      'Tente dar ping de PC-A para PC-B (vai falhar por sub-rede diferente). Depois corrija o IP do PC-B para 192.168.1.20/24 e teste novamente.',
    suggestedCommands: [
      { label: 'ip addr (PC-A)', command: 'ip addr', deviceId: 'p2p-a' },
      { label: 'ping 192.168.1.20', command: 'ping 192.168.1.20', deviceId: 'p2p-a' },
      { label: 'Corrigir IP PC-B', command: 'set ip 192.168.1.20 255.255.255.0', deviceId: 'p2p-b' },
      { label: 'arp -a', command: 'arp -a', deviceId: 'p2p-a' },
    ],
    devices: [
      {
        id: 'p2p-a',
        name: 'PC-A',
        type: 'pc',
        x: 225,
        y: 230,
        ip: '192.168.1.10',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:20:AA:01:00:10',
        up: true,
      },
      {
        id: 'p2p-b',
        name: 'PC-B',
        type: 'pc',
        x: 645,
        y: 230,
        ip: '192.168.50.20',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:20:AA:01:00:20',
        up: true,
      },
    ],
    links: [
      {
        id: 'l-p2p-1',
        fromId: 'p2p-a',
        toId: 'p2p-b',
        cableType: 'crossover',
        up: true,
        speedLabel: '1 Gbps',
      },
    ],
  },
  {
    id: 'routed-lans',
    networkType: 'LAN ↔ LAN · Roteamento L3',
    title: 'Duas Sub-redes Interligadas por Roteador',
    subtitle: '192.168.10.0/24 ↔ R1 ↔ 10.0.20.0/24',
    description:
      'Cenário essencial de Roteamento: a Rede A (Alunos) e a Rede B (Servidores) só se comunicam passando pelas interfaces fa0/0 e fa0/1 do Roteador R1.',
    objective:
      'Execute traceroute 10.0.20.50 a partir do PC-A1 para ver os 2 saltos. Depois teste remover o Gateway do PC-A1 para observar a falha de rota!',
    suggestedCommands: [
      { label: 'ip route', command: 'ip route', deviceId: 'rt-pca1' },
      { label: 'traceroute SRV-APP', command: 'traceroute 10.0.20.50', deviceId: 'rt-pca1' },
      { label: 'ping SRV-APP', command: 'ping 10.0.20.50', deviceId: 'rt-pca1' },
      { label: 'curl intranet', command: 'curl intranet.local', deviceId: 'rt-pca1' },
      { label: 'show ip int brief (R1)', command: 'show ip interface brief', deviceId: 'rt-r1' },
    ],
    devices: [
      {
        id: 'rt-pca1',
        name: 'PC-A1',
        type: 'pc',
        x: 110,
        y: 135,
        ip: '192.168.10.10',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '10.0.20.50',
        mac: '00:AA:10:00:00:10',
        up: true,
      },
      {
        id: 'rt-pca2',
        name: 'PC-A2',
        type: 'pc',
        x: 110,
        y: 335,
        ip: '192.168.10.11',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '10.0.20.50',
        mac: '00:AA:10:00:00:11',
        up: true,
      },
      {
        id: 'rt-swa',
        name: 'SW-REDE-A',
        type: 'switch',
        x: 270,
        y: 235,
        ip: '192.168.10.2',
        mask: '255.255.255.0',
        gateway: '192.168.10.1',
        dns: '',
        mac: '00:AA:10:00:00:02',
        up: true,
      },
      {
        id: 'rt-r1',
        name: 'R1-CORE',
        type: 'router',
        x: 435,
        y: 235,
        ip: '192.168.10.1',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:FF:01:00:00:01',
        up: true,
        interfaces: [
          {
            id: 'fa0/0',
            name: 'fa0/0',
            ip: '192.168.10.1',
            mask: '255.255.255.0',
            mac: '00:FF:01:00:00:01',
            up: true,
            subnetLabel: 'LAN A (Alunos)',
          },
          {
            id: 'fa0/1',
            name: 'fa0/1',
            ip: '10.0.20.1',
            mask: '255.255.255.0',
            mac: '00:FF:01:00:00:02',
            up: true,
            subnetLabel: 'LAN B (Servidores)',
          },
        ],
      },
      {
        id: 'rt-swb',
        name: 'SW-REDE-B',
        type: 'switch',
        x: 600,
        y: 235,
        ip: '10.0.20.2',
        mask: '255.255.255.0',
        gateway: '10.0.20.1',
        dns: '',
        mac: '00:BB:20:00:00:02',
        up: true,
      },
      {
        id: 'rt-srv',
        name: 'SRV-APP',
        type: 'server',
        x: 755,
        y: 135,
        ip: '10.0.20.50',
        mask: '255.255.255.0',
        gateway: '10.0.20.1',
        dns: '10.0.20.50',
        mac: '00:BB:20:00:00:50',
        up: true,
        services: { http: true, dns: true, dhcp: false },
        dnsRecords: {
          'intranet.local': '10.0.20.50',
          'api.escola.local': '10.0.20.50',
        },
      },
      {
        id: 'rt-pcb1',
        name: 'PC-B1',
        type: 'pc',
        x: 755,
        y: 335,
        ip: '10.0.20.15',
        mask: '255.255.255.0',
        gateway: '10.0.20.1',
        dns: '10.0.20.50',
        mac: '00:BB:20:00:00:15',
        up: true,
      },
    ],
    links: [
      { id: 'rl-1', fromId: 'rt-pca1', toId: 'rt-swa', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'rl-2', fromId: 'rt-pca2', toId: 'rt-swa', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'rl-3', fromId: 'rt-swa', toId: 'rt-r1', cableType: 'fiber', up: true, speedLabel: '10 Gbps', toInterface: 'fa0/0' },
      { id: 'rl-4', fromId: 'rt-r1', toId: 'rt-swb', cableType: 'fiber', up: true, speedLabel: '10 Gbps', fromInterface: 'fa0/1' },
      { id: 'rl-5', fromId: 'rt-swb', toId: 'rt-srv', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'rl-6', fromId: 'rt-swb', toId: 'rt-pcb1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
    ],
  },
  {
    id: 'wlan-dhcp',
    networkType: 'WLAN · Wi-Fi + DHCP',
    title: 'Rede Sem Fio com DHCP Automático',
    subtitle: 'Sub-rede 192.168.100.0/24',
    description:
      'Access Point conectado a um Roteador com serviço DHCP ativo. O NB-02 inicia sem endereço IP para praticar a obtenção automática (DORA).',
    objective:
      'Selecione NB-02 e execute dhclient (ou clique em "Obter IP via DHCP") para ver os 4 pacotes DORA e depois dê ping no servidor SRV-PORTAL.',
    suggestedCommands: [
      { label: 'dhclient (NB-02)', command: 'dhclient', deviceId: 'wl-nb2' },
      { label: 'ip addr (NB-02)', command: 'ip addr', deviceId: 'wl-nb2' },
      { label: 'ping 192.168.100.10', command: 'ping 192.168.100.10', deviceId: 'wl-nb2' },
      { label: 'curl wifi.local', command: 'curl wifi.local', deviceId: 'wl-nb1' },
    ],
    devices: [
      {
        id: 'wl-r1',
        name: 'R-DHCP',
        type: 'router',
        x: 190,
        y: 230,
        ip: '192.168.100.1',
        mask: '255.255.255.0',
        gateway: '',
        dns: '192.168.100.10',
        mac: '00:D0:10:00:00:01',
        up: true,
        services: { dhcp: true, http: false, dns: false },
        dhcpPool: {
          startIp: '192.168.100.50',
          endIp: '192.168.100.90',
          mask: '255.255.255.0',
          gateway: '192.168.100.1',
          dns: '192.168.100.10',
        },
        interfaces: [
          {
            id: 'fa0/0',
            name: 'fa0/0',
            ip: '192.168.100.1',
            mask: '255.255.255.0',
            mac: '00:D0:10:00:00:01',
            up: true,
            subnetLabel: 'LAN/WLAN Principal',
          },
        ],
      },
      {
        id: 'wl-srv',
        name: 'SRV-PORTAL',
        type: 'server',
        x: 190,
        y: 85,
        ip: '192.168.100.10',
        mask: '255.255.255.0',
        gateway: '192.168.100.1',
        dns: '192.168.100.10',
        mac: '00:D0:10:00:00:10',
        up: true,
        services: { http: true, dns: true, dhcp: false },
        dnsRecords: {
          'wifi.local': '192.168.100.10',
          'portal.escola.local': '192.168.100.10',
        },
      },
      {
        id: 'wl-ap',
        name: 'AP-WIFI-01',
        type: 'ap',
        x: 455,
        y: 230,
        ip: '192.168.100.2',
        mask: '255.255.255.0',
        gateway: '192.168.100.1',
        dns: '',
        mac: '00:D0:10:00:00:02',
        up: true,
      },
      {
        id: 'wl-nb1',
        name: 'NB-01',
        type: 'laptop',
        x: 710,
        y: 130,
        ip: '192.168.100.51',
        mask: '255.255.255.0',
        gateway: '192.168.100.1',
        dns: '192.168.100.10',
        mac: '00:D0:10:00:00:51',
        up: true,
      },
      {
        id: 'wl-nb2',
        name: 'NB-02 (Sem IP)',
        type: 'laptop',
        x: 710,
        y: 335,
        ip: '',
        mask: '',
        gateway: '',
        dns: '',
        mac: '00:D0:10:00:00:52',
        up: true,
      },
    ],
    links: [
      { id: 'wl-l1', fromId: 'wl-srv', toId: 'wl-r1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'wl-l2', fromId: 'wl-r1', toId: 'wl-ap', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'wl-l3', fromId: 'wl-ap', toId: 'wl-nb1', cableType: 'wireless', up: true, speedLabel: '300 Mbps' },
      { id: 'wl-l4', fromId: 'wl-ap', toId: 'wl-nb2', cableType: 'wireless', up: true, speedLabel: '300 Mbps' },
    ],
  },
  {
    id: 'ring-redundant',
    networkType: 'Topologia em Anel · Tolerância a Falhas',
    title: 'Anel de Switches com Rota Redundante',
    subtitle: 'Sub-rede 172.16.1.0/24',
    description:
      'Três switches interligados em anel por fibra óptica. Se um enlace cair, o tráfego contorna automaticamente pelo caminho alternativo.',
    objective:
      'Dê ping de PC-NORTE para PC-SUL. Depois clique no cabo de fibra entre SW-1 e SW-3 para derrubá-lo e rode o ping novamente para ver o desvio!',
    suggestedCommands: [
      { label: 'ping PC-SUL', command: 'ping 172.16.1.30', deviceId: 'rg-pc1' },
      { label: 'ping PC-LESTE', command: 'ping 172.16.1.20', deviceId: 'rg-pc1' },
      { label: 'arp -a', command: 'arp -a', deviceId: 'rg-pc1' },
    ],
    devices: [
      {
        id: 'rg-sw1',
        name: 'SW-01',
        type: 'switch',
        x: 330,
        y: 130,
        ip: '172.16.1.1',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:01',
        up: true,
      },
      {
        id: 'rg-sw2',
        name: 'SW-02',
        type: 'switch',
        x: 560,
        y: 130,
        ip: '172.16.1.2',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:02',
        up: true,
      },
      {
        id: 'rg-sw3',
        name: 'SW-03',
        type: 'switch',
        x: 445,
        y: 330,
        ip: '172.16.1.3',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:03',
        up: true,
      },
      {
        id: 'rg-pc1',
        name: 'PC-NORTE',
        type: 'pc',
        x: 135,
        y: 130,
        ip: '172.16.1.10',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:10',
        up: true,
      },
      {
        id: 'rg-pc2',
        name: 'PC-LESTE',
        type: 'pc',
        x: 755,
        y: 130,
        ip: '172.16.1.20',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:20',
        up: true,
      },
      {
        id: 'rg-pc3',
        name: 'PC-SUL',
        type: 'pc',
        x: 445,
        y: 445,
        ip: '172.16.1.30',
        mask: '255.255.255.0',
        gateway: '',
        dns: '',
        mac: '00:72:16:01:00:30',
        up: true,
      },
    ],
    links: [
      { id: 'rg-l1', fromId: 'rg-sw1', toId: 'rg-sw2', cableType: 'fiber', up: true, speedLabel: '10 Gbps' },
      { id: 'rg-l2', fromId: 'rg-sw2', toId: 'rg-sw3', cableType: 'fiber', up: true, speedLabel: '10 Gbps' },
      { id: 'rg-l3', fromId: 'rg-sw3', toId: 'rg-sw1', cableType: 'fiber', up: true, speedLabel: '10 Gbps' },
      { id: 'rg-l4', fromId: 'rg-pc1', toId: 'rg-sw1', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'rg-l5', fromId: 'rg-pc2', toId: 'rg-sw2', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
      { id: 'rg-l6', fromId: 'rg-pc3', toId: 'rg-sw3', cableType: 'ethernet', up: true, speedLabel: '1 Gbps' },
    ],
  },
  {
    id: 'blank-lab',
    networkType: 'Bancada Livre · Construa do Zero',
    title: 'Bancada em Branco (Livre)',
    subtitle: 'Monte sua própria topologia',
    description:
      'Adicione PCs, Switches, Roteadores, Servidores e Access Points, ligue os cabos, defina os IPs e valide tudo no terminal integrado.',
    objective:
      'Adicione ao menos 2 dispositivos e 1 Switch ou cabo direto, configure IPs na mesma sub-rede e teste com ping ou Envio de Pacote (PDU).',
    suggestedCommands: [
      { label: 'help', command: 'help' },
      { label: 'ip addr', command: 'ip addr' },
    ],
    devices: [],
    links: [],
  },
];
