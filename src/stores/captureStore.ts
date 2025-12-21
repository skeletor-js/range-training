import { create } from 'zustand';
import type { CaptureMode, PixelShot, InchShot, GroupMetrics, CapturedTarget } from '@/types';
import { TARGET_PRESETS, type TargetPreset } from '@/lib/constants';
import {
  calculateScaleFromPreset,
  calculateScaleFromCustom,
  calculatePixelDistance,
} from '@/lib/calibration';
import {
  convertPixelShotsToInches,
  calculateGroupMetrics,
} from '@/lib/measurements';
import { generateId } from '@/lib/utils';

interface CaptureState {
  // Capture workflow state
  mode: CaptureMode;

  // Image state (transient - never persisted)
  imageDataUrl: string | null;
  imageWidth: number;
  imageHeight: number;

  // Calibration
  calibrationType: 'preset' | 'custom';
  selectedPreset: TargetPreset | null;
  calibrationScale: number; // pixels per inch

  // Custom calibration points
  customPoint1: { x: number; y: number } | null;
  customPoint2: { x: number; y: number } | null;
  customRefInches: number; // user-provided real distance

  // Distance to target
  distanceYards: number;

  // Point of Aim (POA) in pixel coordinates
  poaPixelX: number | null;
  poaPixelY: number | null;

  // Shots in pixel coordinates during capture
  shotsPixels: PixelShot[];

  // Linked firearm and ammo for this target
  firearmId: string | null;
  ammoId: string | null;

  // Notes
  notes: string;

  // Actions
  setImage: (dataUrl: string, width: number, height: number) => void;
  clearImage: () => void;
  setMode: (mode: CaptureMode) => void;
  setDistanceYards: (distance: number) => void;

  // Calibration actions
  setCalibrationPreset: (preset: TargetPreset, renderedPixelDimension: number) => void;
  setCustomCalibrationPoint: (pointNumber: 1 | 2, x: number, y: number) => void;
  setCustomRefInches: (inches: number) => void;
  applyCustomCalibration: () => boolean;

  // POA actions
  setPoa: (x: number, y: number) => void;

  // Shot actions
  addShot: (x: number, y: number) => void;
  removeShot: (index: number) => void;
  moveShot: (index: number, x: number, y: number) => void;
  undoLastShot: () => void;

  // Linking actions
  setFirearmId: (id: string | null) => void;
  setAmmoId: (id: string | null) => void;
  setNotes: (notes: string) => void;

  // Result actions
  calculateInchCoordinates: () => InchShot[];
  getGroupMetrics: () => GroupMetrics | null;
  createCapturedTarget: () => CapturedTarget | null;

  // Reset
  reset: () => void;
}

const initialState = {
  mode: 'idle' as CaptureMode,
  imageDataUrl: null,
  imageWidth: 0,
  imageHeight: 0,
  calibrationType: 'preset' as const,
  selectedPreset: null,
  calibrationScale: 0,
  customPoint1: null,
  customPoint2: null,
  customRefInches: 1,
  distanceYards: 25,
  poaPixelX: null,
  poaPixelY: null,
  shotsPixels: [],
  firearmId: null,
  ammoId: null,
  notes: '',
};

export const useCaptureStore = create<CaptureState>((set, get) => ({
  ...initialState,

  setImage: (dataUrl, width, height) => {
    set({
      imageDataUrl: dataUrl,
      imageWidth: width,
      imageHeight: height,
      mode: 'calibrating',
    });
  },

  clearImage: () => {
    set({
      imageDataUrl: null,
      imageWidth: 0,
      imageHeight: 0,
      mode: 'idle',
    });
  },

  setMode: (mode) => set({ mode }),

  setDistanceYards: (distance) => set({ distanceYards: distance }),

  setCalibrationPreset: (preset, renderedPixelDimension) => {
    try {
      const scale = calculateScaleFromPreset(preset, renderedPixelDimension);
      set({
        calibrationType: 'preset',
        selectedPreset: preset,
        calibrationScale: scale,
        mode: 'setting-poa',
      });
    } catch (error) {
      console.error('[CaptureStore] Failed to set calibration preset:', error);
    }
  },

  setCustomCalibrationPoint: (pointNumber, x, y) => {
    if (pointNumber === 1) {
      set({ customPoint1: { x, y } });
    } else {
      set({ customPoint2: { x, y } });
    }
  },

  setCustomRefInches: (inches) => {
    set({ customRefInches: inches });
  },

  applyCustomCalibration: () => {
    const { customPoint1, customPoint2, customRefInches } = get();

    if (!customPoint1 || !customPoint2 || customRefInches <= 0) {
      return false;
    }

    try {
      const pixelDistance = calculatePixelDistance(
        customPoint1.x,
        customPoint1.y,
        customPoint2.x,
        customPoint2.y
      );
      const scale = calculateScaleFromCustom(pixelDistance, customRefInches);

      set({
        calibrationType: 'custom',
        selectedPreset: null,
        calibrationScale: scale,
        mode: 'setting-poa',
      });
      return true;
    } catch (error) {
      console.error('[CaptureStore] Failed to apply custom calibration:', error);
      return false;
    }
  },

  setPoa: (x, y) => {
    set({
      poaPixelX: x,
      poaPixelY: y,
      mode: 'marking-shots',
    });
  },

  addShot: (x, y) => {
    const { shotsPixels } = get();
    const sequenceNumber = shotsPixels.length + 1;
    set({
      shotsPixels: [...shotsPixels, { x, y, sequenceNumber }],
    });
  },

  removeShot: (index) => {
    const { shotsPixels } = get();
    const newShots = shotsPixels.filter((_, i) => i !== index);
    // Renumber remaining shots
    const renumbered = newShots.map((shot, i) => ({
      ...shot,
      sequenceNumber: i + 1,
    }));
    set({ shotsPixels: renumbered });
  },

  moveShot: (index, x, y) => {
    const { shotsPixels } = get();
    const newShots = [...shotsPixels];
    if (newShots[index]) {
      newShots[index] = { ...newShots[index], x, y };
      set({ shotsPixels: newShots });
    }
  },

  undoLastShot: () => {
    const { shotsPixels } = get();
    if (shotsPixels.length > 0) {
      set({ shotsPixels: shotsPixels.slice(0, -1) });
    }
  },

  setFirearmId: (id) => set({ firearmId: id }),
  setAmmoId: (id) => set({ ammoId: id }),
  setNotes: (notes) => set({ notes }),

  calculateInchCoordinates: () => {
    const { shotsPixels, poaPixelX, poaPixelY, calibrationScale } = get();

    if (
      poaPixelX === null ||
      poaPixelY === null ||
      calibrationScale <= 0 ||
      shotsPixels.length === 0
    ) {
      return [];
    }

    return convertPixelShotsToInches(
      shotsPixels,
      poaPixelX,
      poaPixelY,
      calibrationScale
    );
  },

  getGroupMetrics: () => {
    const { distanceYards } = get();
    const inchShots = get().calculateInchCoordinates();

    if (inchShots.length === 0) {
      return null;
    }

    return calculateGroupMetrics(inchShots, distanceYards);
  },

  createCapturedTarget: () => {
    const state = get();
    const {
      calibrationType,
      customRefInches,
      distanceYards,
      firearmId,
      ammoId,
      notes,
      selectedPreset,
    } = state;

    const inchShots = state.calculateInchCoordinates();
    const metrics = state.getGroupMetrics();

    if (inchShots.length === 0 || !metrics) {
      return null;
    }

    const targetType = selectedPreset?.id ?? 'custom';

    return {
      tempId: generateId(),
      targetType,
      distanceYards,
      calibrationType,
      customRefInches: calibrationType === 'custom' ? customRefInches : null,
      shots: inchShots,
      metrics,
      firearmId,
      ammoId,
      notes: notes || null,
    };
  },

  reset: () => set(initialState),
}));

// Helper to get available presets
export function getAvailablePresets(): TargetPreset[] {
  return TARGET_PRESETS;
}
