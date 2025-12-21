import { Sun, Volume2, Vibrate } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DisplaySettingsCardProps {
  highGlareMode: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  onToggleHighGlare: () => void;
  onToggleSound: () => void;
  onToggleHaptic: () => void;
}

export function DisplaySettingsCard({
  highGlareMode,
  soundEnabled,
  hapticEnabled,
  onToggleHighGlare,
  onToggleSound,
  onToggleHaptic,
}: DisplaySettingsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Display
        </CardTitle>
        <CardDescription>
          Adjust display settings for different environments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-glare">High-Glare Mode</Label>
            <p className="text-xs text-muted-foreground">
              Larger touch targets and higher contrast for outdoor use
            </p>
          </div>
          <Switch
            id="high-glare"
            checked={highGlareMode}
            onCheckedChange={onToggleHighGlare}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="sound">Sound Effects</Label>
          </div>
          <Switch
            id="sound"
            checked={soundEnabled}
            onCheckedChange={onToggleSound}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="haptic">Haptic Feedback</Label>
          </div>
          <Switch
            id="haptic"
            checked={hapticEnabled}
            onCheckedChange={onToggleHaptic}
          />
        </div>
      </CardContent>
    </Card>
  );
}
