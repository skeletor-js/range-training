interface IndexCardTargetProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * 3x5 Index Card Target SVG
 * Dimensions: 3" x 5" (Vertical orientation)
 */
export function IndexCardTarget({
    width = 150,
    height = 250,
    className = '',
}: IndexCardTargetProps) {
    // Scale factor: 40 pixels per inch
    const scale = 40;
    const cardWidth = 3 * scale;
    const cardHeight = 5 * scale;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${cardWidth} ${cardHeight}`}
            className={className}
            style={{ display: 'block' }}
        >
            {/* Outer padding/shadow area */}
            <rect width={cardWidth} height={cardHeight} fill="#f5f5f5" />

            {/* The Index Card */}
            <rect
                x={2}
                y={2}
                width={cardWidth - 4}
                height={cardHeight - 4}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={1}
            />

            {/* Subtle ID text */}
            <text
                x={cardWidth / 2}
                y={cardHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fill="#e5e5e5"
                fontWeight="bold"
            >
                3 x 5
            </text>
        </svg>
    );
}

export const INDEX_CARD_DIMENSIONS = {
    width: 3,
    height: 5,
};
