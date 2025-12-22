import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { ranges } from '@/db/schema';
import type { Range } from '@/db/schema';
import { generateId } from '@/lib/utils';

interface RangeFormData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  rangeType?: 'indoor' | 'outdoor' | 'both';
  maxDistance?: number;
  notes?: string;
  isFavorite?: boolean;
}

interface RangeState {
  ranges: Range[];
  isLoading: boolean;
  error: string | null;

  loadRanges: () => Promise<void>;
  addRange: (data: RangeFormData) => Promise<string>;
  updateRange: (id: string, data: Partial<RangeFormData>) => Promise<void>;
  deleteRange: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRangeStore = create<RangeState>((set, get) => ({
  ranges: [],
  isLoading: false,
  error: null,

  loadRanges: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db
        .select()
        .from(ranges)
        .orderBy(desc(ranges.isFavorite), ranges.name);
      set({ ranges: result, isLoading: false });
    } catch (error) {
      console.error('[RangeStore] Failed to load ranges:', error);
      set({ error: 'Failed to load ranges', isLoading: false });
    }
  },

  addRange: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const id = generateId();
      await db.insert(ranges).values({
        id,
        name: data.name,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        phone: data.phone || null,
        website: data.website || null,
        rangeType: data.rangeType || null,
        maxDistance: data.maxDistance || null,
        notes: data.notes || null,
        isFavorite: data.isFavorite || false,
      });
      await get().loadRanges();
      return id;
    } catch (error) {
      console.error('[RangeStore] Failed to add range:', error);
      set({ error: 'Failed to add range', isLoading: false });
      throw error;
    }
  },

  updateRange: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await db
        .update(ranges)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ranges.id, id));
      await get().loadRanges();
    } catch (error) {
      console.error('[RangeStore] Failed to update range:', error);
      set({ error: 'Failed to update range', isLoading: false });
      throw error;
    }
  },

  deleteRange: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(ranges).where(eq(ranges.id, id));
      await get().loadRanges();
    } catch (error) {
      console.error('[RangeStore] Failed to delete range:', error);
      set({ error: 'Failed to delete range', isLoading: false });
      throw error;
    }
  },

  toggleFavorite: async (id) => {
    const range = get().ranges.find((r) => r.id === id);
    if (!range) return;

    try {
      await db
        .update(ranges)
        .set({
          isFavorite: !range.isFavorite,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ranges.id, id));
      await get().loadRanges();
    } catch (error) {
      console.error('[RangeStore] Failed to toggle favorite:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
