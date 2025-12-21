import { z } from 'zod';

// Firearm validation schema
export const firearmSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['handgun', 'rifle', 'shotgun', 'other']).nullable().optional(),
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
