import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDrillValue } from '@/lib/drillUtils';
import type { DrillAttempt } from '@/types';

interface PersonalBestBadgeProps {
  attempt: DrillAttempt | null;
  scoringType: 'time' | 'points' | 'pass_fail' | 'hits' | null;
  showIcon?: boolean;
  className?: string;
}

export function PersonalBestBadge({
  attempt,
  scoringType,
  showIcon = true,
  className,
}: PersonalBestBadgeProps) {
  if (!attempt) return null;

  const value =
    scoringType === 'time'
      ? attempt.timeSeconds
      : scoringType === 'points'
        ? attempt.points
        : scoringType === 'hits'
          ? attempt.hits
          : attempt.passed
            ? 1
            : 0;

  return (
    <Badge variant="default" className={className}>
      {showIcon && <Trophy className="h-3 w-3 mr-1" />}
      <span className="font-semibold">{formatDrillValue(value, scoringType)}</span>
    </Badge>
  );
}
