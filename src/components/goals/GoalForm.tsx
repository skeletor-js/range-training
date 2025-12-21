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
import { goalSchema, type GoalFormData } from '@/lib/validations';
import { SCORING_TYPE_LABELS } from '@/lib/constants';
import type { Goal, Drill } from '@/types';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  drills?: Drill[];
  onSave: (data: GoalFormData) => Promise<void>;
}

export function GoalForm({
  open,
  onOpenChange,
  goal,
  drills = [],
  onSave,
}: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    targetDate: '',
    linkedDrillId: null,
    targetScore: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description ?? '',
        targetDate: goal.targetDate ?? '',
        linkedDrillId: goal.linkedDrillId ?? null,
        targetScore: goal.targetScore ?? null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        targetDate: '',
        linkedDrillId: null,
        targetScore: null,
      });
    }
    setErrors({});
  }, [goal, open]);

  const selectedDrill = drills.find((d) => d.id === formData.linkedDrillId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = goalSchema.safeParse(formData);
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
      setErrors({ form: 'Failed to save goal' });
    } finally {
      setIsSaving(false);
    }
  };

  const getTargetScorePlaceholder = () => {
    if (!selectedDrill?.scoringType) return 'Enter target';
    switch (selectedDrill.scoringType) {
      case 'time':
        return 'e.g., 2.0 (seconds)';
      case 'points':
        return `e.g., ${selectedDrill.maxPoints ?? 20} (points)`;
      case 'hits':
        return `e.g., ${selectedDrill.roundCount} (hits)`;
      case 'pass_fail':
        return 'Enter 1 for pass';
      default:
        return 'Enter target';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditing ? 'Edit Goal' : 'Create Goal'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Goal *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Sub-2s Bill Drill"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
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
                placeholder="Details about this goal..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
                }
              />
            </div>

            {/* Optional: Link to a drill */}
            {drills.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="linkedDrillId">Link to Drill (optional)</Label>
                  <Select
                    value={formData.linkedDrillId ?? ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        linkedDrillId: value || null,
                        targetScore: null, // Reset target score when drill changes
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a drill to track progress" />
                    </SelectTrigger>
                    <SelectContent>
                      {drills.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}{' '}
                          {d.scoringType && (
                            <span className="text-muted-foreground">
                              ({SCORING_TYPE_LABELS[d.scoringType]})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Link to a drill to automatically track your progress toward this goal
                  </p>
                </div>

                {/* Target score - only show if drill is linked */}
                {formData.linkedDrillId && selectedDrill && (
                  <div className="space-y-2">
                    <Label htmlFor="targetScore">Target Score *</Label>
                    <Input
                      id="targetScore"
                      type="number"
                      step={selectedDrill.scoringType === 'time' ? 0.01 : 1}
                      value={formData.targetScore ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetScore: e.target.value ? parseFloat(e.target.value) : null,
                        }))
                      }
                      placeholder={getTargetScorePlaceholder()}
                    />
                    {selectedDrill.scoringType === 'time' && (
                      <p className="text-xs text-muted-foreground">
                        Enter your target time in seconds (lower is better)
                      </p>
                    )}
                    {selectedDrill.scoringType === 'points' && (
                      <p className="text-xs text-muted-foreground">
                        Enter your target points (higher is better)
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
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
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create Goal'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
