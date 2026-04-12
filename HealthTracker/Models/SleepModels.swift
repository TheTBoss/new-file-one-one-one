import Foundation
import SwiftData

enum SleepQuality: Int, Codable, CaseIterable {
    case terrible = 1
    case poor = 2
    case fair = 3
    case good = 4
    case excellent = 5

    var label: String {
        switch self {
        case .terrible: return "Terrible"
        case .poor: return "Poor"
        case .fair: return "Fair"
        case .good: return "Good"
        case .excellent: return "Excellent"
        }
    }

    var emoji: String {
        switch self {
        case .terrible: return "😴"
        case .poor: return "😪"
        case .fair: return "😑"
        case .good: return "😊"
        case .excellent: return "🌟"
        }
    }

    var systemColor: String {
        switch self {
        case .terrible: return "red"
        case .poor: return "orange"
        case .fair: return "yellow"
        case .good: return "green"
        case .excellent: return "blue"
        }
    }
}

@Model
final class SleepEntry {
    var id: UUID
    var bedTime: Date
    var wakeTime: Date
    var quality: SleepQuality
    var notes: String
    var date: Date
    var interruptions: Int
    var feltRested: Bool

    var duration: TimeInterval {
        max(0, wakeTime.timeIntervalSince(bedTime))
    }

    var durationHours: Double {
        duration / 3600
    }

    var durationFormatted: String {
        let hours = Int(durationHours)
        let minutes = Int((durationHours - Double(hours)) * 60)
        if hours == 0 {
            return "\(minutes)m"
        } else if minutes == 0 {
            return "\(hours)h"
        }
        return "\(hours)h \(minutes)m"
    }

    init(
        bedTime: Date,
        wakeTime: Date,
        quality: SleepQuality = .good,
        notes: String = "",
        date: Date = Date(),
        interruptions: Int = 0,
        feltRested: Bool = true
    ) {
        self.id = UUID()
        self.bedTime = bedTime
        self.wakeTime = wakeTime
        self.quality = quality
        self.notes = notes
        self.date = date
        self.interruptions = interruptions
        self.feltRested = feltRested
    }
}
