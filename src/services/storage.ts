import { PersistedSession } from '../types/ctf';

import { lerAlunoPortal, MODO_PROFESSOR } from './portal';

const STORAGE_KEY_BASE = 'trilharali_pysec_session_v1';

/** Cada aluno do portal tem o seu progresso, mesmo dividindo o computador do laboratório. */
function storageKey(): string {
  const a = lerAlunoPortal();
  if (a) return `${STORAGE_KEY_BASE}:${a.id}`;
  return MODO_PROFESSOR ? `${STORAGE_KEY_BASE}:professor` : STORAGE_KEY_BASE;
}

export const DEFAULT_SESSION: PersistedSession = {
  profile: {
    aluno: '',
    turma: '2º Info',
  },
  completedMissions: {},
  completedDrills: {},
  completedDefenseMissions: {},
  codeDrafts: {},
  sandboxFiles: null,
  runHistory: [],
  ethicsAccepted: false,
  freeNavigationMode: false,
  appsScriptUrl: '',
  purpleReflection: null,
};

export function loadSession(): PersistedSession {
  const s = lerSessao();
  const a = lerAlunoPortal();
  return a ? { ...s, profile: { aluno: a.nome, turma: a.turma || s.profile.turma } } : s;
}

function lerSessao(): PersistedSession {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) {
      return { ...DEFAULT_SESSION };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedSession>;
    return {
      profile: {
        aluno: typeof parsed.profile?.aluno === 'string' ? parsed.profile.aluno : '',
        turma: typeof parsed.profile?.turma === 'string' ? parsed.profile.turma : '2º Info',
      },
      completedMissions: parsed.completedMissions ?? {},
      completedDrills: parsed.completedDrills ?? {},
      completedDefenseMissions:
        parsed.completedDefenseMissions && typeof parsed.completedDefenseMissions === 'object'
          ? parsed.completedDefenseMissions
          : {},
      codeDrafts: parsed.codeDrafts ?? {},
      sandboxFiles:
        parsed.sandboxFiles && typeof parsed.sandboxFiles === 'object'
          ? parsed.sandboxFiles
          : null,
      runHistory: Array.isArray(parsed.runHistory) ? parsed.runHistory.slice(0, 40) : [],
      ethicsAccepted: Boolean(parsed.ethicsAccepted),
      freeNavigationMode: Boolean(parsed.freeNavigationMode),
      appsScriptUrl: typeof parsed.appsScriptUrl === 'string' ? parsed.appsScriptUrl : '',
      purpleReflection: parsed.purpleReflection ?? null,
    };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function saveSession(session: PersistedSession): void {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(session));
  } catch {
    // Ignore quota errors on restricted school browsers
  }
}

export function resetAllProgress(session: PersistedSession): PersistedSession {
  const fresh: PersistedSession = {
    ...DEFAULT_SESSION,
    profile: session.profile,
    appsScriptUrl: session.appsScriptUrl,
  };
  saveSession(fresh);
  return fresh;
}
