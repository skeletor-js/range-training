import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PersonalBestBadge } from './PersonalBestBadge';
import { DRILL_CATEGORY_LABELS } from '@/lib/constants';
import type { DrillWithStats } from '@/types';

interface DrillCardProps {
  drill: DrillWithStats;
  onEdit?: (drill: DrillWithStats) => void;
  onDelete?: (drill: DrillWithStats) => void;
}

export function DrillCard({ drill, onEdit, onDelete }: DrillCardProps) {
  const navigate = useNavigate();

  const categoryLabel = drill.category
    ? DRILL_CATEGORY_LABELS[drill.category]
    : 'Other';

  const handleClick = () => {
    navigate(`/drills/${drill.id}`);
  };

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold truncate">{drill.name}</h3>
              <Badge variant="outline" className="shrink-0 text-xs">
                {categoryLabel}
              </Badge>
              {drill.isBuiltin && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Built-in
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span>{drill.roundCount} rds</span>
              {drill.distanceYards && <span>{drill.distanceYards} yds</span>}
              {drill.parTime && <span>Par: {drill.parTime}s</span>}
            </div>

            <div className="flex items-center gap-2">
              {drill.personalBest && (
                <PersonalBestBadge
                  attempt={drill.personalBest}
                  scoringType={drill.scoringType}
                />
              )}
              {drill.attemptCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {drill.attemptCount} attempt{drill.attemptCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!drill.isBuiltin && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(drill);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(drill);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
