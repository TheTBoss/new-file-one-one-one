// ─── Nutrition ────────────────────────────────────────────────────────────────

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'pre-workout'
  | 'post-workout';

export interface FoodEntry {
  id: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: number;
  servingUnit: string;
  mealType: MealType;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string; // full ISO timestamp
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface SleepEntry {
  id: string;
  bedTime: string;  // ISO timestamp
  wakeTime: string; // ISO timestamp
  quality: SleepQuality;
  notes: string;
  interruptions: number;
  feltRested: boolean;
  date: string; // YYYY-MM-DD of wake day
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export type HabitCategory =
  | 'health' | 'fitness' | 'mindfulness' | 'nutrition'
  | 'sleep' | 'productivity' | 'social' | 'learning'
  | 'finance' | 'creativity' | 'other';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | '3x' | '5x' | 'custom';

export interface HabitLog {
  id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdDate: string;
  logs: HabitLog[];
}

// ─── Workout ──────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'glutes' | 'quads' | 'hamstrings'
  | 'calves' | 'full-body' | 'cardio';

export type ExerciseType =
  | 'strength' | 'cardio' | 'bodyweight' | 'flexibility' | 'plyometric';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  durationSeconds: number;
  isWarmup: boolean;
  isPersonalRecord: boolean;
  rpe: number; // 1-10
  isDone: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  exerciseType: ExerciseType;
  notes: string;
  order: number;
  restTimeSeconds: number;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime?: string;  // ISO timestamp
  notes: string;
  caloriesBurned: number;
  isCompleted: boolean;
  exercises: WorkoutExercise[];
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;       // kg
  bodyFat: number;      // %
  muscleMass: number;   // kg
  waterPercentage: number; // %
  chest: number;        // cm
  waist: number;
  hips: number;
  neck: number;
  bicepLeft: number;
  bicepRight: number;
  thighLeft: number;
  thighRight: number;
  calfLeft: number;
  calfRight: number;
  shoulders: number;
  notes: string;
}

// ─── Lifestyle ────────────────────────────────────────────────────────────────

export interface WaterIntake {
  id: string;
  amountMl: number;
  source: string;
  date: string;     // YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodLevel;
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  anxietyLevel: number;
  notes: string;
  tags: string[];
}

export interface SupplementEntry {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  taken: boolean;
  date: string; // YYYY-MM-DD
  notes: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface DailyGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  fiberGoal: number;
  waterGoal: number;    // ml
  sleepGoal: number;    // hours
  stepsGoal: number;
  weightGoal: number;   // kg
}

export interface UserProfile {
  name: string;
  heightCm: number;
  birthYear: number;
  preferredWeightUnit: 'kg' | 'lbs';
}

// ─── Exercise preset ──────────────────────────────────────────────────────────

export interface ExercisePreset {
  name: string;
  muscleGroup: MuscleGroup;
  exerciseType: ExerciseType;
}

export interface FoodPreset {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}
