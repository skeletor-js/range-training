import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateList } from '@/components/sessions/TemplateList';
import { TemplateForm } from '@/components/sessions/TemplateForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useSessionTemplateStore } from '@/stores/sessionTemplateStore';
import type { SessionTemplate } from '@/db/schema';

interface SessionTemplatesCardProps {
  onUseTemplate?: (template: SessionTemplate) => void;
}

export function SessionTemplatesCard({ onUseTemplate }: SessionTemplatesCardProps) {
  const {
    templates,
    isLoading,
    loadTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
  } = useSessionTemplateStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SessionTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<SessionTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleAdd = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (template: SessionTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleSave = async (data: {
    name: string;
    description?: string;
    location?: string;
    defaultNotes?: string;
    isFavorite?: boolean;
  }) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
    } else {
      await addTemplate(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTemplate) {
      await deleteTemplate(deletingTemplate.id);
      setDeletingTemplate(null);
    }
  };

  const handleUse = (template: SessionTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session Templates</CardTitle>
              <CardDescription>
                Create templates for quick session setup
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TemplateList
              templates={templates}
              onUse={handleUse}
              onEdit={handleEdit}
              onDelete={setDeletingTemplate}
              onToggleFavorite={(template) => toggleFavorite(template.id)}
              onAdd={handleAdd}
            />
          )}
        </CardContent>
      </Card>

      <TemplateForm
        open={showForm}
        onOpenChange={setShowForm}
        template={editingTemplate}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
