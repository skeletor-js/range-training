interface CalibrationMarkerProps {
  x: number;
  y: number;
  label: string;
  scale: number;
  active?: boolean;
}

export function CalibrationMarker({ x, y, label, scale, active }: CalibrationMarkerProps) {
  // Size that scales with zoom to remain visually consistent
  const size = 30 / scale;
  const strokeWidth = 2 / scale;
  const fontSize = 14 / scale;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Crosshair lines */}
      <line
        x1={-size / 2}
        y1={0}
        x2={size / 2}
        y2={0}
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={strokeWidth}
      />
      <line
        x1={0}
        y1={-size / 2}
        x2={0}
        y2={size / 2}
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={strokeWidth}
      />

      {/* Label background */}
      <circle
        r={size / 3}
        fill="hsl(var(--background))"
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={strokeWidth}
      />

      {/* Label text */}
      <text
        x={0}
        y={0}
        dy={fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fill="hsl(var(--foreground))"
        fontWeight="bold"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
}
