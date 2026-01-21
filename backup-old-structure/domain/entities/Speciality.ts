import type { SampleType } from "./SampleType";

export class Speciality {
    private constructor(public readonly value: string, public order: number) { }
    static readonly BLOOD = new Speciality('BLOOD', 0);
    static readonly URINE = new Speciality('URINE', 0);
    static readonly TISSUE = new Speciality('TISSUE', 0);
    static readonly GENERAL = new Speciality('GENERAL', 1);

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

    compareTo(other: Speciality): number {
        return this.order - other.order;
    }

    static getAll(): Speciality[] {
        return [...this.values];
    }
}
