type ScoringType = 'time' | 'points' | 'pass_fail' | 'hits';

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(
  targetScore: number,
  currentBest: number | null,
  scoringType: ScoringType | null
): number {
  if (currentBest === null || !scoringType) return 0;

  switch (scoringType) {
    case 'time':
      // For time, lower is better, so progress = target / current
      // If current is already better than target, return 100
      if (currentBest <= targetScore) return 100;
      // Progress increases as current gets closer to target
      return Math.min(100, (targetScore / currentBest) * 100);

    case 'points':
    case 'hits':
      // For points/hits, higher is better
      if (currentBest >= targetScore) return 100;
      return Math.min(100, (currentBest / targetScore) * 100);

    case 'pass_fail':
      // Binary - either passed or not
      return currentBest === 1 ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Check if a goal is achieved based on current best and target
 */
export function isGoalAchieved(
  targetScore: number,
  currentBest: number | null,
  scoringType: ScoringType | null
): boolean {
  if (currentBest === null || !scoringType) return false;

  switch (scoringType) {
    case 'time':
      // For time, lower is better
      return currentBest <= targetScore;

    case 'points':
    case 'hits':
      // For points/hits, higher is better
      return currentBest >= targetScore;

    case 'pass_fail':
      return currentBest === 1;

    default:
      return false;
  }
}
