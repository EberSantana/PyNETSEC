import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Network,
  Play,
  RotateCcw,
  Server,
  Terminal,
} from 'lucide-react';

type LanConfigMode = 'dhcp' | 'static';
type LinuxToolset = 'ip' | 'ifconfig';

interface LanStep {
  id: string;
  step: number;
  title: string;
  layer: string;
  goal: string;
  commands: string[];
  explanation: string;
  expectedOutput: string;
  tip: string;
}

interface ValidationCheckItem {
  id: string;
  order: number;
  layer: string;
  title: string;
  command: string;
  expectedSignal: string;
  ifFails: string;
}

interface LanLinuxConfigGuideProps {
  onOpenLinuxLab?: () => void;
  onOpenSandbox?: () => void;
}

function isValidIpv4(value: string): boolean {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

export function LanLinuxConfigGuide({
  onOpenLinuxLab,
  onOpenSandbox,
}: LanLinuxConfigGuideProps) {
  const [configMode, setConfigMode] = useState<LanConfigMode>('dhcp');
  const [toolset, setToolset] = useState<LinuxToolset>('ip');
  const [iface, setIface] = useState('eth0');
  const [ipAddr, setIpAddr] = useState('192.168.10.25');
  const [cidr, setCidr] = useState('24');
  const [gateway, setGateway] = useState('192.168.10.1');
  const [dnsServer, setDnsServer] = useState('10.0.0.20');

  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [ranSteps, setRanSteps] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const safeIface = iface.trim().replace(/[^a-zA-Z0-9._-]/g, '') || 'eth0';
  const safeIp = isValidIpv4(ipAddr) ? ipAddr.trim() : '192.168.10.25';
  const safeGateway = isValidIpv4(gateway) ? gateway.trim() : '192.168.10.1';
  const safeDns = isValidIpv4(dnsServer) ? dnsServer.trim() : '10.0.0.20';
  const netmask =
    cidr === '16' ? '255.255.0.0' : cidr === '8' ? '255.0.0.0' : '255.255.255.0';
  const subnetPrefix = `${safeIp.split('.').slice(0, 3).join('.')}.0/${cidr}`;

  const subnetMismatch = useMemo(() => {
    if (configMode === 'dhcp') return false;
    if (!isValidIpv4(ipAddr) || !isValidIpv4(gateway)) return true;
    if (cidr !== '24') return false;
    const ipNet = ipAddr.trim().split('.').slice(0, 3).join('.');
    const gwNet = gateway.trim().split('.').slice(0, 3).join('.');
    return ipNet !== gwNet || ipAddr.trim() === gateway.trim();
  }, [configMode, ipAddr, gateway, cidr]);

  const steps: LanStep[] = useMemo(() => {
    const step1Cmds =
      toolset === 'ip'
        ? [`ip link show`, `sudo ip link set ${safeIface} up`]
        : [`ifconfig -a`, `sudo ifconfig ${safeIface} up`];

    const step1Out =
      toolset === 'ip'
        ? `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n2: ${safeIface}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether 08:00:27:4b:91:c2 brd ff:ff:ff:ff:ff:ff`
        : `${safeIface}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        ether 08:00:27:4b:91:c2  txqueuelen 1000  (Ethernet)`;

    const step2Cmds =
      configMode === 'dhcp'
        ? [
            `sudo dhclient -r ${safeIface}`,
            `sudo dhclient -v ${safeIface}`,
            toolset === 'ip' ? `ip -br addr show ${safeIface}` : `ifconfig ${safeIface}`,
          ]
        : toolset === 'ip'
          ? [
              `sudo ip addr flush dev ${safeIface}`,
              `sudo ip addr add ${safeIp}/${cidr} dev ${safeIface}`,
              `ip -br addr show ${safeIface}`,
            ]
          : [
              `sudo ifconfig ${safeIface} ${safeIp} netmask ${netmask} up`,
              `ifconfig ${safeIface}`,
            ];

    const step2Out =
      configMode === 'dhcp'
        ? `DHCPDISCOVER on ${safeIface} to 255.255.255.255 port 67\nDHCPOFFER of ${safeIp} from ${safeGateway}\nDHCPREQUEST for ${safeIp} on ${safeIface} to 255.255.255.255 port 67\nDHCPACK of ${safeIp} from ${safeGateway}\nbound to ${safeIp} -- renewal in 43200 seconds.\n\n${safeIface}  UP  ${safeIp}/${cidr}`
        : toolset === 'ip'
          ? `${safeIface}  UP  ${safeIp}/${cidr} fe80::a00:27ff:fe4b:91c2/64`
          : `${safeIface}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet ${safeIp}  netmask ${netmask}  broadcast ${safeIp.split('.').slice(0, 3).join('.')}.255`;

    const step3Cmds =
      configMode === 'dhcp'
        ? [toolset === 'ip' ? `ip route show` : `route -n`]
        : toolset === 'ip'
          ? [`sudo ip route add default via ${safeGateway} dev ${safeIface}`, `ip route show`]
          : [`sudo route add default gw ${safeGateway} ${safeIface}`, `route -n`];

    const step3Out =
      toolset === 'ip'
        ? `default via ${safeGateway} dev ${safeIface} proto ${configMode === 'dhcp' ? 'dhcp' : 'static'} metric 100\n${subnetPrefix} dev ${safeIface} proto kernel scope link src ${safeIp}`
        : `Kernel IP routing table\nDestination     Gateway         Genmask         Flags Iface\n0.0.0.0         ${safeGateway.padEnd(15)} 0.0.0.0         UG    ${safeIface}\n${subnetPrefix.split('/')[0].padEnd(15)} 0.0.0.0         ${netmask}   U     ${safeIface}`;

    const step4Cmds =
      configMode === 'dhcp'
        ? [`cat /etc/resolv.conf`, `resolvectl status ${safeIface}`]
        : [
            `echo "nameserver ${safeDns}" | sudo tee /etc/resolv.conf`,
            `echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf`,
            `cat /etc/resolv.conf`,
          ];

    const step4Out = `# Configuração de resolução de nomes (DNS)\nnameserver ${safeDns}\nnameserver 8.8.8.8\nsearch lan.local`;

    const step5Cmds = [
      `ip neigh show dev ${safeIface}`,
      `ping -c 3 ${safeGateway}`,
      `ss -tulnp`,
    ];

    const step5Out = `${safeGateway} lladdr 00:1a:2b:3c:4d:01 REACHABLE\n\nPING ${safeGateway} (${safeGateway}) 56(84) bytes of data.\n64 bytes from ${safeGateway}: icmp_seq=1 ttl=64 time=0.84 ms\n64 bytes from ${safeGateway}: icmp_seq=2 ttl=64 time=0.79 ms\n64 bytes from ${safeGateway}: icmp_seq=3 ttl=64 time=0.81 ms\n--- ${safeGateway} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`;

    return [
      {
        id: 'step-1',
        step: 1,
        title: 'Identificar e subir a interface de rede',
        layer: 'Camada 1 & 2 · Física / Enlace',
        goal: 'Descubra o nome exato da placa de rede (ex.: eth0, enp0s3, wlan0) e garanta que ela esteja ativada (UP) antes de configurar qualquer IP.',
        commands: step1Cmds,
        explanation:
          toolset === 'ip'
            ? 'O comando moderno "ip link show" substitui "ifconfig -a" nas distribuições Linux atuais. Ele mostra o endereço MAC, MTU e se o cabo físico está conectado (LOWER_UP).'
            : 'O comando clássico "ifconfig -a" (pacote net-tools) exibe inclusive interfaces desligadas. Usar "sudo ifconfig <iface> up" ativa a interface logicamente.',
        expectedOutput: step1Out,
        tip: 'Se aparecer "NO-CARRIER" ou "state DOWN", verifique o cabo RJ-45, a porta do switch ou a interface virtual da VM antes de avançar.',
      },
      {
        id: 'step-2',
        step: 2,
        title:
          configMode === 'dhcp'
            ? 'Solicitar IP automático via dhclient (DHCP)'
            : `Atribuir IP estático na LAN (${toolset === 'ip' ? 'ip addr' : 'ifconfig'})`,
        layer: 'Camada 3 · Endereçamento IPv4',
        goal:
          configMode === 'dhcp'
            ? 'Libere concessões antigas (-r) e peça um novo endereço IP, máscara, gateway e DNS ao servidor DHCP da rede local (-v).'
            : 'Configure manualmente o endereço IPv4 e a máscara da sub-rede na interface para servidores, impressoras ou laboratórios sem DHCP.',
        commands: step2Cmds,
        explanation:
          configMode === 'dhcp'
            ? 'O "dhclient -v" mostra ao vivo as 4 mensagens do protocolo DHCP (DORA): Discover → Offer → Request → Ack. Isso facilita identificar rapidamente se o servidor DHCP está respondendo.'
            : toolset === 'ip'
              ? 'Com "ip addr flush" limpamos IPs antigos e com "ip addr add" aplicamos o endereço já em notação CIDR (/24). Note que comandos "ip" e "ifconfig" não persistem após reiniciar o PC.'
              : 'No "ifconfig", informamos o IP seguido da palavra-chave "netmask" em formato decimal (255.255.255.0). Em servidores modernos, prefira o pacote iproute2 ("ip").',
        expectedOutput: step2Out,
        tip:
          configMode === 'dhcp'
            ? 'Se o dhclient ficar repetindo DHCPDISCOVER sem resposta, o serviço DHCP do roteador pode estar desligado ou a VLAN está sem servidor DHCP.'
            : 'Nunca escolha um IP manual que já esteja dentro da faixa dinâmica do DHCP do roteador, evitando conflito de IP na LAN.',
      },
      {
        id: 'step-3',
        step: 3,
        title:
          configMode === 'dhcp'
            ? 'Conferir a tabela de rotas e o Gateway padrão'
            : 'Definir o Gateway padrão (saída da LAN)',
        layer: 'Camada 3 · Roteamento',
        goal:
          configMode === 'dhcp'
            ? 'Confirme se o dhclient inseriu corretamente a rota padrão ("default via") apontando para o roteador da rede.'
            : 'Sem gateway padrão, o host Linux fala apenas com máquinas da mesma LAN e não alcança outras sub-redes nem a Internet.',
        commands: step3Cmds,
        explanation:
          'A rota "default" (ou 0.0.0.0/0) indica para qual roteador enviar qualquer pacote cujo destino não pertença à sub-rede local.',
        expectedOutput: step3Out,
        tip: 'O endereço do gateway precisa pertencer exatamente à mesma sub-rede do IP configurado na Etapa 2 (ex.: ambos em 192.168.10.x/24).',
      },
      {
        id: 'step-4',
        step: 4,
        title: 'Configurar DNS e garantir persistência',
        layer: 'Camada 7 · DNS & Persistência',
        goal: 'Garanta que nomes de domínio sejam traduzidos para IP e entenda como tornar a configuração permanente após reiniciar.',
        commands: step4Cmds,
        explanation:
          'O arquivo /etc/resolv.conf define os servidores DNS usados pelo sistema. Para configurações permanentes no Ubuntu/Debian moderno, salve o perfil em /etc/netplan/01-lan.yaml e aplique com "sudo netplan apply".',
        expectedOutput: step4Out,
        tip: 'Comandos executados diretamente com "ip", "ifconfig" ou "route" somem após um reboot — use Netplan, NetworkManager (nmcli) ou /etc/network/interfaces para persistência.',
      },
      {
        id: 'step-5',
        step: 5,
        title: 'Auditar vizinhos ARP, Gateway e serviços ativos',
        layer: 'Camada 2–4 · Validação Prática',
        goal: 'Feche a configuração verificando se o roteador aparece na tabela ARP (REACHABLE), responde ao ping e se as portas esperadas estão abertas.',
        commands: step5Cmds,
        explanation:
          '"ip neigh" comprova comunicação na Camada 2 (endereço MAC do gateway), "ping" valida ida e volta ICMP e "ss -tulnp" confirma quais serviços locais estão aceitando conexões na LAN.',
        expectedOutput: step5Out,
        tip: 'Agora avance para o check-list de validação de conectividade logo abaixo e marque cada verificação conforme executar no laboratório.',
      },
    ];
  }, [configMode, toolset, safeIface, safeIp, cidr, safeGateway, safeDns, netmask, subnetPrefix]);

  const checklistItems: ValidationCheckItem[] = useMemo(
    () => [
      {
        id: 'chk-link',
        order: 1,
        layer: 'Camada 1–2 · Física/Enlace',
        title: `Interface ${safeIface} está UP e com link físico`,
        command: toolset === 'ip' ? `ip link show ${safeIface}` : `ifconfig ${safeIface}`,
        expectedSignal: 'Contém <UP,LOWER_UP> ou RUNNING sem aviso NO-CARRIER',
        ifFails: 'Verifique cabo, switch, driver da placa ou rode "sudo ip link set eth0 up".',
      },
      {
        id: 'chk-ip',
        order: 2,
        layer: 'Camada 3 · IPv4',
        title: 'Endereço IPv4 e máscara pertencem à sub-rede LAN',
        command: toolset === 'ip' ? `ip -br addr show ${safeIface}` : `ifconfig ${safeIface}`,
        expectedSignal: `Exibe ${safeIp}/${cidr} (não pode ser 169.254.x.x nem vazio)`,
        ifFails: 'Renove com "sudo dhclient -r && sudo dhclient -v" ou reaplique o IP estático.',
      },
      {
        id: 'chk-loopback',
        order: 3,
        layer: 'Camada 3 · Pilha Local',
        title: 'Teste de Loopback (pilha TCP/IP do Linux operacional)',
        command: 'ping -c 3 127.0.0.1',
        expectedSignal: '3 transmitted, 3 received, 0% packet loss (< 1 ms)',
        ifFails: 'Verifique se a interface "lo" está ativa com "sudo ip link set lo up".',
      },
      {
        id: 'chk-gateway',
        order: 4,
        layer: 'Camada 2–3 · LAN',
        title: `Gateway (${safeGateway}) responde e aparece na tabela ARP`,
        command: `ping -c 3 ${safeGateway} && ip neigh`,
        expectedSignal: `0% packet loss e ${safeGateway} marcado como REACHABLE`,
        ifFails: 'Confira se IP e Gateway estão na mesma sub-rede e se o roteador está ligado.',
      },
      {
        id: 'chk-wan',
        order: 5,
        layer: 'Camada 3 · Roteamento Externo',
        title: 'Conectividade externa por IP (fora da LAN)',
        command: 'ping -c 3 8.8.8.8',
        expectedSignal: 'Respostas ICMP externas chegando com 0% packet loss',
        ifFails: 'Revise "ip route" (falta de default via) ou bloqueios de firewall/NAT no roteador.',
      },
      {
        id: 'chk-dns',
        order: 6,
        layer: 'Camada 7 · DNS',
        title: 'Resolução de nomes de domínio funcionando',
        command: 'nslookup portal.if.edu.br',
        expectedSignal: 'Retorna o IP do domínio sem erro NXDOMAIN ou timeout',
        ifFails: `Verifique /etc/resolv.conf (nameserver ${safeDns} ou 8.8.8.8) e porta UDP 53.`,
      },
    ],
    [safeIface, safeIp, cidr, safeGateway, safeDns, toolset]
  );

  const activeStep = steps[activeStepIdx] ?? steps[0];
  const checkedCount = checklistItems.filter((c) => Boolean(checkedItems[c.id])).length;
  const allChecked = checkedCount === checklistItems.length;
  const progressPct = Math.round((checkedCount / checklistItems.length) * 100);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSimulateFullValidation = () => {
    if (subnetMismatch) return;
    const allDone: Record<string, boolean> = {};
    for (const item of checklistItems) {
      allDone[item.id] = true;
    }
    setCheckedItems(allDone);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: HEADER & INTERACTIVE LAN PARAMETERS */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 xl:flex-row xl:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Server className="h-3.5 w-3.5" />
              Guia Prático Passo a Passo · Administração de Rede Local (LAN) no Linux
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-50">
              Configuração de Rede Local (LAN) com ip, ifconfig e dhclient
            </h2>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300">
              Personalize a interface e os endereços abaixo, escolha entre obtenção automática via{' '}
              <code className="font-mono text-cyan-300">dhclient</code> ou IP estático com{' '}
              <code className="font-mono text-cyan-300">ip</code> /{' '}
              <code className="font-mono text-cyan-300">ifconfig</code>, acompanhe os 5 passos e
              valide a conectividade no check-list ao final.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#090D16] p-1">
              <button
                type="button"
                onClick={() => setConfigMode('dhcp')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  configMode === 'dhcp'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                DHCP (dhclient)
              </button>
              <button
                type="button"
                onClick={() => setConfigMode('static')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  configMode === 'static'
                    ? 'bg-cyan-400 text-[#05131C]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                IP Estático (Manual)
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#090D16] p-1">
              <button
                type="button"
                onClick={() => setToolset('ip')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                  toolset === 'ip'
                    ? 'bg-emerald-400 text-[#05131C]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                ip (Moderno)
              </button>
              <button
                type="button"
                onClick={() => setToolset('ifconfig')}
                className={`cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                  toolset === 'ifconfig'
                    ? 'bg-amber-400 text-[#1C1104]'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                ifconfig (Clássico)
              </button>
            </div>
          </div>
        </div>

        {/* Live Customizable Parameters */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
            <span className="block font-mono text-[10px] font-semibold text-cyan-300">
              INTERFACE LINUX
            </span>
            <input
              type="text"
              value={iface}
              onChange={(e) => setIface(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <label className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
            <span className="block font-mono text-[10px] font-semibold text-cyan-300">
              {configMode === 'dhcp' ? 'IP PREVISTO (DHCP)' : 'IPv4 ESTÁTICO'}
            </span>
            <input
              type="text"
              value={ipAddr}
              onChange={(e) => setIpAddr(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <label className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
            <span className="block font-mono text-[10px] font-semibold text-cyan-300">
              PREFIXO CIDR
            </span>
            <select
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="24">/24 (255.255.255.0)</option>
              <option value="16">/16 (255.255.0.0)</option>
              <option value="8">/8 (255.0.0.0)</option>
            </select>
          </label>

          <label className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
            <span className="block font-mono text-[10px] font-semibold text-emerald-300">
              GATEWAY (ROTEADOR)
            </span>
            <input
              type="text"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <label className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
            <span className="block font-mono text-[10px] font-semibold text-amber-300">
              SERVIDOR DNS
            </span>
            <input
              type="text"
              value={dnsServer}
              onChange={(e) => setDnsServer(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>
        </div>

        {subnetMismatch && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/45 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>
              Atenção: em configuração estática /24, o IP do host ({ipAddr}) e o Gateway ({gateway})
              precisam ser IPv4 válidos, diferentes entre si e na mesma sub-rede (ex.: 192.168.10.25
              e 192.168.10.1).
            </span>
          </div>
        )}
      </section>

      {/* SECTION 2: 5-STEP INTERACTIVE LINUX LAN WALKTHROUGH */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-cyan-300">
              Roteiro Prático · 5 Passos na Linha de Comando
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-50">
              Configure a LAN do zero usando{' '}
              <span className="font-mono text-cyan-300">
                {configMode === 'dhcp' ? 'dhclient + ' : ''}
                {toolset === 'ip' ? 'ip' : 'ifconfig'}
              </span>
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            Etapa {activeStep.step} de {steps.length}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left 4 cols: 5 Stepper Items */}
          <div className="space-y-2 lg:col-span-4">
            {steps.map((s, idx) => {
              const isCurrent = idx === activeStepIdx;
              const isRan = Boolean(ranSteps[s.id]);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStepIdx(idx)}
                  className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    isCurrent
                      ? 'border-cyan-400 bg-[#162033]'
                      : isRan
                        ? 'border-emerald-500/35 bg-[#090D16] hover:border-emerald-400/60'
                        : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-cyan-300 tabular-nums">
                        0{s.step}
                      </span>
                      <span className="truncate font-semibold text-slate-100">{s.title}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{s.layer}</p>
                  </div>
                  {isRan && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Right 8 cols: Active Step Commands + Simulated Terminal */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#090D16] p-5 lg:col-span-8">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <p className="font-mono text-xs font-semibold text-cyan-300">
                  Passo 0{activeStep.step} · {activeStep.layer}
                </p>
                <h4 className="mt-1 text-lg font-bold text-slate-50">{activeStep.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{activeStep.goal}</p>
              </div>

              {/* Commands Box */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#060911]">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3.5 py-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-200">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                    Comandos Linux para esta etapa
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeStep.id, activeStep.commands.join('\n'))}
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-cyan-400/50 whitespace-nowrap"
                  >
                    {copiedId === activeStep.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar comandos
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-1.5 p-4 font-mono text-xs text-cyan-200">
                  {activeStep.commands.map((cmd) => (
                    <div key={cmd} className="flex items-start gap-2">
                      <span className="select-none text-slate-500">$</span>
                      <code className="break-all">{cmd}</code>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">{activeStep.explanation}</p>

              {/* Simulated Output Area */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#060911]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3.5 py-2 text-[11px]">
                  <span className="font-mono font-semibold text-slate-300">
                    Saída esperada no terminal
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRanSteps((prev) => ({ ...prev, [activeStep.id]: true }))
                    }
                    className="flex cursor-pointer items-center gap-1 rounded-md bg-cyan-400 px-2.5 py-1 text-[11px] font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {ranSteps[activeStep.id] ? 'Simulado ✓' : 'Simular execução'}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-300">
                  {activeStep.expectedOutput}
                </pre>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
                <strong className="font-semibold text-amber-300">Atenção prática:</strong>{' '}
                {activeStep.tip}
              </div>
            </div>

            {/* Step Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                {activeStepIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveStepIdx((i) => Math.max(0, i - 1))}
                    className="cursor-pointer rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 whitespace-nowrap"
                  >
                    Etapa anterior
                  </button>
                )}
                {activeStepIdx < steps.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRanSteps((prev) => ({ ...prev, [activeStep.id]: true }));
                      setActiveStepIdx((i) => Math.min(steps.length - 1, i + 1));
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                  >
                    Próxima etapa (0{activeStep.step + 1})
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Equivalency quick note */}
              <span className="font-mono text-[11px] text-slate-400">
                Equivalência: ip a ≈ ifconfig · ip route ≈ route -n
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE CONNECTIVITY VALIDATION CHECKLIST */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Validação Final · Camada 1 até Camada 7
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-50">
              Check-list de Validação de Conectividade da LAN
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Marque cada verificação após testar no terminal para garantir que placa, IP, rota e
              DNS estão operando sem falhas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="font-mono text-xs text-slate-300 tabular-nums">
              <strong className={allChecked ? 'text-emerald-400' : 'text-cyan-300'}>
                {checkedCount}/{checklistItems.length}
              </strong>{' '}
              validados ({progressPct}%)
            </span>
            <button
              type="button"
              disabled={subnetMismatch}
              onClick={handleSimulateFullValidation}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Validar tudo
            </button>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={() => setCheckedItems({})}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-[#090D16] px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              allChecked ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 6 Interactive Check Cards */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {checklistItems.map((item) => {
            const done = Boolean(checkedItems[item.id]);
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                  done
                    ? 'border-emerald-500/45 bg-emerald-500/5'
                    : 'border-slate-800 bg-[#090D16]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCheck(item.id)}
                      className="flex cursor-pointer items-start gap-2.5 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          done
                            ? 'border-emerald-400 bg-emerald-400 text-[#05131C]'
                            : 'border-slate-600 bg-[#111827] text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      <div>
                        <span className="font-mono text-[11px] font-semibold text-cyan-300">
                          0{item.order} · {item.layer}
                        </span>
                        <h4
                          className={`mt-0.5 text-sm font-bold ${
                            done ? 'text-emerald-200' : 'text-slate-100'
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.command)}
                      className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-[#111827] px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-400/50 whitespace-nowrap shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-800 bg-[#060911] px-3 py-2 font-mono text-xs text-cyan-200">
                    $ {item.command}
                  </div>

                  <p className="mt-2.5 text-xs text-slate-300">
                    <strong className="text-emerald-300">Sinal de sucesso:</strong>{' '}
                    {item.expectedSignal}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    <strong className="text-amber-300">Se falhar:</strong> {item.ifFails}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Banner + Lab Shortcuts */}
        <div
          className={`mt-5 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
            allChecked
              ? 'border-emerald-400/45 bg-emerald-400/10'
              : 'border-slate-800 bg-[#090D16]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                allChecked ? 'text-emerald-400' : 'text-slate-500'
              }`}
            />
            <div>
              <p className="text-sm font-bold text-slate-100">
                {allChecked
                  ? 'Conectividade LAN 100% validada da Camada 1 até o DNS!'
                  : 'Pronto para testar esses comandos na prática?'}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {allChecked
                  ? `Host ${safeIp}/${cidr} operacional via ${safeIface} com gateway ${safeGateway} e DNS ${safeDns}.`
                  : 'Abra o Terminal Linux ou o Sandbox de Redes para executar comandos de rede sem sair da plataforma.'}
              </p>
            </div>
          </div>

          {(onOpenLinuxLab || onOpenSandbox) && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenLinuxLab && (
                <button
                  type="button"
                  onClick={onOpenLinuxLab}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Praticar no Terminal Linux
                </button>
              )}
              {onOpenSandbox && (
                <button
                  type="button"
                  onClick={onOpenSandbox}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 whitespace-nowrap"
                >
                  <Network className="h-3.5 w-3.5 text-cyan-300" />
                  Abrir Sandbox de Redes
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
