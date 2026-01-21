import {
    Sample, Technician, Equipment, Priority,
    SampleType, Speciality, ScheduleEntry, LabSchedule,
    Metrics, TimeCalculator, MetricsCalculator,
    ResourceManager
} from "./domain/entities";

import {
    // inputSimple, 
    // outputSimple,
    // inputPriority,
    // outputPriority
    inputResources as data

} from "../test-data";
import { AvailabilityChecker } from "./domain/entities/AvailabilityChecker";

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




function sortSamples(samples: Sample[]) {
    return sortedByPriority(sortedByArrivalTime(samples))
}
// calcule le endTime  = startTime + analysisTime 
// defois startTime = arrivalTime sinon  startTime = schedule[i-1].endTime 
// donc il faut ajouter row by row to the schedule

// choisir tech




// fonction pour calculer la premiere heure de depart d'une analyse
//
function calculateStartTime(tech: Technician, equipment: Equipment, schedule: ScheduleEntry[], sample: Sample): string {
    const techAvailable = AvailabilityChecker.techniciansAvailableAt(schedule, tech);
    const equipAvailable = AvailabilityChecker.equipmentAvailableAt(schedule, equipment);
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

        const techniciansAvailable = ResourceManager.selectTech(technicians, schedule, sample)
        const equipmentAvailable = ResourceManager.selectEquipment(equipments, sample)

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

function planifyLab(data: { samples: Sample[], technicians: Technician[], equipments: Equipment[] }) {
    const { samples, technicians, equipments } = data
    const schedule = schedules(samples, technicians, equipments)
    const metrics = new Metrics(MetricsCalculator.calculateTotalTime(schedule),
        MetricsCalculator.calculateEffeciency(schedule),
        MetricsCalculator.countConflicts(schedule))

    return new LabSchedule(schedule, metrics)
}

//console.log(convertToMinutes("12:00"))
//console.log(duration("12:00", "12:30"))

//console.log(sortedByArrivalTime(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))
//console.log(sortedByPriority(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))

//console.log(".".repeat(15))
//console.log({ schedule })
planifyLab({ samples, technicians, equipments }).printScheduale()
// console.log(schedules(samples, technicians, equipments).
//     map(e => ({ startTime: e.startTime, endTime: e.endTime, priority: e.priority })))
//console.log("isAvailable", isAvailable(schedule, technicians[0], "16:59", 1))
console.log(ResourceManager.sortTechsBySpecialty(technicians))
//console.log(schedule)

