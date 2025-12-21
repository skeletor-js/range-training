import { Play, Pause, RotateCcw, Plus, Bluetooth } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TimerMode } from './RetroLEDTimer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TimerControlsProps {
  isRunning: boolean;
  mode: TimerMode;
  onStartStop: () => void;
  onReset: () => void;
  onAddTime?: () => void;
  className?: string;
}

interface IndustrialButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

function IndustrialButton({
  onClick,
  children,
  variant = 'secondary',
  size = 'md',
  className,
  disabled = false,
}: IndustrialButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-mono uppercase tracking-wider font-bold
    rounded-md border-2
    transition-all duration-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    disabled:pointer-events-none disabled:opacity-50
  `;

  const variantStyles = {
    primary: `
      bg-primary/90 border-primary text-primary-foreground
      shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_0_hsl(25_100%_35%),0_4px_4px_rgba(0,0,0,0.3)]
      hover:bg-primary
      active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_0_hsl(25_100%_35%)]
      active:translate-y-[2px]
    `,
    secondary: `
      bg-zinc-700 border-zinc-600 text-foreground
      shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_3px_0_0_hsl(0_0%_25%),0_4px_4px_rgba(0,0,0,0.3)]
      hover:bg-zinc-600
      active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_0_hsl(0_0%_25%)]
      active:translate-y-[2px]
    `,
    danger: `
      bg-red-600 border-red-500 text-white
      shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_0_hsl(0_84%_40%),0_4px_4px_rgba(0,0,0,0.3)]
      hover:bg-red-500
      active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_0_hsl(0_84%_40%)]
      active:translate-y-[2px]
    `,
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs [&_svg]:size-4',
    md: 'h-11 px-5 text-sm [&_svg]:size-5',
    lg: 'h-14 px-8 text-base [&_svg]:size-6',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </button>
  );
}

export function TimerControls({
  isRunning,
  mode,
  onStartStop,
  onReset,
  onAddTime,
  className,
}: TimerControlsProps) {
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);

  const handleBluetoothClick = async () => {
    // Check if Web Bluetooth API is available
    if ('bluetooth' in navigator && navigator.bluetooth) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (navigator.bluetooth as any).requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service'],
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Bluetooth pairing cancelled or failed:', err);
      }
    } else {
      // Show dialog with instructions
      setShowBluetoothDialog(true);
    }
  };

  return (
    <>
      <div className={cn('flex items-center gap-3', className)}>
        {/* Start/Stop button */}
        <IndustrialButton
          onClick={onStartStop}
          variant={isRunning ? 'danger' : 'primary'}
          size="lg"
        >
          {isRunning ? (
            <>
              <Pause className="fill-current" />
              Stop
            </>
          ) : (
            <>
              <Play className="fill-current" />
              Start
            </>
          )}
        </IndustrialButton>

        {/* Reset button */}
        <IndustrialButton onClick={onReset} variant="secondary" size="md">
          <RotateCcw />
          Reset
        </IndustrialButton>

        {/* Add Time button (countdown mode only) */}
        {mode === 'countdown' && onAddTime && (
          <IndustrialButton onClick={onAddTime} variant="secondary" size="md">
            <Plus />
            +1:00
          </IndustrialButton>
        )}

        {/* Bluetooth button */}
        <IndustrialButton
          onClick={handleBluetoothClick}
          variant="secondary"
          size="md"
          className="ml-auto"
        >
          <Bluetooth />
        </IndustrialButton>
      </div>

      {/* Bluetooth not available dialog */}
      <Dialog open={showBluetoothDialog} onOpenChange={setShowBluetoothDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bluetooth Settings</DialogTitle>
            <DialogDescription>
              Web Bluetooth API is not available in your browser. To connect Bluetooth audio devices:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">On Mobile:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open your device's Settings app</li>
              <li>Navigate to Bluetooth settings</li>
              <li>Pair your audio device</li>
            </ol>
            <p className="font-semibold mt-4">On Desktop:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Try using Chrome, Edge, or Opera browser</li>
              <li>Or access system Bluetooth settings to pair devices</li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { IndustrialButton };
