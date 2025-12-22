import { FileText } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { SessionTemplate } from '@/db/schema';

interface TemplateListProps {
  templates: SessionTemplate[];
  onUse: (template: SessionTemplate) => void;
  onEdit: (template: SessionTemplate) => void;
  onDelete: (template: SessionTemplate) => void;
  onToggleFavorite: (template: SessionTemplate) => void;
  onAdd: () => void;
}

export function TemplateList({
  templates,
  onUse,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAdd,
}: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates saved"
        description="Create templates for quick session setup"
        actionLabel="Create Template"
        onAction={onAdd}
      />
    );
  }

  const favorites = templates.filter((t) => t.isFavorite);
  const others = templates.filter((t) => !t.isFavorite);

  return (
    <div className="space-y-6">
      {favorites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Favorites</h3>
          <div className="space-y-3">
            {favorites.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={onUse}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          {favorites.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground mb-3">All Templates</h3>
          )}
          <div className="space-y-3">
            {others.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={onUse}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
