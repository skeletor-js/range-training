import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

type ListItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'session'; session: Session; key: string };

export function SessionList({
  sessions,
  onSelect,
  onDelete,
  onAdd,
}: SessionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Build flattened list with headers interspersed
  const flatItems = useMemo<ListItem[]>(() => {
    if (sessions.length === 0) return [];

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
    const items: ListItem[] = [];

    for (const monthKey of sortedMonths) {
      items.push({ type: 'header', label: grouped[monthKey].label, key: `header-${monthKey}` });
      for (const session of grouped[monthKey].sessions) {
        items.push({ type: 'session', session, key: `session-${session.id}` });
      }
    }

    return items;
  }, [sessions]);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flatItems[index];
      // Headers are smaller, sessions vary but ~100px is reasonable estimate
      return item.type === 'header' ? 40 : 100;
    },
    overscan: 5,
  });

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

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const item = flatItems[virtualRow.index];

          return (
            <div
              key={item.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {item.type === 'header' ? (
                <h3 className="text-sm font-medium text-muted-foreground py-2 sticky top-0 bg-background z-10">
                  {item.label}
                </h3>
              ) : (
                <div className="pb-3">
                  <SessionCard
                    session={item.session}
                    onSelect={onSelect ? () => onSelect(item.session) : undefined}
                    onDelete={onDelete ? () => onDelete(item.session) : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
