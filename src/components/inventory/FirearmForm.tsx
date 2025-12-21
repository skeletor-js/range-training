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
import { CALIBERS, FIREARM_TYPES } from '@/lib/constants';
import { firearmSchema, type FirearmFormData } from '@/lib/validations';
import type { Firearm } from '@/types';

interface FirearmFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firearm?: Firearm | null;
  onSave: (data: FirearmFormData) => Promise<void>;
}

export function FirearmForm({
  open,
  onOpenChange,
  firearm,
  onSave,
}: FirearmFormProps) {
  const [formData, setFormData] = useState<FirearmFormData>({
    name: '',
    type: null,
    caliber: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    notes: '',
    purchaseDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!firearm;

  useEffect(() => {
    if (firearm) {
      setFormData({
        name: firearm.name,
        type: firearm.type,
        caliber: firearm.caliber,
        manufacturer: firearm.manufacturer ?? '',
        model: firearm.model ?? '',
        serialNumber: firearm.serialNumber ?? '',
        notes: firearm.notes ?? '',
        purchaseDate: firearm.purchaseDate ?? '',
      });
    } else {
      setFormData({
        name: '',
        type: null,
        caliber: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        notes: '',
        purchaseDate: '',
      });
    }
    setErrors({});
  }, [firearm, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = firearmSchema.safeParse(formData);
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
      setErrors({ form: 'Failed to save firearm' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditing ? 'Edit Firearm' : 'Add Firearm'}</SheetTitle>
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
                placeholder="e.g., My Glock 19"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value as typeof prev.type,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIREARM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caliber">Caliber *</Label>
                <Select
                  value={formData.caliber}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, caliber: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select caliber" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALIBERS.map((caliber) => (
                      <SelectItem key={caliber} value={caliber}>
                        {caliber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.caliber && (
                  <p className="text-xs text-destructive">{errors.caliber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturer: e.target.value,
                    }))
                  }
                  placeholder="e.g., Glock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="e.g., Gen 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes..."
                rows={3}
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
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Add Firearm'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
