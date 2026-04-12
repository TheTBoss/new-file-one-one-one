import Foundation
import SwiftData

@Model
final class BodyMeasurement {
    var id: UUID
    var date: Date
    var weight: Double       // kg
    var bodyFat: Double      // percentage (0-100)
    var muscleMass: Double   // kg
    var boneMass: Double     // kg
    var waterPercentage: Double // percentage
    // Circumference measurements in cm
    var chest: Double
    var waist: Double
    var hips: Double
    var neck: Double
    var bicepLeft: Double
    var bicepRight: Double
    var forearmLeft: Double
    var forearmRight: Double
    var thighLeft: Double
    var thighRight: Double
    var calfLeft: Double
    var calfRight: Double
    var shoulders: Double
    var notes: String
    var photoPath: String    // path to progress photo if any

    var bmi: Double {
        // Requires height – stored in UserProfile (UserDefaults)
        let heightCm = UserDefaults.standard.double(forKey: "userHeightCm")
        guard heightCm > 0 && weight > 0 else { return 0 }
        let heightM = heightCm / 100.0
        return weight / (heightM * heightM)
    }

    var bmiCategory: String {
        let bmiVal = bmi
        switch bmiVal {
        case ..<18.5: return "Underweight"
        case 18.5..<25: return "Normal"
        case 25..<30: return "Overweight"
        default: return "Obese"
        }
    }

    var leanMass: Double {
        weight - (weight * bodyFat / 100)
    }

    init(
        date: Date = Date(),
        weight: Double = 0,
        bodyFat: Double = 0,
        muscleMass: Double = 0,
        boneMass: Double = 0,
        waterPercentage: Double = 0,
        chest: Double = 0,
        waist: Double = 0,
        hips: Double = 0,
        neck: Double = 0,
        bicepLeft: Double = 0,
        bicepRight: Double = 0,
        forearmLeft: Double = 0,
        forearmRight: Double = 0,
        thighLeft: Double = 0,
        thighRight: Double = 0,
        calfLeft: Double = 0,
        calfRight: Double = 0,
        shoulders: Double = 0,
        notes: String = "",
        photoPath: String = ""
    ) {
        self.id = UUID()
        self.date = date
        self.weight = weight
        self.bodyFat = bodyFat
        self.muscleMass = muscleMass
        self.boneMass = boneMass
        self.waterPercentage = waterPercentage
        self.chest = chest
        self.waist = waist
        self.hips = hips
        self.neck = neck
        self.bicepLeft = bicepLeft
        self.bicepRight = bicepRight
        self.forearmLeft = forearmLeft
        self.forearmRight = forearmRight
        self.thighLeft = thighLeft
        self.thighRight = thighRight
        self.calfLeft = calfLeft
        self.calfRight = calfRight
        self.shoulders = shoulders
        self.notes = notes
        self.photoPath = photoPath
    }
}
