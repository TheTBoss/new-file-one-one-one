import SwiftUI
import SwiftData
import Charts

struct SleepView: View {
    @Query(sort: \SleepEntry.date, order: .reverse) private var entries: [SleepEntry]
    @Environment(\.modelContext) private var modelContext
    @Query private var goals: [DailyGoals]

    @State private var showingAddSleep = false
    @State private var entryToDelete: SleepEntry?

    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }
    private var lastEntry: SleepEntry? { entries.first }
    private var avgDuration: Double { HealthDataStore.averageSleepDuration(from: entries) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Last night's sleep card
                    if let last = lastEntry {
                        LastSleepCard(entry: last, goal: currentGoals.sleepGoal)
                            .padding(.horizontal)
                    } else {
                        EmptyStateView(
                            icon: "moon.zzz.fill",
                            title: "No sleep logged",
                            message: "Track your sleep to see insights",
                            action: { showingAddSleep = true },
                            actionLabel: "Log Sleep"
                        )
                        .padding(.horizontal)
                        .cardStyle()
                    }

                    // 7-day chart
                    if entries.count >= 2 {
                        SleepHistoryChart(entries: Array(entries.prefix(7)), goal: currentGoals.sleepGoal)
                            .padding(.horizontal)
                    }

                    // Average stats
                    SleepStatsCard(entries: entries, goal: currentGoals.sleepGoal)
                        .padding(.horizontal)

                    // History list
                    if !entries.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Sleep History")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(entries) { entry in
                                SleepHistoryRow(entry: entry)
                                    .padding(.horizontal)
                                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                        Button(role: .destructive) {
                                            modelContext.delete(entry)
                                            try? modelContext.save()
                                        } label: {
                                            Label("Delete", systemImage: "trash")
                                        }
                                    }
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
            .background(Color.appBackground)
            .navigationTitle("Sleep")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddSleep = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddSleep) {
                AddSleepView()
            }
        }
    }
}

// MARK: - Last Sleep Card

struct LastSleepCard: View {
    let entry: SleepEntry
    let goal: Double

    var progress: Double { goal > 0 ? min(entry.durationHours / goal, 1.0) : 0 }
    var isUnderGoal: Bool { entry.durationHours < goal }

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.date.isToday ? "Last Night" : entry.date.relativeString)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    HStack(alignment: .lastTextBaseline, spacing: 6) {
                        Text(entry.durationFormatted)
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                        Text("of sleep")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    HStack(spacing: 8) {
                        Text(entry.quality.emoji + " \(entry.quality.label)")
                            .font(.subheadline)
                        if entry.feltRested {
                            Label("Felt rested", systemImage: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                }
                Spacer()

                // Sleep arc ring
                ZStack {
                    ProgressRingView(value: progress, lineWidth: 10, color: sleepColor)
                        .frame(width: 80, height: 80)
                    VStack(spacing: 0) {
                        Text(String(format: "%.0f", entry.durationHours))
                            .font(.title3.bold())
                        Text("hrs")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            // Times row
            HStack {
                TimeBlock(label: "Bedtime", time: entry.bedTime.timeString, icon: "moon.fill", color: .indigo)
                Spacer()
                Image(systemName: "arrow.right")
                    .foregroundStyle(.secondary)
                Spacer()
                TimeBlock(label: "Wake up", time: entry.wakeTime.timeString, icon: "sunrise.fill", color: .orange)
                Spacer()
                if entry.interruptions > 0 {
                    TimeBlock(label: "Interruptions", time: "\(entry.interruptions)x", icon: "bolt.fill", color: .red)
                }
            }
        }
        .cardStyle()
    }

    var sleepColor: Color {
        let h = entry.durationHours
        if h < 6 { return .red }
        if h < 7 { return .orange }
        return .indigo
    }
}

struct TimeBlock: View {
    let label: String
    let time: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .font(.caption)
            Text(time)
                .font(.subheadline.bold())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Sleep History Chart

struct SleepHistoryChart: View {
    let entries: [SleepEntry]
    let goal: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Sleep Duration (7 days)")
                .font(.headline)

            Chart {
                ForEach(entries) { entry in
                    BarMark(
                        x: .value("Date", entry.date, unit: .day),
                        y: .value("Hours", entry.durationHours)
                    )
                    .foregroundStyle(barColor(entry.durationHours))
                    .cornerRadius(4)
                    .annotation(position: .top) {
                        if entries.count <= 5 {
                            Text(entry.durationFormatted)
                                .font(.system(size: 9))
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                RuleMark(y: .value("Goal", goal))
                    .foregroundStyle(.green.opacity(0.7))
                    .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
            }
            .frame(height: 150)
            .chartYAxis {
                AxisMarks(values: .stride(by: 2)) { val in
                    AxisValueLabel { Text("\(val.as(Int.self) ?? 0)h") }
                    AxisGridLine()
                }
            }
            .chartXAxis {
                AxisMarks(values: .stride(by: .day)) { _ in
                    AxisValueLabel(format: .dateTime.weekday(.abbreviated))
                }
            }
        }
        .cardStyle()
    }

    func barColor(_ hours: Double) -> Color {
        if hours < 6 { return .red }
        if hours < 7 { return .orange }
        return .indigo
    }
}

// MARK: - Sleep Stats Card

struct SleepStatsCard: View {
    let entries: [SleepEntry]
    let goal: Double

    var avgHours: Double { HealthDataStore.averageSleepDuration(from: entries) }
    var avgQuality: Double {
        guard !entries.isEmpty else { return 0 }
        return Double(entries.reduce(0) { $0 + $1.quality.rawValue }) / Double(entries.count)
    }
    var longestSleep: Double { entries.map { $0.durationHours }.max() ?? 0 }
    var shortestSleep: Double { entries.filter { $0.durationHours > 0 }.map { $0.durationHours }.min() ?? 0 }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Statistics")
                .font(.headline)
            HStack {
                StatLabel(title: "Avg Duration", value: String(format: "%.1f", avgHours), unit: "hrs", color: .indigo)
                Spacer()
                Divider().frame(height: 40)
                Spacer()
                StatLabel(title: "Avg Quality", value: String(format: "%.1f", avgQuality), unit: "/5", color: .blue)
                Spacer()
                Divider().frame(height: 40)
                Spacer()
                StatLabel(title: "Goal", value: String(format: "%.0f", goal), unit: "hrs", color: .green)
            }
        }
        .cardStyle()
    }
}

// MARK: - Sleep History Row

struct SleepHistoryRow: View {
    let entry: SleepEntry

    var body: some View {
        HStack(spacing: 12) {
            // Quality indicator
            VStack(spacing: 2) {
                Text(entry.quality.emoji)
                    .font(.title3)
                Circle()
                    .fill(Color(named: entry.quality.systemColor).opacity(0.4))
                    .frame(width: 8, height: 8)
            }
            .frame(width: 36)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(entry.date.relativeString)
                        .font(.subheadline.bold())
                    Spacer()
                    Text(entry.durationFormatted)
                        .font(.subheadline.bold())
                        .foregroundStyle(Color(named: entry.quality.systemColor))
                }
                HStack(spacing: 12) {
                    Label(entry.bedTime.timeString, systemImage: "moon.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Label(entry.wakeTime.timeString, systemImage: "sunrise.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if entry.interruptions > 0 {
                        Label("\(entry.interruptions)x", systemImage: "bolt")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(12)
    }
}

#Preview {
    SleepView()
        .modelContainer(for: [SleepEntry.self, DailyGoals.self], inMemory: true)
}
