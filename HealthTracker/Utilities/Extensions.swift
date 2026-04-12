import SwiftUI
import Foundation

// MARK: - Date Extensions

extension Date {
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isYesterday: Bool {
        Calendar.current.isDateInYesterday(self)
    }

    func isSameDay(as other: Date) -> Bool {
        Calendar.current.isDate(self, inSameDayAs: other)
    }

    var shortDateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        return formatter.string(from: self)
    }

    var timeString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }

    var mediumDateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: self)
    }

    var dayOfWeekString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: self)
    }

    var relativeString: String {
        if isToday { return "Today" }
        if isYesterday { return "Yesterday" }
        return mediumDateString
    }

    func daysAgo(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -days, to: self)!
    }

    static var lastSevenDays: [Date] {
        (0..<7).map { Date().daysAgo($0) }.reversed()
    }

    static var lastThirtyDays: [Date] {
        (0..<30).map { Date().daysAgo($0) }.reversed()
    }
}

// MARK: - Double Extensions

extension Double {
    var formattedCalories: String {
        let val = Int(self)
        return "\(val)"
    }

    var formattedMacro: String {
        String(format: "%.1f", self)
    }

    var formattedWeight: String {
        String(format: "%.1f", self)
    }

    var formattedPercent: String {
        String(format: "%.0f%%", self)
    }
}

// MARK: - Color Extensions

extension Color {
    static let cardBackground = Color(.secondarySystemBackground)
    static let appBackground = Color(.systemBackground)

    init(named colorName: String) {
        switch colorName {
        case "red": self = .red
        case "orange": self = .orange
        case "yellow": self = .yellow
        case "green": self = .green
        case "blue": self = .blue
        case "purple": self = .purple
        case "pink": self = .pink
        case "teal": self = .teal
        case "indigo": self = .indigo
        case "cyan": self = .cyan
        case "brown": self = Color.brown
        case "gray": self = .gray
        default: self = .blue
        }
    }
}

// MARK: - View Extensions

extension View {
    func cardStyle(padding: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(Color.cardBackground)
            .cornerRadius(16)
    }

    func sectionHeader(_ title: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .padding(.horizontal)
                .padding(.bottom, 4)
            self
        }
    }
}

// MARK: - Progress Ring

struct ProgressRingView: View {
    let value: Double      // 0.0 to 1.0
    let lineWidth: CGFloat
    let color: Color
    let backgroundColor: Color

    init(value: Double, lineWidth: CGFloat = 8, color: Color = .blue, backgroundColor: Color = Color(.systemGray5)) {
        self.value = min(max(value, 0), 1.0)
        self.lineWidth = lineWidth
        self.color = color
        self.backgroundColor = backgroundColor
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(backgroundColor, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: value)
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut, value: value)
        }
    }
}

// MARK: - Stat Label

struct StatLabel: View {
    let title: String
    let value: String
    let unit: String
    let color: Color

    init(title: String, value: String, unit: String = "", color: Color = .primary) {
        self.title = title
        self.value = value
        self.unit = unit
        self.color = color
    }

    var body: some View {
        VStack(spacing: 2) {
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.title2.bold())
                    .foregroundStyle(color)
                if !unit.isEmpty {
                    Text(unit)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var action: (() -> Void)?
    var actionLabel: String?

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 52))
                .foregroundStyle(.tertiary)
            Text(title)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            if let action, let label = actionLabel {
                Button(action: action) {
                    Label(label, systemImage: "plus.circle.fill")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Macro Bar

struct MacroBarView: View {
    let protein: Double
    let carbs: Double
    let fat: Double

    var total: Double { protein + carbs + fat }

    var proteinFraction: Double { total > 0 ? protein / total : 0 }
    var carbsFraction: Double { total > 0 ? carbs / total : 0 }
    var fatFraction: Double { total > 0 ? fat / total : 0 }

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                Rectangle()
                    .fill(Color.blue)
                    .frame(width: geometry.size.width * proteinFraction)
                Rectangle()
                    .fill(Color.orange)
                    .frame(width: geometry.size.width * carbsFraction)
                Rectangle()
                    .fill(Color.yellow)
                    .frame(width: geometry.size.width * fatFraction)
            }
        }
        .frame(height: 8)
        .clipShape(Capsule())
    }
}
