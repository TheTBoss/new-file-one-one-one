import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BodyMeasurement } from '../types';
import { generateId } from '../utils/helpers';

interface BodyState {
  measurements: BodyMeasurement[];
  addMeasurement: (m: Omit<BodyMeasurement, 'id'>) => void;
  deleteMeasurement: (id: string) => void;
  latest: () => BodyMeasurement | undefined;
  weightTrend: (days?: number) => number; // positive = gained, negative = lost
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      measurements: [],

      addMeasurement: (m) =>
        set((s) => ({
          measurements: [...s.measurements, { ...m, id: generateId() }].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        })),

      deleteMeasurement: (id) =>
        set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),

      latest: () =>
        [...get().measurements].sort((a, b) =>
          b.date.localeCompare(a.date)
        )[0],

      weightTrend: (days = 30) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const recent = get()
          .measurements.filter(
            (m) => m.weight > 0 && new Date(m.date) >= cutoff
          )
          .sort((a, b) => a.date.localeCompare(b.date));
        if (recent.length < 2) return 0;
        return recent[recent.length - 1].weight - recent[0].weight;
      },
    }),
    {
      name: 'ht-body',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
