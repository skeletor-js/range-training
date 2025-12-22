import { create } from 'zustand';
import { db } from '@/db';
import { targets, shots, drillAttempts, drills, firearms } from '@/db/schema';
import type { Target, Shot, DrillAttempt, Drill, Firearm } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { generateRecommendations, type TrainingRecommendation } from '@/lib/recommendations';
import type { DrillWithStats, TargetWithShots, InchShot } from '@/types';

interface RecommendationState {
  recommendations: TrainingRecommendation[];
  recentTargets: TargetWithShots[];
  isLoading: boolean;
  error: string | null;
  loadRecommendations: () => Promise<void>;
  clearError: () => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendations: [],
  recentTargets: [],
  isLoading: false,
  error: null,

  loadRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get recent targets (last 30 days or last 20 targets)
      const recentTargetsRaw: Target[] = await db
        .select()
        .from(targets)
        .orderBy(desc(targets.createdAt))
        .limit(20);

      // Get shots for each target
      const recentTargets: TargetWithShots[] = await Promise.all(
        recentTargetsRaw.map(async (target: Target) => {
          const targetShots: Shot[] = await db
            .select()
            .from(shots)
            .where(eq(shots.targetId, target.id));

          const shotData: InchShot[] = targetShots.map((s: Shot) => ({
            xInches: s.xInches,
            yInches: s.yInches,
            sequenceNumber: s.shotNumber ?? 0,
          }));

          return {
            ...target,
            shots: shotData,
          };
        })
      );

      // Get all drill attempts
      const allAttempts: DrillAttempt[] = await db
        .select()
        .from(drillAttempts)
        .orderBy(desc(drillAttempts.createdAt));

      // Get all drills with stats
      const allDrills: Drill[] = await db.select().from(drills);

      const drillsWithStats: DrillWithStats[] = allDrills.map((drill: Drill) => {
        const attempts = allAttempts.filter((a: DrillAttempt) => a.drillId === drill.id);

        // Find personal best based on scoring type
        let personalBest: DrillAttempt | null = null;
        if (attempts.length > 0) {
          if (drill.scoringType === 'time') {
            personalBest = attempts.reduce((best: DrillAttempt, curr: DrillAttempt) => {
              if (!curr.timeSeconds) return best;
              if (!best || !best.timeSeconds) return curr;
              return curr.timeSeconds < best.timeSeconds ? curr : best;
            }, attempts[0]);
          } else if (drill.scoringType === 'points') {
            personalBest = attempts.reduce((best: DrillAttempt, curr: DrillAttempt) => {
              if (!curr.points) return best;
              if (!best || !best.points) return curr;
              return curr.points > best.points ? curr : best;
            }, attempts[0]);
          } else if (drill.scoringType === 'hits') {
            personalBest = attempts.reduce((best: DrillAttempt, curr: DrillAttempt) => {
              if (!curr.hits) return best;
              if (!best || !best.hits) return curr;
              return curr.hits > best.hits ? curr : best;
            }, attempts[0]);
          }
        }

        return {
          id: drill.id,
          name: drill.name,
          description: drill.description,
          category: drill.category,
          scoringType: drill.scoringType,
          platform: drill.platform,
          parTime: drill.parTime,
          maxPoints: drill.maxPoints,
          roundCount: drill.roundCount,
          targetCount: drill.targetCount,
          distanceYards: drill.distanceYards,
          isBuiltin: drill.isBuiltin,
          createdAt: drill.createdAt,
          attemptCount: attempts.length,
          personalBest,
          lastAttemptDate: attempts.length > 0 ? attempts[0].createdAt : null,
        };
      });

      // Get user's firearms
      const userFirearms: Firearm[] = await db.select().from(firearms);

      // Generate recommendations
      const recs = generateRecommendations({
        recentTargets,
        drillAttempts: allAttempts,
        drills: drillsWithStats,
        firearms: userFirearms,
      });

      set({ recommendations: recs, recentTargets, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load recommendations',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
