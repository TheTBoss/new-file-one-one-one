import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyGoals, UserProfile } from '../types';

interface SettingsState {
  profile: UserProfile;
  goals: DailyGoals;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateGoals: (updates: Partial<DailyGoals>) => void;
}

const DEFAULT_GOALS: DailyGoals = {
  calorieGoal:  2000,
  proteinGoal:  150,
  carbGoal:     250,
  fatGoal:      65,
  fiberGoal:    25,
  waterGoal:    2500,
  sleepGoal:    8,
  stepsGoal:    10000,
  weightGoal:   75,
};

const DEFAULT_PROFILE: UserProfile = {
  name:                  '',
  heightCm:              170,
  birthYear:             1990,
  preferredWeightUnit:   'kg',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      goals:   DEFAULT_GOALS,

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      updateGoals: (updates) =>
        set((s) => ({ goals: { ...s.goals, ...updates } })),
    }),
    {
      name: 'ht-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
