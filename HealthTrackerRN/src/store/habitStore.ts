import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog } from '../types';
import { generateId } from '../utils/helpers';
import { todayStr, sameDay } from '../utils/date';
import { calcStreak } from '../utils/helpers';

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdDate' | 'logs'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'logs'>>) => void;
  deleteHabit: (id: string) => void;
  toggleToday: (habitId: string) => void;
  isCompletedToday: (habitId: string) => boolean;
  currentStreak: (habitId: string) => number;
  completionRateToday: () => number; // 0–1
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (habit) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { ...habit, id: generateId(), createdDate: todayStr(), logs: [] },
          ],
        })),

      updateHabit: (id, updates) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleToday: (habitId) => {
        const today = todayStr();
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const existingLog = h.logs.find((l) => l.date === today);
            if (existingLog) {
              // toggle existing log
              return {
                ...h,
                logs: h.logs.map((l) =>
                  l.date === today ? { ...l, completed: !l.completed } : l
                ),
              };
            } else {
              // add new log
              const newLog: HabitLog = {
                id: generateId(),
                date: today,
                completed: true,
              };
              return { ...h, logs: [...h.logs, newLog] };
            }
          }),
        }));
      },

      isCompletedToday: (habitId) => {
        const today = todayStr();
        const habit = get().habits.find((h) => h.id === habitId);
        return habit?.logs.some((l) => l.date === today && l.completed) ?? false;
      },

      currentStreak: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return 0;
        const completedDates = habit.logs
          .filter((l) => l.completed)
          .map((l) => l.date);
        return calcStreak(completedDates);
      },

      completionRateToday: () => {
        const active = get().habits.filter((h) => h.isActive);
        if (active.length === 0) return 0;
        const done = active.filter((h) => get().isCompletedToday(h.id)).length;
        return done / active.length;
      },
    }),
    {
      name: 'ht-habits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
