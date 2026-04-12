import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query private var foodEntries: [FoodEntry]
    @Query private var sleepEntries: [SleepEntry]
    @Query private var habits: [Habit]
    @Query private var workouts: [WorkoutSession]
    @Query private var waterEntries: [WaterIntake]
    @Query private var bodyMeasurements: [BodyMeasurement]
    @Query private var goals: [DailyGoals]
    @Query private var moodEntries: [MoodEntry]

    @State private var showingSettings = false

    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }

    private var todayCalories: Double { HealthDataStore.totalCaloriesToday(from: foodEntries) }
    private var todayProtein: Double { HealthDataStore.totalProteinToday(from: foodEntries) }
    private var todayCarbs: Double { HealthDataStore.totalCarbsToday(from: foodEntries) }
    private var todayFat: Double { HealthDataStore.totalFatToday(from: foodEntries) }
    private var todayWater: Double { HealthDataStore.totalWaterToday(from: waterEntries) }
    private var lastSleep: SleepEntry? { HealthDataStore.lastSleepEntry(from: sleepEntries) }
    private var latestWeight: Double? { HealthDataStore.latestWeight(from: bodyMeasurements) }
    private var habitCompletion: Double { HealthDataStore.completionRateToday(from: habits) }
    private var workoutsThisWeek: Int { HealthDataStore.workoutsThisWeek(from: workouts).count }

    private var calorieProgress: Double {
        currentGoals.calorieGoal > 0 ? min(todayCalories / currentGoals.calorieGoal, 1.0) : 0
    }
    private var waterProgress: Double {
        currentGoals.waterGoal > 0 ? min(todayWater / currentGoals.waterGoal, 1.0) : 0
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = UserProfile.name
        let prefix = name.isEmpty ? "" : ", \(name)"
        if hour < 12 { return "Good morning\(prefix)" }
        if hour < 17 { return "Good afternoon\(prefix)" }
        return "Good evening\(prefix)"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Greeting
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(greeting)
                                .font(.title2.bold())
                            Text(Date().mediumDateString)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button {
                            showingSettings = true
                        } label: {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 32))
                                .foregroundStyle(.blue)
                        }
                    }
                    .padding(.horizontal)

                    // Calorie Ring Card
                    CalorieRingCard(
                        consumed: todayCalories,
                        goal: currentGoals.calorieGoal,
                        protein: todayProtein,
                        carbs: todayCarbs,
                        fat: todayFat,
                        proteinGoal: currentGoals.proteinGoal
                    )
                    .padding(.horizontal)

                    // Quick Stats Grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        // Water
                        QuickStatCard(
                            icon: "drop.fill",
                            title: "Water",
                            value: String(format: "%.0f", todayWater),
                            unit: "ml",
                            subtitle: "Goal: \(Int(currentGoals.waterGoal))ml",
                            progress: waterProgress,
                            color: .cyan
                        )

                        // Sleep
                        if let sleep = lastSleep {
                            QuickStatCard(
                                icon: "moon.fill",
                                title: "Last Sleep",
                                value: sleep.durationFormatted,
                                unit: "",
                                subtitle: sleep.quality.label,
                                progress: min(sleep.durationHours / currentGoals.sleepGoal, 1.0),
                                color: .indigo
                            )
                        } else {
                            QuickStatCard(
                                icon: "moon.fill",
                                title: "Sleep",
                                value: "--",
                                unit: "",
                                subtitle: "No data",
                                progress: 0,
                                color: .indigo
                            )
                        }

                        // Habits
                        QuickStatCard(
                            icon: "checkmark.circle.fill",
                            title: "Habits",
                            value: "\(Int(habitCompletion * 100))",
                            unit: "%",
                            subtitle: "Today's completion",
                            progress: habitCompletion,
                            color: .green
                        )

                        // Workouts this week
                        QuickStatCard(
                            icon: "dumbbell.fill",
                            title: "Workouts",
                            value: "\(workoutsThisWeek)",
                            unit: "",
                            subtitle: "This week",
                            progress: min(Double(workoutsThisWeek) / 4.0, 1.0),
                            color: .orange
                        )
                    }
                    .padding(.horizontal)

                    // Weight Card
                    if let weight = latestWeight, weight > 0 {
                        WeightSummaryCard(weight: weight, goal: currentGoals.weightGoal)
                            .padding(.horizontal)
                    }

                    // Today's Mood
                    if let mood = moodEntries.filter({ $0.date.isToday }).last {
                        MoodSummaryCard(mood: mood)
                            .padding(.horizontal)
                    }

                    // Weekly Activity Ring
                    WeeklyActivityCard(workouts: workouts, habits: habits)
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color.appBackground)
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingSettings = true
                    } label: {
                        Image(systemName: "gearshape.fill")
                    }
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
        }
    }
}

// MARK: - Calorie Ring Card

struct CalorieRingCard: View {
    let consumed: Double
    let goal: Double
    let protein: Double
    let carbs: Double
    let fat: Double
    let proteinGoal: Double

    var remaining: Double { max(goal - consumed, 0) }
    var over: Double { max(consumed - goal, 0) }
    var progress: Double { goal > 0 ? min(consumed / goal, 1.0) : 0 }

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 24) {
                // Calorie ring
                ZStack {
                    ProgressRingView(value: progress, lineWidth: 14, color: progressColor, backgroundColor: Color(.systemGray5))
                    VStack(spacing: 2) {
                        Text(consumed.formattedCalories)
                            .font(.title2.bold())
                        Text("kcal")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(width: 110, height: 110)

                // Stats
                VStack(alignment: .leading, spacing: 8) {
                    if over > 0 {
                        HStack {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundStyle(.red)
                            Text("\(Int(over)) over goal")
                                .font(.subheadline)
                                .foregroundStyle(.red)
                        }
                    } else {
                        HStack {
                            Image(systemName: "flame.fill")
                                .foregroundStyle(.orange)
                            Text("\(Int(remaining)) remaining")
                                .font(.subheadline)
                        }
                    }
                    Text("Goal: \(Int(goal)) kcal")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Divider()

                    HStack(spacing: 16) {
                        MacroChip(label: "P", value: protein, color: .blue)
                        MacroChip(label: "C", value: carbs, color: .orange)
                        MacroChip(label: "F", value: fat, color: .yellow)
                    }
                }
                Spacer()
            }

            // Macro bar
            MacroBarView(protein: protein, carbs: carbs, fat: fat)
                .frame(height: 8)
            HStack {
                Label("Protein", systemImage: "circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.blue)
                Spacer()
                Label("Carbs", systemImage: "circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                Spacer()
                Label("Fat", systemImage: "circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.yellow)
            }
        }
        .cardStyle()
    }

    var progressColor: Color {
        if progress >= 1.0 { return .red }
        if progress >= 0.85 { return .orange }
        return .blue
    }
}

struct MacroChip: View {
    let label: String
    let value: Double
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.caption2.bold())
                .foregroundStyle(color)
            Text("\(Int(value))g")
                .font(.caption.bold())
        }
    }
}

// MARK: - Quick Stat Card

struct QuickStatCard: View {
    let icon: String
    let title: String
    let value: String
    let unit: String
    let subtitle: String
    let progress: Double
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(color)
                    .font(.subheadline)
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
            }

            HStack(alignment: .lastTextBaseline, spacing: 3) {
                Text(value)
                    .font(.title2.bold())
                if !unit.isEmpty {
                    Text(unit)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            ProgressView(value: progress)
                .tint(color)

            Text(subtitle)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .cardStyle()
    }
}

// MARK: - Weight Summary Card

struct WeightSummaryCard: View {
    let weight: Double
    let goal: Double

    var diff: Double { weight - goal }

    var body: some View {
        HStack {
            Image(systemName: "scalemass.fill")
                .font(.title2)
                .foregroundStyle(.purple)
                .frame(width: 44, height: 44)
                .background(Color.purple.opacity(0.15))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text("Current Weight")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text(weight.formattedWeight)
                        .font(.title3.bold())
                    Text("kg")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Goal: \(goal.formattedWeight) kg")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if diff != 0 {
                    Text(diff > 0 ? "+\(diff.formattedWeight)" : diff.formattedWeight)
                        .font(.caption.bold())
                        .foregroundStyle(diff > 0 ? .orange : .green)
                }
            }
        }
        .cardStyle()
    }
}

// MARK: - Mood Summary Card

struct MoodSummaryCard: View {
    let mood: MoodEntry

    var body: some View {
        HStack(spacing: 12) {
            Text(mood.mood.emoji)
                .font(.title)
                .frame(width: 44, height: 44)
                .background(Color(named: mood.mood.colorName).opacity(0.15))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text("Today's Mood")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(mood.mood.label)
                    .font(.subheadline.bold())
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Label("\(mood.energyLevel)/10", systemImage: "bolt.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
                Label("\(mood.stressLevel)/10", systemImage: "brain.head.profile")
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
        .cardStyle()
    }
}

// MARK: - Weekly Activity Card

struct WeeklyActivityCard: View {
    let workouts: [WorkoutSession]
    let habits: [Habit]

    private var weekDays: [Date] { Array(Date.lastSevenDays) }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("This Week")
                .font(.headline)

            HStack(spacing: 6) {
                ForEach(weekDays, id: \.self) { day in
                    VStack(spacing: 4) {
                        DayActivityDot(
                            hasWorkout: workouts.contains { $0.date.isSameDay(as: day) },
                            habitCompletion: habitCompletionFor(day: day)
                        )
                        Text(dayLabel(day))
                            .font(.caption2)
                            .foregroundStyle(day.isToday ? .blue : .secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .cardStyle()
    }

    private func dayLabel(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return String(formatter.string(from: date).prefix(1))
    }

    private func habitCompletionFor(day: Date) -> Double {
        let active = habits.filter { $0.isActive }
        guard !active.isEmpty else { return 0 }
        let completed = active.filter { habit in
            habit.logs.contains { log in log.date.isSameDay(as: day) && log.completed }
        }.count
        return Double(completed) / Double(active.count)
    }
}

struct DayActivityDot: View {
    let hasWorkout: Bool
    let habitCompletion: Double

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color(.systemGray4), lineWidth: 2)
                .frame(width: 32, height: 32)

            Circle()
                .trim(from: 0, to: habitCompletion)
                .stroke(Color.green, style: StrokeStyle(lineWidth: 2, lineCap: .round))
                .frame(width: 32, height: 32)
                .rotationEffect(.degrees(-90))

            if hasWorkout {
                Image(systemName: "dumbbell.fill")
                    .font(.system(size: 10))
                    .foregroundStyle(.orange)
            }
        }
    }
}

#Preview {
    DashboardView()
        .modelContainer(for: [FoodEntry.self, SleepEntry.self, Habit.self, WorkoutSession.self, WaterIntake.self, BodyMeasurement.self, DailyGoals.self, MoodEntry.self], inMemory: true)
}
