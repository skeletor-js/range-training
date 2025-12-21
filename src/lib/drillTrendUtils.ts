import type { DrillAttempt } from '@/db/schema';
import type { TrendDataPoint } from '@/types';
import { getAttemptValue, isValueBetterThan } from './drillUtils';

type ScoringType = 'time' | 'points' | 'pass_fail' | 'hits';

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
