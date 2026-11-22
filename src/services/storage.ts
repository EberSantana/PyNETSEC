import { PersistedSession } from '../types/ctf';

const STORAGE_KEY = 'trilharali_pysec_session_v1';

export const DEFAULT_SESSION: PersistedSession = {
  profile: {
    aluno: '',
    turma: '2º Info',
  },
  completedMissions: {},
  completedDrills: {},
  codeDrafts: {},
  runHistory: [],
  ethicsAccepted: false,
  freeNavigationMode: false,
  appsScriptUrl: '',
  purpleReflection: null,
};

export function loadSession(): PersistedSession {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
      codeDrafts: parsed.codeDrafts ?? {},
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
