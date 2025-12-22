import { MapPin, Star, MoreVertical, Pencil, Trash2, ExternalLink, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Range } from '@/db/schema';

interface RangeCardProps {
  range: Range;
  onEdit: (range: Range) => void;
  onDelete: (range: Range) => void;
  onToggleFavorite: (range: Range) => void;
  onSelect?: (range: Range) => void;
}

export function RangeCard({ range, onEdit, onDelete, onToggleFavorite, onSelect }: RangeCardProps) {
  const rangeTypeLabel = range.rangeType === 'indoor'
    ? 'Indoor'
    : range.rangeType === 'outdoor'
      ? 'Outdoor'
      : range.rangeType === 'both'
        ? 'Indoor/Outdoor'
        : null;

  return (
    <Card
      className={onSelect ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}
      onClick={() => onSelect?.(range)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{range.name}</h3>
              {range.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>

            {(range.city || range.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>
                  {[range.city, range.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {rangeTypeLabel && (
                <Badge variant="outline">{rangeTypeLabel}</Badge>
              )}
              {range.maxDistance && (
                <Badge variant="secondary">{range.maxDistance} yds max</Badge>
              )}
            </div>

            {range.phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{range.phone}</span>
              </div>
            )}

            {range.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {range.notes}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleFavorite(range)}>
                <Star className={`h-4 w-4 mr-2 ${range.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {range.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              </DropdownMenuItem>
              {range.website && (
                <DropdownMenuItem asChild>
                  <a href={range.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(range)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(range)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
