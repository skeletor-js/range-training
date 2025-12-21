import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Drill } from '@/types';

interface PointsScoringProps {
  drill: Drill;
  points: number | null;
  error?: string;
  onChange: (points: number | null) => void;
}

export function PointsScoringSection({
  drill,
  points,
  error,
  onChange,
}: PointsScoringProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="points">Points *</Label>
      <Input
        id="points"
        type="number"
        min={0}
        max={drill.maxPoints ?? undefined}
        value={points ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? parseInt(e.target.value) : null)
        }
        placeholder={drill.maxPoints ? `Max: ${drill.maxPoints}` : 'Enter points'}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
