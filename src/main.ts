import { Sample, Technician, Equipment, Priority, SampleType, Speciality, ScheduleEntry, LabSchedule, Metrics, TimeCalculator } from "./domain/entities";

import {
    // inputSimple, 
    // outputSimple,
    // inputPriority,
    // outputPriority
    inputResources as data

} from "../test-data";

//console.log(inputSimple);
//console.log(outputSimple);


const samples: Sample[] = data.samples.map(e => {

    return new Sample(
        e.id,
        SampleType.fromString(e.type),
        Priority.fromString(e.priority), // a revoir
        e.analysisTime,
        e.arrivalTime,
        e.patientId
    )
}
);



const technicians: Technician[] = data.technicians.map((t) => {
    return new Technician(t.id, Speciality.fromString(t.speciality), t.startTime, t.endTime)
}
);



const equipments = data.equipment.map((e) => {
    return new Equipment(
        e.id,
        SampleType.fromString(e.type),
        e.available
    )
})

function sortedByPriority(samples: Sample[]) {
    return samples.sort((a, b) => a.priority.compareTo(b.priority))
}


function sortedByArrivalTime(samples: Sample[]) {
    return samples.sort((a, b) => TimeCalculator.convertToMinutes(a.arrivalTime) - TimeCalculator.convertToMinutes(b.arrivalTime))
}



function qualifiedTechnicians(technicians: Technician[], sampleType: SampleType) {

    return technicians.filter(t => t.speciality.canHandle(sampleType))
}

function techniciansAvailable(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

    return technicians.filter(t => isAvailable(schedule, t, techniciansAvailableAt(schedule, t), sample.analysisTime))
}


function sortSamples(samples: Sample[]) {
    return sortedByPriority(sortedByArrivalTime(samples))
}
// calcule le endTime  = startTime + analysisTime 
// defois startTime = arrivalTime sinon  startTime = schedule[i-1].endTime 
// donc il faut ajouter row by row to the schedule
function sortTechsBySpecialty(technicians: Technician[]) {
    return technicians.sort((a, b) => a.speciality.compareTo(b.speciality))

}

// choisir tech
function selectTech(technicians: Technician[], schedule: ScheduleEntry[], sample: Sample) {

    const qualifiedtechs = qualifiedTechnicians(technicians, sample.sampleType)
    // trier par specialité 
    const sortedTechs = sortTechsBySpecialty(qualifiedtechs)

    if (schedule.length == 0) {
        return sortedTechs[0]
    }
    const availableTechs = techniciansAvailable(sortedTechs, schedule, sample)

    if (availableTechs.length > 0) return availableTechs[0]
    if (sortedTechs.length > 0) return sortedTechs[0]

    throw new Error("Aucun technicien disponible pour le sample " + sample.sampleType)
}

function compatible(equipment: Equipment, sample: Sample) {
    return equipment.type.equals(sample.sampleType)
}
// choisir equipment
function selectEquipment(equipments: Equipment[], sample: Sample) {
    const availableEquipments = equipments.filter(e => e.available && compatible(e, sample))
    if (availableEquipments.length > 0) return availableEquipments[0]
    const compatibles = equipments.filter(e => compatible(e, sample))
    if (compatibles.length > 0) return compatibles[0]
    throw new Error("Aucun appareil compatible pour le sample " + sample.sampleType)
}

function equipmentAvailableAt(schedule: ScheduleEntry[], equipment: Equipment): string {
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

// fonction qui donne l'heur a la quelle un tech devient dispo
function techniciansAvailableAt(schedule: ScheduleEntry[], tech: Technician): string {

    const s = schedule.filter(filter => filter.technicianId == tech.id)
    if (s.length == 0) return tech.startTime
    const endtimes = s.map(e => TimeCalculator.convertToMinutes(e.endTime))
    const max = Math.max(...endtimes)
    return TimeCalculator.minutesToHours(max)
}

// Fonction pour savoir si un technicien est disponible a un temps donner et une duree 
// selon le calendrier
function isAvailable(schedule: ScheduleEntry[], tech: Technician, time: string, duration: number): boolean {
    const endTime = TimeCalculator.minutesToHours(TimeCalculator.convertToMinutes(time) + duration)
    // calendrier vide on verfie la plage de travail
    if (schedule.length == 0) return tech.isWorkingAt(time) && tech.isWorkingAt(endTime)
    // calendrier non vide et hors de plage de travail
    if (!tech.isWorkingAt(endTime) || !tech.isWorkingAt(time)) return false

    const nextAvailableTime = techniciansAvailableAt(schedule, tech)
    const isFree = (TimeCalculator.convertToMinutes(endTime) >= TimeCalculator.convertToMinutes(nextAvailableTime))
    return isFree
}
// fonction pour calculer la premiere heure de depart d'une analyse
//
function calculateStartTime(tech: Technician, equipment: Equipment, schedule: ScheduleEntry[], sample: Sample): string {
    const techAvailable = techniciansAvailableAt(schedule, tech);
    const equipAvailable = equipmentAvailableAt(schedule, equipment);
    const sampleArrival = sample.arrivalTime;

    const maxAvailability = Math.max(
        TimeCalculator.convertToMinutes(techAvailable),
        TimeCalculator.convertToMinutes(equipAvailable),
        TimeCalculator.convertToMinutes(sampleArrival)
    );

    return TimeCalculator.minutesToHours(maxAvailability);
}

function schedules(samples: Sample[], technicians: Technician[], equipments: Equipment[]): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = []
    const ss = sortSamples(samples)



    let i = 0;
    for (let sample of ss) {

        const techniciansAvailable = selectTech(technicians, schedule, sample)
        const equipmentAvailable = selectEquipment(equipments, sample)

        const technicianId = techniciansAvailable.id;
        const equipmentId = equipmentAvailable.id;

        const previous = (i > 0) ? schedule[i - 1] : null

        const priority = sample.priority.toString();

        const startTime = previous ? previous.endTime : sample.arrivalTime

        const endTime = TimeCalculator.minutesToHours(TimeCalculator.convertToMinutes(startTime) + sample.analysisTime)

        const se: ScheduleEntry = new ScheduleEntry(sample.id,
            technicianId,
            equipmentId,
            startTime,
            endTime,
            priority)

        schedule.push(se)
        i++
    }
    return schedule
}
// Metrics

function calculateTotalTime(schedule: ScheduleEntry[]): number {
    if (schedule.length == 0) return 0
    if (schedule.length == 1) return TimeCalculator.duration(schedule[0].startTime, schedule[0].endTime)
    const [first, , last] = schedule
    return TimeCalculator.convertToMinutes(last.endTime) - TimeCalculator.convertToMinutes(first.startTime)
}

function calculateEffeciency(schedule: ScheduleEntry[]): number {
    // % = (somme durées analyses) / (temps total planning) * 100
    if (schedule.length < 2) return 100
    const totoalAnalysisTime = schedule.reduce((acc, e) => acc + TimeCalculator.duration(e.startTime, e.endTime), 0)
    return (totoalAnalysisTime / calculateTotalTime(schedule)) * 100
}


function countConflicts(schedule: ScheduleEntry[]): number { return 0 }

function planifyLab(data: { samples: Sample[], technicians: Technician[], equipments: Equipment[] }) {
    const { samples, technicians, equipments } = data
    const schedule = schedules(samples, technicians, equipments)
    const metrics = new Metrics(calculateTotalTime(schedule), calculateEffeciency(schedule), countConflicts(schedule))
    return new LabSchedule(schedule, metrics)
}

//console.log(convertToMinutes("12:00"))
//console.log(duration("12:00", "12:30"))

//console.log(sortedByArrivalTime(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))
//console.log(sortedByPriority(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))

//console.log(".".repeat(15))
//console.log({ schedule })
const { schedule, _ } = planifyLab({ samples, technicians, equipments })
// console.log(schedules(samples, technicians, equipments).
//     map(e => ({ startTime: e.startTime, endTime: e.endTime, priority: e.priority })))
//console.log("isAvailable", isAvailable(schedule, technicians[0], "16:59", 1))
console.log(sortTechsBySpecialty(technicians))
//console.log(schedule)

