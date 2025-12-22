import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export function AboutCard() {
  const { debugMode, debugTapCount, incrementDebugTap } = useSettingsStore();

  function handleVersionTap() {
    if (debugMode) return; // Already enabled

    incrementDebugTap();
    const newCount = debugTapCount + 1;

    // Show feedback as user gets closer (via console for now)
    if (newCount === 3) {
      console.log('[Debug] 2 more taps to enable debug mode...');
    } else if (newCount === 4) {
      console.log('[Debug] 1 more tap...');
    } else if (newCount >= 5) {
      console.log('[Debug] Debug mode enabled!');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>
          <span className="font-medium text-foreground">Range App</span>{' '}
          <span
            onClick={handleVersionTap}
            className={cn(
              'cursor-pointer select-none transition-colors',
              debugMode && 'text-yellow-500 font-medium'
            )}
          >
            v0.1.0
          </span>
          {debugMode && (
            <Badge
              variant="outline"
              className="ml-2 text-yellow-500 border-yellow-500"
            >
              DEBUG
            </Badge>
          )}
        </p>
        <p>Track your range sessions, manage ammunition, and measure improvement over time.</p>
        <p>All data is stored locally on your device. No accounts, no cloud, no tracking.</p>
      </CardContent>
    </Card>
  );
}
