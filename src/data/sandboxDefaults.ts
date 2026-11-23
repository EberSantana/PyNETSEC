export interface SandboxHostInfo {
  host: string;
  label: string;
  openPorts: number[];
}

export interface SandboxTemplate {
  id: string;
  label: string;
  filename: string;
  description: string;
  code: string;
}

export const SANDBOX_LAB_HOSTS: SandboxHostInfo[] = [
  {
    host: '127.0.0.1',
    label: 'Localhost (Máquina do Aluno)',
    openPorts: [22, 80, 443, 8080],
  },
  {
    host: '10.0.0.10',
    label: 'Servidor Web Escolar',
    openPorts: [22, 80, 443, 3306],
  },
  {
    host: '10.0.0.20',
    label: 'Roteador / DNS do Lab',
    openPorts: [22, 53, 80],
  },
  {
    host: '192.168.10.1',
    label: 'Gateway Interno',
    openPorts: [22, 80],
  },
];

export const DEFAULT_SANDBOX_FILES: Record<string, string> = {
  'README.txt': `=== SANDBOX PYTHON & REDES · PYNETSEC ===
Diretório persistente: /workspace

Comandos no modo Shell:
  ls, pwd, cd <pasta>, cat <arquivo>, mkdir, touch, rm
  ping [-c N] <host>         -> Testa conectividade ICMP simulada
  nmap [-sV] <host>          -> Mapeia portas abertas/fechadas (SYN scan)
  whois <dominio|ip>         -> Consulta titular, bloco CIDR e alertas de risco
  nslookup <dominio>         -> Consulta registros DNS (A, NS, TXT)
  sniff [--proto HTTP|TCP|DNS|ICMP] [--host IP] [-c N] [--save captura.json]
  python3 scripts/sniffer_lab.py
  python3 scripts/scanner_etico.py

Em Python, importe o módulo nativo do lab:
  import netlab
  netlab.ping("10.0.0.10")
  netlab.nmap("10.0.0.10", scan_type="sV")
  netlab.whois("phish-alerta.lab")
  netlab.sniff(count=10, proto="HTTP")
`,
  'logs/acesso.log': `08:10:01 192.168.10.15 GET /portal 200 OK
08:10:14 10.0.0.55 POST /login 401 Unauthorized
08:10:19 10.0.0.55 POST /login 401 Unauthorized
08:11:02 192.168.10.22 GET /notas 200 OK
08:11:18 10.0.0.55 POST /login 401 Unauthorized
08:11:45 10.0.0.55 POST /login 401 Unauthorized
08:12:03 192.168.10.15 GET /calendario 200 OK
08:12:20 10.0.0.55 POST /login 401 Unauthorized
08:12:35 10.0.0.55 POST /login 401 Unauthorized
08:13:01 192.168.10.40 GET /biblioteca 200 OK
`,
  'wordlists/comuns.txt': `123456
admin
admin123
escola2026
python
rede_segura
qwerty
senha123
if_campus
cyber_lab
`,
  'scripts/scanner_etico.py': `import socket

alvo = "10.0.0.10"
portas = [21, 22, 53, 80, 443, 3306, 8080]

print(f"Iniciando varredura etica em {alvo}...")
for porta in portas:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        if s.connect_ex((alvo, porta)) == 0:
            print(f"  [ABERTA] Porta {porta}")
`,
  'scripts/analisar_log.py': `falhas = {}

with open("logs/acesso.log", "r", encoding="utf-8") as arquivo:
    for linha in arquivo:
        if "401 Unauthorized" in linha:
            ip = linha.split()[1]
            falhas[ip] = falhas.get(ip, 0) + 1

print("Resumo de falhas 401:")
for ip, total in falhas.items():
    print(f"  {ip} -> {total} tentativas")
`,
  'scripts/sniffer_lab.py': `import netlab

pacotes = netlab.sniff(count=14)
print(f"Total capturado: {len(pacotes)} pacotes\\n")

for pkt in pacotes:
    payload = pkt["payload"]
    if "texto puro" in payload or "port-scan" in payload or "suspeito" in payload:
        print(f"[ALERTA {pkt['proto']}] {pkt['src_ip']} -> {pkt['dst_ip']}:{pkt['dst_port']}")
        print(f"   Detalhe: {payload}")
`,
};

export const SANDBOX_TEMPLATES: SandboxTemplate[] = [
  {
    id: 'tpl-port-scanner',
    label: 'Scanner de Portas (socket)',
    filename: 'scripts/scanner_etico.py',
    description: 'Testa portas comuns em 10.0.0.10 usando socket.connect_ex()',
    code: DEFAULT_SANDBOX_FILES['scripts/scanner_etico.py'],
  },
  {
    id: 'tpl-http-banner',
    label: 'Banner Grabbing HTTP',
    filename: 'scripts/banner_http.py',
    description: 'Envia requisição HTTP via socket TCP e lê o cabeçalho do servidor',
    code: `import socket

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.settimeout(1.0)
    s.connect(("10.0.0.10", 80))
    s.sendall(b"GET / HTTP/1.1\\r\\nHost: 10.0.0.10\\r\\n\\r\\n")
    resposta = s.recv(1024).decode("utf-8", errors="ignore")
    print(resposta)
`,
  },
  {
    id: 'tpl-file-report',
    label: 'Ler e Gravar Relatório',
    filename: 'scripts/gerar_relatorio.py',
    description: 'Lê logs/acesso.log e grava um relatório persistente em relatorio.txt',
    code: `with open("logs/acesso.log", "r", encoding="utf-8") as f:
    linhas = f.readlines()

falhas = [l.strip() for l in linhas if "401" in l]

with open("relatorio.txt", "w", encoding="utf-8") as out:
    out.write(f"Total de linhas analisadas: {len(linhas)}\\n")
    out.write(f"Alertas 401 encontrados: {len(falhas)}\\n\\n")
    for item in falhas:
        out.write(f"- {item}\\n")

print("Arquivo relatorio.txt gravado no /workspace!")
`,
  },
  {
    id: 'tpl-wordlist-audit',
    label: 'Auditoria SHA-256 + Wordlist',
    filename: 'scripts/auditar_hash.py',
    description: 'Lê wordlists/comuns.txt do filesystem e testa cada senha contra um SHA-256',
    code: `import hashlib

alvo_hash = hashlib.sha256("if_campus".encode()).hexdigest()
print(f"Hash alvo: {alvo_hash[:24]}...")

with open("wordlists/comuns.txt", "r", encoding="utf-8") as f:
    for linha in f:
        senha = linha.strip()
        if hashlib.sha256(senha.encode()).hexdigest() == alvo_hash:
            print(f"Correspondencia encontrada na wordlist: {senha}")
            break
`,
  },
  {
    id: 'tpl-packet-sniffer',
    label: 'Packet Sniffer (netlab)',
    filename: 'scripts/sniffer_lab.py',
    description: 'Captura pacotes simulados e alerta sobre senhas em HTTP puro, port-scans SYN e DNS suspeito',
    code: `import netlab

pacotes = netlab.sniff(count=14)
print(f"Total capturado: {len(pacotes)} pacotes\\n")

for pkt in pacotes:
    payload = pkt["payload"]
    if "texto puro" in payload or "port-scan" in payload or "suspeito" in payload:
        print(f"[ALERTA {pkt['proto']}] {pkt['src_ip']} -> {pkt['dst_ip']}:{pkt['dst_port']}")
        print(f"   Detalhe: {payload}")
`,
  },
  {
    id: 'tpl-recon-whois',
    label: 'Reconhecimento (ping + whois)',
    filename: 'scripts/recon_whois.py',
    description: 'Automação de reconhecimento combinando ping, nslookup e whois via módulo netlab',
    code: `import netlab

alvos = ["portal.if.edu.br", "phish-alerta.lab"]

for dominio in alvos:
    dns = netlab.nslookup(dominio)
    ip = dns["a"][0] if dns["a"] else "N/A"
    ping_res = netlab.ping(dominio, count=2)
    info = netlab.whois(dominio)

    print(f"=== {dominio} ({ip}) ===")
    print(f"  Ping medio: {ping_res['avg_ms']} ms")
    print(f"  Criado em:  {info.get('created', '?')} | Pais: {info.get('country', '?')}")
    print(f"  Analise:    {info.get('risk_note', '')}\\n")
`,
  },
  {
    id: 'tpl-nmap-scan',
    label: 'Nmap Port & Service Scan',
    filename: 'scripts/nmap_lab.py',
    description: 'Executa varredura Nmap (-sV) no servidor escolar e destaca portas críticas',
    code: `import netlab

relatorio = netlab.nmap("10.0.0.10", scan_type="sV")
print(relatorio["raw"])

abertas = [p for p in relatorio["ports"] if p["state"] == "open"]
print(f"Resumo Python: {len(abertas)} servicos ativos encontrados.")
`,
  },
];
