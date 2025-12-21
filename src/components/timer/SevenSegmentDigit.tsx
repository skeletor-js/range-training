import { cn } from '@/lib/utils';

interface SevenSegmentDigitProps {
  value: string;
  height?: number;
  color?: string;
  className?: string;
}

// Segment mapping for digits 0-9 and special characters
// Segments: [a, b, c, d, e, f, g] - classic 7-segment arrangement
//    aaa
//   f   b
//   f   b
//    ggg
//   e   c
//   e   c
//    ddd
const SEGMENT_MAP: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
  '-': [false, false, false, false, false, false, true],
  ' ': [false, false, false, false, false, false, false],
};

// SVG path data for each segment - trapezoid shapes
const SEGMENT_PATHS = {
  a: 'M 2,0 L 18,0 L 16,4 L 4,4 Z',
  b: 'M 20,2 L 20,18 L 16,16 L 16,4 Z',
  c: 'M 20,22 L 20,38 L 16,36 L 16,24 Z',
  d: 'M 2,40 L 18,40 L 16,36 L 4,36 Z',
  e: 'M 0,22 L 4,24 L 4,36 L 0,38 Z',
  f: 'M 0,2 L 4,4 L 4,16 L 0,18 Z',
  g: 'M 2,20 L 4,18 L 16,18 L 18,20 L 16,22 L 4,22 Z',
};

export function SevenSegmentDigit({
  value,
  height = 40,
  color = '#f59e0b',
  className,
}: SevenSegmentDigitProps) {
  const segments = SEGMENT_MAP[value] || SEGMENT_MAP['-'];
  const scale = height / 40;

  return (
    <svg
      width={20 * scale}
      height={height}
      viewBox="0 0 20 40"
      className={cn('seven-segment-digit', className)}
      style={{ margin: `0 ${2 * scale}px` }}
    >
      {/* Segment A - top horizontal */}
      <path
        d={SEGMENT_PATHS.a}
        fill={color}
        style={{
          opacity: segments[0] ? 1 : 0.1,
          filter: segments[0] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment B - top right vertical */}
      <path
        d={SEGMENT_PATHS.b}
        fill={color}
        style={{
          opacity: segments[1] ? 1 : 0.1,
          filter: segments[1] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment C - bottom right vertical */}
      <path
        d={SEGMENT_PATHS.c}
        fill={color}
        style={{
          opacity: segments[2] ? 1 : 0.1,
          filter: segments[2] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment D - bottom horizontal */}
      <path
        d={SEGMENT_PATHS.d}
        fill={color}
        style={{
          opacity: segments[3] ? 1 : 0.1,
          filter: segments[3] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment E - bottom left vertical */}
      <path
        d={SEGMENT_PATHS.e}
        fill={color}
        style={{
          opacity: segments[4] ? 1 : 0.1,
          filter: segments[4] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment F - top left vertical */}
      <path
        d={SEGMENT_PATHS.f}
        fill={color}
        style={{
          opacity: segments[5] ? 1 : 0.1,
          filter: segments[5] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
      {/* Segment G - middle horizontal */}
      <path
        d={SEGMENT_PATHS.g}
        fill={color}
        style={{
          opacity: segments[6] ? 1 : 0.1,
          filter: segments[6] ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
          transition: 'opacity 100ms, filter 100ms',
        }}
      />
    </svg>
  );
}

interface SevenSegmentDisplayProps {
  value: string;
  count?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function SevenSegmentDisplay({
  value,
  count = 2,
  height = 40,
  color = '#f59e0b',
  className,
}: SevenSegmentDisplayProps) {
  // Pad value to match count
  const paddedValue = value.padStart(count, '0').slice(-count);

  return (
    <div className={cn('flex items-center', className)}>
      {paddedValue.split('').map((char, index) => (
        <SevenSegmentDigit
          key={index}
          value={char}
          height={height}
          color={color}
        />
      ))}
    </div>
  );
}
