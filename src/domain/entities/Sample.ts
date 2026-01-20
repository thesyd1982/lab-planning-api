import type { Priority, SampleType } from "./types";

export class Sample {
    constructor(
        public id: string,
        public type: SampleType,
        public priority: Priority,
        public analysisTime: number,
        public arrivalTime: string,
        public patientId: string) { }
}
