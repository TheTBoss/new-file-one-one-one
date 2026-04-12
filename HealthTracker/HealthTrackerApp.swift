import SwiftUI
import SwiftData

@main
struct HealthTrackerApp: App {
    let modelContainer: ModelContainer

    init() {
        do {
            let schema = Schema([
                FoodEntry.self,
                SleepEntry.self,
                Habit.self,
                HabitLog.self,
                WorkoutSession.self,
                WorkoutExercise.self,
                ExerciseSet.self,
                BodyMeasurement.self,
                WaterIntake.self,
                MoodEntry.self,
                DailyGoals.self,
                JournalEntry.self,
                SupplementEntry.self,
            ])
            let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            modelContainer = try ModelContainer(for: schema, configurations: [config])

            // Seed default goals if none exist
            let context = modelContainer.mainContext
            let goalCount = try context.fetchCount(FetchDescriptor<DailyGoals>())
            if goalCount == 0 {
                let goals = DailyGoals()
                context.insert(goals)
                try context.save()
            }
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(modelContainer)
    }
}
