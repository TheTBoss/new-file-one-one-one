import SwiftUI
import SwiftData

struct ActiveWorkoutView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Bindable var session: WorkoutSession

    @State private var showingAddExercise = false
    @State private var showingFinishConfirm = false
    @State private var elapsedSeconds = 0
    @State private var timerActive = true
    @State private var restTimerSeconds = 0
    @State private var showingRestTimer = false
    @State private var workoutName: String

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    init(session: WorkoutSession) {
        self.session = session
        _workoutName = State(initialValue: session.name)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Timer bar
                WorkoutTimerBar(
                    elapsed: elapsedSeconds,
                    volume: session.totalVolume,
                    setsCount: session.totalSets,
                    isActive: timerActive
                )
                .padding()

                // Rest timer overlay
                if showingRestTimer && restTimerSeconds > 0 {
                    RestTimerBanner(secondsLeft: $restTimerSeconds, onDismiss: { showingRestTimer = false })
                        .padding(.horizontal)
                }

                // Exercise list
                ScrollView {
                    VStack(spacing: 12) {
                        if session.exercises.isEmpty {
                            EmptyStateView(
                                icon: "dumbbell",
                                title: "No exercises yet",
                                message: "Tap + to add your first exercise",
                                action: { showingAddExercise = true },
                                actionLabel: "Add Exercise"
                            )
                            .padding(.top, 40)
                        } else {
                            ForEach(session.exercises.sorted { $0.order < $1.order }) { exercise in
                                ExerciseCard(
                                    exercise: exercise,
                                    onAddSet: {
                                        addSet(to: exercise)
                                    },
                                    onStartRest: { seconds in
                                        restTimerSeconds = seconds
                                        showingRestTimer = true
                                    },
                                    onDeleteExercise: {
                                        modelContext.delete(exercise)
                                    }
                                )
                                .padding(.horizontal)
                            }
                        }

                        Button {
                            showingAddExercise = true
                        } label: {
                            Label("Add Exercise", systemImage: "plus.circle.fill")
                                .font(.subheadline.bold())
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.cardBackground)
                                .cornerRadius(12)
                        }
                        .padding(.horizontal)
                        .padding(.bottom)
                    }
                    .padding(.top, 8)
                }

                // Finish button
                Button {
                    showingFinishConfirm = true
                } label: {
                    Text("Finish Workout")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundStyle(.white)
                        .cornerRadius(16)
                }
                .padding()
            }
            .navigationTitle($workoutName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Discard") {
                        modelContext.delete(session)
                        try? modelContext.save()
                        dismiss()
                    }
                    .foregroundStyle(.red)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        timerActive.toggle()
                    } label: {
                        Image(systemName: timerActive ? "pause.circle" : "play.circle")
                    }
                }
            }
            .onReceive(timer) { _ in
                if timerActive { elapsedSeconds += 1 }
                if restTimerSeconds > 0 { restTimerSeconds -= 1 }
                if restTimerSeconds == 0 && showingRestTimer { showingRestTimer = false }
            }
            .onAppear {
                workoutName = session.name
            }
            .onChange(of: workoutName) { _, newName in
                session.name = newName
            }
            .confirmationDialog("Finish workout?", isPresented: $showingFinishConfirm) {
                Button("Finish & Save") {
                    finishWorkout()
                }
                Button("Cancel", role: .cancel) {}
            }
            .sheet(isPresented: $showingAddExercise) {
                ExercisePickerView { preset in
                    addExercise(from: preset)
                    showingAddExercise = false
                }
            }
        }
    }

    private func addExercise(from preset: ExercisePreset) {
        let exercise = WorkoutExercise(
            name: preset.name,
            muscleGroup: preset.muscleGroup,
            exerciseType: preset.exerciseType,
            order: session.exercises.count
        )
        exercise.session = session
        modelContext.insert(exercise)
        session.exercises.append(exercise)
        // Add first empty set
        addSet(to: exercise)
    }

    private func addSet(to exercise: WorkoutExercise) {
        let prevWeight = exercise.sets.last?.weight ?? 0
        let prevReps = exercise.sets.last?.reps ?? 8
        let newSet = ExerciseSet(
            setNumber: exercise.sets.count + 1,
            reps: prevReps,
            weight: prevWeight
        )
        newSet.exercise = exercise
        modelContext.insert(newSet)
        exercise.sets.append(newSet)
        try? modelContext.save()
    }

    private func finishWorkout() {
        session.endTime = Date()
        session.isCompleted = true
        session.name = workoutName
        // Update total volume
        try? modelContext.save()
        dismiss()
    }
}

// MARK: - Workout Timer Bar

struct WorkoutTimerBar: View {
    let elapsed: Int
    let volume: Double
    let setsCount: Int
    let isActive: Bool

    var timeString: String {
        let h = elapsed / 3600
        let m = (elapsed % 3600) / 60
        let s = elapsed % 60
        if h > 0 { return String(format: "%d:%02d:%02d", h, m, s) }
        return String(format: "%02d:%02d", m, s)
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(isActive ? Color.green : Color.orange)
                        .frame(width: 8, height: 8)
                    Text(timeString)
                        .font(.system(.title3, design: .monospaced).bold())
                }
                Text(isActive ? "Active" : "Paused")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Divider().frame(height: 36)
            Spacer()
            StatLabel(title: "Sets", value: "\(setsCount)", color: .blue)
            Spacer()
            Divider().frame(height: 36)
            Spacer()
            StatLabel(title: "Volume", value: volume > 0 ? "\(Int(volume))kg" : "--", color: .orange)
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(16)
    }
}

// MARK: - Rest Timer Banner

struct RestTimerBanner: View {
    @Binding var secondsLeft: Int
    let onDismiss: () -> Void

    var body: some View {
        HStack {
            Image(systemName: "timer")
                .foregroundStyle(.orange)
            Text("Rest: \(secondsLeft)s")
                .font(.subheadline.bold())
            Spacer()
            Button("Skip", action: onDismiss)
                .font(.caption)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.orange.opacity(0.15))
        .cornerRadius(12)
    }
}

// MARK: - Exercise Card

struct ExerciseCard: View {
    @Bindable var exercise: WorkoutExercise
    let onAddSet: () -> Void
    let onStartRest: (Int) -> Void
    let onDeleteExercise: () -> Void
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        VStack(spacing: 0) {
            // Exercise header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(exercise.name)
                        .font(.subheadline.bold())
                    HStack(spacing: 4) {
                        Text(exercise.muscleGroup.rawValue)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if exercise.sets.count > 0 {
                            Text("· \(exercise.sets.filter { !$0.isWarmup }.count) sets · \(Int(exercise.totalVolume))kg vol")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                Spacer()
                Menu {
                    Button("Add Warm-up Set") {
                        addWarmupSet()
                    }
                    Button(role: .destructive, action: onDeleteExercise) {
                        Label("Remove Exercise", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundStyle(.secondary)
                }
            }
            .padding()

            // Sets header
            HStack {
                Text("SET")
                    .frame(width: 32, alignment: .center)
                Spacer()
                Text("PREV")
                    .frame(width: 70, alignment: .trailing)
                Text("KG")
                    .frame(width: 70, alignment: .trailing)
                Text("REPS")
                    .frame(width: 60, alignment: .trailing)
                Text("")
                    .frame(width: 36)
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
            .padding(.horizontal)
            .padding(.bottom, 4)

            Divider().padding(.horizontal)

            // Sets
            ForEach(exercise.sets.sorted { $0.setNumber < $1.setNumber }) { set in
                SetRow(set: set, onRestStart: { onStartRest(exercise.restTimeSeconds) })
                if set.id != exercise.sets.sorted { $0.setNumber < $1.setNumber }.last?.id {
                    Divider().padding(.leading, 52)
                }
            }

            // Add set button
            Button(action: onAddSet) {
                HStack {
                    Image(systemName: "plus")
                        .font(.caption)
                    Text("Add Set")
                        .font(.subheadline)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color(.systemGray6))
            }
        }
        .background(Color.cardBackground)
        .cornerRadius(16)
    }

    private func addWarmupSet() {
        let set = ExerciseSet(
            setNumber: exercise.sets.count + 1,
            reps: 10,
            weight: (exercise.sets.first?.weight ?? 20) * 0.5,
            isWarmup: true
        )
        set.exercise = exercise
        modelContext.insert(set)
        exercise.sets.append(set)
        try? modelContext.save()
    }
}

// MARK: - Set Row

struct SetRow: View {
    @Bindable var set: ExerciseSet
    let onRestStart: () -> Void
    @State private var isDone = false

    var body: some View {
        HStack(spacing: 0) {
            // Set number
            ZStack {
                if set.isWarmup {
                    Text("W")
                        .font(.caption.bold())
                        .foregroundStyle(.orange)
                        .frame(width: 32, height: 32)
                        .background(Color.orange.opacity(0.15))
                        .clipShape(Circle())
                } else {
                    Text("\(set.setNumber)")
                        .font(.subheadline.bold())
                        .foregroundStyle(isDone ? .white : .primary)
                        .frame(width: 32, height: 32)
                        .background(isDone ? Color.green : Color(.systemGray5))
                        .clipShape(Circle())
                }
            }
            .padding(.horizontal)

            Spacer()

            // Previous performance (placeholder)
            Text("–")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .frame(width: 70, alignment: .trailing)

            // Weight
            HStack(spacing: 4) {
                TextField("0", value: $set.weight, formatter: weightFormatter)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 55)
                    .font(.subheadline)
                Text("kg")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 70, alignment: .trailing)

            // Reps
            HStack(spacing: 0) {
                Button {
                    if set.reps > 0 { set.reps -= 1 }
                } label: {
                    Image(systemName: "minus")
                        .font(.caption2)
                        .frame(width: 20, height: 28)
                }
                Text("\(set.reps)")
                    .font(.subheadline.bold())
                    .frame(width: 28, alignment: .center)
                Button {
                    set.reps += 1
                } label: {
                    Image(systemName: "plus")
                        .font(.caption2)
                        .frame(width: 20, height: 28)
                }
            }
            .frame(width: 60, alignment: .trailing)

            // Done toggle
            Button {
                withAnimation {
                    isDone.toggle()
                    if isDone { onRestStart() }
                }
            } label: {
                Image(systemName: isDone ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isDone ? .green : .secondary)
                    .font(.title3)
                    .frame(width: 36)
            }
        }
        .padding(.vertical, 6)
    }

    var weightFormatter: NumberFormatter {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.maximumFractionDigits = 1
        return f
    }
}

// MARK: - Exercise Picker

struct ExercisePickerView: View {
    let onSelect: (ExercisePreset) -> Void
    @State private var searchText = ""
    @State private var selectedMuscleGroup: MuscleGroup?
    @Environment(\.dismiss) private var dismiss

    var filtered: [ExercisePreset] {
        var presets = ExercisePreset.library
        if let group = selectedMuscleGroup {
            presets = presets.filter { $0.muscleGroup == group }
        }
        if !searchText.isEmpty {
            presets = presets.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        return presets
    }

    var body: some View {
        NavigationStack {
            VStack {
                // Muscle group filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(label: "All", isSelected: selectedMuscleGroup == nil) {
                            selectedMuscleGroup = nil
                        }
                        ForEach(MuscleGroup.allCases, id: \.self) { group in
                            FilterChip(label: group.rawValue, isSelected: selectedMuscleGroup == group) {
                                selectedMuscleGroup = group == selectedMuscleGroup ? nil : group
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 8)

                List(filtered) { preset in
                    Button {
                        onSelect(preset)
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(preset.name)
                                    .foregroundStyle(.primary)
                                Text(preset.muscleGroup.rawValue)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text(preset.exerciseType.rawValue)
                                .font(.caption2)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color(.systemGray5))
                                .cornerRadius(8)
                        }
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search exercises...")
            .navigationTitle("Choose Exercise")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

struct FilterChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.systemGray5))
                .foregroundStyle(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}
