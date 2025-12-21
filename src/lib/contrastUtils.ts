import { Theme } from './themes';
import { parseHSL, formatHSL } from './themeUtils';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert HSL to RGB
 * Used for calculating relative luminance
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Calculate relative luminance per WCAG 2.1 formula
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two HSL colors
 * Returns a value from 1 to 21
 */
export function getContrastRatio(color1: HSL, color2: HSL): number {
  const l1 = getRelativeLuminance(hslToRgb(color1.h, color1.s, color1.l));
  const l2 = getRelativeLuminance(hslToRgb(color2.h, color2.s, color2.l));

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust foreground lightness to achieve target contrast ratio
 * Uses binary search to find optimal lightness value
 */
export function adjustForContrast(
  foreground: HSL,
  background: HSL,
  targetRatio: number = 7
): HSL {
  const adjusted = { ...foreground };
  const bgLuminance = getRelativeLuminance(
    hslToRgb(background.h, background.s, background.l)
  );

  // Determine if we need lighter or darker foreground
  // If background is dark (low luminance), foreground should be light
  const shouldLighten = bgLuminance < 0.5;

  // Binary search for the right lightness
  let low = shouldLighten ? adjusted.l : 0;
  let high = shouldLighten ? 100 : adjusted.l;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    adjusted.l = mid;

    const ratio = getContrastRatio(adjusted, background);

    if (Math.abs(ratio - targetRatio) < 0.1) break;

    if (ratio < targetRatio) {
      // Need more contrast
      if (shouldLighten) low = mid;
      else high = mid;
    } else {
      // Have enough contrast, can reduce
      if (shouldLighten) high = mid;
      else low = mid;
    }
  }

  // Ensure we meet the minimum ratio
  const finalRatio = getContrastRatio(adjusted, background);
  if (finalRatio < targetRatio) {
    // Force to extreme if needed
    adjusted.l = shouldLighten ? 100 : 0;
  }

  return adjusted;
}

/**
 * Darken a background color for high-glare mode
 */
export function darkenBackground(hsl: HSL, amount: number = 5): HSL {
  return {
    ...hsl,
    l: Math.max(0, hsl.l - amount),
  };
}

/**
 * Increase saturation for primary/accent colors to make them "pop"
 */
export function boostSaturation(hsl: HSL, amount: number = 15): HSL {
  return {
    ...hsl,
    s: Math.min(100, hsl.s + amount),
  };
}

/**
 * Brighten a color for better visibility
 */
export function brightenColor(hsl: HSL, amount: number = 10): HSL {
  return {
    ...hsl,
    l: Math.min(100, hsl.l + amount),
  };
}

/**
 * Generate a high-contrast variant of a theme
 * Dynamically adjusts colors to meet WCAG AAA (7:1) contrast ratio
 */
export function generateHighContrastTheme(theme: Theme): Theme {
  const colors = theme.colors;
  const highContrastColors = { ...colors };

  // Background/foreground pairs to process
  const bgFgPairs: Array<[keyof Theme['colors'], keyof Theme['colors']]> = [
    ['background', 'foreground'],
    ['card', 'cardForeground'],
    ['popover', 'popoverForeground'],
    ['muted', 'mutedForeground'],
    ['secondary', 'secondaryForeground'],
    ['accent', 'accentForeground'],
  ];

  for (const [bgKey, fgKey] of bgFgPairs) {
    const bgHSL = parseHSL(colors[bgKey]);
    const fgHSL = parseHSL(colors[fgKey]);

    if (bgHSL && fgHSL) {
      // Darken background (reduce lightness, clamp at 0)
      const darkenedBg = darkenBackground(bgHSL, 5);
      highContrastColors[bgKey] = formatHSL(darkenedBg.h, darkenedBg.s, darkenedBg.l);

      // Ensure foreground meets 7:1 contrast
      const adjustedFg = adjustForContrast(fgHSL, darkenedBg, 7);
      highContrastColors[fgKey] = formatHSL(adjustedFg.h, adjustedFg.s, adjustedFg.l);
    }
  }

  // Boost primary/destructive color saturation and brightness
  const accentColors: Array<keyof Theme['colors']> = ['primary', 'destructive', 'ring'];
  for (const key of accentColors) {
    const hsl = parseHSL(colors[key]);
    if (hsl) {
      const boosted = boostSaturation(hsl, 15);
      // Also slightly increase lightness for visibility
      boosted.l = Math.min(100, boosted.l + 5);
      highContrastColors[key] = formatHSL(boosted.h, boosted.s, boosted.l);
    }
  }

  // Ensure primary foreground has sufficient contrast with boosted primary
  const primaryHSL = parseHSL(highContrastColors.primary);
  const primaryFgHSL = parseHSL(colors.primaryForeground);
  if (primaryHSL && primaryFgHSL) {
    const adjustedPrimaryFg = adjustForContrast(primaryFgHSL, primaryHSL, 7);
    highContrastColors.primaryForeground = formatHSL(
      adjustedPrimaryFg.h,
      adjustedPrimaryFg.s,
      adjustedPrimaryFg.l
    );
  }

  // Ensure destructive foreground has sufficient contrast
  const destructiveHSL = parseHSL(highContrastColors.destructive);
  const destructiveFgHSL = parseHSL(colors.destructiveForeground);
  if (destructiveHSL && destructiveFgHSL) {
    const adjustedDestructiveFg = adjustForContrast(destructiveFgHSL, destructiveHSL, 7);
    highContrastColors.destructiveForeground = formatHSL(
      adjustedDestructiveFg.h,
      adjustedDestructiveFg.s,
      adjustedDestructiveFg.l
    );
  }

  // Brighten border/input colors for visibility
  const borderHSL = parseHSL(colors.border);
  if (borderHSL) {
    const brightenedBorder = brightenColor(borderHSL, 10);
    highContrastColors.border = formatHSL(
      brightenedBorder.h,
      brightenedBorder.s,
      brightenedBorder.l
    );
    highContrastColors.input = formatHSL(
      brightenedBorder.h,
      brightenedBorder.s,
      brightenedBorder.l
    );
  }

  return {
    ...theme,
    name: `${theme.name} (High Contrast)`,
    colors: highContrastColors,
  };
}
