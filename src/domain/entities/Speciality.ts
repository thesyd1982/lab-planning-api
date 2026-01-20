import type { SampleType } from "./SampleType";

export class Speciality {
    private constructor(public readonly value: string) { }
    static readonly BLOOD = new Speciality('BLOOD');
    static readonly URINE = new Speciality('URINE');
    static readonly TISSUE = new Speciality('TISSUE');
    static readonly GENERAL = new Speciality('GENERAL');

    private static readonly values = [
        Speciality.BLOOD,
        Speciality.URINE,
        Speciality.TISSUE,
        Speciality.GENERAL
    ];

    static fromString(value: string): Speciality {
        const speciality = this.values.find(s => s.value === value);
        if (!speciality) {
            throw new Error(`Invalid speciality: ${value}`);
        }
        return speciality;
    }

    toString(): string {
        return this.value;
    }

    canHandle(sampleType: SampleType): boolean {
        return this.value === 'GENERAL' || this.value === sampleType.value;
    }

    static getAll(): Speciality[] {
        return [...this.values];
    }
}
