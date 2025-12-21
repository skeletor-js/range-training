interface PoaMarkerProps {
  x: number;
  y: number;
  scale: number;
}

export function PoaMarker({ x, y, scale }: PoaMarkerProps) {
  // Size that scales with zoom to remain visually consistent
  const size = 40 / scale;
  const strokeWidth = 2 / scale;
  const innerRadius = 4 / scale;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Crosshair lines */}
      <line
        x1={-size / 2}
        y1={0}
        x2={-innerRadius}
        y2={0}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
      />
      <line
        x1={innerRadius}
        y1={0}
        x2={size / 2}
        y2={0}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
      />
      <line
        x1={0}
        y1={-size / 2}
        x2={0}
        y2={-innerRadius}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
      />
      <line
        x1={0}
        y1={innerRadius}
        x2={0}
        y2={size / 2}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
      />

      {/* Center circle */}
      <circle
        r={innerRadius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
      />

      {/* Outer ring for visibility */}
      <circle
        r={size / 2}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth / 2}
        strokeDasharray={`${size / 8} ${size / 8}`}
      />
    </g>
  );
}
