import { Sun, Volume2, Vibrate, Mic, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface DisplaySettingsCardProps {
  highGlareMode: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  shotDetectionEnabled: boolean;
  shotDetectionSensitivity: number;
  lowStockThreshold: number;
  lowStockWarningsEnabled: boolean;
  onToggleHighGlare: () => void;
  onToggleSound: () => void;
  onToggleHaptic: () => void;
  onToggleShotDetection: () => void;
  onShotDetectionSensitivityChange: (value: number) => void;
  onToggleLowStockWarnings: () => void;
  onLowStockThresholdChange: (value: number) => void;
}

export function DisplaySettingsCard({
  highGlareMode,
  soundEnabled,
  hapticEnabled,
  shotDetectionEnabled,
  shotDetectionSensitivity,
  lowStockThreshold,
  lowStockWarningsEnabled,
  onToggleHighGlare,
  onToggleSound,
  onToggleHaptic,
  onToggleShotDetection,
  onShotDetectionSensitivityChange,
  onToggleLowStockWarnings,
  onLowStockThresholdChange,
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

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="shot-detection">Shot Detection</Label>
            </div>
            <Switch
              id="shot-detection"
              checked={shotDetectionEnabled}
              onCheckedChange={onToggleShotDetection}
            />
          </div>

          {shotDetectionEnabled && (
            <div className="pl-6 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sensitivity" className="text-sm text-muted-foreground">
                  Sensitivity
                </Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {shotDetectionSensitivity}%
                </span>
              </div>
              <Slider
                id="sensitivity"
                value={[shotDetectionSensitivity]}
                onValueChange={(values) => onShotDetectionSensitivityChange(values[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Auto-stop timer when gunshot detected via microphone
              </p>
            </div>
          )}
        </div>

        {/* Low Stock Warnings */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="low-stock">Low Stock Warnings</Label>
            </div>
            <Switch
              id="low-stock"
              checked={lowStockWarningsEnabled}
              onCheckedChange={onToggleLowStockWarnings}
            />
          </div>

          {lowStockWarningsEnabled && (
            <div className="pl-6 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="threshold" className="text-sm text-muted-foreground">
                  Threshold (rounds)
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={(e) => onLowStockThresholdChange(parseInt(e.target.value) || 50)}
                  className="w-24"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Show warning when ammo count falls below this number
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
