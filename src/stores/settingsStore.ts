import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // UI Settings
  highGlareMode: boolean;

  // Audio/Haptics Settings
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // Timer Settings
  defaultTimerMode: 'countdown' | 'stopwatch';

  // Actions
  toggleHighGlareMode: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setDefaultTimerMode: (mode: 'countdown' | 'stopwatch') => void;
  resetSettings: () => void;
}

const defaultSettings = {
  highGlareMode: false,
  soundEnabled: true,
  hapticEnabled: true,
  defaultTimerMode: 'stopwatch' as const,
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
