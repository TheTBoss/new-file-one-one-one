import Foundation
import SwiftData

enum MuscleGroup: String, Codable, CaseIterable {
    case chest = "Chest"
    case back = "Back"
    case shoulders = "Shoulders"
    case biceps = "Biceps"
    case triceps = "Triceps"
    case forearms = "Forearms"
    case core = "Core"
    case glutes = "Glutes"
    case quads = "Quads"
    case hamstrings = "Hamstrings"
    case calves = "Calves"
    case fullBody = "Full Body"
    case cardio = "Cardio"

    var icon: String {
        switch self {
        case .chest: return "figure.strengthtraining.traditional"
        case .back: return "figure.strengthtraining.traditional"
        case .shoulders: return "figure.strengthtraining.traditional"
        case .biceps, .triceps, .forearms: return "dumbbell.fill"
        case .core: return "figure.core.training"
        case .glutes, .quads, .hamstrings, .calves: return "figure.run"
        case .fullBody: return "figure.strengthtraining.functional"
        case .cardio: return "heart.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .chest: return "red"
        case .back: return "blue"
        case .shoulders: return "orange"
        case .biceps: return "purple"
        case .triceps: return "indigo"
        case .forearms: return "teal"
        case .core: return "yellow"
        case .glutes: return "pink"
        case .quads: return "green"
        case .hamstrings: return "brown"
        case .calves: return "cyan"
        case .fullBody: return "gray"
        case .cardio: return "red"
        }
    }
}

enum ExerciseType: String, Codable, CaseIterable {
    case strength = "Strength"
    case cardio = "Cardio"
    case flexibility = "Flexibility"
    case plyometric = "Plyometric"
    case bodyweight = "Bodyweight"
    case olympic = "Olympic"
}

enum WeightUnit: String, Codable, CaseIterable {
    case kg = "kg"
    case lbs = "lbs"
}

@Model
final class WorkoutSession {
    var id: UUID
    var name: String
    var date: Date
    var startTime: Date
    var endTime: Date?
    var notes: String
    var caloriesBurned: Double
    var isCompleted: Bool
    @Relationship(deleteRule: .cascade) var exercises: [WorkoutExercise]

    var duration: TimeInterval? {
        guard let end = endTime else { return nil }
        return end.timeIntervalSince(startTime)
    }

    var durationFormatted: String {
        guard let d = duration else { return "In Progress" }
        let hours = Int(d / 3600)
        let minutes = Int((d.truncatingRemainder(dividingBy: 3600)) / 60)
        if hours == 0 { return "\(minutes)m" }
        return "\(hours)h \(minutes)m"
    }

    var totalVolume: Double {
        exercises.flatMap { $0.sets }.reduce(0) { $0 + $1.volume }
    }

    var totalSets: Int {
        exercises.flatMap { $0.sets }.filter { !$0.isWarmup }.count
    }

    var personalRecordsCount: Int {
        exercises.flatMap { $0.sets }.filter { $0.isPersonalRecord }.count
    }

    init(
        name: String = "Workout",
        date: Date = Date(),
        notes: String = "",
        caloriesBurned: Double = 0
    ) {
        self.id = UUID()
        self.name = name
        self.date = date
        self.startTime = Date()
        self.endTime = nil
        self.notes = notes
        self.caloriesBurned = caloriesBurned
        self.isCompleted = false
        self.exercises = []
    }
}

@Model
final class WorkoutExercise {
    var id: UUID
    var name: String
    var muscleGroup: MuscleGroup
    var exerciseType: ExerciseType
    var notes: String
    var order: Int
    var restTimeSeconds: Int
    @Relationship(deleteRule: .cascade) var sets: [ExerciseSet]
    var session: WorkoutSession?

    var maxWeight: Double {
        sets.filter { !$0.isWarmup }.map { $0.weight }.max() ?? 0
    }

    var totalVolume: Double {
        sets.filter { !$0.isWarmup }.reduce(0) { $0 + $1.volume }
    }

    init(
        name: String,
        muscleGroup: MuscleGroup = .chest,
        exerciseType: ExerciseType = .strength,
        notes: String = "",
        order: Int = 0,
        restTimeSeconds: Int = 90
    ) {
        self.id = UUID()
        self.name = name
        self.muscleGroup = muscleGroup
        self.exerciseType = exerciseType
        self.notes = notes
        self.order = order
        self.restTimeSeconds = restTimeSeconds
        self.sets = []
    }
}

@Model
final class ExerciseSet {
    var id: UUID
    var setNumber: Int
    var reps: Int
    var weight: Double
    var weightUnit: WeightUnit
    var durationSeconds: Double
    var distanceKm: Double
    var isWarmup: Bool
    var isPersonalRecord: Bool
    var rpe: Int
    var exercise: WorkoutExercise?

    var volume: Double {
        Double(reps) * weight
    }

    var weightInKg: Double {
        weightUnit == .lbs ? weight * 0.453592 : weight
    }

    init(
        setNumber: Int = 1,
        reps: Int = 0,
        weight: Double = 0,
        weightUnit: WeightUnit = .kg,
        durationSeconds: Double = 0,
        distanceKm: Double = 0,
        isWarmup: Bool = false,
        isPersonalRecord: Bool = false,
        rpe: Int = 0
    ) {
        self.id = UUID()
        self.setNumber = setNumber
        self.reps = reps
        self.weight = weight
        self.weightUnit = weightUnit
        self.durationSeconds = durationSeconds
        self.distanceKm = distanceKm
        self.isWarmup = isWarmup
        self.isPersonalRecord = isPersonalRecord
        self.rpe = rpe
    }
}

// Preset exercises for quick selection
struct ExercisePreset: Identifiable {
    let id = UUID()
    let name: String
    let muscleGroup: MuscleGroup
    let exerciseType: ExerciseType

    static let library: [ExercisePreset] = [
        // Chest
        ExercisePreset(name: "Bench Press", muscleGroup: .chest, exerciseType: .strength),
        ExercisePreset(name: "Incline Bench Press", muscleGroup: .chest, exerciseType: .strength),
        ExercisePreset(name: "Dumbbell Flyes", muscleGroup: .chest, exerciseType: .strength),
        ExercisePreset(name: "Push Ups", muscleGroup: .chest, exerciseType: .bodyweight),
        ExercisePreset(name: "Cable Crossover", muscleGroup: .chest, exerciseType: .strength),
        ExercisePreset(name: "Chest Dips", muscleGroup: .chest, exerciseType: .bodyweight),
        // Back
        ExercisePreset(name: "Deadlift", muscleGroup: .back, exerciseType: .strength),
        ExercisePreset(name: "Pull Ups", muscleGroup: .back, exerciseType: .bodyweight),
        ExercisePreset(name: "Barbell Row", muscleGroup: .back, exerciseType: .strength),
        ExercisePreset(name: "Lat Pulldown", muscleGroup: .back, exerciseType: .strength),
        ExercisePreset(name: "Seated Cable Row", muscleGroup: .back, exerciseType: .strength),
        ExercisePreset(name: "T-Bar Row", muscleGroup: .back, exerciseType: .strength),
        // Shoulders
        ExercisePreset(name: "Overhead Press", muscleGroup: .shoulders, exerciseType: .strength),
        ExercisePreset(name: "Lateral Raises", muscleGroup: .shoulders, exerciseType: .strength),
        ExercisePreset(name: "Front Raises", muscleGroup: .shoulders, exerciseType: .strength),
        ExercisePreset(name: "Face Pulls", muscleGroup: .shoulders, exerciseType: .strength),
        // Biceps
        ExercisePreset(name: "Barbell Curl", muscleGroup: .biceps, exerciseType: .strength),
        ExercisePreset(name: "Dumbbell Curl", muscleGroup: .biceps, exerciseType: .strength),
        ExercisePreset(name: "Hammer Curl", muscleGroup: .biceps, exerciseType: .strength),
        ExercisePreset(name: "Preacher Curl", muscleGroup: .biceps, exerciseType: .strength),
        // Triceps
        ExercisePreset(name: "Tricep Pushdown", muscleGroup: .triceps, exerciseType: .strength),
        ExercisePreset(name: "Skull Crushers", muscleGroup: .triceps, exerciseType: .strength),
        ExercisePreset(name: "Close Grip Bench", muscleGroup: .triceps, exerciseType: .strength),
        ExercisePreset(name: "Overhead Tricep Extension", muscleGroup: .triceps, exerciseType: .strength),
        // Legs
        ExercisePreset(name: "Squat", muscleGroup: .quads, exerciseType: .strength),
        ExercisePreset(name: "Leg Press", muscleGroup: .quads, exerciseType: .strength),
        ExercisePreset(name: "Lunges", muscleGroup: .quads, exerciseType: .bodyweight),
        ExercisePreset(name: "Romanian Deadlift", muscleGroup: .hamstrings, exerciseType: .strength),
        ExercisePreset(name: "Leg Curl", muscleGroup: .hamstrings, exerciseType: .strength),
        ExercisePreset(name: "Hip Thrust", muscleGroup: .glutes, exerciseType: .strength),
        ExercisePreset(name: "Calf Raises", muscleGroup: .calves, exerciseType: .strength),
        // Core
        ExercisePreset(name: "Plank", muscleGroup: .core, exerciseType: .bodyweight),
        ExercisePreset(name: "Crunches", muscleGroup: .core, exerciseType: .bodyweight),
        ExercisePreset(name: "Russian Twists", muscleGroup: .core, exerciseType: .bodyweight),
        ExercisePreset(name: "Ab Wheel Rollout", muscleGroup: .core, exerciseType: .bodyweight),
        ExercisePreset(name: "Hanging Leg Raise", muscleGroup: .core, exerciseType: .bodyweight),
        // Cardio
        ExercisePreset(name: "Running", muscleGroup: .cardio, exerciseType: .cardio),
        ExercisePreset(name: "Cycling", muscleGroup: .cardio, exerciseType: .cardio),
        ExercisePreset(name: "Rowing", muscleGroup: .cardio, exerciseType: .cardio),
        ExercisePreset(name: "Jump Rope", muscleGroup: .cardio, exerciseType: .cardio),
        ExercisePreset(name: "Stair Climber", muscleGroup: .cardio, exerciseType: .cardio),
    ]
}
