import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, ThemeColorKey } from '@/lib/themes';

interface SettingsState {
  // UI Settings
  highGlareMode: boolean;

  // Audio/Haptics Settings
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // Timer Settings
  defaultTimerMode: 'countdown' | 'stopwatch';

  // Timer Start Delay Settings
  delayMode: 'none' | 'fixed' | 'random';
  fixedDelay: number;
  randomDelayMin: number;
  randomDelayMax: number;

  // Shot Detection Settings
  shotDetectionEnabled: boolean;
  shotDetectionSensitivity: number;

  // Theme Settings
  currentTheme: string; // 'Default', 'Ocean', etc., or 'Custom'
  customTheme: Theme | null;

  // Actions
  toggleHighGlareMode: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setDefaultTimerMode: (mode: 'countdown' | 'stopwatch') => void;
  setDelayMode: (mode: 'none' | 'fixed' | 'random') => void;
  setFixedDelay: (seconds: number) => void;
  setRandomDelayMin: (seconds: number) => void;
  setRandomDelayMax: (seconds: number) => void;
  toggleShotDetection: () => void;
  setShotDetectionSensitivity: (value: number) => void;
  setTheme: (name: string) => void;
  setCustomTheme: (theme: Theme) => void;
  updateThemeColor: (key: ThemeColorKey, value: string) => void;
  updateThemeRadius: (radius: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  highGlareMode: false,
  soundEnabled: true,
  hapticEnabled: true,
  defaultTimerMode: 'stopwatch' as const,
  delayMode: 'none' as const,
  fixedDelay: 3,
  randomDelayMin: 2,
  randomDelayMax: 5,
  shotDetectionEnabled: false,
  shotDetectionSensitivity: 50,
  currentTheme: 'Default',
  customTheme: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      toggleHighGlareMode: () =>
        set((state) => ({ highGlareMode: !state.highGlareMode })),

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleHaptic: () =>
        set((state) => ({ hapticEnabled: !state.hapticEnabled })),

      setDefaultTimerMode: (mode) =>
        set({ defaultTimerMode: mode }),

      setDelayMode: (mode) =>
        set({ delayMode: mode }),

      setFixedDelay: (seconds) =>
        set({ fixedDelay: seconds }),

      setRandomDelayMin: (seconds) =>
        set({ randomDelayMin: seconds }),

      setRandomDelayMax: (seconds) =>
        set({ randomDelayMax: seconds }),

      toggleShotDetection: () =>
        set((state) => ({ shotDetectionEnabled: !state.shotDetectionEnabled })),

      setShotDetectionSensitivity: (value) =>
        set({ shotDetectionSensitivity: value }),

      setTheme: (name) =>
        set({ currentTheme: name }),

      setCustomTheme: (theme) =>
        set({ customTheme: theme, currentTheme: 'Custom' }),

      updateThemeColor: (key, value) =>
        set((state) => {
          if (!state.customTheme) return state;
          return {
            customTheme: {
              ...state.customTheme,
              colors: {
                ...state.customTheme.colors,
                [key]: value,
              },
            },
          };
        }),

      updateThemeRadius: (radius) =>
        set((state) => {
          if (!state.customTheme) return state;
          return {
            customTheme: {
              ...state.customTheme,
              radius,
            },
          };
        }),

      resetSettings: () =>
        set(defaultSettings),
    }),
    {
      name: 'range-app-settings',
    }
  )
);

// Helper hook for easy access to high-glare mode
export function useHighGlareMode() {
  return useSettingsStore((state) => state.highGlareMode);
}
