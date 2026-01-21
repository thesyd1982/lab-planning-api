import { TimeManager } from "./TimeManager"
import type { Equipment } from "../entities/Equipment"
import type { Sample } from "../entities/Sample"
import type { SampleType } from "../entities/SampleType"
import type { ScheduleEntry } from "../entities/ScheduleEntry"
import type { Technician } from "../entities/Technician"

export class ResourceSelector {

    static selectTechnician(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

        const qualifiedtechs = ResourceSelector.qualifiedTechnicians(technicians, sample.sampleType)
        // trier par specialité 
        const sortedTechs = ResourceSelector.sortTechsBySpecialty(qualifiedtechs)

        if (schedule.length == 0) {
            return sortedTechs[0]
        }
        const availableTechs = ResourceSelector.techniciansAvailable(sortedTechs, schedule, sample)

        if (availableTechs.length > 0) return availableTechs[0]
        if (sortedTechs.length > 0) return sortedTechs[0]

        throw new Error("Aucun technicien disponible pour le sample " + sample.sampleType)
    }

    static qualifiedTechnicians(technicians: Technician[], sampleType: SampleType) {

        return technicians.filter(t => t.speciality.canHandle(sampleType))
    }

    static techniciansAvailable(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

        return technicians.filter(t => TimeManager.isAvailable(schedule, t, TimeManager.techniciansAvailableAt(schedule, t), sample.analysisTime))
    }

    static sortTechsBySpecialty(technicians: Technician[]) {
        return technicians.sort((a, b) => a.speciality.compareTo(b.speciality))

    }

    static selectEquipment(equipments: Equipment[], sample: Sample) {
        const availableEquipments = equipments.filter(e => e.available && ResourceSelector.isEquipmentCompatible(e, sample))
        if (availableEquipments.length > 0) return availableEquipments[0]
        const compatibles = ResourceSelector.compatibleEquipments(equipments, sample)
        if (compatibles.length > 0) return compatibles[0]
        throw new Error("Aucun appareil compatible pour le sample " + sample.sampleType)
    }

    static compatibleEquipments(equipments: Equipment[], sample: Sample) {
        return equipments.filter(e => ResourceSelector.isEquipmentCompatible(e, sample))
    }


    static isEquipmentCompatible(equipment: Equipment, sample: Sample) {
        return equipment.type.equals(sample.sampleType)
    }
}
