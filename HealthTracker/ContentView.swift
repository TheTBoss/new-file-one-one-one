import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .dashboard

    enum Tab: Int, CaseIterable {
        case dashboard, nutrition, workout, habits, progress

        var title: String {
            switch self {
            case .dashboard: return "Dashboard"
            case .nutrition: return "Nutrition"
            case .workout: return "Workout"
            case .habits: return "Habits"
            case .progress: return "Progress"
            }
        }

        var icon: String {
            switch self {
            case .dashboard: return "house.fill"
            case .nutrition: return "fork.knife"
            case .workout: return "dumbbell.fill"
            case .habits: return "checkmark.circle.fill"
            case .progress: return "chart.line.uptrend.xyaxis"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tag(Tab.dashboard)
                .tabItem {
                    Label(Tab.dashboard.title, systemImage: Tab.dashboard.icon)
                }

            NutritionView()
                .tag(Tab.nutrition)
                .tabItem {
                    Label(Tab.nutrition.title, systemImage: Tab.nutrition.icon)
                }

            WorkoutView()
                .tag(Tab.workout)
                .tabItem {
                    Label(Tab.workout.title, systemImage: Tab.workout.icon)
                }

            HabitsView()
                .tag(Tab.habits)
                .tabItem {
                    Label(Tab.habits.title, systemImage: Tab.habits.icon)
                }

            ProgressView()
                .tag(Tab.progress)
                .tabItem {
                    Label(Tab.progress.title, systemImage: Tab.progress.icon)
                }
        }
        .tint(.blue)
    }
}

#Preview {
    ContentView()
}
