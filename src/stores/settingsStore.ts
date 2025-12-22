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

  // Inventory Settings
  lowStockThreshold: number; // rounds below which to show warning
  lowStockWarningsEnabled: boolean;

  // Theme Settings
  currentTheme: string; // 'Default', 'Ocean', etc., or 'Custom'
  customTheme: Theme | null;

  // Debug Mode (hidden developer tools)
  debugMode: boolean;
  debugTapCount: number;

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
  setLowStockThreshold: (rounds: number) => void;
  toggleLowStockWarnings: () => void;
  setTheme: (name: string) => void;
  setCustomTheme: (theme: Theme) => void;
  updateThemeColor: (key: ThemeColorKey, value: string) => void;
  updateThemeRadius: (radius: string) => void;
  resetSettings: () => void;

  // Debug Actions
  incrementDebugTap: () => void;
  resetDebugTap: () => void;
  disableDebugMode: () => void;
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
  lowStockThreshold: 100,
  lowStockWarningsEnabled: true,
  currentTheme: 'Default',
  customTheme: null,
  debugMode: false,
  debugTapCount: 0,
};

// Timeout ID for resetting tap count
let debugTapTimeout: ReturnType<typeof setTimeout> | null = null;

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

      setLowStockThreshold: (rounds) =>
        set({ lowStockThreshold: rounds }),

      toggleLowStockWarnings: () =>
        set((state) => ({ lowStockWarningsEnabled: !state.lowStockWarningsEnabled })),

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

      // Debug Mode Actions
      incrementDebugTap: () => {
        // Clear existing timeout
        if (debugTapTimeout) {
          clearTimeout(debugTapTimeout);
        }

        set((state) => {
          const newCount = state.debugTapCount + 1;

          // Auto-enable debug mode at 5 taps
          if (newCount >= 5) {
            return { debugTapCount: 0, debugMode: true };
          }

          // Set timeout to reset count after 2 seconds
          debugTapTimeout = setTimeout(() => {
            set({ debugTapCount: 0 });
          }, 2000);

          return { debugTapCount: newCount };
        });
      },

      resetDebugTap: () => {
        if (debugTapTimeout) {
          clearTimeout(debugTapTimeout);
          debugTapTimeout = null;
        }
        set({ debugTapCount: 0 });
      },

      disableDebugMode: () =>
        set({ debugMode: false, debugTapCount: 0 }),
    }),
    {
      name: 'range-app-settings',
      partialize: (state) => ({
        // Only persist these values (exclude debugTapCount as it's transient)
        highGlareMode: state.highGlareMode,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        defaultTimerMode: state.defaultTimerMode,
        delayMode: state.delayMode,
        fixedDelay: state.fixedDelay,
        randomDelayMin: state.randomDelayMin,
        randomDelayMax: state.randomDelayMax,
        shotDetectionEnabled: state.shotDetectionEnabled,
        shotDetectionSensitivity: state.shotDetectionSensitivity,
        lowStockThreshold: state.lowStockThreshold,
        lowStockWarningsEnabled: state.lowStockWarningsEnabled,
        currentTheme: state.currentTheme,
        customTheme: state.customTheme,
        debugMode: state.debugMode,
      }),
    }
  )
);

// Helper hook for easy access to high-glare mode
export function useHighGlareMode() {
  return useSettingsStore((state) => state.highGlareMode);
}
