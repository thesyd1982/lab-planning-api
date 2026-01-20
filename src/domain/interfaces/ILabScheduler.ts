import type {
    Sample,
    LabSchedule,
    Technician,
    Equipment
} from "../entities";

export interface ILabScheduler {
    /* Interface de l'algo de planification */
    schedule(samples: Sample[], technicians: Technician[], equipments: Equipment[]): Schedule
}
