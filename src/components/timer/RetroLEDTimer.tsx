import { SevenSegmentDisplay } from './SevenSegmentDigit';
import { useTimer, playBeep } from './useTimer';
import { TimerControls } from './TimerControls';
import { cn } from '@/lib/utils';

export type TimerMode = 'countdown' | 'stopwatch';
export type TimerColor = 'amber' | 'red' | 'green';

interface RetroLEDTimerProps {
  mode: TimerMode;
  initialSeconds?: number;
  parTime?: number;
  color?: TimerColor;
  onComplete?: () => void;
  onTimeCapture?: (seconds: number) => void;
  showControls?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<TimerColor, string> = {
  amber: '#f59e0b',
  red: '#ef4444',
  green: '#22c55e',
};

const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
  sm: 24,
  md: 36,
  lg: 48,
};

function formatTime(seconds: number): { minutes: string; secs: string; hundredths: string } {
  const totalHundredths = Math.floor(seconds * 100);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = totalHundredths % 100;

  return {
    minutes: mins.toString().padStart(2, '0'),
    secs: secs.toString().padStart(2, '0'),
    hundredths: hundredths.toString().padStart(2, '0'),
  };
}

export function RetroLEDTimer({
  mode,
  initialSeconds = 0,
  parTime,
  color = 'amber',
  onComplete,
  onTimeCapture,
  showControls = true,
  className,
  size = 'md',
}: RetroLEDTimerProps) {
  const {
    seconds,
    isRunning,
    start,
    stop,
    reset,
    addTime,
  } = useTimer({
    mode,
    initialSeconds,
    onComplete,
  });

  const time = formatTime(seconds);
  const displayColor = colorMap[color];
  const displaySize = sizeMap[size];

  const handleStartStop = () => {
    if (isRunning) {
      stop();
      playBeep(440, 100);
      onTimeCapture?.(seconds);
    } else {
      start();
      playBeep(880, 100);
    }
  };

  const handleReset = () => {
    reset();
    playBeep(330, 100);
  };

  const handleAddTime = () => {
    addTime(60);
    playBeep(660, 100);
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Industrial frame */}
      <div className="relative">
        {/* Outer bezel */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-zinc-600 to-zinc-800 -m-1.5" />

        {/* Screws */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />

        {/* Display panel */}
        <div
          className="relative rounded bg-zinc-950 p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
          style={{
            boxShadow: `inset 0 2px 8px rgba(0,0,0,0.8), 0 0 30px ${displayColor}15`,
          }}
        >
          {/* LED Display */}
          <div className="flex items-end justify-center">
            {/* Minutes */}
            <SevenSegmentDisplay
              value={time.minutes}
              count={2}
              height={displaySize}
              color={displayColor}
            />

            {/* Colon separator */}
            <div className="flex flex-col gap-2 mx-2 mb-1">
              <div
                className="w-2 h-2 rounded-full transition-opacity duration-100"
                style={{
                  backgroundColor: displayColor,
                  boxShadow: `0 0 8px ${displayColor}`,
                  opacity: isRunning ? (Math.floor(seconds * 2) % 2 === 0 ? 1 : 0.15) : 1,
                }}
              />
              <div
                className="w-2 h-2 rounded-full transition-opacity duration-100"
                style={{
                  backgroundColor: displayColor,
                  boxShadow: `0 0 8px ${displayColor}`,
                  opacity: isRunning ? (Math.floor(seconds * 2) % 2 === 0 ? 1 : 0.15) : 1,
                }}
              />
            </div>

            {/* Seconds */}
            <SevenSegmentDisplay
              value={time.secs}
              count={2}
              height={displaySize}
              color={displayColor}
            />

            {/* Decimal point */}
            <div
              className="w-1.5 h-1.5 rounded-full mx-1 mb-1"
              style={{
                backgroundColor: displayColor,
                boxShadow: `0 0 6px ${displayColor}`,
              }}
            />

            {/* Hundredths */}
            <SevenSegmentDisplay
              value={time.hundredths}
              count={2}
              height={displaySize * 0.65}
              color={displayColor}
            />
          </div>

          {/* Par time indicator */}
          {parTime && (
            <div className="text-center mt-3 text-xs text-muted-foreground font-mono tracking-wider">
              PAR: {parTime.toFixed(2)}s
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <TimerControls
          isRunning={isRunning}
          mode={mode}
          onStartStop={handleStartStop}
          onReset={handleReset}
          onAddTime={handleAddTime}
        />
      )}
    </div>
  );
}
