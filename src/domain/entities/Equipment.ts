import type { SampleType } from "./SampleType";

export class Equipment {
    constructor(public id: string,
        public type: SampleType,
        public available: boolean) { }

} 
