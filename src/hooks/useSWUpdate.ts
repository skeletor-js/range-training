import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface SWUpdateState {
  needsUpdate: boolean;
  updateServiceWorker: () => void;
  dismissUpdate: () => void;
}

export function useSWUpdate(): SWUpdateState {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const sw = registerSW({
      onNeedRefresh() {
        setNeedsUpdate(true);
      },
      onOfflineReady() {
        // App is ready for offline use - could show a toast here
      },
      onRegisteredSW(_swUrl, registration) {
        // Check for updates periodically (every hour)
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
    });

    setUpdateSW(() => sw);
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (updateSW) {
      updateSW(true);
    }
  }, [updateSW]);

  const dismissUpdate = useCallback(() => {
    setNeedsUpdate(false);
  }, []);

  return {
    needsUpdate,
    updateServiceWorker,
    dismissUpdate,
  };
}
