import {
  CompletedMissionRecord,
  RankingEntry,
  RankingModuleFilter,
  StudentProfile,
  SyncStatus,
} from '../types/ctf';

export interface RegisterMissionPayload {
  aluno: string;
  turma: string;
  modulo: string;
  missaoId: string;
  flag: string;
  pontos: number;
}

export interface RegisterMissionResponse {
  status: SyncStatus;
  mensagem: string;
}

export interface FetchRankingResult {
  source: 'remote' | 'local';
  ranking: RankingEntry[];
  errorMessage?: string;
}

/**
 * Posts mission completion to Google Apps Script using text/plain;charset=utf-8
 * to avoid CORS preflight failures on static/GitHub Pages origins (PDF p. 8).
 */
export async function registrarMissao(
  appsScriptUrl: string,
  payload: RegisterMissionPayload
): Promise<RegisterMissionResponse> {
  const cleanUrl = appsScriptUrl.trim();
  if (!cleanUrl) {
    return {
      status: 'local',
      mensagem: 'Salvo localmente (planilha Google Sheets não conectada).',
    };
  }

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as { status?: string; mensagem?: string };
    if (data.status === 'sucesso') {
      return {
        status: 'synced',
        mensagem: data.mensagem || 'Progresso sincronizado com o Google Sheets!',
      };
    }
    if (data.status === 'duplicado') {
      return {
        status: 'duplicate',
        mensagem: data.mensagem || 'Missão já registrada anteriormente na planilha.',
      };
    }
    return {
      status: 'error',
      mensagem: data.mensagem || 'O Apps Script retornou um erro ao gravar.',
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Falha de rede';
    return {
      status: 'error',
      mensagem: `Salvo localmente; não foi possível enviar ao Google Sheets (${detail}).`,
    };
  }
}

/**
 * Fetches leaderboard from Google Apps Script GET ?modulo=geral|PySec|BD
 * and falls back cleanly to the local session leaderboard when unconfigured.
 */
export async function buscarRanking(
  appsScriptUrl: string,
  modulo: RankingModuleFilter,
  profile: StudentProfile,
  completedMissions: Record<string, CompletedMissionRecord>
): Promise<FetchRankingResult> {
  const cleanUrl = appsScriptUrl.trim();

  if (cleanUrl) {
    try {
      const separator = cleanUrl.includes('?') ? '&' : '?';
      const url = `${cleanUrl}${separator}modulo=${encodeURIComponent(modulo)}`;
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        modulo?: string;
        ranking?: Array<{ aluno: string; turma: string; pontos: number; missoes: number }>;
      };

      const normalizedName = profile.aluno.trim().toLowerCase();
      const rows: RankingEntry[] = (data.ranking ?? []).map((item) => ({
        aluno: String(item.aluno ?? 'Anônimo'),
        turma: String(item.turma ?? 'Geral'),
        pontos: Number(item.pontos ?? 0),
        missoes: Number(item.missoes ?? 0),
        isCurrentUser:
          normalizedName.length > 0 &&
          String(item.aluno ?? '').trim().toLowerCase() === normalizedName,
      }));

      return { source: 'remote', ranking: rows };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Falha de conexão';
      return {
        source: 'local',
        ranking: buildLocalRanking(modulo, profile, completedMissions),
        errorMessage: `Não foi possível ler o placar remoto (${detail}). Exibindo progresso local.`,
      };
    }
  }

  return {
    source: 'local',
    ranking: buildLocalRanking(modulo, profile, completedMissions),
  };
}

export async function testarConexaoAppsScript(
  appsScriptUrl: string
): Promise<{ ok: boolean; mensagem: string }> {
  const cleanUrl = appsScriptUrl.trim();
  if (!cleanUrl) {
    return { ok: false, mensagem: 'Informe a URL do App da Web (/exec) antes de testar.' };
  }
  if (!cleanUrl.startsWith('https://')) {
    return { ok: false, mensagem: 'A URL do Google Apps Script deve começar com https://.' };
  }

  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${cleanUrl}${separator}modulo=PySec`, { method: 'GET' });
    if (!response.ok) {
      return {
        ok: false,
        mensagem: `O servidor respondeu com status HTTP ${response.status}. Verifique as permissões ("Qualquer pessoa").`,
      };
    }
    const data = (await response.json()) as { ranking?: unknown[] };
    if (!Array.isArray(data.ranking)) {
      return {
        ok: false,
        mensagem: 'Conexão aberta, mas o JSON não contém o campo "ranking". Confira o Code.gs.',
      };
    }
    return {
      ok: true,
      mensagem: `Conexão confirmada! ${data.ranking.length} registro(s) encontrado(s) no módulo PySec.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro de rede';
    return {
      ok: false,
      mensagem: `Falha ao conectar (${msg}). Confira se implantou como App da Web com acesso "Qualquer pessoa".`,
    };
  }
}

function buildLocalRanking(
  modulo: RankingModuleFilter,
  profile: StudentProfile,
  completedMissions: Record<string, CompletedMissionRecord>
): RankingEntry[] {
  const entries = Object.values(completedMissions);
  const myPoints = entries.reduce((sum, item) => sum + item.pontos, 0);
  const myMissions = entries.length;
  const studentName = profile.aluno.trim() || 'Você (Sessão Local)';
  const studentClass = profile.turma.trim() || '2º Info';

  if (modulo === 'BD') {
    return [];
  }

  if (myMissions === 0 && !profile.aluno.trim()) {
    return [];
  }

  return [
    {
      aluno: studentName,
      turma: studentClass,
      pontos: myPoints,
      missoes: myMissions,
      isCurrentUser: true,
    },
  ];
}
