import { Sample, Technician, Equipment, Priority, SampleType, Speciality } from "./entities";
import { Scheduler } from "./planning";
import { inputResources as data, outputResouces } from "../test-data";

// Transformation des données d'entrée en entités
const samples: Sample[] = data.samples.map(e => new Sample(
    e.id,
    SampleType.fromString(e.type),
    Priority.fromString(e.priority),
    e.analysisTime,
    e.arrivalTime,
    e.patientId
));

const technicians: Technician[] = data.technicians.map(t => new Technician(
    t.id,
    Speciality.fromString(t.speciality),
    t.startTime,
    t.endTime
));

const equipments: Equipment[] = data.equipment.map(e => new Equipment(
    e.id,
    SampleType.fromString(e.type),
    e.available
));

// ===== UTILISATION DU NOUVEAU SCHEDULER =====

const scheduler = new Scheduler();
const result = scheduler.planify({ samples, technicians, equipments });

// ===== AFFICHAGE DES RÉSULTATS =====

console.log("=== PLANNING GÉNÉRÉ ===");
result.printScheduale();

console.log("\n=== RÉSULTAT ATTENDU ===");
console.log(outputResouces);
