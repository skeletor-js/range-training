interface MOAGridTargetProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * MOA Precision Grid Target
 * 
 * Dimensions:
 * - 1" major grid lines (bold)
 * - 1/4" minor grid lines (thin)
 * - Central red diamond aiming point
 */
export function MOAGridTarget({
    width = 250,
    height = 250,
    className = '',
}: MOAGridTargetProps) {
    const scale = 40; // 40 pixels per inch
    const targetSizeInches = 8;
    const viewSize = targetSizeInches * scale;
    const center = viewSize / 2;

    const gridLines = [];

    // Create the 1/4 inch grid
    const step = scale / 4;
    for (let i = 0; i <= viewSize; i += step) {
        const isMajor = Math.round(i % scale) === 0;
        const color = isMajor ? "#333" : "#e5e5e5";
        const weight = isMajor ? 1 : 0.5;

        // Vertical lines
        gridLines.push(
            <line key={`v-${i}`} x1={i} y1={0} x2={i} y2={viewSize} stroke={color} strokeWidth={weight} />
        );
        // Horizontal lines
        gridLines.push(
            <line key={`h-${i}`} x1={0} y1={i} x2={viewSize} y2={i} stroke={color} strokeWidth={weight} />
        );
    }

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${viewSize} ${viewSize}`}
            className={className}
            style={{ display: 'block' }}
        >
            <rect width={viewSize} height={viewSize} fill="#ffffff" />

            {gridLines}

            {/* Center Aiming Point (Red Diamond) */}
            <path
                d={`
          M ${center}, ${center - 0.25 * scale}
          L ${center + 0.25 * scale}, ${center}
          L ${center}, ${center + 0.25 * scale}
          L ${center - 0.25 * scale}, ${center}
          Z
        `}
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth={1}
            />

            {/* Center Crosshair */}
            <line x1={center - 0.5 * scale} y1={center} x2={center + 0.5 * scale} y2={center} stroke="#ef4444" strokeWidth={1.5} />
            <line x1={center} y1={center - 0.5 * scale} x2={center} y2={center + 0.5 * scale} stroke="#ef4444" strokeWidth={1.5} />
        </svg>
    );
}

export const MOA_GRID_DIMENSIONS = {
    gridSize: 1, // major grid 1 inch
    minorSize: 0.25, // minor grid 0.25 inch
};
