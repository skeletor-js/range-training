import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { drills, drillAttempts, drillBenchmarks, sessions } from '@/db/schema';
import type { Drill, NewDrill, DrillAttempt, NewDrillAttempt, DrillBenchmark } from '@/types';
import type { DrillWithStats, TrendDataPoint } from '@/types';
import { generateId } from '@/lib/utils';
import { calculatePersonalBest, generateTrendData } from '@/lib/drillUtils';

interface DrillState {
  // Cached data
  drills: Drill[];
  drillsWithStats: DrillWithStats[];
  benchmarks: Map<string, DrillBenchmark[]>;
  attempts: Map<string, DrillAttempt[]>;
  personalBests: Map<string, DrillAttempt | null>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Drill CRUD
  loadDrills: () => Promise<void>;
  loadDrillsWithStats: () => Promise<void>;
  getDrillById: (id: string) => Drill | undefined;
  addDrill: (data: Omit<NewDrill, 'id' | 'isBuiltin' | 'createdAt'>) => Promise<string>;
  updateDrill: (id: string, data: Partial<Drill>) => Promise<void>;
  deleteDrill: (id: string) => Promise<void>;

  // Benchmark operations
  loadBenchmarks: (drillId: string) => Promise<DrillBenchmark[]>;

  // Attempt operations
  loadAttempts: (drillId: string) => Promise<DrillAttempt[]>;
  loadAllAttempts: () => Promise<void>;
  addAttempt: (data: Omit<NewDrillAttempt, 'id' | 'createdAt' | 'sessionId'> & { sessionId?: string | null }) => Promise<string>;
  deleteAttempt: (id: string) => Promise<void>;

  // Analytics
  getPersonalBest: (drillId: string) => DrillAttempt | null;
  getTrendData: (drillId: string) => TrendDataPoint[];

  // Utility
  clearError: () => void;
}

export const useDrillStore = create<DrillState>((set, get) => ({
  drills: [],
  drillsWithStats: [],
  benchmarks: new Map(),
  attempts: new Map(),
  personalBests: new Map(),
  isLoading: false,
  error: null,

  loadDrills: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(drills).orderBy(drills.category, drills.name);
      set({ drills: result, isLoading: false });
    } catch (error) {
      console.error('[DrillStore] Failed to load drills:', error);
      set({ error: 'Failed to load drills', isLoading: false });
    }
  },

  loadDrillsWithStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Load all drills
      const allDrills = await db.select().from(drills).orderBy(drills.category, drills.name);

      // Load all attempts
      const allAttempts = await db.select().from(drillAttempts).orderBy(desc(drillAttempts.createdAt));

      // Group attempts by drill
      const attemptsByDrill = new Map<string, DrillAttempt[]>();
      for (const attempt of allAttempts) {
        const existing = attemptsByDrill.get(attempt.drillId) || [];
        existing.push(attempt);
        attemptsByDrill.set(attempt.drillId, existing);
      }

      // Calculate personal bests for each drill
      const personalBests = new Map<string, DrillAttempt | null>();
      for (const drill of allDrills) {
        const drillAttemptsList = attemptsByDrill.get(drill.id) || [];
        const pb = calculatePersonalBest(drillAttemptsList, drill.scoringType);
        personalBests.set(drill.id, pb);
      }

      // Build drills with stats
      const drillsWithStats: DrillWithStats[] = allDrills.map((drill) => {
        const drillAttemptsList = attemptsByDrill.get(drill.id) || [];
        const pb = personalBests.get(drill.id) || null;
        const lastAttempt = drillAttemptsList[0]; // Already sorted by date desc

        return {
          ...drill,
          attemptCount: drillAttemptsList.length,
          personalBest: pb,
          lastAttemptDate: lastAttempt?.createdAt || null,
        };
      });

      set({
        drills: allDrills,
        drillsWithStats,
        attempts: attemptsByDrill,
        personalBests,
        isLoading: false,
      });
    } catch (error) {
      console.error('[DrillStore] Failed to load drills with stats:', error);
      set({ error: 'Failed to load drills', isLoading: false });
    }
  },

  getDrillById: (id) => {
    return get().drills.find((d) => d.id === id);
  },

  addDrill: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(drills).values({
        id,
        ...data,
        isBuiltin: false,
      });
      await get().loadDrillsWithStats();
      return id;
    } catch (error) {
      console.error('[DrillStore] Failed to add drill:', error);
      set({ error: 'Failed to add drill' });
      throw error;
    }
  },

  updateDrill: async (id, data) => {
    set({ error: null });
    try {
      // Don't allow updating built-in drills
      const drill = get().drills.find((d) => d.id === id);
      if (drill?.isBuiltin) {
        throw new Error('Cannot modify built-in drills');
      }

      await db.update(drills).set(data).where(eq(drills.id, id));
      await get().loadDrillsWithStats();
    } catch (error) {
      console.error('[DrillStore] Failed to update drill:', error);
      set({ error: 'Failed to update drill' });
      throw error;
    }
  },

  deleteDrill: async (id) => {
    set({ error: null });
    try {
      // Don't allow deleting built-in drills
      const drill = get().drills.find((d) => d.id === id);
      if (drill?.isBuiltin) {
        throw new Error('Cannot delete built-in drills');
      }

      await db.delete(drills).where(eq(drills.id, id));
      await get().loadDrillsWithStats();
    } catch (error) {
      console.error('[DrillStore] Failed to delete drill:', error);
      set({ error: 'Failed to delete drill' });
      throw error;
    }
  },

  loadBenchmarks: async (drillId) => {
    try {
      const result = await db
        .select()
        .from(drillBenchmarks)
        .where(eq(drillBenchmarks.drillId, drillId))
        .orderBy(drillBenchmarks.threshold);

      const benchmarksMap = new Map(get().benchmarks);
      benchmarksMap.set(drillId, result);
      set({ benchmarks: benchmarksMap });
      return result;
    } catch (error) {
      console.error('[DrillStore] Failed to load benchmarks:', error);
      return [];
    }
  },

  loadAttempts: async (drillId) => {
    try {
      const result = await db
        .select()
        .from(drillAttempts)
        .where(eq(drillAttempts.drillId, drillId))
        .orderBy(desc(drillAttempts.createdAt));

      const attemptsMap = new Map(get().attempts);
      attemptsMap.set(drillId, result);

      // Update personal best
      const drill = get().drills.find((d) => d.id === drillId);
      const pb = calculatePersonalBest(result, drill?.scoringType || null);
      const pbMap = new Map(get().personalBests);
      pbMap.set(drillId, pb);

      set({ attempts: attemptsMap, personalBests: pbMap });
      return result;
    } catch (error) {
      console.error('[DrillStore] Failed to load attempts:', error);
      set({ error: 'Failed to load attempts' });
      return [];
    }
  },

  loadAllAttempts: async () => {
    try {
      const result = await db.select().from(drillAttempts).orderBy(desc(drillAttempts.createdAt));

      // Group by drill
      const attemptsMap = new Map<string, DrillAttempt[]>();
      for (const attempt of result) {
        const existing = attemptsMap.get(attempt.drillId) || [];
        existing.push(attempt);
        attemptsMap.set(attempt.drillId, existing);
      }

      set({ attempts: attemptsMap });
    } catch (error) {
      console.error('[DrillStore] Failed to load all attempts:', error);
      set({ error: 'Failed to load attempts' });
    }
  },

  addAttempt: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      // If no session provided, create a minimal session for this attempt
      let sessionId = data.sessionId;
      if (!sessionId) {
        sessionId = generateId();
        await db.insert(sessions).values({
          id: sessionId,
          date: new Date().toISOString().split('T')[0],
          location: 'Quick Log',
          notes: 'Auto-created for drill attempt',
        });
      }

      await db.insert(drillAttempts).values({
        id,
        ...data,
        sessionId,
      });

      // Reload attempts for this drill to update PB
      await get().loadAttempts(data.drillId);
      await get().loadDrillsWithStats();

      return id;
    } catch (error) {
      console.error('[DrillStore] Failed to add attempt:', error);
      set({ error: 'Failed to log attempt' });
      throw error;
    }
  },

  deleteAttempt: async (id) => {
    set({ error: null });
    try {
      // Find the attempt to get its drillId
      const allAttempts = Array.from(get().attempts.values()).flat();
      const attempt = allAttempts.find((a) => a.id === id);

      await db.delete(drillAttempts).where(eq(drillAttempts.id, id));

      if (attempt) {
        await get().loadAttempts(attempt.drillId);
      }
      await get().loadDrillsWithStats();
    } catch (error) {
      console.error('[DrillStore] Failed to delete attempt:', error);
      set({ error: 'Failed to delete attempt' });
      throw error;
    }
  },

  getPersonalBest: (drillId) => {
    return get().personalBests.get(drillId) || null;
  },

  getTrendData: (drillId) => {
    const drill = get().drills.find((d) => d.id === drillId);
    const attempts = get().attempts.get(drillId) || [];
    return generateTrendData(attempts, drill?.scoringType || null);
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for drill library with auto-load
export function useDrills() {
  const store = useDrillStore();

  return {
    drills: store.drills,
    drillsWithStats: store.drillsWithStats,
    isLoading: store.isLoading,
    error: store.error,
    loadDrills: store.loadDrills,
    loadDrillsWithStats: store.loadDrillsWithStats,
    getDrillById: store.getDrillById,
    addDrill: store.addDrill,
    updateDrill: store.updateDrill,
    deleteDrill: store.deleteDrill,
    clearError: store.clearError,
  };
}

// Helper hook for drill attempts
export function useDrillAttempts() {
  const store = useDrillStore();

  return {
    attempts: store.attempts,
    personalBests: store.personalBests,
    benchmarks: store.benchmarks,
    isLoading: store.isLoading,
    error: store.error,
    loadAttempts: store.loadAttempts,
    loadAllAttempts: store.loadAllAttempts,
    loadBenchmarks: store.loadBenchmarks,
    addAttempt: store.addAttempt,
    deleteAttempt: store.deleteAttempt,
    getPersonalBest: store.getPersonalBest,
    getTrendData: store.getTrendData,
    clearError: store.clearError,
  };
}
