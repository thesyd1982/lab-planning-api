// Main - Point d'entrée du système de planification de laboratoire
// Architecture Clean avec séparation des responsabilités

import {
    Sample, Technician, Equipment, Priority,
    SampleType, Speciality, ScheduleEntry, LabSchedule,
    Metrics, TimeCalculator, MetricsCalculator,
    ResourceManager, AvailabilityChecker
} from "./domain/entities";

import {
    inputResources as data,
    outputResouces
} from "../test-data";


// Transformation des données d'entrée en entités domain
const samples: Sample[] = data.samples.map(e => new Sample(
    e.id,
    SampleType.fromString(e.type),
    Priority.fromString(e.priority),
    e.analysisTime,
    e.arrivalTime,
    e.patientId
));

const technicians: Technician[] = data.technicians.map(t => new Technician(
    t.id,
    Speciality.fromString(t.speciality),
    t.startTime,
    t.endTime
));

const equipments: Equipment[] = data.equipment.map(e => new Equipment(
    e.id,
    SampleType.fromString(e.type),
    e.available
));

// ===== FONCTIONS UTILITAIRES =====

function sortedByPriority(samples: Sample[]): Sample[] {
    return samples.sort((a, b) => a.priority.compareTo(b.priority))
}

function sortedByArrivalTime(samples: Sample[]): Sample[] {
    return samples.sort((a, b) => TimeCalculator.convertToMinutes(a.arrivalTime) - TimeCalculator.convertToMinutes(b.arrivalTime))
}

function sortSamples(samples: Sample[]): Sample[] {
    return sortedByPriority(sortedByArrivalTime(samples))
}

// ===== ALGORITHME PRINCIPAL =====

/**
 * Crée le planning des analyses de laboratoire
 * Algorithme : tri par priorité puis allocation séquentielle avec parallélisme opportuniste
 */
function schedules(samples: Sample[], technicians: Technician[], equipments: Equipment[]): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = []
    const sortedSamples = sortSamples(samples)

    for (const sample of sortedSamples) {
        // Sélection des ressources disponibles
        const selectedTechnician = ResourceManager.selectTech(technicians, schedule, sample)
        const selectedEquipment = ResourceManager.selectEquipment(equipments, sample)

        // Calcul du créneau optimal
        const startTime = AvailabilityChecker.calculateStartTime(
            selectedTechnician,
            selectedEquipment,
            schedule,
            sample
        );
        const endTime = TimeCalculator.minutesToHours(
            TimeCalculator.convertToMinutes(startTime) + sample.analysisTime
        )

        // Création de l'entrée de planning
        const scheduleEntry = new ScheduleEntry(
            sample.id,
            selectedTechnician.id,
            selectedEquipment.id,
            startTime,
            endTime,
            sample.priority.toString()
        )

        schedule.push(scheduleEntry)
    }

    return schedule
}

/**
 * Fonction principale de planification de laboratoire
 */
function planifyLab(data: { samples: Sample[], technicians: Technician[], equipments: Equipment[] }): LabSchedule {
    const { samples, technicians, equipments } = data

    // Génération du planning
    const schedule = schedules(samples, technicians, equipments)

    // Calcul des métriques
    const metrics = new Metrics(
        MetricsCalculator.calculateTotalTime(schedule),
        MetricsCalculator.calculateEfficiency(schedule),
        MetricsCalculator.countConflicts(schedule)
    )

    return new LabSchedule(schedule, metrics)
}

// ===== EXÉCUTION ET TESTS =====

// Exécution avec données de test
const result = planifyLab({ samples, technicians, equipments })

// Affichage des résultats
console.log("=== PLANNING GÉNÉRÉ ===")
result.printScheduale()

console.log("\n=== RÉSULTAT ATTENDU ===")
console.log(outputResouces)

