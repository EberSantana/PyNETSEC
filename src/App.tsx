import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgesView } from './components/BadgesView';
import { EthicsModal } from './components/EthicsModal';
import { FlagVictoryModal } from './components/FlagVictoryModal';
import { HubView } from './components/HubView';
import { LabView } from './components/LabView';
import {
  CardPaletteId,
  LockScreenCardData,
  LockScreenCardModal,
} from './components/LockScreenCardModal';
import { Navbar } from './components/Navbar';
import { ProfileConfigDrawer } from './components/ProfileConfigDrawer';
import { RankingView } from './components/RankingView';
import { NetworkStudySubTab, StudyTrack, StudyView } from './components/StudyView';
import { DEFENSE_THEORY_MISSIONS } from './data/infoSecData';
import { MISSIONS, getMissionById, getStudentRankTitle } from './data/missions';
import { DEFAULT_SANDBOX_FILES } from './data/sandboxDefaults';
import { STUDY_LESSONS, getLessonForMissionId } from './data/studyLessons';
import { registrarMissao } from './services/appsScriptClient';
import { loadSession, resetAllProgress, saveSession } from './services/storage';
import {
  AppView,
  CircuitId,
  DefenseMissionCompletion,
  LabWorkspaceMode,
  Mission,
  PersistedSession,
  PyodideExecutionResult,
  RunHistoryEntry,
  StudentProfile,
  SyncStatus,
} from './types/ctf';

export default function App() {
  const [session, setSession] = useState<PersistedSession>(() => loadSession());
  const [activeView, setActiveView] = useState<AppView>('hub');
  const [labMode, setLabMode] = useState<LabWorkspaceMode>('mission');
  const [activeMissionId, setActiveMissionId] = useState<string>('M01');
  const [activeLessonId, setActiveLessonId] = useState<string>('L01');
  const [studyTrack, setStudyTrack] = useState<StudyTrack>('python');
  const [networkStudySubTab, setNetworkStudySubTab] =
    useState<NetworkStudySubTab>('fundamentals');
  const [returnMissionId, setReturnMissionId] = useState<string | null>(null);

  // Modals & Drawers
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configDrawerTab, setConfigDrawerTab] = useState<'profile' | 'sheets'>('profile');
  const [pendingEthicsMission, setPendingEthicsMission] = useState<Mission | null>(null);
  const [victoryState, setVictoryState] = useState<{
    open: boolean;
    mission: Mission | null;
    syncStatus: SyncStatus;
    syncMessage: string;
  }>({
    open: false,
    mission: null,
    syncStatus: 'local',
    syncMessage: '',
  });
  const [lockScreenCard, setLockScreenCard] = useState<LockScreenCardData | null>(null);

  // Persist session changes to localStorage
  useEffect(() => {
    saveSession(session);
  }, [session]);

  const isMissionUnlocked = useCallback(
    (mission: Mission): boolean => {
      if (session.freeNavigationMode) return true;
      if (mission.order === 1) return true;
      if (session.completedMissions[mission.id]) return true;
      const prev = MISSIONS.find((m) => m.order === mission.order - 1);
      return prev ? Boolean(session.completedMissions[prev.id]) : true;
    },
    [session.freeNavigationMode, session.completedMissions]
  );

  const nextRecommendedMission = useMemo(() => {
    const firstIncomplete = MISSIONS.find((m) => !session.completedMissions[m.id]);
    return firstIncomplete ?? MISSIONS[MISSIONS.length - 1];
  }, [session.completedMissions]);

  const activeMission = useMemo(
    () => getMissionById(activeMissionId),
    [activeMissionId]
  );

  const openMission = useCallback(
    (mission: Mission) => {
      if (mission.circuit === 3 && !session.ethicsAccepted) {
        setPendingEthicsMission(mission);
        return;
      }
      setActiveMissionId(mission.id);
      setReturnMissionId(null);
      setLabMode('mission');
      setActiveView('lab');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [session.ethicsAccepted]
  );

  const handleOpenLabMode = (mode: LabWorkspaceMode) => {
    setLabMode(mode);
    setActiveView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'lab') {
      if (labMode === 'sandbox' || labMode === 'linux' || labMode === 'packet-tracer') {
        setActiveView('lab');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = isMissionUnlocked(activeMission)
        ? activeMission
        : nextRecommendedMission;
      openMission(target);
      return;
    }
    if (view !== 'study') {
      setReturnMissionId(null);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcceptEthics = () => {
    setSession((prev) => ({ ...prev, ethicsAccepted: true }));
    if (pendingEthicsMission) {
      setActiveMissionId(pendingEthicsMission.id);
      setActiveView('lab');
      setPendingEthicsMission(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCodeChange = (missionId: string, nextCode: string) => {
    setSession((prev) => ({
      ...prev,
      codeDrafts: {
        ...prev.codeDrafts,
        [missionId]: nextCode,
      },
    }));
  };

  const handleRecordRun = (entry: RunHistoryEntry) => {
    setSession((prev) => ({
      ...prev,
      runHistory: [entry, ...prev.runHistory].slice(0, 40),
    }));
  };

  const handleMissionValidated = async (
    mission: Mission,
    _result: PyodideExecutionResult
  ) => {
    const nowIso = new Date().toISOString();

    // Save locally immediately so progress is never lost
    setSession((prev) => ({
      ...prev,
      completedMissions: {
        ...prev.completedMissions,
        [mission.id]: {
          missaoId: mission.id,
          flag: mission.flag,
          pontos: mission.points,
          completedAt: prev.completedMissions[mission.id]?.completedAt ?? nowIso,
          syncStatus: prev.appsScriptUrl ? 'local' : 'local',
        },
      },
    }));

    const studentName = session.profile.aluno.trim() || 'Aluno Local';
    const studentClass = session.profile.turma.trim() || 'Geral';

    const syncResp = await registrarMissao(session.appsScriptUrl, {
      aluno: studentName,
      turma: studentClass,
      modulo: 'PyNetSec',
      missaoId: mission.id,
      flag: mission.flag,
      pontos: mission.points,
    });

    setSession((prev) => ({
      ...prev,
      completedMissions: {
        ...prev.completedMissions,
        [mission.id]: {
          missaoId: mission.id,
          flag: mission.flag,
          pontos: mission.points,
          completedAt: prev.completedMissions[mission.id]?.completedAt ?? nowIso,
          syncStatus: syncResp.status,
        },
      },
    }));

    setVictoryState({
      open: true,
      mission,
      syncStatus: syncResp.status,
      syncMessage: syncResp.mensagem,
    });
  };

  const handleSaveProfile = (profile: StudentProfile) => {
    setSession((prev) => ({ ...prev, profile }));
  };

  const handleSaveAppsScriptUrl = (appsScriptUrl: string) => {
    setSession((prev) => ({ ...prev, appsScriptUrl }));
  };

  const handleToggleFreeNavigation = (enabled: boolean) => {
    setSession((prev) => ({ ...prev, freeNavigationMode: enabled }));
  };

  const handleResetProgress = () => {
    setSession((prev) => resetAllProgress(prev));
    setActiveMissionId('M01');
  };

  const handleSavePurpleReflection = (correction1: string, correction2: string) => {
    setSession((prev) => ({
      ...prev,
      purpleReflection: {
        correction1,
        correction2,
        savedAt: new Date().toISOString(),
      },
    }));
  };

  const handleCompleteDrill = (drillId: string) => {
    setSession((prev) => ({
      ...prev,
      completedDrills: {
        ...prev.completedDrills,
        [drillId]: true,
      },
    }));
  };

  const handleCompleteDefenseMission = (completion: DefenseMissionCompletion) => {
    setSession((prev) => ({
      ...prev,
      completedDefenseMissions: {
        ...prev.completedDefenseMissions,
        [completion.missionId]: completion,
      },
    }));
  };

  const handleOpenDefenseStudy = () => {
    setReturnMissionId(null);
    setStudyTrack('infosec');
    setActiveView('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDefenseBadgeCard = (missionId: string) => {
    const mission = DEFENSE_THEORY_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;
    setLockScreenCard({
      missionCode: `SEGURANÇA · ${mission.id}`,
      title: mission.badgeTitle,
      flag: mission.badgeCode,
      studentName: session.profile.aluno.trim() || 'Operador PyNetSec',
      turma: session.profile.turma.trim() || 'Ensino Médio Técnico',
      points: mission.badgePoints,
      rankTitle: `Badge de Defesa · ${mission.pillarLabel}`,
      badgeLabel: 'BADGE DE DEFESA DESBLOQUEADA',
      defaultPalette: mission.badgePalette,
    });
  };

  const handleOpenStudyForCircuit = (circuitId?: CircuitId) => {
    setReturnMissionId(null);
    if (circuitId === 3) {
      setStudyTrack('infosec');
    } else if (circuitId === 4) {
      setNetworkStudySubTab('fundamentals');
      setStudyTrack('networks');
    } else if (circuitId === 5) {
      setStudyTrack('linux');
    } else {
      setStudyTrack('python');
      if (circuitId) {
        const firstLesson = STUDY_LESSONS.find((l) => l.circuit === circuitId);
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
        }
      }
    }
    setActiveView('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudyForMission = (missionId: string) => {
    const targetMission = getMissionById(missionId);
    setReturnMissionId(isMissionUnlocked(targetMission) ? missionId : null);
    if (missionId === 'M33' || missionId === 'M34') {
      setActiveLessonId('L10');
      setNetworkStudySubTab('protocolos');
      setStudyTrack('networks');
    } else if (targetMission.circuit === 3) {
      setStudyTrack('infosec');
    } else if (targetMission.circuit === 4) {
      setNetworkStudySubTab('fundamentals');
      setStudyTrack('networks');
    } else if (targetMission.circuit === 5) {
      setStudyTrack('linux');
    } else {
      setStudyTrack('python');
      const lesson = getLessonForMissionId(missionId);
      setActiveLessonId(lesson.id);
    }
    setActiveView('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSandboxFilesChange = (nextFiles: Record<string, string>) => {
    setSession((prev) => ({
      ...prev,
      sandboxFiles: nextFiles,
    }));
  };

  const sandboxFiles = useMemo(
    () => session.sandboxFiles ?? DEFAULT_SANDBOX_FILES,
    [session.sandboxFiles]
  );

  const openConfigDrawer = (tab: 'profile' | 'sheets' = 'profile') => {
    setConfigDrawerTab(tab);
    setConfigDrawerOpen(true);
  };

  const completedCount = Object.keys(session.completedMissions).length;
  const totalDrillsCount = STUDY_LESSONS.reduce((sum, l) => sum + l.drills.length, 0);
  const completedDrillsCount = Object.values(session.completedDrills).filter(Boolean).length;
  const defenseBadgesCount = DEFENSE_THEORY_MISSIONS.filter((m) =>
    Boolean(session.completedDefenseMissions[m.id])
  ).length;

  const victoryNextMission = useMemo(() => {
    if (!victoryState.mission) return null;
    const idx = MISSIONS.findIndex((m) => m.id === victoryState.mission?.id);
    if (idx < 0 || idx >= MISSIONS.length - 1) return null;
    return MISSIONS[idx + 1];
  }, [victoryState.mission]);

  const handleOpenVictoryLockScreen = () => {
    if (!victoryState.mission) return;
    const m = victoryState.mission;
    const palette: CardPaletteId =
      m.teamRole === 'red' ? 'crimson' : m.circuit === 1 ? 'emerald' : 'cyan';

    setVictoryState((prev) => ({ ...prev, open: false }));
    setLockScreenCard({
      missionCode: `MISSÃO ${m.id}`,
      title: m.title,
      flag: m.flag,
      studentName: session.profile.aluno.trim() || 'Operador PyNetSec',
      turma: session.profile.turma.trim() || 'Ensino Médio Técnico',
      points: m.points,
      rankTitle: getStudentRankTitle(completedCount),
      defaultPalette: palette,
    });
  };

  const returnMission = useMemo(
    () => (returnMissionId ? getMissionById(returnMissionId) : null),
    [returnMissionId]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#090D16] text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        profile={session.profile}
        completedCount={completedCount}
        totalMissions={MISSIONS.length}
        onOpenConfig={() => openConfigDrawer('profile')}
      />

      <main className="flex-1">
        {activeView === 'hub' && (
          <HubView
            profile={session.profile}
            completedMissions={session.completedMissions}
            completedDrillsCount={completedDrillsCount}
            totalDrillsCount={totalDrillsCount}
            defenseBadgesCount={defenseBadgesCount}
            totalDefenseBadges={DEFENSE_THEORY_MISSIONS.length}
            freeNavigationMode={session.freeNavigationMode}
            isMissionUnlocked={isMissionUnlocked}
            nextRecommendedMission={nextRecommendedMission}
            onStartMission={openMission}
            onOpenStudy={handleOpenStudyForCircuit}
            onOpenStudyForMission={handleOpenStudyForMission}
            onOpenLabMode={handleOpenLabMode}
            onToggleFreeNavigation={handleToggleFreeNavigation}
            onOpenProfileDrawer={openConfigDrawer}
          />
        )}

        {activeView === 'study' && (
          <StudyView
            activeLessonId={activeLessonId}
            activeTrack={studyTrack}
            onChangeTrack={setStudyTrack}
            activeNetworkSubTab={networkStudySubTab}
            onChangeNetworkSubTab={setNetworkStudySubTab}
            completedDrills={session.completedDrills}
            completedMissions={session.completedMissions}
            completedDefenseMissions={session.completedDefenseMissions}
            returnMission={returnMission}
            onReturnToMission={openMission}
            isMissionUnlocked={isMissionUnlocked}
            onSelectLesson={(lessonId) => setActiveLessonId(lessonId)}
            onCompleteDrill={handleCompleteDrill}
            onCompleteDefenseMission={handleCompleteDefenseMission}
            onOpenBadges={() => handleNavigate('badges')}
            onOpenDefenseBadgeCard={handleOpenDefenseBadgeCard}
            onGoToMission={openMission}
            onOpenLabMode={handleOpenLabMode}
          />
        )}

        {activeView === 'lab' && (
          <LabView
            mode={labMode}
            onModeChange={setLabMode}
            sandboxFiles={sandboxFiles}
            onSandboxFilesChange={handleSandboxFilesChange}
            studentUsername={session.profile.aluno || 'aluno'}
            mission={activeMission}
            code={session.codeDrafts[activeMission.id] ?? activeMission.starterCode}
            completedMissions={session.completedMissions}
            runHistory={session.runHistory}
            purpleReflection={session.purpleReflection}
            isMissionUnlocked={isMissionUnlocked}
            onCodeChange={handleCodeChange}
            onSelectMission={openMission}
            onBackToHub={() => setActiveView('hub')}
            onOpenStudyForMission={handleOpenStudyForMission}
            onMissionValidated={handleMissionValidated}
            onRecordRun={handleRecordRun}
            onSavePurpleReflection={handleSavePurpleReflection}
          />
        )}

        {activeView === 'ranking' && (
          <RankingView
            appsScriptUrl={session.appsScriptUrl}
            profile={session.profile}
            completedMissions={session.completedMissions}
            onOpenSheetsConfig={() => openConfigDrawer('sheets')}
          />
        )}

        {activeView === 'badges' && (
          <BadgesView
            profile={session.profile}
            completedMissions={session.completedMissions}
            completedDefenseMissions={session.completedDefenseMissions}
            runHistory={session.runHistory}
            onOpenLockScreenCard={(card) => setLockScreenCard(card)}
            onStartMission={openMission}
            onOpenDefenseStudy={handleOpenDefenseStudy}
          />
        )}
      </main>

      {/* Quiet Editorial Footer (No Ornamental Telemetry Tickers) */}
      <footer className="mt-12 border-t border-slate-800/80 bg-[#070B13]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            PyNetSec — Plataforma educativa de Python, Redes, Linux e Segurança da Informação
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => openConfigDrawer('sheets')}
              className="cursor-pointer text-slate-400 transition-colors hover:text-cyan-300"
            >
              Integração Google Sheets
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ranking')}
              className="cursor-pointer text-slate-400 transition-colors hover:text-cyan-300"
            >
              Placar da Turma
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EthicsModal
        open={Boolean(pendingEthicsMission)}
        onAccept={handleAcceptEthics}
        onClose={() => setPendingEthicsMission(null)}
      />

      <FlagVictoryModal
        open={victoryState.open}
        mission={victoryState.mission}
        syncStatus={victoryState.syncStatus}
        syncMessage={victoryState.syncMessage}
        hasNextMission={Boolean(victoryNextMission)}
        onNextMission={() => {
          setVictoryState((prev) => ({ ...prev, open: false }));
          if (victoryNextMission) {
            openMission(victoryNextMission);
          }
        }}
        onOpenLockScreenCard={handleOpenVictoryLockScreen}
        onClose={() => setVictoryState((prev) => ({ ...prev, open: false }))}
      />

      <LockScreenCardModal
        open={Boolean(lockScreenCard)}
        card={lockScreenCard}
        onClose={() => setLockScreenCard(null)}
      />

      <ProfileConfigDrawer
        open={configDrawerOpen}
        initialTab={configDrawerTab}
        profile={session.profile}
        completedDefenseMissions={session.completedDefenseMissions}
        appsScriptUrl={session.appsScriptUrl}
        freeNavigationMode={session.freeNavigationMode}
        onSaveProfile={handleSaveProfile}
        onSaveAppsScriptUrl={handleSaveAppsScriptUrl}
        onToggleFreeNavigation={handleToggleFreeNavigation}
        onResetProgress={handleResetProgress}
        onOpenBadges={() => handleNavigate('badges')}
        onClose={() => setConfigDrawerOpen(false)}
      />
    </div>
  );
}
