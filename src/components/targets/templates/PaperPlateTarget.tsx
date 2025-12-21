interface PaperPlateTargetProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * 9" Paper Plate Target SVG
 * Dimensions: 9" diameter circle
 */
export function PaperPlateTarget({
    width = 200,
    height = 200,
    className = '',
}: PaperPlateTargetProps) {
    // Scale factor: 30 pixels per inch
    const scale = 30;
    const viewSize = 9 * scale;
    const center = viewSize / 2;
    const radius = (9 / 2) * scale;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${viewSize} ${viewSize}`}
            className={className}
            style={{ display: 'block' }}
        >
            {/* Background */}
            <rect width={viewSize} height={viewSize} fill="#f5f5f5" />

            {/* The Plate */}
            <circle
                cx={center}
                cy={center}
                r={radius - 2}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={1}
            />

            {/* Subtle inner ring for "plate" look */}
            <circle
                cx={center}
                cy={center}
                r={radius - 20}
                fill="none"
                stroke="#f0f0f0"
                strokeWidth={1}
            />

            {/* Subtle ID text */}
            <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                fill="#f0f0f0"
                fontWeight="bold"
            >
                9" PLATE
            </text>
        </svg>
    );
}

export const PAPER_PLATE_DIMENSIONS = {
    diameter: 9,
};
