import { Theme, DEFAULT_RADIUS } from './themes';
import presetThemes from '@/data/themes.json';

// Convert camelCase to kebab-case for CSS variables
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Apply a theme to the document root by setting CSS variables
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${toKebabCase(key)}`;
    root.style.setProperty(cssVar, value);
  });

  // Apply radius
  root.style.setProperty('--radius', theme.radius || DEFAULT_RADIUS);
}

/**
 * Validate theme JSON structure
 */
export function validateTheme(json: unknown): Theme | null {
  if (!json || typeof json !== 'object') return null;

  const obj = json as Record<string, unknown>;

  // Check for required properties
  if (typeof obj.name !== 'string') return null;
  if (!obj.colors || typeof obj.colors !== 'object') return null;

  const colors = obj.colors as Record<string, unknown>;

  // Required color keys
  const requiredKeys = [
    'background',
    'foreground',
    'primary',
    'primaryForeground',
    'secondary',
    'secondaryForeground',
    'muted',
    'mutedForeground',
    'accent',
    'accentForeground',
    'destructive',
    'destructiveForeground',
    'border',
    'input',
    'ring',
    'card',
    'cardForeground',
    'popover',
    'popoverForeground',
  ];

  // Validate all required keys exist and are strings
  for (const key of requiredKeys) {
    if (typeof colors[key] !== 'string') return null;
  }

  // Construct validated theme
  const theme: Theme = {
    name: obj.name,
    colors: {
      background: colors.background as string,
      foreground: colors.foreground as string,
      primary: colors.primary as string,
      primaryForeground: colors.primaryForeground as string,
      secondary: colors.secondary as string,
      secondaryForeground: colors.secondaryForeground as string,
      muted: colors.muted as string,
      mutedForeground: colors.mutedForeground as string,
      accent: colors.accent as string,
      accentForeground: colors.accentForeground as string,
      destructive: colors.destructive as string,
      destructiveForeground: colors.destructiveForeground as string,
      border: colors.border as string,
      input: colors.input as string,
      ring: colors.ring as string,
      card: colors.card as string,
      cardForeground: colors.cardForeground as string,
      popover: colors.popover as string,
      popoverForeground: colors.popoverForeground as string,
    },
    radius: typeof obj.radius === 'string' ? obj.radius : DEFAULT_RADIUS,
  };

  return theme;
}

/**
 * Export theme as JSON string
 */
export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Get preset themes
 */
export function getPresetThemes(): Theme[] {
  return presetThemes as Theme[];
}

/**
 * Get a preset theme by name
 */
export function getPresetTheme(name: string): Theme | undefined {
  return getPresetThemes().find((t) => t.name === name);
}

/**
 * Parse HSL color string into components
 * Example: "200 100% 50%" -> { h: 200, s: 100, l: 50 }
 */
export function parseHSL(hsl: string): { h: number; s: number; l: number } | null {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length !== 3) return null;

  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1].replace('%', ''));
  const l = parseFloat(parts[2].replace('%', ''));

  if (isNaN(h) || isNaN(s) || isNaN(l)) return null;

  return { h, s, l };
}

/**
 * Format HSL components to string
 * Example: { h: 200, s: 100, l: 50 } -> "200 100% 50%"
 */
export function formatHSL(h: number, s: number, l: number): string {
  // Normalize values
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}
