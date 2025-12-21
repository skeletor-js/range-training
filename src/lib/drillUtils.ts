import type { DrillAttempt } from '@/db/schema';

type ScoringType = 'time' | 'points' | 'pass_fail' | 'hits';

/**
 * Calculate the personal best attempt for a drill based on its scoring type
 */
export function calculatePersonalBest(
  attempts: DrillAttempt[],
  scoringType: ScoringType | null
): DrillAttempt | null {
  if (attempts.length === 0 || !scoringType) return null;

  switch (scoringType) {
    case 'time':
      // Lowest time with all hits (misses === 0 or null)
      const validTimeAttempts = attempts.filter(
        (a) => a.timeSeconds != null && (a.misses === 0 || a.misses === null)
      );
      if (validTimeAttempts.length === 0) return null;
      return validTimeAttempts.reduce((best, current) =>
        current.timeSeconds! < best.timeSeconds! ? current : best
      );

    case 'points':
      // Highest points
      const validPointsAttempts = attempts.filter((a) => a.points != null);
      if (validPointsAttempts.length === 0) return null;
      return validPointsAttempts.reduce((best, current) =>
        current.points! > best.points! ? current : best
      );

    case 'hits':
      // Highest hits count
      const validHitsAttempts = attempts.filter((a) => a.hits != null);
      if (validHitsAttempts.length === 0) return null;
      return validHitsAttempts.reduce((best, current) =>
        current.hits! > best.hits! ? current : best
      );

    case 'pass_fail':
      // Most recent pass
      const passedAttempts = attempts.filter((a) => a.passed === true);
      if (passedAttempts.length === 0) return null;
      return passedAttempts.reduce((best, current) =>
        new Date(current.createdAt!) > new Date(best.createdAt!) ? current : best
      );

    default:
      return null;
  }
}

/**
 * Get the primary value from an attempt based on scoring type
 */
export function getAttemptValue(
  attempt: DrillAttempt,
  scoringType: ScoringType | null
): number | null {
  if (!scoringType) return null;

  switch (scoringType) {
    case 'time':
      return attempt.timeSeconds;
    case 'points':
      return attempt.points;
    case 'hits':
      return attempt.hits;
    case 'pass_fail':
      return attempt.passed ? 1 : 0;
    default:
      return null;
  }
}

/**
 * Check if a value is better than another based on scoring type
 */
export function isValueBetterThan(
  value: number | null,
  currentBest: number | null,
  scoringType: ScoringType
): boolean {
  if (value === null) return false;
  if (currentBest === null) return true;

  switch (scoringType) {
    case 'time':
      // Lower is better for time
      return value < currentBest;
    case 'points':
    case 'hits':
      // Higher is better for points and hits
      return value > currentBest;
    case 'pass_fail':
      // Any pass is "better" than no pass
      return value === 1 && currentBest === 0;
    default:
      return false;
  }
}

/**
 * Check if an attempt is a new personal best
 */
export function isNewPersonalBest(
  attempt: DrillAttempt,
  currentPB: DrillAttempt | null,
  scoringType: ScoringType | null
): boolean {
  if (!scoringType) return false;
  if (!currentPB) return true;

  const attemptValue = getAttemptValue(attempt, scoringType);
  const pbValue = getAttemptValue(currentPB, scoringType);

  return isValueBetterThan(attemptValue, pbValue, scoringType);
}
