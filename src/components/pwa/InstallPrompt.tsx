import { Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  // Already installed - don't show anything
  if (isInstalled) {
    return null;
  }

  // iOS instructions
  if (isIOS) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Install App
          </CardTitle>
          <CardDescription>
            Add Range Training to your home screen for the best experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <span className="bg-muted rounded px-2 py-1 text-xs font-medium">1</span>
              Tap the <Share className="h-4 w-4 inline mx-1" /> Share button
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-muted rounded px-2 py-1 text-xs font-medium">2</span>
              Scroll down and tap "Add to Home Screen"
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-muted rounded px-2 py-1 text-xs font-medium">3</span>
              Tap "Add" to confirm
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard install prompt (Android/Desktop)
  if (!isInstallable) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4" />
          Install App
        </CardTitle>
        <CardDescription>
          Install Range Training for offline access and a native app experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={promptInstall} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Install Now
        </Button>
      </CardContent>
    </Card>
  );
}
