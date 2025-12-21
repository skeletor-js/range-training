import { create } from 'zustand';
import { eq, sql, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  sessions,
  sessionFirearms,
  sessionAmmo,
  targets,
  shots,
  firearms,
  ammo,
} from '@/db/schema';
import type {
  Session,
  ActiveSession,
  CapturedTarget,
  SessionWithDetails,
  TargetWithShots,
  HeatmapDataPoint,
  DashboardStats,
} from '@/types';
import { generateId } from '@/lib/utils';

interface SessionState {
  // Active session (in-progress)
  activeSession: ActiveSession | null;

  // Past sessions (loaded from DB)
  sessions: Session[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Active Session
  startSession: (date?: string, location?: string) => void;
  updateActiveSession: (updates: Partial<ActiveSession>) => void;
  addFirearmToSession: (firearmId: string) => void;
  removeFirearmFromSession: (firearmId: string) => void;
  recordAmmoUsage: (firearmId: string, ammoId: string, rounds: number) => void;
  addTarget: (target: CapturedTarget) => void;
  removeTarget: (tempId: string) => void;
  saveSession: () => Promise<string | null>;
  discardSession: () => void;

  // Actions - Session List
  loadSessions: () => Promise<void>;
  loadSessionDetails: (sessionId: string) => Promise<SessionWithDetails | null>;
  deleteSession: (id: string) => Promise<void>;

  // Actions - Stats
  getHeatmapData: () => Promise<HeatmapDataPoint[]>;
  getDashboardStats: () => Promise<DashboardStats>;

  // Utility
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  sessions: [],
  isLoading: false,
  error: null,

  startSession: (date, location) => {
    const today = date || new Date().toISOString().split('T')[0];
    set({
      activeSession: {
        id: generateId(),
        date: today,
        location: location || '',
        notes: '',
        weather: null,
        temperature: null,
        firearms: [],
        targets: [],
        isDirty: false,
      },
    });
  },

  updateActiveSession: (updates) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({
      activeSession: {
        ...activeSession,
        ...updates,
        isDirty: true,
      },
    });
  },

  addFirearmToSession: (firearmId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    // Check if already added
    if (activeSession.firearms.some((f) => f.firearmId === firearmId)) return;

    set({
      activeSession: {
        ...activeSession,
        firearms: [
          ...activeSession.firearms,
          { firearmId, ammoUsed: [] },
        ],
        isDirty: true,
      },
    });
  },

  removeFirearmFromSession: (firearmId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({
      activeSession: {
        ...activeSession,
        firearms: activeSession.firearms.filter((f) => f.firearmId !== firearmId),
        isDirty: true,
      },
    });
  },

  recordAmmoUsage: (firearmId, ammoId, rounds) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedFirearms = activeSession.firearms.map((f) => {
      if (f.firearmId !== firearmId) return f;

      const existingAmmo = f.ammoUsed.find((a) => a.ammoId === ammoId);
      if (existingAmmo) {
        return {
          ...f,
          ammoUsed: f.ammoUsed.map((a) =>
            a.ammoId === ammoId ? { ...a, rounds: a.rounds + rounds } : a
          ),
        };
      } else {
        return {
          ...f,
          ammoUsed: [...f.ammoUsed, { ammoId, rounds }],
        };
      }
    });

    set({
      activeSession: {
        ...activeSession,
        firearms: updatedFirearms,
        isDirty: true,
      },
    });
  },

  addTarget: (target) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({
      activeSession: {
        ...activeSession,
        targets: [...activeSession.targets, target],
        isDirty: true,
      },
    });
  },

  removeTarget: (tempId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({
      activeSession: {
        ...activeSession,
        targets: activeSession.targets.filter((t) => t.tempId !== tempId),
        isDirty: true,
      },
    });
  },

  saveSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return null;

    set({ isLoading: true, error: null });

    try {
      const sessionId = activeSession.id;

      // 1. Insert session
      await db.insert(sessions).values({
        id: sessionId,
        date: activeSession.date,
        location: activeSession.location || null,
        notes: activeSession.notes || null,
        weather: activeSession.weather,
        temperature: activeSession.temperature,
      });

      // 2. Insert session_firearms and session_ammo, deduct ammo
      for (const firearmUsage of activeSession.firearms) {
        const sfId = generateId();
        await db.insert(sessionFirearms).values({
          id: sfId,
          sessionId,
          firearmId: firearmUsage.firearmId,
        });

        let totalRoundsForFirearm = 0;

        for (const ammoUsage of firearmUsage.ammoUsed) {
          await db.insert(sessionAmmo).values({
            id: generateId(),
            sessionFirearmId: sfId,
            ammoId: ammoUsage.ammoId,
            roundsFired: ammoUsage.rounds,
          });

          // Deduct from ammo inventory
          await db
            .update(ammo)
            .set({
              roundCount: sql`MAX(0, ${ammo.roundCount} - ${ammoUsage.rounds})`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(ammo.id, ammoUsage.ammoId));

          totalRoundsForFirearm += ammoUsage.rounds;
        }

        // Increment firearm round count
        if (totalRoundsForFirearm > 0) {
          await db
            .update(firearms)
            .set({
              roundCount: sql`${firearms.roundCount} + ${totalRoundsForFirearm}`,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(firearms.id, firearmUsage.firearmId));
        }
      }

      // 3. Insert targets and shots
      for (const target of activeSession.targets) {
        const targetId = generateId();
        await db.insert(targets).values({
          id: targetId,
          sessionId,
          targetType: target.targetType,
          distanceYards: target.distanceYards,
          calibrationType: target.calibrationType,
          customRefInches: target.customRefInches,
          shotCount: target.metrics.shotCount,
          groupCenterX: target.metrics.groupCenterX,
          groupCenterY: target.metrics.groupCenterY,
          extremeSpread: target.metrics.extremeSpread,
          meanRadius: target.metrics.meanRadius,
          groupSizeMoa: target.metrics.groupSizeMoa,
          firearmId: target.firearmId,
          ammoId: target.ammoId,
          notes: target.notes,
        });

        for (const shot of target.shots) {
          await db.insert(shots).values({
            id: generateId(),
            targetId,
            xInches: shot.xInches,
            yInches: shot.yInches,
            shotNumber: shot.sequenceNumber,
          });
        }
      }

      // Clear active session
      set({ activeSession: null, isLoading: false });

      // Reload sessions list
      await get().loadSessions();

      return sessionId;
    } catch (error) {
      console.error('[SessionStore] Failed to save session:', error);
      set({ error: 'Failed to save session', isLoading: false });
      return null;
    }
  },

  discardSession: () => {
    set({ activeSession: null });
  },

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db
        .select()
        .from(sessions)
        .orderBy(desc(sessions.date));
      set({ sessions: result, isLoading: false });
    } catch (error) {
      console.error('[SessionStore] Failed to load sessions:', error);
      set({ error: 'Failed to load sessions', isLoading: false });
    }
  },

  loadSessionDetails: async (sessionId) => {
    try {
      // Load session
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId));

      if (sessionResult.length === 0) return null;

      const session = sessionResult[0];

      // Load targets with shots
      const targetsResult = await db
        .select()
        .from(targets)
        .where(eq(targets.sessionId, sessionId));

      const targetsWithShots: TargetWithShots[] = await Promise.all(
        targetsResult.map(async (target) => {
          const shotsResult = await db
            .select()
            .from(shots)
            .where(eq(shots.targetId, target.id));

          return {
            ...target,
            shots: shotsResult.map((s) => ({
              xInches: s.xInches,
              yInches: s.yInches,
              sequenceNumber: s.shotNumber ?? 0,
            })),
          };
        })
      );

      // Load session firearms with ammo
      const sfResult = await db
        .select()
        .from(sessionFirearms)
        .where(eq(sessionFirearms.sessionId, sessionId));

      // For simplicity, we'll return basic data
      // A full implementation would join with firearms and ammo tables

      let totalRounds = 0;
      for (const sf of sfResult) {
        const ammoResult = await db
          .select()
          .from(sessionAmmo)
          .where(eq(sessionAmmo.sessionFirearmId, sf.id));
        totalRounds += ammoResult.reduce((sum, a) => sum + a.roundsFired, 0);
      }

      return {
        ...session,
        firearms: [], // Simplified - would need joins for full data
        targets: targetsWithShots,
        totalRounds,
      };
    } catch (error) {
      console.error('[SessionStore] Failed to load session details:', error);
      return null;
    }
  },

  deleteSession: async (id) => {
    set({ error: null });
    try {
      await db.delete(sessions).where(eq(sessions.id, id));
      await get().loadSessions();
    } catch (error) {
      console.error('[SessionStore] Failed to delete session:', error);
      set({ error: 'Failed to delete session' });
    }
  },

  getHeatmapData: async () => {
    try {
      const result = await db.select().from(sessions);

      // Group by date
      const dateMap = new Map<string, number>();
      for (const session of result) {
        const date = session.date.split('T')[0]; // Normalize to YYYY-MM-DD
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }

      return Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error('[SessionStore] Failed to get heatmap data:', error);
      return [];
    }
  },

  getDashboardStats: async () => {
    try {
      const sessionsResult = await db.select().from(sessions);
      const targetsResult = await db.select().from(targets);

      // Calculate total rounds (sum from session_ammo)
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
          // Gap in streak
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
      console.error('[SessionStore] Failed to get dashboard stats:', error);
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

// Helper function
function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
