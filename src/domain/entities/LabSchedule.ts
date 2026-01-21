import type { Metrics } from "./Metrics";
import type { ScheduleEntry } from "./ScheduleEntry";

export class LabSchedule {
    constructor(
        public schedule: ScheduleEntry[],
        public metrics: Metrics) { }
}
