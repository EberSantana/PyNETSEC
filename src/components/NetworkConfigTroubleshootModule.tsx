import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Network,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Wrench,
  XCircle,
} from 'lucide-react';
import { NetworkTroubleshootingTipsPanel } from './NetworkTroubleshootingTipsPanel';

interface TroubleshootScenario {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  solutionSteps: string[];
  brokenChecks: [boolean, boolean, boolean, boolean]; // [loopback, gateway, internetIp, dns]
}

const TROUBLESHOOT_SCENARIOS: TroubleshootScenario[] = [
  {
    id: 'cable-wifi',
    title: '1. Cabo desconectado ou Wi-Fi fora do alcance',
    symptom: 'Ícone de rede com "X" ou "Sem conexão"; nenhum site nem o roteador respondem.',
    cause: 'Falha na Camada 1/2 (cabo RJ-45 mal encaixado, porta do switch desligada ou adaptador Wi-Fi desativado).',
    solutionSteps: [
      'Verifique o LED da placa de rede (ou se o Wi-Fi não está em Modo Avião).',
      'Teste outro cabo par trançado ou troque a porta no switch.',
      'No Linux, confira o estado da interface com "ifconfig" ou "ip link".',
    ],
    brokenChecks: [true, false, false, false],
  },
  {
    id: 'dhcp-stuck',
    title: '2. Travado em "Obtendo endereço IP..." (Falha DHCP)',
    symptom: 'Conecta no Wi-Fi, mas recebe IP 169.254.x.x (APIPA) ou fica travado pedindo IP.',
    cause: 'O servidor DHCP do roteador travou, esgotou o pool de IPs ou há bloqueio na porta UDP 67/68.',
    solutionSteps: [
      'Reinicie o roteador/Access Point ou renove a concessão DHCP (ipconfig /renew ou sudo dhclient -r && sudo dhclient).',
      'Verifique se o pool de endereços DHCP do roteador não lotou.',
      'Como teste rápido, configure temporariamente um IP estático válido na sub-rede.',
    ],
    brokenChecks: [true, false, false, false],
  },
  {
    id: 'dns-fail',
    title: '3. Erro DNS_PROBE_FINISHED_NXDOMAIN (Ping no IP funciona, sites não)',
    symptom: 'O comando "ping 8.8.8.8" responde normalmente, mas abrir sites pelo nome falha.',
    cause: 'A rota até a internet funciona, mas o servidor DNS configurado está fora do ar ou incorreto.',
    solutionSteps: [
      'Confirme testando "nslookup portal.if.edu.br" ou "ping 8.8.8.8".',
      'Troque o servidor DNS nas configurações para um DNS confiável (ex.: 10.0.0.20 interno, 1.1.1.1 ou 8.8.8.8).',
      'Limpe o cache DNS (ipconfig /flushdns no Windows ou resolvectl flush-caches no Linux).',
    ],
    brokenChecks: [true, true, true, false],
  },
  {
    id: 'gateway-conflict',
    title: '4. Gateway incorreto ou Conflito de IP na rede local',
    symptom: 'Acessa PCs da mesma sala, mas não sai para a internet ou a conexão cai a cada minuto.',
    cause: 'IP estático digitado fora da sub-rede do gateway, máscara errada ou dois dispositivos com o mesmo IP.',
    solutionSteps: [
      'Confira com "ipconfig" / "ifconfig" se o IP e o Gateway pertencem à mesma sub-rede (ex.: 192.168.10.x com gateway 192.168.10.1).',
      'Evite configurar manualmente IPs que já estão dentro da faixa entregue pelo DHCP.',
      'Volte a interface para DHCP automático para eliminar conflitos de IP.',
    ],
    brokenChecks: [true, true, false, false],
  },
  {
    id: 'firewall-block',
    title: '5. Rede funciona, mas um serviço/porta específica não abre',
    symptom: 'Ping responde e a internet abre, mas SSH (22) ou Web local (80/8080) dá "Connection refused/timeout".',
    cause: 'Firewall local (UFW / Firewall do Windows) bloqueando a porta ou o serviço está parado no servidor.',
    solutionSteps: [
      'Verifique se o serviço está escutando com "netstat -at" ou "ss -tuln".',
      'Liste os perfis liberados no firewall Linux com "sudo ufw app list" e "sudo ufw status".',
      'Libere apenas a porta estritamente necessária (nunca exponha bancos como 3306 sem necessidade).',
    ],
    brokenChecks: [true, true, true, true],
  },
];

const DIAGNOSTIC_STEPS = [
  { label: '1. Placa local (Loopback)', cmd: 'ping 127.0.0.1' },
  { label: '2. Roteador (Gateway)', cmd: 'ping 192.168.10.1' },
  { label: '3. Internet externa (IP)', cmd: 'ping 8.8.8.8' },
  { label: '4. Resolução de nomes (DNS)', cmd: 'nslookup portal.if.edu.br' },
];

function isValidIpv4(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

interface NetworkConfigTroubleshootModuleProps {
  onOpenSandbox?: () => void;
  onOpenLinuxLab?: () => void;
}

export function NetworkConfigTroubleshootModule({
  onOpenSandbox,
  onOpenLinuxLab,
}: NetworkConfigTroubleshootModuleProps = {}) {
  // Part 1: Basic Network Configuration Lab
  const [configMode, setConfigMode] = useState<'dhcp' | 'static'>('dhcp');
  const [ipAddr, setIpAddr] = useState('192.168.10.25');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('192.168.10.1');
  const [dnsServer, setDnsServer] = useState('10.0.0.20');

  // Part 2: Network Troubleshooting Lab
  const [scenarioId, setScenarioId] = useState<string>('dns-fail');
  const [fixed, setFixed] = useState(false);

  const selectedScenario =
    TROUBLESHOOT_SCENARIOS.find((s) => s.id === scenarioId) ?? TROUBLESHOOT_SCENARIOS[0];

  const configValidation = useMemo(() => {
    if (configMode === 'dhcp') {
      return {
        valid: true,
        message:
          'Modo DHCP ativo: o roteador entrega IP (192.168.10.15), máscara (/24), gateway (192.168.10.1) e DNS (10.0.0.20) automaticamente, evitando conflitos de IP.',
      };
    }
    if (!isValidIpv4(ipAddr)) {
      return { valid: false, message: 'Endereço IPv4 inválido. Use 4 octetos entre 0 e 255 (ex.: 192.168.10.25).' };
    }
    if (!isValidIpv4(gateway)) {
      return { valid: false, message: 'Gateway padrão inválido. Exemplo esperado: 192.168.10.1.' };
    }
    if (!isValidIpv4(dnsServer)) {
      return { valid: false, message: 'Servidor DNS inválido. Exemplo: 10.0.0.20 ou 8.8.8.8.' };
    }
    if (ipAddr.trim() === gateway.trim()) {
      return { valid: false, message: 'Conflito de IP! O computador não pode usar o mesmo endereço do Gateway.' };
    }
    const ipNet = ipAddr.trim().split('.').slice(0, 3).join('.');
    const gwNet = gateway.trim().split('.').slice(0, 3).join('.');
    if (subnetMask.trim() === '255.255.255.0' && ipNet !== gwNet) {
      return {
        valid: false,
        message: `Sub-rede incompatível: o IP (${ipNet}.x) está em uma rede diferente do Gateway (${gwNet}.x) com máscara 255.255.255.0!`,
      };
    }
    return {
      valid: true,
      message: `Configuração estática válida! Host ${ipAddr}/24 alcança o gateway ${gateway} e resolve domínios via DNS ${dnsServer}.`,
    };
  }, [configMode, ipAddr, subnetMask, gateway, dnsServer]);

  const effectiveChecks: [boolean, boolean, boolean, boolean] = fixed
    ? [true, true, true, true]
    : selectedScenario.brokenChecks;

  return (
    <div className="space-y-6">
      {/* PART 1: CONFIGURAÇÃO BÁSICA DE REDE */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                1. Configuração Básica de Rede (DHCP vs. IP Estático)
              </h2>
              <p className="text-xs text-slate-400">
                Teste na prática os 4 parâmetros essenciais de qualquer placa de rede (IP, Máscara, Gateway e DNS).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#090D16] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setConfigMode('dhcp')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                configMode === 'dhcp' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Automático (DHCP)
            </button>
            <button
              type="button"
              onClick={() => setConfigMode('static')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
                configMode === 'static' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Manual (IP Estático)
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Interactive Parameters Form */}
          <div className="space-y-3 lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] font-bold text-cyan-300">
                  ENDEREÇO IPv4 (IDENTIDADE DO HOST)
                </span>
                <input
                  type="text"
                  disabled={configMode === 'dhcp'}
                  value={configMode === 'dhcp' ? '192.168.10.15 (via DHCP)' : ipAddr}
                  onChange={(e) => setIpAddr(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="block rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] font-bold text-cyan-300">
                  MÁSCARA DE SUB-REDE (TAMANHO DA REDE)
                </span>
                <input
                  type="text"
                  disabled={configMode === 'dhcp'}
                  value={configMode === 'dhcp' ? '255.255.255.0 (/24)' : subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="block rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] font-bold text-emerald-300">
                  GATEWAY PADRÃO (ROTEADOR DE SAÍDA)
                </span>
                <input
                  type="text"
                  disabled={configMode === 'dhcp'}
                  value={configMode === 'dhcp' ? '192.168.10.1' : gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="block rounded-xl border border-slate-800 bg-[#090D16] p-3">
                <span className="block font-mono text-[10px] font-bold text-amber-300">
                  SERVIDOR DNS (TRADUZ NOMES EM IP)
                </span>
                <input
                  type="text"
                  disabled={configMode === 'dhcp'}
                  value={configMode === 'dhcp' ? '10.0.0.20 (dns.if.lab)' : dnsServer}
                  onChange={(e) => setDnsServer(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#060911] px-2.5 py-1.5 font-mono text-xs text-slate-100 disabled:opacity-60 focus:border-cyan-400 focus:outline-none"
                />
              </label>
            </div>

            {/* Live Config Validation Result */}
            <div
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
                configValidation.valid
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-400/50 bg-rose-500/10 text-rose-200'
              }`}
            >
              {configValidation.valid ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{configValidation.message}</span>
            </div>
          </div>

          {/* Generated Linux Netplan Config Preview */}
          <div className="rounded-xl border border-slate-800 bg-[#060911] p-4 font-mono text-xs lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
              <span>/etc/netplan/01-netcfg.yaml</span>
              <span className="text-cyan-300">Linux Netplan</span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-300">
              {configMode === 'dhcp'
                ? `network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: true`
                : `network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: false\n      addresses: [${ipAddr}/24]\n      routes:\n        - to: default\n          via: ${gateway}\n      nameservers:\n        addresses: [${dnsServer}, 8.8.8.8]`}
            </pre>
            <p className="mt-3 font-sans text-[11px] text-slate-500">
              Dica: Teste errar o 3º número do IP (ex.: <code className="font-mono text-slate-300">192.168.99.25</code>) no modo Manual para ver o erro de sub-rede incompatível!
            </p>
          </div>
        </div>
      </div>

      {/* PART 2: SOLUÇÕES PARA PROBLEMAS DE REDE (TROUBLESHOOTING) */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                2. Soluções para Problemas de Rede (Diagnóstico Passo a Passo)
              </h2>
              <p className="text-xs text-slate-400">
                Selecione um problema real para ver quais testes falham e como corrigir da Camada 1 até a Camada 7.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Scenario list (5 cols) */}
          <div className="space-y-2 lg:col-span-5">
            {TROUBLESHOOT_SCENARIOS.map((sc) => {
              const active = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setScenarioId(sc.id);
                    setFixed(false);
                  }}
                  className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? 'border-cyan-400/70 bg-cyan-400/12'
                      : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                  }`}
                >
                  <div className={`text-xs font-bold ${active ? 'text-cyan-200' : 'text-slate-100'}`}>
                    {sc.title}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">{sc.symptom}</p>
                </button>
              );
            })}
          </div>

          {/* Live 4-Layer Diagnostic Checklist + Fix Simulator (7 cols) */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#090D16] p-4 lg:col-span-7">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100">
                    Bateria de Diagnóstico (Ordem Técnica)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFixed((v) => !v)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    fixed
                      ? 'border border-slate-700 bg-[#111827] text-slate-200'
                      : 'bg-emerald-400 text-[#05131C] hover:bg-emerald-300'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {fixed ? 'Simular falha novamente' : 'Aplicar solução'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DIAGNOSTIC_STEPS.map((step, idx) => {
                  const ok = effectiveChecks[idx];
                  return (
                    <div
                      key={step.cmd}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                        ok
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-rose-500/45 bg-rose-500/10'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-100">{step.label}</div>
                        <code className="font-mono text-[11px] text-slate-300">{step.cmd}</code>
                      </div>
                      {ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-amber-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  CAUSA PROVÁVEL
                </div>
                <p className="mt-1 text-slate-200">{selectedScenario.cause}</p>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-300">
                  PASSO A PASSO PARA RESOLVER
                </span>
                <ol className="mt-2 space-y-1.5 text-xs text-slate-200">
                  {selectedScenario.solutionSteps.map((st, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-cyan-300">{idx + 1}.</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PART 3: PAINEL DE DICAS DE TROUBLESHOOTING DE REDE */}
      <NetworkTroubleshootingTipsPanel
        onOpenSandbox={onOpenSandbox}
        onOpenLinuxLab={onOpenLinuxLab}
      />
    </div>
  );
}
