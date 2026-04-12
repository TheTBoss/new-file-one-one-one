import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterIntake, MoodEntry, SupplementEntry } from '../types';
import { generateId } from '../utils/helpers';
import { todayStr } from '../utils/date';

interface LifestyleState {
  waterEntries: WaterIntake[];
  moodEntries: MoodEntry[];
  supplements: SupplementEntry[];

  // Water
  addWater: (amountMl: number, source?: string) => void;
  deleteWater: (id: string) => void;
  todayWaterMl: () => number;

  // Mood
  addMood: (entry: Omit<MoodEntry, 'id'>) => void;
  deleteMood: (id: string) => void;
  todayMood: () => MoodEntry | undefined;

  // Supplements
  addSupplement: (entry: Omit<SupplementEntry, 'id'>) => void;
  toggleSupplement: (id: string) => void;
  deleteSupplement: (id: string) => void;
  todaySupplements: () => SupplementEntry[];
}

export const useLifestyleStore = create<LifestyleState>()(
  persist(
    (set, get) => ({
      waterEntries: [],
      moodEntries:  [],
      supplements:  [],

      // ── Water ──────────────────────────────────────────────────────────────
      addWater: (amountMl, source = 'Glass') =>
        set((s) => ({
          waterEntries: [
            ...s.waterEntries,
            {
              id: generateId(),
              amountMl,
              source,
              date: todayStr(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteWater: (id) =>
        set((s) => ({ waterEntries: s.waterEntries.filter((w) => w.id !== id) })),

      todayWaterMl: () => {
        const today = todayStr();
        return get()
          .waterEntries.filter((w) => w.date === today)
          .reduce((sum, w) => sum + w.amountMl, 0);
      },

      // ── Mood ───────────────────────────────────────────────────────────────
      addMood: (entry) =>
        set((s) => ({
          moodEntries: [
            ...s.moodEntries.filter((m) => m.date !== entry.date), // replace today's
            { ...entry, id: generateId() },
          ],
        })),

      deleteMood: (id) =>
        set((s) => ({ moodEntries: s.moodEntries.filter((m) => m.id !== id) })),

      todayMood: () => {
        const today = todayStr();
        return get().moodEntries.find((m) => m.date === today);
      },

      // ── Supplements ────────────────────────────────────────────────────────
      addSupplement: (entry) =>
        set((s) => ({
          supplements: [...s.supplements, { ...entry, id: generateId() }],
        })),

      toggleSupplement: (id) =>
        set((s) => ({
          supplements: s.supplements.map((sup) =>
            sup.id === id ? { ...sup, taken: !sup.taken } : sup
          ),
        })),

      deleteSupplement: (id) =>
        set((s) => ({ supplements: s.supplements.filter((sup) => sup.id !== id) })),

      todaySupplements: () => {
        const today = todayStr();
        return get().supplements.filter((s) => s.date === today);
      },
    }),
    {
      name: 'ht-lifestyle',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
