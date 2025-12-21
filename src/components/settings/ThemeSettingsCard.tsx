import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getPresetThemes, exportTheme, validateTheme, getPresetTheme } from '@/lib/themeUtils';
import { ColorPicker } from './ColorPicker';
import { ThemePreview } from './ThemePreview';
import { cn } from '@/lib/utils';
import { DEFAULT_RADIUS } from '@/lib/themes';

export function ThemeSettingsCard() {
  const [showCustomize, setShowCustomize] = useState(false);
  const currentTheme = useSettingsStore((state) => state.currentTheme);
  const customTheme = useSettingsStore((state) => state.customTheme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setCustomTheme = useSettingsStore((state) => state.setCustomTheme);
  const updateThemeColor = useSettingsStore((state) => state.updateThemeColor);
  const updateThemeRadius = useSettingsStore((state) => state.updateThemeRadius);

  const presetThemes = getPresetThemes();

  // Get the active theme for editing
  const activeTheme = currentTheme === 'Custom' && customTheme
    ? customTheme
    : getPresetTheme(currentTheme) || presetThemes[0];

  const handlePresetSelect = (themeName: string) => {
    setTheme(themeName);
  };

  const handleCustomize = () => {
    // Initialize custom theme with current preset
    const preset = getPresetTheme(currentTheme);
    if (preset) {
      setCustomTheme({ ...preset, name: 'Custom' });
    }
    setShowCustomize(true);
  };

  const handleRadiusChange = (values: number[]) => {
    const remValue = values[0] / 10; // Convert to rem
    updateThemeRadius(`${remValue}rem`);
  };

  const handleExport = () => {
    const themeToExport = currentTheme === 'Custom' && customTheme
      ? customTheme
      : getPresetTheme(currentTheme);

    if (!themeToExport) return;

    const json = exportTheme(themeToExport);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeToExport.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const theme = validateTheme(json);

        if (theme) {
          setCustomTheme(theme);
        } else {
          alert('Invalid theme file format');
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Failed to import theme file');
      }
    };
    input.click();
  };

  const handleReset = () => {
    setTheme('Default');
    setShowCustomize(false);
  };

  // Parse radius for slider (convert rem to tenths)
  const radiusValue = parseFloat(activeTheme.radius || DEFAULT_RADIUS) * 10;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Theme Selector */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Preset Themes</Label>
          <div className="grid grid-cols-3 gap-2">
            {presetThemes.map((theme) => {
              const isActive = currentTheme === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => handlePresetSelect(theme.name)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    />
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    />
                  </div>
                  <p className="text-xs font-medium">{theme.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Theme Indicator */}
        {currentTheme === 'Custom' && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex-1">
              <p className="text-sm font-medium">Custom Theme Active</p>
              <p className="text-xs text-muted-foreground">
                Your personalized color scheme is applied
              </p>
            </div>
          </div>
        )}

        {/* Customize Button */}
        <Button
          onClick={() => currentTheme === 'Custom' ? setShowCustomize(!showCustomize) : handleCustomize()}
          variant="outline"
          className="w-full"
        >
          {showCustomize ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          {currentTheme === 'Custom' ? (showCustomize ? 'Hide' : 'Show') + ' Customization' : 'Customize Theme'}
        </Button>

        {/* Custom Color Editor */}
        {showCustomize && currentTheme === 'Custom' && customTheme && (
          <div className="space-y-4 pt-2">
            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Base Colors</h4>
              <ColorPicker
                label="Background"
                value={customTheme.colors.background}
                onChange={(value) => updateThemeColor('background', value)}
              />
              <ColorPicker
                label="Foreground"
                value={customTheme.colors.foreground}
                onChange={(value) => updateThemeColor('foreground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Primary</h4>
              <ColorPicker
                label="Primary"
                value={customTheme.colors.primary}
                onChange={(value) => updateThemeColor('primary', value)}
              />
              <ColorPicker
                label="Primary Foreground"
                value={customTheme.colors.primaryForeground}
                onChange={(value) => updateThemeColor('primaryForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Secondary</h4>
              <ColorPicker
                label="Secondary"
                value={customTheme.colors.secondary}
                onChange={(value) => updateThemeColor('secondary', value)}
              />
              <ColorPicker
                label="Secondary Foreground"
                value={customTheme.colors.secondaryForeground}
                onChange={(value) => updateThemeColor('secondaryForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Accent</h4>
              <ColorPicker
                label="Accent"
                value={customTheme.colors.accent}
                onChange={(value) => updateThemeColor('accent', value)}
              />
              <ColorPicker
                label="Accent Foreground"
                value={customTheme.colors.accentForeground}
                onChange={(value) => updateThemeColor('accentForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Muted</h4>
              <ColorPicker
                label="Muted"
                value={customTheme.colors.muted}
                onChange={(value) => updateThemeColor('muted', value)}
              />
              <ColorPicker
                label="Muted Foreground"
                value={customTheme.colors.mutedForeground}
                onChange={(value) => updateThemeColor('mutedForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Destructive</h4>
              <ColorPicker
                label="Destructive"
                value={customTheme.colors.destructive}
                onChange={(value) => updateThemeColor('destructive', value)}
              />
              <ColorPicker
                label="Destructive Foreground"
                value={customTheme.colors.destructiveForeground}
                onChange={(value) => updateThemeColor('destructiveForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">UI Elements</h4>
              <ColorPicker
                label="Border"
                value={customTheme.colors.border}
                onChange={(value) => updateThemeColor('border', value)}
              />
              <ColorPicker
                label="Input"
                value={customTheme.colors.input}
                onChange={(value) => updateThemeColor('input', value)}
              />
              <ColorPicker
                label="Ring"
                value={customTheme.colors.ring}
                onChange={(value) => updateThemeColor('ring', value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Surfaces</h4>
              <ColorPicker
                label="Card"
                value={customTheme.colors.card}
                onChange={(value) => updateThemeColor('card', value)}
              />
              <ColorPicker
                label="Card Foreground"
                value={customTheme.colors.cardForeground}
                onChange={(value) => updateThemeColor('cardForeground', value)}
              />
              <ColorPicker
                label="Popover"
                value={customTheme.colors.popover}
                onChange={(value) => updateThemeColor('popover', value)}
              />
              <ColorPicker
                label="Popover Foreground"
                value={customTheme.colors.popoverForeground}
                onChange={(value) => updateThemeColor('popoverForeground', value)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Border Radius</h4>
              <div className="flex items-center gap-4">
                <Label className="text-sm min-w-[100px]">Radius</Label>
                <Slider
                  value={[radiusValue]}
                  onValueChange={handleRadiusChange}
                  min={0}
                  max={16}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[50px]">
                  {customTheme.radius || DEFAULT_RADIUS}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Theme Preview */}
        <div>
          <ThemePreview
            customTheme={customTheme}
            currentTheme={currentTheme}
            onColorChange={updateThemeColor}
            onInitCustomTheme={handleCustomize}
          />
        </div>

        {/* Import/Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleImport} variant="outline" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
