import { Trophy, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDrillValue, formatFullDate } from '@/lib/drillUtils';
import type { DrillAttempt, Firearm, Ammo } from '@/types';

interface DrillAttemptCardProps {
  attempt: DrillAttempt;
  scoringType: 'time' | 'points' | 'pass_fail' | 'hits' | null;
  isPB?: boolean;
  firearm?: Firearm | null;
  ammo?: Ammo | null;
  onDelete?: (attempt: DrillAttempt) => void;
}

export function DrillAttemptCard({
  attempt,
  scoringType,
  isPB = false,
  firearm,
  ammo,
  onDelete,
}: DrillAttemptCardProps) {
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
    <Card className={isPB ? 'border-primary' : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`text-xl font-bold ${isPB ? 'text-primary' : ''}`}
            >
              {formatDrillValue(value, scoringType)}
            </div>
            {isPB && <Trophy className="h-4 w-4 text-primary" />}
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(attempt)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{formatFullDate(attempt.createdAt!)}</span>
          {firearm && (
            <>
              <span>•</span>
              <span>{firearm.name}</span>
            </>
          )}
          {ammo && (
            <>
              <span>•</span>
              <span>
                {ammo.brand} {ammo.grainWeight}gr
              </span>
            </>
          )}
        </div>

        {scoringType === 'time' && attempt.misses !== null && attempt.misses > 0 && (
          <div className="mt-1 text-sm text-destructive">
            {attempt.misses} miss{attempt.misses !== 1 ? 'es' : ''}
          </div>
        )}

        {attempt.notes && (
          <p className="mt-2 text-sm text-muted-foreground">{attempt.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
