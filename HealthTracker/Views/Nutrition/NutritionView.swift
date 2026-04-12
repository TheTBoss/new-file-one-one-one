import SwiftUI
import SwiftData
import Charts

struct NutritionView: View {
    @Query(sort: \FoodEntry.date, order: .reverse) private var allEntries: [FoodEntry]
    @Query private var goals: [DailyGoals]
    @Environment(\.modelContext) private var modelContext

    @State private var selectedDate = Date()
    @State private var showingAddFood = false
    @State private var selectedMealType: MealType = .breakfast
    @State private var foodToDelete: FoodEntry?
    @State private var showingDeleteConfirm = false
    @State private var selectedTab = 0

    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }

    private var todayEntries: [FoodEntry] {
        allEntries.filter { $0.date.isSameDay(as: selectedDate) }
    }

    private var totalCalories: Double { todayEntries.reduce(0) { $0 + $1.calories } }
    private var totalProtein: Double { todayEntries.reduce(0) { $0 + $1.protein } }
    private var totalCarbs: Double { todayEntries.reduce(0) { $0 + $1.carbohydrates } }
    private var totalFat: Double { todayEntries.reduce(0) { $0 + $1.fat } }
    private var totalFiber: Double { todayEntries.reduce(0) { $0 + $1.fiber } }
    private var totalSodium: Double { todayEntries.reduce(0) { $0 + $1.sodium } }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Date Picker
                    DateSelectorView(selectedDate: $selectedDate)
                        .padding(.horizontal)

                    // Calorie summary
                    CalorieSummarySection(
                        consumed: totalCalories,
                        goal: currentGoals.calorieGoal,
                        protein: totalProtein,
                        carbs: totalCarbs,
                        fat: totalFat,
                        proteinGoal: currentGoals.proteinGoal,
                        carbGoal: currentGoals.carbGoal,
                        fatGoal: currentGoals.fatGoal
                    )
                    .padding(.horizontal)

                    // Extra nutrients
                    HStack(spacing: 12) {
                        MiniNutrientCard(label: "Fiber", value: totalFiber, goal: currentGoals.fiberGoal, unit: "g", color: .green)
                        MiniNutrientCard(label: "Sodium", value: totalSodium, goal: 2300, unit: "mg", color: .red)
                    }
                    .padding(.horizontal)

                    // Meal sections
                    VStack(spacing: 12) {
                        ForEach(MealType.allCases, id: \.self) { mealType in
                            let entries = HealthDataStore.entriesForMealType(mealType, from: todayEntries, on: selectedDate)
                            MealSectionView(
                                mealType: mealType,
                                entries: entries,
                                onAdd: {
                                    selectedMealType = mealType
                                    showingAddFood = true
                                },
                                onDelete: { entry in
                                    foodToDelete = entry
                                    showingDeleteConfirm = true
                                }
                            )
                        }
                    }
                    .padding(.horizontal)

                    // 7-day calorie chart
                    CalorieHistoryChart(entries: allEntries, goal: currentGoals.calorieGoal)
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color.appBackground)
            .navigationTitle("Nutrition")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        selectedMealType = .snack
                        showingAddFood = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddFood) {
                AddFoodView(selectedMealType: selectedMealType, selectedDate: selectedDate)
            }
            .confirmationDialog("Delete food entry?", isPresented: $showingDeleteConfirm) {
                Button("Delete", role: .destructive) {
                    if let entry = foodToDelete {
                        modelContext.delete(entry)
                        try? modelContext.save()
                    }
                }
            }
        }
    }
}

// MARK: - Date Selector

struct DateSelectorView: View {
    @Binding var selectedDate: Date

    var body: some View {
        HStack {
            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate)!
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3)
                    .foregroundStyle(.blue)
            }
            Spacer()
            VStack(spacing: 2) {
                Text(selectedDate.relativeString)
                    .font(.headline)
                if !selectedDate.isToday {
                    Text(selectedDate.shortDateString)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            Button {
                if !selectedDate.isToday {
                    selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate)!
                }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.title3)
                    .foregroundStyle(selectedDate.isToday ? .tertiary : .blue)
            }
            .disabled(selectedDate.isToday)
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Calorie Summary Section

struct CalorieSummarySection: View {
    let consumed: Double
    let goal: Double
    let protein: Double
    let carbs: Double
    let fat: Double
    let proteinGoal: Double
    let carbGoal: Double
    let fatGoal: Double

    var remaining: Double { max(goal - consumed, 0) }
    var over: Double { max(consumed - goal, 0) }

    var body: some View {
        VStack(spacing: 14) {
            // Header
            HStack {
                VStack(alignment: .leading) {
                    Text("\(Int(consumed))")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                    Text("of \(Int(goal)) kcal")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    if over > 0 {
                        Label("\(Int(over)) over", systemImage: "exclamationmark.triangle.fill")
                            .font(.subheadline.bold())
                            .foregroundStyle(.red)
                    } else {
                        Label("\(Int(remaining)) left", systemImage: "flame.fill")
                            .font(.subheadline)
                            .foregroundStyle(.orange)
                    }
                }
            }

            // Calorie Progress Bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color(.systemGray5))
                        .frame(height: 12)
                    Capsule()
                        .fill(calorieBarColor)
                        .frame(width: geo.size.width * min(consumed / max(goal, 1), 1.0), height: 12)
                        .animation(.easeInOut, value: consumed)
                }
            }
            .frame(height: 12)

            // Macros
            MacroSummaryRow(
                protein: protein, carbs: carbs, fat: fat,
                proteinGoal: proteinGoal, carbGoal: carbGoal, fatGoal: fatGoal
            )
        }
        .cardStyle()
    }

    var calorieBarColor: Color {
        let ratio = consumed / max(goal, 1)
        if ratio > 1.0 { return .red }
        if ratio > 0.9 { return .orange }
        return .blue
    }
}

// MARK: - Mini Nutrient Card

struct MiniNutrientCard: View {
    let label: String
    let value: Double
    let goal: Double
    let unit: String
    let color: Color

    var progress: Double { goal > 0 ? min(value / goal, 1.0) : 0 }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(label)
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(Int(value))/\(Int(goal))\(unit)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: progress)
                .tint(color)
        }
        .cardStyle(padding: 12)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Meal Section

struct MealSectionView: View {
    let mealType: MealType
    let entries: [FoodEntry]
    let onAdd: () -> Void
    let onDelete: (FoodEntry) -> Void

    @State private var isExpanded = true

    var totalCalories: Double { entries.reduce(0) { $0 + $1.calories } }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            Button {
                withAnimation(.spring(duration: 0.3)) { isExpanded.toggle() }
            } label: {
                HStack {
                    Image(systemName: mealType.icon)
                        .foregroundStyle(Color(named: mealType.color))
                        .frame(width: 28)
                    Text(mealType.rawValue)
                        .font(.subheadline.bold())
                    Spacer()
                    if !entries.isEmpty {
                        Text("\(Int(totalCalories)) kcal")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(Color.cardBackground)
                .cornerRadius(isExpanded && !entries.isEmpty ? 0 : 16)
                .clipShape(isExpanded ? UnevenRoundedRectangle(topLeadingRadius: 16, topTrailingRadius: 16) : RoundedRectangle(cornerRadius: 16))
            }
            .buttonStyle(.plain)

            if isExpanded {
                VStack(spacing: 0) {
                    if entries.isEmpty {
                        HStack {
                            Text("No food logged")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                            Spacer()
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color.cardBackground)
                    } else {
                        ForEach(entries) { entry in
                            FoodEntryRow(entry: entry, onDelete: { onDelete(entry) })
                            if entry.id != entries.last?.id {
                                Divider().padding(.leading, 52)
                                    .background(Color.cardBackground)
                            }
                        }
                    }

                    // Add button
                    Button(action: onAdd) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(Color(named: mealType.color))
                            Text("Add food")
                                .font(.subheadline)
                                .foregroundStyle(Color(named: mealType.color))
                            Spacer()
                        }
                        .padding()
                        .background(Color.cardBackground)
                        .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 16, bottomTrailingRadius: 16))
                    }
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 4, y: 2)
    }
}

struct FoodEntryRow: View {
    let entry: FoodEntry
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    if !entry.brand.isEmpty {
                        Text(entry.brand)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text("·")
                            .foregroundStyle(.secondary)
                    }
                    Text("\(entry.servingSize, specifier: "%.0f") \(entry.servingUnit)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(Int(entry.calories))")
                    .font(.subheadline.bold())
                Text("kcal")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color.cardBackground)
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}

// MARK: - Calorie History Chart

struct CalorieHistoryChart: View {
    let entries: [FoodEntry]
    let goal: Double

    var last7Days: [CalorieDay] {
        Date.lastSevenDays.map { date in
            let cals = entries.filter { $0.date.isSameDay(as: date) }.reduce(0) { $0 + $1.calories }
            return CalorieDay(date: date, calories: cals)
        }
    }

    struct CalorieDay: Identifiable {
        let id = UUID()
        let date: Date
        let calories: Double
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("7-Day Calories")
                .font(.headline)

            Chart {
                ForEach(last7Days) { day in
                    BarMark(
                        x: .value("Day", day.date, unit: .day),
                        y: .value("Calories", day.calories)
                    )
                    .foregroundStyle(day.date.isToday ? Color.blue : Color.blue.opacity(0.5))
                    .cornerRadius(4)
                }
                RuleMark(y: .value("Goal", goal))
                    .foregroundStyle(.red.opacity(0.7))
                    .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
                    .annotation(position: .trailing) {
                        Text("Goal")
                            .font(.caption2)
                            .foregroundStyle(.red)
                    }
            }
            .frame(height: 140)
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
    NutritionView()
        .modelContainer(for: [FoodEntry.self, DailyGoals.self], inMemory: true)
}
