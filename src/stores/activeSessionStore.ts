import { create } from 'zustand';
import { eq, sql } from 'drizzle-orm';
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
import type { ActiveSession, CapturedTarget } from '@/types';
import { generateId } from '@/lib/utils';

interface ActiveSessionState {
  activeSession: ActiveSession | null;
  isLoading: boolean;
  error: string | null;

  startSession: (date?: string, location?: string) => void;
  updateActiveSession: (updates: Partial<ActiveSession>) => void;
  addFirearmToSession: (firearmId: string) => void;
  removeFirearmFromSession: (firearmId: string) => void;
  recordAmmoUsage: (firearmId: string, ammoId: string, rounds: number) => void;
  addTarget: (target: CapturedTarget) => void;
  removeTarget: (tempId: string) => void;
  saveSession: () => Promise<string | null>;
  discardSession: () => void;
  clearError: () => void;
}

export const useActiveSessionStore = create<ActiveSessionState>((set, get) => ({
  activeSession: null,
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

      return sessionId;
    } catch (error) {
      console.error('[ActiveSessionStore] Failed to save session:', error);
      set({ error: 'Failed to save session', isLoading: false });
      return null;
    }
  },

  discardSession: () => {
    set({ activeSession: null });
  },

  clearError: () => set({ error: null }),
}));
