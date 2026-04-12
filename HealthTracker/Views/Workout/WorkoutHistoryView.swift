import SwiftUI
import SwiftData

struct WorkoutHistoryView: View {
    @Query(sort: \WorkoutSession.date, order: .reverse) private var sessions: [WorkoutSession]
    @Environment(\.modelContext) private var modelContext
    @State private var selectedSession: WorkoutSession?

    var completedSessions: [WorkoutSession] {
        sessions.filter { $0.isCompleted }
    }

    var body: some View {
        Group {
            if completedSessions.isEmpty {
                EmptyStateView(
                    icon: "clock.arrow.trianglehead.counterclockwise.rotate.90",
                    title: "No workout history",
                    message: "Complete your first workout to see it here"
                )
            } else {
                List {
                    ForEach(completedSessions) { session in
                        Button {
                            selectedSession = session
                        } label: {
                            WorkoutHistoryRow(session: session)
                        }
                        .foregroundStyle(.primary)
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            modelContext.delete(completedSessions[index])
                        }
                        try? modelContext.save()
                    }
                }
                .listStyle(.insetGrouped)
            }
        }
        .navigationTitle("History")
        .sheet(item: $selectedSession) { session in
            WorkoutDetailView(session: session)
        }
    }
}

struct WorkoutHistoryRow: View {
    let session: WorkoutSession

    var body: some View {
        HStack(spacing: 12) {
            // Date circle
            VStack(spacing: 2) {
                Text(dayString(session.date))
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                Text(monthString(session.date))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 44)
            .padding(8)
            .background(Color.blue.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 4) {
                Text(session.name)
                    .font(.subheadline.bold())
                HStack(spacing: 8) {
                    if let mins = session.durationFormatted as String?, !mins.isEmpty {
                        Label(session.durationFormatted, systemImage: "clock")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Label("\(session.exercises.count) exercises", systemImage: "list.bullet")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                HStack(spacing: 8) {
                    Label("\(session.totalSets) sets", systemImage: "square.stack")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if session.totalVolume > 0 {
                        Label("\(Int(session.totalVolume))kg vol", systemImage: "scalemass")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if session.personalRecordsCount > 0 {
                        Label("\(session.personalRecordsCount) PR", systemImage: "trophy.fill")
                            .font(.caption)
                            .foregroundStyle(.yellow)
                    }
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
    }

    private func dayString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "d"
        return f.string(from: date)
    }

    private func monthString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "MMM"
        return f.string(from: date).uppercased()
    }
}

// MARK: - Workout Detail

struct WorkoutDetailView: View {
    let session: WorkoutSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Summary") {
                    LabeledContent("Date", value: session.date.mediumDateString)
                    LabeledContent("Duration", value: session.durationFormatted)
                    LabeledContent("Total Volume", value: "\(Int(session.totalVolume)) kg")
                    LabeledContent("Total Sets", value: "\(session.totalSets)")
                    if session.personalRecordsCount > 0 {
                        LabeledContent("Personal Records", value: "\(session.personalRecordsCount) 🏆")
                    }
                    if session.caloriesBurned > 0 {
                        LabeledContent("Calories Burned", value: "\(Int(session.caloriesBurned)) kcal")
                    }
                }

                ForEach(session.exercises.sorted { $0.order < $1.order }) { exercise in
                    Section(exercise.name) {
                        HStack {
                            Text("Muscle Group")
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(exercise.muscleGroup.rawValue)
                        }
                        .font(.subheadline)

                        ForEach(exercise.sets.sorted { $0.setNumber < $1.setNumber }) { set in
                            HStack {
                                if set.isWarmup {
                                    Text("Warm-up")
                                        .font(.caption)
                                        .foregroundStyle(.orange)
                                        .frame(width: 60)
                                } else {
                                    Text("Set \(set.setNumber)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .frame(width: 60)
                                }
                                Spacer()
                                if set.weight > 0 {
                                    Text("\(set.weight.formattedWeight) \(set.weightUnit.rawValue)")
                                        .font(.subheadline)
                                }
                                if set.reps > 0 {
                                    Text("× \(set.reps) reps")
                                        .font(.subheadline)
                                }
                                if set.isPersonalRecord {
                                    Image(systemName: "trophy.fill")
                                        .foregroundStyle(.yellow)
                                        .font(.caption)
                                }
                            }
                        }
                    }
                }

                if !session.notes.isEmpty {
                    Section("Notes") {
                        Text(session.notes)
                    }
                }
            }
            .navigationTitle(session.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
