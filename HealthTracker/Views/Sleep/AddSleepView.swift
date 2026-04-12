import SwiftUI
import SwiftData

struct AddSleepView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var bedTime: Date
    @State private var wakeTime: Date
    @State private var quality: SleepQuality = .good
    @State private var notes = ""
    @State private var interruptions = 0
    @State private var feltRested = true

    init() {
        // Default: went to bed at 10 PM last night, woke at 6 AM
        let calendar = Calendar.current
        let now = Date()
        var bedComponents = calendar.dateComponents([.year, .month, .day], from: now)
        bedComponents.hour = 22
        bedComponents.minute = 0
        bedComponents.day! -= 1
        let defaultBed = calendar.date(from: bedComponents) ?? now.addingTimeInterval(-8 * 3600)

        var wakeComponents = calendar.dateComponents([.year, .month, .day], from: now)
        wakeComponents.hour = 6
        wakeComponents.minute = 0
        let defaultWake = calendar.date(from: wakeComponents) ?? now

        _bedTime = State(initialValue: defaultBed)
        _wakeTime = State(initialValue: defaultWake)
    }

    var duration: TimeInterval {
        max(0, wakeTime.timeIntervalSince(bedTime))
    }

    var durationFormatted: String {
        let h = Int(duration / 3600)
        let m = Int((duration.truncatingRemainder(dividingBy: 3600)) / 60)
        return "\(h)h \(m)m"
    }

    var durationColor: Color {
        let hours = duration / 3600
        if hours < 6 { return .red }
        if hours < 7 { return .orange }
        if hours <= 9 { return .green }
        return .blue
    }

    var body: some View {
        NavigationStack {
            Form {
                // Duration preview
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 6) {
                            Text(durationFormatted)
                                .font(.system(size: 48, weight: .bold, design: .rounded))
                                .foregroundStyle(durationColor)
                            Text("Sleep Duration")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }

                Section("Times") {
                    DatePicker("Bed Time", selection: $bedTime, displayedComponents: [.date, .hourAndMinute])
                    DatePicker("Wake Time", selection: $wakeTime, displayedComponents: [.date, .hourAndMinute])
                }

                Section("Quality") {
                    HStack {
                        ForEach(SleepQuality.allCases, id: \.self) { q in
                            Button {
                                quality = q
                            } label: {
                                VStack(spacing: 4) {
                                    Text(q.emoji)
                                        .font(.title2)
                                    Text(q.label)
                                        .font(.caption2)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .background(quality == q ? Color(named: q.systemColor).opacity(0.2) : Color.clear)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(quality == q ? Color(named: q.systemColor) : Color.clear, lineWidth: 2)
                                )
                            }
                        }
                    }
                }

                Section("Details") {
                    Stepper("Interruptions: \(interruptions)", value: $interruptions, in: 0...10)
                    Toggle("Felt Rested", isOn: $feltRested)
                }

                Section("Notes") {
                    TextField("How did you sleep?", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
            }
            .navigationTitle("Log Sleep")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .fontWeight(.semibold)
                }
            }
        }
    }

    private func save() {
        let entry = SleepEntry(
            bedTime: bedTime,
            wakeTime: wakeTime,
            quality: quality,
            notes: notes,
            date: wakeTime,
            interruptions: interruptions,
            feltRested: feltRested
        )
        modelContext.insert(entry)
        try? modelContext.save()
        dismiss()
    }
}
