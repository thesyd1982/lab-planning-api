import type { Priority } from "./types",

export class ScheduleEntry {
    constructor(public sampleId: string,
        public technicianId: string,
        public equipmentId: string,
        public startTime: string,
        public endTime: string,
        public priority: Priority) { }
}
