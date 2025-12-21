import { X } from 'lucide-react';

interface ShotMarkerProps {
  x: number;
  y: number;
  sequenceNumber: number;
  scale: number;
  onRemove?: () => void;
  isDragging?: boolean;
}

export function ShotMarker({
  x,
  y,
  sequenceNumber,
  scale,
  onRemove,
  isDragging = false,
}: ShotMarkerProps) {
  // Base size that scales with zoom
  const baseSize = 24 / scale;
  const fontSize = 12 / scale;
  const strokeWidth = 2 / scale;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      {/* Outer ring */}
      <circle
        r={baseSize / 2}
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth={strokeWidth}
        opacity={0.9}
      />

      {/* Shot number */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
        style={{ userSelect: 'none' }}
      >
        {sequenceNumber}
      </text>

      {/* Remove button (only visible on hover in web) */}
      {onRemove && (
        <g
          transform={`translate(${baseSize / 2}, ${-baseSize / 2})`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        >
          <circle
            r={baseSize / 3}
            fill="hsl(var(--destructive))"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth={strokeWidth / 2}
          />
          <X
            x={-baseSize / 6}
            y={-baseSize / 6}
            width={baseSize / 3}
            height={baseSize / 3}
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth={strokeWidth}
          />
        </g>
      )}
    </g>
  );
}
