export type CircuitId = 1 | 2 | 3 | 4 | 5;

export type TeamRole = 'core' | 'network' | 'linux' | 'blue' | 'red';

export type AppView = 'hub' | 'study' | 'lab' | 'ranking' | 'badges';

export type LabWorkspaceMode = 'mission' | 'sandbox';

export type RankingModuleFilter = 'geral' | 'PySec' | 'BD';

export type SyncStatus = 'synced' | 'duplicate' | 'local' | 'error';

export interface StudyCommandRow {
  command: string;
  meaning: string;
  example: string;
}

export interface SandboxExample {
  label: string;
  code: string;
}

export interface StudyDrill {
  id: string;
  step: number;
  title: string;
  prompt: string;
  starterCode: string;
  hint: string;
  validate: (stdout: string) => MissionValidationResult;
}

export interface StudyLesson {
  id: string;
  order: number;
  circuit: CircuitId;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  relatedMissionIds: string[];
  intro: string[];
  commandTable: StudyCommandRow[];
  sandboxExamples: SandboxExample[];
  drills: StudyDrill[];
}

export interface CircuitInfo {
  id: CircuitId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  missionCount: number;
  accentLabel: string;
}

export interface MissionValidationResult {
  passed: boolean;
  feedback: string;
}

export interface Mission {
  id: string;
  order: number;
  circuit: CircuitId;
  title: string;
  topic: string;
  teamRole: TeamRole;
  durationMinutes: number;
  points: number;
  microLesson: string[];
  exampleTitle: string;
  exampleCode: string;
  objective: string;
  starterCode: string;
  hints: [string, string];
  setupPython?: string;
  flag: string;
  validate: (stdout: string, userCode: string) => MissionValidationResult;
  hasPurpleBonus?: boolean;
}

export interface StudentProfile {
  aluno: string;
  turma: string;
}

export interface CompletedMissionRecord {
  missaoId: string;
  flag: string;
  pontos: number;
  completedAt: string;
  syncStatus: SyncStatus;
}

export interface RunHistoryEntry {
  id: string;
  missaoId: string;
  missaoTitle: string;
  timestamp: string;
  status: 'ok' | 'error' | 'validated';
  durationMs: number;
  outputPreview: string;
}

export interface RankingEntry {
  aluno: string;
  turma: string;
  pontos: number;
  missoes: number;
  isCurrentUser?: boolean;
}

export interface CodePreset {
  id: string;
  label: string;
  description: string;
  snippet: string;
}

export interface TranslatedPythonError {
  errorType: string;
  title: string;
  explanation: string;
  tip: string;
  line: number | null;
  rawError: string;
}

export interface PyodideExecutionResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  translatedError?: TranslatedPythonError;
}

export interface PurpleReflection {
  correction1: string;
  correction2: string;
  savedAt: string;
}

export interface SandboxTerminalLine {
  id: string;
  kind: 'prompt' | 'stdout' | 'stderr' | 'info' | 'error-tip';
  prefix?: string;
  text: string;
}

export interface NmapPortEntry {
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version: string;
}

export interface NetworkPacketFrame {
  seq: number;
  direction: 'tx' | 'rx' | 'drop' | 'sniff';
  proto: 'ICMP' | 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'WHOIS';
  src: string;
  dst: string;
  flags: string;
  bytes: number;
  ttl: number;
  latencyMs?: number;
  payload: string;
  explanation: string;
  severity?: 'normal' | 'ok' | 'warn' | 'alert';
}

export interface NetworkVisualEvent {
  id: string;
  tool: 'ping' | 'whois' | 'nmap' | 'sniff' | 'nslookup' | 'socket';
  target: string;
  resolvedIp: string;
  success: boolean;
  summary: string;
  avgMs?: number | null;
  riskNote?: string;
  org?: string;
  created?: string;
  ports?: NmapPortEntry[];
  packetCount?: number;
  alertCount?: number;
  packets?: NetworkPacketFrame[];
}

export interface PersistedSession {
  profile: StudentProfile;
  completedMissions: Record<string, CompletedMissionRecord>;
  completedDrills: Record<string, boolean>;
  codeDrafts: Record<string, string>;
  sandboxFiles: Record<string, string> | null;
  runHistory: RunHistoryEntry[];
  ethicsAccepted: boolean;
  freeNavigationMode: boolean;
  appsScriptUrl: string;
  purpleReflection: PurpleReflection | null;
}
