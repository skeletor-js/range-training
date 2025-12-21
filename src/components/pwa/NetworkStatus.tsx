import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show nothing if online and was never offline
  if (isOnline && !wasOffline) {
    return null;
  }

  // Show "back online" message briefly after reconnecting
  if (isOnline && wasOffline) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 animate-pulse">
        <Wifi className="h-3 w-3" />
        <span>Back online</span>
      </div>
    );
  }

  // Show offline indicator
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  );
}
