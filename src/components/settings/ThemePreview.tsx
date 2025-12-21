import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseHSL, formatHSL, getPresetTheme } from '@/lib/themeUtils';
import { Theme, ThemeColorKey } from '@/lib/themes';

interface ThemePreviewProps {
  customTheme: Theme | null;
  currentTheme: string;
  onColorChange: (key: ThemeColorKey, value: string) => void;
  onInitCustomTheme: () => void;
}

interface ColorPickerPopoverProps {
  colorKey: ThemeColorKey;
  colorValue: string;
  onColorChange: (key: ThemeColorKey, value: string) => void;
  onInitCustomTheme: () => void;
  isCustomMode: boolean;
  children: React.ReactNode;
}

function ColorPickerPopover({
  colorKey,
  colorValue,
  onColorChange,
  onInitCustomTheme,
  isCustomMode,
  children,
}: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseHSL(colorValue);
  const [h, setH] = useState(parsed?.h ?? 0);
  const [s, setS] = useState(parsed?.s ?? 0);
  const [l, setL] = useState(parsed?.l ?? 0);

  // Sync local state when value prop changes
  useEffect(() => {
    const newParsed = parseHSL(colorValue);
    if (newParsed) {
      setH(newParsed.h);
      setS(newParsed.s);
      setL(newParsed.l);
    }
  }, [colorValue]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isCustomMode) {
      onInitCustomTheme();
    }
    setOpen(newOpen);
  };

  const handleHueChange = (values: number[]) => {
    const newH = values[0];
    setH(newH);
    onColorChange(colorKey, formatHSL(newH, s, l));
  };

  const handleSaturationChange = (values: number[]) => {
    const newS = values[0];
    setS(newS);
    onColorChange(colorKey, formatHSL(h, newS, l));
  };

  const handleLightnessChange = (values: number[]) => {
    const newL = values[0];
    setL(newL);
    onColorChange(colorKey, formatHSL(h, s, newL));
  };

  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="center">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Hue</Label>
              <span className="text-xs text-muted-foreground">{Math.round(h)}°</span>
            </div>
            <Slider
              value={[h]}
              onValueChange={handleHueChange}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div
              className="h-2 rounded mt-2"
              style={{
                background:
                  'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Saturation</Label>
              <span className="text-xs text-muted-foreground">{Math.round(s)}%</span>
            </div>
            <Slider
              value={[s]}
              onValueChange={handleSaturationChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div
              className="h-2 rounded mt-2"
              style={{
                background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Lightness</Label>
              <span className="text-xs text-muted-foreground">{Math.round(l)}%</span>
            </div>
            <Slider
              value={[l]}
              onValueChange={handleLightnessChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div
              className="h-2 rounded mt-2"
              style={{
                background: `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`,
              }}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Preview</Label>
            </div>
            <div
              className="h-12 rounded border border-border"
              style={{ backgroundColor: previewColor }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ThemePreview({
  customTheme,
  currentTheme,
  onColorChange,
  onInitCustomTheme,
}: ThemePreviewProps) {
  const isCustomMode = currentTheme === 'Custom' && customTheme !== null;

  // Get current colors from custom theme or preset
  const getColorValue = (key: ThemeColorKey): string => {
    if (isCustomMode && customTheme) {
      return customTheme.colors[key] || '0 0% 50%';
    }
    const preset = getPresetTheme(currentTheme);
    if (preset) {
      return preset.colors[key] || '0 0% 50%';
    }
    return '0 0% 50%';
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Theme Preview</h3>
        <Badge variant="secondary">Click to edit</Badge>
      </div>

      <div className="flex gap-2">
        <ColorPickerPopover
          colorKey="primary"
          colorValue={getColorValue('primary')}
          onColorChange={onColorChange}
          onInitCustomTheme={onInitCustomTheme}
          isCustomMode={isCustomMode}
        >
          <Button size="sm" className="flex-1 cursor-pointer">
            Primary
          </Button>
        </ColorPickerPopover>
        <ColorPickerPopover
          colorKey="secondary"
          colorValue={getColorValue('secondary')}
          onColorChange={onColorChange}
          onInitCustomTheme={onInitCustomTheme}
          isCustomMode={isCustomMode}
        >
          <Button size="sm" variant="secondary" className="flex-1 cursor-pointer">
            Secondary
          </Button>
        </ColorPickerPopover>
      </div>

      <div className="flex gap-2">
        <ColorPickerPopover
          colorKey="border"
          colorValue={getColorValue('border')}
          onColorChange={onColorChange}
          onInitCustomTheme={onInitCustomTheme}
          isCustomMode={isCustomMode}
        >
          <Button size="sm" variant="outline" className="flex-1 cursor-pointer">
            Outline
          </Button>
        </ColorPickerPopover>
        <ColorPickerPopover
          colorKey="destructive"
          colorValue={getColorValue('destructive')}
          onColorChange={onColorChange}
          onInitCustomTheme={onInitCustomTheme}
          isCustomMode={isCustomMode}
        >
          <Button size="sm" variant="destructive" className="flex-1 cursor-pointer">
            Destructive
          </Button>
        </ColorPickerPopover>
      </div>

      <ColorPickerPopover
        colorKey="muted"
        colorValue={getColorValue('muted')}
        onColorChange={onColorChange}
        onInitCustomTheme={onInitCustomTheme}
        isCustomMode={isCustomMode}
      >
        <div className="p-3 bg-muted rounded-md cursor-pointer hover:ring-2 hover:ring-ring transition-all">
          <p className="text-xs text-muted-foreground">
            This is muted text on a muted background.
          </p>
        </div>
      </ColorPickerPopover>

      <ColorPickerPopover
        colorKey="accent"
        colorValue={getColorValue('accent')}
        onColorChange={onColorChange}
        onInitCustomTheme={onInitCustomTheme}
        isCustomMode={isCustomMode}
      >
        <div className="p-3 bg-accent rounded-md cursor-pointer hover:ring-2 hover:ring-ring transition-all">
          <p className="text-xs text-accent-foreground">
            This is accent text on an accent background.
          </p>
        </div>
      </ColorPickerPopover>
    </Card>
  );
}
