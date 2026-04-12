import Foundation
import SwiftData

enum HabitFrequency: String, Codable, CaseIterable {
    case daily = "Daily"
    case weekdays = "Weekdays"
    case weekends = "Weekends"
    case threePerWeek = "3x per week"
    case fivePerWeek = "5x per week"
    case custom = "Custom"
}

enum HabitCategory: String, Codable, CaseIterable {
    case health = "Health"
    case fitness = "Fitness"
    case mindfulness = "Mindfulness"
    case nutrition = "Nutrition"
    case sleep = "Sleep"
    case productivity = "Productivity"
    case social = "Social"
    case learning = "Learning"
    case finance = "Finance"
    case creativity = "Creativity"
    case other = "Other"

    var icon: String {
        switch self {
        case .health: return "heart.fill"
        case .fitness: return "figure.run"
        case .mindfulness: return "brain.head.profile"
        case .nutrition: return "leaf.fill"
        case .sleep: return "moon.zzz.fill"
        case .productivity: return "checkmark.seal.fill"
        case .social: return "person.2.fill"
        case .learning: return "book.fill"
        case .finance: return "banknote.fill"
        case .creativity: return "paintbrush.fill"
        case .other: return "star.fill"
        }
    }

    var defaultColor: String {
        switch self {
        case .health: return "red"
        case .fitness: return "orange"
        case .mindfulness: return "purple"
        case .nutrition: return "green"
        case .sleep: return "indigo"
        case .productivity: return "blue"
        case .social: return "teal"
        case .learning: return "brown"
        case .finance: return "yellow"
        case .creativity: return "pink"
        case .other: return "gray"
        }
    }
}

@Model
final class Habit {
    var id: UUID
    var name: String
    var habitDescription: String
    var category: HabitCategory
    var frequency: HabitFrequency
    var targetDaysPerWeek: Int
    var colorName: String
    var iconName: String
    var isActive: Bool
    var createdDate: Date
    var reminderEnabled: Bool
    var reminderTime: Date?
    @Relationship(deleteRule: .cascade) var logs: [HabitLog]

    var currentStreak: Int {
        var streak = 0
        var checkDate = Calendar.current.startOfDay(for: Date())
        let logDates = Set(
            logs.filter { $0.completed }
                .map { Calendar.current.startOfDay(for: $0.date) }
        )

        // Check today first, then go back
        while logDates.contains(checkDate) {
            streak += 1
            checkDate = Calendar.current.date(byAdding: .day, value: -1, to: checkDate)!
        }
        return streak
    }

    var longestStreak: Int {
        let sortedDates = logs.filter { $0.completed }
            .map { Calendar.current.startOfDay(for: $0.date) }
            .sorted()
            .removingDuplicates()

        guard !sortedDates.isEmpty else { return 0 }

        var maxStreak = 1
        var currentStreak = 1

        for i in 1..<sortedDates.count {
            let diff = Calendar.current.dateComponents([.day], from: sortedDates[i - 1], to: sortedDates[i]).day ?? 0
            if diff == 1 {
                currentStreak += 1
                maxStreak = max(maxStreak, currentStreak)
            } else {
                currentStreak = 1
            }
        }
        return maxStreak
    }

    var completionRateThisWeek: Double {
        let calendar = Calendar.current
        let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date()))!
        let thisWeekLogs = logs.filter { $0.date >= startOfWeek && $0.completed }
        let daysInWeek = min(7, max(1, calendar.dateComponents([.day], from: startOfWeek, to: Date()).day! + 1))
        return Double(thisWeekLogs.count) / Double(daysInWeek)
    }

    func isCompletedToday() -> Bool {
        let today = Calendar.current.startOfDay(for: Date())
        return logs.contains { log in
            Calendar.current.startOfDay(for: log.date) == today && log.completed
        }
    }

    init(
        name: String,
        habitDescription: String = "",
        category: HabitCategory = .health,
        frequency: HabitFrequency = .daily,
        targetDaysPerWeek: Int = 7,
        colorName: String = "blue",
        iconName: String = "star.fill",
        isActive: Bool = true,
        reminderEnabled: Bool = false,
        reminderTime: Date? = nil
    ) {
        self.id = UUID()
        self.name = name
        self.habitDescription = habitDescription
        self.category = category
        self.frequency = frequency
        self.targetDaysPerWeek = targetDaysPerWeek
        self.colorName = colorName
        self.iconName = iconName
        self.isActive = isActive
        self.createdDate = Date()
        self.reminderEnabled = reminderEnabled
        self.reminderTime = reminderTime
        self.logs = []
    }
}

@Model
final class HabitLog {
    var id: UUID
    var date: Date
    var completed: Bool
    var notes: String
    var habit: Habit?

    init(date: Date = Date(), completed: Bool = true, notes: String = "") {
        self.id = UUID()
        self.date = date
        self.completed = completed
        self.notes = notes
    }
}

extension Array where Element: Equatable {
    func removingDuplicates() -> [Element] {
        var result: [Element] = []
        for element in self {
            if !result.contains(element) {
                result.append(element)
            }
        }
        return result
    }
}
