import { ScheduleEntry } from "./ScheduleEntry"
import { TimeCalculator } from "./TimeCalculator"

export class MetricsCalculator {
    constructor() { }
    static calculateTotalTime(schedule: ScheduleEntry[]): number {
        if (schedule.length === 0) return 0
        if (schedule.length === 1) return TimeCalculator.duration(schedule[0].startTime, schedule[0].endTime)

        const first = schedule[0];
        const last = schedule[schedule.length - 1];

        return TimeCalculator.convertToMinutes(last.endTime) - TimeCalculator.convertToMinutes(first.startTime)
    }

    static calculateEfficiency(schedule: ScheduleEntry[]): number {
        if (schedule.length === 0) return 0;  //  Cas vide
        if (schedule.length === 1) return 100;  //  Un seul élément = 100%

        const totalAnalysisTime = schedule.reduce((acc, e) =>
            acc + TimeCalculator.duration(e.startTime, e.endTime), 0
        );

        const totalPlanningTime = MetricsCalculator.calculateTotalTime(schedule);

        //  Protection contre division par zéro
        if (totalPlanningTime === 0) return 0;

        return (totalAnalysisTime / totalPlanningTime) * 100;
    }

    static countConflicts(schedule: ScheduleEntry[]): number { return 0 }
}
