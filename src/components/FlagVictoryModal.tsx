import { ArrowRight, CheckCircle2, CloudCheck, Copy, Flag, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { Mission, SyncStatus } from '../types/ctf';

interface FlagVictoryModalProps {
  open: boolean;
  mission: Mission | null;
  syncStatus: SyncStatus;
  syncMessage: string;
  hasNextMission: boolean;
  onNextMission: () => void;
  onOpenLockScreenCard: () => void;
  onClose: () => void;
}

export function FlagVictoryModal({
  open,
  mission,
  syncStatus,
  syncMessage,
  hasNextMission,
  onNextMission,
  onOpenLockScreenCard,
  onClose,
}: FlagVictoryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !mission) return null;

  const handleCopyFlag = () => {
    navigator.clipboard?.writeText(mission.flag);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-victory-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-[#0F1E36] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-300">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-300 tabular-nums">
                {mission.id} concluída · +{mission.points} XP
              </p>
              <h2
                id="flag-victory-title"
                className="text-xl font-bold text-slate-50"
              >
                Flag Capturada!
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar conquista"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Excelente trabalho em <strong className="text-slate-100">{mission.title}</strong>. Sua
          solução passou na verificação automática do Pyodide.
        </p>

        {/* Flag Code Box */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-[#050E1D] px-4 py-3.5">
          <code className="truncate font-mono text-sm font-semibold text-emerald-300 sm:text-base">
            {mission.flag}
          </code>
          <button
            type="button"
            onClick={handleCopyFlag}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Copiada
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Google Sheets Sync Line */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <CloudCheck
            className={`h-4 w-4 shrink-0 ${
              syncStatus === 'synced' || syncStatus === 'duplicate'
                ? 'text-cyan-400'
                : syncStatus === 'error'
                  ? 'text-amber-400'
                  : 'text-slate-500'
            }`}
          />
          <span>{syncMessage}</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onOpenLockScreenCard}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Smartphone className="h-4 w-4" />
            Cartão Lock-Screen
          </button>

          {hasNextMission ? (
            <button
              type="button"
              onClick={onNextMission}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-cyan-300"
            >
              Próxima Missão
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#05131C] transition-colors hover:bg-emerald-300"
            >
              Concluir Arena CTF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
