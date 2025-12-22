import type { DrillWithStats, TargetWithShots } from '@/types';
import type { DrillAttempt, Firearm } from '@/db/schema';

export interface TrainingRecommendation {
  id: string;
  drillId: string;
  drillName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'speed' | 'accuracy' | 'movement' | 'reload' | 'other';
  platform: 'handgun' | 'carbine' | 'both' | null;
}

interface AnalysisData {
  recentTargets: TargetWithShots[];
  drillAttempts: DrillAttempt[];
  drills: DrillWithStats[];
  firearms: Firearm[];
}

interface PerformanceInsights {
  averageGroupSize: number | null; // inches
  averagePoaOffset: number | null; // inches from center
  categoryPerformance: Record<string, { attempts: number; trend: 'improving' | 'declining' | 'stable' }>;
  neglectedCategories: string[];
  platformPreference: 'handgun' | 'carbine' | 'mixed' | null;
}

/**
 * Analyze user's recent performance data
 */
function analyzePerformance(data: AnalysisData): PerformanceInsights {
  const { recentTargets, drillAttempts, drills, firearms } = data;

  // Calculate average group size from recent targets
  const targetsWithSpread = recentTargets.filter((t) => t.extremeSpread !== null);
  const averageGroupSize =
    targetsWithSpread.length > 0
      ? targetsWithSpread.reduce((sum, t) => sum + (t.extremeSpread ?? 0), 0) / targetsWithSpread.length
      : null;

  // Calculate average POA offset (how far groups are from center)
  const targetsWithCenter = recentTargets.filter((t) => t.groupCenterX !== null && t.groupCenterY !== null);
  const averagePoaOffset =
    targetsWithCenter.length > 0
      ? targetsWithCenter.reduce((sum, t) => {
          const x = t.groupCenterX ?? 0;
          const y = t.groupCenterY ?? 0;
          return sum + Math.sqrt(x * x + y * y);
        }, 0) / targetsWithCenter.length
      : null;

  // Analyze drill category performance
  const categoryPerformance: PerformanceInsights['categoryPerformance'] = {};
  const allCategories = ['speed', 'accuracy', 'movement', 'reload', 'other'];

  for (const category of allCategories) {
    const categoryDrills = drills.filter((d) => d.category === category);
    const categoryAttempts = drillAttempts.filter((a) =>
      categoryDrills.some((d) => d.id === a.drillId)
    );

    if (categoryAttempts.length === 0) {
      continue;
    }

    // Determine trend (simplified for now)
    const trend: 'improving' | 'declining' | 'stable' = 'stable';

    categoryPerformance[category] = {
      attempts: categoryAttempts.length,
      trend,
    };
  }

  // Find neglected categories (no recent attempts)
  const neglectedCategories = allCategories.filter((cat) => !categoryPerformance[cat]);

  // Determine platform preference based on firearms owned
  let platformPreference: PerformanceInsights['platformPreference'] = null;
  if (firearms.length > 0) {
    const handguns = firearms.filter((f) => f.type === 'handgun' || f.type === 'air_pistol');
    const longGuns = firearms.filter(
      (f) => f.type === 'rifle' || f.type === 'sbr' || f.type === 'pcc' || f.type === 'air_rifle'
    );

    if (handguns.length > 0 && longGuns.length === 0) {
      platformPreference = 'handgun';
    } else if (longGuns.length > 0 && handguns.length === 0) {
      platformPreference = 'carbine';
    } else if (handguns.length > 0 && longGuns.length > 0) {
      platformPreference = 'mixed';
    }
  }

  return {
    averageGroupSize,
    averagePoaOffset,
    categoryPerformance,
    neglectedCategories,
    platformPreference,
  };
}

/**
 * Generate training recommendations based on analysis
 */
export function generateRecommendations(data: AnalysisData): TrainingRecommendation[] {
  const insights = analyzePerformance(data);
  const recommendations: TrainingRecommendation[] = [];
  const { drills } = data;

  // Filter drills by platform preference
  const platformFilter = (drill: DrillWithStats) => {
    if (!drill.platform || drill.platform === 'both') return true;
    if (insights.platformPreference === 'mixed') return true;
    if (!insights.platformPreference) return true;
    return drill.platform === insights.platformPreference;
  };

  // Recommendation: Large group sizes suggest accuracy work
  if (insights.averageGroupSize !== null && insights.averageGroupSize > 3) {
    const accuracyDrills = drills
      .filter((d) => d.category === 'accuracy' && platformFilter(d))
      .slice(0, 2);

    for (const drill of accuracyDrills) {
      recommendations.push({
        id: `accuracy-${drill.id}`,
        drillId: drill.id,
        drillName: drill.name,
        reason: `Your recent groups average ${insights.averageGroupSize.toFixed(1)}" - tighten up with focused accuracy work`,
        priority: insights.averageGroupSize > 5 ? 'high' : 'medium',
        category: 'accuracy',
        platform: drill.platform,
      });
    }
  }

  // Recommendation: POA offset suggests sight alignment or trigger issues
  if (insights.averagePoaOffset !== null && insights.averagePoaOffset > 2) {
    const speedDrills = drills
      .filter((d) => d.category === 'speed' && platformFilter(d))
      .slice(0, 1);

    for (const drill of speedDrills) {
      recommendations.push({
        id: `poa-${drill.id}`,
        drillId: drill.id,
        drillName: drill.name,
        reason: `Groups are ${insights.averagePoaOffset.toFixed(1)}" off-center - work on sight alignment and trigger control`,
        priority: 'medium',
        category: 'speed',
        platform: drill.platform,
      });
    }
  }

  // Recommendation: Neglected categories
  for (const category of insights.neglectedCategories) {
    const categoryDrills = drills
      .filter(
        (d) =>
          d.category === category &&
          platformFilter(d) &&
          !recommendations.some((r) => r.drillId === d.id)
      )
      .slice(0, 1);

    for (const drill of categoryDrills) {
      recommendations.push({
        id: `neglected-${drill.id}`,
        drillId: drill.id,
        drillName: drill.name,
        reason: `You haven't practiced ${category} drills recently - build a well-rounded skill set`,
        priority: 'low',
        category: category as TrainingRecommendation['category'],
        platform: drill.platform,
      });
    }
  }

  // Recommendation: Practice drills you're close to improving on
  const closeToImprovement = drills
    .filter((d) => {
      if (!d.personalBest || !platformFilter(d)) return false;
      // Look for drills with recent attempts
      return d.attemptCount >= 3;
    })
    .slice(0, 2);

  for (const drill of closeToImprovement) {
    if (!recommendations.some((r) => r.drillId === drill.id)) {
      recommendations.push({
        id: `practice-${drill.id}`,
        drillId: drill.id,
        drillName: drill.name,
        reason: `You've done ${drill.attemptCount} attempts - keep practicing to improve your personal best`,
        priority: 'medium',
        category: drill.category ?? 'other',
        platform: drill.platform,
      });
    }
  }

  // Recommendation: Try new drills
  const untriedDrills = drills
    .filter((d) => d.attemptCount === 0 && platformFilter(d))
    .slice(0, 2);

  for (const drill of untriedDrills) {
    if (!recommendations.some((r) => r.drillId === drill.id)) {
      recommendations.push({
        id: `new-${drill.id}`,
        drillId: drill.id,
        drillName: drill.name,
        reason: `Try something new to test your skills in different scenarios`,
        priority: 'low',
        category: drill.category ?? 'other',
        platform: drill.platform,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 5 recommendations
  return recommendations.slice(0, 5);
}

/**
 * Get a quick tip based on performance
 */
export function getQuickTip(insights: {
  averageGroupSize: number | null;
  averagePoaOffset: number | null;
}): string | null {
  if (insights.averageGroupSize !== null && insights.averageGroupSize > 4) {
    return 'Focus on smooth trigger press and follow-through to tighten your groups.';
  }
  if (insights.averagePoaOffset !== null && insights.averagePoaOffset > 2) {
    return 'Check your sight alignment and grip pressure - groups are drifting from point of aim.';
  }
  return null;
}
