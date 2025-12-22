import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { Switch } from '@/components/ui/switch';
import type { Range } from '@/db/schema';

interface RangeFormData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  rangeType?: 'indoor' | 'outdoor' | 'both';
  maxDistance?: number;
  notes?: string;
  isFavorite?: boolean;
}

interface RangeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  range?: Range | null;
  onSave: (data: RangeFormData) => Promise<void>;
}

export function RangeForm({ open, onOpenChange, range, onSave }: RangeFormProps) {
  const [formData, setFormData] = useState<RangeFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    website: '',
    rangeType: undefined,
    maxDistance: undefined,
    notes: '',
    isFavorite: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!range;

  useEffect(() => {
    if (range) {
      setFormData({
        name: range.name,
        address: range.address ?? '',
        city: range.city ?? '',
        state: range.state ?? '',
        phone: range.phone ?? '',
        website: range.website ?? '',
        rangeType: range.rangeType ?? undefined,
        maxDistance: range.maxDistance ?? undefined,
        notes: range.notes ?? '',
        isFavorite: range.isFavorite ?? false,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        website: '',
        rangeType: undefined,
        maxDistance: undefined,
        notes: '',
        isFavorite: false,
      });
    }
    setError(null);
  }, [range, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        maxDistance: formData.maxDistance || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError('Failed to save range');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Range' : 'Add Range'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Local Indoor Range"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="123 Range Road"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="TX"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rangeType">Range Type</Label>
              <Select
                value={formData.rangeType || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    rangeType: value as 'indoor' | 'outdoor' | 'both' | undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDistance">Max Distance (yds)</Label>
              <Input
                id="maxDistance"
                type="number"
                min={1}
                value={formData.maxDistance ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxDistance: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Hours, pricing, rules, etc."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="favorite">Favorite</Label>
              <p className="text-xs text-muted-foreground">Show at top of list</p>
            </div>
            <Switch
              id="favorite"
              checked={formData.isFavorite}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFavorite: checked }))
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Range'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
