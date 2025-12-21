import { useState, useEffect } from 'react';
import { Timer, Keyboard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RetroLEDTimer } from '@/components/timer';
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
              <div className="space-y-4">
                {/* Timer/Manual toggle */}
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Button
                    type="button"
                    variant={useTimer ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setUseTimer(true)}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Use Timer
                  </Button>
                  <Button
                    type="button"
                    variant={!useTimer ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setUseTimer(false)}
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
                        setFormData((prev) => ({
                          ...prev,
                          timeSeconds: Math.round(seconds * 100) / 100,
                        }))
                      }
                    />
                    {formData.timeSeconds != null && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">Captured Time</p>
                        <p className="text-2xl font-mono font-bold text-primary">
                          {formData.timeSeconds?.toFixed(2)}s
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
                      value={formData.timeSeconds ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          timeSeconds: e.target.value ? parseFloat(e.target.value) : null,
                        }))
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
                    value={formData.misses ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        misses: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Points-based scoring */}
            {drill.scoringType === 'points' && (
              <div className="space-y-2">
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min={0}
                  max={drill.maxPoints ?? undefined}
                  value={formData.points ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      points: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder={drill.maxPoints ? `Max: ${drill.maxPoints}` : 'Enter points'}
                />
                {errors.points && (
                  <p className="text-xs text-destructive">{errors.points}</p>
                )}
              </div>
            )}

            {/* Hits-based scoring */}
            {drill.scoringType === 'hits' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hits">Hits *</Label>
                  <Input
                    id="hits"
                    type="number"
                    min={0}
                    max={drill.roundCount}
                    value={formData.hits ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hits: e.target.value ? parseInt(e.target.value) : null,
                      }))
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
                    value={formData.misses ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        misses: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Pass/Fail scoring */}
            {drill.scoringType === 'pass_fail' && (
              <div className="flex items-center space-x-3">
                <Label htmlFor="passed">Did you pass?</Label>
                <Switch
                  id="passed"
                  checked={formData.passed ?? false}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, passed: checked }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.passed ? 'Pass' : 'Fail'}
                </span>
                {errors.passed && (
                  <p className="text-xs text-destructive">{errors.passed}</p>
                )}
              </div>
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
