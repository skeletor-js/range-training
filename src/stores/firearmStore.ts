import { create } from 'zustand';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { firearms } from '@/db/schema';
import type { Firearm, NewFirearm } from '@/types';
import { generateId } from '@/lib/utils';

interface FirearmState {
  firearms: Firearm[];
  isLoading: boolean;
  error: string | null;

  loadFirearms: () => Promise<void>;
  addFirearm: (data: Omit<NewFirearm, 'id'>) => Promise<string>;
  updateFirearm: (id: string, data: Partial<Firearm>) => Promise<void>;
  deleteFirearm: (id: string) => Promise<void>;
  incrementFirearmRoundCount: (firearmId: string, rounds: number) => Promise<void>;
  clearError: () => void;
}

export const useFirearmStore = create<FirearmState>((set, get) => ({
  firearms: [],
  isLoading: false,
  error: null,

  loadFirearms: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.select().from(firearms).orderBy(firearms.name);
      set({ firearms: result, isLoading: false });
    } catch (error) {
      console.error('[FirearmStore] Failed to load firearms:', error);
      set({ error: 'Failed to load firearms', isLoading: false });
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
      await get().loadFirearms();
      return id;
    } catch (error) {
      console.error('[FirearmStore] Failed to add firearm:', error);
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
      console.error('[FirearmStore] Failed to update firearm:', error);
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
      console.error('[FirearmStore] Failed to delete firearm:', error);
      set({ error: 'Failed to delete firearm' });
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
      console.error('[FirearmStore] Failed to update round count:', error);
      set({ error: 'Failed to update round count' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper hook for backwards compatibility
export function useFirearms() {
  const store = useFirearmStore();

  return {
    firearms: store.firearms,
    isLoading: store.isLoading,
    error: store.error,
    loadFirearms: store.loadFirearms,
    addFirearm: store.addFirearm,
    updateFirearm: store.updateFirearm,
    deleteFirearm: store.deleteFirearm,
    incrementFirearmRoundCount: store.incrementFirearmRoundCount,
    clearError: store.clearError,
  };
}
