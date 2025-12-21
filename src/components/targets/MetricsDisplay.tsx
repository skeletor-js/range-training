import type { GroupMetrics } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatGroupMetrics } from '@/lib/measurements';

interface MetricsDisplayProps {
  metrics: GroupMetrics;
  distanceYards: number;
  compact?: boolean;
}

export function MetricsDisplay({
  metrics,
  distanceYards,
  compact = false,
}: MetricsDisplayProps) {
  const formatted = formatGroupMetrics(metrics);

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span>
          <span className="text-muted-foreground">ES:</span>{' '}
          <span className="font-semibold">{formatted.extremeSpread}</span>
        </span>
        <span>
          <span className="text-muted-foreground">MOA:</span>{' '}
          <span className="font-semibold">{formatted.groupSizeMoa}</span>
        </span>
        <span className="text-muted-foreground">
          @ {distanceYards}yd ({metrics.shotCount} shots)
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Group Size</p>
            <p className="text-xl font-bold">{formatted.extremeSpread}</p>
            <p className="text-sm text-muted-foreground">
              {formatted.groupSizeMoa}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase">Mean Radius</p>
            <p className="text-xl font-bold">{formatted.meanRadius}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase">
              Group Center
            </p>
            <p className="text-lg font-mono">{formatted.groupCenter}</p>
            <p className="text-xs text-muted-foreground">from POA</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase">Shots</p>
            <p className="text-xl font-bold">{metrics.shotCount}</p>
            <p className="text-xs text-muted-foreground">@ {distanceYards} yards</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
