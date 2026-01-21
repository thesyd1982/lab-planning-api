export class Metrics {
    constructor(
        public totalTime: number,       // 09:30 à 10:45 = 1h15 = 75min
        public efficiency: number,     // (75min d'analyses) / (105min total)
        public conflicts: number       // 0
    ) { }

}
