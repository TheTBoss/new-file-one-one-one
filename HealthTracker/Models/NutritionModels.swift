import Foundation
import SwiftData

enum MealType: String, Codable, CaseIterable {
    case breakfast = "Breakfast"
    case lunch = "Lunch"
    case dinner = "Dinner"
    case snack = "Snack"
    case preworkout = "Pre-Workout"
    case postworkout = "Post-Workout"

    var icon: String {
        switch self {
        case .breakfast: return "sunrise.fill"
        case .lunch: return "sun.max.fill"
        case .dinner: return "moon.fill"
        case .snack: return "star.fill"
        case .preworkout: return "bolt.fill"
        case .postworkout: return "checkmark.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .breakfast: return "orange"
        case .lunch: return "yellow"
        case .dinner: return "indigo"
        case .snack: return "green"
        case .preworkout: return "red"
        case .postworkout: return "blue"
        }
    }
}

@Model
final class FoodEntry {
    var id: UUID
    var name: String
    var brand: String
    var calories: Double
    var protein: Double
    var carbohydrates: Double
    var fat: Double
    var fiber: Double
    var sugar: Double
    var sodium: Double
    var saturatedFat: Double
    var servingSize: Double
    var servingUnit: String
    var mealType: MealType
    var date: Date
    var notes: String

    init(
        name: String,
        brand: String = "",
        calories: Double,
        protein: Double = 0,
        carbohydrates: Double = 0,
        fat: Double = 0,
        fiber: Double = 0,
        sugar: Double = 0,
        sodium: Double = 0,
        saturatedFat: Double = 0,
        servingSize: Double = 1,
        servingUnit: String = "serving",
        mealType: MealType = .snack,
        date: Date = Date(),
        notes: String = ""
    ) {
        self.id = UUID()
        self.name = name
        self.brand = brand
        self.calories = calories
        self.protein = protein
        self.carbohydrates = carbohydrates
        self.fat = fat
        self.fiber = fiber
        self.sugar = sugar
        self.sodium = sodium
        self.saturatedFat = saturatedFat
        self.servingSize = servingSize
        self.servingUnit = servingUnit
        self.mealType = mealType
        self.date = date
        self.notes = notes
    }
}

// Common food presets for quick logging
struct FoodPreset: Identifiable {
    let id = UUID()
    let name: String
    let brand: String
    let calories: Double
    let protein: Double
    let carbohydrates: Double
    let fat: Double
    let servingSize: Double
    let servingUnit: String

    static let common: [FoodPreset] = [
        FoodPreset(name: "Chicken Breast", brand: "", calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, servingSize: 100, servingUnit: "g"),
        FoodPreset(name: "Brown Rice", brand: "", calories: 216, protein: 5, carbohydrates: 45, fat: 1.8, servingSize: 195, servingUnit: "g cooked"),
        FoodPreset(name: "Oats", brand: "", calories: 307, protein: 11, carbohydrates: 55, fat: 5.3, servingSize: 81, servingUnit: "g dry"),
        FoodPreset(name: "Whole Eggs", brand: "", calories: 72, protein: 6, carbohydrates: 0.4, fat: 5, servingSize: 1, servingUnit: "large"),
        FoodPreset(name: "Greek Yogurt", brand: "", calories: 100, protein: 17, carbohydrates: 6, fat: 0.7, servingSize: 170, servingUnit: "g"),
        FoodPreset(name: "Broccoli", brand: "", calories: 55, protein: 3.7, carbohydrates: 11, fat: 0.6, servingSize: 148, servingUnit: "g"),
        FoodPreset(name: "Sweet Potato", brand: "", calories: 103, protein: 2.3, carbohydrates: 24, fat: 0.1, servingSize: 130, servingUnit: "g"),
        FoodPreset(name: "Salmon", brand: "", calories: 208, protein: 20, carbohydrates: 0, fat: 13, servingSize: 100, servingUnit: "g"),
        FoodPreset(name: "Banana", brand: "", calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, servingSize: 118, servingUnit: "g"),
        FoodPreset(name: "Almonds", brand: "", calories: 164, protein: 6, carbohydrates: 6, fat: 14, servingSize: 28, servingUnit: "g"),
        FoodPreset(name: "Whey Protein", brand: "", calories: 120, protein: 25, carbohydrates: 3, fat: 1.5, servingSize: 30, servingUnit: "g scoop"),
        FoodPreset(name: "Whole Milk", brand: "", calories: 149, protein: 8, carbohydrates: 12, fat: 8, servingSize: 244, servingUnit: "ml"),
    ]
}
