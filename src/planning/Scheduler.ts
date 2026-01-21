// Scheduler - Algorithme principal de planification
import { Sample } from "../entities/Sample";
import { Technician } from "../entities/Technician";
import { Equipment } from "../entities/Equipment";
import { ScheduleEntry } from "../entities/ScheduleEntry";
import { LabSchedule } from "../entities/LabSchedule";
import { Metrics } from "../entities/Metrics";
import { ResourceSelector } from "./ResourceSelector";
import { TimeManager } from "./TimeManager";
import { MetricsCalculator } from "./MetricsCalculator";
import { TimeCalculator } from "./TimeCalculator";

export class Scheduler {

    /**
     * Fonction principale de planification
     */
    planify(data: { samples: Sample[], technicians: Technician[], equipments: Equipment[] }): LabSchedule {
        const { samples, technicians, equipments } = data;

        // Génération du planning
        const schedule = this.createSchedule(samples, technicians, equipments);

        // Calcul des métriques
        const metrics = new Metrics(
            MetricsCalculator.calculateTotalTime(schedule),
            MetricsCalculator.calculateEfficiency(schedule),
            MetricsCalculator.countConflicts(schedule)
        );

        return new LabSchedule(schedule, metrics);
    }

    /**
     * Crée le planning des analyses
     */
    private createSchedule(samples: Sample[], technicians: Technician[], equipments: Equipment[]): ScheduleEntry[] {
        const schedule: ScheduleEntry[] = [];
        const sortedSamples = this.sortSamples(samples);

        for (const sample of sortedSamples) {
            // Sélection des ressources disponibles
            const selectedTechnician = ResourceSelector.selectTechnician(technicians, schedule, sample);
            const selectedEquipment = ResourceSelector.selectEquipment(equipments, sample);

            // Calcul du créneau optimal
            const startTime = TimeManager.calculateStartTime(
                selectedTechnician,
                selectedEquipment,
                schedule,
                sample
            );
            const endTime = TimeCalculator.minutesToHours(
                TimeCalculator.convertToMinutes(startTime) + sample.analysisTime
            );

            // Création de l'entrée de planning
            const scheduleEntry = new ScheduleEntry(
                sample.id,
                selectedTechnician.id,
                selectedEquipment.id,
                startTime,
                endTime,
                sample.priority.toString()
            );

            schedule.push(scheduleEntry);
        }

        return schedule;
    }

    /**
     * Trie les échantillons par priorité puis par heure d'arrivée
     */
    private sortSamples(samples: Sample[]): Sample[] {
        const sortedByArrival = samples.sort((a, b) =>
            TimeCalculator.convertToMinutes(a.arrivalTime) - TimeCalculator.convertToMinutes(b.arrivalTime)
        );
        return sortedByArrival.sort((a, b) => a.priority.compareTo(b.priority));
    }
}
