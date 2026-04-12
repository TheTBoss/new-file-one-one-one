import SwiftUI
import SwiftData
import Charts

struct WorkoutView: View {
    @Query(sort: \WorkoutSession.date, order: .reverse) private var sessions: [WorkoutSession]
    @Environment(\.modelContext) private var modelContext

    @State private var showingNewWorkout = false
    @State private var activeSession: WorkoutSession?
    @State private var selectedTab = 0

    var completedSessions: [WorkoutSession] {
        sessions.filter { $0.isCompleted }
    }

    var thisWeekSessions: [WorkoutSession] {
        HealthDataStore.workoutsThisWeek(from: completedSessions)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Start workout button
                    StartWorkoutCard {
                        startNewWorkout()
                    }
                    .padding(.horizontal)

                    // This week stats
                    WeeklyWorkoutStats(sessions: thisWeekSessions)
                        .padding(.horizontal)

                    // Volume chart
                    if completedSessions.count >= 2 {
                        VolumeChart(sessions: completedSessions)
                            .padding(.horizontal)
                    }

                    // Recent workouts
                    if !completedSessions.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Recent Workouts")
                                    .font(.headline)
                                Spacer()
                                NavigationLink("See All") {
                                    WorkoutHistoryView()
                                }
                                .font(.subheadline)
                            }
                            .padding(.horizontal)

                            ForEach(completedSessions.prefix(5)) { session in
                                NavigationLink {
                                    WorkoutDetailView(session: session)
                                } label: {
                                    WorkoutHistoryRow(session: session)
                                        .padding()
                                        .background(Color.cardBackground)
                                        .cornerRadius(16)
                                }
                                .foregroundStyle(.primary)
                                .padding(.horizontal)
                            }
                        }
                    } else {
                        EmptyStateView(
                            icon: "dumbbell",
                            title: "No workouts yet",
                            message: "Start your first workout to begin tracking your progress",
                            action: startNewWorkout,
                            actionLabel: "Start Workout"
                        )
                        .padding(.top, 20)
                    }
                }
                .padding(.vertical)
            }
            .background(Color.appBackground)
            .navigationTitle("Workout")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        startNewWorkout()
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .fullScreenCover(item: $activeSession) { session in
                ActiveWorkoutView(session: session)
            }
        }
    }

    private func startNewWorkout() {
        let session = WorkoutSession(name: "Workout \(Date().shortDateString)")
        modelContext.insert(session)
        try? modelContext.save()
        activeSession = session
    }
}

// MARK: - Start Workout Card

struct StartWorkoutCard: View {
    let onStart: () -> Void

    var body: some View {
        Button(action: onStart) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.orange.opacity(0.15))
                        .frame(width: 60, height: 60)
                    Image(systemName: "play.fill")
                        .font(.title2)
                        .foregroundStyle(.orange)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("Start Workout")
                        .font(.title3.bold())
                        .foregroundStyle(.primary)
                    Text("Track exercises, sets, reps & weight")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [Color.orange.opacity(0.1), Color.red.opacity(0.05)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.orange.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

// MARK: - Weekly Workout Stats

struct WeeklyWorkoutStats: View {
    let sessions: [WorkoutSession]

    var totalVolume: Double { sessions.reduce(0) { $0 + $1.totalVolume } }
    var totalSets: Int { sessions.reduce(0) { $0 + $1.totalSets } }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("This Week")
                .font(.headline)
            HStack {
                StatPill(value: "\(sessions.count)", label: "Workouts", color: .orange)
                StatPill(value: "\(totalSets)", label: "Total Sets", color: .blue)
                StatPill(value: totalVolume > 0 ? "\(Int(totalVolume / 1000))t" : "--", label: "Volume", color: .green)
            }
        }
        .cardStyle()
    }
}

struct StatPill: View {
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Volume Chart

struct VolumeChart: View {
    let sessions: [WorkoutSession]

    var last7: [WorkoutSession] {
        let cutoff = Date().daysAgo(7)
        return sessions.filter { $0.date >= cutoff && $0.isCompleted }
    }

    struct DayVolume: Identifiable {
        let id = UUID()
        let date: Date
        let volume: Double
    }

    var volumeData: [DayVolume] {
        Date.lastSevenDays.map { date in
            let dayVolume = sessions
                .filter { $0.date.isSameDay(as: date) && $0.isCompleted }
                .reduce(0) { $0 + $1.totalVolume }
            return DayVolume(date: date, volume: dayVolume)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Weekly Volume")
                .font(.headline)
            Chart(volumeData) { item in
                BarMark(
                    x: .value("Day", item.date, unit: .day),
                    y: .value("Volume (kg)", item.volume)
                )
                .foregroundStyle(item.date.isToday ? Color.orange : Color.orange.opacity(0.5))
                .cornerRadius(4)
            }
            .frame(height: 130)
            .chartXAxis {
                AxisMarks(values: .stride(by: .day)) { _ in
                    AxisValueLabel(format: .dateTime.weekday(.abbreviated))
                }
            }
        }
        .cardStyle()
    }
}

#Preview {
    WorkoutView()
        .modelContainer(for: [WorkoutSession.self, WorkoutExercise.self, ExerciseSet.self], inMemory: true)
}
