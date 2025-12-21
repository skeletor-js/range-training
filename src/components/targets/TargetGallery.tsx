import type { TargetWithShots } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ShotPlot } from './ShotPlot';
import { Target } from 'lucide-react';

interface TargetGalleryProps {
  targets: TargetWithShots[];
  onSelect?: (target: TargetWithShots) => void;
}

export function TargetGallery({ targets, onSelect }: TargetGalleryProps) {
  if (targets.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No targets captured yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {targets.map((target) => (
        <Card
          key={target.id}
          className={onSelect ? 'cursor-pointer hover:bg-accent' : ''}
          onClick={() => onSelect?.(target)}
        >
          <CardContent className="p-3">
            {/* Mini shot plot */}
            <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
              <ShotPlot
                shots={target.shots}
                groupCenter={
                  target.groupCenterX !== null && target.groupCenterY !== null
                    ? { x: target.groupCenterX, y: target.groupCenterY }
                    : undefined
                }
                extremeSpread={target.extremeSpread ?? undefined}
                showNumbers={false}
                shotSize={4}
              />
            </div>

            {/* Quick stats */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{target.shotCount} shots</span>
                <span className="text-muted-foreground">{target.distanceYards}yd</span>
              </div>

              {target.extremeSpread !== null && target.groupSizeMoa !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {target.extremeSpread.toFixed(2)}"
                  </span>
                  <span className="text-sm text-primary">
                    {target.groupSizeMoa.toFixed(2)} MOA
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
