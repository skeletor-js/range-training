interface MultiBullTargetProps {
    width?: number;
    height?: number;
    className?: string;
}

/**
 * 5-Bullseye Precision Target
 * 
 * Dimensions:
 * - 10" x 10" Sheet
 * - 5 Targets (Center + 4 Corners)
 * - Each target has a 3" outer ring and 1" black center
 */
export function MultiBullTarget({
    width = 250,
    height = 250,
    className = '',
}: MultiBullTargetProps) {
    const scale = 30; // 30 pixels per inch
    const targetSize = 10 * scale;
    const center = targetSize / 2;
    const cornerOffset = 2.5 * scale;

    const positions = [
        { x: center, y: center, id: 'C' },
        { x: cornerOffset, y: cornerOffset, id: 'TL' },
        { x: targetSize - cornerOffset, y: cornerOffset, id: 'TR' },
        { x: cornerOffset, y: targetSize - cornerOffset, id: 'BL' },
        { x: targetSize - cornerOffset, y: targetSize - cornerOffset, id: 'BR' },
    ];

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${targetSize} ${targetSize}`}
            className={className}
            style={{ display: 'block' }}
        >
            <rect width={targetSize} height={targetSize} fill="#ffffff" stroke="#e5e5e5" strokeWidth={1} />

            {positions.map((pos) => (
                <g key={pos.id}>
                    {/* Outer Ring (3") */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={1.5 * scale}
                        fill="none"
                        stroke="#cccccc"
                        strokeWidth={1}
                    />
                    {/* Middle Ring (2") */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={1 * scale}
                        fill="none"
                        stroke="#eeeeee"
                        strokeWidth={1}
                    />
                    {/* Black Center (1") */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={0.5 * scale}
                        fill="#333333"
                    />
                    {/* Crosshair */}
                    <line x1={pos.x - 5} y1={pos.y} x2={pos.x + 5} y2={pos.y} stroke="#fff" strokeWidth={0.5} />
                    <line x1={pos.x} y1={pos.y - 5} x2={pos.x} y2={pos.y + 5} stroke="#fff" strokeWidth={0.5} />
                </g>
            ))}
        </svg>
    );
}

export const MULTI_BULL_DIMENSIONS = {
    outerDiameter: 3,
    innerDiameter: 1,
};
