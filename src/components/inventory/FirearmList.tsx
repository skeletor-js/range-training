import { Package } from 'lucide-react';
import { FirearmCard } from './FirearmCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Firearm } from '@/types';

interface FirearmListProps {
  firearms: Firearm[];
  onEdit: (firearm: Firearm) => void;
  onDelete: (firearm: Firearm) => void;
  onAdd: () => void;
  onViewCompatibility?: (firearm: Firearm) => void;
}

export function FirearmList({
  firearms,
  onEdit,
  onDelete,
  onAdd,
  onViewCompatibility,
}: FirearmListProps) {
  if (firearms.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No firearms yet"
        description="Add your first firearm to start tracking your range sessions."
        actionLabel="Add Firearm"
        onAction={onAdd}
      />
    );
  }

  // Group firearms by type
  const grouped = firearms.reduce(
    (acc, firearm) => {
      const type = firearm.type ?? 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(firearm);
      return acc;
    },
    {} as Record<string, Firearm[]>
  );

  const typeOrder = ['handgun', 'rifle', 'shotgun', 'other'];
  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      {sortedTypes.map((type) => (
        <div key={type}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {type === 'other' ? 'Other' : `${type}s`}
          </h3>
          <div className="space-y-3">
            {grouped[type].map((firearm) => (
              <FirearmCard
                key={firearm.id}
                firearm={firearm}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewCompatibility={onViewCompatibility}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
