import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { parseHSL, formatHSL } from '@/lib/themeUtils';

interface ColorPickerProps {
  label: string;
  value: string; // HSL string like "200 100% 50%"
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseHSL(value);
  const [h, setH] = useState(parsed?.h ?? 0);
  const [s, setS] = useState(parsed?.s ?? 0);
  const [l, setL] = useState(parsed?.l ?? 0);

  // Update local state when value prop changes
  if (parsed && (parsed.h !== h || parsed.s !== s || parsed.l !== l)) {
    setH(parsed.h);
    setS(parsed.s);
    setL(parsed.l);
  }

  const handleHueChange = (values: number[]) => {
    const newH = values[0];
    setH(newH);
    onChange(formatHSL(newH, s, l));
  };

  const handleSaturationChange = (values: number[]) => {
    const newS = values[0];
    setS(newS);
    onChange(formatHSL(h, newS, l));
  };

  const handleLightnessChange = (values: number[]) => {
    const newL = values[0];
    setL(newL);
    onChange(formatHSL(h, s, newL));
  };

  // Generate preview color
  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-medium min-w-[140px]">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-start gap-2"
          >
            <div
              className="h-5 w-5 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: previewColor }}
            />
            <span className="text-xs font-mono">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
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
                  background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
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
                className="h-16 rounded border border-border"
                style={{ backgroundColor: previewColor }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
