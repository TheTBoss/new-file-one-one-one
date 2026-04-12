# HealthTracker — iOS App

A comprehensive health and fitness tracking iOS app built with SwiftUI and SwiftData.

## Features

### 📊 Dashboard
- Daily calorie progress ring with macros breakdown
- Today's summary: water, sleep, habits, workouts
- Weekly activity calendar
- Mood & weight snapshot

### 🍎 Nutrition Tracking
- Log meals by type: Breakfast, Lunch, Dinner, Snack, Pre/Post Workout
- Detailed macros: Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium
- Food library with 12 common presets for quick logging
- 7-day calorie history chart
- Daily goal progress bars
- Swipe to delete food entries

### 🏋️ Workout Tracking
- Live workout timer with volume & sets counter
- Exercise library (40+ exercises across all muscle groups)
- Per-set tracking: weight (kg/lbs), reps, warmup flag, RPE, personal records
- Rest timer between sets with auto-dismiss
- Full workout history with volume trends chart
- Calorie burn logging

### 😴 Sleep Monitoring
- Log bedtime & wake time with duration calculation
- Sleep quality rating (Terrible → Excellent)
- Interruption count & "felt rested" toggle
- 7-day duration chart with goal line
- Sleep stats: average, quality, longest session

### ✅ Habit Tracking
- Create habits with custom icons, colors & categories
- Today view with one-tap completion toggle
- Streak tracking (current & longest)
- Weekly calendar grid view
- 7-day dot indicator on each habit row
- Swipe actions to complete/delete

### 📈 Progress Tab
#### 💧 Water Intake
- Quick-add presets (glass, bottle sizes)
- Custom amount entry
- Daily goal ring
- Full daily log

#### 😊 Mood & Wellbeing
- 5-level mood selector with emoji
- Energy, Stress, Anxiety sliders (1–10)
- Custom tags (with suggestion chips)
- Journal notes
- Mood history

#### 💪 Body Measurements
- Weight, Body Fat %, Muscle Mass, Water %
- Full circumference measurements (chest, waist, hips, neck, biceps, thighs, calves, shoulders)
- Automatic BMI calculation with category
- Progress line chart with metric selector

#### 💊 Supplement Tracker
- Log vitamins & supplements with dosage & timing
- Daily checklist with completion toggle

### ⚙️ Settings
- User profile (name, height, birth year)
- Daily goals (calories, macros, water, sleep, steps, target weight)
- Unit preference (kg / lbs)

## Tech Stack

| Technology | Usage |
|---|---|
| **SwiftUI** | All UI, animations, layouts |
| **SwiftData** | Local persistence (iOS 17+) |
| **Swift Charts** | Calorie, sleep, volume, weight charts |
| **Combine** | Timer publishing for active workout |

## Requirements

- **iOS 17.0+**
- **Xcode 15.3+**
- iPhone or iPad

## Getting Started

1. Clone the repository
2. Open `HealthTracker.xcodeproj` in Xcode
3. Select your target device or simulator (iOS 17+)
4. Build and run (`⌘R`)

> **Note:** No third-party dependencies — pure Apple frameworks only.

## Project Structure

```
HealthTracker/
├── HealthTrackerApp.swift        # App entry, SwiftData container
├── ContentView.swift             # Root tab view
├── Models/
│   ├── NutritionModels.swift     # FoodEntry, MealType, FoodPreset
│   ├── SleepModels.swift         # SleepEntry, SleepQuality
│   ├── HabitModels.swift         # Habit, HabitLog, HabitCategory
│   ├── WorkoutModels.swift       # WorkoutSession, WorkoutExercise, ExerciseSet
│   ├── BodyModels.swift          # BodyMeasurement
│   └── LifestyleModels.swift     # WaterIntake, MoodEntry, DailyGoals,
│                                 #  JournalEntry, SupplementEntry
├── Views/
│   ├── Dashboard/                # DashboardView + cards
│   ├── Nutrition/                # NutritionView, AddFoodView, MacroRingView
│   ├── Sleep/                    # SleepView, AddSleepView
│   ├── Habits/                   # HabitsView, AddHabitView
│   ├── Workout/                  # WorkoutView, ActiveWorkoutView, History
│   ├── Body/                     # BodyView, AddMeasurementView
│   ├── Progress/                 # ProgressView (water, mood, supplements)
│   └── Settings/                 # SettingsView, AboutView
└── Utilities/
    ├── Extensions.swift          # Date, Color, View, ProgressRingView helpers
    └── HealthDataStore.swift     # Query helpers, UserProfile
```
