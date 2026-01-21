import { ScheduleEntry } from "./ScheduleEntry"
import { TimeCalculator } from "./TimeCalculator"

export class MetricsCalculator {
    constructor() { }
    static calculateTotalTime(schedule: ScheduleEntry[]): number {
        if (schedule.length == 0) return 0
        if (schedule.length == 1) return TimeCalculator.duration(schedule[0].startTime, schedule[0].endTime)
        const [first, , last] = schedule
        return TimeCalculator.convertToMinutes(last.endTime) - TimeCalculator.convertToMinutes(first.startTime)
    }

    static calculateEffeciency(schedule: ScheduleEntry[]): number {
        // % = (somme durées analyses) / (temps total planning) * 100
        if (schedule.length < 2) return 100
        const totoalAnalysisTime = schedule.reduce((acc, e) => acc + TimeCalculator.duration(e.startTime, e.endTime), 0)
        return (totoalAnalysisTime / MetricsCalculator.calculateTotalTime(schedule)) * 100
    }

    static countConflicts(schedule: ScheduleEntry[]): number { return 0 }
}
