import { create } from 'zustand';
import { eq, sql, and } from 'drizzle-orm';
import { db } from '@/db';
import { firearms, ammo, ammoPurchases, firearmAmmoCompatibility } from '@/db/schema';
import type {
  Firearm,
  NewFirearm,
  Ammo,
  NewAmmo,
  AmmoPurchase,
  NewAmmoPurchase,
  FirearmAmmoCompatibility,
  NewFirearmAmmoCompatibility,
} from '@/types';
import { generateId } from '@/lib/utils';

interface InventoryState {
  // Cached inventory data
  firearms: Firearm[];
  ammo: Ammo[];
  ammoPurchases: AmmoPurchase[];
  compatibilities: FirearmAmmoCompatibility[];

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
  updateAmmoPurchase: (id: string, ammoId: string, data: Partial<AmmoPurchase>, quantityDelta: number) => Promise<void>;
  deleteAmmoPurchase: (id: string, ammoId: string, quantity: number) => Promise<void>;
  deductAmmo: (ammoId: string, rounds: number) => Promise<void>;
  incrementFirearmRoundCount: (firearmId: string, rounds: number) => Promise<void>;
  // Compatibility actions
  loadCompatibilities: (firearmId?: string, ammoId?: string) => Promise<FirearmAmmoCompatibility[]>;
  addCompatibility: (data: Omit<NewFirearmAmmoCompatibility, 'id'>) => Promise<string>;
  updateCompatibility: (id: string, data: Partial<FirearmAmmoCompatibility>) => Promise<void>;
  deleteCompatibility: (id: string) => Promise<void>;
  getCompatibilityCountForAmmo: (ammoId: string) => Promise<number>;
  getCompatibilityCountForFirearm: (firearmId: string) => Promise<number>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  firearms: [],
  ammo: [],
  ammoPurchases: [],
  compatibilities: [],
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
      console.error('[InventoryStore] Failed to update ammo purchase:', error);
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
      console.error('[InventoryStore] Failed to delete ammo purchase:', error);
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

  // Compatibility actions
  loadCompatibilities: async (firearmId?, ammoId?) => {
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
      set({ compatibilities: result });
      return result;
    } catch (error) {
      console.error('[InventoryStore] Failed to load compatibilities:', error);
      set({ error: 'Failed to load compatibility data' });
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
      console.error('[InventoryStore] Failed to add compatibility:', error);
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
      console.error('[InventoryStore] Failed to update compatibility:', error);
      set({ error: 'Failed to update compatibility' });
      throw error;
    }
  },

  deleteCompatibility: async (id) => {
    set({ error: null });
    try {
      await db.delete(firearmAmmoCompatibility).where(eq(firearmAmmoCompatibility.id, id));
    } catch (error) {
      console.error('[InventoryStore] Failed to delete compatibility:', error);
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
      console.error('[InventoryStore] Failed to count compatibilities:', error);
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
      console.error('[InventoryStore] Failed to count compatibilities:', error);
      return 0;
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
    updateAmmoPurchase: store.updateAmmoPurchase,
    deleteAmmoPurchase: store.deleteAmmoPurchase,
    loadAmmoPurchases: store.loadAmmoPurchases,
    ammoPurchases: store.ammoPurchases,
    clearError: store.clearError,
  };
}

// Helper hook for firearm-ammo compatibility
export function useCompatibility() {
  const store = useInventoryStore();

  return {
    compatibilities: store.compatibilities,
    firearms: store.firearms,
    ammo: store.ammo,
    isLoading: store.isLoading,
    error: store.error,
    loadCompatibilities: store.loadCompatibilities,
    addCompatibility: store.addCompatibility,
    updateCompatibility: store.updateCompatibility,
    deleteCompatibility: store.deleteCompatibility,
    getCompatibilityCountForAmmo: store.getCompatibilityCountForAmmo,
    getCompatibilityCountForFirearm: store.getCompatibilityCountForFirearm,
    loadFirearms: store.loadFirearms,
    loadAmmo: store.loadAmmo,
    clearError: store.clearError,
  };
}
