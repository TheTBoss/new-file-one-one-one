import SwiftUI

struct MacroRingView: View {
    let consumed: Double
    let goal: Double
    let label: String
    let color: Color
    let unit: String

    var progress: Double {
        goal > 0 ? min(consumed / goal, 1.0) : 0
    }

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                ProgressRingView(value: progress, lineWidth: 6, color: color)
                    .frame(width: 56, height: 56)
                VStack(spacing: 0) {
                    Text("\(Int(consumed))")
                        .font(.system(size: 14, weight: .bold))
                    Text(unit)
                        .font(.system(size: 9))
                        .foregroundStyle(.secondary)
                }
            }
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("/ \(Int(goal))\(unit)")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
    }
}

struct MacroSummaryRow: View {
    let protein: Double
    let carbs: Double
    let fat: Double
    let proteinGoal: Double
    let carbGoal: Double
    let fatGoal: Double

    var body: some View {
        HStack {
            MacroRingView(consumed: protein, goal: proteinGoal, label: "Protein", color: .blue, unit: "g")
            Spacer()
            Divider().frame(height: 60)
            Spacer()
            MacroRingView(consumed: carbs, goal: carbGoal, label: "Carbs", color: .orange, unit: "g")
            Spacer()
            Divider().frame(height: 60)
            Spacer()
            MacroRingView(consumed: fat, goal: fatGoal, label: "Fat", color: .yellow, unit: "g")
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    MacroSummaryRow(protein: 120, carbs: 180, fat: 55, proteinGoal: 150, carbGoal: 250, fatGoal: 65)
        .padding()
}
