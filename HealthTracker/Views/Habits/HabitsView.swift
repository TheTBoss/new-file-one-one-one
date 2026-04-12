import SwiftUI
import SwiftData
import Charts

struct HabitsView: View {
    @Query(sort: \Habit.createdDate, order: .forward) private var habits: [Habit]
    @Environment(\.modelContext) private var modelContext

    @State private var showingAddHabit = false
    @State private var habitToEdit: Habit?
    @State private var selectedView = 0

    var activeHabits: [Habit] { habits.filter { $0.isActive } }
    var completedToday: Int { activeHabits.filter { $0.isCompletedToday() }.count }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Today's progress
                    if !activeHabits.isEmpty {
                        HabitProgressCard(total: activeHabits.count, completed: completedToday)
                            .padding(.horizontal)
                    }

                    // View toggle
                    Picker("View", selection: $selectedView) {
                        Text("Today").tag(0)
                        Text("Streaks").tag(1)
                        Text("Weekly").tag(2)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)

                    if activeHabits.isEmpty {
                        EmptyStateView(
                            icon: "checkmark.circle",
                            title: "No habits yet",
                            message: "Build positive habits by tracking them daily",
                            action: { showingAddHabit = true },
                            actionLabel: "Add Your First Habit"
                        )
                        .padding(.top, 20)
                    } else {
                        switch selectedView {
                        case 0:
                            TodayHabitsSection(habits: activeHabits, onEdit: { habitToEdit = $0 })
                        case 1:
                            StreaksSection(habits: activeHabits)
                        case 2:
                            WeeklyHabitsSection(habits: activeHabits)
                        default:
                            EmptyView()
                        }
                    }
                }
                .padding(.vertical)
            }
            .background(Color.appBackground)
            .navigationTitle("Habits")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddHabit = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddHabit) {
                AddHabitView()
            }
            .sheet(item: $habitToEdit) { habit in
                AddHabitView(habit: habit)
            }
        }
    }
}

// MARK: - Habit Progress Card

struct HabitProgressCard: View {
    let total: Int
    let completed: Int

    var progress: Double { total > 0 ? Double(completed) / Double(total) : 0 }

    var motivationalMessage: String {
        if completed == 0 { return "Let's get started!" }
        if completed == total { return "Perfect day! All habits done!" }
        if progress >= 0.75 { return "Almost there, keep going!" }
        if progress >= 0.5 { return "Great progress, halfway there!" }
        return "Good start, keep it up!"
    }

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                ProgressRingView(value: progress, lineWidth: 8, color: .green)
                    .frame(width: 70, height: 70)
                VStack(spacing: 0) {
                    Text("\(completed)")
                        .font(.title3.bold())
                    Text("/ \(total)")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Today's Habits")
                    .font(.headline)
                Text(motivationalMessage)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                ProgressView(value: progress)
                    .tint(.green)
            }
        }
        .cardStyle()
    }
}

// MARK: - Today Habits Section

struct TodayHabitsSection: View {
    let habits: [Habit]
    let onEdit: (Habit) -> Void
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        VStack(spacing: 8) {
            ForEach(habits) { habit in
                HabitRow(habit: habit, onEdit: { onEdit(habit) }, onDelete: {
                    modelContext.delete(habit)
                    try? modelContext.save()
                })
                .padding(.horizontal)
            }
        }
    }
}

// MARK: - Habit Row

struct HabitRow: View {
    @Bindable var habit: Habit
    let onEdit: () -> Void
    let onDelete: () -> Void
    @Environment(\.modelContext) private var modelContext

    var isCompletedToday: Bool { habit.isCompletedToday() }

    var body: some View {
        HStack(spacing: 14) {
            // Completion button
            Button {
                toggleCompletion()
            } label: {
                ZStack {
                    Circle()
                        .fill(isCompletedToday ? Color(named: habit.colorName) : Color(.systemGray5))
                        .frame(width: 48, height: 48)
                    Image(systemName: isCompletedToday ? "checkmark" : habit.iconName)
                        .font(isCompletedToday ? .headline : .subheadline)
                        .foregroundStyle(isCompletedToday ? .white : Color(named: habit.colorName))
                }
            }
            .buttonStyle(.plain)

            // Habit info
            VStack(alignment: .leading, spacing: 3) {
                Text(habit.name)
                    .font(.subheadline.bold())
                    .strikethrough(isCompletedToday, color: .secondary)
                HStack(spacing: 6) {
                    Label(habit.category.rawValue, systemImage: habit.category.icon)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if habit.currentStreak > 0 {
                        Label("\(habit.currentStreak)", systemImage: "flame.fill")
                            .font(.caption.bold())
                            .foregroundStyle(.orange)
                    }
                }
            }

            Spacer()

            // Week view
            WeekDotRow(habit: habit)
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(16)
        .contextMenu {
            Button("Edit") { onEdit() }
            Button("Toggle Active") {
                habit.isActive.toggle()
                try? modelContext.save()
            }
            Button("Delete", role: .destructive) { onDelete() }
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button {
                toggleCompletion()
            } label: {
                Label(isCompletedToday ? "Undo" : "Done", systemImage: isCompletedToday ? "arrow.uturn.left" : "checkmark")
            }
            .tint(isCompletedToday ? .orange : .green)
        }
        .swipeActions(edge: .trailing) {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
            Button(action: onEdit) {
                Label("Edit", systemImage: "pencil")
            }
            .tint(.blue)
        }
    }

    private func toggleCompletion() {
        let today = Calendar.current.startOfDay(for: Date())
        if let existing = habit.logs.first(where: { Calendar.current.startOfDay(for: $0.date) == today }) {
            existing.completed.toggle()
        } else {
            let log = HabitLog(date: Date(), completed: true)
            log.habit = habit
            modelContext.insert(log)
            habit.logs.append(log)
        }
        withAnimation(.spring(duration: 0.3)) {}
        try? modelContext.save()
    }
}

// MARK: - Week Dot Row

struct WeekDotRow: View {
    let habit: Habit

    var weekDays: [Date] { Array(Date.lastSevenDays) }

    var body: some View {
        HStack(spacing: 4) {
            ForEach(weekDays, id: \.self) { day in
                let completed = habit.logs.contains { log in
                    log.date.isSameDay(as: day) && log.completed
                }
                Circle()
                    .fill(completed ? Color(named: habit.colorName) : Color(.systemGray5))
                    .frame(width: 8, height: 8)
            }
        }
    }
}

// MARK: - Streaks Section

struct StreaksSection: View {
    let habits: [Habit]

    var sortedByStreak: [Habit] {
        habits.sorted { $0.currentStreak > $1.currentStreak }
    }

    var body: some View {
        VStack(spacing: 8) {
            ForEach(sortedByStreak) { habit in
                StreakCard(habit: habit)
                    .padding(.horizontal)
            }
        }
    }
}

struct StreakCard: View {
    let habit: Habit

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color(named: habit.colorName).opacity(0.2))
                    .frame(width: 48, height: 48)
                Image(systemName: habit.iconName)
                    .foregroundStyle(Color(named: habit.colorName))
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .font(.subheadline.bold())
                Label("Best: \(habit.longestStreak) days", systemImage: "trophy.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                HStack(spacing: 4) {
                    Text("\(habit.currentStreak)")
                        .font(.title3.bold())
                        .foregroundStyle(habit.currentStreak > 0 ? .orange : .secondary)
                    Image(systemName: "flame.fill")
                        .foregroundStyle(habit.currentStreak > 0 ? .orange : .secondary)
                }
                Text("current streak")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(16)
    }
}

// MARK: - Weekly Habits Section

struct WeeklyHabitsSection: View {
    let habits: [Habit]

    var weekDays: [Date] { Array(Date.lastSevenDays) }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Habit")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                ForEach(weekDays, id: \.self) { day in
                    Text(dayLetter(day))
                        .font(.caption2)
                        .foregroundStyle(day.isToday ? .blue : .secondary)
                        .frame(width: 28, alignment: .center)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)

            ForEach(habits) { habit in
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: habit.iconName)
                            .foregroundStyle(Color(named: habit.colorName))
                            .frame(width: 20)
                        Text(habit.name)
                            .font(.subheadline)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    ForEach(weekDays, id: \.self) { day in
                        let done = habit.logs.contains { log in
                            log.date.isSameDay(as: day) && log.completed
                        }
                        ZStack {
                            Circle()
                                .fill(done ? Color(named: habit.colorName) : Color(.systemGray5))
                                .frame(width: 24, height: 24)
                            if done {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(.white)
                            }
                        }
                        .frame(width: 28)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                Divider().padding(.horizontal)
            }
        }
        .background(Color.cardBackground)
        .cornerRadius(16)
        .padding(.horizontal)
    }

    private func dayLetter(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "EEE"
        return String(f.string(from: date).prefix(1))
    }
}

#Preview {
    HabitsView()
        .modelContainer(for: [Habit.self, HabitLog.self], inMemory: true)
}
