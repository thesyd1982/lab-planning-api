import { Sample, Technician, Equipment, Priority, SampleType, Speciality } from "./domain/entities";

import {
    // inputSimple, 
    // outputSimple,
    inputPriority,
    outputPriority
} from "../test-data";

//console.log(inputSimple);
//console.log(outputSimple);


const samples: Sample[] = inputPriority.samples.map(e => {

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



const technicians: Technician[] = inputPriority.technicians.map((t) => {
    return new Technician(t.id, Speciality.fromString(t.speciality), t.startTime, t.endTime)
}
);



const equipments = inputPriority.equipment.map((e) => {
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
// calcule le endTime  = startTime + analysisTime 
// defois startTime = arrivalTime sinon  startTime = schedule[i-1].endTime 
// donc il faut ajouter row by row to the schedule

function minutesToHours(time: number) { }




function duration(start: string, end: string) {
    const startTime = convetToMinutes(start)
    if (startTime == -1) return -1

    const endTime = convetToMinutes(end)
    if (endTime == -1) return -1

    return endTime - startTime
}

// sort by arrivals time
// sort by priority
// calcules la startTime et endTime
// push dans le schedule


const schedule = sortedByPriority(samples).map(s => {

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




//console.log(convetToMinutes("12:00"))
//console.log(duration("12:00", "12:30"))

console.log(sortedByArrivalTime(samples))
console.log(sortedByPriority(samples))
//console.log({ schedule })
