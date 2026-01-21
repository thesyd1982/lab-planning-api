import type { Equipment } from "../entities/Equipment"
import type { Sample } from "../entities/Sample"
import type { ScheduleEntry } from "../entities/ScheduleEntry"
import type { Technician } from "../entities/Technician"
import { TimeCalculator } from "./TimeCalculator"

export class TimeManager {
    // Fonction pour savoir si un technicien est disponible a un temps donné et une duree 
    // selon le calendrier
    static isAvailable(schedule: ScheduleEntry[], tech: Technician, time: string, duration: number): boolean {
        const endTime = TimeCalculator.minutesToHours(TimeCalculator.convertToMinutes(time) + duration)
        // calendrier vide on verfie la plage de travail
        if (schedule.length == 0) return tech.isWorkingAt(time) && tech.isWorkingAt(endTime)
        // calendrier non vide et hors de plage de travail
        if (!tech.isWorkingAt(endTime) || !tech.isWorkingAt(time)) return false

        const nextAvailableTime = TimeManager.techniciansAvailableAt(schedule, tech)
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

    static calculateStartTime(tech: Technician, equipment: Equipment, schedule: ScheduleEntry[], sample: Sample): string {
        const techAvailable = TimeManager.techniciansAvailableAt(schedule, tech);
        const equipAvailable = TimeManager.equipmentAvailableAt(schedule, equipment);
        const sampleArrival = sample.arrivalTime;

        const maxAvailability = Math.max(
            TimeCalculator.convertToMinutes(techAvailable),
            TimeCalculator.convertToMinutes(equipAvailable),
            TimeCalculator.convertToMinutes(sampleArrival)
        );

        return TimeCalculator.minutesToHours(maxAvailability);
    }
}
