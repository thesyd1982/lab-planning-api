import { Speciality } from "./Speciality";

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
}
