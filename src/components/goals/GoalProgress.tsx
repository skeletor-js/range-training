import { formatDrillValue } from '@/lib/drillUtils';
import type { GoalProgress as GoalProgressType } from '@/types';

interface GoalProgressProps {
  progress: GoalProgressType;
}

export function GoalProgress({ progress }: GoalProgressProps) {
  const currentLabel = formatDrillValue(progress.currentBest, progress.scoringType);
  const targetLabel = formatDrillValue(progress.targetScore, progress.scoringType);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {currentLabel} / {targetLabel}
        </span>
        <span
          className={
            progress.isAchieved ? 'text-green-600 font-medium' : 'text-muted-foreground'
          }
        >
          {progress.isAchieved ? 'Achieved!' : `${Math.round(progress.percentComplete)}%`}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            progress.isAchieved ? 'bg-green-600' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(100, progress.percentComplete)}%` }}
        />
      </div>
    </div>
  );
}
