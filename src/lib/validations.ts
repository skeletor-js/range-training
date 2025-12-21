import { z } from 'zod';
import { FIREARM_TYPES } from './constants';

// Firearm validation schema
export const firearmSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(FIREARM_TYPES).nullable().optional(),
  caliber: z.string().min(1, 'Caliber is required'),
  manufacturer: z.string().max(100).nullable().optional(),
  model: z.string().max(100).nullable().optional(),
  serialNumber: z.string().max(50).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
});

export type FirearmFormData = z.infer<typeof firearmSchema>;

// Ammo validation schema
export const ammoSchema = z.object({
  caliber: z.string().min(1, 'Caliber is required'),
  brand: z.string().min(1, 'Brand is required'),
  productLine: z.string().max(100).nullable().optional(),
  grainWeight: z.number().int().positive('Grain weight must be positive'),
  bulletType: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  reliability: z.enum(['excellent', 'good', 'fair', 'poor']).nullable().optional(),
  accuracy: z.enum(['excellent', 'good', 'fair', 'poor']).nullable().optional(),
  reviewNotes: z.string().max(1000).nullable().optional(),
});

export type AmmoFormData = z.infer<typeof ammoSchema>;

// Ammo purchase validation schema
export const ammoPurchaseSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
  priceTotal: z.number().positive('Price must be positive'),
  seller: z.string().max(100).nullable().optional(),
  purchaseDate: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).nullable().optional(),
});

export type AmmoPurchaseFormData = z.infer<typeof ammoPurchaseSchema>;

// Session validation schema
export const sessionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  location: z.string().max(200).nullable().optional(),
  weather: z.string().max(50).nullable().optional(),
  temperature: z.number().int().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

// Target validation schema
export const targetSchema = z.object({
  targetType: z.string().min(1, 'Target type is required'),
  distanceYards: z.number().positive('Distance must be positive'),
  firearmId: z.string().nullable().optional(),
  ammoId: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type TargetFormData = z.infer<typeof targetSchema>;

// Shot coordinate schema
export const shotSchema = z.object({
  xInches: z.number(),
  yInches: z.number(),
  shotNumber: z.number().int().positive().optional(),
});

export type ShotData = z.infer<typeof shotSchema>;

// Firearm-Ammo Compatibility validation schema
export const compatibilitySchema = z.object({
  firearmId: z.string().min(1, 'Firearm is required'),
  ammoId: z.string().min(1, 'Ammo is required'),
  performanceRating: z.enum(['excellent', 'good', 'fair', 'poor']).nullable().optional(),
  loadNotes: z.string().max(500).nullable().optional(),
  isTested: z.boolean().default(false),
  lastTestedDate: z.string().nullable().optional(),
});

export type CompatibilityFormData = z.infer<typeof compatibilitySchema>;

// Drill validation schema
export const drillSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).nullable().optional(),
  category: z.enum(['speed', 'accuracy', 'movement', 'reload', 'other']),
  scoringType: z.enum(['time', 'points', 'pass_fail', 'hits']),
  parTime: z.number().positive().nullable().optional(),
  maxPoints: z.number().int().positive().nullable().optional(),
  roundCount: z.number().int().positive('Round count must be at least 1'),
  targetCount: z.number().int().positive().default(1),
  distanceYards: z.number().positive().nullable().optional(),
});

export type DrillFormData = z.infer<typeof drillSchema>;

// Drill attempt validation schema
export const drillAttemptSchema = z.object({
  drillId: z.string().min(1, 'Drill is required'),
  sessionId: z.string().nullable().optional(),
  timeSeconds: z.number().positive().nullable().optional(),
  points: z.number().int().nullable().optional(),
  hits: z.number().int().min(0).nullable().optional(),
  misses: z.number().int().min(0).nullable().optional(),
  passed: z.boolean().nullable().optional(),
  targetId: z.string().nullable().optional(),
  firearmId: z.string().nullable().optional(),
  ammoId: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type DrillAttemptFormData = z.infer<typeof drillAttemptSchema>;

// Goal validation schema
export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).nullable().optional(),
  targetDate: z.string().nullable().optional(),
  linkedDrillId: z.string().nullable().optional(),
  targetScore: z.number().nullable().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// Helper to validate form data
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
