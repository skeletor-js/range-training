export interface Theme {
  name: string;
  colors: {
    background: string;      // HSL values like "0 0% 6%"
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
  };
  radius?: string;
}

export type ThemeColorKey = keyof Theme['colors'];

export const DEFAULT_RADIUS = '0.5rem';
