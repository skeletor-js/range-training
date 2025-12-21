interface NeutralGridProps {
  width?: number;
  height?: number;
  gridSizeInches?: number;
  majorGridEvery?: number;
  showLabels?: boolean;
  className?: string;
}

/**
 * Neutral Grid Target SVG
 * A simple 1-inch grid for plotting shots on any target type
 */
export function NeutralGrid({
  width = 200,
  height = 200,
  gridSizeInches = 10,
  majorGridEvery = 5,
  showLabels = true,
  className = '',
}: NeutralGridProps) {
  // Scale: 20 pixels per inch for good resolution
  const scale = 20;
  const gridSize = gridSizeInches * scale;
  const center = gridSize / 2;

  // Generate grid lines
  const lines = [];
  const labels = [];

  for (let i = 0; i <= gridSizeInches; i++) {
    const pos = i * scale;
    const isMajor = i % majorGridEvery === 0;
    const isCenter = i === gridSizeInches / 2;

    // Vertical lines
    lines.push(
      <line
        key={`v-${i}`}
        x1={pos}
        y1={0}
        x2={pos}
        y2={gridSize}
        stroke={isCenter ? 'hsl(var(--primary))' : isMajor ? '#666' : '#333'}
        strokeWidth={isCenter ? 2 : isMajor ? 1 : 0.5}
        opacity={isCenter ? 1 : isMajor ? 0.8 : 0.4}
      />
    );

    // Horizontal lines
    lines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={pos}
        x2={gridSize}
        y2={pos}
        stroke={isCenter ? 'hsl(var(--primary))' : isMajor ? '#666' : '#333'}
        strokeWidth={isCenter ? 2 : isMajor ? 1 : 0.5}
        opacity={isCenter ? 1 : isMajor ? 0.8 : 0.4}
      />
    );

    // Labels for major grid lines
    if (showLabels && isMajor && !isCenter) {
      const offset = i - gridSizeInches / 2;

      // X-axis labels (bottom)
      labels.push(
        <text
          key={`lx-${i}`}
          x={pos}
          y={gridSize - 5}
          textAnchor="middle"
          fontSize={8}
          fill="#888"
        >
          {offset > 0 ? `+${offset}"` : `${offset}"`}
        </text>
      );

      // Y-axis labels (left) - inverted because Y increases downward in SVG
      labels.push(
        <text
          key={`ly-${i}`}
          x={5}
          y={pos}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize={8}
          fill="#888"
        >
          {offset > 0 ? `${-offset}"` : `+${-offset}"`}
        </text>
      );
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      className={className}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width={gridSize} height={gridSize} fill="#1a1a1a" />

      {/* Grid lines */}
      {lines}

      {/* Center point */}
      <circle cx={center} cy={center} r={3} fill="hsl(var(--primary))" />

      {/* Labels */}
      {labels}

      {/* POA label */}
      {showLabels && (
        <text
          x={center + 10}
          y={center - 10}
          fontSize={10}
          fill="hsl(var(--primary))"
          fontWeight="bold"
        >
          POA
        </text>
      )}
    </svg>
  );
}

// Dimensions for reference
export const GRID_DIMENSIONS = {
  defaultSize: 10, // inches (10x10 grid)
  gridSquare: 1, // inch per square
};
