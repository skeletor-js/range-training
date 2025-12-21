import { TARGET_PRESETS, type TargetPreset } from './constants';

/**
 * Get a target preset by ID
 * @param id - Preset ID
 * @returns Target preset or undefined
 */
export function getTargetPreset(id: string): TargetPreset | undefined {
  return TARGET_PRESETS.find((preset) => preset.id === id);
}

/**
 * Calculate pixels-per-inch scale from a preset alignment
 * When the user aligns a preset template over their target image,
 * we know the real-world size and can calculate the scale.
 *
 * @param preset - The target preset used for calibration
 * @param renderedPixelDimension - The pixel size of the preset as rendered/scaled
 * @returns Pixels per inch
 */
export function calculateScaleFromPreset(
  preset: TargetPreset,
  renderedPixelDimension: number
): number {
  if (preset.knownDimensionInches <= 0) {
    throw new Error('Preset must have a positive known dimension');
  }
  if (renderedPixelDimension <= 0) {
    throw new Error('Rendered dimension must be positive');
  }

  return renderedPixelDimension / preset.knownDimensionInches;
}

/**
 * Calculate pixels-per-inch scale from a custom reference measurement
 * The user draws a line between two points of known distance.
 *
 * @param measuredPixels - The pixel distance measured by the user
 * @param knownInches - The real-world distance in inches
 * @returns Pixels per inch
 */
export function calculateScaleFromCustom(
  measuredPixels: number,
  knownInches: number
): number {
  if (knownInches <= 0) {
    throw new Error('Known distance must be positive');
  }
  if (measuredPixels <= 0) {
    throw new Error('Measured distance must be positive');
  }

  return measuredPixels / knownInches;
}

/**
 * Calculate the pixel distance between two points
 * Used for custom calibration where user draws a reference line
 *
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Distance in pixels
 */
export function calculatePixelDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Validate a calibration scale
 * A reasonable scale for target images is typically 5-500 pixels per inch
 *
 * @param pixelsPerInch - The scale to validate
 * @returns Whether the scale is reasonable
 */
export function isReasonableScale(pixelsPerInch: number): boolean {
  // Very low: image would need to be huge for a normal target
  // Very high: image would need to be tiny for a normal target
  return pixelsPerInch >= 5 && pixelsPerInch <= 500;
}

/**
 * Calculate the size of a target dimension in pixels given the scale
 *
 * @param inches - Size in inches
 * @param pixelsPerInch - Calibration scale
 * @returns Size in pixels
 */
export function inchesToPixels(
  inches: number,
  pixelsPerInch: number
): number {
  return inches * pixelsPerInch;
}

/**
 * Get recommended calibration reference for a target type
 * Helps users know what to measure for custom calibration
 *
 * @param targetType - The type of target
 * @returns Suggestion for what to measure
 */
export function getCalibrationSuggestion(targetType: string): string {
  switch (targetType) {
    case 'b8-repair':
      return 'Measure the outer edge of the black (5.5 inches)';
    case 'uspsa-metric':
      return 'Measure the height of the A-zone (6 inches) or full target height (18 inches)';
    case 'neutral-grid':
      return 'Measure any known reference on your target';
    default:
      return 'Measure any known dimension on your target';
  }
}

// Re-export for convenience
export { TARGET_PRESETS, type TargetPreset };
