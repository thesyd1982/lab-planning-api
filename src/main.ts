import { Sample, Technician, Equipment, Priority, SampleType, Speciality, ScheduleEntry, LabSchedule, Metrics } from "./domain/entities";

import {
    // inputSimple, 
    // outputSimple,
    // inputPriority,
    // outputPriority
    inputResources as data

} from "../test-data";
import { start } from "node:repl";

//console.log(inputSimple);
//console.log(outputSimple);

const scheduler: LabSchedule = new LabSchedule([], new Metrics(0, 0, 0))



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
    return samples.sort((a, b) => convetToMinutes(a.arrivalTime) - convetToMinutes(b.arrivalTime))
}



function qualifiedTechnicians(technicians: Technician[], sampleType: SampleType) {

    return technicians.filter(t => t.speciality.canHandle(sampleType))
}

function techniciansAvailable(technicians: any[], sample: any) {

    return technicians.filter(t => t.available)
}




function convetToMinutes(time: string) {
    let result = -1
    try {
        const [hour, minutes] = time.split(':')
        const h = parseInt(hour)
        const m = parseInt(minutes)
        result = h * 60 + m
    }

    catch (err) {
        console.log("time is not in the correct format")
    }

    return result

}
function minutesToHours(time: number) {
    const hours = Math.floor(time / 60)
    const minutes = time % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}



function duration(start: string, end: string) {
    const startTime = convetToMinutes(start)
    if (startTime == -1) return -1

    const endTime = convetToMinutes(end)
    if (endTime == -1) return -1

    return endTime - startTime
}

// sort by priority
// sort by arrivals time
// calcules la startTime et endTime
// push dans le schedule


// calcule le endTime  = startTime + analysisTime 
// defois startTime = arrivalTime sinon  startTime = schedule[i-1].endTime 
// donc il faut ajouter row by row to the schedule

const result = sortedByPriority(samples).map(s => {

    const techs = qualifiedTechnicians(technicians, s.sampleType)
    const t = techs[0]

    return (
        {
            sampleId: s.id,
            technicianId: t.id,
            equipmentId: s.id,
            startTime: s.arrivalTime,//heur de commencement
            endTime: s.id,
            priority: s.priority.value
        }
    )
})


function sortSamples(samples: Sample[]) {
    return sortedByPriority(sortedByArrivalTime(samples))
}
// calcule le endTime  = startTime + analysisTime 
// defois startTime = arrivalTime sinon  startTime = schedule[i-1].endTime 
// donc il faut ajouter row by row to the schedule


// choisir tech
function selectTech(technicians: Technician[], sample: Sample) {
    const qualifiedtechs = qualifiedTechnicians(technicians, sample.sampleType)
    return qualifiedtechs[0]
}
function compatible(equipment: Equipment, sample: Sample) {
    return equipment.type.equals(sample.sampleType)
}
// choisir equipment
function selectEquipment(equipments: Equipment[], sample: Sample) {
    const availableEquipments = equipments.filter(e => e.available && compatible(e, sample))
    return availableEquipments[0]
}


function schedules(samples: Sample[], technicians: Technician[], equipments: Equipment[]): ScheduleEntry[] {
    const schedule: ScheduleEntry[] = []
    const ss = sortSamples(samples)


    let i = 0;
    for (let sample of ss) {

        const technicianId = selectTech(technicians, sample).id;
        const equipmentId = selectEquipment(equipments, sample).id;


        const previous = (i > 0) ? schedule[i - 1] : null

        const priority = sample.priority.toString();

        const startTime = previous ? previous.endTime : sample.arrivalTime
        const endTime = minutesToHours(convetToMinutes(startTime) + sample.analysisTime)

        const se: ScheduleEntry = new ScheduleEntry(sample.id,
            technicianId,
            equipmentId,
            startTime,
            endTime,
            priority)

        console.log(previous?.startTime, previous?.endTime, se.startTime, se.endTime)
        schedule.push(se)
        i++
    }
    return schedule
}


//console.log(convetToMinutes("12:00"))
//console.log(duration("12:00", "12:30"))

//console.log(sortedByArrivalTime(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))
//console.log(sortedByPriority(samples).map(e => ({ id: e.id, arrivalTime: e.arrivalTime, priority: e.priority.value })))

//console.log(".".repeat(15))
//console.log({ schedule })

console.log(schedules(samples, technicians, equipments).
    map(e => ({ startTime: e.startTime, endTime: e.endTime, priority: e.priority })))

