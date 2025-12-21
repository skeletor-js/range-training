import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TimeScoringSection,
  PointsScoringSection,
  HitsScoringSection,
  PassFailScoringSection,
} from './scoring';
import { drillAttemptSchema, type DrillAttemptFormData } from '@/lib/validations';
import type { Drill, Firearm, Ammo } from '@/types';

interface DrillAttemptFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drill: Drill;
  firearms?: Firearm[];
  ammo?: Ammo[];
  onSave: (data: DrillAttemptFormData) => Promise<void>;
}

export function DrillAttemptForm({
  open,
  onOpenChange,
  drill,
  firearms = [],
  ammo = [],
  onSave,
}: DrillAttemptFormProps) {
  const [formData, setFormData] = useState<DrillAttemptFormData>({
    drillId: drill.id,
    sessionId: null,
    timeSeconds: null,
    points: null,
    hits: null,
    misses: null,
    passed: null,
    targetId: null,
    firearmId: null,
    ammoId: null,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [useTimer, setUseTimer] = useState(drill.scoringType === 'time');

  useEffect(() => {
    setFormData({
      drillId: drill.id,
      sessionId: null,
      timeSeconds: null,
      points: null,
      hits: drill.scoringType === 'hits' ? drill.roundCount : null,
      misses: null,
      passed: null,
      targetId: null,
      firearmId: null,
      ammoId: null,
      notes: '',
    });
    setErrors({});
  }, [drill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = drillAttemptSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!newErrors[path]) {
          newErrors[path] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    // Validate based on scoring type
    if (drill.scoringType === 'time' && !formData.timeSeconds) {
      setErrors({ timeSeconds: 'Time is required' });
      return;
    }
    if (drill.scoringType === 'points' && formData.points === null) {
      setErrors({ points: 'Points are required' });
      return;
    }
    if (drill.scoringType === 'hits' && formData.hits === null) {
      setErrors({ hits: 'Hit count is required' });
      return;
    }
    if (drill.scoringType === 'pass_fail' && formData.passed === null) {
      setErrors({ passed: 'Pass/Fail is required' });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(result.data);
      onOpenChange(false);
    } catch {
      setErrors({ form: 'Failed to log attempt' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter ammo by selected firearm's caliber
  const selectedFirearm = firearms.find((f) => f.id === formData.firearmId);
  const filteredAmmo = selectedFirearm
    ? ammo.filter((a) => a.caliber === selectedFirearm.caliber)
    : ammo;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle>Log Attempt: {drill.name}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            {/* Time-based scoring */}
            {drill.scoringType === 'time' && (
              <TimeScoringSection
                drill={drill}
                data={{ timeSeconds: formData.timeSeconds ?? null, misses: formData.misses ?? null }}
                errors={errors}
                useTimer={useTimer}
                onUseTimerChange={setUseTimer}
                onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
              />
            )}

            {/* Points-based scoring */}
            {drill.scoringType === 'points' && (
              <PointsScoringSection
                drill={drill}
                points={formData.points ?? null}
                error={errors.points}
                onChange={(points) => setFormData((prev) => ({ ...prev, points }))}
              />
            )}

            {/* Hits-based scoring */}
            {drill.scoringType === 'hits' && (
              <HitsScoringSection
                drill={drill}
                data={{ hits: formData.hits ?? null, misses: formData.misses ?? null }}
                errors={errors}
                onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
              />
            )}

            {/* Pass/Fail scoring */}
            {drill.scoringType === 'pass_fail' && (
              <PassFailScoringSection
                passed={formData.passed ?? null}
                error={errors.passed}
                onChange={(passed) => setFormData((prev) => ({ ...prev, passed }))}
              />
            )}

            {/* Optional: Firearm selection */}
            {firearms.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="firearmId">Firearm (optional)</Label>
                <Select
                  value={formData.firearmId ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      firearmId: value || null,
                      ammoId: null, // Reset ammo when firearm changes
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select firearm" />
                  </SelectTrigger>
                  <SelectContent>
                    {firearms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.caliber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Optional: Ammo selection */}
            {filteredAmmo.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="ammoId">Ammo (optional)</Label>
                <Select
                  value={formData.ammoId ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, ammoId: value || null }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ammo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAmmo.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.brand} {a.caliber} {a.grainWeight}gr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any notes about this attempt..."
                rows={2}
              />
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Log Attempt'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
