import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Layers,
  Network,
  Route,
  Search,
  Terminal,
  Wrench,
} from 'lucide-react';

type SymptomFilter = 'all' | 'no-internet' | 'slow-route' | 'port-service' | 'dns-local';

export interface TroubleshootingCommandTip {
  id: string;
  command: string;
  altCommand: string;
  layer: string;
  category: Exclude<SymptomFilter, 'all'>;
  categoryLabel: string;
  headline: string;
  whenMostUseful: string;
  practicalExamples: { cmd: string; note: string }[];
  sampleOutput: string;
  whatToLookFor: string[];
  proTip: string;
}

export const TROUBLESHOOTING_COMMAND_TIPS: TroubleshootingCommandTip[] = [
  {
    id: 'ping',
    command: 'ping',
    altCommand: 'ICMP Echo Request / Reply (Linux & Windows)',
    layer: 'Camada 3 · Rede',
    category: 'no-internet',
    categoryLabel: 'Conectividade',
    headline: 'Primeiro teste para confirmar se um host está vivo e medir latência',
    whenMostUseful:
      'Use logo no início de qualquer chamado "sem internet" ou "servidor fora do ar". Siga a escada de diagnóstico: primeiro o loopback (127.0.0.1), depois o roteador/gateway (192.168.10.1) e por fim um IP externo (8.8.8.8) para isolar exatamente onde a comunicação quebra.',
    practicalExamples: [
      { cmd: 'ping -c 4 127.0.0.1', note: 'Valida se a pilha TCP/IP local está saudável' },
      { cmd: 'ping -c 4 192.168.10.1', note: 'Testa alcance até o roteador (gateway) na LAN' },
      { cmd: 'ping -c 4 8.8.8.8', note: 'Testa saída para a Internet sem depender de DNS' },
    ],
    sampleOutput: `$ ping -c 4 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=14.8 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=13.9 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=118 time=14.5 ms
--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms`,
    whatToLookFor: [
      '0% packet loss indica enlace estável; perdas acima de 1–2% apontam cabo ruim, interferência Wi-Fi ou congestionamento.',
      'Tempo (time=ms) muito alto ou oscilando demais (jitter) explica travamentos em chamadas e jogos online.',
      'Se ping 8.8.8.8 responde mas ping google.com falha, a conexão existe — o problema é no DNS.',
    ],
    proTip:
      'Alguns servidores bloqueiam ICMP no firewall. Um ping sem resposta não garante 100% que o servidor caiu — confirme também a porta do serviço.',
  },
  {
    id: 'traceroute',
    command: 'traceroute',
    altCommand: 'tracert (Windows) · mtr (tempo real)',
    layer: 'Camada 3 · Rede / Roteamento',
    category: 'slow-route',
    categoryLabel: 'Rota & Latência',
    headline: 'Mapeia cada roteador (salto) entre sua máquina e o destino final',
    whenMostUseful:
      'Ideal quando a rede funciona localmente, mas um site ou servidor distante está muito lento ou inacessível. Ele revela exatamente em qual salto (roteador da escola, operadora ou backbone externo) o pacote está travando ou sofrendo aumento brusco de latência.',
    practicalExamples: [
      { cmd: 'traceroute 8.8.8.8', note: 'Mostra cada salto até o destino (Linux/macOS)' },
      { cmd: 'traceroute -n 1.1.1.1', note: 'Mais rápido: pula resolução DNS reversa de cada salto' },
      { cmd: 'tracert portal.if.edu.br', note: 'Sintaxe equivalente no Prompt do Windows' },
    ],
    sampleOutput: `$ traceroute -n 8.8.8.8
 1  192.168.10.1    1.12 ms   0.98 ms   1.04 ms
 2  10.200.0.1      4.35 ms   4.21 ms   4.40 ms
 3  200.160.2.14   11.82 ms  12.10 ms  11.95 ms
 4  * * *
 5  8.8.8.8        14.60 ms  14.42 ms  14.55 ms`,
    whatToLookFor: [
      'Um salto com * * * seguido de resposta normal no salto seguinte apenas significa que aquele roteador intermediário não responde ICMP — não é falha.',
      'Se os asteriscos (* * *) continuam até o final sem nunca alcançar o destino, há bloqueio de firewall ou rota quebrada após o último IP válido.',
      'Um salto onde a latência salta de 5 ms para 250 ms e permanece alta nos seguintes mostra onde está o gargalo.',
    ],
    proTip:
      'O traceroute funciona enviando pacotes com TTL crescente (1, 2, 3...) e lendo as mensagens ICMP "Time Exceeded" devolvidas por cada roteador no caminho.',
  },
  {
    id: 'netstat',
    command: 'netstat',
    altCommand: 'ss -tulnp (substituto moderno no Linux)',
    layer: 'Camada 4 · Transporte (TCP/UDP)',
    category: 'port-service',
    categoryLabel: 'Portas & Serviços',
    headline: 'Lista portas abertas em escuta, conexões ativas e processos donos',
    whenMostUseful:
      'Essencial quando o servidor responde ao ping, mas a aplicação (Web 80/443, SSH 22, banco 3306) dá "Connection refused" ou quando você suspeita de uma porta estranha aberta (backdoor/malware). Mostra o que está escutando localmente e quem está conectado.',
    practicalExamples: [
      { cmd: 'netstat -tulnp', note: 'Lista todas as portas TCP/UDP em escuta (LISTEN) com PID/processo' },
      { cmd: 'ss -tulnp', note: 'Versão moderna e mais rápida presente nas distros Linux atuais' },
      { cmd: 'netstat -an | grep ESTABLISHED', note: 'Filtra apenas conexões ativas no momento' },
    ],
    sampleOutput: `$ sudo netstat -tulnp
Proto  Local Address      Foreign Address   State    PID/Program name
tcp    0.0.0.0:22         0.0.0.0:*         LISTEN   812/sshd
tcp    127.0.0.1:3306     0.0.0.0:*         LISTEN   1044/mysqld
tcp    0.0.0.0:443        0.0.0.0:*         LISTEN   1190/nginx
udp    0.0.0.0:53         0.0.0.0:*         LISTEN   640/systemd-resolved`,
    whatToLookFor: [
      'Local Address 127.0.0.1:3306 significa que o serviço só aceita conexões da própria máquina (seguro para banco local); 0.0.0.0:443 aceita de toda a rede.',
      'Se a porta do serviço não aparece como LISTEN, o daemon está parado — reinicie o serviço antes de mexer no firewall.',
      'Muitas conexões SYN_RECV simultâneas podem indicar tentativa de SYN Flood (DoS).',
    ],
    proTip:
      'Para auditoria de segurança (Blue Team), compare periodicamente a saída de "ss -tulnp" com a lista oficial de serviços autorizados no servidor.',
  },
  {
    id: 'nslookup',
    command: 'nslookup / dig',
    altCommand: 'nslookup (Windows & Linux) · dig (Linux/macOS)',
    layer: 'Camada 7 · Aplicação (DNS)',
    category: 'dns-local',
    categoryLabel: 'DNS & Nomes',
    headline: 'Verifica se um domínio está sendo traduzido corretamente para o IP certo',
    whenMostUseful:
      'Use sempre que "ping 8.8.8.8" funciona, mas o navegador exibe DNS_PROBE_FINISHED_NXDOMAIN, ou quando um site recém-migrado ainda aponta para o servidor antigo.',
    practicalExamples: [
      { cmd: 'nslookup portal.if.edu.br', note: 'Consulta o DNS configurado na sua máquina' },
      { cmd: 'nslookup portal.if.edu.br 8.8.8.8', note: 'Testa consultando diretamente o DNS do Google' },
      { cmd: 'dig +short A exemplo.com', note: 'Retorna apenas o IP resolvido de forma limpa (Linux)' },
    ],
    sampleOutput: `$ nslookup portal.if.edu.br 8.8.8.8
Server:   8.8.8.8
Address:  8.8.8.8#53

Non-authoritative answer:
Name:     portal.if.edu.br
Address:  200.132.45.18`,
    whatToLookFor: [
      'Se a consulta ao DNS local dá timeout mas consultar 8.8.8.8 funciona, o servidor DNS interno está fora do ar.',
      'NXDOMAIN significa que o nome de domínio não existe ou foi digitado incorretamente.',
      'Verifique se o endereço retornado coincide com o IP esperado do servidor (ajuda a detectar cache antigo ou DNS spoofing).',
    ],
    proTip:
      'Lembre-se: DNS usa principalmente UDP porta 53 para consultas rápidas e TCP porta 53 para respostas grandes ou transferência de zona.',
  },
  {
    id: 'ip-addr',
    command: 'ip addr / ipconfig',
    altCommand: 'ip a & ip route (Linux) · ipconfig /all (Windows)',
    layer: 'Camada 2 & 3 · Interface & IP',
    category: 'no-internet',
    categoryLabel: 'Interface & DHCP',
    headline: 'Inspeciona IP local, máscara, gateway padrão e estado físico da interface',
    whenMostUseful:
      'Primeiro comando para conferir se o computador recebeu IP válido do DHCP, se a interface está UP (ativa) ou se caiu em endereço APIPA (169.254.x.x) por falha ao conversar com o roteador.',
    practicalExamples: [
      { cmd: 'ip a', note: 'Exibe interfaces, MACs, IPs IPv4/IPv6 e estado UP/DOWN no Linux' },
      { cmd: 'ip route', note: 'Mostra a tabela de rotas e qual é o gateway padrão (default via)' },
      { cmd: 'ipconfig /all', note: 'Mostra IP, máscara, gateway, DHCP e DNS no Windows' },
    ],
    sampleOutput: `$ ip -br addr
lo       UNKNOWN  127.0.0.1/8
eth0     UP       192.168.10.25/24
wlan0    DOWN

$ ip route
default via 192.168.10.1 dev eth0
192.168.10.0/24 dev eth0 proto kernel scope link src 192.168.10.25`,
    whatToLookFor: [
      'Estado DOWN ou NO-CARRIER em eth0 indica cabo desconectado, porta de switch desligada ou interface desativada.',
      'IP começando com 169.254.x.x significa que nenhum servidor DHCP respondeu — renove o IP ou verifique o roteador.',
      'Ausência da linha "default via ..." em "ip route" explica acesso à LAN local sem acesso à Internet.',
    ],
    proTip:
      'No Linux moderno, prefira "ip a" e "ip route" (pacote iproute2) no lugar dos comandos legados "ifconfig" e "route".',
  },
  {
    id: 'arp-tcpdump',
    command: 'arp & tcpdump',
    altCommand: 'ip neigh (Linux) · tcpdump / Wireshark',
    layer: 'Camada 2–4 · Enlace & Pacotes',
    category: 'dns-local',
    categoryLabel: 'LAN & Captura',
    headline: 'Audita tabela IP↔MAC na LAN e captura pacotes reais quando tudo parece ok',
    whenMostUseful:
      'Use "arp -a" (ou "ip neigh") para detectar conflito de IP ou ARP Spoofing na rede local. Use "tcpdump" quando as configurações parecem certas, mas o tráfego some misteriosamente — ele prova se o pacote realmente saiu ou chegou na placa de rede.',
    practicalExamples: [
      { cmd: 'ip neigh', note: 'Lista vizinhos na LAN e seus endereços MAC aprendidos via ARP' },
      { cmd: 'sudo tcpdump -i eth0 port 443 -n', note: 'Captura ao vivo apenas pacotes TCP na porta 443' },
      { cmd: 'sudo tcpdump -i eth0 icmp', note: 'Confirma se pacotes ping estão chegando ao servidor' },
    ],
    sampleOutput: `$ ip neigh
192.168.10.1  dev eth0 lladdr 00:1a:2b:3c:4d:01 REACHABLE
192.168.10.12 dev eth0 lladdr a4:5e:60:b1:22:90 STALE

$ sudo tcpdump -i eth0 -n tcp port 22 -c 2
16:41:02.114 IP 192.168.10.25.51842 > 192.168.10.5.22: Flags [S], seq 10421
16:41:02.115 IP 192.168.10.5.22 > 192.168.10.25.51842: Flags [R.], ack 10422`,
    whatToLookFor: [
      'Na tabela ARP, dois IPs diferentes (como o gateway e outro PC) com o mesmo MAC podem sinalizar ataque ARP Spoofing (MITM).',
      'No tcpdump, ver Flags [S] seguido de Flags [R.] (RST) prova que a porta de destino está fechada no servidor.',
      'Ver vários Flags [S] sem nenhuma resposta indica um firewall descartando (DROP) silenciosamente os pacotes.',
    ],
    proTip:
      'No tcpdump, adicione "-n" para não resolver DNS durante a captura e manter a saída rápida e legível.',
  },
];

const SYMPTOM_FILTERS: { id: SymptomFilter; label: string }[] = [
  { id: 'all', label: 'Todos os comandos (6)' },
  { id: 'no-internet', label: 'Sem conexão / IP' },
  { id: 'slow-route', label: 'Lentidão na rota' },
  { id: 'port-service', label: 'Porta / Serviço fechado' },
  { id: 'dns-local', label: 'DNS / Rede Local (LAN)' },
];

interface NetworkTroubleshootingTipsPanelProps {
  onOpenSandbox?: () => void;
  onOpenLinuxLab?: () => void;
}

export function NetworkTroubleshootingTipsPanel({
  onOpenSandbox,
  onOpenLinuxLab,
}: NetworkTroubleshootingTipsPanelProps) {
  const [filter, setFilter] = useState<SymptomFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(TROUBLESHOOTING_COMMAND_TIPS[0].id);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const visibleCommands = useMemo(() => {
    if (filter === 'all') return TROUBLESHOOTING_COMMAND_TIPS;
    return TROUBLESHOOTING_COMMAND_TIPS.filter((item) => item.category === filter);
  }, [filter]);

  const activeTip = useMemo(() => {
    const found = visibleCommands.find((c) => c.id === selectedId);
    return found ?? visibleCommands[0] ?? TROUBLESHOOTING_COMMAND_TIPS[0];
  }, [visibleCommands, selectedId]);

  const handleCopy = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    window.setTimeout(() => setCopiedCmd(null), 1800);
  };

  const getCommandIcon = (id: string) => {
    if (id === 'ping') return Activity;
    if (id === 'traceroute') return Route;
    if (id === 'netstat') return Layers;
    if (id === 'nslookup') return Globe;
    if (id === 'ip-addr') return Network;
    return Search;
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Wrench className="h-3.5 w-3.5" />
            Guia de Campo · Diagnóstico Prático de Redes
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-50">
            Dicas de Troubleshooting de Rede
          </h2>
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300">
            Saiba exatamente qual comando rodar em cada incidente real — de conectividade básica com{' '}
            <code className="font-mono text-cyan-300">ping</code> e mapeamento de saltos com{' '}
            <code className="font-mono text-cyan-300">traceroute</code> até auditoria de portas com{' '}
            <code className="font-mono text-cyan-300">netstat/ss</code> e captura de pacotes.
          </p>
        </div>

        {(onOpenSandbox || onOpenLinuxLab) && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenSandbox && (
              <button
                type="button"
                onClick={onOpenSandbox}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 whitespace-nowrap"
              >
                <Network className="h-3.5 w-3.5" />
                Testar no Sandbox de Redes
              </button>
            )}
            {onOpenLinuxLab && (
              <button
                type="button"
                onClick={onOpenLinuxLab}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#090D16] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-400/50 hover:text-emerald-200 whitespace-nowrap"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                Abrir Terminal Linux
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Decision Flow Strip (Order of Troubleshooting) */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-[#090D16] p-4">
        <p className="text-[11px] font-semibold text-cyan-300">
          Ordem recomendada em campo (da Camada 1 até a Camada 7)
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'ip-addr', step: '1. ip a / ipconfig', desc: 'Tenho IP e gateway?' },
            { id: 'ping', step: '2. ping', desc: 'Alcanço gateway e 8.8.8.8?' },
            { id: 'nslookup', step: '3. nslookup / dig', desc: 'DNS traduz nomes?' },
            { id: 'traceroute', step: '4. traceroute', desc: 'Onde a rota trava?' },
            { id: 'netstat', step: '5. netstat / ss', desc: 'Porta está em LISTEN?' },
            { id: 'arp-tcpdump', step: '6. arp / tcpdump', desc: 'O pacote chega na placa?' },
          ].map((item, idx, arr) => {
            const isCurrent = activeTip.id === item.id;
            return (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setSelectedId(item.id);
                  }}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                      : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="font-mono font-semibold text-cyan-300">{item.step}</span>
                  <span className="ml-1.5 text-[11px] text-slate-400">{item.desc}</span>
                </button>
                {idx < arr.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-slate-600 sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Symptom Filter Bar */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-slate-400">Filtrar por sintoma:</span>
        {SYMPTOM_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                const nextList =
                  f.id === 'all'
                    ? TROUBLESHOOTING_COMMAND_TIPS
                    : TROUBLESHOOTING_COMMAND_TIPS.filter((item) => item.category === f.id);
                if (nextList.length > 0 && !nextList.some((c) => c.id === selectedId)) {
                  setSelectedId(nextList[0].id);
                }
              }}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                active
                  ? 'border-cyan-400 bg-cyan-400 text-[#05131C]'
                  : 'border-slate-800 bg-[#090D16] text-slate-300 hover:border-slate-700 hover:text-slate-100'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main Split: Left Command List | Right Practical Details & Terminal Output */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left 4 cols: Command Selector Cards */}
        <div className="space-y-2.5 lg:col-span-4">
          {visibleCommands.map((tip) => {
            const isSelected = tip.id === activeTip.id;
            const Icon = getCommandIcon(tip.id);
            return (
              <button
                key={tip.id}
                type="button"
                onClick={() => setSelectedId(tip.id)}
                className={`flex w-full cursor-pointer flex-col rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400 bg-[#162033]'
                    : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-sm font-bold text-cyan-300">{tip.command}</span>
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-slate-200">{tip.headline}</p>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {tip.layer} · {tip.categoryLabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right 8 cols: Detailed Practical Guide + Terminal Sample */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-[#090D16] p-5 lg:col-span-8">
          <div className="space-y-5">
            {/* Command Title Bar */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                <span className="font-mono font-semibold text-cyan-300">{activeTip.layer}</span>
                <span aria-hidden="true">·</span>
                <span>{activeTip.altCommand}</span>
              </div>
              <h3 className="mt-1 font-mono text-2xl font-bold text-slate-50">
                {activeTip.command}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                <strong className="text-emerald-300">Quando é mais útil na prática:</strong>{' '}
                {activeTip.whenMostUseful}
              </p>
            </div>

            {/* Practical Command Variations with Copy */}
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Comandos mais usados no dia a dia
              </p>
              <div className="mt-2.5 space-y-2">
                {activeTip.practicalExamples.map((ex) => {
                  const isCopied = copiedCmd === ex.cmd;
                  return (
                    <div
                      key={ex.cmd}
                      className="flex flex-col justify-between gap-2 rounded-xl border border-slate-800 bg-[#111827] px-3.5 py-2.5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <code className="font-mono text-xs font-semibold text-cyan-300">
                          {ex.cmd}
                        </code>
                        <p className="mt-0.5 text-xs text-slate-400">{ex.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(ex.cmd)}
                        className="flex cursor-pointer items-center gap-1 self-start rounded-md border border-slate-700 bg-[#090D16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap sm:self-auto"
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
                  );
                })}
              </div>
            </div>

            {/* Simulated Terminal Output */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#060911]">
              <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-300">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  Exemplo real de saída no terminal
                </span>
                <span className="font-mono text-slate-500">Saída típica</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-300">
                {activeTip.sampleOutput}
              </pre>
            </div>

            {/* What to look for */}
            <div>
              <p className="text-xs font-semibold text-slate-200">
                O que observar ao interpretar o resultado
              </p>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
                {activeTip.whatToLookFor.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Tip Footer */}
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
            <strong className="font-semibold text-amber-300">Dica de campo:</strong>{' '}
            {activeTip.proTip}
          </div>
        </div>
      </div>
    </section>
  );
}
