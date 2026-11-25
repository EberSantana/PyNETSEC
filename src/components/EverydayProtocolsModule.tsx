import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FolderOpen,
  Globe,
  Monitor,
  Terminal,
  Wifi,
} from 'lucide-react';
import {
  EVERYDAY_PROTOCOLS,
  EVERYDAY_PROTOCOL_CATEGORIES,
  EverydayProtocolCategoryId,
  EverydayProtocolItem,
} from '../data/networkFundamentals';

interface EverydayProtocolsModuleProps {
  onOpenSandbox?: () => void;
}

type InspectToolId = 'devtools' | 'terminal' | 'wireshark';

const DEVTOOLS_SAMPLE_ROWS = [
  { name: 'portal.if.edu.br/', status: 200, protocol: 'h3', type: 'document', size: '18.4 kB', time: '24 ms' },
  { name: 'app.bundle.js', status: 200, protocol: 'h2', type: 'script', size: '94.1 kB', time: '31 ms' },
  { name: 'video-stream.m4s', status: 200, protocol: 'h3', type: 'media', size: '412 kB', time: '19 ms' },
  { name: 'api/v1/perfil', status: 200, protocol: 'h2', type: 'fetch', size: '1.2 kB', time: '42 ms' },
  { name: 'arquivo-inexistente.pdf', status: 404, protocol: 'h2', type: 'fetch', size: '0.4 kB', time: '15 ms' },
];

export function EverydayProtocolsModule({ onOpenSandbox }: EverydayProtocolsModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<EverydayProtocolCategoryId>('web');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('http-https');
  const [inspectTool, setInspectTool] = useState<InspectToolId>('devtools');
  const [terminalOs, setTerminalOs] = useState<'windows' | 'linux'>('windows');

  const categoryProtocols = EVERYDAY_PROTOCOLS.filter((p) => p.category === selectedCategory);
  const selectedProtocol: EverydayProtocolItem =
    EVERYDAY_PROTOCOLS.find((p) => p.id === selectedProtocolId) ?? categoryProtocols[0];

  const handleSelectCategory = (catId: EverydayProtocolCategoryId) => {
    setSelectedCategory(catId);
    const first = EVERYDAY_PROTOCOLS.find((p) => p.category === catId);
    if (first) setSelectedProtocolId(first.id);
  };

  const getCategoryIcon = (catId: EverydayProtocolCategoryId) => {
    if (catId === 'web') return Globe;
    if (catId === 'local') return Wifi;
    return FolderOpen;
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-5">
        <h2 className="text-base font-bold text-slate-100">
          Onde os Protocolos Aparecem no Seu Uso Cotidiano
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Os protocolos de rede não existem só nos livros: eles aparecem na barra do navegador, nas
          configurações de Wi-Fi, no e-mail e nos compartilhamentos de arquivos. Clique em cada
          categoria abaixo para ver como enxergá-los no dia a dia.
        </p>

        {/* 3 Everyday Categories */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {EVERYDAY_PROTOCOL_CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-cyan-400/70 bg-cyan-400/12'
                    : 'border-slate-800 bg-[#071225] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] font-bold ${
                      active ? 'bg-cyan-400 text-[#05131C]' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.number}
                  </span>
                  <Icon className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${active ? 'text-cyan-100' : 'text-slate-100'}`}>
                    {cat.title}
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-slate-400">{cat.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Protocols List + Visual "Como aparece na tela" Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 6 cols: Protocol Cards */}
        <div className="space-y-3 lg:col-span-6">
          {categoryProtocols.map((proto) => {
            const isSelected = proto.id === selectedProtocol.id;
            return (
              <button
                key={proto.id}
                type="button"
                onClick={() => setSelectedProtocolId(proto.id)}
                className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/70 bg-[#131F33]'
                    : 'border-slate-800 bg-[#0F1E36] hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold ${isSelected ? 'text-cyan-200' : 'text-slate-100'}`}>
                      {proto.name}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-400">
                      {proto.fullName} · {proto.portOrLayer}
                    </span>
                  </div>
                  <span className="rounded-md border border-slate-700 bg-[#071225] px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-300">
                    {proto.visualBadge}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                  {proto.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right 6 cols: Live "Como Você Enxerga na Tela" Inspector */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F1E36] p-5 lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <div>
                  <span className="block font-mono text-[10px] text-cyan-300">
                    COMO VOCÊ ENXERGA NA PRÁTICA
                  </span>
                  <h3 className="text-base font-bold text-slate-50">
                    {selectedProtocol.name}
                  </h3>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {selectedProtocol.portOrLayer}
              </span>
            </div>

            {/* Realistic Dark UI Mockup Window */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#050E1D]">
              <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B111E] px-3.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {selectedProtocol.screenMockupTitle}
                </span>
                <span className="w-8" />
              </div>

              <div className="space-y-2 p-4 font-mono text-xs leading-relaxed">
                {selectedProtocol.screenMockupLines.map((line, idx) => {
                  const isWarn = line.includes('⚠️') || line.includes('✕');
                  const isOk = line.includes('🔒') || line.includes('✓') || line.includes('Resultado:');
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border px-3 py-2 break-words ${
                        isWarn
                          ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                          : isOk
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-800 bg-[#071225] text-slate-200'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#071225] p-3.5 text-xs">
              <span className="font-mono text-[10px] font-semibold text-cyan-300">
                ONDE OBSERVAR NO DIA A DIA
              </span>
              <p className="mt-1 leading-relaxed text-slate-200">
                {selectedProtocol.whereYouSeeIt}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Dica: Clique nos outros protocolos ao lado ou alterne entre as 3 categorias acima para
            comparar Web, Rede Local e Arquivos/E-mail.
          </p>
        </div>
      </div>

      {/* SECTION 4: Como "ver" todos eles acontecendo em tempo real? */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1E36]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            <span className="font-mono text-[11px] font-semibold text-cyan-300">
              4. INSPEÇÃO REAL NOS BASTIDORES
            </span>
            <h3 className="mt-0.5 text-base font-bold text-slate-50">
              Como &ldquo;ver&rdquo; todos eles acontecendo em tempo real?
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Três formas práticas de inspecionar protocolos funcionando de verdade no seu computador.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-[#071225] p-1">
            <button
              type="button"
              onClick={() => setInspectTool('devtools')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                inspectTool === 'devtools'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              1. Navegador (F12)
            </button>
            <button
              type="button"
              onClick={() => setInspectTool('terminal')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                inspectTool === 'terminal'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              2. Terminal
            </button>
            <button
              type="button"
              onClick={() => setInspectTool('wireshark')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                inspectTool === 'wireshark'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              3. Wireshark
            </button>
          </div>
        </div>

        <div className="p-5">
          {inspectTool === 'devtools' && (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-slate-300">
                Aperte <kbd className="rounded border border-slate-700 bg-[#071225] px-1.5 py-0.5 font-mono text-cyan-300">F12</kbd> no
                Chrome ou Edge, vá na aba <strong className="text-slate-100">Network (Rede)</strong> e
                recarregue uma página. Ative a coluna <strong className="text-slate-100">Protocol</strong> para
                enxergar <code className="font-mono text-cyan-300">h2</code> (HTTP/2),{' '}
                <code className="font-mono text-emerald-300">h3</code> (HTTP/3 / QUIC) e os códigos de
                status HTTP (<code className="font-mono text-emerald-300">200</code> OK,{' '}
                <code className="font-mono text-rose-300">404</code> Não encontrado):
              </p>

              {/* Simulated Chrome DevTools Network Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#050E1D]">
                <table className="w-full text-left font-mono text-xs tabular-nums">
                  <thead className="border-b border-slate-800 bg-[#0B111E] text-[11px] text-slate-400">
                    <tr>
                      <th className="px-3.5 py-2.5">Name</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5 text-cyan-300">Protocol</th>
                      <th className="px-3.5 py-2.5">Type</th>
                      <th className="px-3.5 py-2.5">Size</th>
                      <th className="px-3.5 py-2.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {DEVTOOLS_SAMPLE_ROWS.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-900/50">
                        <td className="px-3.5 py-2 text-slate-200">{row.name}</td>
                        <td
                          className={`px-3.5 py-2 font-bold ${
                            row.status === 200 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {row.status}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-cyan-300">{row.protocol}</td>
                        <td className="px-3.5 py-2 text-slate-400">{row.type}</td>
                        <td className="px-3.5 py-2 text-slate-400">{row.size}</td>
                        <td className="px-3.5 py-2 text-slate-300">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {inspectTool === 'terminal' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs leading-relaxed text-slate-300">
                  Abra o Prompt de Comando / Terminal e rode dois comandos clássicos para ver{' '}
                  <strong className="text-cyan-300">IP + DHCP</strong> e{' '}
                  <strong className="text-emerald-300">DNS + ICMP</strong> em ação:
                </p>
                <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTerminalOs('windows')}
                    className={`cursor-pointer rounded px-2.5 py-1 font-semibold ${
                      terminalOs === 'windows' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400'
                    }`}
                  >
                    Windows (ipconfig)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerminalOs('linux')}
                    className={`cursor-pointer rounded px-2.5 py-1 font-semibold ${
                      terminalOs === 'linux' ? 'bg-cyan-400 text-[#05131C]' : 'text-slate-400'
                    }`}
                  >
                    Linux / Mac (ifconfig)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#050E1D] p-4 font-mono text-xs">
                  <div className="text-cyan-300">
                    $ {terminalOs === 'windows' ? 'ipconfig /all' : 'ifconfig wlan0'}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
                    {terminalOs === 'windows'
                      ? `Adaptador de Rede sem Fio Wi-Fi:\n   DHCP Habilitado . . . . . . . . : Sim\n   Endereço IPv4 . . . . . . . . . : 192.168.0.15\n   Máscara de Sub-rede . . . . . . : 255.255.255.0\n   Gateway Padrão  . . . . . . . . : 192.168.0.1\n   Servidor DHCP . . . . . . . . . : 192.168.0.1`
                      : `wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>\n   inet 192.168.0.15  netmask 255.255.255.0\n   ether 02:42:ac:11:00:15  (Endereço MAC)\n   # IP recebido automaticamente via DHCP do roteador`}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050E1D] p-4 font-mono text-xs">
                  <div className="text-cyan-300">$ ping google.com</div>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-300">
{`Disparando google.com [142.250.219.195] com 32 bytes:
  ↑ DNS traduziu "google.com" para IP 142.250.219.195!

Resposta de 142.250.219.195: bytes=32 tempo=12ms TTL=117
Resposta de 142.250.219.195: bytes=32 tempo=11ms TTL=117
  ↑ Protocolo ICMP medindo latência ida e volta (RTT)`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {inspectTool === 'wireshark' && (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#050E1D] p-5 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Wireshark — Captura Profunda de Pacotes em Tempo Real
                </div>
                <p className="max-w-2xl text-xs leading-relaxed text-slate-300">
                  O <strong className="text-cyan-300">Wireshark</strong> é um programa gratuito que
                  captura todo o tráfego da sua placa de rede, exibindo em tempo real pacotes{' '}
                  <code className="font-mono text-cyan-200">TCP</code>,{' '}
                  <code className="font-mono text-cyan-200">UDP</code>,{' '}
                  <code className="font-mono text-cyan-200">ARP</code>,{' '}
                  <code className="font-mono text-cyan-200">TLS</code> e{' '}
                  <code className="font-mono text-cyan-200">DNS</code> trafegando na sua máquina.
                </p>
                <p className="text-xs text-slate-400">
                  Quer praticar agora mesmo sem instalar nada? Nossa <strong>Sandbox Livre</strong> já
                  vem com <code className="font-mono text-cyan-300">sniff</code>,{' '}
                  <code className="font-mono text-cyan-300">ping</code>,{' '}
                  <code className="font-mono text-cyan-300">nslookup</code>,{' '}
                  <code className="font-mono text-cyan-300">nmap</code> e o{' '}
                  <strong>Network Monitor</strong> animado!
                </p>
              </div>

              {onOpenSandbox && (
                <button
                  type="button"
                  onClick={onOpenSandbox}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
                >
                  Abrir Sandbox + Network Monitor
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
