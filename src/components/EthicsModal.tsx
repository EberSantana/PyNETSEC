import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface EthicsModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function EthicsModal({ open, onAccept, onClose }: EthicsModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ethics-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0F1E36] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-300">
                Circuito 3 · Segurança da Informação
              </p>
              <h2
                id="ethics-modal-title"
                className="text-xl font-bold text-slate-50"
              >
                Código de Ética do Laboratório
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso de ética"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            Antes de iniciar os desafios de criptografia, análise forense (Blue Team) e
            automação ofensiva controlada (Red Team), confirme as regras do laboratório:
          </p>
          <ul className="space-y-2.5 rounded-lg border border-slate-800 bg-[#071225] p-4 text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Todo script desta arena roda <strong>100% em memória no navegador</strong>{' '}
                usando dados simulados (<code className="text-cyan-300">logs</code> e módulo{' '}
                <code className="text-cyan-300">alvo</code>) — nenhum tráfego real sai para a
                rede da escola.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Fora deste ambiente, técnicas de varredura ou força bruta só devem apontar para{' '}
                <code className="text-cyan-300">127.0.0.1</code> (localhost) ou máquinas de
                teste autorizadas pelo professor.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                O objetivo do Red Team é aprender como falhas acontecem para construir defesas
                mais fortes (mentalidade Purple Team).
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            Voltar à Trilha
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="cursor-pointer rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300"
          >
            Concordo e Entrar na Arena CTF
          </button>
        </div>
      </div>
    </div>
  );
}
