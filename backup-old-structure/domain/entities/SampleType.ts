export class SampleType {
    private constructor(public readonly value: string) { }

    static readonly BLOOD = new SampleType('BLOOD');
    static readonly URINE = new SampleType('URINE');
    static readonly TISSUE = new SampleType('TISSUE');

    private static readonly values = [
        SampleType.BLOOD,
        SampleType.URINE,
        SampleType.TISSUE
    ];

    static fromString(value: string): SampleType {
        const type = this.values.find(t => t.value === value);
        if (!type) {
            throw new Error(`Invalid sample type: ${value}`);
        }
        return type;
    }

    toString(): string {
        return this.value;
    }

    equals(other: SampleType): boolean {
        return this.value === other.value;
    }

    static getAll(): SampleType[] {
        return [...this.values];
    }
}
