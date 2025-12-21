interface USPSATargetProps {
  width?: number;
  height?: number;
  showZones?: boolean;
  className?: string;
}

/**
 * USPSA/IPSC Metric Target SVG
 *
 * Zone dimensions:
 * - A-zone (center): 6" x 11" rectangle in center
 * - C-zone: Area between A-zone and D-zone
 * - D-zone: Full target outline (approx 18" x 30" including head)
 *
 * The target has a distinctive shape with:
 * - Head box at top
 * - Body rectangle below
 */
export function USPSATarget({
  width = 180,
  height = 300,
  showZones = true,
  className = '',
}: USPSATargetProps) {
  // Scale: 10 pixels per inch
  const scale = 10;

  // Target dimensions in inches
  const bodyWidth = 18 * scale;
  const bodyHeight = 23 * scale;
  const headWidth = 6 * scale;
  const headHeight = 7 * scale;

  // A-zone dimensions (center)
  const aZoneWidth = 6 * scale;
  const aZoneHeight = 11 * scale;

  // Viewbox dimensions
  const viewWidth = bodyWidth;
  const viewHeight = headHeight + bodyHeight;

  const centerX = viewWidth / 2;
  const headY = 0;
  const bodyY = headHeight;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className={className}
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width={viewWidth} height={viewHeight} fill="#f5f5dc" />

      {/* D-zone (full target) - tan/brown */}
      <rect
        x={0}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill="#c4a77d"
        stroke="#000"
        strokeWidth={1}
      />

      {/* Head box */}
      <rect
        x={(viewWidth - headWidth) / 2}
        y={headY}
        width={headWidth}
        height={headHeight}
        fill="#c4a77d"
        stroke="#000"
        strokeWidth={1}
      />

      {/* C-zone outline (the entire target minus A-zone) */}
      {/* We'll draw the A-zone on top */}

      {/* A-zone (center rectangle) - darker */}
      <rect
        x={(viewWidth - aZoneWidth) / 2}
        y={bodyY + (bodyHeight - aZoneHeight) / 2}
        width={aZoneWidth}
        height={aZoneHeight}
        fill="#8b7355"
        stroke="#000"
        strokeWidth={2}
      />

      {/* Head A-zone */}
      <rect
        x={(viewWidth - headWidth) / 2 + 5}
        y={headY + 10}
        width={headWidth - 10}
        height={headHeight - 20}
        fill="#8b7355"
        stroke="#000"
        strokeWidth={1}
      />

      {/* Zone labels */}
      {showZones && (
        <>
          <text
            x={centerX}
            y={bodyY + bodyHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={24}
            fontWeight="bold"
            fill="#fff"
          >
            A
          </text>
          <text
            x={centerX - aZoneWidth / 2 - 20}
            y={bodyY + bodyHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fontWeight="bold"
            fill="#000"
          >
            C
          </text>
          <text
            x={centerX + aZoneWidth / 2 + 20}
            y={bodyY + bodyHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fontWeight="bold"
            fill="#000"
          >
            C
          </text>
          <text
            x={20}
            y={bodyY + bodyHeight - 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fontWeight="bold"
            fill="#000"
          >
            D
          </text>
          <text
            x={viewWidth - 20}
            y={bodyY + bodyHeight - 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fontWeight="bold"
            fill="#000"
          >
            D
          </text>
        </>
      )}

      {/* Scoring lines */}
      <line
        x1={(viewWidth - aZoneWidth) / 2}
        y1={bodyY}
        x2={(viewWidth - aZoneWidth) / 2}
        y2={bodyY + bodyHeight}
        stroke="#000"
        strokeWidth={1}
        strokeDasharray="5,5"
      />
      <line
        x1={(viewWidth + aZoneWidth) / 2}
        y1={bodyY}
        x2={(viewWidth + aZoneWidth) / 2}
        y2={bodyY + bodyHeight}
        stroke="#000"
        strokeWidth={1}
        strokeDasharray="5,5"
      />
    </svg>
  );
}

// Dimensions for calibration reference
export const USPSA_DIMENSIONS = {
  targetWidth: 18, // inches
  targetHeight: 30, // inches (including head)
  aZoneWidth: 6, // inches
  aZoneHeight: 11, // inches
};
