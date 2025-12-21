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
        title="No weapons yet"
        description="Add your first weapon to start tracking your range sessions."
        actionLabel="Add Weapon"
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

  const typeOrder = [
    // Firearms
    'handgun', 'rifle', 'shotgun', 'sbr', 'pcc',
    // Air-powered
    'air_rifle', 'air_pistol',
    // Black powder
    'bp_rifle', 'bp_pistol', 'bp_shotgun',
    // Other
    'other',
  ];
  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  // Helper to format type labels for section headers
  const formatTypeHeader = (type: string): string => {
    const labels: Record<string, string> = {
      handgun: 'Handguns',
      rifle: 'Rifles',
      shotgun: 'Shotguns',
      sbr: 'SBRs',
      pcc: 'PCCs',
      air_rifle: 'Air Rifles',
      air_pistol: 'Air Pistols',
      bp_rifle: 'Black Powder Rifles',
      bp_pistol: 'Black Powder Pistols',
      bp_shotgun: 'Black Powder Shotguns',
      other: 'Other',
    };
    return labels[type] ?? type;
  };

  return (
    <div className="space-y-6">
      {sortedTypes.map((type) => (
        <div key={type}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {formatTypeHeader(type)}
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
