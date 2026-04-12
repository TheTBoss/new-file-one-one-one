import Foundation
import SwiftData

// MARK: - HealthDataStore
// Provides helper methods for querying data across the app

struct HealthDataStore {

    // MARK: - Nutrition Helpers

    static func totalCaloriesToday(from entries: [FoodEntry]) -> Double {
        entries.filter { $0.date.isToday }.reduce(0) { $0 + $1.calories }
    }

    static func totalProteinToday(from entries: [FoodEntry]) -> Double {
        entries.filter { $0.date.isToday }.reduce(0) { $0 + $1.protein }
    }

    static func totalCarbsToday(from entries: [FoodEntry]) -> Double {
        entries.filter { $0.date.isToday }.reduce(0) { $0 + $1.carbohydrates }
    }

    static func totalFatToday(from entries: [FoodEntry]) -> Double {
        entries.filter { $0.date.isToday }.reduce(0) { $0 + $1.fat }
    }

    static func caloriesForDate(_ date: Date, from entries: [FoodEntry]) -> Double {
        entries.filter { $0.date.isSameDay(as: date) }.reduce(0) { $0 + $1.calories }
    }

    static func entriesForMealType(_ mealType: MealType, from entries: [FoodEntry], on date: Date = Date()) -> [FoodEntry] {
        entries.filter { $0.date.isSameDay(as: date) && $0.mealType == mealType }
    }

    // MARK: - Sleep Helpers

    static func lastSleepEntry(from entries: [SleepEntry]) -> SleepEntry? {
        entries.sorted { $0.date > $1.date }.first
    }

    static func averageSleepDuration(from entries: [SleepEntry], days: Int = 7) -> Double {
        let cutoff = Date().daysAgo(days)
        let recent = entries.filter { $0.date >= cutoff }
        guard !recent.isEmpty else { return 0 }
        return recent.reduce(0) { $0 + $1.durationHours } / Double(recent.count)
    }

    // MARK: - Workout Helpers

    static func workoutsThisWeek(from sessions: [WorkoutSession]) -> [WorkoutSession] {
        let startOfWeek = Calendar.current.date(from: Calendar.current.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date()))!
        return sessions.filter { $0.date >= startOfWeek }
    }

    static func totalVolumeThisWeek(from sessions: [WorkoutSession]) -> Double {
        workoutsThisWeek(from: sessions).reduce(0) { $0 + $1.totalVolume }
    }

    // MARK: - Habit Helpers

    static func completionRateToday(from habits: [Habit]) -> Double {
        let active = habits.filter { $0.isActive }
        guard !active.isEmpty else { return 0 }
        let completed = active.filter { $0.isCompletedToday() }.count
        return Double(completed) / Double(active.count)
    }

    // MARK: - Water Helpers

    static func totalWaterToday(from entries: [WaterIntake]) -> Double {
        entries.filter { $0.date.isToday }.reduce(0) { $0 + $1.amountMl }
    }

    // MARK: - Body Helpers

    static func latestWeight(from measurements: [BodyMeasurement]) -> Double? {
        measurements.sorted { $0.date > $1.date }.first?.weight
    }

    static func weightTrend(from measurements: [BodyMeasurement], days: Int = 30) -> Double {
        let cutoff = Date().daysAgo(days)
        let recent = measurements.filter { $0.date >= cutoff && $0.weight > 0 }
            .sorted { $0.date < $1.date }
        guard recent.count >= 2 else { return 0 }
        return (recent.last?.weight ?? 0) - (recent.first?.weight ?? 0)
    }
}

// MARK: - UserProfile

struct UserProfile {
    static let defaults = UserDefaults.standard

    static var name: String {
        get { defaults.string(forKey: "userName") ?? "" }
        set { defaults.set(newValue, forKey: "userName") }
    }

    static var heightCm: Double {
        get {
            let val = defaults.double(forKey: "userHeightCm")
            return val > 0 ? val : 170
        }
        set { defaults.set(newValue, forKey: "userHeightCm") }
    }

    static var birthYear: Int {
        get {
            let val = defaults.integer(forKey: "userBirthYear")
            return val > 0 ? val : 1990
        }
        set { defaults.set(newValue, forKey: "userBirthYear") }
    }

    static var preferredWeightUnit: WeightUnit {
        get {
            let raw = defaults.string(forKey: "preferredWeightUnit") ?? "kg"
            return WeightUnit(rawValue: raw) ?? .kg
        }
        set { defaults.set(newValue.rawValue, forKey: "preferredWeightUnit") }
    }

    static var age: Int {
        Calendar.current.component(.year, from: Date()) - birthYear
    }
}
