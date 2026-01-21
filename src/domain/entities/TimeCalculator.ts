export class TimeCalculator {
    constructor() { }

    static minutesToHours(time: number): string {
        const hours = Math.floor(time / 60)
        const minutes = time % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    static convertToMinutes(time: string): number {
        let result = -1
        try {
            const [hour, minutes] = time.split(':')
            const h = parseInt(hour)
            const m = parseInt(minutes)
            result = h * 60 + m
        }
        catch (err) {
            console.log("time is not in the correct format")
        }
        return result
    }
    static duration(start: string, end: string): number {
        return (TimeCalculator.convertToMinutes(end)) - (TimeCalculator.convertToMinutes(start))
    }

    static add(start: string, duration: number): number {

        return TimeCalculator.convertToMinutes(start) + duration
    }
}
