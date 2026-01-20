import { Priority } from "./Priority";
import { SampleType } from "./SampleType";


export class Sample {
    constructor(
        public id: string,
        public sampleType: SampleType,
        public priority: Priority,
        public analysisTime: number,
        public arrivalTime: string,
        public patientId: string) { }
}
