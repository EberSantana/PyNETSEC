import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Database,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { APPS_SCRIPT_CODE_GS, SHEET_HEADERS } from '../data/missions';
import { testarConexaoAppsScript } from '../services/appsScriptClient';
import { StudentProfile } from '../types/ctf';

interface ProfileConfigDrawerProps {
  open: boolean;
  initialTab?: 'profile' | 'sheets';
  profile: StudentProfile;
  appsScriptUrl: string;
  freeNavigationMode: boolean;
  onSaveProfile: (profile: StudentProfile) => void;
  onSaveAppsScriptUrl: (url: string) => void;
  onToggleFreeNavigation: (enabled: boolean) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function ProfileConfigDrawer({
  open,
  initialTab = 'profile',
  profile,
  appsScriptUrl,
  freeNavigationMode,
  onSaveProfile,
  onSaveAppsScriptUrl,
  onToggleFreeNavigation,
  onResetProgress,
  onClose,
}: ProfileConfigDrawerProps) {
  const [tab, setTab] = useState<'profile' | 'sheets'>(initialTab);
  const [aluno, setAluno] = useState(profile.aluno);
  const [turma, setTurma] = useState(profile.turma);
  const [urlInput, setUrlInput] = useState(appsScriptUrl);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [testState, setTestState] = useState<{
    testing: boolean;
    ok: boolean | null;
    mensagem: string;
  }>({ testing: false, ok: null, mensagem: '' });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setAluno(profile.aluno);
      setTurma(profile.turma);
      setUrlInput(appsScriptUrl);
      setSavedNotice(null);
      setConfirmReset(false);
    }
  }, [open, initialTab, profile, appsScriptUrl]);

  if (!open) return null;

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ aluno: aluno.trim(), turma: turma.trim() || '2º Info' });
    setSavedNotice('Perfil salvo localmente com sucesso.');
    window.setTimeout(() => setSavedNotice(null), 2400);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAppsScriptUrl(urlInput.trim());
    setSavedNotice(
      urlInput.trim()
        ? 'URL do Google Apps Script salva!'
        : 'URL removida — placar operando em modo local.'
    );
    window.setTimeout(() => setSavedNotice(null), 2400);
  };

  const handleTestConnection = async () => {
    setTestState({ testing: true, ok: null, mensagem: 'Testando endpoint /exec...' });
    const result = await testarConexaoAppsScript(urlInput);
    setTestState({ testing: false, ok: result.ok, mensagem: result.mensagem });
    if (result.ok) {
      onSaveAppsScriptUrl(urlInput.trim());
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(APPS_SCRIPT_CODE_GS);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyHeaders = () => {
    navigator.clipboard?.writeText(SHEET_HEADERS.join('\t'));
    setCopiedHeaders(true);
    window.setTimeout(() => setCopiedHeaders(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
    >
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-[#0D1321] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 id="config-drawer-title" className="text-lg font-bold text-slate-50">
              Perfil e Integração Google Sheets
            </h2>
            <p className="text-xs text-slate-400">
              Identificação do aluno e painel do professor (Apps Script)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="border-b border-slate-800 px-6 py-3">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#090D16] p-1">
            <button
              type="button"
              onClick={() => setTab('profile')}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                tab === 'profile'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Perfil do Aluno
            </button>
            <button
              type="button"
              onClick={() => setTab('sheets')}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                tab === 'sheets'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              Google Sheets (Professor)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedNotice && (
            <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-xs font-medium text-emerald-200">
              {savedNotice}
            </div>
          )}

          {tab === 'profile' ? (
            <div className="space-y-6">
              <form onSubmit={handleSaveStudent} className="space-y-4">
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Nome do Aluno (aparece no placar e nos cartões)
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={aluno}
                    onChange={(e) => setAluno(e.target.value)}
                    placeholder="Ex.: Lucas Ferreira"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-class"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Turma / Instituto
                  </label>
                  <input
                    id="student-class"
                    type="text"
                    value={turma}
                    onChange={(e) => setTurma(e.target.value)}
                    placeholder="Ex.: 2º Info A · IF"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#090D16] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300"
                >
                  Salvar Identificação
                </button>
              </form>

              <hr className="border-slate-800" />

              {/* Teacher Free Navigation Mode */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-[#090D16] p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Modo Livre (Professor / Demonstração)
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Desbloqueia todas as 21 missões imediatamente — ideal para o professor
                    demonstrar a Missão 20A (Blue Team) ou 20B (Red Team) em aula.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={freeNavigationMode}
                  onClick={() => onToggleFreeNavigation(!freeNavigationMode)}
                  className={`relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors ${
                    freeNavigationMode
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-[#090D16] transition-transform ${
                      freeNavigationMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reset Session */}
              <div className="rounded-xl border border-slate-800 bg-[#090D16] p-4">
                <p className="text-sm font-semibold text-slate-200">
                  Reiniciar progresso local
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Limpa rascunhos, flags salvas neste navegador e histórico de execuções (não
                  apaga dados já enviados ao Google Sheets).
                </p>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-rose-500/40 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpar progresso deste computador
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        setConfirmReset(false);
                        setSavedNotice('Progresso local reiniciado.');
                      }}
                      className="cursor-pointer rounded-lg bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-400"
                    >
                      Confirmar limpeza
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleSaveUrl} className="space-y-3">
                <label
                  htmlFor="apps-script-url"
                  className="block text-xs font-medium text-slate-300"
                >
                  URL do App da Web do Google Apps Script (/exec)
                </label>
                <input
                  id="apps-script-url"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-lg border border-slate-700 bg-[#090D16] px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300"
                  >
                    Salvar URL
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testState.testing}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${testState.testing ? 'animate-spin' : ''}`}
                    />
                    Testar Conexão
                  </button>
                </div>

                {testState.mensagem && (
                  <p
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      testState.ok === true
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : testState.ok === false
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {testState.mensagem}
                  </p>
                )}
              </form>

              {/* Step 1: Spreadsheet Columns */}
              <div className="rounded-xl border border-slate-800 bg-[#090D16] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    1. Aba &quot;Progresso&quot; no Google Sheets
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyHeaders}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800"
                  >
                    {copiedHeaders ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar colunas
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Crie uma aba chamada <code className="text-cyan-300">Progresso</code> com estas
                  7 colunas na linha 1 (suporta múltiplos módulos como PySec e BD):
                </p>
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-[#060911] px-3 py-2 font-mono text-xs text-cyan-200">
                  {SHEET_HEADERS.join('  |  ')}
                </div>
              </div>

              {/* Step 2: Code.gs */}
              <div className="rounded-xl border border-slate-800 bg-[#090D16] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    2. Código Google Apps Script (Code.gs)
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Code.gs copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar Code.gs
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  Inclui <code className="text-slate-200">LockService</code> (evita conflito com
                  30 alunos clicando juntos) e trava anti-duplicidade. Depois clique em{' '}
                  <strong className="text-slate-200">
                    Implantar &gt; Nova implantação &gt; App da Web
                  </strong>{' '}
                  (Executar como: <em>Eu</em>; Quem pode acessar: <em>Qualquer pessoa</em>).
                </p>
                <pre className="mt-3 max-h-56 overflow-auto rounded-lg border border-slate-800 bg-[#060911] p-3 font-mono text-[11px] leading-relaxed text-slate-300">
                  {APPS_SCRIPT_CODE_GS}
                </pre>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                <span>
                  As requisições POST usam <code className="text-slate-200">text/plain;charset=utf-8</code>{' '}
                  para evitar bloqueios de CORS em hospedagens estáticas como o GitHub Pages.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
