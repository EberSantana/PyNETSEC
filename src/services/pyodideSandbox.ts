import { ensurePyodideReady } from './pyodideEngine';
import { translatePythonError } from './errorTranslator';
import { NetworkVisualEvent, TranslatedPythonError } from '../types/ctf';

export interface SandboxExecResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  cwd: string;
  files: Record<string, string>;
  durationMs: number;
  translatedError?: TranslatedPythonError;
  visualEvent?: NetworkVisualEvent | null;
}

const SANDBOX_BOOTSTRAP_PYTHON = `
import os, sys, io, json, socket as _real_socket, traceback, shlex, shutil

_WORKSPACE_ROOT = "/workspace"
os.makedirs(_WORKSPACE_ROOT, exist_ok=True)

# Virtual lab network topology (100% in-memory, safe for school firewalls)
_VIRTUAL_LAB_NETWORK = {
    "127.0.0.1": {
        22: b"SSH-2.0-OpenSSH_9.6p1 PyNetSecLocal\\r\\n",
        80: b"HTTP/1.1 200 OK\\r\\nServer: PyNetSec-LocalHTTP/1.0\\r\\nContent-Type: text/plain\\r\\n\\r\\nBem-vindo ao servidor local (127.0.0.1:80)\\n",
        443: b"TLSv1.3 Handshake OK (certificado local: localhost.pynetsec.lab)\\r\\n",
        8080: b"HTTP/1.1 200 OK\\r\\nServer: PyNetSec-Dev/8080\\r\\n\\r\\nPainel de testes local ativo.\\n",
    },
    "10.0.0.10": {
        22: b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-LabIF\\r\\n",
        80: b"HTTP/1.1 200 OK\\r\\nServer: nginx/1.24.0 (IF-Lab)\\r\\nX-Lab-Host: web-escolar\\r\\n\\r\\nPortal Escolar Simulado - Ambiente Seguro\\n",
        443: b"TLSv1.3 Handshake OK (CN=portal.if.lab)\\r\\n",
        3306: b"5.7.44-MySQL-Lab-Simulado\\x00\\r\\n",
    },
    "10.0.0.20": {
        22: b"SSH-2.0-Dropbear_2022.83 RouterLab\\r\\n",
        53: b"DNS-Lab-Resolver Ready (10.0.0.20:53)\\r\\n",
        80: b"HTTP/1.1 200 OK\\r\\nServer: RouterOS-Lab\\r\\n\\r\\nPainel do Roteador Simulado\\n",
    },
    "192.168.10.1": {
        22: b"SSH-2.0-OpenSSH_9.2 GatewayIF\\r\\n",
        80: b"HTTP/1.1 200 OK\\r\\nServer: Gateway-IF/1.0\\r\\n\\r\\nGateway Interno 192.168.10.1\\n",
    },
}

_LOCAL_BOUND_PORTS = {}
_SOCKET_TRACE = []
_SOCKET_LAST_TARGET = None
_SOCKET_PORT_STATES = {}

def _record_socket_packet(direction, proto, src, dst, flags, size_bytes, ttl, payload, explanation, severity="normal", latency_ms=None):
    if len(_SOCKET_TRACE) >= 16:
        return
    pkt = {
        "seq": len(_SOCKET_TRACE) + 1,
        "direction": direction,
        "proto": proto,
        "src": src,
        "dst": dst,
        "flags": flags,
        "bytes": int(size_bytes),
        "ttl": int(ttl),
        "payload": payload,
        "explanation": explanation,
        "severity": severity,
    }
    if latency_ms is not None:
        pkt["latencyMs"] = latency_ms
    _SOCKET_TRACE.append(pkt)

def _normalize_host(host):
    h = str(host).strip().lower()
    if h in ("localhost", "0.0.0.0", ""):
        return "127.0.0.1"
    return h

class _SimulatedLabSocket:
    def __init__(self, family=2, type=1, proto=0, fileno=None):
        self.family = family
        self.type = type
        self.proto = proto
        self._timeout = None
        self._connected_to = None
        self._bound_to = None
        self._closed = False
        self._buffer = b""
        self._sent_data = b""
        self._local_port = 51000 + ((len(_SOCKET_TRACE) * 17) % 9000)

    def settimeout(self, value):
        self._timeout = value

    def gettimeout(self):
        return self._timeout

    def setsockopt(self, level, optname, value):
        pass

    def bind(self, address):
        host, port = address
        norm = _normalize_host(host)
        if norm != "127.0.0.1":
            raise PermissionError("No sandbox, bind() so e permitido em 127.0.0.1 / localhost.")
        self._bound_to = (norm, int(port))

    def listen(self, backlog=5):
        if not self._bound_to:
            raise OSError("Chame bind(('127.0.0.1', porta)) antes de listen().")
        _, port = self._bound_to
        _LOCAL_BOUND_PORTS[port] = f"Servico local do aluno ouvindo em 127.0.0.1:{port}\\r\\n".encode("utf-8")

    def _lookup_service(self, host, port):
        norm = _normalize_host(host)
        p = int(port)
        if norm == "127.0.0.1" and p in _LOCAL_BOUND_PORTS:
            return _LOCAL_BOUND_PORTS[p]
        if norm not in _VIRTUAL_LAB_NETWORK:
            raise PermissionError(
                f"Codigo de Etica do Sandbox: host '{host}' fora da rede virtual. "
                "Use 127.0.0.1, 10.0.0.10, 10.0.0.20 ou 192.168.10.1."
            )
        return _VIRTUAL_LAB_NETWORK[norm].get(p)

    def connect(self, address):
        global _SOCKET_LAST_TARGET
        host, port = address
        norm = _normalize_host(host)
        p = int(port)
        _SOCKET_LAST_TARGET = (str(host), norm)
        src = f"192.168.10.15:{self._local_port}"
        dst = f"{norm}:{p}"
        _record_socket_packet(
            "tx", "TCP", src, dst, "SYN", 60, 64,
            f"socket.connect(('{norm}', {p})) — iniciando handshake TCP",
            f"Seu script Python enviou um pacote TCP SYN tentando abrir conexao na porta {p} de {norm}.",
            "normal",
        )
        banner = self._lookup_service(host, port)
        if banner is None:
            _SOCKET_PORT_STATES[p] = "closed"
            _record_socket_packet(
                "rx", "TCP", dst, src, "RST-ACK", 54, 64,
                f"Conexao recusada na porta {p}/tcp",
                f"Nenhum servico escuta na porta {p} de {norm}. O alvo devolveu RST-ACK e Python lancou ConnectionRefusedError.",
                "warn", 1.1,
            )
            raise ConnectionRefusedError(111, f"Conexao recusada em {host}:{port}")
        _SOCKET_PORT_STATES[p] = "open"
        self._connected_to = (norm, p)
        self._buffer = banner
        _record_socket_packet(
            "rx", "TCP", dst, src, "SYN-ACK", 60, 64,
            f"Porta {p}/tcp aceitou conexao (handshake concluido)",
            f"O servico na porta {p} de {norm} respondeu SYN-ACK confirmando que a porta esta aberta.",
            "ok", 1.4,
        )

    def connect_ex(self, address):
        global _SOCKET_LAST_TARGET
        host, port = address
        norm = _normalize_host(host)
        p = int(port)
        _SOCKET_LAST_TARGET = (str(host), norm)
        src = f"192.168.10.15:{self._local_port}"
        dst = f"{norm}:{p}"
        _record_socket_packet(
            "tx", "TCP", src, dst, "SYN", 60, 64,
            f"socket.connect_ex(('{norm}', {p}))",
            f"Sonda TCP SYN enviada pelo script Python para testar a porta {p} em {norm}.",
            "normal",
        )
        try:
            banner = self._lookup_service(host, port)
        except PermissionError:
            _record_socket_packet(
                "drop", "TCP", src, dst, "BLOCK", 60, 64,
                f"Bloqueado pelo escopo etico do sandbox ({host})",
                f"Tentativa fora da rede virtual segura foi interceptada antes de sair.",
                "alert",
            )
            raise
        if banner is None:
            _SOCKET_PORT_STATES[p] = "closed"
            _record_socket_packet(
                "rx", "TCP", dst, src, "RST-ACK", 54, 64,
                f"connect_ex -> codigo 111 (porta {p} fechada)",
                f"A porta {p} respondeu RST-ACK. Em Python, connect_ex() retorna 111 em vez de levantar erro.",
                "normal", 0.9,
            )
            return 111
        _SOCKET_PORT_STATES[p] = "open"
        self._connected_to = (norm, p)
        self._buffer = banner
        _record_socket_packet(
            "rx", "TCP", dst, src, "SYN-ACK", 60, 64,
            f"connect_ex -> 0 (porta {p} ABERTA!)",
            f"A porta {p} de {norm} devolveu SYN-ACK! Em Python, connect_ex() retorna 0 indicando sucesso.",
            "ok", 1.3,
        )
        return 0

    def send(self, data):
        if not self._connected_to:
            raise OSError("Socket nao conectado.")
        if isinstance(data, str):
            data = data.encode("utf-8")
        self._sent_data += bytes(data)
        host, port = self._connected_to
        preview = data.decode("utf-8", errors="ignore").replace("\\r\\n", " ").strip()[:72] or f"{len(data)} bytes"
        proto = "HTTP" if port in (80, 8080) else "TCP"
        _record_socket_packet(
            "tx", proto, f"192.168.10.15:{self._local_port}", f"{host}:{port}", "PSH-ACK", 54 + len(data), 64,
            preview,
            f"Seu script enviou {len(data)} byte(s) de dados pela conexao TCP estabelecida com {host}:{port}.",
            "normal",
        )
        if port in (80, 8080) and b"GET " in self._sent_data:
            req_line = self._sent_data.split(b"\\r\\n")[0].decode("utf-8", errors="ignore")
            self._buffer = (
                f"HTTP/1.1 200 OK\\r\\nServer: PyNetSec-Lab ({host}:{port})\\r\\n"
                f"X-Request: {req_line}\\r\\n\\r\\n"
                f"Resposta simulada com sucesso para {req_line}\\n"
            ).encode("utf-8")
        return len(data)

    def sendall(self, data):
        self.send(data)
        return None

    def recv(self, bufsize=1024):
        if not self._connected_to:
            raise OSError("Socket nao conectado.")
        chunk = self._buffer[:bufsize]
        self._buffer = self._buffer[bufsize:]
        if chunk:
            host, port = self._connected_to
            preview = chunk.decode("utf-8", errors="ignore").replace("\\r\\n", " ").strip()[:78]
            proto = "HTTP" if port in (80, 8080) else "TCP"
            _record_socket_packet(
                "rx", proto, f"{host}:{port}", f"192.168.10.15:{self._local_port}", "PSH-ACK", 54 + len(chunk), 64,
                preview,
                f"Banner/resposta de {len(chunk)} byte(s) recebida de {host}:{port} via socket.recv().",
                "ok", 1.6,
            )
        return chunk

    def getpeername(self):
        return self._connected_to

    def getsockname(self):
        return self._bound_to or ("127.0.0.1", 0)

    def close(self):
        self._closed = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()
        return False

def _sim_create_connection(address, timeout=None, source_address=None):
    s = _SimulatedLabSocket()
    if timeout is not None:
        s.settimeout(timeout)
    s.connect(address)
    return s

def _sim_gethostbyname(hostname):
    h = str(hostname).strip().lower()
    mapping = {
        "localhost": "127.0.0.1",
        "web.if.lab": "10.0.0.10",
        "portal.if.edu.br": "10.0.0.10",
        "dns.if.lab": "10.0.0.20",
        "gateway.if.lab": "192.168.10.1",
        "phish-alerta.lab": "185.220.101.47",
    }
    return mapping.get(h, h)

_real_socket.socket = _SimulatedLabSocket
_real_socket.create_connection = _sim_create_connection
_real_socket.gethostbyname = _sim_gethostbyname

import types as _types
import random as _random

_DNS_RECORDS = {
    "localhost": {"a": ["127.0.0.1"], "ns": ["dns.if.lab"], "txt": ["v=lab-local"]},
    "web.if.lab": {"a": ["10.0.0.10"], "ns": ["dns.if.lab"], "txt": ["v=spf1 ip4:10.0.0.0/24 -all"]},
    "portal.if.edu.br": {"a": ["10.0.0.10"], "ns": ["dns.if.lab"], "txt": ["v=spf1 include:if.edu.br -all", "lab-env=educacional"]},
    "dns.if.lab": {"a": ["10.0.0.20"], "ns": ["dns.if.lab"], "txt": ["role=internal-resolver"]},
    "gateway.if.lab": {"a": ["192.168.10.1"], "ns": ["dns.if.lab"], "txt": ["role=campus-gateway"]},
    "phish-alerta.lab": {"a": ["185.220.101.47"], "ns": ["ns1.offshore-sim.lab"], "txt": ["ATENCAO: dominio recem-criado suspeito"]},
}

_WHOIS_DB = {
    "127.0.0.1": {
        "org": "Loopback Local (RFC 1122)",
        "registrar": "IANA Reserved",
        "country": "LOCAL",
        "created": "1981-09-01",
        "cidr": "127.0.0.0/8",
        "abuse_email": "local@localhost",
        "risk_note": "Endereco local da propria maquina do aluno (seguro para testes).",
    },
    "10.0.0.10": {
        "org": "Instituto Federal — Laboratorio de Redes (Servidor Web)",
        "registrar": "Rede Privada RFC 1918",
        "country": "BR",
        "created": "2023-02-15",
        "cidr": "10.0.0.0/24",
        "abuse_email": "seguranca@if.lab",
        "risk_note": "Ativo interno autorizado (portas 22, 80, 443, 3306).",
    },
    "10.0.0.20": {
        "org": "Instituto Federal — Roteador e Resolvedor DNS",
        "registrar": "Rede Privada RFC 1918",
        "country": "BR",
        "created": "2023-02-15",
        "cidr": "10.0.0.0/24",
        "abuse_email": "redes@if.lab",
        "risk_note": "Infraestrutura DNS/roteamento interna do laboratorio.",
    },
    "192.168.10.1": {
        "org": "Gateway Interno da Sala de Aula",
        "registrar": "Rede Privada RFC 1918",
        "country": "BR",
        "created": "2024-01-10",
        "cidr": "192.168.10.0/24",
        "abuse_email": "redes@if.lab",
        "risk_note": "Gateway padrao da sub-rede dos alunos.",
    },
    "185.220.101.47": {
        "org": "AnonRelay Transit Network (No de Saida Simulado)",
        "registrar": "RIPE NCC (Simulado)",
        "country": "DE",
        "created": "2026-11-18",
        "cidr": "185.220.101.0/24",
        "abuse_email": "abuse@anonrelay-sim.example",
        "risk_note": "ALERTA: IP associado a tentativas de forca bruta 401 e varreduras SYN nos logs do lab.",
    },
    "portal.if.edu.br": {
        "org": "Instituto Federal de Educacao (Simulado)",
        "registrar": "Registro.br (Simulado)",
        "country": "BR",
        "created": "2014-05-12",
        "cidr": "10.0.0.0/24",
        "abuse_email": "cert@if.edu.br",
        "risk_note": "Dominio institucional antigo e legitimo.",
    },
    "web.if.lab": {
        "org": "Servidor Web Escolar (Lab PyNetSec)",
        "registrar": "NIC Lab Interno",
        "country": "BR",
        "created": "2023-02-15",
        "cidr": "10.0.0.0/24",
        "abuse_email": "seguranca@if.lab",
        "risk_note": "Alvo interno autorizado do laboratorio.",
    },
    "dns.if.lab": {
        "org": "Resolvedor DNS do Laboratorio",
        "registrar": "NIC Lab Interno",
        "country": "BR",
        "created": "2023-02-15",
        "cidr": "10.0.0.0/24",
        "abuse_email": "redes@if.lab",
        "risk_note": "Servico DNS interno.",
    },
    "gateway.if.lab": {
        "org": "Gateway Interno da Bancada",
        "registrar": "NIC Lab Interno",
        "country": "BR",
        "created": "2024-01-10",
        "cidr": "192.168.10.0/24",
        "abuse_email": "redes@if.lab",
        "risk_note": "Gateway interno da sala.",
    },
    "phish-alerta.lab": {
        "org": "Privacy Shield Proxy (Oculto)",
        "registrar": "FastCheapDomains Ltd (Simulado)",
        "country": "PA",
        "created": "2026-11-20",
        "cidr": "185.220.101.0/24",
        "abuse_email": "abuse@fastcheap-sim.example",
        "risk_note": "ALTO RISCO: Dominio criado ha menos de 48h com titular oculto e IP suspeito (indicador classico de phishing).",
    },
}

_PACKET_POOL = [
    {"timestamp": "14:01:02.114", "src_ip": "192.168.10.15", "src_port": 51422, "dst_ip": "10.0.0.20", "dst_port": 53, "proto": "DNS", "flags": "QUERY", "length": 74, "payload": "Standard query A portal.if.edu.br"},
    {"timestamp": "14:01:02.118", "src_ip": "10.0.0.20", "src_port": 53, "dst_ip": "192.168.10.15", "dst_port": 51422, "proto": "DNS", "flags": "RESP", "length": 90, "payload": "Response A portal.if.edu.br -> 10.0.0.10"},
    {"timestamp": "14:01:02.201", "src_ip": "192.168.10.15", "src_port": 52100, "dst_ip": "10.0.0.10", "dst_port": 443, "proto": "TCP", "flags": "SYN", "length": 60, "payload": "Three-Way Handshake (1/3) seq=1001"},
    {"timestamp": "14:01:02.203", "src_ip": "10.0.0.10", "src_port": 443, "dst_ip": "192.168.10.15", "dst_port": 52100, "proto": "TCP", "flags": "SYN-ACK", "length": 60, "payload": "Three-Way Handshake (2/3) seq=5001 ack=1002"},
    {"timestamp": "14:01:02.204", "src_ip": "192.168.10.15", "src_port": 52100, "dst_ip": "10.0.0.10", "dst_port": 443, "proto": "TCP", "flags": "ACK", "length": 54, "payload": "Three-Way Handshake (3/3) Conexao TLS estabelecida"},
    {"timestamp": "14:01:03.410", "src_ip": "192.168.10.22", "src_port": 53011, "dst_ip": "10.0.0.10", "dst_port": 80, "proto": "HTTP", "flags": "PSH-ACK", "length": 248, "payload": "POST /login HTTP/1.1 | Corpo em texto puro: user=admin_sys&pass=if2026 (ALERTA: sem HTTPS!)"},
    {"timestamp": "14:01:03.415", "src_ip": "10.0.0.10", "src_port": 80, "dst_ip": "192.168.10.22", "dst_port": 53011, "proto": "HTTP", "flags": "PSH-ACK", "length": 162, "payload": "HTTP/1.1 401 Unauthorized | Set-Cookie: sid=demo_991"},
    {"timestamp": "14:01:04.002", "src_ip": "192.168.10.15", "src_port": 0, "dst_ip": "192.168.10.1", "dst_port": 0, "proto": "ICMP", "flags": "ECHO-REQ", "length": 64, "payload": "ICMP Echo Request seq=1 ttl=64"},
    {"timestamp": "14:01:04.003", "src_ip": "192.168.10.1", "src_port": 0, "dst_ip": "192.168.10.15", "dst_port": 0, "proto": "ICMP", "flags": "ECHO-REP", "length": 64, "payload": "ICMP Echo Reply seq=1 ttl=64 time=1.1ms"},
    {"timestamp": "14:01:05.112", "src_ip": "185.220.101.47", "src_port": 44101, "dst_ip": "10.0.0.10", "dst_port": 22, "proto": "TCP", "flags": "SYN", "length": 60, "payload": "Possivel port-scan SYN na porta 22 (SSH)"},
    {"timestamp": "14:01:05.114", "src_ip": "185.220.101.47", "src_port": 44102, "dst_ip": "10.0.0.10", "dst_port": 3306, "proto": "TCP", "flags": "SYN", "length": 60, "payload": "Possivel port-scan SYN na porta 3306 (MySQL)"},
    {"timestamp": "14:01:05.119", "src_ip": "185.220.101.47", "src_port": 44103, "dst_ip": "10.0.0.10", "dst_port": 8080, "proto": "TCP", "flags": "SYN", "length": 60, "payload": "Possivel port-scan SYN na porta 8080"},
    {"timestamp": "14:01:06.305", "src_ip": "192.168.10.40", "src_port": 55110, "dst_ip": "10.0.0.20", "dst_port": 53, "proto": "DNS", "flags": "QUERY", "length": 82, "payload": "Standard query A phish-alerta.lab (ALERTA: dominio suspeito!)"},
    {"timestamp": "14:01:06.890", "src_ip": "192.168.10.40", "src_port": 55118, "dst_ip": "10.0.0.10", "dst_port": 80, "proto": "HTTP", "flags": "PSH-ACK", "length": 190, "payload": "GET /backup/usuarios.bak HTTP/1.1 | User-Agent: PyScanner/1.0"},
]

_LAST_VISUAL_EVENT = None

_SERVICE_CATALOG = {
    21: ("ftp", "vsftpd 3.0.5"),
    22: ("ssh", "OpenSSH 8.9p1 Ubuntu"),
    53: ("domain", "ISC BIND 9.18 (DNS Lab)"),
    80: ("http", "nginx 1.24.0 (IF-Lab)"),
    443: ("https", "nginx TLSv1.3"),
    3306: ("mysql", "MySQL 5.7.44 (Exposto!)"),
    8080: ("http-proxy", "PyNetSec-Dev/8080"),
}

def _netlab_ping(host, count=4):
    global _LAST_VISUAL_EVENT
    target = str(host).strip()
    count = max(1, min(int(count), 10))
    resolved = _sim_gethostbyname(target)
    reachable_bases = {
        "127.0.0.1": (0.28, 64),
        "10.0.0.10": (1.45, 64),
        "10.0.0.20": (1.12, 64),
        "192.168.10.1": (0.85, 64),
        "185.220.101.47": (28.60, 52),
    }
    lines = [f"PING {target} ({resolved}): 56 data bytes"]
    packets = []
    if resolved in reachable_bases:
        base_ms, ttl = reachable_bases[resolved]
        for seq in range(1, count + 1):
            rtt = round(max(0.15, base_ms + _random.uniform(-0.22, 0.48)), 2)
            packets.append({"seq": seq, "ttl": ttl, "time_ms": rtt})
            lines.append(f"64 bytes from {resolved}: icmp_seq={seq} ttl={ttl} time={rtt:.2f} ms")
        times = [p["time_ms"] for p in packets]
        avg_ms = round(sum(times) / len(times), 2)
        lines.append("")
        lines.append(f"--- {target} estatisticas de ping ---")
        lines.append(f"{count} pacotes transmitidos, {count} recebidos, 0% de perda")
        lines.append(f"rtt min/avg/max = {min(times):.2f}/{avg_ms:.2f}/{max(times):.2f} ms")
        visual_packets = []
        for idx, p in enumerate(packets[:4], start=1):
            visual_packets.append({
                "seq": len(visual_packets) + 1,
                "direction": "tx",
                "proto": "ICMP",
                "src": "192.168.10.15",
                "dst": resolved,
                "flags": f"ECHO-REQ #{p['seq']}",
                "bytes": 64,
                "ttl": 64,
                "payload": f"ICMP Type 8 (Echo Request) seq={p['seq']} id=0x1a2b",
                "explanation": f"Terminal envia sondagem ICMP Echo Request #{p['seq']} (TTL=64) atravessando o roteador ate {resolved}.",
                "severity": "normal",
            })
            visual_packets.append({
                "seq": len(visual_packets) + 1,
                "direction": "rx",
                "proto": "ICMP",
                "src": resolved,
                "dst": "192.168.10.15",
                "flags": f"ECHO-REP #{p['seq']}",
                "bytes": 64,
                "ttl": p["ttl"],
                "latencyMs": p["time_ms"],
                "payload": f"ICMP Type 0 (Echo Reply) seq={p['seq']} ttl={p['ttl']} time={p['time_ms']} ms",
                "explanation": f"Alvo {resolved} devolve Echo Reply #{p['seq']} em {p['time_ms']} ms, confirmando conectividade ativa.",
                "severity": "ok",
            })
        _LAST_VISUAL_EVENT = {
            "tool": "ping",
            "target": target,
            "resolvedIp": resolved,
            "success": True,
            "avgMs": avg_ms,
            "summary": f"{count} pacotes ICMP Echo Request/Reply com media de {avg_ms} ms e 0% de perda.",
            "packets": visual_packets,
        }
        return {
            "host": target,
            "ip": resolved,
            "reachable": True,
            "sent": count,
            "received": count,
            "loss_pct": 0,
            "avg_ms": avg_ms,
            "packets": packets,
            "text": "\\n".join(lines) + "\\n",
        }
    timeout_packets = []
    for seq in range(1, min(count, 3) + 1):
        lines.append(f"Request timeout for icmp_seq {seq} (host fora da rede virtual do lab)")
        timeout_packets.append({
            "seq": len(timeout_packets) + 1,
            "direction": "tx",
            "proto": "ICMP",
            "src": "192.168.10.15",
            "dst": resolved,
            "flags": f"ECHO-REQ #{seq}",
            "bytes": 64,
            "ttl": 64,
            "payload": f"ICMP Type 8 (Echo Request) seq={seq} -> sem rota/resposta",
            "explanation": f"Pacote ICMP #{seq} sai do terminal em direcao a {resolved}.",
            "severity": "normal",
        })
        timeout_packets.append({
            "seq": len(timeout_packets) + 1,
            "direction": "drop",
            "proto": "ICMP",
            "src": resolved,
            "dst": "192.168.10.15",
            "flags": "TIMEOUT",
            "bytes": 0,
            "ttl": 0,
            "payload": f"Request timeout for icmp_seq {seq} (100% perda)",
            "explanation": f"Nenhum Echo Reply retornou para a sequencia #{seq}: host inalcancavel ou ICMP bloqueado no firewall.",
            "severity": "alert",
        })
    for seq in range(min(count, 3) + 1, count + 1):
        lines.append(f"Request timeout for icmp_seq {seq} (host fora da rede virtual do lab)")
    lines.append("")
    lines.append(f"--- {target} estatisticas de ping ---")
    lines.append(f"{count} pacotes transmitidos, 0 recebidos, 100% de perda")
    lines.append("Dica: teste 127.0.0.1, 10.0.0.10, 10.0.0.20, 192.168.10.1 ou web.if.lab")
    _LAST_VISUAL_EVENT = {
        "tool": "ping",
        "target": target,
        "resolvedIp": resolved,
        "success": False,
        "avgMs": None,
        "summary": f"100% de perda: nenhum Echo Reply retornado por {target}.",
        "packets": timeout_packets,
    }
    return {
        "host": target,
        "ip": resolved,
        "reachable": False,
        "sent": count,
        "received": 0,
        "loss_pct": 100,
        "avg_ms": None,
        "packets": [],
        "text": "\\n".join(lines) + "\\n",
    }

def _netlab_whois(query):
    global _LAST_VISUAL_EVENT
    q = str(query).strip().lower()
    entry = _WHOIS_DB.get(q)
    if not entry:
        resolved = _sim_gethostbyname(q)
        entry = _WHOIS_DB.get(resolved)
    if not entry:
        raw = (
            f"WHOIS: nenhum registro encontrado para '{query}' na base simulada do lab.\\n"
            "Consultas disponiveis: portal.if.edu.br, web.if.lab, dns.if.lab, phish-alerta.lab, "
            "10.0.0.10, 10.0.0.20, 192.168.10.1, 185.220.101.47\\n"
        )
        _LAST_VISUAL_EVENT = {
            "tool": "whois",
            "target": q,
            "resolvedIp": q,
            "success": False,
            "summary": f"Nenhum registro encontrado na base WHOIS para {q}.",
            "packets": [
                {
                    "seq": 1, "direction": "tx", "proto": "WHOIS", "src": "192.168.10.15:52410", "dst": "whois.nic.lab:43",
                    "flags": "SYN → QUERY", "bytes": 78, "ttl": 64, "payload": f"QUERY {q}\\r\\n",
                    "explanation": f"Cliente abre conexao TCP na porta 43 enviando o identificador '{q}'.", "severity": "normal",
                },
                {
                    "seq": 2, "direction": "rx", "proto": "WHOIS", "src": "whois.nic.lab:43", "dst": "192.168.10.15:52410",
                    "flags": "NOT FOUND", "bytes": 92, "ttl": 56, "latencyMs": 14.2,
                    "payload": f"No match for '{q}'",
                    "explanation": f"Base WHOIS nao encontrou registro correspondente para '{q}'.", "severity": "warn",
                },
            ],
        }
        return {"query": q, "found": False, "raw": raw}
    raw = (
        f"=== WHOIS ({q}) ===\\n"
        f"Organizacao:  {entry['org']}\\n"
        f"Registrador:  {entry['registrar']}\\n"
        f"Pais:         {entry['country']}\\n"
        f"Criado em:    {entry['created']}\\n"
        f"Bloco CIDR:   {entry['cidr']}\\n"
        f"Contato:      {entry['abuse_email']}\\n"
        f"Analise Sec:  {entry['risk_note']}\\n"
    )
    risk_low = entry["risk_note"].lower()
    is_risky = ("alerta" in risk_low) or ("risco" in risk_low) or ("phishing" in risk_low)
    _LAST_VISUAL_EVENT = {
        "tool": "whois",
        "target": q,
        "resolvedIp": _sim_gethostbyname(q),
        "success": True,
        "org": entry["org"],
        "created": entry["created"],
        "riskNote": entry["risk_note"],
        "summary": f"Consulta TCP porta 43 concluida: {entry['org']} ({entry['country']}).",
        "packets": [
            {
                "seq": 1, "direction": "tx", "proto": "TCP", "src": "192.168.10.15:52410", "dst": "whois.nic.lab:43",
                "flags": "SYN", "bytes": 60, "ttl": 64, "payload": "TCP Handshake para servidor WHOIS (porta 43)",
                "explanation": "Diferente do DNS (UDP 53), o WHOIS inicia uma conexao TCP na porta 43 com o servidor registrador.", "severity": "normal",
            },
            {
                "seq": 2, "direction": "tx", "proto": "WHOIS", "src": "192.168.10.15:52410", "dst": "whois.nic.lab:43",
                "flags": "PSH-ACK", "bytes": 72 + len(q), "ttl": 64, "payload": f"QUERY: {q}\\r\\n",
                "explanation": f"Terminal envia a consulta administrativa em texto puro para '{q}' sem tocar no servidor alvo (OSINT passivo).", "severity": "normal",
            },
            {
                "seq": 3, "direction": "rx", "proto": "WHOIS", "src": "whois.nic.lab:43", "dst": "192.168.10.15:52410",
                "flags": "PSH-ACK", "bytes": 412, "ttl": 56, "latencyMs": 18.4,
                "payload": f"Org: {entry['org']} | CIDR: {entry['cidr']} | Criado: {entry['created']}",
                "explanation": f"Base registradora retorna titular, bloco de IPs ({entry['cidr']}) e data de criacao ({entry['created']}).", "severity": "ok",
            },
            {
                "seq": 4, "direction": "rx", "proto": "WHOIS", "src": "whois.nic.lab:43", "dst": "192.168.10.15:52410",
                "flags": "ALERTA OSINT" if is_risky else "FIN-ACK", "bytes": 128, "ttl": 56, "latencyMs": 19.1,
                "payload": entry["risk_note"],
                "explanation": entry["risk_note"], "severity": "alert" if is_risky else "ok",
            },
        ],
    }
    return {"query": q, "found": True, **entry, "raw": raw}

def _netlab_nslookup(domain):
    global _LAST_VISUAL_EVENT
    d = str(domain).strip().lower()
    rec = _DNS_RECORDS.get(d)
    if not rec:
        raw = (
            f"Server:   10.0.0.20 (dns.if.lab)\\n"
            f"** Nao foi possivel resolver '{domain}' no DNS simulado.\\n"
            "Dominios disponiveis: portal.if.edu.br, web.if.lab, dns.if.lab, gateway.if.lab, phish-alerta.lab\\n"
        )
        _LAST_VISUAL_EVENT = {
            "tool": "nslookup",
            "target": d,
            "resolvedIp": "NXDOMAIN",
            "success": False,
            "summary": f"Servidor DNS 10.0.0.20 respondeu NXDOMAIN para {d}.",
            "packets": [
                {
                    "seq": 1, "direction": "tx", "proto": "DNS", "src": "192.168.10.15:54012", "dst": "10.0.0.20:53",
                    "flags": "UDP QUERY A", "bytes": 76, "ttl": 64, "payload": f"Standard query A {d}",
                    "explanation": f"Terminal envia datagrama UDP na porta 53 perguntando o IP de '{d}'.", "severity": "normal",
                },
                {
                    "seq": 2, "direction": "rx", "proto": "DNS", "src": "10.0.0.20:53", "dst": "192.168.10.15:54012",
                    "flags": "NXDOMAIN", "bytes": 94, "ttl": 64, "latencyMs": 1.4,
                    "payload": f"No such name: {d} (RCODE=3 NXDOMAIN)",
                    "explanation": f"Resolvedor DNS 10.0.0.20 responde NXDOMAIN: o dominio '{d}' nao existe na zona.", "severity": "alert",
                },
            ],
        }
        return {"domain": d, "found": False, "a": [], "ns": [], "txt": [], "raw": raw}
    lines = [
        "Server:   10.0.0.20 (dns.if.lab)",
        f"Name:     {d}",
        f"Address:  {', '.join(rec['a'])}",
        f"NS:       {', '.join(rec['ns'])}",
        f"TXT:      {' | '.join(rec['txt'])}",
    ]
    _LAST_VISUAL_EVENT = {
        "tool": "nslookup",
        "target": d,
        "resolvedIp": rec["a"][0],
        "success": True,
        "summary": f"DNS UDP/53 resolveu {d} -> {rec['a'][0]}.",
        "packets": [
            {
                "seq": 1, "direction": "tx", "proto": "DNS", "src": "192.168.10.15:54012", "dst": "10.0.0.20:53",
                "flags": "UDP QUERY A", "bytes": 74, "ttl": 64, "payload": f"Standard query 0x8a1c A {d}",
                "explanation": f"Navegadores precisam do IP antes de conectar. O terminal envia consulta leve UDP/53 perguntando o registro A de {d}.", "severity": "normal",
            },
            {
                "seq": 2, "direction": "rx", "proto": "DNS", "src": "10.0.0.20:53", "dst": "192.168.10.15:54012",
                "flags": "RESP A", "bytes": 96, "ttl": 64, "latencyMs": 1.2,
                "payload": f"Answer: {d} IN A {rec['a'][0]} | NS: {rec['ns'][0]}",
                "explanation": f"O servidor DNS 10.0.0.20 consulta a zona autoritativa e devolve o endereco IPv4 {rec['a'][0]}.", "severity": "ok",
            },
            {
                "seq": 3, "direction": "rx", "proto": "DNS", "src": "10.0.0.20:53", "dst": "192.168.10.15:54012",
                "flags": "RESP TXT", "bytes": 118, "ttl": 64, "latencyMs": 1.5,
                "payload": f"TXT: {' | '.join(rec['txt'])}",
                "explanation": "Tambem retorna registros TXT (como SPF e metadados de seguranca do dominio).", "severity": "warn" if "ATENCAO" in " ".join(rec["txt"]) else "ok",
            },
        ],
    }
    return {"domain": d, "found": True, **rec, "raw": "\\n".join(lines) + "\\n"}

def _netlab_nmap(host, scan_type="sS"):
    global _LAST_VISUAL_EVENT
    target = str(host).strip()
    resolved = _sim_gethostbyname(target)
    tested_ports = [21, 22, 53, 80, 443, 3306, 8080]
    host_services = _VIRTUAL_LAB_NETWORK.get(resolved)

    if host_services is None:
        raw = (
            f"Starting Nmap 7.94 (Simulado PyNetSec)\\n"
            f"Host '{target}' ({resolved}) fora da rede virtual autorizada.\\n"
            "Alvos disponiveis: 127.0.0.1, 10.0.0.10, 10.0.0.20, 192.168.10.1, web.if.lab\\n"
        )
        _LAST_VISUAL_EVENT = {
            "tool": "nmap",
            "target": target,
            "resolvedIp": resolved,
            "success": False,
            "ports": [],
            "summary": f"Host {target} fora do escopo autorizado do laboratorio.",
            "packets": [
                {
                    "seq": 1, "direction": "drop", "proto": "TCP", "src": "192.168.10.15:44001", "dst": f"{resolved}:80",
                    "flags": "ESCOPO NEGADO", "bytes": 60, "ttl": 64,
                    "payload": f"Sonda bloqueada: '{target}' fora da rede autorizada",
                    "explanation": "Por etica e seguranca, o Nmap do laboratorio bloqueia varreduras contra hosts externos.", "severity": "alert",
                },
            ],
        }
        return {"host": target, "ip": resolved, "found": False, "ports": [], "raw": raw}

    port_entries = []
    for p in tested_ports:
        svc, ver = _SERVICE_CATALOG[p]
        is_open = (p in host_services) or (resolved == "127.0.0.1" and p in _LOCAL_BOUND_PORTS)
        if is_open:
            state = "open"
        elif p == 8080 and resolved == "10.0.0.10":
            state = "filtered"
        else:
            state = "closed"
        port_entries.append({
            "port": p,
            "state": state,
            "service": svc,
            "version": ver if state == "open" else "",
        })

    open_entries = [e for e in port_entries if e["state"] == "open"]
    lines = [
        f"Starting Nmap 7.94 (Simulado PyNetSec) — Modo -{scan_type}",
        f"Nmap scan report for {target} ({resolved})",
        "Host is up (0.0014s latency).",
        "",
        "PORT      STATE     SERVICE      VERSION" if scan_type == "sV" else "PORT      STATE     SERVICE",
    ]
    for e in port_entries:
        p_col = f"{e['port']}/tcp"
        if scan_type == "sV":
            lines.append(f"{p_col:<9} {e['state']:<9} {e['service']:<12} {e['version']}")
        else:
            lines.append(f"{p_col:<9} {e['state']:<9} {e['service']}")

    lines.append("")
    if any(e["port"] == 3306 and e["state"] == "open" for e in port_entries):
        lines.append("Dica Blue Team: Porta 3306 (MySQL) aberta na rede! Restrinja ao localhost ou firewall.")
    lines.append(f"Nmap done: 1 IP address (1 host up) — {len(open_entries)} porta(s) aberta(s) de {len(tested_ports)} testadas.")

    nmap_packets = []
    for idx, e in enumerate(port_entries):
        p = e["port"]
        src_p = 44200 + idx
        nmap_packets.append({
            "seq": len(nmap_packets) + 1,
            "direction": "tx",
            "proto": "TCP",
            "src": f"192.168.10.15:{src_p}",
            "dst": f"{resolved}:{p}",
            "flags": "SYN",
            "bytes": 60,
            "ttl": 64,
            "payload": f"TCP SYN probe -> porta {p}/{e['service']} (modo -{scan_type})",
            "explanation": f"Nmap dispara pacote TCP SYN (half-open) sondando a porta {p} ({e['service']}) de {resolved}.",
            "severity": "normal",
        })
        if e["state"] == "open":
            is_mysql = p == 3306
            nmap_packets.append({
                "seq": len(nmap_packets) + 1,
                "direction": "rx",
                "proto": "TCP",
                "src": f"{resolved}:{p}",
                "dst": f"192.168.10.15:{src_p}",
                "flags": "SYN-ACK",
                "bytes": 64,
                "ttl": 64,
                "latencyMs": round(1.1 + idx * 0.15, 2),
                "payload": f"PORTA {p} ABERTA · {e['service']} {e['version']}".strip(),
                "explanation": (
                    f"ALERTA BLUE TEAM: Porta 3306 (MySQL) respondeu SYN-ACK na rede! Banco de dados exposto deve ser fechado no firewall."
                    if is_mysql
                    else f"Servico {e['service']} na porta {p} respondeu SYN-ACK confirmando estado OPEN. Nmap envia RST logo apos para encerrar."
                ),
                "severity": "alert" if is_mysql else "ok",
            })
        elif e["state"] == "filtered":
            nmap_packets.append({
                "seq": len(nmap_packets) + 1,
                "direction": "drop",
                "proto": "TCP",
                "src": f"{resolved}:{p}",
                "dst": f"192.168.10.15:{src_p}",
                "flags": "DROP (FILTERED)",
                "bytes": 0,
                "ttl": 0,
                "payload": f"Firewall descartou SYN para porta {p}/tcp sem resposta",
                "explanation": f"Nenhuma resposta chegou para a porta {p}: um firewall descartou o pacote silenciosamente (estado FILTERED).",
                "severity": "warn",
            })
        else:
            nmap_packets.append({
                "seq": len(nmap_packets) + 1,
                "direction": "rx",
                "proto": "TCP",
                "src": f"{resolved}:{p}",
                "dst": f"192.168.10.15:{src_p}",
                "flags": "RST-ACK",
                "bytes": 54,
                "ttl": 64,
                "latencyMs": round(0.8 + idx * 0.1, 2),
                "payload": f"Porta {p}/tcp fechada (sem servico ouvindo)",
                "explanation": f"O sistema operacional de {resolved} devolveu RST-ACK imediato indicando que a porta {p} esta CLOSED.",
                "severity": "normal",
            })

    _LAST_VISUAL_EVENT = {
        "tool": "nmap",
        "target": target,
        "resolvedIp": resolved,
        "success": True,
        "ports": port_entries,
        "summary": f"Varredura TCP -{scan_type} em {resolved}: {len(open_entries)} porta(s) aberta(s) respondendo SYN-ACK.",
        "packets": nmap_packets,
    }
    return {
        "host": target,
        "ip": resolved,
        "found": True,
        "scan_type": scan_type,
        "ports": port_entries,
        "raw": "\\n".join(lines) + "\\n",
    }

def _netlab_sniff(count=10, proto=None, host=None):
    global _LAST_VISUAL_EVENT
    proto_f = str(proto).strip().upper() if proto else None
    host_f = str(host).strip() if host else None
    matched = []
    for pkt in _PACKET_POOL:
        if proto_f and pkt["proto"].upper() != proto_f:
            continue
        if host_f and host_f not in (pkt["src_ip"], pkt["dst_ip"]):
            continue
        matched.append(dict(pkt))
    limit = max(1, min(int(count), 30))
    sliced = matched[:limit]
    alerts = sum(
        1 for p in sliced
        if "texto puro" in p["payload"] or "port-scan" in p["payload"] or "suspeito" in p["payload"]
    )
    sniff_packets = []
    for idx, p in enumerate(sliced[:12], start=1):
        src = f"{p['src_ip']}:{p['src_port']}" if p["src_port"] else p["src_ip"]
        dst = f"{p['dst_ip']}:{p['dst_port']}" if p["dst_port"] else p["dst_ip"]
        pay = p["payload"]
        is_alert = ("texto puro" in pay) or ("port-scan" in pay) or ("suspeito" in pay)
        is_from_local = p["src_ip"].startswith("192.168.")
        direction = "tx" if is_from_local else "rx"
        if "texto puro" in pay:
            expl = "ALERTA CRITICO: Credencial capturada em texto puro via HTTP (porta 80)! Sem criptografia TLS/HTTPS, qualquer sniffer na rede le a senha."
        elif "port-scan" in pay:
            expl = f"ALERTA DE VARREDURA: IP externo {p['src_ip']} disparou sonda TCP SYN para a porta {p['dst_port']} de {p['dst_ip']}."
        elif "suspeito" in pay:
            expl = f"ALERTA DNS: Estacao interna consultou dominio recem-criado suspeito de phishing."
        elif "Handshake" in pay:
            expl = f"Interface eth0-lab em modo promiscuo observou etapa do Three-Way Handshake TCP ({p['flags']})."
        else:
            expl = f"Quadro {p['proto']} ({p['flags']}) capturado na interface eth0-lab entre {src} e {dst}."
        sniff_packets.append({
            "seq": idx,
            "direction": direction,
            "proto": p["proto"],
            "src": src,
            "dst": dst,
            "flags": p["flags"],
            "bytes": p["length"],
            "ttl": 64 if is_from_local else 54,
            "payload": pay,
            "explanation": expl,
            "severity": "alert" if is_alert else ("ok" if p["flags"] in ("RESP", "ECHO-REP", "ACK") else "normal"),
        })
    _LAST_VISUAL_EVENT = {
        "tool": "sniff",
        "target": host_f or (f"proto:{proto_f}" if proto_f else "eth0-lab"),
        "resolvedIp": host_f or "10.0.0.10",
        "success": True,
        "packetCount": len(sliced),
        "alertCount": alerts,
        "summary": f"Interface eth0-lab capturou {len(sliced)} pacote(s) ({alerts} alerta(s) de seguranca detectados).",
        "packets": sniff_packets,
    }
    return sliced

def _format_sniff_table(packets):
    if not packets:
        return "Nenhum pacote correspondeu ao filtro informado.\\n"
    lines = [
        f"Capturando trafego simulado na interface eth0-lab ({len(packets)} pacote(s))...",
        "HORA         PROTO  ORIGEM                  DESTINO                 FLAGS     PAYLOAD",
        "-" * 102,
    ]
    for p in packets:
        src = f"{p['src_ip']}:{p['src_port']}" if p["src_port"] else p["src_ip"]
        dst = f"{p['dst_ip']}:{p['dst_port']}" if p["dst_port"] else p["dst_ip"]
        lines.append(
            f"{p['timestamp']:<12} {p['proto']:<6} {src:<23} {dst:<23} {p['flags']:<9} {p['payload']}"
        )
    return "\\n".join(lines) + "\\n"

_netlab_mod = _types.ModuleType("netlab")
_netlab_mod.ping = _netlab_ping
_netlab_mod.whois = _netlab_whois
_netlab_mod.nslookup = _netlab_nslookup
_netlab_mod.nmap = _netlab_nmap
_netlab_mod.sniff = _netlab_sniff
sys.modules["netlab"] = _netlab_mod

_SANDBOX_NS = {"__name__": "__main__", "socket": _real_socket, "netlab": _netlab_mod}
_SANDBOX_CWD = _WORKSPACE_ROOT

def _sandbox_sync_from_dict(files_json):
    files = json.loads(files_json)
    # Remove existing files under /workspace and rebuild cleanly
    for entry in os.listdir(_WORKSPACE_ROOT):
        full = os.path.join(_WORKSPACE_ROOT, entry)
        if os.path.isdir(full):
            shutil.rmtree(full)
        else:
            os.remove(full)
    for rel_path, content in files.items():
        clean_rel = str(rel_path).lstrip("/")
        if ".." in clean_rel.split("/"):
            continue
        target = os.path.join(_WORKSPACE_ROOT, clean_rel)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)

def _sandbox_snapshot_files():
    result = {}
    for root, dirs, filenames in os.walk(_WORKSPACE_ROOT):
        dirs[:] = sorted([d for d in dirs if d != "__pycache__"])
        for fname in sorted(filenames):
            full = os.path.join(root, fname)
            rel = os.path.relpath(full, _WORKSPACE_ROOT).replace("\\\\", "/")
            try:
                with open(full, "r", encoding="utf-8") as f:
                    result[rel] = f.read()
            except Exception:
                result[rel] = "<arquivo binario>"
    return result

def _sandbox_reset_python_ns():
    global _SANDBOX_NS, _LOCAL_BOUND_PORTS
    _LOCAL_BOUND_PORTS = {}
    _SANDBOX_NS = {"__name__": "__main__", "socket": _real_socket, "netlab": _netlab_mod}

def _sandbox_resolve_path(path_arg):
    global _SANDBOX_CWD
    if not path_arg:
        return _SANDBOX_CWD
    if path_arg.startswith("/"):
        candidate = os.path.normpath(path_arg)
    else:
        candidate = os.path.normpath(os.path.join(_SANDBOX_CWD, path_arg))
    if not candidate.startswith(_WORKSPACE_ROOT):
        return _WORKSPACE_ROOT
    return candidate

def _sandbox_exec_python_code(code_str, filename="sandbox.py", is_repl=False):
    global _SANDBOX_CWD, _SANDBOX_NS
    os.chdir(_SANDBOX_CWD)
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout_buf, stderr_buf
    ok = True
    err_text = ""
    try:
        if is_repl:
            # Try single expression first so interactive REPL echoes values like "2 + 2" -> "4"
            try:
                compiled_expr = compile(code_str, filename, "eval")
                val = eval(compiled_expr, _SANDBOX_NS)
                if val is not None:
                    print(repr(val))
            except SyntaxError:
                compiled_exec = compile(code_str, filename, "exec")
                exec(compiled_exec, _SANDBOX_NS)
        else:
            compiled = compile(code_str, filename, "exec")
            exec(compiled, _SANDBOX_NS)
    except BaseException:
        ok = False
        err_text = traceback.format_exc()
    finally:
        sys.stdout, sys.stderr = old_out, old_err
        cur = os.getcwd()
        if cur.startswith(_WORKSPACE_ROOT):
            _SANDBOX_CWD = cur
        else:
            os.chdir(_WORKSPACE_ROOT)
            _SANDBOX_CWD = _WORKSPACE_ROOT
    return ok, stdout_buf.getvalue(), err_text or stderr_buf.getvalue()

def _sandbox_run_shell(command_line):
    global _SANDBOX_CWD
    os.chdir(_SANDBOX_CWD)
    stripped = command_line.strip()
    if not stripped:
        return True, "", ""

    try:
        parts = shlex.split(stripped)
    except ValueError as e:
        return False, "", f"Erro ao interpretar comando: {e}"

    cmd = parts[0]
    args = parts[1:]

    if cmd == "help":
        help_txt = (
            "Comandos de Arquivos e Python:\\n"
            "  ls [pasta]           Lista arquivos e diretorios\\n"
            "  pwd / cd <pasta>     Mostra ou muda o diretorio em /workspace\\n"
            "  cat <arquivo>        Exibe o conteudo de um arquivo\\n"
            "  mkdir / touch / rm   Cria pastas, cria ou remove arquivos\\n"
            "  python3 <arquivo.py> Executa um script Python do /workspace\\n"
            "  python3 -c 'codigo'  Executa codigo Python direto na linha\\n\\n"
            "Utilitarios de Redes e Seguranca (100% simulados no lab):\\n"
            "  hosts                Lista os hosts e portas virtuais seguros\\n"
            "  ping [-c N] <host>   Testa conectividade ICMP (ex: ping 10.0.0.10)\\n"
            "  nmap [-sV] <host>    Mapeia portas abertas/fechadas e versoes de servicos\\n"
            "  whois <dominio|ip>   Consulta dono, CIDR e risco (ex: whois phish-alerta.lab)\\n"
            "  nslookup <dominio>   Consulta registros DNS A, NS e TXT\\n"
            "  sniff [opcoes]       Sniffer de pacotes (--proto HTTP|TCP|DNS|ICMP --host IP -c N --save arq.json)\\n"
            "  clear                Limpa a tela do terminal\\n"
            "\\nDica Python: use 'import netlab' para chamar netlab.ping(), netlab.nmap(), netlab.whois(), netlab.nslookup() e netlab.sniff()!\\n"
        )
        return True, help_txt, ""

    if cmd == "nmap":
        if not args:
            return False, "", "Uso: nmap [-sV|-sS] <host>  (ex.: nmap -sV 10.0.0.10)"
        scan_type = "sS"
        target = None
        for tok in args:
            if tok == "-sV":
                scan_type = "sV"
            elif tok == "-sS":
                scan_type = "sS"
            elif not tok.startswith("-"):
                target = tok
        if not target:
            return False, "", "Uso: nmap [-sV|-sS] <host>"
        res = _netlab_nmap(target, scan_type=scan_type)
        return res["found"], res["raw"], ""

    if cmd == "ping":
        if not args:
            return False, "", "Uso: ping [-c N] <host>  (ex.: ping 10.0.0.10 ou ping web.if.lab)"
        count = 4
        target = None
        i = 0
        while i < len(args):
            if args[i] == "-c" and i + 1 < len(args):
                try:
                    count = int(args[i + 1])
                except ValueError:
                    return False, "", "ping: valor invalido apos -c"
                i += 2
            else:
                target = args[i]
                i += 1
        if not target:
            return False, "", "Uso: ping [-c N] <host>"
        res = _netlab_ping(target, count)
        return res["reachable"], res["text"], ""

    if cmd == "whois":
        if not args:
            return False, "", "Uso: whois <dominio|ip>  (ex.: whois 185.220.101.47 ou whois phish-alerta.lab)"
        res = _netlab_whois(args[0])
        return True, res["raw"], ""

    if cmd in ("nslookup", "dig"):
        if not args:
            return False, "", "Uso: nslookup <dominio>  (ex.: nslookup portal.if.edu.br)"
        res = _netlab_nslookup(args[0])
        return True, res["raw"], ""

    if cmd in ("sniff", "tcpdump"):
        count = 10
        proto = None
        host = None
        save_path = None
        i = 0
        while i < len(args):
            tok = args[i]
            if tok in ("-c", "--count") and i + 1 < len(args):
                try:
                    count = int(args[i + 1])
                except ValueError:
                    return False, "", "sniff: valor invalido para -c"
                i += 2
            elif tok in ("--proto", "-p") and i + 1 < len(args):
                proto = args[i + 1]
                i += 2
            elif tok in ("--host", "-h") and i + 1 < len(args):
                host = args[i + 1]
                i += 2
            elif tok in ("--save", "-w") and i + 1 < len(args):
                save_path = args[i + 1]
                i += 2
            else:
                i += 1
        pkts = _netlab_sniff(count=count, proto=proto, host=host)
        out = _format_sniff_table(pkts)
        if save_path:
            full_save = _sandbox_resolve_path(save_path)
            os.makedirs(os.path.dirname(full_save), exist_ok=True)
            with open(full_save, "w", encoding="utf-8") as f:
                json.dump(pkts, f, indent=2, ensure_ascii=False)
            out += f"\\nCaptura salva em /workspace/{os.path.relpath(full_save, _WORKSPACE_ROOT)}\\n"
        return True, out, ""

    if cmd == "hosts":
        lines = ["Hosts virtuais acessiveis no lab (100% em memoria):"]
        for h, ports in _VIRTUAL_LAB_NETWORK.items():
            plist = ", ".join(str(p) for p in sorted(ports.keys()))
            lines.append(f"  {h:<15} portas abertas: {plist}")
        lines.append("  185.220.101.47  no externo simulado (use ping, whois e sniff)")
        lines.append("Dominios DNS: portal.if.edu.br, web.if.lab, dns.if.lab, gateway.if.lab, phish-alerta.lab")
        if _LOCAL_BOUND_PORTS:
            blist = ", ".join(str(p) for p in sorted(_LOCAL_BOUND_PORTS.keys()))
            lines.append(f"  127.0.0.1 (bind do aluno): {blist}")
        return True, "\\n".join(lines) + "\\n", ""

    if cmd == "pwd":
        return True, _SANDBOX_CWD + "\\n", ""

    if cmd == "ls":
        target = _sandbox_resolve_path(args[0] if args else "")
        if not os.path.exists(target):
            return False, "", f"ls: caminho nao encontrado: {args[0]}"
        if os.path.isfile(target):
            return True, os.path.basename(target) + "\\n", ""
        items = sorted(os.listdir(target))
        formatted = []
        for it in items:
            if it == "__pycache__":
                continue
            full = os.path.join(target, it)
            formatted.append(it + "/" if os.path.isdir(full) else it)
        return True, ("  ".join(formatted) + "\\n") if formatted else "(pasta vazia)\\n", ""

    if cmd == "cd":
        target = _sandbox_resolve_path(args[0] if args else _WORKSPACE_ROOT)
        if not os.path.isdir(target):
            return False, "", f"cd: diretorio nao encontrado: {args[0] if args else ''}"
        _SANDBOX_CWD = target
        os.chdir(_SANDBOX_CWD)
        return True, "", ""

    if cmd == "cat":
        if not args:
            return False, "", "Uso: cat <arquivo>"
        target = _sandbox_resolve_path(args[0])
        if not os.path.isfile(target):
            return False, "", f"cat: arquivo nao encontrado: {args[0]}"
        with open(target, "r", encoding="utf-8") as f:
            content = f.read()
        if content and not content.endswith("\\n"):
            content += "\\n"
        return True, content, ""

    if cmd == "mkdir":
        if not args:
            return False, "", "Uso: mkdir <pasta>"
        target = _sandbox_resolve_path(args[0])
        os.makedirs(target, exist_ok=True)
        return True, f"Pasta criada: {os.path.relpath(target, _WORKSPACE_ROOT)}\\n", ""

    if cmd == "touch":
        if not args:
            return False, "", "Uso: touch <arquivo>"
        target = _sandbox_resolve_path(args[0])
        os.makedirs(os.path.dirname(target), exist_ok=True)
        if not os.path.exists(target):
            with open(target, "w", encoding="utf-8") as f:
                f.write("")
        return True, f"Arquivo pronto: {os.path.relpath(target, _WORKSPACE_ROOT)}\\n", ""

    if cmd == "rm":
        if not args:
            return False, "", "Uso: rm <arquivo>"
        target = _sandbox_resolve_path(args[-1])
        if target == _WORKSPACE_ROOT:
            return False, "", "rm: nao e permitido remover /workspace."
        if not os.path.exists(target):
            return False, "", f"rm: nao encontrado: {args[-1]}"
        if os.path.isdir(target):
            shutil.rmtree(target)
        else:
            os.remove(target)
        return True, f"Removido: {args[-1]}\\n", ""

    if cmd in ("python", "python3"):
        if not args:
            return True, "Dica: use 'python3 scripts/scanner_etico.py' ou alterne para o modo 'Python REPL (>>>)' acima.\\n", ""
        if args[0] == "-c":
            inline = " ".join(args[1:])
            return _sandbox_exec_python_code(inline, filename="missao.py", is_repl=False)
        target = _sandbox_resolve_path(args[0])
        if not os.path.isfile(target):
            return False, "", f"python3: arquivo nao encontrado: {args[0]}"
        with open(target, "r", encoding="utf-8") as f:
            script_src = f.read()
        return _sandbox_exec_python_code(script_src, filename=args[0], is_repl=False)

    # Helpful fallback: if user typed obvious Python directly in Shell mode, let them know
    return False, "", f"Comando nao reconhecido: '{cmd}'. Digite 'help' ou alterne para o modo 'Python REPL (>>>)'."

def _begin_visual_capture():
    global _LAST_VISUAL_EVENT, _SOCKET_TRACE, _SOCKET_LAST_TARGET, _SOCKET_PORT_STATES
    _LAST_VISUAL_EVENT = None
    _SOCKET_TRACE = []
    _SOCKET_LAST_TARGET = None
    _SOCKET_PORT_STATES = {}

def _finalize_visual_capture():
    global _LAST_VISUAL_EVENT
    if _LAST_VISUAL_EVENT is not None:
        return _LAST_VISUAL_EVENT
    if not _SOCKET_TRACE:
        return None
    target_raw, target_ip = _SOCKET_LAST_TARGET or ("10.0.0.10", "10.0.0.10")
    ports_list = []
    for p in sorted(_SOCKET_PORT_STATES.keys()):
        svc, ver = _SERVICE_CATALOG.get(p, ("tcp", ""))
        st = _SOCKET_PORT_STATES[p]
        ports_list.append({
            "port": p,
            "state": st,
            "service": svc,
            "version": ver if st == "open" else "",
        })
    open_cnt = sum(1 for e in ports_list if e["state"] == "open")
    return {
        "tool": "socket",
        "target": target_raw,
        "resolvedIp": target_ip,
        "success": True,
        "ports": ports_list,
        "packetCount": len(_SOCKET_TRACE),
        "summary": f"Script Python socket trocou {len(_SOCKET_TRACE)} pacote(s) TCP com {target_ip} ({open_cnt} porta(s) aberta(s)).",
        "packets": list(_SOCKET_TRACE),
    }
`;

let sandboxBootstrapped = false;

async function ensureSandboxBootstrapped(initialFiles?: Record<string, string>) {
  const pyodide = await ensurePyodideReady();
  if (!sandboxBootstrapped) {
    await pyodide.runPythonAsync(SANDBOX_BOOTSTRAP_PYTHON);
    sandboxBootstrapped = true;
    if (initialFiles) {
      pyodide.globals.set('_trilha_init_files', JSON.stringify(initialFiles));
      await pyodide.runPythonAsync('_sandbox_sync_from_dict(_trilha_init_files)');
    }
  }
  return pyodide;
}

export async function syncFilesToSandbox(files: Record<string, string>): Promise<void> {
  const pyodide = await ensureSandboxBootstrapped();
  pyodide.globals.set('_trilha_sync_files', JSON.stringify(files));
  await pyodide.runPythonAsync('_sandbox_sync_from_dict(_trilha_sync_files)');
}

export async function resetSandboxPythonMemory(): Promise<void> {
  const pyodide = await ensureSandboxBootstrapped();
  await pyodide.runPythonAsync('_sandbox_reset_python_ns()');
}

export async function runSandboxShellCommand(
  commandLine: string,
  currentFiles: Record<string, string>
): Promise<SandboxExecResult> {
  const started = performance.now();
  try {
    const pyodide = await ensureSandboxBootstrapped(currentFiles);
    pyodide.globals.set('_trilha_shell_cmd', commandLine);
    const raw = (await pyodide.runPythonAsync(`
_begin_visual_capture()
_ok, _out, _err = _sandbox_run_shell(_trilha_shell_cmd)
json.dumps({
    "ok": _ok,
    "stdout": _out,
    "stderr": _err,
    "cwd": _SANDBOX_CWD,
    "files": _sandbox_snapshot_files(),
    "visualEvent": _finalize_visual_capture()
})
`)) as string;

    const parsed = JSON.parse(raw) as {
      ok: boolean;
      stdout: string;
      stderr: string;
      cwd: string;
      files: Record<string, string>;
      visualEvent?: Omit<NetworkVisualEvent, 'id'> | null;
    };
    const durationMs = Math.max(1, Math.round(performance.now() - started));

    return {
      ...parsed,
      visualEvent: parsed.visualEvent
        ? { ...parsed.visualEvent, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
        : null,
      durationMs,
      translatedError:
        !parsed.ok && parsed.stderr.includes('Traceback')
          ? translatePythonError(parsed.stderr)
          : undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      stdout: '',
      stderr: msg,
      cwd: '/workspace',
      files: currentFiles,
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      visualEvent: null,
    };
  }
}

export async function runSandboxPythonCode(
  code: string,
  filename: string,
  isRepl: boolean,
  currentFiles: Record<string, string>
): Promise<SandboxExecResult> {
  const started = performance.now();
  try {
    const pyodide = await ensureSandboxBootstrapped(currentFiles);
    pyodide.globals.set('_trilha_sb_code', code);
    pyodide.globals.set('_trilha_sb_file', filename);
    pyodide.globals.set('_trilha_sb_repl', isRepl);

    const raw = (await pyodide.runPythonAsync(`
_begin_visual_capture()
_ok, _out, _err = _sandbox_exec_python_code(_trilha_sb_code, _trilha_sb_file, bool(_trilha_sb_repl))
json.dumps({
    "ok": _ok,
    "stdout": _out,
    "stderr": _err,
    "cwd": _SANDBOX_CWD,
    "files": _sandbox_snapshot_files(),
    "visualEvent": _finalize_visual_capture()
})
`)) as string;

    const parsed = JSON.parse(raw) as {
      ok: boolean;
      stdout: string;
      stderr: string;
      cwd: string;
      files: Record<string, string>;
      visualEvent?: Omit<NetworkVisualEvent, 'id'> | null;
    };
    const durationMs = Math.max(1, Math.round(performance.now() - started));

    return {
      ...parsed,
      visualEvent: parsed.visualEvent
        ? { ...parsed.visualEvent, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
        : null,
      durationMs,
      translatedError: !parsed.ok ? translatePythonError(parsed.stderr) : undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      stdout: '',
      stderr: msg,
      cwd: '/workspace',
      files: currentFiles,
      durationMs: Math.max(1, Math.round(performance.now() - started)),
      visualEvent: null,
    };
  }
}
