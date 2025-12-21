import { Timer, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RetroLEDTimer } from '@/components/timer';
import type { Drill } from '@/types';

interface TimeScoringData {
  timeSeconds: number | null;
  misses: number | null;
}

interface TimeScoringProps {
  drill: Drill;
  data: TimeScoringData;
  errors: Record<string, string>;
  useTimer: boolean;
  onUseTimerChange: (useTimer: boolean) => void;
  onChange: (updates: Partial<TimeScoringData>) => void;
}

export function TimeScoringSection({
  drill,
  data,
  errors,
  useTimer,
  onUseTimerChange,
  onChange,
}: TimeScoringProps) {
  return (
    <div className="space-y-4">
      {/* Timer/Manual toggle */}
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <Button
          type="button"
          variant={useTimer ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => onUseTimerChange(true)}
        >
          <Timer className="h-4 w-4 mr-2" />
          Use Timer
        </Button>
        <Button
          type="button"
          variant={!useTimer ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => onUseTimerChange(false)}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      {useTimer ? (
        /* Retro LED Timer */
        <div className="flex flex-col items-center py-4">
          <RetroLEDTimer
            mode={drill.parTime ? 'countdown' : 'stopwatch'}
            initialSeconds={drill.parTime || 0}
            parTime={drill.parTime || undefined}
            color="amber"
            size="md"
            onTimeCapture={(seconds) =>
              onChange({ timeSeconds: Math.round(seconds * 100) / 100 })
            }
          />
          {data.timeSeconds != null && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Captured Time</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {data.timeSeconds?.toFixed(2)}s
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Manual time input */
        <div className="space-y-2">
          <Label htmlFor="timeSeconds">Time (seconds) *</Label>
          <Input
            id="timeSeconds"
            type="number"
            min={0}
            step={0.01}
            value={data.timeSeconds ?? ''}
            onChange={(e) =>
              onChange({
                timeSeconds: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="e.g., 2.35"
          />
        </div>
      )}

      {errors.timeSeconds && (
        <p className="text-xs text-destructive">{errors.timeSeconds}</p>
      )}

      {/* Misses field */}
      <div className="space-y-2">
        <Label htmlFor="misses">Misses</Label>
        <Input
          id="misses"
          type="number"
          min={0}
          value={data.misses ?? ''}
          onChange={(e) =>
            onChange({
              misses: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="0"
        />
      </div>
    </div>
  );
}
