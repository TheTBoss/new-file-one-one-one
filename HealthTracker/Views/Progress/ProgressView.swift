import SwiftUI
import SwiftData

/// The Progress tab — hosts Water, Mood, Body, and Journal sub-sections
struct ProgressView: View {
    @State private var selectedSection = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Section picker
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ProgressSectionChip(label: "Water", icon: "drop.fill", color: .cyan, tag: 0, selected: $selectedSection)
                            ProgressSectionChip(label: "Mood", icon: "face.smiling", color: .yellow, tag: 1, selected: $selectedSection)
                            ProgressSectionChip(label: "Body", icon: "scalemass", color: .purple, tag: 2, selected: $selectedSection)
                            ProgressSectionChip(label: "Sleep", icon: "moon.fill", color: .indigo, tag: 3, selected: $selectedSection)
                            ProgressSectionChip(label: "Supplements", icon: "pills.fill", color: .green, tag: 4, selected: $selectedSection)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 12)
                    }

                    Divider()

                    // Section content
                    switch selectedSection {
                    case 0: WaterTrackerSection()
                    case 1: MoodTrackerSection()
                    case 2: BodyView()
                            .navigationBarHidden(true)
                    case 3: SleepView()
                            .navigationBarHidden(true)
                    case 4: SupplementTrackerSection()
                    default: EmptyView()
                    }
                }
            }
            .background(Color.appBackground)
            .navigationTitle("Progress")
        }
    }
}

struct ProgressSectionChip: View {
    let label: String
    let icon: String
    let color: Color
    let tag: Int
    @Binding var selected: Int

    var isSelected: Bool { selected == tag }

    var body: some View {
        Button {
            withAnimation(.spring(duration: 0.25)) { selected = tag }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption.bold())
                Text(label)
                    .font(.subheadline.bold())
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? color : Color(.systemGray5))
            .foregroundStyle(isSelected ? .white : .primary)
            .cornerRadius(20)
        }
    }
}

// MARK: - Water Tracker Section

struct WaterTrackerSection: View {
    @Query(sort: \WaterIntake.date, order: .reverse) private var entries: [WaterIntake]
    @Environment(\.modelContext) private var modelContext
    @Query private var goals: [DailyGoals]
    @State private var showingCustomAmount = false
    @State private var customAmount = ""

    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }
    private var todayTotal: Double { HealthDataStore.totalWaterToday(from: entries) }
    private var progress: Double { currentGoals.waterGoal > 0 ? min(todayTotal / currentGoals.waterGoal, 1.0) : 0 }
    private var todayEntries: [WaterIntake] { entries.filter { $0.date.isToday } }

    let quickAmounts: [(label: String, ml: Double)] = [
        ("Small Glass", 150),
        ("Glass", 250),
        ("Large Glass", 350),
        ("Bottle (500ml)", 500),
        ("Bottle (750ml)", 750),
        ("Bottle (1L)", 1000),
    ]

    var body: some View {
        VStack(spacing: 16) {
            // Main water card
            VStack(spacing: 16) {
                ZStack {
                    ProgressRingView(value: progress, lineWidth: 16, color: .cyan)
                        .frame(width: 150, height: 150)
                    VStack(spacing: 4) {
                        Text("\(Int(todayTotal))")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                        Text("of \(Int(currentGoals.waterGoal)) ml")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(progress >= 1.0 ? "Goal reached! Great job!" : "\(Int(currentGoals.waterGoal - todayTotal)) ml remaining")
                    .font(.subheadline)
                    .foregroundStyle(progress >= 1.0 ? .green : .secondary)
            }
            .padding(.horizontal)

            // Quick add buttons
            VStack(alignment: .leading, spacing: 10) {
                Text("Quick Add")
                    .font(.headline)
                    .padding(.horizontal)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(quickAmounts, id: \.label) { item in
                        Button {
                            addWater(ml: item.ml, source: item.label)
                        } label: {
                            VStack(spacing: 4) {
                                Image(systemName: "drop.fill")
                                    .foregroundStyle(.cyan)
                                    .font(.title3)
                                Text(item.label)
                                    .font(.caption2)
                                    .multilineTextAlignment(.center)
                                Text("\(Int(item.ml))ml")
                                    .font(.caption2.bold())
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.cardBackground)
                            .cornerRadius(12)
                        }
                    }
                    Button {
                        showingCustomAmount = true
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.blue)
                                .font(.title3)
                            Text("Custom")
                                .font(.caption2)
                            Text("amount")
                                .font(.caption2.bold())
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.cardBackground)
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
            }

            // Today's log
            if !todayEntries.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Today's Log")
                        .font(.headline)
                        .padding(.horizontal)

                    ForEach(todayEntries) { entry in
                        HStack {
                            Image(systemName: "drop.fill")
                                .foregroundStyle(.cyan)
                            Text(entry.source)
                                .font(.subheadline)
                            Spacer()
                            Text("+\(Int(entry.amountMl)) ml")
                                .font(.subheadline.bold())
                                .foregroundStyle(.cyan)
                            Text(entry.date.timeString)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color.cardBackground)
                        .cornerRadius(10)
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
        .alert("Custom Amount", isPresented: $showingCustomAmount) {
            TextField("Amount (ml)", text: $customAmount)
                .keyboardType(.numberPad)
            Button("Add") {
                if let ml = Double(customAmount), ml > 0 {
                    addWater(ml: ml, source: "Custom")
                    customAmount = ""
                }
            }
            Button("Cancel", role: .cancel) { customAmount = "" }
        }
    }

    private func addWater(ml: Double, source: String) {
        let entry = WaterIntake(amountMl: ml, source: source)
        modelContext.insert(entry)
        try? modelContext.save()
    }
}

// MARK: - Mood Tracker Section

struct MoodTrackerSection: View {
    @Query(sort: \MoodEntry.date, order: .reverse) private var entries: [MoodEntry]
    @Environment(\.modelContext) private var modelContext
    @State private var showingAddMood = false

    private var todayMood: MoodEntry? { entries.first(where: { $0.date.isToday }) }

    var body: some View {
        VStack(spacing: 16) {
            // Today's mood
            if let mood = todayMood {
                TodayMoodCard(mood: mood)
                    .padding(.horizontal)
            } else {
                Button {
                    showingAddMood = true
                } label: {
                    VStack(spacing: 12) {
                        Text("How are you feeling today?")
                            .font(.headline)
                        HStack(spacing: 20) {
                            ForEach(MoodLevel.allCases, id: \.self) { level in
                                Button {
                                    quickLogMood(level)
                                } label: {
                                    VStack(spacing: 4) {
                                        Text(level.emoji)
                                            .font(.system(size: 36))
                                        Text(level.label)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.cardBackground)
                    .cornerRadius(16)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
            }

            // Add detailed mood button
            Button {
                showingAddMood = true
            } label: {
                Label("Log Detailed Mood", systemImage: "plus.circle.fill")
                    .font(.subheadline.bold())
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.yellow.opacity(0.15))
                    .foregroundStyle(Color.orange)
                    .cornerRadius(12)
            }
            .padding(.horizontal)

            // Mood history
            if !entries.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Mood History")
                        .font(.headline)
                        .padding(.horizontal)
                    ForEach(entries.prefix(10)) { entry in
                        MoodHistoryRow(entry: entry)
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
        .sheet(isPresented: $showingAddMood) {
            AddMoodView()
        }
    }

    private func quickLogMood(_ level: MoodLevel) {
        let entry = MoodEntry(mood: level)
        modelContext.insert(entry)
        try? modelContext.save()
    }
}

struct TodayMoodCard: View {
    let mood: MoodEntry

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text(mood.mood.emoji)
                    .font(.system(size: 48))
                VStack(alignment: .leading, spacing: 4) {
                    Text("Today's Mood")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(mood.mood.label)
                        .font(.title3.bold())
                }
                Spacer()
            }
            Divider()
            HStack {
                MoodMeter(label: "Energy", value: mood.energyLevel, color: .yellow)
                Divider().frame(height: 40)
                MoodMeter(label: "Stress", value: mood.stressLevel, color: .red)
                Divider().frame(height: 40)
                MoodMeter(label: "Anxiety", value: mood.anxietyLevel, color: .orange)
            }
            if !mood.notes.isEmpty {
                Text(mood.notes)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .cardStyle()
    }
}

struct MoodMeter: View {
    let label: String
    let value: Int
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)/10")
                .font(.subheadline.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct MoodHistoryRow: View {
    let entry: MoodEntry

    var body: some View {
        HStack(spacing: 12) {
            Text(entry.mood.emoji)
                .font(.title2)
                .frame(width: 44)
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(entry.date.relativeString)
                        .font(.subheadline.bold())
                    Spacer()
                    Text(entry.mood.label)
                        .font(.caption)
                        .foregroundStyle(Color(named: entry.mood.colorName))
                }
                if !entry.notes.isEmpty {
                    Text(entry.notes)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(12)
    }
}

// MARK: - Add Mood View

struct AddMoodView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var mood: MoodLevel = .neutral
    @State private var energy = 5
    @State private var stress = 5
    @State private var anxiety = 5
    @State private var notes = ""
    @State private var tags: [String] = []
    @State private var tagInput = ""

    let suggestedTags = ["tired", "happy", "anxious", "motivated", "calm", "frustrated", "energized", "sad", "grateful", "confident"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Mood") {
                    HStack {
                        ForEach(MoodLevel.allCases, id: \.self) { level in
                            Button {
                                mood = level
                            } label: {
                                VStack(spacing: 4) {
                                    Text(level.emoji)
                                        .font(.title2)
                                    Text(level.label)
                                        .font(.caption2)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .background(mood == level ? Color(named: level.colorName).opacity(0.2) : Color.clear)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(mood == level ? Color(named: level.colorName) : Color.clear, lineWidth: 2)
                                )
                            }
                        }
                    }
                }

                Section("Levels") {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Label("Energy", systemImage: "bolt.fill").foregroundStyle(.yellow)
                            Spacer()
                            Text("\(energy)/10")
                        }
                        Slider(value: .init(get: { Double(energy) }, set: { energy = Int($0) }), in: 1...10, step: 1)
                            .tint(.yellow)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Label("Stress", systemImage: "brain.head.profile").foregroundStyle(.red)
                            Spacer()
                            Text("\(stress)/10")
                        }
                        Slider(value: .init(get: { Double(stress) }, set: { stress = Int($0) }), in: 1...10, step: 1)
                            .tint(.red)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Label("Anxiety", systemImage: "waveform.path.ecg").foregroundStyle(.orange)
                            Spacer()
                            Text("\(anxiety)/10")
                        }
                        Slider(value: .init(get: { Double(anxiety) }, set: { anxiety = Int($0) }), in: 1...10, step: 1)
                            .tint(.orange)
                    }
                }

                Section("Tags") {
                    FlowTagView(tags: $tags)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(suggestedTags.filter { !tags.contains($0) }, id: \.self) { tag in
                                Button {
                                    tags.append(tag)
                                } label: {
                                    Text("+ \(tag)")
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 5)
                                        .background(Color(.systemGray5))
                                        .cornerRadius(12)
                                }
                            }
                        }
                    }
                }

                Section("Notes") {
                    TextField("How are you feeling?", text: $notes, axis: .vertical)
                        .lineLimit(2...5)
                }
            }
            .navigationTitle("Log Mood")
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
        let entry = MoodEntry(
            mood: mood,
            energyLevel: energy,
            stressLevel: stress,
            anxietyLevel: anxiety,
            notes: notes,
            tags: tags
        )
        modelContext.insert(entry)
        try? modelContext.save()
        dismiss()
    }
}

struct FlowTagView: View {
    @Binding var tags: [String]

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(tags, id: \.self) { tag in
                HStack(spacing: 4) {
                    Text(tag)
                        .font(.caption)
                    Button {
                        tags.removeAll { $0 == tag }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color.blue.opacity(0.15))
                .foregroundStyle(.blue)
                .cornerRadius(12)
            }
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        let height = rows.map { $0.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0 }.reduce(0) { $0 + $1 + spacing }
        return CGSize(width: proposal.width ?? 0, height: max(0, height - spacing))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in computeRows(proposal: proposal, subviews: subviews) {
            var x = bounds.minX
            let rowHeight = row.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0
            for view in row {
                let size = view.sizeThatFits(.unspecified)
                view.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += rowHeight + spacing
        }
    }

    private func computeRows(proposal: ProposedViewSize, subviews: Subviews) -> [[LayoutSubview]] {
        var rows: [[LayoutSubview]] = [[]]
        var x: CGFloat = 0
        let maxWidth = proposal.width ?? 0

        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && !rows[rows.count - 1].isEmpty {
                rows.append([])
                x = 0
            }
            rows[rows.count - 1].append(view)
            x += size.width + spacing
        }
        return rows
    }
}

// MARK: - Supplement Tracker Section

struct SupplementTrackerSection: View {
    @Query(sort: \SupplementEntry.date, order: .reverse) private var entries: [SupplementEntry]
    @Environment(\.modelContext) private var modelContext
    @State private var showingAddSupplement = false

    var todayEntries: [SupplementEntry] { entries.filter { $0.date.isToday } }

    var body: some View {
        VStack(spacing: 16) {
            // Today's supplements
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Today's Supplements")
                        .font(.headline)
                    Spacer()
                    Button {
                        showingAddSupplement = true
                    } label: {
                        Label("Add", systemImage: "plus.circle.fill")
                            .font(.subheadline)
                    }
                }
                .padding(.horizontal)

                if todayEntries.isEmpty {
                    EmptyStateView(
                        icon: "pills",
                        title: "No supplements logged",
                        message: "Track your vitamins and supplements",
                        action: { showingAddSupplement = true },
                        actionLabel: "Add Supplement"
                    )
                } else {
                    ForEach(todayEntries) { entry in
                        SupplementRow(entry: entry) {
                            var updatedEntry = entry
                            updatedEntry.taken.toggle()
                            try? modelContext.save()
                        }
                        .padding(.horizontal)
                        .swipeActions(edge: .trailing) {
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
        .sheet(isPresented: $showingAddSupplement) {
            AddSupplementView()
        }
    }
}

struct SupplementRow: View {
    let entry: SupplementEntry
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: entry.taken ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(entry.taken ? .green : .secondary)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline.bold())
                    .strikethrough(entry.taken)
                HStack(spacing: 8) {
                    if !entry.dosage.isEmpty {
                        Text(entry.dosage)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Text(entry.timing)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            Image(systemName: "pills.fill")
                .foregroundStyle(.green.opacity(0.7))
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(12)
    }
}

struct AddSupplementView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var dosage = ""
    @State private var timing = "Morning"
    @State private var notes = ""

    let timingOptions = ["Morning", "Afternoon", "Evening", "Pre-workout", "Post-workout", "With meals", "Before bed"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Supplement") {
                    TextField("Name (e.g. Vitamin D3)", text: $name)
                    TextField("Dosage (e.g. 2000 IU)", text: $dosage)
                }
                Section("Timing") {
                    Picker("When", selection: $timing) {
                        ForEach(timingOptions, id: \.self) { t in Text(t).tag(t) }
                    }
                }
                Section("Notes") {
                    TextField("Optional notes...", text: $notes)
                }
            }
            .navigationTitle("Add Supplement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let entry = SupplementEntry(name: name, dosage: dosage, timing: timing, notes: notes)
                        modelContext.insert(entry)
                        try? modelContext.save()
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

#Preview {
    ProgressView()
        .modelContainer(for: [WaterIntake.self, MoodEntry.self, BodyMeasurement.self, DailyGoals.self, SupplementEntry.self], inMemory: true)
}
