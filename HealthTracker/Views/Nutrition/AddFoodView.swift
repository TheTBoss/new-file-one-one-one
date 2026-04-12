import SwiftUI
import SwiftData

struct AddFoodView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var selectedMealType: MealType = .snack
    var selectedDate: Date = Date()

    @State private var name = ""
    @State private var brand = ""
    @State private var calories = ""
    @State private var protein = ""
    @State private var carbs = ""
    @State private var fat = ""
    @State private var fiber = ""
    @State private var sugar = ""
    @State private var sodium = ""
    @State private var servingSize = "1"
    @State private var servingUnit = "serving"
    @State private var mealType: MealType
    @State private var notes = ""
    @State private var showingPresets = false
    @State private var searchText = ""

    // Computed: calories from macros
    var calculatedCalories: Double {
        let p = Double(protein) ?? 0
        let c = Double(carbs) ?? 0
        let f = Double(fat) ?? 0
        return p * 4 + c * 4 + f * 9
    }

    var isValid: Bool {
        !name.isEmpty && (Double(calories) ?? 0) > 0
    }

    init(selectedMealType: MealType = .snack, selectedDate: Date = Date()) {
        self.selectedMealType = selectedMealType
        self.selectedDate = selectedDate
        _mealType = State(initialValue: selectedMealType)
    }

    var body: some View {
        NavigationStack {
            Form {
                // Quick Presets
                Section {
                    Button {
                        showingPresets = true
                    } label: {
                        Label("Choose from Food Library", systemImage: "list.bullet.rectangle")
                    }
                }

                // Food Info
                Section("Food Details") {
                    TextField("Food name *", text: $name)
                    TextField("Brand (optional)", text: $brand)
                    Picker("Meal", selection: $mealType) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            Label(type.rawValue, systemImage: type.icon)
                                .tag(type)
                        }
                    }
                    HStack {
                        TextField("Serving size", text: $servingSize)
                            .keyboardType(.decimalPad)
                            .frame(width: 80)
                        TextField("Unit (g, ml, oz...)", text: $servingUnit)
                    }
                }

                // Calories
                Section("Calories") {
                    HStack {
                        TextField("Calories *", text: $calories)
                            .keyboardType(.decimalPad)
                        if !protein.isEmpty || !carbs.isEmpty || !fat.isEmpty {
                            Button("Use Macro Calc") {
                                calories = String(Int(calculatedCalories))
                            }
                            .font(.caption)
                            .buttonStyle(.bordered)
                        }
                    }
                }

                // Macros
                Section("Macronutrients") {
                    HStack {
                        Label("Protein", systemImage: "circle.fill")
                            .foregroundStyle(.blue)
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $protein)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("g")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Label("Carbs", systemImage: "circle.fill")
                            .foregroundStyle(.orange)
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $carbs)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("g")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Label("Fat", systemImage: "circle.fill")
                            .foregroundStyle(.yellow)
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $fat)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("g")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Fiber")
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $fiber)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("g")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Sugar")
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $sugar)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("g")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Sodium")
                            .frame(width: 100, alignment: .leading)
                        Spacer()
                        TextField("0", text: $sodium)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("mg")
                            .foregroundStyle(.secondary)
                    }
                }

                // Notes
                Section("Notes") {
                    TextField("Optional notes...", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
            }
            .navigationTitle("Add Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { save() }
                        .disabled(!isValid)
                        .fontWeight(.semibold)
                }
            }
            .sheet(isPresented: $showingPresets) {
                FoodPresetsSheet { preset in
                    applyPreset(preset)
                    showingPresets = false
                }
            }
        }
    }

    private func save() {
        let entry = FoodEntry(
            name: name,
            brand: brand,
            calories: Double(calories) ?? 0,
            protein: Double(protein) ?? 0,
            carbohydrates: Double(carbs) ?? 0,
            fat: Double(fat) ?? 0,
            fiber: Double(fiber) ?? 0,
            sugar: Double(sugar) ?? 0,
            sodium: Double(sodium) ?? 0,
            servingSize: Double(servingSize) ?? 1,
            servingUnit: servingUnit,
            mealType: mealType,
            date: selectedDate,
            notes: notes
        )
        modelContext.insert(entry)
        try? modelContext.save()
        dismiss()
    }

    private func applyPreset(_ preset: FoodPreset) {
        name = preset.name
        brand = preset.brand
        calories = String(Int(preset.calories))
        protein = String(format: "%.1f", preset.protein)
        carbs = String(format: "%.1f", preset.carbohydrates)
        fat = String(format: "%.1f", preset.fat)
        servingSize = String(Int(preset.servingSize))
        servingUnit = preset.servingUnit
    }
}

// MARK: - Food Presets Sheet

struct FoodPresetsSheet: View {
    let onSelect: (FoodPreset) -> Void
    @State private var searchText = ""
    @Environment(\.dismiss) private var dismiss

    var filteredPresets: [FoodPreset] {
        if searchText.isEmpty { return FoodPreset.common }
        return FoodPreset.common.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            List(filteredPresets) { preset in
                Button {
                    onSelect(preset)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(preset.name)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                            Text("\(Int(preset.calories)) kcal · \(Int(preset.protein))g protein · per \(Int(preset.servingSize))\(preset.servingUnit)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search foods...")
            .navigationTitle("Food Library")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}
