import { AvailabilityChecker } from "./AvailabilityChecker"
import type { Equipment } from "./Equipment"
import type { Sample } from "./Sample"
import type { SampleType } from "./SampleType"
import type { ScheduleEntry } from "./ScheduleEntry"
import type { Technician } from "./Technician"

export class ResourceManager {

    static selectTech(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

        const qualifiedtechs = ResourceManager.qualifiedTechnicians(technicians, sample.sampleType)
        // trier par specialité 
        const sortedTechs = ResourceManager.sortTechsBySpecialty(qualifiedtechs)

        if (schedule.length == 0) {
            return sortedTechs[0]
        }
        const availableTechs = ResourceManager.techniciansAvailable(sortedTechs, schedule, sample)

        if (availableTechs.length > 0) return availableTechs[0]
        if (sortedTechs.length > 0) return sortedTechs[0]

        throw new Error("Aucun technicien disponible pour le sample " + sample.sampleType)
    }

    static qualifiedTechnicians(technicians: Technician[], sampleType: SampleType) {

        return technicians.filter(t => t.speciality.canHandle(sampleType))
    }

    static techniciansAvailable(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

        return technicians.filter(t => AvailabilityChecker.isTechAvailable(schedule, t, AvailabilityChecker.techniciansAvailableAt(schedule, t), sample.analysisTime))
    }

    static sortTechsBySpecialty(technicians: Technician[]) {
        return technicians.sort((a, b) => a.speciality.compareTo(b.speciality))

    }

    static selectEquipment(equipments: Equipment[], sample: Sample) {
        const availableEquipments = equipments.filter(e => e.available && ResourceManager.isEquipmentCompatible(e, sample))
        if (availableEquipments.length > 0) return availableEquipments[0]
        const compatibles = ResourceManager.compatibleEquipments(equipments, sample)
        if (compatibles.length > 0) return compatibles[0]
        throw new Error("Aucun appareil compatible pour le sample " + sample.sampleType)
    }

    static compatibleEquipments(equipments: Equipment[], sample: Sample) {
        return equipments.filter(e => ResourceManager.isEquipmentCompatible(e, sample))
    }


    static isEquipmentCompatible(equipment: Equipment, sample: Sample) {
        return equipment.type.equals(sample.sampleType)
    }
}
