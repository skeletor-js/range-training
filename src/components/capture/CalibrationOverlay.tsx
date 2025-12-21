import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TARGET_PRESETS, type TargetPreset, COMMON_DISTANCES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalibrationOverlayProps {
  imageWidth: number;
  imageHeight: number;
  distanceYards: number;
  onDistanceChange: (distance: number) => void;
  onPresetCalibrate: (preset: TargetPreset, renderedPixelDimension: number) => void;
  onCustomCalibrate: (point1: { x: number; y: number }, point2: { x: number; y: number }, inches: number) => void;
  onCancel: () => void;
}

export function CalibrationOverlay({
  imageWidth,
  imageHeight,
  distanceYards,
  onDistanceChange,
  onPresetCalibrate,
  onCustomCalibrate,
  onCancel,
}: CalibrationOverlayProps) {
  const [calibrationMode, setCalibrationMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(TARGET_PRESETS[0].id);
  const [presetScale, setPresetScale] = useState(100); // percentage scale

  // Custom calibration state
  const [customInches, setCustomInches] = useState('5.5');
  const [customPoint1, setCustomPoint1] = useState<{ x: number; y: number } | null>(null);
  const [customPoint2, setCustomPoint2] = useState<{ x: number; y: number } | null>(null);

  const selectedPreset = TARGET_PRESETS.find((p) => p.id === selectedPresetId);

  const handlePresetConfirm = () => {
    if (!selectedPreset) return;

    // Calculate the rendered pixel dimension based on scale
    // Assume the preset fills about 60% of the smaller image dimension at 100% scale
    const baseSize = Math.min(imageWidth, imageHeight) * 0.6;
    const renderedSize = (baseSize * presetScale) / 100;

    onPresetCalibrate(selectedPreset, renderedSize);
  };

  const handleCustomConfirm = () => {
    if (!customPoint1 || !customPoint2) return;
    const inches = parseFloat(customInches);
    if (isNaN(inches) || inches <= 0) return;

    onCustomCalibrate(customPoint1, customPoint2, inches);
  };

  // Simulate point selection for custom calibration
  const handleCustomPointClick = (pointNum: 1 | 2) => {
    // In a real implementation, this would let the user tap on the image
    // For now, we'll use preset positions as a simple demo
    if (pointNum === 1) {
      setCustomPoint1({ x: imageWidth * 0.3, y: imageHeight * 0.5 });
    } else {
      setCustomPoint2({ x: imageWidth * 0.7, y: imageHeight * 0.5 });
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-16">
      <Card>
        <CardContent className="pt-4">
          {/* Distance selector */}
          <div className="mb-4">
            <Label htmlFor="distance">Distance to Target</Label>
            <Select
              value={distanceYards.toString()}
              onValueChange={(v) => onDistanceChange(parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_DISTANCES.map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    {d} yards
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={calibrationMode}
            onValueChange={(v) => setCalibrationMode(v as 'preset' | 'custom')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Preset Target</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-4">
              <div>
                <Label htmlFor="preset">Target Type</Label>
                <Select
                  value={selectedPresetId}
                  onValueChange={setSelectedPresetId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreset && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPreset.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="scale">
                  Scale: {presetScale}%
                </Label>
                <input
                  type="range"
                  id="scale"
                  min="50"
                  max="200"
                  value={presetScale}
                  onChange={(e) => setPresetScale(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust to match your target size in the image
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handlePresetConfirm}>
                  Apply
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set two reference points on a known measurement.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={customPoint1 ? 'secondary' : 'outline'}
                  onClick={() => handleCustomPointClick(1)}
                >
                  {customPoint1 ? 'Point 1 Set' : 'Set Point 1'}
                </Button>
                <Button
                  variant={customPoint2 ? 'secondary' : 'outline'}
                  onClick={() => handleCustomPointClick(2)}
                >
                  {customPoint2 ? 'Point 2 Set' : 'Set Point 2'}
                </Button>
              </div>

              <div>
                <Label htmlFor="customInches">Distance (inches)</Label>
                <Input
                  id="customInches"
                  type="number"
                  step="0.1"
                  value={customInches}
                  onChange={(e) => setCustomInches(e.target.value)}
                  placeholder="e.g., 5.5"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCustomConfirm}
                  disabled={!customPoint1 || !customPoint2}
                >
                  Apply
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
