import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { goals, drills, drillAttempts } from '@/db/schema';
import type { Goal, NewGoal } from '@/types';
import type { GoalProgress } from '@/types';
import { generateId } from '@/lib/utils';
import { calculatePersonalBest, getAttemptValue, calculateGoalProgress, isGoalAchieved } from '@/lib/drillUtils';

interface GoalsState {
  // Cached data
  goals: Goal[];
  goalProgress: Map<string, GoalProgress>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Goal CRUD
  loadGoals: () => Promise<void>;
  addGoal: (data: Omit<NewGoal, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'completedAt'>) => Promise<string>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;

  // Analytics
  loadGoalProgress: (goalId: string) => Promise<GoalProgress | null>;
  loadAllGoalProgress: () => Promise<void>;
  getActiveGoalsCount: () => number;
  getCompletedGoalsCount: () => number;

  // Utility
  clearError: () => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  goalProgress: new Map(),
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db
        .select()
        .from(goals)
        .orderBy(goals.isCompleted, desc(goals.createdAt));
      set({ goals: result, isLoading: false });

      // Also load progress for linked goals
      await get().loadAllGoalProgress();
    } catch (error) {
      console.error('[GoalsStore] Failed to load goals:', error);
      set({ error: 'Failed to load goals', isLoading: false });
    }
  },

  addGoal: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(goals).values({
        id,
        ...data,
        isCompleted: false,
      });
      await get().loadGoals();
      return id;
    } catch (error) {
      console.error('[GoalsStore] Failed to add goal:', error);
      set({ error: 'Failed to add goal' });
      throw error;
    }
  },

  updateGoal: async (id, data) => {
    set({ error: null });
    try {
      await db
        .update(goals)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(goals.id, id));
      await get().loadGoals();
    } catch (error) {
      console.error('[GoalsStore] Failed to update goal:', error);
      set({ error: 'Failed to update goal' });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    set({ error: null });
    try {
      await db.delete(goals).where(eq(goals.id, id));
      await get().loadGoals();
    } catch (error) {
      console.error('[GoalsStore] Failed to delete goal:', error);
      set({ error: 'Failed to delete goal' });
      throw error;
    }
  },

  toggleComplete: async (id) => {
    set({ error: null });
    try {
      const goal = get().goals.find((g) => g.id === id);
      if (!goal) return;

      const isCompleted = !goal.isCompleted;
      await db
        .update(goals)
        .set({
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(goals.id, id));
      await get().loadGoals();
    } catch (error) {
      console.error('[GoalsStore] Failed to toggle goal:', error);
      set({ error: 'Failed to update goal' });
      throw error;
    }
  },

  loadGoalProgress: async (goalId) => {
    try {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal || !goal.linkedDrillId || goal.targetScore === null) {
        return null;
      }

      // Get the linked drill
      const drillResult = await db
        .select()
        .from(drills)
        .where(eq(drills.id, goal.linkedDrillId));
      const drill = drillResult[0];
      if (!drill) return null;

      // Get attempts for this drill
      const attempts = await db
        .select()
        .from(drillAttempts)
        .where(eq(drillAttempts.drillId, drill.id))
        .orderBy(desc(drillAttempts.createdAt));

      // Calculate personal best
      const pb = calculatePersonalBest(attempts, drill.scoringType);
      const currentBest = pb ? getAttemptValue(pb, drill.scoringType) : null;

      // Calculate progress
      const percentComplete = calculateGoalProgress(
        goal.targetScore,
        currentBest,
        drill.scoringType
      );
      const achieved = isGoalAchieved(goal.targetScore, currentBest, drill.scoringType);

      const progress: GoalProgress = {
        goalId,
        drillId: drill.id,
        drillName: drill.name,
        targetScore: goal.targetScore,
        currentBest,
        percentComplete,
        isAchieved: achieved,
        scoringType: drill.scoringType,
      };

      const progressMap = new Map(get().goalProgress);
      progressMap.set(goalId, progress);
      set({ goalProgress: progressMap });

      return progress;
    } catch (error) {
      console.error('[GoalsStore] Failed to load goal progress:', error);
      return null;
    }
  },

  loadAllGoalProgress: async () => {
    const linkedGoals = get().goals.filter((g) => g.linkedDrillId && g.targetScore !== null);

    for (const goal of linkedGoals) {
      await get().loadGoalProgress(goal.id);
    }
  },

  getActiveGoalsCount: () => {
    return get().goals.filter((g) => !g.isCompleted).length;
  },

  getCompletedGoalsCount: () => {
    return get().goals.filter((g) => g.isCompleted).length;
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for goals
export function useGoals() {
  const store = useGoalsStore();

  return {
    goals: store.goals,
    goalProgress: store.goalProgress,
    isLoading: store.isLoading,
    error: store.error,
    loadGoals: store.loadGoals,
    addGoal: store.addGoal,
    updateGoal: store.updateGoal,
    deleteGoal: store.deleteGoal,
    toggleComplete: store.toggleComplete,
    loadGoalProgress: store.loadGoalProgress,
    getActiveGoalsCount: store.getActiveGoalsCount,
    getCompletedGoalsCount: store.getCompletedGoalsCount,
    clearError: store.clearError,
  };
}
