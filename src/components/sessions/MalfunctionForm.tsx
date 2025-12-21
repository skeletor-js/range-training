import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import { malfunctionSchema, type MalfunctionFormData } from '@/lib/validations';
import { MALFUNCTION_TYPES, MALFUNCTION_TYPE_LABELS } from '@/lib/constants';
import type { Firearm, Ammo } from '@/types';

interface MalfunctionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firearms: Firearm[];
  ammo: Ammo[];
  onSave: (data: MalfunctionFormData) => Promise<void>;
}

export function MalfunctionForm({
  open,
  onOpenChange,
  firearms,
  ammo,
  onSave,
}: MalfunctionFormProps) {
  const [formData, setFormData] = useState<MalfunctionFormData>({
    sessionId: null,
    firearmId: null,
    ammoId: null,
    malfunctionType: 'failure_to_feed',
    description: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setFormData({
        sessionId: null,
        firearmId: null,
        ammoId: null,
        malfunctionType: 'failure_to_feed',
        description: null,
      });
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = malfunctionSchema.safeParse(formData);
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
      setErrors({ form: 'Failed to log malfunction' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>Log Malfunction</SheetTitle>
            <SheetDescription>
              Record an issue that occurred during shooting
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            {/* Malfunction Type */}
            <div className="space-y-2">
              <Label htmlFor="malfunctionType">Malfunction Type *</Label>
              <Select
                value={formData.malfunctionType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    malfunctionType: value as MalfunctionFormData['malfunctionType'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MALFUNCTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {MALFUNCTION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.malfunctionType && (
                <p className="text-xs text-destructive">{errors.malfunctionType}</p>
              )}
            </div>

            {/* Firearm selector */}
            <div className="space-y-2">
              <Label htmlFor="firearmId">Weapon (optional)</Label>
              <Select
                value={formData.firearmId ?? 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    firearmId: value === 'none' ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weapon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {firearms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.caliber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ammo selector */}
            <div className="space-y-2">
              <Label htmlFor="ammoId">Ammo (optional)</Label>
              <Select
                value={formData.ammoId ?? 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    ammoId: value === 'none' ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ammo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {ammo.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.brand} {a.caliber} {a.grainWeight}gr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value || null,
                  }))
                }
                placeholder="What happened? How was it resolved?"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Describe the malfunction and any actions taken
              </p>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Log Malfunction'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
