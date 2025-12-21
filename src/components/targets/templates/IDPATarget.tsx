interface IDPATargetProps {
    width?: number;
    height?: number;
    showZones?: boolean;
    className?: string;
}

/**
 * IDPA (International Defensive Pistol Association) Target SVG
 * 
 * Dimensions:
 * - Total Width: 18"
 * - Total Height: 30"
 * - Head: 6" x 6"
 * - -0 Body Zone: 8" circle
 * - -1 Body Zone: 12" circle
 * - -0 Head Zone: 4" x 4" square
 */
export function IDPATarget({
    width = 180,
    height = 300,
    showZones = true,
    className = '',
}: IDPATargetProps) {
    const scale = 10; // 10 pixels per inch
    const targetWidth = 18 * scale;
    const targetHeight = 30 * scale;
    const headWidth = 6 * scale;
    const headHeight = 6 * scale;
    const centerX = targetWidth / 2;

    // Body circle centers (approx 9" below top of body/neck)
    const circleCenterY = headHeight + 9 * scale;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${targetWidth} ${targetHeight}`}
            className={className}
            style={{ display: 'block' }}
        >
            {/* Background */}
            <rect width={targetWidth} height={targetHeight} fill="#f5f5f5" />

            {/* Silhouette Outline (-3 zone) */}
            <path
                d={`
          M ${centerX - headWidth / 2}, 0
          h ${headWidth}
          v ${headHeight}
          h ${(targetWidth - headWidth) / 2}
          v ${targetHeight - headHeight}
          h -${targetWidth}
          v -${targetHeight - headHeight}
          h ${(targetWidth - headWidth) / 2}
          Z
        `}
                fill="#c4a77d"
                stroke="#000"
                strokeWidth={1}
            />

            {/* -1 Body Zone (12" circle) */}
            <circle
                cx={centerX}
                cy={circleCenterY}
                r={6 * scale}
                fill="none"
                stroke="#000"
                strokeWidth={1}
                strokeDasharray="5,5"
            />

            {/* -0 Body Zone (8" circle) */}
            <circle
                cx={centerX}
                cy={circleCenterY}
                r={4 * scale}
                fill="#8b7355"
                stroke="#000"
                strokeWidth={1}
            />

            {/* -0 Head Zone (4" x 4" box) */}
            <rect
                x={centerX - 2 * scale}
                y={1 * scale}
                width={4 * scale}
                height={4 * scale}
                fill="#8b7355"
                stroke="#000"
                strokeWidth={1}
            />

            {showZones && (
                <>
                    {/* Labels */}
                    <text
                        x={centerX}
                        y={circleCenterY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={24}
                        fontWeight="bold"
                        fill="#fff"
                    >
                        -0
                    </text>
                    <text
                        x={centerX}
                        y={3 * scale}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={16}
                        fontWeight="bold"
                        fill="#fff"
                    >
                        -0
                    </text>
                    <text
                        x={centerX + 7 * scale}
                        y={circleCenterY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={18}
                        fontWeight="bold"
                        fill="#000"
                    >
                        -1
                    </text>
                    <text
                        x={3 * scale}
                        y={targetHeight - 3 * scale}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={18}
                        fontWeight="bold"
                        fill="#000"
                    >
                        -3
                    </text>
                </>
            )}
        </svg>
    );
}

export const IDPA_DIMENSIONS = {
    width: 18,
    height: 30,
    downZeroDiameter: 8,
};
