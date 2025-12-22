import { MapPin } from 'lucide-react';
import { RangeCard } from './RangeCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Range } from '@/db/schema';

interface RangeListProps {
  ranges: Range[];
  onEdit: (range: Range) => void;
  onDelete: (range: Range) => void;
  onToggleFavorite: (range: Range) => void;
  onAdd: () => void;
  onSelect?: (range: Range) => void;
}

export function RangeList({
  ranges,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAdd,
  onSelect,
}: RangeListProps) {
  if (ranges.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No ranges saved"
        description="Save your favorite shooting ranges for quick access"
        actionLabel="Add Range"
        onAction={onAdd}
      />
    );
  }

  const favorites = ranges.filter((r) => r.isFavorite);
  const others = ranges.filter((r) => !r.isFavorite);

  return (
    <div className="space-y-6">
      {favorites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Favorites</h3>
          <div className="space-y-3">
            {favorites.map((range) => (
              <RangeCard
                key={range.id}
                range={range}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          {favorites.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground mb-3">All Ranges</h3>
          )}
          <div className="space-y-3">
            {others.map((range) => (
              <RangeCard
                key={range.id}
                range={range}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
