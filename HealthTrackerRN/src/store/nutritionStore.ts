import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, MealType } from '../types';
import { generateId } from '../utils/helpers';
import { todayStr } from '../utils/date';

interface NutritionState {
  entries: FoodEntry[];
  addEntry: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => void;
  deleteEntry: (id: string) => void;
  // Selectors
  todayEntries: () => FoodEntry[];
  entriesForDate: (date: string) => FoodEntry[];
  entriesForMeal: (mealType: MealType, date?: string) => FoodEntry[];
  calorieSumForDate: (date: string) => number;
  macroSumForDate: (date: string) => { protein: number; carbs: number; fat: number; fiber: number };
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { ...entry, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      todayEntries: () => {
        const today = todayStr();
        return get().entries.filter((e) => e.date === today);
      },

      entriesForDate: (date) =>
        get().entries.filter((e) => e.date === date),

      entriesForMeal: (mealType, date) => {
        const d = date ?? todayStr();
        return get().entries.filter((e) => e.date === d && e.mealType === mealType);
      },

      calorieSumForDate: (date) =>
        get().entries
          .filter((e) => e.date === date)
          .reduce((sum, e) => sum + e.calories, 0),

      macroSumForDate: (date) =>
        get().entries
          .filter((e) => e.date === date)
          .reduce(
            (acc, e) => ({
              protein: acc.protein + e.protein,
              carbs:   acc.carbs   + e.carbohydrates,
              fat:     acc.fat     + e.fat,
              fiber:   acc.fiber   + e.fiber,
            }),
            { protein: 0, carbs: 0, fat: 0, fiber: 0 }
          ),
    }),
    {
      name: 'ht-nutrition',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
