// Re-export from split stores for backwards compatibility
export { useActiveSessionStore } from './activeSessionStore';
export { useSessionListStore } from './sessionListStore';
export { useSessionStatsStore } from './sessionStatsStore';

// Combined store for components that need all session functionality
import { useActiveSessionStore } from './activeSessionStore';
import { useSessionListStore } from './sessionListStore';
import { useSessionStatsStore } from './sessionStatsStore';

export function useSessionStore() {
  const activeStore = useActiveSessionStore();
  const listStore = useSessionListStore();
  const statsStore = useSessionStatsStore();

  return {
    // Active session
    activeSession: activeStore.activeSession,
    startSession: activeStore.startSession,
    updateActiveSession: activeStore.updateActiveSession,
    addFirearmToSession: activeStore.addFirearmToSession,
    removeFirearmFromSession: activeStore.removeFirearmFromSession,
    recordAmmoUsage: activeStore.recordAmmoUsage,
    addTarget: activeStore.addTarget,
    removeTarget: activeStore.removeTarget,
    saveSession: async () => {
      const sessionId = await activeStore.saveSession();
      if (sessionId) {
        // Reload sessions list after save
        await listStore.loadSessions();
      }
      return sessionId;
    },
    quickSaveSession: async (data: { date: string; location?: string; notes?: string; weather?: string }) => {
      const sessionId = await activeStore.quickSaveSession(data);
      if (sessionId) {
        await listStore.loadSessions();
      }
      return sessionId;
    },
    discardSession: activeStore.discardSession,

    // Session list
    sessions: listStore.sessions,
    loadSessions: listStore.loadSessions,
    loadSessionDetails: listStore.loadSessionDetails,
    deleteSession: listStore.deleteSession,

    // Stats
    getHeatmapData: statsStore.getHeatmapData,
    getDashboardStats: statsStore.getDashboardStats,

    // Combined state
    isLoading: activeStore.isLoading || listStore.isLoading || statsStore.isLoading,
    error: activeStore.error || listStore.error || statsStore.error,
    clearError: () => {
      activeStore.clearError();
      listStore.clearError();
      statsStore.clearError();
    },
  };
}
