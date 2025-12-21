import { Package } from 'lucide-react';
import { AmmoCard } from './AmmoCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Ammo } from '@/types';

interface AmmoListProps {
  ammo: Ammo[];
  onEdit: (ammo: Ammo) => void;
  onDelete: (ammo: Ammo) => void;
  onAddPurchase: (ammo: Ammo) => void;
  onViewHistory: (ammo: Ammo) => void;
  onAdd: () => void;
  onViewCompatibility?: (ammo: Ammo) => void;
}

export function AmmoList({
  ammo,
  onEdit,
  onDelete,
  onAddPurchase,
  onViewHistory,
  onAdd,
  onViewCompatibility,
}: AmmoListProps) {
  if (ammo.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No ammo yet"
        description="Add your first ammo type to start tracking your inventory."
        actionLabel="Add Ammo"
        onAction={onAdd}
      />
    );
  }

  // Group ammo by caliber
  const grouped = ammo.reduce(
    (acc, item) => {
      const caliber = item.caliber;
      if (!acc[caliber]) {
        acc[caliber] = [];
      }
      acc[caliber].push(item);
      return acc;
    },
    {} as Record<string, Ammo[]>
  );

  // Sort calibers alphabetically
  const sortedCalibers = Object.keys(grouped).sort();

  // Calculate total rounds per caliber
  const caliberTotals = sortedCalibers.reduce(
    (acc, caliber) => {
      acc[caliber] = grouped[caliber].reduce(
        (sum, item) => sum + (item.roundCount ?? 0),
        0
      );
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {sortedCalibers.map((caliber) => (
        <div key={caliber}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {caliber}
            </h3>
            <span className="text-xs text-muted-foreground">
              {caliberTotals[caliber].toLocaleString()} total
            </span>
          </div>
          <div className="space-y-3">
            {grouped[caliber].map((item) => (
              <AmmoCard
                key={item.id}
                ammo={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddPurchase={onAddPurchase}
                onViewHistory={onViewHistory}
                onViewCompatibility={onViewCompatibility}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
