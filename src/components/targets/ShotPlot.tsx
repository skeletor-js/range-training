import type { InchShot } from '@/types';

interface ShotPlotProps {
  shots: InchShot[];
  groupCenter?: { x: number; y: number };
  extremeSpread?: number;
  scale?: number; // pixels per inch
  showNumbers?: boolean;
  shotSize?: number;
  className?: string;
}

/**
 * SVG component that plots shots on a target
 * Coordinates are in inches relative to POA (0,0)
 */
export function ShotPlot({
  shots,
  groupCenter,
  extremeSpread,
  scale = 20, // 20 pixels per inch
  showNumbers = true,
  shotSize = 8,
  className = '',
}: ShotPlotProps) {
  // Calculate viewbox to fit all shots with padding
  const padding = 1; // inch padding
  let minX = -5;
  let maxX = 5;
  let minY = -5;
  let maxY = 5;

  shots.forEach((shot) => {
    minX = Math.min(minX, shot.xInches - padding);
    maxX = Math.max(maxX, shot.xInches + padding);
    minY = Math.min(minY, shot.yInches - padding);
    maxY = Math.max(maxY, shot.yInches + padding);
  });

  const width = (maxX - minX) * scale;
  const height = (maxY - minY) * scale;

  // Convert inch coordinates to SVG coordinates
  // Note: SVG Y increases downward, but we want Y to increase upward
  const toSvgX = (inchX: number) => (inchX - minX) * scale;
  const toSvgY = (inchY: number) => (maxY - inchY) * scale;

  const centerSvgX = toSvgX(0);
  const centerSvgY = toSvgY(0);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: 'block' }}
    >
      {/* POA crosshair */}
      <line
        x1={centerSvgX - 15}
        y1={centerSvgY}
        x2={centerSvgX + 15}
        y2={centerSvgY}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <line
        x1={centerSvgX}
        y1={centerSvgY - 15}
        x2={centerSvgX}
        y2={centerSvgY + 15}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        strokeDasharray="3,3"
      />

      {/* Extreme spread circle */}
      {extremeSpread && groupCenter && (
        <circle
          cx={toSvgX(groupCenter.x)}
          cy={toSvgY(groupCenter.y)}
          r={(extremeSpread / 2) * scale}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.5}
        />
      )}

      {/* Group center marker */}
      {groupCenter && (
        <g transform={`translate(${toSvgX(groupCenter.x)}, ${toSvgY(groupCenter.y)})`}>
          <line
            x1={-8}
            y1={-8}
            x2={8}
            y2={8}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          <line
            x1={8}
            y1={-8}
            x2={-8}
            y2={8}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        </g>
      )}

      {/* Shot markers */}
      {shots.map((shot, index) => (
        <g
          key={index}
          transform={`translate(${toSvgX(shot.xInches)}, ${toSvgY(shot.yInches)})`}
        >
          <circle
            r={shotSize}
            fill="hsl(var(--destructive))"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth={1}
          />
          {showNumbers && (
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={shotSize * 1.2}
              fontWeight="bold"
              fill="hsl(var(--destructive-foreground))"
              style={{ userSelect: 'none' }}
            >
              {shot.sequenceNumber}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
