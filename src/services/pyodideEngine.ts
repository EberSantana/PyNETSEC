import { PyodideExecutionResult } from '../types/ctf';
import { translatePythonError } from './errorTranslator';

export type PyodideStatus = 'idle' | 'loading-script' | 'loading-wasm' | 'ready' | 'error';

interface PyodideRuntime {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (key: string, value: unknown) => void;
    get: (key: string) => unknown;
    delete: (key: string) => void;
  };
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

const PYODIDE_VERSION = 'v0.26.4';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const PYODIDE_SCRIPT_URL = `${PYODIDE_BASE_URL}pyodide.js`;

let pyodideInstance: PyodideRuntime | null = null;
let loadingPromise: Promise<PyodideRuntime> | null = null;
let currentStatus: PyodideStatus = 'idle';
const listeners = new Set<(status: PyodideStatus) => void>();

function setStatus(next: PyodideStatus) {
  currentStatus = next;
  listeners.forEach((cb) => cb(next));
}

export function getPyodideStatus(): PyodideStatus {
  return currentStatus;
}

export function subscribePyodideStatus(listener: (status: PyodideStatus) => void): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

function injectPyodideScript(): Promise<void> {
  if (typeof window.loadPyodide === 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PYODIDE_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Falha ao baixar o carregador do Pyodide (CDN).')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          'Não foi possível carregar o motor Python (Pyodide). Verifique sua conexão com a internet.'
        )
      );
    document.head.appendChild(script);
  });
}

/**
 * Lazily loads Pyodide WebAssembly only when the student enters a Lab mission.
 */
export async function ensurePyodideReady(): Promise<PyodideRuntime> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      setStatus('loading-script');
      await injectPyodideScript();

      if (typeof window.loadPyodide !== 'function') {
        throw new Error('Função loadPyodide indisponível após carregamento do script.');
      }

      setStatus('loading-wasm');
      const runtime = await window.loadPyodide({
        indexURL: PYODIDE_BASE_URL,
      });

      pyodideInstance = runtime;
      setStatus('ready');
      return runtime;
    } catch (error) {
      loadingPromise = null;
      setStatus('error');
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Executes a student's Python mission code inside an isolated namespace with
 * captured stdout/stderr and accurate line numbers mapped to "missao.py".
 */
export async function runPythonMission(
  setupPython: string | undefined,
  userCode: string
): Promise<PyodideExecutionResult> {
  const startedAt = performance.now();

  try {
    const pyodide = await ensurePyodideReady();

    pyodide.globals.set('_trilha_setup_code', setupPython ?? '');
    pyodide.globals.set('_trilha_user_code', userCode);

    const runnerScript = `
import sys, io, traceback, json

_stdout_buf = io.StringIO()
_stderr_buf = io.StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
_ok = True
_error_text = ""

sys.stdout = _stdout_buf
sys.stderr = _stderr_buf

_ns = {"__name__": "__main__"}

try:
    if _trilha_setup_code:
        exec(compile(_trilha_setup_code, "ambiente_missao.py", "exec"), _ns)
    exec(compile(_trilha_user_code, "missao.py", "exec"), _ns)
except BaseException:
    _ok = False
    _error_text = traceback.format_exc()
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr

json.dumps({
    "ok": _ok,
    "stdout": _stdout_buf.getvalue(),
    "stderr": _stderr_buf.getvalue(),
    "error": _error_text
})
`;

    const rawJson = (await pyodide.runPythonAsync(runnerScript)) as string;
    const parsed = JSON.parse(rawJson) as {
      ok: boolean;
      stdout: string;
      stderr: string;
      error: string;
    };

    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));

    if (!parsed.ok) {
      return {
        ok: false,
        stdout: parsed.stdout,
        stderr: parsed.error || parsed.stderr,
        durationMs,
        translatedError: translatePythonError(parsed.error || parsed.stderr),
      };
    }

    return {
      ok: true,
      stdout: parsed.stdout,
      stderr: parsed.stderr,
      durationMs,
    };
  } catch (err) {
    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      stdout: '',
      stderr: message,
      durationMs,
      translatedError: {
        errorType: 'EngineError',
        title: 'Motor Python indisponível no momento',
        explanation: message,
        tip: 'Verifique a conexão de rede do laboratório e tente clicar em "Executar" novamente.',
        line: null,
        rawError: message,
      },
    };
  }
}
