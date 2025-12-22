import { create } from 'zustand';
import { db } from '@/db';
import { sessionTemplates } from '@/db/schema';
import type { SessionTemplate } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface AmmoPreset {
  firearmId: string;
  ammoId: string;
  rounds: number;
}

interface SessionTemplateFormData {
  name: string;
  description?: string;
  location?: string;
  rangeId?: string;
  firearmIds?: string[];
  ammoPresets?: AmmoPreset[];
  defaultNotes?: string;
  isFavorite?: boolean;
}

interface SessionTemplateState {
  templates: SessionTemplate[];
  isLoading: boolean;
  error: string | null;
  loadTemplates: () => Promise<void>;
  addTemplate: (data: SessionTemplateFormData) => Promise<string>;
  updateTemplate: (id: string, data: Partial<SessionTemplateFormData>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  recordUsage: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSessionTemplateStore = create<SessionTemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await db
        .select()
        .from(sessionTemplates)
        .orderBy(desc(sessionTemplates.isFavorite), desc(sessionTemplates.usageCount));

      set({ templates: results, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load templates',
        isLoading: false,
      });
    }
  },

  addTemplate: async (data) => {
    const id = nanoid();
    try {
      await db.insert(sessionTemplates).values({
        id,
        name: data.name,
        description: data.description || null,
        location: data.location || null,
        rangeId: data.rangeId || null,
        firearmIds: data.firearmIds ? JSON.stringify(data.firearmIds) : null,
        ammoPresets: data.ammoPresets ? JSON.stringify(data.ammoPresets) : null,
        defaultNotes: data.defaultNotes || null,
        isFavorite: data.isFavorite ?? false,
      });

      await get().loadTemplates();
      return id;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add template',
      });
      throw err;
    }
  },

  updateTemplate: async (id, data) => {
    try {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.location !== undefined) updateData.location = data.location || null;
      if (data.rangeId !== undefined) updateData.rangeId = data.rangeId || null;
      if (data.firearmIds !== undefined)
        updateData.firearmIds = data.firearmIds ? JSON.stringify(data.firearmIds) : null;
      if (data.ammoPresets !== undefined)
        updateData.ammoPresets = data.ammoPresets ? JSON.stringify(data.ammoPresets) : null;
      if (data.defaultNotes !== undefined) updateData.defaultNotes = data.defaultNotes || null;
      if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;

      await db
        .update(sessionTemplates)
        .set(updateData)
        .where(eq(sessionTemplates.id, id));

      await get().loadTemplates();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update template',
      });
      throw err;
    }
  },

  deleteTemplate: async (id) => {
    try {
      await db.delete(sessionTemplates).where(eq(sessionTemplates.id, id));
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete template',
      });
      throw err;
    }
  },

  toggleFavorite: async (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return;

    try {
      await db
        .update(sessionTemplates)
        .set({ isFavorite: !template.isFavorite })
        .where(eq(sessionTemplates.id, id));

      await get().loadTemplates();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to toggle favorite',
      });
    }
  },

  recordUsage: async (id) => {
    try {
      await db
        .update(sessionTemplates)
        .set({
          usageCount: sql`usage_count + 1`,
          lastUsedAt: new Date().toISOString(),
        })
        .where(eq(sessionTemplates.id, id));
    } catch (err) {
      // Silent fail for usage tracking
      console.error('Failed to record template usage:', err);
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper to parse template data
export function parseTemplate(template: SessionTemplate): {
  firearmIds: string[];
  ammoPresets: AmmoPreset[];
} {
  return {
    firearmIds: template.firearmIds ? JSON.parse(template.firearmIds) : [],
    ammoPresets: template.ammoPresets ? JSON.parse(template.ammoPresets) : [],
  };
}
