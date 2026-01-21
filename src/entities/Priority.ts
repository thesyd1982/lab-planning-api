export class Priority {
    // class pour gerer les enums 
    private constructor(
        public readonly value: string,
        public readonly order: number
    ) { }

    static readonly STAT = new Priority('STAT', 1);
    static readonly URGENT = new Priority('URGENT', 2);
    static readonly ROUTINE = new Priority('ROUTINE', 3);

    private static readonly values = [
        Priority.STAT,
        Priority.URGENT,
        Priority.ROUTINE
    ];

    static fromString(value: string): Priority {
        const priority = this.values.find(p => p.value === value);
        if (!priority) {
            throw new Error(`Invalid priority: ${value}`);
        }
        return priority;
    }

    toString(): string {
        return this.value;
    }

    isHigherThan(other: Priority): boolean {
        return this.order > other.order;
    }
    static getAll(): Priority[] {
        return [...this.values];
    }

    compareTo(other: Priority): number {
        return this.order - other.order;
    }
}
