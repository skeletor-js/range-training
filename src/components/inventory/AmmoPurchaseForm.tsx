import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ammoPurchaseSchema, type AmmoPurchaseFormData } from '@/lib/validations';
import type { Ammo } from '@/types';

interface AmmoPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ammo: Ammo | null;
  onSave: (ammoId: string, data: AmmoPurchaseFormData) => Promise<void>;
}

export function AmmoPurchaseForm({
  open,
  onOpenChange,
  ammo,
  onSave,
}: AmmoPurchaseFormProps) {
  const [formData, setFormData] = useState<AmmoPurchaseFormData>({
    quantity: 0,
    priceTotal: 0,
    seller: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const pricePerRound =
    formData.quantity > 0 && formData.priceTotal > 0
      ? (formData.priceTotal / formData.quantity).toFixed(3)
      : '0.000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ammo) return;

    setErrors({});

    const result = ammoPurchaseSchema.safeParse(formData);
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
      await onSave(ammo.id, result.data);
      onOpenChange(false);
      // Reset form
      setFormData({
        quantity: 0,
        priceTotal: 0,
        seller: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch {
      setErrors({ form: 'Failed to save purchase' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!ammo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Purchase</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {ammo.brand} {ammo.productLine} - {ammo.caliber} {ammo.grainWeight}
              gr
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g., 500"
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceTotal">Total Price *</Label>
                <Input
                  id="priceTotal"
                  type="number"
                  step="0.01"
                  value={formData.priceTotal || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceTotal: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g., 149.99"
                />
                {errors.priceTotal && (
                  <p className="text-xs text-destructive">{errors.priceTotal}</p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted text-center">
              <span className="text-sm text-muted-foreground">
                Price per round:{' '}
              </span>
              <span className="font-semibold">${pricePerRound}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller">Seller</Label>
                <Input
                  id="seller"
                  value={formData.seller ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, seller: e.target.value }))
                  }
                  placeholder="e.g., Walmart"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }))
                  }
                />
                {errors.purchaseDate && (
                  <p className="text-xs text-destructive">
                    {errors.purchaseDate}
                  </p>
                )}
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
                placeholder="Optional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add Purchase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
