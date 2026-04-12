import Foundation
import SwiftData

// MARK: - Water Intake

@Model
final class WaterIntake {
    var id: UUID
    var amountMl: Double
    var date: Date
    var source: String  // e.g., "Glass", "Bottle", "Custom"

    init(amountMl: Double = 250, date: Date = Date(), source: String = "Glass") {
        self.id = UUID()
        self.amountMl = amountMl
        self.date = date
        self.source = source
    }
}

// MARK: - Mood

enum MoodLevel: Int, Codable, CaseIterable {
    case terrible = 1
    case bad = 2
    case neutral = 3
    case good = 4
    case great = 5

    var label: String {
        switch self {
        case .terrible: return "Terrible"
        case .bad: return "Bad"
        case .neutral: return "Neutral"
        case .good: return "Good"
        case .great: return "Great"
        }
    }

    var emoji: String {
        switch self {
        case .terrible: return "😞"
        case .bad: return "😕"
        case .neutral: return "😐"
        case .good: return "😊"
        case .great: return "😄"
        }
    }

    var colorName: String {
        switch self {
        case .terrible: return "red"
        case .bad: return "orange"
        case .neutral: return "yellow"
        case .good: return "green"
        case .great: return "blue"
        }
    }
}

@Model
final class MoodEntry {
    var id: UUID
    var date: Date
    var mood: MoodLevel
    var energyLevel: Int    // 1-10
    var stressLevel: Int    // 1-10
    var anxietyLevel: Int   // 1-10
    var notes: String
    var tags: [String]

    init(
        date: Date = Date(),
        mood: MoodLevel = .neutral,
        energyLevel: Int = 5,
        stressLevel: Int = 5,
        anxietyLevel: Int = 5,
        notes: String = "",
        tags: [String] = []
    ) {
        self.id = UUID()
        self.date = date
        self.mood = mood
        self.energyLevel = energyLevel
        self.stressLevel = stressLevel
        self.anxietyLevel = anxietyLevel
        self.notes = notes
        self.tags = tags
    }
}

// MARK: - Daily Goals & Profile

@Model
final class DailyGoals {
    var id: UUID
    var calorieGoal: Double
    var proteinGoal: Double  // g
    var carbGoal: Double     // g
    var fatGoal: Double      // g
    var fiberGoal: Double    // g
    var waterGoal: Double    // ml
    var sleepGoal: Double    // hours
    var stepsGoal: Int
    var activeMinutesGoal: Int
    var weightGoal: Double   // kg

    init(
        calorieGoal: Double = 2000,
        proteinGoal: Double = 150,
        carbGoal: Double = 250,
        fatGoal: Double = 65,
        fiberGoal: Double = 25,
        waterGoal: Double = 2500,
        sleepGoal: Double = 8,
        stepsGoal: Int = 10000,
        activeMinutesGoal: Int = 30,
        weightGoal: Double = 75
    ) {
        self.id = UUID()
        self.calorieGoal = calorieGoal
        self.proteinGoal = proteinGoal
        self.carbGoal = carbGoal
        self.fatGoal = fatGoal
        self.fiberGoal = fiberGoal
        self.waterGoal = waterGoal
        self.sleepGoal = sleepGoal
        self.stepsGoal = stepsGoal
        self.activeMinutesGoal = activeMinutesGoal
        self.weightGoal = weightGoal
    }
}

// MARK: - Journal Entry (bonus feature)

@Model
final class JournalEntry {
    var id: UUID
    var date: Date
    var title: String
    var content: String
    var tags: [String]
    var mood: MoodLevel

    init(
        date: Date = Date(),
        title: String = "",
        content: String = "",
        tags: [String] = [],
        mood: MoodLevel = .neutral
    ) {
        self.id = UUID()
        self.date = date
        self.title = title
        self.content = content
        self.tags = tags
        self.mood = mood
    }
}

// MARK: - Supplement Tracking

@Model
final class SupplementEntry {
    var id: UUID
    var name: String
    var dosage: String
    var timing: String   // "Morning", "Pre-workout", "Evening", etc.
    var date: Date
    var taken: Bool
    var notes: String

    init(
        name: String,
        dosage: String = "",
        timing: String = "Morning",
        date: Date = Date(),
        taken: Bool = true,
        notes: String = ""
    ) {
        self.id = UUID()
        self.name = name
        self.dosage = dosage
        self.timing = timing
        self.date = date
        self.taken = taken
        self.notes = notes
    }
}
