import { create } from 'zustand';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { ammo, ammoPurchases } from '@/db/schema';
import type { Ammo, NewAmmo, AmmoPurchase, NewAmmoPurchase } from '@/types';
import { generateId } from '@/lib/utils';

interface AmmoState {
  ammo: Ammo[];
  ammoPurchases: AmmoPurchase[];
  isLoading: boolean;
  error: string | null;

  loadAmmo: () => Promise<void>;
  loadAmmoPurchases: (ammoId: string) => Promise<AmmoPurchase[]>;
  addAmmo: (data: Omit<NewAmmo, 'id'>) => Promise<string>;
  updateAmmo: (id: string, data: Partial<Ammo>) => Promise<void>;
  deleteAmmo: (id: string) => Promise<void>;
  addAmmoPurchase: (ammoId: string, data: Omit<NewAmmoPurchase, 'id' | 'ammoId'>) => Promise<void>;
  updateAmmoPurchase: (id: string, ammoId: string, data: Partial<AmmoPurchase>, quantityDelta: number) => Promise<void>;
  deleteAmmoPurchase: (id: string, ammoId: string, quantity: number) => Promise<void>;
  deductAmmo: (ammoId: string, rounds: number) => Promise<void>;
  clearError: () => void;
}

export const useAmmoStore = create<AmmoState>((set, get) => ({
  ammo: [],
  ammoPurchases: [],
  isLoading: false,
  error: null,

  loadAmmo: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(ammo).orderBy(ammo.caliber, ammo.brand);
      set({ ammo: result, isLoading: false });
    } catch (error) {
      console.error('[AmmoStore] Failed to load ammo:', error);
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
      console.error('[AmmoStore] Failed to load ammo purchases:', error);
      set({ error: 'Failed to load purchase history' });
      return [];
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
      console.error('[AmmoStore] Failed to add ammo:', error);
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
      console.error('[AmmoStore] Failed to update ammo:', error);
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
      console.error('[AmmoStore] Failed to delete ammo:', error);
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
      console.error('[AmmoStore] Failed to add ammo purchase:', error);
      set({ error: 'Failed to add purchase' });
      throw error;
    }
  },

  updateAmmoPurchase: async (id, ammoId, data, quantityDelta) => {
    set({ error: null });
    try {
      // Update purchase record
      await db
        .update(ammoPurchases)
        .set(data)
        .where(eq(ammoPurchases.id, id));

      // Adjust ammo round count if quantity changed
      if (quantityDelta !== 0) {
        await db
          .update(ammo)
          .set({
            roundCount: sql`MAX(0, ${ammo.roundCount} + ${quantityDelta})`,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(ammo.id, ammoId));
      }

      // Reload data
      await get().loadAmmo();
      await get().loadAmmoPurchases(ammoId);
    } catch (error) {
      console.error('[AmmoStore] Failed to update ammo purchase:', error);
      set({ error: 'Failed to update purchase' });
      throw error;
    }
  },

  deleteAmmoPurchase: async (id, ammoId, quantity) => {
    set({ error: null });
    try {
      // Delete purchase record
      await db.delete(ammoPurchases).where(eq(ammoPurchases.id, id));

      // Deduct quantity from ammo round count
      await db
        .update(ammo)
        .set({
          roundCount: sql`MAX(0, ${ammo.roundCount} - ${quantity})`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(ammo.id, ammoId));

      // Reload data
      await get().loadAmmo();
      await get().loadAmmoPurchases(ammoId);
    } catch (error) {
      console.error('[AmmoStore] Failed to delete ammo purchase:', error);
      set({ error: 'Failed to delete purchase' });
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
      console.error('[AmmoStore] Failed to deduct ammo:', error);
      set({ error: 'Failed to deduct ammo' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for backwards compatibility
export function useAmmo() {
  const store = useAmmoStore();

  return {
    ammo: store.ammo,
    isLoading: store.isLoading,
    error: store.error,
    loadAmmo: store.loadAmmo,
    addAmmo: store.addAmmo,
    updateAmmo: store.updateAmmo,
    deleteAmmo: store.deleteAmmo,
    addAmmoPurchase: store.addAmmoPurchase,
    updateAmmoPurchase: store.updateAmmoPurchase,
    deleteAmmoPurchase: store.deleteAmmoPurchase,
    loadAmmoPurchases: store.loadAmmoPurchases,
    ammoPurchases: store.ammoPurchases,
    deductAmmo: store.deductAmmo,
    clearError: store.clearError,
  };
}
