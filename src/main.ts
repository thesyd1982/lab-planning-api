import { Sample, Technician, Equipment, Priority } from "./domain/entities";

import {
    // inputSimple, 
    // outputSimple,
    inputPriority,
    outputPriority
} from "../test-data";

//console.log(inputSimple);
//console.log(outputSimple);

const { samples, technicians, equipment } = inputPriority;


function sortByPriority(samples: Sample[]) {
    return samples.sort((a, b) => a.priority - b.priority);
}


function techniciansCompatible(technicians: any[], sample: any) {
    return technicians.filter(t => t.speciality === sample.type)
}

function techniciansAvailable(technicians: any[], sample: any) {

    return technicians.filter(t => t.available)
}

const result = samples(sample => {

    const techs = techniciansCompatible(technicians, sample)



    // return ({
    //     sampleId: s.id,
    //     technicianId: s.id,
    //     equipmentId: s.id,
    //     startTime: s.id,
    //     endTime: s.id, priority: s.id
    // })
})

