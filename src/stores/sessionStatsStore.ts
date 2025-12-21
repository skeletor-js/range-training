import { create } from 'zustand';
import { db } from '@/db';
import { sessions, sessionAmmo, targets } from '@/db/schema';
import type { HeatmapDataPoint, DashboardStats } from '@/types';

interface SessionStatsState {
  isLoading: boolean;
  error: string | null;

  getHeatmapData: () => Promise<HeatmapDataPoint[]>;
  getDashboardStats: () => Promise<DashboardStats>;
  clearError: () => void;
}

// Helper function
function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export const useSessionStatsStore = create<SessionStatsState>((set) => ({
  isLoading: false,
  error: null,

  getHeatmapData: async () => {
    try {
      const result = await db.select().from(sessions);

      // Group by date
      const dateMap = new Map<string, number>();
      for (const session of result) {
        const date = session.date.split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }

      return Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error('[SessionStatsStore] Failed to get heatmap data:', error);
      return [];
    }
  },

  getDashboardStats: async () => {
    try {
      const sessionsResult = await db.select().from(sessions);
      const targetsResult = await db.select().from(targets);

      // Calculate total rounds
      const ammoResult = await db.select().from(sessionAmmo);
      const totalRounds = ammoResult.reduce((sum, a) => sum + a.roundsFired, 0);

      // Calculate streak
      const sortedDates = sessionsResult
        .map((s) => s.date.split('T')[0])
        .sort()
        .reverse();

      let currentStreak = 0;
      let longestStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      let expectedDate = today;

      for (const date of sortedDates) {
        if (date === expectedDate || date === getPreviousDay(expectedDate)) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
          expectedDate = getPreviousDay(date);
        } else if (date < expectedDate) {
          if (currentStreak > 0) {
            currentStreak = 1;
            expectedDate = getPreviousDay(date);
          }
        }
      }

      return {
        totalSessions: sessionsResult.length,
        totalRoundsFired: totalRounds,
        totalTargets: targetsResult.length,
        currentStreak,
        longestStreak,
        lastSessionDate: sortedDates[0] || null,
      };
    } catch (error) {
      console.error('[SessionStatsStore] Failed to get dashboard stats:', error);
      return {
        totalSessions: 0,
        totalRoundsFired: 0,
        totalTargets: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: null,
      };
    }
  },

  clearError: () => set({ error: null }),
}));
