import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  sessions,
  sessionFirearms,
  sessionAmmo,
  targets,
  shots,
} from '@/db/schema';
import type { Session, SessionWithDetails, TargetWithShots } from '@/types';

interface SessionListState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  loadSessions: () => Promise<void>;
  loadSessionDetails: (sessionId: string) => Promise<SessionWithDetails | null>;
  deleteSession: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSessionListStore = create<SessionListState>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db
        .select()
        .from(sessions)
        .orderBy(desc(sessions.date));
      set({ sessions: result, isLoading: false });
    } catch (error) {
      console.error('[SessionListStore] Failed to load sessions:', error);
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
        firearms: [],
        targets: targetsWithShots,
        totalRounds,
      };
    } catch (error) {
      console.error('[SessionListStore] Failed to load session details:', error);
      return null;
    }
  },

  deleteSession: async (id) => {
    set({ error: null });
    try {
      await db.delete(sessions).where(eq(sessions.id, id));
      await get().loadSessions();
    } catch (error) {
      console.error('[SessionListStore] Failed to delete session:', error);
      set({ error: 'Failed to delete session' });
    }
  },

  clearError: () => set({ error: null }),
}));
