import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GroupMetrics } from '@/types';

interface CaptureSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: GroupMetrics | null;
  onClose: () => void;
}

export function CaptureSummary({
  open,
  onOpenChange,
  metrics,
  onClose,
}: CaptureSummaryProps) {
  if (!metrics) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Target Captured!</DialogTitle>
          <DialogDescription>
            Here is the summary of your shooting group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">
                Shots
              </span>
              <span className="text-2xl font-bold">{metrics.shotCount}</span>
            </div>
            <div className="flex flex-col space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">
                Group Size
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {metrics.extremeSpread.toFixed(2)}&quot;
                </span>
                <span className="text-xs text-muted-foreground">
                  {metrics.groupSizeMoa.toFixed(2)} MOA
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">
                Mean Radius
              </span>
              <span className="text-2xl font-bold">
                {metrics.meanRadius.toFixed(2)}&quot;
              </span>
            </div>
            <div className="flex flex-col space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">
                Center Offset
              </span>
              <div className="flex flex-col text-sm font-semibold">
                <span>X: {metrics.groupCenterX.toFixed(2)}&quot;</span>
                <span>Y: {metrics.groupCenterY.toFixed(2)}&quot;</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
