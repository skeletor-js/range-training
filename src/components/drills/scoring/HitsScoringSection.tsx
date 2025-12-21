import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Drill } from '@/types';

interface HitsScoringData {
  hits: number | null;
  misses: number | null;
}

interface HitsScoringProps {
  drill: Drill;
  data: HitsScoringData;
  errors: Record<string, string>;
  onChange: (updates: Partial<HitsScoringData>) => void;
}

export function HitsScoringSection({
  drill,
  data,
  errors,
  onChange,
}: HitsScoringProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hits">Hits *</Label>
        <Input
          id="hits"
          type="number"
          min={0}
          max={drill.roundCount}
          value={data.hits ?? ''}
          onChange={(e) =>
            onChange({
              hits: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder={`Max: ${drill.roundCount}`}
        />
        {errors.hits && (
          <p className="text-xs text-destructive">{errors.hits}</p>
        )}
      </div>

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
