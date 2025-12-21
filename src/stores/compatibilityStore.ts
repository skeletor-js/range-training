import { create } from 'zustand';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { firearmAmmoCompatibility } from '@/db/schema';
import type { FirearmAmmoCompatibility, NewFirearmAmmoCompatibility } from '@/types';
import { generateId } from '@/lib/utils';
import { useFirearmStore } from './firearmStore';
import { useAmmoStore } from './ammoStore';

interface CompatibilityState {
  compatibilities: FirearmAmmoCompatibility[];
  isLoading: boolean;
  error: string | null;

  loadCompatibilities: (firearmId?: string, ammoId?: string) => Promise<FirearmAmmoCompatibility[]>;
  addCompatibility: (data: Omit<NewFirearmAmmoCompatibility, 'id'>) => Promise<string>;
  updateCompatibility: (id: string, data: Partial<FirearmAmmoCompatibility>) => Promise<void>;
  deleteCompatibility: (id: string) => Promise<void>;
  getCompatibilityCountForAmmo: (ammoId: string) => Promise<number>;
  getCompatibilityCountForFirearm: (firearmId: string) => Promise<number>;
  clearError: () => void;
}

export const useCompatibilityStore = create<CompatibilityState>((set) => ({
  compatibilities: [],
  isLoading: false,
  error: null,

  loadCompatibilities: async (firearmId?, ammoId?) => {
    set({ isLoading: true, error: null });
    try {
      let query = db.select().from(firearmAmmoCompatibility);

      if (firearmId && ammoId) {
        query = query.where(
          and(
            eq(firearmAmmoCompatibility.firearmId, firearmId),
            eq(firearmAmmoCompatibility.ammoId, ammoId)
          )
        ) as typeof query;
      } else if (firearmId) {
        query = query.where(eq(firearmAmmoCompatibility.firearmId, firearmId)) as typeof query;
      } else if (ammoId) {
        query = query.where(eq(firearmAmmoCompatibility.ammoId, ammoId)) as typeof query;
      }

      const result = await query.orderBy(firearmAmmoCompatibility.createdAt);
      set({ compatibilities: result, isLoading: false });
      return result;
    } catch (error) {
      console.error('[CompatibilityStore] Failed to load compatibilities:', error);
      set({ error: 'Failed to load compatibility data', isLoading: false });
      return [];
    }
  },

  addCompatibility: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(firearmAmmoCompatibility).values({
        id,
        ...data,
      });
      return id;
    } catch (error) {
      console.error('[CompatibilityStore] Failed to add compatibility:', error);
      set({ error: 'Failed to add compatibility' });
      throw error;
    }
  },

  updateCompatibility: async (id, data) => {
    set({ error: null });
    try {
      await db
        .update(firearmAmmoCompatibility)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(firearmAmmoCompatibility.id, id));
    } catch (error) {
      console.error('[CompatibilityStore] Failed to update compatibility:', error);
      set({ error: 'Failed to update compatibility' });
      throw error;
    }
  },

  deleteCompatibility: async (id) => {
    set({ error: null });
    try {
      await db.delete(firearmAmmoCompatibility).where(eq(firearmAmmoCompatibility.id, id));
    } catch (error) {
      console.error('[CompatibilityStore] Failed to delete compatibility:', error);
      set({ error: 'Failed to delete compatibility' });
      throw error;
    }
  },

  getCompatibilityCountForAmmo: async (ammoId) => {
    try {
      const result = await db
        .select()
        .from(firearmAmmoCompatibility)
        .where(eq(firearmAmmoCompatibility.ammoId, ammoId));
      return result.length;
    } catch (error) {
      console.error('[CompatibilityStore] Failed to count compatibilities:', error);
      return 0;
    }
  },

  getCompatibilityCountForFirearm: async (firearmId) => {
    try {
      const result = await db
        .select()
        .from(firearmAmmoCompatibility)
        .where(eq(firearmAmmoCompatibility.firearmId, firearmId));
      return result.length;
    } catch (error) {
      console.error('[CompatibilityStore] Failed to count compatibilities:', error);
      return 0;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook that combines compatibility with firearms and ammo for forms
export function useCompatibility() {
  const compatStore = useCompatibilityStore();
  const firearmStore = useFirearmStore();
  const ammoStore = useAmmoStore();

  return {
    compatibilities: compatStore.compatibilities,
    firearms: firearmStore.firearms,
    ammo: ammoStore.ammo,
    isLoading: compatStore.isLoading,
    error: compatStore.error,
    loadCompatibilities: compatStore.loadCompatibilities,
    addCompatibility: compatStore.addCompatibility,
    updateCompatibility: compatStore.updateCompatibility,
    deleteCompatibility: compatStore.deleteCompatibility,
    getCompatibilityCountForAmmo: compatStore.getCompatibilityCountForAmmo,
    getCompatibilityCountForFirearm: compatStore.getCompatibilityCountForFirearm,
    loadFirearms: firearmStore.loadFirearms,
    loadAmmo: ammoStore.loadAmmo,
    clearError: compatStore.clearError,
  };
}
