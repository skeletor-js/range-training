import { Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MALFUNCTION_TYPE_LABELS, type MalfunctionType } from '@/lib/constants';
import type { MalfunctionWithDetails } from '@/types';

interface MalfunctionListProps {
  malfunctions: MalfunctionWithDetails[];
  onDelete: (malfunction: MalfunctionWithDetails) => void;
}

const malfunctionColors: Record<MalfunctionType, string> = {
  failure_to_feed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  failure_to_eject: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  failure_to_fire: 'bg-red-500/20 text-red-400 border-red-500/30',
  light_primer_strike: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  squib: 'bg-red-500/20 text-red-400 border-red-500/30',
  hang_fire: 'bg-red-500/20 text-red-400 border-red-500/30',
  misfire: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  jam: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function MalfunctionList({ malfunctions, onDelete }: MalfunctionListProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      {malfunctions.map((malfunction) => (
        <Card key={malfunction.id} className="bg-neutral-800/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                  <Badge
                    variant="outline"
                    className={malfunctionColors[malfunction.malfunctionType]}
                  >
                    {MALFUNCTION_TYPE_LABELS[malfunction.malfunctionType]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(malfunction.createdAt)}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  {malfunction.firearmName && (
                    <div className="text-muted-foreground">
                      Weapon: <span className="text-foreground">{malfunction.firearmName}</span>
                    </div>
                  )}
                  {malfunction.ammoName && (
                    <div className="text-muted-foreground">
                      Ammo: <span className="text-foreground">{malfunction.ammoName}</span>
                    </div>
                  )}
                  {malfunction.description && (
                    <p className="text-muted-foreground mt-2">{malfunction.description}</p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(malfunction)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
