import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var goals: [DailyGoals]

    @State private var name = UserProfile.name
    @State private var heightCm = UserProfile.heightCm
    @State private var birthYear = UserProfile.birthYear
    @State private var preferKg = UserProfile.preferredWeightUnit == .kg

    // Goal settings
    @State private var calorieGoal = ""
    @State private var proteinGoal = ""
    @State private var carbGoal = ""
    @State private var fatGoal = ""
    @State private var waterGoal = ""
    @State private var sleepGoal = ""
    @State private var stepsGoal = ""
    @State private var weightGoal = ""

    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(.blue)
                        VStack(alignment: .leading) {
                            TextField("Your name", text: $name)
                                .font(.headline)
                            Text("Age: \(UserProfile.age)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)

                    HStack {
                        Text("Height")
                        Spacer()
                        TextField("cm", value: $heightCm, formatter: NumberFormatter())
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("cm")
                            .foregroundStyle(.secondary)
                    }

                    HStack {
                        Text("Birth Year")
                        Spacer()
                        TextField("YYYY", value: $birthYear, formatter: NumberFormatter())
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 70)
                    }

                    Toggle("Use Kilograms (kg)", isOn: $preferKg)
                }

                Section("Daily Goals") {
                    GoalField(label: "Calories", unit: "kcal", value: $calorieGoal)
                    GoalField(label: "Protein", unit: "g", value: $proteinGoal)
                    GoalField(label: "Carbs", unit: "g", value: $carbGoal)
                    GoalField(label: "Fat", unit: "g", value: $fatGoal)
                    GoalField(label: "Fiber", unit: "g", value: $waterGoal)
                    GoalField(label: "Water", unit: "ml", value: $waterGoal)
                    GoalField(label: "Sleep", unit: "hrs", value: $sleepGoal)
                    GoalField(label: "Steps", unit: "steps", value: $stepsGoal)
                    GoalField(label: "Target Weight", unit: preferKg ? "kg" : "lbs", value: $weightGoal)
                }

                Section("App") {
                    NavigationLink {
                        AboutView()
                    } label: {
                        Label("About HealthTracker", systemImage: "info.circle")
                    }
                    Label("Version 1.0.0", systemImage: "app.badge")
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveSettings()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
            .onAppear { loadGoals() }
        }
    }

    private func loadGoals() {
        let g = currentGoals
        calorieGoal = "\(Int(g.calorieGoal))"
        proteinGoal = "\(Int(g.proteinGoal))"
        carbGoal = "\(Int(g.carbGoal))"
        fatGoal = "\(Int(g.fatGoal))"
        waterGoal = "\(Int(g.waterGoal))"
        sleepGoal = String(format: "%.1f", g.sleepGoal)
        stepsGoal = "\(g.stepsGoal)"
        weightGoal = String(format: "%.1f", g.weightGoal)
    }

    private func saveSettings() {
        // Save profile
        UserProfile.name = name
        UserProfile.heightCm = heightCm
        UserProfile.birthYear = birthYear
        UserProfile.preferredWeightUnit = preferKg ? .kg : .lbs

        // Save goals
        let g = currentGoals
        g.calorieGoal = Double(calorieGoal) ?? g.calorieGoal
        g.proteinGoal = Double(proteinGoal) ?? g.proteinGoal
        g.carbGoal = Double(carbGoal) ?? g.carbGoal
        g.fatGoal = Double(fatGoal) ?? g.fatGoal
        g.waterGoal = Double(waterGoal) ?? g.waterGoal
        g.sleepGoal = Double(sleepGoal) ?? g.sleepGoal
        g.stepsGoal = Int(stepsGoal) ?? g.stepsGoal
        g.weightGoal = Double(weightGoal) ?? g.weightGoal

        try? modelContext.save()
    }
}

struct GoalField: View {
    let label: String
    let unit: String
    @Binding var value: String

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            TextField("0", text: $value)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.trailing)
                .frame(width: 80)
            Text(unit)
                .foregroundStyle(.secondary)
                .frame(width: 40, alignment: .leading)
        }
    }
}

struct AboutView: View {
    var body: some View {
        List {
            Section {
                VStack(spacing: 12) {
                    Image(systemName: "heart.text.square.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(.red)
                    Text("HealthTracker")
                        .font(.title.bold())
                    Text("Your comprehensive health companion")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding()
            }

            Section("Features") {
                Label("Calorie & Macro Tracking", systemImage: "fork.knife")
                Label("Workout Logging with Sets & Reps", systemImage: "dumbbell.fill")
                Label("Sleep Quality Monitoring", systemImage: "moon.zzz.fill")
                Label("Habit Building & Streaks", systemImage: "checkmark.circle.fill")
                Label("Body Measurements & BMI", systemImage: "scalemass.fill")
                Label("Water Intake Tracking", systemImage: "drop.fill")
                Label("Mood & Energy Logging", systemImage: "face.smiling")
                Label("Supplement Tracker", systemImage: "pills.fill")
                Label("Progress Charts & Analytics", systemImage: "chart.line.uptrend.xyaxis")
            }
        }
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.inline)
    }
}
