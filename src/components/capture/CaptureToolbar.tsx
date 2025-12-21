import { ArrowLeft, Undo2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CaptureMode } from '@/types';

interface CaptureToolbarProps {
  mode: CaptureMode;
  shotCount: number;
  onBack: () => void;
  onUndo: () => void;
  onDone: () => void;
  onReset: () => void;
  canUndo: boolean;
  canDone: boolean;
}

const MODE_LABELS: Record<CaptureMode, string> = {
  idle: 'Select Image',
  calibrating: 'Calibrate',
  'setting-poa': 'Set Point of Aim',
  'marking-shots': 'Mark Shots',
  review: 'Review',
};

const MODE_INSTRUCTIONS: Record<CaptureMode, string> = {
  idle: 'Take a photo or select from gallery',
  calibrating: 'Align the template or set custom reference',
  'setting-poa': 'Tap on the point of aim (center of target)',
  'marking-shots': 'Tap on each shot hole',
  review: 'Review your shots and save',
};

export function CaptureToolbar({
  mode,
  shotCount,
  onBack,
  onUndo,
  onDone,
  onReset,
  canUndo,
  canDone,
}: CaptureToolbarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/90 to-transparent pb-8">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold">{MODE_LABELS[mode]}</span>
            {mode === 'marking-shots' && (
              <Badge variant="secondary">{shotCount} shots</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MODE_INSTRUCTIONS[mode]}
          </p>
        </div>

        <div className="flex gap-1">
          {mode === 'marking-shots' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                disabled={shotCount === 0}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </>
          )}
          {(mode === 'marking-shots' || mode === 'review') && (
            <Button
              variant="default"
              size="sm"
              onClick={onDone}
              disabled={!canDone}
            >
              <Check className="h-4 w-4 mr-1" />
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
