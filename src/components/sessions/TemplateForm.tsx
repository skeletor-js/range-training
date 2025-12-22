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
import { Switch } from '@/components/ui/switch';
import type { SessionTemplate } from '@/db/schema';

interface TemplateFormData {
  name: string;
  description?: string;
  location?: string;
  defaultNotes?: string;
  isFavorite?: boolean;
}

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: SessionTemplate | null;
  onSave: (data: TemplateFormData) => Promise<void>;
}

export function TemplateForm({ open, onOpenChange, template, onSave }: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    location: '',
    defaultNotes: '',
    isFavorite: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description ?? '',
        location: template.location ?? '',
        defaultNotes: template.defaultNotes ?? '',
        isFavorite: template.isFavorite ?? false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        defaultNotes: '',
        isFavorite: false,
      });
    }
    setError(null);
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch {
      setError('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Template' : 'Create Template'}</SheetTitle>
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
              placeholder="e.g., Weekly Practice"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of this template"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Default Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g., Local Range"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultNotes">Default Notes</Label>
            <Textarea
              id="defaultNotes"
              value={formData.defaultNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defaultNotes: e.target.value }))
              }
              placeholder="Notes to pre-fill for sessions using this template"
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
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Template'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
