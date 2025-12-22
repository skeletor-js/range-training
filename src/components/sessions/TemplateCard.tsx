import { FileText, Star, MoreVertical, Pencil, Trash2, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SessionTemplate } from '@/db/schema';

interface TemplateCardProps {
  template: SessionTemplate;
  onUse: (template: SessionTemplate) => void;
  onEdit: (template: SessionTemplate) => void;
  onDelete: (template: SessionTemplate) => void;
  onToggleFavorite: (template: SessionTemplate) => void;
}

export function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  onToggleFavorite,
}: TemplateCardProps) {
  const firearmCount = template.firearmIds
    ? JSON.parse(template.firearmIds).length
    : 0;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold truncate">{template.name}</h3>
              {template.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
              )}
            </div>

            {template.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {template.location && (
                <Badge variant="outline">{template.location}</Badge>
              )}
              {firearmCount > 0 && (
                <Badge variant="secondary">
                  {firearmCount} weapon{firearmCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {template.usageCount !== null && template.usageCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button variant="default" size="sm" onClick={() => onUse(template)}>
              <Play className="h-3 w-3 mr-1" />
              Use
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggleFavorite(template)}>
                  <Star
                    className={`h-4 w-4 mr-2 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                  />
                  {template.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(template)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
