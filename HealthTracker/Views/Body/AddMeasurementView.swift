import SwiftUI
import SwiftData

struct AddMeasurementView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var weight = ""
    @State private var bodyFat = ""
    @State private var muscleMass = ""
    @State private var waterPercentage = ""
    @State private var chest = ""
    @State private var waist = ""
    @State private var hips = ""
    @State private var neck = ""
    @State private var bicepLeft = ""
    @State private var bicepRight = ""
    @State private var thighLeft = ""
    @State private var thighRight = ""
    @State private var calfLeft = ""
    @State private var calfRight = ""
    @State private var shoulders = ""
    @State private var notes = ""
    @State private var showingAllMeasurements = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Date") {
                    DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
                }

                Section("Body Weight & Composition") {
                    MeasurementField(label: "Weight", placeholder: "0.0", unit: "kg", value: $weight)
                    MeasurementField(label: "Body Fat", placeholder: "0.0", unit: "%", value: $bodyFat)
                    MeasurementField(label: "Muscle Mass", placeholder: "0.0", unit: "kg", value: $muscleMass)
                    MeasurementField(label: "Water %", placeholder: "0.0", unit: "%", value: $waterPercentage)
                }

                Section {
                    DisclosureGroup("Circumference Measurements (cm)", isExpanded: $showingAllMeasurements) {
                        MeasurementField(label: "Chest", placeholder: "0", unit: "cm", value: $chest)
                        MeasurementField(label: "Waist", placeholder: "0", unit: "cm", value: $waist)
                        MeasurementField(label: "Hips", placeholder: "0", unit: "cm", value: $hips)
                        MeasurementField(label: "Neck", placeholder: "0", unit: "cm", value: $neck)
                        MeasurementField(label: "Shoulders", placeholder: "0", unit: "cm", value: $shoulders)
                        MeasurementField(label: "Bicep (L)", placeholder: "0", unit: "cm", value: $bicepLeft)
                        MeasurementField(label: "Bicep (R)", placeholder: "0", unit: "cm", value: $bicepRight)
                        MeasurementField(label: "Thigh (L)", placeholder: "0", unit: "cm", value: $thighLeft)
                        MeasurementField(label: "Thigh (R)", placeholder: "0", unit: "cm", value: $thighRight)
                        MeasurementField(label: "Calf (L)", placeholder: "0", unit: "cm", value: $calfLeft)
                        MeasurementField(label: "Calf (R)", placeholder: "0", unit: "cm", value: $calfRight)
                    }
                }

                Section("Notes") {
                    TextField("Optional notes...", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
            }
            .navigationTitle("Log Measurements")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .fontWeight(.semibold)
                        .disabled(weight.isEmpty && bodyFat.isEmpty)
                }
            }
        }
    }

    private func save() {
        let entry = BodyMeasurement(
            date: date,
            weight: Double(weight) ?? 0,
            bodyFat: Double(bodyFat) ?? 0,
            muscleMass: Double(muscleMass) ?? 0,
            waterPercentage: Double(waterPercentage) ?? 0,
            chest: Double(chest) ?? 0,
            waist: Double(waist) ?? 0,
            hips: Double(hips) ?? 0,
            neck: Double(neck) ?? 0,
            bicepLeft: Double(bicepLeft) ?? 0,
            bicepRight: Double(bicepRight) ?? 0,
            thighLeft: Double(thighLeft) ?? 0,
            thighRight: Double(thighRight) ?? 0,
            calfLeft: Double(calfLeft) ?? 0,
            calfRight: Double(calfRight) ?? 0,
            shoulders: Double(shoulders) ?? 0,
            notes: notes
        )
        modelContext.insert(entry)
        try? modelContext.save()
        dismiss()
    }
}

struct MeasurementField: View {
    let label: String
    let placeholder: String
    let unit: String
    @Binding var value: String

    var body: some View {
        HStack {
            Text(label)
                .frame(width: 110, alignment: .leading)
            Spacer()
            TextField(placeholder, text: $value)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.trailing)
                .frame(width: 80)
            Text(unit)
                .foregroundStyle(.secondary)
                .frame(width: 32, alignment: .trailing)
        }
    }
}
