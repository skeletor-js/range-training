import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { malfunctions, firearms, ammo } from '@/db/schema';
import type { MalfunctionWithDetails } from '@/types';
import type { MalfunctionFormData } from '@/lib/validations';
import { generateId } from '@/lib/utils';

interface MalfunctionState {
  malfunctions: MalfunctionWithDetails[];
  isLoading: boolean;
  error: string | null;

  loadMalfunctions: (sessionId?: string) => Promise<MalfunctionWithDetails[]>;
  loadMalfunctionsForAmmo: (ammoId: string) => Promise<MalfunctionWithDetails[]>;
  addMalfunction: (data: MalfunctionFormData) => Promise<string>;
  deleteMalfunction: (id: string) => Promise<void>;
  getMalfunctionCountForSession: (sessionId: string) => Promise<number>;
  getMalfunctionCountForAmmo: (ammoId: string) => Promise<number>;
  clearError: () => void;
}

export const useMalfunctionStore = create<MalfunctionState>((set, get) => ({
  malfunctions: [],
  isLoading: false,
  error: null,

  loadMalfunctions: async (sessionId?) => {
    set({ isLoading: true, error: null });
    try {
      // Query malfunctions with joined firearm and ammo names
      let query = db
        .select({
          id: malfunctions.id,
          sessionId: malfunctions.sessionId,
          ammoId: malfunctions.ammoId,
          firearmId: malfunctions.firearmId,
          malfunctionType: malfunctions.malfunctionType,
          description: malfunctions.description,
          createdAt: malfunctions.createdAt,
          firearmName: firearms.name,
          ammoName: ammo.brand,
        })
        .from(malfunctions)
        .leftJoin(firearms, eq(malfunctions.firearmId, firearms.id))
        .leftJoin(ammo, eq(malfunctions.ammoId, ammo.id));

      if (sessionId) {
        query = query.where(eq(malfunctions.sessionId, sessionId)) as typeof query;
      }

      const result = await query.orderBy(desc(malfunctions.createdAt));

      // Map to MalfunctionWithDetails
      const malfunctionsWithDetails: MalfunctionWithDetails[] = result.map((row) => ({
        id: row.id,
        sessionId: row.sessionId,
        ammoId: row.ammoId,
        firearmId: row.firearmId,
        malfunctionType: row.malfunctionType as MalfunctionWithDetails['malfunctionType'],
        description: row.description,
        createdAt: row.createdAt,
        firearmName: row.firearmName,
        ammoName: row.ammoName,
      }));

      set({ malfunctions: malfunctionsWithDetails, isLoading: false });
      return malfunctionsWithDetails;
    } catch (error) {
      console.error('[MalfunctionStore] Failed to load malfunctions:', error);
      set({ error: 'Failed to load malfunctions', isLoading: false });
      return [];
    }
  },

  loadMalfunctionsForAmmo: async (ammoId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db
        .select({
          id: malfunctions.id,
          sessionId: malfunctions.sessionId,
          ammoId: malfunctions.ammoId,
          firearmId: malfunctions.firearmId,
          malfunctionType: malfunctions.malfunctionType,
          description: malfunctions.description,
          createdAt: malfunctions.createdAt,
          firearmName: firearms.name,
          ammoName: ammo.brand,
        })
        .from(malfunctions)
        .leftJoin(firearms, eq(malfunctions.firearmId, firearms.id))
        .leftJoin(ammo, eq(malfunctions.ammoId, ammo.id))
        .where(eq(malfunctions.ammoId, ammoId))
        .orderBy(desc(malfunctions.createdAt));

      const malfunctionsWithDetails: MalfunctionWithDetails[] = result.map((row) => ({
        id: row.id,
        sessionId: row.sessionId,
        ammoId: row.ammoId,
        firearmId: row.firearmId,
        malfunctionType: row.malfunctionType as MalfunctionWithDetails['malfunctionType'],
        description: row.description,
        createdAt: row.createdAt,
        firearmName: row.firearmName,
        ammoName: row.ammoName,
      }));

      set({ malfunctions: malfunctionsWithDetails, isLoading: false });
      return malfunctionsWithDetails;
    } catch (error) {
      console.error('[MalfunctionStore] Failed to load malfunctions for ammo:', error);
      set({ error: 'Failed to load malfunctions', isLoading: false });
      return [];
    }
  },

  addMalfunction: async (data) => {
    set({ error: null });
    const id = generateId();
    try {
      await db.insert(malfunctions).values({
        id,
        sessionId: data.sessionId ?? null,
        ammoId: data.ammoId ?? null,
        firearmId: data.firearmId ?? null,
        malfunctionType: data.malfunctionType,
        description: data.description ?? null,
      });

      // Reload malfunctions for the session if provided
      if (data.sessionId) {
        await get().loadMalfunctions(data.sessionId);
      }

      return id;
    } catch (error) {
      console.error('[MalfunctionStore] Failed to add malfunction:', error);
      set({ error: 'Failed to add malfunction' });
      throw error;
    }
  },

  deleteMalfunction: async (id) => {
    set({ error: null });
    try {
      // Get the malfunction first to know the sessionId for reload
      const existing = await db
        .select()
        .from(malfunctions)
        .where(eq(malfunctions.id, id));

      await db.delete(malfunctions).where(eq(malfunctions.id, id));

      // Reload malfunctions for the session if it existed
      if (existing[0]?.sessionId) {
        await get().loadMalfunctions(existing[0].sessionId);
      }
    } catch (error) {
      console.error('[MalfunctionStore] Failed to delete malfunction:', error);
      set({ error: 'Failed to delete malfunction' });
      throw error;
    }
  },

  getMalfunctionCountForSession: async (sessionId) => {
    try {
      const result = await db
        .select()
        .from(malfunctions)
        .where(eq(malfunctions.sessionId, sessionId));
      return result.length;
    } catch (error) {
      console.error('[MalfunctionStore] Failed to count malfunctions:', error);
      return 0;
    }
  },

  getMalfunctionCountForAmmo: async (ammoId) => {
    try {
      const result = await db
        .select()
        .from(malfunctions)
        .where(eq(malfunctions.ammoId, ammoId));
      return result.length;
    } catch (error) {
      console.error('[MalfunctionStore] Failed to count malfunctions:', error);
      return 0;
    }
  },

  clearError: () => set({ error: null }),
}));
