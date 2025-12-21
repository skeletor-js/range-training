interface B8TargetProps {
  width?: number;
  height?: number;
  showRings?: boolean;
  className?: string;
}

/**
 * NRA B-8 Repair Center Target SVG
 * Dimensions: 5.5" outer black (10-ring is 1.695")
 *
 * Ring values from center out:
 * X-ring: 0.85" diameter (not scored separately in some matches)
 * 10-ring: 1.695" diameter
 * 9-ring: 2.545" diameter
 * 8-ring: 3.395" diameter
 * 7-ring: 4.245" diameter
 * 6-ring: 5.095" diameter
 * Black (5-ring): 5.5" diameter
 */
export function B8Target({
  width = 200,
  height = 200,
  showRings = true,
  className = '',
}: B8TargetProps) {
  // Scale factor: we'll render at 100 pixels per inch for the viewBox
  const scale = 100;
  const outerDiameter = 5.5 * scale; // 550px at scale
  const center = outerDiameter / 2;

  // Ring radii (in scaled pixels)
  const rings = [
    { radius: (5.5 / 2) * scale, label: '5', fill: '#000' },
    { radius: (5.095 / 2) * scale, label: '6', fill: '#000' },
    { radius: (4.245 / 2) * scale, label: '7', fill: '#000' },
    { radius: (3.395 / 2) * scale, label: '8', fill: '#fff' },
    { radius: (2.545 / 2) * scale, label: '9', fill: '#fff' },
    { radius: (1.695 / 2) * scale, label: '10', fill: '#fff' },
    { radius: (0.85 / 2) * scale, label: 'X', fill: '#fff' },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${outerDiameter} ${outerDiameter}`}
      className={className}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width={outerDiameter} height={outerDiameter} fill="#f5f5dc" />

      {/* Rings from outer to inner */}
      {rings.map((ring, index) => (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={ring.radius}
          fill={ring.fill}
          stroke={ring.fill === '#000' ? '#fff' : '#000'}
          strokeWidth={1}
        />
      ))}

      {/* Ring labels (optional) */}
      {showRings && (
        <>
          {/* Score numbers positioned between rings */}
          <text
            x={center}
            y={center - (4.67 / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#fff"
            fontWeight="bold"
          >
            6
          </text>
          <text
            x={center}
            y={center - (3.82 / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#fff"
            fontWeight="bold"
          >
            7
          </text>
          <text
            x={center}
            y={center - (2.97 / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#000"
            fontWeight="bold"
          >
            8
          </text>
          <text
            x={center}
            y={center - (2.12 / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#000"
            fontWeight="bold"
          >
            9
          </text>
          <text
            x={center}
            y={center - (1.27 / 2) * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="#000"
            fontWeight="bold"
          >
            10
          </text>
        </>
      )}

      {/* Center crosshair */}
      <line
        x1={center - 5}
        y1={center}
        x2={center + 5}
        y2={center}
        stroke="#666"
        strokeWidth={0.5}
      />
      <line
        x1={center}
        y1={center - 5}
        x2={center}
        y2={center + 5}
        stroke="#666"
        strokeWidth={0.5}
      />
    </svg>
  );
}

// Dimensions for calibration reference
export const B8_DIMENSIONS = {
  outerBlackDiameter: 5.5, // inches
  tenRingDiameter: 1.695, // inches
  xRingDiameter: 0.85, // inches
};
