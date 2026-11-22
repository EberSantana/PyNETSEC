import { ensurePyodideReady } from './pyodideEngine';
import { translatePythonError } from './errorTranslator';
import { TranslatedPythonError } from '../types/ctf';

export interface SandboxExecResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  cwd: string;
  files: Record<string, string>;
  durationMs: number;
  translatedError?: TranslatedPythonError;
}

const SANDBOX_BOOTSTRAP_PYTHON = `
import os, sys, io, json, socket as _real_socket, traceback, shlex, shutil

_WORKSPACE_ROOT = "/workspace"
os.makedirs(_WORKSPACE_ROOT, exist_ok=True)

# Virtual lab network topology (100% in-memory, safe for school firewalls)
_VIRTUAL_LAB_NETWORK = {
    "127.0.0.1": {
        22: b"SSH-2.0-OpenSSH_9.6p1 PySecLocal\\r\\n",
        80: b"HTTP/1.1 200 OK\\r\\nServer: PySec-LocalHTTP/1.0\\r\\nContent-Type: text/plain\\r\\n\\r\\nBem-vindo ao servidor local (127.0.0.1:80)\\n",
        443: b"TLSv1.3 Handshake OK (certificado local: localhost.pysec.lab)\\r\\n",
        8080: b"HTTP/1.1 200 OK\\r\\nServer: PySec-Dev/8080\\r\\n\\r\\nPainel de testes local ativo.\\n",
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
        host, port = address
        banner = self._lookup_service(host, port)
        if banner is None:
            raise ConnectionRefusedError(111, f"Conexao recusada em {host}:{port}")
        self._connected_to = (_normalize_host(host), int(port))
        self._buffer = banner

    def connect_ex(self, address):
        host, port = address
        try:
            banner = self._lookup_service(host, port)
        except PermissionError:
            raise
        if banner is None:
            return 111
        self._connected_to = (_normalize_host(host), int(port))
        self._buffer = banner
        return 0

    def send(self, data):
        if not self._connected_to:
            raise OSError("Socket nao conectado.")
        if isinstance(data, str):
            data = data.encode("utf-8")
        self._sent_data += bytes(data)
        host, port = self._connected_to
        if port in (80, 8080) and b"GET " in self._sent_data:
            req_line = self._sent_data.split(b"\\r\\n")[0].decode("utf-8", errors="ignore")
            self._buffer = (
                f"HTTP/1.1 200 OK\\r\\nServer: PySec-Lab ({host}:{port})\\r\\n"
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
        "dns.if.lab": "10.0.0.20",
        "gateway.if.lab": "192.168.10.1",
    }
    return mapping.get(h, h)

_real_socket.socket = _SimulatedLabSocket
_real_socket.create_connection = _sim_create_connection
_real_socket.gethostbyname = _sim_gethostbyname

_SANDBOX_NS = {"__name__": "__main__", "socket": _real_socket}
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
    _SANDBOX_NS = {"__name__": "__main__", "socket": _real_socket}

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
            "Comandos disponiveis no Terminal Sandbox:\\n"
            "  ls [pasta]           Lista arquivos e diretorios\\n"
            "  pwd                  Mostra o diretorio atual\\n"
            "  cd <pasta>           Muda de diretorio dentro de /workspace\\n"
            "  cat <arquivo>        Exibe o conteudo de um arquivo\\n"
            "  mkdir <pasta>        Cria uma nova pasta\\n"
            "  touch <arquivo>      Cria um arquivo vazio\\n"
            "  rm <arquivo|pasta>   Remove arquivo ou pasta\\n"
            "  python3 <arquivo.py> Executa um script Python do /workspace\\n"
            "  python3 -c 'codigo'  Executa codigo Python direto na linha\\n"
            "  hosts                Lista os hosts virtuais seguros para socket\\n"
            "  clear                Limpa a tela do terminal\\n"
        )
        return True, help_txt, ""

    if cmd == "hosts":
        lines = ["Hosts virtuais acessiveis via socket (100% em memoria):"]
        for h, ports in _VIRTUAL_LAB_NETWORK.items():
            plist = ", ".join(str(p) for p in sorted(ports.keys()))
            lines.append(f"  {h:<14} portas abertas: {plist}")
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
_ok, _out, _err = _sandbox_run_shell(_trilha_shell_cmd)
json.dumps({
    "ok": _ok,
    "stdout": _out,
    "stderr": _err,
    "cwd": _SANDBOX_CWD,
    "files": _sandbox_snapshot_files()
})
`)) as string;

    const parsed = JSON.parse(raw) as {
      ok: boolean;
      stdout: string;
      stderr: string;
      cwd: string;
      files: Record<string, string>;
    };
    const durationMs = Math.max(1, Math.round(performance.now() - started));

    return {
      ...parsed,
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
_ok, _out, _err = _sandbox_exec_python_code(_trilha_sb_code, _trilha_sb_file, bool(_trilha_sb_repl))
json.dumps({
    "ok": _ok,
    "stdout": _out,
    "stderr": _err,
    "cwd": _SANDBOX_CWD,
    "files": _sandbox_snapshot_files()
})
`)) as string;

    const parsed = JSON.parse(raw) as {
      ok: boolean;
      stdout: string;
      stderr: string;
      cwd: string;
      files: Record<string, string>;
    };
    const durationMs = Math.max(1, Math.round(performance.now() - started));

    return {
      ...parsed,
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
    };
  }
}
