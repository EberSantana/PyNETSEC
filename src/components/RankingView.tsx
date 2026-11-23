import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Cloud,
  Database,
  RefreshCw,
  Settings2,
  Trophy,
} from 'lucide-react';
import { buscarRanking } from '../services/appsScriptClient';
import {
  CompletedMissionRecord,
  RankingEntry,
  RankingModuleFilter,
  StudentProfile,
} from '../types/ctf';

interface RankingViewProps {
  appsScriptUrl: string;
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  onOpenSheetsConfig: () => void;
}

const MODULE_TABS: Array<{ id: RankingModuleFilter; label: string }> = [
  { id: 'geral', label: 'Geral' },
  { id: 'PyNetSec', label: 'PyNetSec' },
  { id: 'BD', label: 'Banco de Dados' },
];

export function RankingView({
  appsScriptUrl,
  profile,
  completedMissions,
  onOpenSheetsConfig,
}: RankingViewProps) {
  const [modulo, setModulo] = useState<RankingModuleFilter>('PyNetSec');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [source, setSource] = useState<'remote' | 'local'>('local');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await buscarRanking(appsScriptUrl, modulo, profile, completedMissions);
    setRanking(result.ranking);
    setSource(result.source);
    setErrorMsg(result.errorMessage ?? null);
    setLoading(false);
  }, [appsScriptUrl, modulo, profile, completedMissions]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-cyan-300">
            Placar Unificado · Google Sheets + Apps Script
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-50">
            Ranking da Turma
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Filtra dinamicamente a aba <code className="text-slate-200">Progresso</code> por
            módulo (<code className="text-cyan-300">?modulo={modulo}</code>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadLeaderboard}
            disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Placar
          </button>
          <button
            type="button"
            onClick={onOpenSheetsConfig}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configurar Planilha
          </button>
        </div>
      </div>

      {/* Module Segmented Control + Connection State */}
      <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-[#090D16] p-1">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setModulo(tab.id)}
              className={`cursor-pointer rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                modulo === tab.id
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {source === 'remote' ? (
            <>
              <Cloud className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300">
                Conectado ao Google Sheets ao vivo
              </span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4 text-slate-400" />
              <span>Modo local — conecte o Apps Script para ranking coletivo</span>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Consultando placar do módulo {modulo}...
          </div>
        ) : ranking.length === 0 ? (
          <div className="p-10 text-center">
            <Trophy className="mx-auto h-8 w-8 text-slate-600" />
            <h2 className="mt-3 text-base font-semibold text-slate-200">
              Nenhum registro neste módulo ainda
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
              {appsScriptUrl
                ? `A planilha conectada ainda não possui missões concluídas no módulo "${modulo}".`
                : 'Complete sua primeira missão no Laboratório ou informe a URL do Google Apps Script da turma para exibir o ranking coletivo.'}
            </p>
            {!appsScriptUrl && (
              <button
                type="button"
                onClick={onOpenSheetsConfig}
                className="mt-4 cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
              >
                Ver instruções do Google Sheets (Code.gs)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B111E] text-xs font-medium text-slate-400">
                  <th className="px-6 py-3.5">Posição</th>
                  <th className="px-6 py-3.5">Aluno</th>
                  <th className="px-6 py-3.5">Turma</th>
                  <th className="px-6 py-3.5 text-right">Missões</th>
                  <th className="px-6 py-3.5 text-right">Pontuação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ranking.map((entry, idx) => (
                  <tr
                    key={`${entry.aluno}-${entry.turma}-${idx}`}
                    className={
                      entry.isCurrentUser ? 'bg-cyan-400/8' : 'hover:bg-slate-800/30'
                    }
                  >
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-300 tabular-nums">
                      #{String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {entry.aluno}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-cyan-300">
                          (Você)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{entry.turma}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300 tabular-nums">
                      {entry.missoes}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                      {entry.pontos} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
