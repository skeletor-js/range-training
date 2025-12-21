import { create } from 'zustand';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { firearms, ammo, ammoPurchases } from '@/db/schema';
import type { Firearm, NewFirearm, Ammo, NewAmmo, AmmoPurchase, NewAmmoPurchase } from '@/types';
import { generateId } from '@/lib/utils';

interface InventoryState {
  // Cached inventory data
  firearms: Firearm[];
  ammo: Ammo[];
  ammoPurchases: AmmoPurchase[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFirearms: () => Promise<void>;
  loadAmmo: () => Promise<void>;
  loadAmmoPurchases: (ammoId: string) => Promise<AmmoPurchase[]>;
  addFirearm: (data: Omit<NewFirearm, 'id'>) => Promise<string>;
  updateFirearm: (id: string, data: Partial<Firearm>) => Promise<void>;
  deleteFirearm: (id: string) => Promise<void>;
  addAmmo: (data: Omit<NewAmmo, 'id'>) => Promise<string>;
  updateAmmo: (id: string, data: Partial<Ammo>) => Promise<void>;
  deleteAmmo: (id: string) => Promise<void>;
  addAmmoPurchase: (ammoId: string, data: Omit<NewAmmoPurchase, 'id' | 'ammoId'>) => Promise<void>;
  deductAmmo: (ammoId: string, rounds: number) => Promise<void>;
  incrementFirearmRoundCount: (firearmId: string, rounds: number) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  firearms: [],
  ammo: [],
  ammoPurchases: [],
  isLoading: false,
  error: null,

  loadFirearms: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(firearms).orderBy(firearms.name);
      set({ firearms: result, isLoading: false });
    } catch (error) {
      console.error('[InventoryStore] Failed to load firearms:', error);
      set({ error: 'Failed to load firearms', isLoading: false });
    }
  },

  loadAmmo: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(ammo).orderBy(ammo.caliber, ammo.brand);
      set({ ammo: result, isLoading: false });
    } catch (error) {
      console.error('[InventoryStore] Failed to load ammo:', error);
      set({ error: 'Failed to load ammo', isLoading: false });
    }
  },

  loadAmmoPurchases: async (ammoId: string) => {
    try {
      const result = await db
        .select()
        .from(ammoPurchases)
        .where(eq(ammoPurchases.ammoId, ammoId))
        .orderBy(ammoPurchases.purchaseDate);
      set({ ammoPurchases: result });
      return result;
    } catch (error) {
      console.error('[InventoryStore] Failed to load ammo purchases:', error);
      set({ error: 'Failed to load purchase history' });
      return [];
    }
  },

  addFirearm: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(firearms).values({
        id,
        ...data,
      });
      // Reload to get fresh data
      await get().loadFirearms();
      return id;
    } catch (error) {
      console.error('[InventoryStore] Failed to add firearm:', error);
      set({ error: 'Failed to add firearm' });
      throw error;
    }
  },

  updateFirearm: async (id, data) => {
    set({ error: null });
    try {
      await db
        .update(firearms)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(firearms.id, id));
      await get().loadFirearms();
    } catch (error) {
      console.error('[InventoryStore] Failed to update firearm:', error);
      set({ error: 'Failed to update firearm' });
      throw error;
    }
  },

  deleteFirearm: async (id) => {
    set({ error: null });
    try {
      await db.delete(firearms).where(eq(firearms.id, id));
      await get().loadFirearms();
    } catch (error) {
      console.error('[InventoryStore] Failed to delete firearm:', error);
      set({ error: 'Failed to delete firearm' });
      throw error;
    }
  },

  addAmmo: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(ammo).values({
        id,
        ...data,
      });
      await get().loadAmmo();
      return id;
    } catch (error) {
      console.error('[InventoryStore] Failed to add ammo:', error);
      set({ error: 'Failed to add ammo' });
      throw error;
    }
  },

  updateAmmo: async (id, data) => {
    set({ error: null });
    try {
      await db
        .update(ammo)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ammo.id, id));
      await get().loadAmmo();
    } catch (error) {
      console.error('[InventoryStore] Failed to update ammo:', error);
      set({ error: 'Failed to update ammo' });
      throw error;
    }
  },

  deleteAmmo: async (id) => {
    set({ error: null });
    try {
      await db.delete(ammo).where(eq(ammo.id, id));
      await get().loadAmmo();
    } catch (error) {
      console.error('[InventoryStore] Failed to delete ammo:', error);
      set({ error: 'Failed to delete ammo' });
      throw error;
    }
  },

  addAmmoPurchase: async (ammoId, data) => {
    set({ error: null });
    const id = generateId();
    try {
      // Add purchase record
      await db.insert(ammoPurchases).values({
        id,
        ammoId,
        ...data,
      });

      // Update ammo round count
      await db
        .update(ammo)
        .set({
          roundCount: sql`${ammo.roundCount} + ${data.quantity}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ammo.id, ammoId));

      // Reload ammo to reflect new count
      await get().loadAmmo();
    } catch (error) {
      console.error('[InventoryStore] Failed to add ammo purchase:', error);
      set({ error: 'Failed to add purchase' });
      throw error;
    }
  },

  deductAmmo: async (ammoId, rounds) => {
    set({ error: null });
    try {
      await db
        .update(ammo)
        .set({
          roundCount: sql`MAX(0, ${ammo.roundCount} - ${rounds})`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ammo.id, ammoId));
      await get().loadAmmo();
    } catch (error) {
      console.error('[InventoryStore] Failed to deduct ammo:', error);
      set({ error: 'Failed to deduct ammo' });
      throw error;
    }
  },

  incrementFirearmRoundCount: async (firearmId, rounds) => {
    set({ error: null });
    try {
      await db
        .update(firearms)
        .set({
          roundCount: sql`${firearms.roundCount} + ${rounds}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(firearms.id, firearmId));
      await get().loadFirearms();
    } catch (error) {
      console.error('[InventoryStore] Failed to update round count:', error);
      set({ error: 'Failed to update round count' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for firearms with auto-load
export function useFirearms() {
  const store = useInventoryStore();

  return {
    firearms: store.firearms,
    isLoading: store.isLoading,
    error: store.error,
    loadFirearms: store.loadFirearms,
    addFirearm: store.addFirearm,
    updateFirearm: store.updateFirearm,
    deleteFirearm: store.deleteFirearm,
    clearError: store.clearError,
  };
}

// Helper hook for ammo with auto-load
export function useAmmo() {
  const store = useInventoryStore();

  return {
    ammo: store.ammo,
    isLoading: store.isLoading,
    error: store.error,
    loadAmmo: store.loadAmmo,
    addAmmo: store.addAmmo,
    updateAmmo: store.updateAmmo,
    deleteAmmo: store.deleteAmmo,
    addAmmoPurchase: store.addAmmoPurchase,
    loadAmmoPurchases: store.loadAmmoPurchases,
    ammoPurchases: store.ammoPurchases,
    clearError: store.clearError,
  };
}
