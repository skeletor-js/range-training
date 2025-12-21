import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSWUpdate } from '@/hooks/useSWUpdate';

export function UpdateNotification() {
  const { needsUpdate, updateServiceWorker, dismissUpdate } = useSWUpdate();

  if (!needsUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Update Available</p>
            <p className="text-sm opacity-90 mt-1">
              A new version of Range Training is ready.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={updateServiceWorker}
                className="text-xs"
              >
                Update Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissUpdate}
                className="text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={dismissUpdate}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
