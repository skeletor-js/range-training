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
import { CALIBERS, BULLET_TYPES, RATING_OPTIONS } from '@/lib/constants';
import { ammoSchema, type AmmoFormData } from '@/lib/validations';
import type { Ammo } from '@/types';

interface AmmoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ammo?: Ammo | null;
  onSave: (data: AmmoFormData) => Promise<void>;
}

export function AmmoForm({ open, onOpenChange, ammo, onSave }: AmmoFormProps) {
  const [formData, setFormData] = useState<AmmoFormData>({
    caliber: '',
    brand: '',
    productLine: '',
    grainWeight: 0,
    bulletType: '',
    rating: null,
    reliability: null,
    accuracy: null,
    reviewNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!ammo;

  useEffect(() => {
    if (ammo) {
      setFormData({
        caliber: ammo.caliber,
        brand: ammo.brand,
        productLine: ammo.productLine ?? '',
        grainWeight: ammo.grainWeight,
        bulletType: ammo.bulletType ?? '',
        rating: ammo.rating,
        reliability: ammo.reliability,
        accuracy: ammo.accuracy,
        reviewNotes: ammo.reviewNotes ?? '',
      });
    } else {
      setFormData({
        caliber: '',
        brand: '',
        productLine: '',
        grainWeight: 0,
        bulletType: '',
        rating: null,
        reliability: null,
        accuracy: null,
        reviewNotes: '',
      });
    }
    setErrors({});
  }, [ammo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ammoSchema.safeParse(formData);
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
      setErrors({ form: 'Failed to save ammo' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditing ? 'Edit Ammo' : 'Add Ammo'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  placeholder="e.g., Federal"
                />
                {errors.brand && (
                  <p className="text-xs text-destructive">{errors.brand}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productLine">Product Line</Label>
              <Input
                id="productLine"
                value={formData.productLine ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productLine: e.target.value,
                  }))
                }
                placeholder="e.g., American Eagle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grainWeight">Grain Weight *</Label>
                <Input
                  id="grainWeight"
                  type="number"
                  value={formData.grainWeight || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      grainWeight: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g., 124"
                />
                {errors.grainWeight && (
                  <p className="text-xs text-destructive">
                    {errors.grainWeight}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulletType">Bullet Type</Label>
                <Select
                  value={formData.bulletType ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, bulletType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BULLET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant={
                      formData.rating && formData.rating >= star
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        rating: prev.rating === star ? null : star,
                      }))
                    }
                  >
                    {star}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reliability">Reliability</Label>
                <Select
                  value={formData.reliability ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      reliability: value as typeof prev.reliability,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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

              <div className="space-y-2">
                <Label htmlFor="accuracy">Accuracy</Label>
                <Select
                  value={formData.accuracy ?? ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      accuracy: value as typeof prev.accuracy,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes</Label>
              <Textarea
                id="reviewNotes"
                value={formData.reviewNotes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reviewNotes: e.target.value,
                  }))
                }
                placeholder="Your notes about this ammo..."
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
              {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Add Ammo'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
