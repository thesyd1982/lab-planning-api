import type { Equipment } from "./Equipment"
import type { Sample } from "./Sample"
import type { ScheduleEntry } from "./ScheduleEntry"
import type { Technician } from "./Technician"
import { TimeCalculator } from "./TimeCalculator"

export class AvailabilityChecker {
    // Fonction pour savoir si un technicien est disponible a un temps donner et une duree 
    // selon le calendrier
    static isAvailable(schedule: ScheduleEntry[], tech: Technician, time: string, duration: number): boolean {
        const endTime = TimeCalculator.minutesToHours(TimeCalculator.convertToMinutes(time) + duration)
        // calendrier vide on verfie la plage de travail
        if (schedule.length == 0) return tech.isWorkingAt(time) && tech.isWorkingAt(endTime)
        // calendrier non vide et hors de plage de travail
        if (!tech.isWorkingAt(endTime) || !tech.isWorkingAt(time)) return false

        const nextAvailableTime = AvailabilityChecker.techniciansAvailableAt(schedule, tech)
        const isFree = (TimeCalculator.convertToMinutes(endTime) >= TimeCalculator.convertToMinutes(nextAvailableTime))
        return isFree
    }

    static techniciansAvailableAt(schedule: ScheduleEntry[], tech: Technician): string {

        const s = schedule.filter(filter => filter.technicianId == tech.id)
        if (s.length == 0) return tech.startTime
        const endtimes = s.map(e => TimeCalculator.convertToMinutes(e.endTime))
        const max = Math.max(...endtimes)
        return TimeCalculator.minutesToHours(max)
    }

    static equipmentAvailableAt(schedule: ScheduleEntry[], equipment: Equipment): string {
        // Filtrer toutes les analyses qui utilisent cet équipement
        const equipmentSchedule = schedule.filter(entry => entry.equipmentId === equipment.id);

        // Si aucune analyse programmée sur cet équipement
        if (equipmentSchedule.length === 0) {
            return "00:00"; // Disponible immédiatement (ou heure d'ouverture du lab)
        }

        // Trouver la fin de la dernière analyse sur cet équipement
        const endTimes = equipmentSchedule.map(entry => TimeCalculator.convertToMinutes(entry.endTime));
        const lastEndTime = Math.max(...endTimes);

        return TimeCalculator.minutesToHours(lastEndTime);
    }

}
