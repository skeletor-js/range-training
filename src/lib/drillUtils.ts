import type { DrillAttempt } from '@/db/schema';
import type { TrendDataPoint } from '@/types';

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
function isValueBetterThan(
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

/**
 * Generate trend data points for charting from a list of attempts
 */
export function generateTrendData(
  attempts: DrillAttempt[],
  scoringType: ScoringType | null
): TrendDataPoint[] {
  if (!scoringType || attempts.length === 0) return [];

  // Sort by date ascending
  const sorted = [...attempts].sort(
    (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  let currentBest: number | null = null;

  return sorted
    .map((attempt) => {
      const value = getAttemptValue(attempt, scoringType);
      if (value === null) return null;

      const isPB = isValueBetterThan(value, currentBest, scoringType);
      if (isPB) currentBest = value;

      return {
        date: attempt.createdAt!,
        value,
        isPB,
        attemptId: attempt.id,
      };
    })
    .filter((point): point is TrendDataPoint => point !== null);
}

/**
 * Format a drill value for display based on scoring type
 */
export function formatDrillValue(
  value: number | null | undefined,
  scoringType: ScoringType | null
): string {
  if (value === null || value === undefined) return '-';
  if (!scoringType) return String(value);

  switch (scoringType) {
    case 'time':
      return `${value.toFixed(2)}s`;
    case 'points':
      return `${value} pts`;
    case 'hits':
      return `${value} hits`;
    case 'pass_fail':
      return value === 1 ? 'Pass' : 'Fail';
    default:
      return String(value);
  }
}

/**
 * Format a date for display in charts
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a full date for tooltips
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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
