interface DotTortureTargetProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * Dot Torture Target SVG
 * 10 numbered circles, 2" diameter each (1" radius)
 * Designed for an 8.5" x 11" sheet layout
 */
export function DotTortureTarget({
    width = 250,
    height = 330,
    className = '',
}: DotTortureTargetProps) {
    const scale = 40; // 40 pixels per inch
    const targetWidth = 8.5 * scale;
    const targetHeight = 11 * scale;
    const dotRadius = 1 * scale; // 1" radius = 2" diameter

    // Dot coordinates in inches (center of each circle)
    const dots = [
        { x: 2.5, y: 1.5, label: '1' },
        { x: 6.0, y: 1.5, label: '2' },
        { x: 2.5, y: 3.7, label: '3' },
        { x: 6.0, y: 3.7, label: '4' },
        { x: 2.5, y: 5.9, label: '5' },
        { x: 6.0, y: 5.9, label: '6' },
        { x: 2.5, y: 8.1, label: '7' },
        { x: 6.0, y: 8.1, label: '8' },
        { x: 2.5, y: 10.3, label: '9' },
        { x: 6.0, y: 10.3, label: '10' },
    ];

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${targetWidth} ${targetHeight}`}
            className={className}
            style={{ display: 'block' }}
        >
            {/* Paper Background */}
            <rect width={targetWidth} height={targetHeight} fill="#ffffff" stroke="#e5e5e5" strokeWidth={1} />

            {dots.map((dot) => (
                <g key={dot.label}>
                    {/* Dot Outline */}
                    <circle
                        cx={dot.x * scale}
                        cy={dot.y * scale}
                        r={dotRadius}
                        fill="none"
                        stroke="#000000"
                        strokeWidth={1.5}
                    />
                    {/* Dot Number */}
                    <text
                        x={dot.x * scale}
                        y={dot.y * scale}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={24}
                        fontWeight="bold"
                        fill="#000000"
                    >
                        {dot.label}
                    </text>
                </g>
            ))}

            {/* Title */}
            <text
                x={targetWidth / 2}
                y={0.5 * scale}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fill="#ccc"
            >
                DOT TORTURE
            </text>
        </svg>
    );
}

export const DOT_TORTURE_DIMENSIONS = {
    dotDiameter: 2,
    rows: 5,
    cols: 2,
};
