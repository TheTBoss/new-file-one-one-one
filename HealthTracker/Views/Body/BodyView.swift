import SwiftUI
import SwiftData
import Charts

struct BodyView: View {
    @Query(sort: \BodyMeasurement.date, order: .reverse) private var measurements: [BodyMeasurement]
    @Environment(\.modelContext) private var modelContext
    @Query private var goals: [DailyGoals]

    @State private var showingAddMeasurement = false
    @State private var selectedMetric = "Weight"

    let metrics = ["Weight", "Body Fat", "Muscle Mass", "Waist"]
    private var currentGoals: DailyGoals { goals.first ?? DailyGoals() }
    private var latest: BodyMeasurement? { measurements.first }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Latest stats card
                    if let m = latest {
                        LatestBodyCard(measurement: m, weightGoal: currentGoals.weightGoal)
                            .padding(.horizontal)
                    } else {
                        EmptyStateView(
                            icon: "scalemass",
                            title: "No measurements yet",
                            message: "Log your first body measurement to track your progress",
                            action: { showingAddMeasurement = true },
                            actionLabel: "Log Measurements"
                        )
                        .padding(.horizontal)
                        .cardStyle()
                    }

                    // Progress chart
                    if measurements.count >= 2 {
                        BodyProgressChart(measurements: measurements, selectedMetric: $selectedMetric, metrics: metrics)
                            .padding(.horizontal)
                    }

                    // History
                    if !measurements.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("History")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(measurements) { m in
                                MeasurementHistoryRow(measurement: m)
                                    .padding(.horizontal)
                                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                        Button(role: .destructive) {
                                            modelContext.delete(m)
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
            }
            .background(Color.appBackground)
            .navigationTitle("Body")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddMeasurement = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddMeasurement) {
                AddMeasurementView()
            }
        }
    }
}

// MARK: - Latest Body Card

struct LatestBodyCard: View {
    let measurement: BodyMeasurement
    let weightGoal: Double

    var weightDiff: Double { measurement.weight - weightGoal }
    var bmiVal: Double { measurement.bmi }

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Body Metrics")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    HStack(alignment: .lastTextBaseline, spacing: 4) {
                        Text(measurement.weight.formattedWeight)
                            .font(.system(size: 42, weight: .bold, design: .rounded))
                        Text("kg")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Text(measurement.date.relativeString)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if bmiVal > 0 {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(String(format: "%.1f", bmiVal))
                            .font(.title.bold())
                        Text("BMI · \(measurement.bmiCategory)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Divider()

            HStack {
                if measurement.bodyFat > 0 {
                    BodyStatChip(label: "Body Fat", value: "\(measurement.bodyFat.formattedWeight)%", color: .orange)
                }
                if measurement.muscleMass > 0 {
                    Spacer()
                    BodyStatChip(label: "Muscle", value: "\(measurement.muscleMass.formattedWeight) kg", color: .blue)
                }
                if measurement.waist > 0 {
                    Spacer()
                    BodyStatChip(label: "Waist", value: "\(measurement.waist.formattedWeight) cm", color: .purple)
                }
                if weightGoal > 0 {
                    Spacer()
                    BodyStatChip(
                        label: "Goal",
                        value: "\(weightDiff > 0 ? "+" : "")\(weightDiff.formattedWeight) kg",
                        color: weightDiff <= 0 ? .green : .orange
                    )
                }
            }
        }
        .cardStyle()
    }
}

struct BodyStatChip: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.subheadline.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Body Progress Chart

struct BodyProgressChart: View {
    let measurements: [BodyMeasurement]
    @Binding var selectedMetric: String
    let metrics: [String]

    var chartData: [(date: Date, value: Double)] {
        measurements
            .filter { valueFor($0) > 0 }
            .map { (date: $0.date, value: valueFor($0)) }
            .sorted { $0.date < $1.date }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Progress")
                .font(.headline)

            Picker("Metric", selection: $selectedMetric) {
                ForEach(metrics, id: \.self) { metric in
                    Text(metric).tag(metric)
                }
            }
            .pickerStyle(.segmented)

            if chartData.count >= 2 {
                Chart(chartData, id: \.date) { item in
                    LineMark(
                        x: .value("Date", item.date),
                        y: .value(selectedMetric, item.value)
                    )
                    .foregroundStyle(Color.purple)
                    .interpolationMethod(.catmullRom)

                    AreaMark(
                        x: .value("Date", item.date),
                        y: .value(selectedMetric, item.value)
                    )
                    .foregroundStyle(Color.purple.opacity(0.1))
                    .interpolationMethod(.catmullRom)

                    PointMark(
                        x: .value("Date", item.date),
                        y: .value(selectedMetric, item.value)
                    )
                    .foregroundStyle(Color.purple)
                }
                .frame(height: 160)
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day, count: max(1, chartData.count / 4))) { _ in
                        AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                    }
                }
            } else {
                Text("Log more measurements to see your trend")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            }
        }
        .cardStyle()
    }

    private func valueFor(_ m: BodyMeasurement) -> Double {
        switch selectedMetric {
        case "Weight": return m.weight
        case "Body Fat": return m.bodyFat
        case "Muscle Mass": return m.muscleMass
        case "Waist": return m.waist
        default: return 0
        }
    }
}

// MARK: - Measurement History Row

struct MeasurementHistoryRow: View {
    let measurement: BodyMeasurement

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(measurement.date.relativeString)
                    .font(.subheadline.bold())
                HStack(spacing: 12) {
                    if measurement.weight > 0 {
                        Label("\(measurement.weight.formattedWeight) kg", systemImage: "scalemass")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if measurement.bodyFat > 0 {
                        Label("\(measurement.bodyFat.formattedWeight)%", systemImage: "percent")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                    if measurement.waist > 0 {
                        Label("\(measurement.waist.formattedWeight)cm", systemImage: "ruler")
                            .font(.caption)
                            .foregroundStyle(.purple)
                    }
                }
            }
            Spacer()
            if measurement.bmi > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    Text(String(format: "%.1f", measurement.bmi))
                        .font(.subheadline.bold())
                    Text("BMI")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(12)
    }
}

#Preview {
    BodyView()
        .modelContainer(for: [BodyMeasurement.self, DailyGoals.self], inMemory: true)
}
