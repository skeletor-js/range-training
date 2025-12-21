import { CalendarDays, MapPin, Target, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Session } from '@/types';
import { formatDate } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  targetCount?: number;
  roundsFired?: number;
  onSelect?: () => void;
  onDelete?: () => void;
}

export function SessionCard({
  session,
  targetCount = 0,
  roundsFired = 0,
  onSelect,
  onDelete,
}: SessionCardProps) {
  return (
    <Card
      className={onSelect ? 'cursor-pointer hover:bg-accent' : ''}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="font-semibold">{formatDate(session.date)}</span>
            </div>

            {session.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>{session.location}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{targetCount} targets</span>
              </div>
              {roundsFired > 0 && (
                <span>{roundsFired.toLocaleString()} rounds</span>
              )}
              {session.weather && <span>{session.weather}</span>}
            </div>

            {session.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {session.notes}
              </p>
            )}
          </div>

          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
