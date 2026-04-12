// Simple UUID generator (no dependency needed)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Safe ratio (returns 0 if denominator is 0), clamped to [0, 1]
export function safeRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return clamp(numerator / denominator, 0, 1);
}

// Sum an array of numbers
export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

// Calculate BMI
export function calcBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmi: number): string {
  if (bmi <= 0)    return '';
  if (bmi < 18.5)  return 'Underweight';
  if (bmi < 25)    return 'Normal';
  if (bmi < 30)    return 'Overweight';
  return 'Obese';
}

// Sleep duration
export function sleepDuration(bedTime: string, wakeTime: string): number {
  const diff = new Date(wakeTime).getTime() - new Date(bedTime).getTime();
  return Math.max(0, diff) / 3600000; // hours
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Workout volume
export function totalVolume(sets: { reps: number; weight: number; isWarmup?: boolean }[]): number {
  return sets
    .filter(s => !s.isWarmup)
    .reduce((acc, s) => acc + s.reps * s.weight, 0);
}

// Elapsed seconds → MM:SS / H:MM:SS
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Streak calculation from sorted date strings (YYYY-MM-DD)
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse(); // most recent first
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  for (const d of sorted) {
    const logDate = new Date(d);
    logDate.setHours(0, 0, 0, 0);
    const diff = Math.round((checkDate.getTime() - logDate.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      checkDate = logDate;
    } else {
      break;
    }
  }
  return streak;
}

// Exercise preset library
export const EXERCISE_LIBRARY = [
  // Chest
  { name: 'Bench Press',           muscleGroup: 'chest',      exerciseType: 'strength'   },
  { name: 'Incline Bench Press',   muscleGroup: 'chest',      exerciseType: 'strength'   },
  { name: 'Dumbbell Flyes',        muscleGroup: 'chest',      exerciseType: 'strength'   },
  { name: 'Push Ups',              muscleGroup: 'chest',      exerciseType: 'bodyweight' },
  { name: 'Cable Crossover',       muscleGroup: 'chest',      exerciseType: 'strength'   },
  // Back
  { name: 'Deadlift',              muscleGroup: 'back',       exerciseType: 'strength'   },
  { name: 'Pull Ups',              muscleGroup: 'back',       exerciseType: 'bodyweight' },
  { name: 'Barbell Row',           muscleGroup: 'back',       exerciseType: 'strength'   },
  { name: 'Lat Pulldown',          muscleGroup: 'back',       exerciseType: 'strength'   },
  { name: 'Seated Cable Row',      muscleGroup: 'back',       exerciseType: 'strength'   },
  // Shoulders
  { name: 'Overhead Press',        muscleGroup: 'shoulders',  exerciseType: 'strength'   },
  { name: 'Lateral Raises',        muscleGroup: 'shoulders',  exerciseType: 'strength'   },
  { name: 'Front Raises',          muscleGroup: 'shoulders',  exerciseType: 'strength'   },
  { name: 'Face Pulls',            muscleGroup: 'shoulders',  exerciseType: 'strength'   },
  // Biceps
  { name: 'Barbell Curl',          muscleGroup: 'biceps',     exerciseType: 'strength'   },
  { name: 'Dumbbell Curl',         muscleGroup: 'biceps',     exerciseType: 'strength'   },
  { name: 'Hammer Curl',           muscleGroup: 'biceps',     exerciseType: 'strength'   },
  // Triceps
  { name: 'Tricep Pushdown',       muscleGroup: 'triceps',    exerciseType: 'strength'   },
  { name: 'Skull Crushers',        muscleGroup: 'triceps',    exerciseType: 'strength'   },
  { name: 'Close Grip Bench',      muscleGroup: 'triceps',    exerciseType: 'strength'   },
  // Legs
  { name: 'Squat',                 muscleGroup: 'quads',      exerciseType: 'strength'   },
  { name: 'Leg Press',             muscleGroup: 'quads',      exerciseType: 'strength'   },
  { name: 'Lunges',                muscleGroup: 'quads',      exerciseType: 'bodyweight' },
  { name: 'Romanian Deadlift',     muscleGroup: 'hamstrings', exerciseType: 'strength'   },
  { name: 'Leg Curl',              muscleGroup: 'hamstrings', exerciseType: 'strength'   },
  { name: 'Hip Thrust',            muscleGroup: 'glutes',     exerciseType: 'strength'   },
  { name: 'Calf Raises',           muscleGroup: 'calves',     exerciseType: 'strength'   },
  // Core
  { name: 'Plank',                 muscleGroup: 'core',       exerciseType: 'bodyweight' },
  { name: 'Crunches',              muscleGroup: 'core',       exerciseType: 'bodyweight' },
  { name: 'Russian Twists',        muscleGroup: 'core',       exerciseType: 'bodyweight' },
  { name: 'Hanging Leg Raise',     muscleGroup: 'core',       exerciseType: 'bodyweight' },
  // Cardio
  { name: 'Running',               muscleGroup: 'cardio',     exerciseType: 'cardio'     },
  { name: 'Cycling',               muscleGroup: 'cardio',     exerciseType: 'cardio'     },
  { name: 'Rowing',                muscleGroup: 'cardio',     exerciseType: 'cardio'     },
  { name: 'Jump Rope',             muscleGroup: 'cardio',     exerciseType: 'cardio'     },
];

// Common food presets
export const FOOD_PRESETS = [
  { name: 'Chicken Breast',  brand: '',  calories: 165, protein: 31, carbohydrates: 0,  fat: 3.6, servingSize: 100, servingUnit: 'g'        },
  { name: 'Brown Rice',      brand: '',  calories: 216, protein: 5,  carbohydrates: 45, fat: 1.8, servingSize: 195, servingUnit: 'g cooked' },
  { name: 'Oats',            brand: '',  calories: 307, protein: 11, carbohydrates: 55, fat: 5.3, servingSize: 81,  servingUnit: 'g dry'    },
  { name: 'Whole Eggs',      brand: '',  calories: 72,  protein: 6,  carbohydrates: 0.4,fat: 5,   servingSize: 1,   servingUnit: 'large'    },
  { name: 'Greek Yogurt',    brand: '',  calories: 100, protein: 17, carbohydrates: 6,  fat: 0.7, servingSize: 170, servingUnit: 'g'        },
  { name: 'Broccoli',        brand: '',  calories: 55,  protein: 3.7,carbohydrates: 11, fat: 0.6, servingSize: 148, servingUnit: 'g'        },
  { name: 'Sweet Potato',    brand: '',  calories: 103, protein: 2.3,carbohydrates: 24, fat: 0.1, servingSize: 130, servingUnit: 'g'        },
  { name: 'Salmon',          brand: '',  calories: 208, protein: 20, carbohydrates: 0,  fat: 13,  servingSize: 100, servingUnit: 'g'        },
  { name: 'Banana',          brand: '',  calories: 89,  protein: 1.1,carbohydrates: 23, fat: 0.3, servingSize: 118, servingUnit: 'g'        },
  { name: 'Almonds',         brand: '',  calories: 164, protein: 6,  carbohydrates: 6,  fat: 14,  servingSize: 28,  servingUnit: 'g'        },
  { name: 'Whey Protein',    brand: '',  calories: 120, protein: 25, carbohydrates: 3,  fat: 1.5, servingSize: 30,  servingUnit: 'g scoop'  },
  { name: 'Whole Milk',      brand: '',  calories: 149, protein: 8,  carbohydrates: 12, fat: 8,   servingSize: 244, servingUnit: 'ml'       },
  { name: 'White Rice',      brand: '',  calories: 206, protein: 4.3,carbohydrates: 45, fat: 0.4, servingSize: 186, servingUnit: 'g cooked' },
  { name: 'Bread (whole)',   brand: '',  calories: 79,  protein: 4,  carbohydrates: 15, fat: 1.1, servingSize: 1,   servingUnit: 'slice'    },
  { name: 'Peanut Butter',   brand: '',  calories: 191, protein: 7,  carbohydrates: 7,  fat: 16,  servingSize: 32,  servingUnit: 'g'        },
];
