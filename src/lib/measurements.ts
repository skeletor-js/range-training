import type { GroupMetrics, InchShot } from '@/types';
import { MOA_INCHES_AT_100_YARDS } from './constants';

/**
 * Convert pixel coordinates to inches using calibration scale
 * @param pixelX - X coordinate in pixels
 * @param pixelY - Y coordinate in pixels
 * @param poaPixelX - Point of Aim X coordinate in pixels
 * @param poaPixelY - Point of Aim Y coordinate in pixels
 * @param pixelsPerInch - Calibration scale (pixels per inch)
 * @returns Coordinates in inches relative to POA
 */
export function pixelsToInches(
  pixelX: number,
  pixelY: number,
  poaPixelX: number,
  poaPixelY: number,
  pixelsPerInch: number
): { xInches: number; yInches: number } {
  if (pixelsPerInch <= 0) {
    throw new Error('pixelsPerInch must be positive');
  }

  return {
    xInches: (pixelX - poaPixelX) / pixelsPerInch,
    // Y is inverted: in screen coordinates, Y increases downward
    // In shooting, positive Y means above POA
    yInches: (poaPixelY - pixelY) / pixelsPerInch,
  };
}

/**
 * Calculate the centroid (group center) of all shots
 * @param shots - Array of shots with inch coordinates
 * @returns Center coordinates in inches
 */
export function calculateGroupCenter(
  shots: Array<{ xInches: number; yInches: number }>
): { x: number; y: number } {
  if (shots.length === 0) {
    return { x: 0, y: 0 };
  }

  const sumX = shots.reduce((acc, shot) => acc + shot.xInches, 0);
  const sumY = shots.reduce((acc, shot) => acc + shot.yInches, 0);

  return {
    x: sumX / shots.length,
    y: sumY / shots.length,
  };
}

/**
 * Calculate the distance between two points
 */
function distance(
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
 * Calculate Extreme Spread (ES)
 * The maximum distance between any two shots in the group
 * This represents the diameter of the smallest circle that contains all shots
 * @param shots - Array of shots with inch coordinates
 * @returns Extreme spread in inches
 */
export function calculateExtremeSpread(
  shots: Array<{ xInches: number; yInches: number }>
): number {
  if (shots.length < 2) {
    return 0;
  }

  let maxDistance = 0;

  // Compare every pair of shots to find the maximum distance
  for (let i = 0; i < shots.length; i++) {
    for (let j = i + 1; j < shots.length; j++) {
      const d = distance(
        shots[i].xInches,
        shots[i].yInches,
        shots[j].xInches,
        shots[j].yInches
      );
      maxDistance = Math.max(maxDistance, d);
    }
  }

  return maxDistance;
}

/**
 * Calculate Mean Radius
 * The average distance of all shots from the group center
 * @param shots - Array of shots with inch coordinates
 * @param center - Group center coordinates
 * @returns Mean radius in inches
 */
export function calculateMeanRadius(
  shots: Array<{ xInches: number; yInches: number }>,
  center: { x: number; y: number }
): number {
  if (shots.length === 0) {
    return 0;
  }

  const totalDistance = shots.reduce((acc, shot) => {
    return acc + distance(shot.xInches, shot.yInches, center.x, center.y);
  }, 0);

  return totalDistance / shots.length;
}

/**
 * Convert inches to MOA (Minutes of Angle) at a given distance
 * MOA is an angular measurement: 1 MOA = 1.047 inches at 100 yards
 * @param inches - Size in inches
 * @param distanceYards - Distance to target in yards
 * @returns Size in MOA
 */
export function inchesToMoa(inches: number, distanceYards: number): number {
  if (distanceYards <= 0) {
    return 0;
  }

  // 1 MOA at 100 yards = 1.047 inches
  // At any distance: MOA = (inches / distance_yards) * (100 / 1.047)
  // Simplified: MOA = inches * 100 / (distance_yards * 1.047)
  return (inches * 100) / (distanceYards * MOA_INCHES_AT_100_YARDS);
}

/**
 * Convert MOA to inches at a given distance
 * @param moa - Size in MOA
 * @param distanceYards - Distance to target in yards
 * @returns Size in inches
 */
export function moaToInches(moa: number, distanceYards: number): number {
  if (distanceYards <= 0) {
    return 0;
  }

  return (moa * distanceYards * MOA_INCHES_AT_100_YARDS) / 100;
}

/**
 * Calculate all group metrics for a shot group
 * @param shots - Array of shots with inch coordinates
 * @param distanceYards - Distance to target in yards
 * @returns Complete group metrics
 */
export function calculateGroupMetrics(
  shots: Array<{ xInches: number; yInches: number }>,
  distanceYards: number
): GroupMetrics {
  const center = calculateGroupCenter(shots);
  const extremeSpread = calculateExtremeSpread(shots);
  const meanRadius = calculateMeanRadius(shots, center);
  const groupSizeMoa = inchesToMoa(extremeSpread, distanceYards);

  return {
    shotCount: shots.length,
    groupCenterX: center.x,
    groupCenterY: center.y,
    extremeSpread,
    meanRadius,
    groupSizeMoa,
  };
}

/**
 * Convert an array of pixel shots to inch coordinates
 * @param pixelShots - Array of shots in pixel coordinates
 * @param poaPixelX - Point of Aim X in pixels
 * @param poaPixelY - Point of Aim Y in pixels
 * @param pixelsPerInch - Calibration scale
 * @returns Array of shots in inch coordinates
 */
export function convertPixelShotsToInches(
  pixelShots: Array<{ x: number; y: number; sequenceNumber: number }>,
  poaPixelX: number,
  poaPixelY: number,
  pixelsPerInch: number
): InchShot[] {
  return pixelShots.map((shot) => {
    const inches = pixelsToInches(
      shot.x,
      shot.y,
      poaPixelX,
      poaPixelY,
      pixelsPerInch
    );
    return {
      xInches: inches.xInches,
      yInches: inches.yInches,
      sequenceNumber: shot.sequenceNumber,
    };
  });
}

/**
 * Format a measurement for display
 * @param value - Value to format
 * @param decimals - Number of decimal places
 * @param unit - Unit suffix
 * @returns Formatted string
 */
export function formatMeasurement(
  value: number,
  decimals: number = 2,
  unit: string = ''
): string {
  const formatted = value.toFixed(decimals);
  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * Format group metrics for display
 * @param metrics - Group metrics
 * @returns Formatted strings for each metric
 */
export function formatGroupMetrics(metrics: GroupMetrics): {
  extremeSpread: string;
  meanRadius: string;
  groupSizeMoa: string;
  groupCenter: string;
} {
  return {
    extremeSpread: formatMeasurement(metrics.extremeSpread, 2, '"'),
    meanRadius: formatMeasurement(metrics.meanRadius, 2, '"'),
    groupSizeMoa: formatMeasurement(metrics.groupSizeMoa, 2, ' MOA'),
    groupCenter: `${metrics.groupCenterX >= 0 ? '+' : ''}${metrics.groupCenterX.toFixed(2)}", ${metrics.groupCenterY >= 0 ? '+' : ''}${metrics.groupCenterY.toFixed(2)}"`,
  };
}
