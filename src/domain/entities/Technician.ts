import type { Speciality } from "./types";

export class Technician {
    constructor(
        public id: string,
        public name: string,
        public speciality: Speciality,
        public startTime: string,
        public endTime: string) { }
}
