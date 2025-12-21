import { useState, useEffect, useMemo } from 'react';
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
import { compatibilitySchema, type CompatibilityFormData } from '@/lib/validations';
import { RATING_OPTIONS } from '@/lib/constants';
import type { Firearm, Ammo, FirearmAmmoCompatibility } from '@/types';
import { useCompatibility } from '@/stores/inventoryStore';

interface CompatibilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firearm?: Firearm; // Pre-selected if adding from firearm
  ammo?: Ammo; // Pre-selected if adding from ammo
  existing?: FirearmAmmoCompatibility; // For editing
  onSave: () => void;
}

export function CompatibilityForm({
  open,
  onOpenChange,
  firearm,
  ammo,
  existing,
  onSave,
}: CompatibilityFormProps) {
  const { firearms, ammo: ammoList, loadFirearms, loadAmmo, addCompatibility, updateCompatibility } =
    useCompatibility();

  const [formData, setFormData] = useState<CompatibilityFormData>({
    firearmId: '',
    ammoId: '',
    performanceRating: null,
    loadNotes: '',
    isTested: false,
    lastTestedDate: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load firearms and ammo on mount
  useEffect(() => {
    if (open) {
      loadFirearms();
      loadAmmo();
    }
  }, [open, loadFirearms, loadAmmo]);

  // Initialize form data when opening
  useEffect(() => {
    if (open) {
      if (existing) {
        setFormData({
          firearmId: existing.firearmId,
          ammoId: existing.ammoId,
          performanceRating: existing.performanceRating as CompatibilityFormData['performanceRating'],
          loadNotes: existing.loadNotes ?? '',
          isTested: existing.isTested ?? false,
          lastTestedDate: existing.lastTestedDate,
        });
      } else {
        setFormData({
          firearmId: firearm?.id ?? '',
          ammoId: ammo?.id ?? '',
          performanceRating: null,
          loadNotes: '',
          isTested: false,
          lastTestedDate: null,
        });
      }
      setErrors({});
    }
  }, [open, existing, firearm, ammo]);

  // Get selected firearm's caliber
  const selectedFirearm = firearms.find((f) => f.id === formData.firearmId);

  // Filter ammo by caliber when a firearm is selected
  const filteredAmmo = useMemo(() => {
    if (!selectedFirearm) return ammoList;
    return ammoList.filter((a) => a.caliber === selectedFirearm.caliber);
  }, [ammoList, selectedFirearm]);

  // Reset ammo selection if it's no longer valid after firearm change
  useEffect(() => {
    if (formData.firearmId && formData.ammoId) {
      const isValid = filteredAmmo.some((a) => a.id === formData.ammoId);
      if (!isValid) {
        setFormData((prev) => ({ ...prev, ammoId: '' }));
      }
    }
  }, [formData.firearmId, formData.ammoId, filteredAmmo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = compatibilitySchema.safeParse(formData);
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
      if (existing) {
        await updateCompatibility(existing.id, result.data);
      } else {
        await addCompatibility(result.data);
      }
      onOpenChange(false);
      onSave();
    } catch {
      setErrors({ form: 'Failed to save compatibility' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>
              {existing ? 'Edit Compatibility' : 'Add Compatibility'}
            </SheetTitle>
            <SheetDescription>
              Link a weapon to compatible ammo with performance notes
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            {/* Firearm selector */}
            <div className="space-y-2">
              <Label htmlFor="firearmId">Weapon *</Label>
              <Select
                value={formData.firearmId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, firearmId: value }))
                }
                disabled={!!firearm}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a weapon" />
                </SelectTrigger>
                <SelectContent>
                  {firearms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.caliber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.firearmId && (
                <p className="text-xs text-destructive">{errors.firearmId}</p>
              )}
            </div>

            {/* Ammo selector - filtered by caliber */}
            <div className="space-y-2">
              <Label htmlFor="ammoId">
                Ammo *
                {selectedFirearm && (
                  <span className="text-muted-foreground ml-1">
                    (filtered to {selectedFirearm.caliber})
                  </span>
                )}
              </Label>
              <Select
                value={formData.ammoId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, ammoId: value }))
                }
                disabled={!!ammo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ammo" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAmmo.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No compatible ammo found
                    </SelectItem>
                  ) : (
                    filteredAmmo.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.brand} {a.productLine} {a.caliber} {a.grainWeight}gr
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.ammoId && (
                <p className="text-xs text-destructive">{errors.ammoId}</p>
              )}
            </div>

            {/* Performance rating */}
            <div className="space-y-2">
              <Label htmlFor="performanceRating">Performance Rating</Label>
              <Select
                value={formData.performanceRating ?? ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    performanceRating: value as CompatibilityFormData['performanceRating'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Load notes */}
            <div className="space-y-2">
              <Label htmlFor="loadNotes">Load Notes</Label>
              <Textarea
                id="loadNotes"
                value={formData.loadNotes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, loadNotes: e.target.value }))
                }
                placeholder="e.g., Runs great, slight POI shift at 25yds, needs break-in..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Document how this ammo performs in this specific weapon
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
              {isSaving ? 'Saving...' : existing ? 'Update' : 'Add Compatibility'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
