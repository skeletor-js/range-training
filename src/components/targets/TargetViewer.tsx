import type { InchShot, GroupMetrics } from '@/types';
import { ShotPlot } from './ShotPlot';
import { MetricsDisplay } from './MetricsDisplay';
import { B8Target } from './templates/B8Target';
import { USPSATarget } from './templates/USPSATarget';
import { NeutralGrid } from './templates/NeutralGrid';

interface TargetViewerProps {
  targetType: string;
  distanceYards: number;
  shots: InchShot[];
  metrics?: GroupMetrics;
  showMetrics?: boolean;
  showTemplate?: boolean;
  className?: string;
}

/**
 * Main component for visualizing a target with shots
 */
export function TargetViewer({
  targetType,
  distanceYards,
  shots,
  metrics,
  showMetrics = true,
  showTemplate = true,
  className = '',
}: TargetViewerProps) {
  const groupCenter = metrics
    ? { x: metrics.groupCenterX, y: metrics.groupCenterY }
    : undefined;

  // Select the appropriate template
  const renderTemplate = () => {
    if (!showTemplate) return null;

    switch (targetType) {
      case 'b8-repair':
        return <B8Target width={200} height={200} showRings={false} />;
      case 'uspsa-metric':
        return <USPSATarget width={180} height={300} showZones={false} />;
      case 'neutral-grid':
      default:
        return <NeutralGrid width={200} height={200} showLabels={false} />;
    }
  };

  return (
    <div className={className}>
      {/* Target with shots overlay */}
      <div className="relative bg-card rounded-lg overflow-hidden">
        {/* Template background (if applicable) */}
        {showTemplate && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            {renderTemplate()}
          </div>
        )}

        {/* Shot plot overlay */}
        <div className="relative aspect-square">
          <ShotPlot
            shots={shots}
            groupCenter={groupCenter}
            extremeSpread={metrics?.extremeSpread}
            showNumbers={shots.length <= 10}
          />
        </div>
      </div>

      {/* Metrics display */}
      {showMetrics && metrics && (
        <div className="mt-4">
          <MetricsDisplay
            metrics={metrics}
            distanceYards={distanceYards}
            compact={false}
          />
        </div>
      )}
    </div>
  );
}
