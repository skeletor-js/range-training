import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DRILL_CATEGORIES,
  DRILL_CATEGORY_LABELS,
  SCORING_TYPES,
  SCORING_TYPE_LABELS,
} from '@/lib/constants';
import { drillSchema, type DrillFormData } from '@/lib/validations';
import type { Drill } from '@/types';

interface DrillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drill?: Drill | null;
  onSave: (data: DrillFormData) => Promise<void>;
}

export function DrillForm({ open, onOpenChange, drill, onSave }: DrillFormProps) {
  const [formData, setFormData] = useState<DrillFormData>({
    name: '',
    description: '',
    category: 'speed',
    scoringType: 'time',
    parTime: null,
    maxPoints: null,
    roundCount: 1,
    targetCount: 1,
    distanceYards: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!drill;

  useEffect(() => {
    if (drill) {
      setFormData({
        name: drill.name,
        description: drill.description ?? '',
        category: drill.category ?? 'speed',
        scoringType: drill.scoringType ?? 'time',
        parTime: drill.parTime ?? null,
        maxPoints: drill.maxPoints ?? null,
        roundCount: drill.roundCount,
        targetCount: drill.targetCount ?? 1,
        distanceYards: drill.distanceYards ?? null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'speed',
        scoringType: 'time',
        parTime: null,
        maxPoints: null,
        roundCount: 1,
        targetCount: 1,
        distanceYards: null,
      });
    }
    setErrors({});
  }, [drill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = drillSchema.safeParse(formData);
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

    setIsSaving(true);
    try {
      await onSave(result.data);
      onOpenChange(false);
    } catch {
      setErrors({ form: 'Failed to save drill' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditing ? 'Edit Drill' : 'Create Custom Drill'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., My Speed Drill"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the drill and how to perform it..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value as typeof prev.category,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRILL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {DRILL_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scoringType">Scoring Type *</Label>
                <Select
                  value={formData.scoringType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      scoringType: value as typeof prev.scoringType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scoring" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCORING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SCORING_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roundCount">Round Count *</Label>
                <Input
                  id="roundCount"
                  type="number"
                  min={1}
                  value={formData.roundCount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      roundCount: parseInt(e.target.value) || 1,
                    }))
                  }
                />
                {errors.roundCount && (
                  <p className="text-xs text-destructive">{errors.roundCount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetCount">Target Count</Label>
                <Input
                  id="targetCount"
                  type="number"
                  min={1}
                  value={formData.targetCount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetCount: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distanceYards">Distance (yards)</Label>
                <Input
                  id="distanceYards"
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.distanceYards ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      distanceYards: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              {formData.scoringType === 'time' && (
                <div className="space-y-2">
                  <Label htmlFor="parTime">Par Time (seconds)</Label>
                  <Input
                    id="parTime"
                    type="number"
                    min={0}
                    step={0.1}
                    value={formData.parTime ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parTime: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              )}

              {formData.scoringType === 'points' && (
                <div className="space-y-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    min={1}
                    value={formData.maxPoints ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxPoints: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              )}
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
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create Drill'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
