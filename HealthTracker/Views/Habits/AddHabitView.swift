import SwiftUI
import SwiftData

struct AddHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var habit: Habit? // nil = new habit, non-nil = edit

    @State private var name = ""
    @State private var description = ""
    @State private var category: HabitCategory = .health
    @State private var frequency: HabitFrequency = .daily
    @State private var targetDaysPerWeek = 7
    @State private var selectedColor = "blue"
    @State private var selectedIcon = "star.fill"
    @State private var reminderEnabled = false
    @State private var reminderTime = Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date()

    let colorOptions = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "teal", "indigo", "cyan", "brown"]

    let iconOptions = [
        "star.fill", "heart.fill", "flame.fill", "bolt.fill", "leaf.fill",
        "book.fill", "moon.fill", "sun.max.fill", "drop.fill", "figure.run",
        "dumbbell.fill", "brain.head.profile", "fork.knife", "bed.double.fill",
        "pencil", "music.note", "paintbrush.fill", "bicycle", "cross.fill",
        "medicinebox.fill", "checkmark.circle.fill", "timer", "camera.fill"
    ]

    var isValid: Bool { !name.trimmingCharacters(in: .whitespaces).isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                // Preview
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color(named: selectedColor).opacity(0.2))
                                    .frame(width: 64, height: 64)
                                Image(systemName: selectedIcon)
                                    .font(.title2)
                                    .foregroundStyle(Color(named: selectedColor))
                            }
                            Text(name.isEmpty ? "Habit name" : name)
                                .font(.headline)
                                .foregroundStyle(name.isEmpty ? .tertiary : .primary)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }

                Section("Details") {
                    TextField("Habit name *", text: $name)
                    TextField("Description (optional)", text: $description)
                    Picker("Category", selection: $category) {
                        ForEach(HabitCategory.allCases, id: \.self) { cat in
                            Label(cat.rawValue, systemImage: cat.icon).tag(cat)
                        }
                    }
                }

                Section("Frequency") {
                    Picker("Schedule", selection: $frequency) {
                        ForEach(HabitFrequency.allCases, id: \.self) { freq in
                            Text(freq.rawValue).tag(freq)
                        }
                    }
                    .pickerStyle(.segmented)
                    .labelsHidden()
                    if frequency == .custom {
                        Stepper("Target: \(targetDaysPerWeek)x / week", value: $targetDaysPerWeek, in: 1...7)
                    }
                }

                Section("Icon") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: 12) {
                        ForEach(iconOptions, id: \.self) { icon in
                            Button {
                                selectedIcon = icon
                            } label: {
                                ZStack {
                                    Circle()
                                        .fill(selectedIcon == icon ? Color(named: selectedColor).opacity(0.3) : Color(.systemGray5))
                                        .frame(width: 40, height: 40)
                                    Image(systemName: icon)
                                        .font(.subheadline)
                                        .foregroundStyle(selectedIcon == icon ? Color(named: selectedColor) : .secondary)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: 12) {
                        ForEach(colorOptions, id: \.self) { color in
                            Button {
                                selectedColor = color
                            } label: {
                                ZStack {
                                    Circle()
                                        .fill(Color(named: color))
                                        .frame(width: 36, height: 36)
                                    if selectedColor == color {
                                        Image(systemName: "checkmark")
                                            .font(.caption.bold())
                                            .foregroundStyle(.white)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section("Reminder") {
                    Toggle("Enable Reminder", isOn: $reminderEnabled)
                    if reminderEnabled {
                        DatePicker("Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
                    }
                }
            }
            .navigationTitle(habit == nil ? "New Habit" : "Edit Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(habit == nil ? "Create" : "Save") { save() }
                        .disabled(!isValid)
                        .fontWeight(.semibold)
                }
            }
            .onAppear { populateFromHabit() }
        }
    }

    private func populateFromHabit() {
        guard let h = habit else { return }
        name = h.name
        description = h.habitDescription
        category = h.category
        frequency = h.frequency
        targetDaysPerWeek = h.targetDaysPerWeek
        selectedColor = h.colorName
        selectedIcon = h.iconName
        reminderEnabled = h.reminderEnabled
        if let t = h.reminderTime { reminderTime = t }
    }

    private func save() {
        if let existing = habit {
            existing.name = name
            existing.habitDescription = description
            existing.category = category
            existing.frequency = frequency
            existing.targetDaysPerWeek = frequency == .daily ? 7 : targetDaysPerWeek
            existing.colorName = selectedColor
            existing.iconName = selectedIcon
            existing.reminderEnabled = reminderEnabled
            existing.reminderTime = reminderEnabled ? reminderTime : nil
        } else {
            let newHabit = Habit(
                name: name,
                habitDescription: description,
                category: category,
                frequency: frequency,
                targetDaysPerWeek: frequency == .daily ? 7 : targetDaysPerWeek,
                colorName: selectedColor,
                iconName: selectedIcon,
                reminderEnabled: reminderEnabled,
                reminderTime: reminderEnabled ? reminderTime : nil
            )
            modelContext.insert(newHabit)
        }
        try? modelContext.save()
        dismiss()
    }
}
