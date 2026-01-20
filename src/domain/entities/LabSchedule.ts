import type { Metrics } from "./Metrics";
import type { ScheduleEntry } from "./ScheduleEntry";

export class LabSchedule {
    constructor(
        public entries: ScheduleEntry[],
        public metrics: Metrics) { }
}
