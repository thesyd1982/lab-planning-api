import { Speciality } from "./Speciality";
import { TimeCalculator } from "./TimeCalculator";

export class Technician {
    id: string;
    speciality: Speciality;
    startTime: string;
    endTime: string;
    name?: string;

    constructor(
        id: string,
        speciality: Speciality,
        startTime: string,
        endTime: string,
        name?: string) {

        this.id = id;
        this.speciality = speciality;
        this.startTime = startTime;
        this.endTime = endTime;
        this.name = name

    }

    isWorkingAt = (time: string) => {
        return TimeCalculator.convertToMinutes(this.startTime) <= TimeCalculator.convertToMinutes(time) && TimeCalculator.convertToMinutes(this.endTime) >= TimeCalculator.convertToMinutes(time)
    }

}
