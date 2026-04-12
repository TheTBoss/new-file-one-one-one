import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types';
import { generateId } from '../utils/helpers';
import { sleepDuration } from '../utils/helpers';

interface SleepState {
  entries: SleepEntry[];
  addEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  lastEntry: () => SleepEntry | undefined;
  avgDuration: (days?: number) => number;
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) =>
        set((s) => ({
          entries: [...s.entries, { ...entry, id: generateId() }].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      lastEntry: () =>
        [...get().entries].sort((a, b) => b.date.localeCompare(a.date))[0],

      avgDuration: (days = 7) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const recent = get().entries.filter(
          (e) => new Date(e.date) >= cutoff
        );
        if (recent.length === 0) return 0;
        const total = recent.reduce(
          (sum, e) => sum + sleepDuration(e.bedTime, e.wakeTime),
          0
        );
        return total / recent.length;
      },
    }),
    {
      name: 'ht-sleep',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
