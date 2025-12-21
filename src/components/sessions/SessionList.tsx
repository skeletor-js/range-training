import { CalendarDays } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Session } from '@/types';

interface SessionListProps {
  sessions: Session[];
  onSelect?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  onAdd?: () => void;
}

export function SessionList({
  sessions,
  onSelect,
  onDelete,
  onAdd,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No sessions yet"
        description="Start your first range session to begin tracking your progress."
        actionLabel="Start Session"
        onAction={onAdd}
      />
    );
  }

  // Group sessions by month
  const grouped = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, sessions: [] };
      }
      acc[monthKey].sessions.push(session);
      return acc;
    },
    {} as Record<string, { label: string; sessions: Session[] }>
  );

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6">
      {sortedMonths.map((monthKey) => (
        <div key={monthKey}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {grouped[monthKey].label}
          </h3>
          <div className="space-y-3">
            {grouped[monthKey].sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSelect={onSelect ? () => onSelect(session) : undefined}
                onDelete={onDelete ? () => onDelete(session) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
