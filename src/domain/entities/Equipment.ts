import type { SampleType } from "./types";

export class Equipment {
    constructor(public id: string,
        public type: SampleType,
        public available: boolean) { }

} 
