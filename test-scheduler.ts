// Tests pour le système de planification de laboratoire
// Version avec nouvelle structure simple

import {
    Sample, Technician, Equipment, Priority,
    SampleType, Speciality, ScheduleEntry, LabSchedule,
    Metrics
} from "./src/entities";

import {
    Scheduler, TimeCalculator
} from "./src/planning";

// ===== DONNÉES DE TEST =====

const createTestSample = (id: string, priority: string, type: string, analysisTime: number, arrivalTime: string): Sample => {
    return new Sample(
        id,
        SampleType.fromString(type),
        Priority.fromString(priority),
        analysisTime,
        arrivalTime,
        `P${id}`
    );
};

const createTestTechnician = (id: string, speciality: string, startTime: string = "08:00", endTime: string = "17:00"): Technician => {
    return new Technician(id, Speciality.fromString(speciality), startTime, endTime);
};

const createTestEquipment = (id: string, type: string, available: boolean = true): Equipment => {
    return new Equipment(id, SampleType.fromString(type), available);
};

// ===== FONCTION PRINCIPALE =====

function planifyLab(data: { samples: Sample[], technicians: Technician[], equipments: Equipment[] }): LabSchedule {
    const scheduler = new Scheduler();
    return scheduler.planify(data);
}

// ===== TESTS =====

function test_basic_scheduling() {
    console.log("🧪 TEST 1: Basic Scheduling");
    
    // Données de test simples
    const samples = [
        createTestSample("S001", "URGENT", "BLOOD", 30, "09:00")
    ];
    
    const technicians = [
        createTestTechnician("T001", "BLOOD")
    ];
    
    const equipments = [
        createTestEquipment("E001", "BLOOD")
    ];
    
    // Exécution
    const result = planifyLab({ samples, technicians, equipments });
    
    // Vérifications
    const schedule = result.schedule;
    
    console.assert(schedule.length === 1, "❌ Doit avoir 1 entrée dans le planning");
    console.assert(schedule[0].sampleId === "S001", "❌ Sample ID incorrect");
    console.assert(schedule[0].technicianId === "T001", "❌ Technician ID incorrect");
    console.assert(schedule[0].equipmentId === "E001", "❌ Equipment ID incorrect");
    console.assert(schedule[0].startTime === "09:00", "❌ Start time incorrect");
    console.assert(schedule[0].endTime === "09:30", "❌ End time incorrect");
    
    console.log("✅ Test basic scheduling réussi");
    return true;
}

function test_priority_respect() {
    console.log("🧪 TEST 2: Priority Respect");
    
    // STAT doit passer avant URGENT même s'il arrive après
    const samples = [
        createTestSample("S001", "URGENT", "BLOOD", 45, "09:00"),
        createTestSample("S002", "STAT", "BLOOD", 30, "09:30")
    ];
    
    const technicians = [
        createTestTechnician("T001", "BLOOD")
    ];
    
    const equipments = [
        createTestEquipment("E001", "BLOOD")
    ];
    
    // Exécution
    const result = planifyLab({ samples, technicians, equipments });
    const schedule = result.schedule;
    
    // Vérifications
    console.assert(schedule.length === 2, "❌ Doit avoir 2 entrées dans le planning");
    console.assert(schedule[0].sampleId === "S002", "❌ STAT doit être en premier");
    console.assert(schedule[0].priority === "STAT", "❌ Première priorité doit être STAT");
    console.assert(schedule[1].sampleId === "S001", "❌ URGENT doit être en second");
    console.assert(schedule[1].priority === "URGENT", "❌ Seconde priorité doit être URGENT");
    
    console.log("✅ Test priority respect réussi");
    return true;
}

function test_specialization_matching() {
    console.log("🧪 TEST 3: Specialization Matching");
    
    // Échantillon BLOOD doit être assigné au technicien BLOOD, pas URINE
    const samples = [
        createTestSample("S001", "URGENT", "BLOOD", 30, "09:00"),
        createTestSample("S002", "URGENT", "URINE", 25, "09:15")
    ];
    
    const technicians = [
        createTestTechnician("T001", "BLOOD"),
        createTestTechnician("T002", "URINE")
    ];
    
    const equipments = [
        createTestEquipment("E001", "BLOOD"),
        createTestEquipment("E002", "URINE")
    ];
    
    // Exécution
    const result = planifyLab({ samples, technicians, equipments });
    const schedule = result.schedule;
    
    // Vérifications
    console.assert(schedule.length === 2, "❌ Doit avoir 2 entrées dans le planning");
    
    // S001 (BLOOD) doit être assigné à T001 (BLOOD) et E001 (BLOOD)
    const bloodEntry = schedule.find(e => e.sampleId === "S001");
    console.assert(bloodEntry?.technicianId === "T001", "❌ Échantillon BLOOD doit être assigné au technicien BLOOD");
    console.assert(bloodEntry?.equipmentId === "E001", "❌ Échantillon BLOOD doit être assigné à l'équipement BLOOD");
    
    // S002 (URINE) doit être assigné à T002 (URINE) et E002 (URINE)
    const urineEntry = schedule.find(e => e.sampleId === "S002");
    console.assert(urineEntry?.technicianId === "T002", "❌ Échantillon URINE doit être assigné au technicien URINE");
    console.assert(urineEntry?.equipmentId === "E002", "❌ Échantillon URINE doit être assigné à l'équipement URINE");
    
    console.log("✅ Test specialization matching réussi");
    return true;
}

function test_parallel_execution() {
    console.log("🧪 TEST 4: Parallel Execution");
    
    // Deux échantillons différents peuvent être traités en parallèle
    const samples = [
        createTestSample("S001", "URGENT", "BLOOD", 60, "09:00"),
        createTestSample("S002", "URGENT", "URINE", 30, "09:15")
    ];
    
    const technicians = [
        createTestTechnician("T001", "BLOOD"),
        createTestTechnician("T002", "URINE")
    ];
    
    const equipments = [
        createTestEquipment("E001", "BLOOD"),
        createTestEquipment("E002", "URINE")
    ];
    
    // Exécution
    const result = planifyLab({ samples, technicians, equipments });
    const schedule = result.schedule;
    
    // Vérifications
    console.assert(schedule.length === 2, "❌ Doit avoir 2 entrées dans le planning");
    
    const bloodEntry = schedule.find(e => e.sampleId === "S001");
    const urineEntry = schedule.find(e => e.sampleId === "S002");
    
    // S002 doit commencer à 09:15 (son heure d'arrivée) car T002 est libre
    console.assert(urineEntry?.startTime === "09:15", "❌ S002 doit commencer à son heure d'arrivée (parallélisme)");
    
    // Vérifier qu'il y a bien du parallélisme (chevauchement temporel)
    const blood_start = TimeCalculator.convertToMinutes(bloodEntry!.startTime);
    const blood_end = TimeCalculator.convertToMinutes(bloodEntry!.endTime);
    const urine_start = TimeCalculator.convertToMinutes(urineEntry!.startTime);
    const urine_end = TimeCalculator.convertToMinutes(urineEntry!.endTime);
    
    const hasOverlap = blood_start < urine_end && urine_start < blood_end;
    console.assert(hasOverlap, "❌ Les analyses doivent se chevaucher (parallélisme)");
    
    console.log("✅ Test parallel execution réussi");
    return true;
}

function test_metrics_calculation() {
    console.log("🧪 TEST 5: Metrics Calculation");
    
    const samples = [
        createTestSample("S001", "URGENT", "BLOOD", 60, "09:00"),
        createTestSample("S002", "URGENT", "URINE", 30, "09:15"),
        createTestSample("S003", "ROUTINE", "BLOOD", 45, "09:00")
    ];
    
    const technicians = [
        createTestTechnician("T001", "BLOOD"),
        createTestTechnician("T002", "URINE")
    ];
    
    const equipments = [
        createTestEquipment("E001", "BLOOD"),
        createTestEquipment("E002", "URINE")
    ];
    
    // Exécution
    const result = planifyLab({ samples, technicians, equipments });
    
    // Vérifications des métriques
    console.assert(result.metrics.totalTime > 0, "❌ Total time doit être > 0");
    console.assert(result.metrics.efficiency > 0 && result.metrics.efficiency <= 200, "❌ Efficiency doit être entre 0 et 200%");
    console.assert(result.metrics.conflicts === 0, "❌ Conflicts doit être 0 pour un bon planning");
    
    console.log(`📊 Métriques: Total=${result.metrics.totalTime}min, Efficiency=${result.metrics.efficiency.toFixed(1)}%, Conflicts=${result.metrics.conflicts}`);
    console.log("✅ Test metrics calculation réussi");
    return true;
}

// ===== EXÉCUTION DES TESTS =====

function runAllTests() {
    console.log("🚀 DÉMARRAGE DES TESTS - NOUVELLE STRUCTURE\n");
    
    let passedTests = 0;
    let totalTests = 0;
    
    const tests = [
        test_basic_scheduling,
        test_priority_respect,
        test_specialization_matching,
        test_parallel_execution,
        test_metrics_calculation
    ];
    
    for (const test of tests) {
        totalTests++;
        try {
            if (test()) {
                passedTests++;
            }
        } catch (error) {
            console.error(`❌ Test failed: ${error}`);
        }
        console.log("");
    }
    
    console.log("=".repeat(50));
    console.log(`📊 RÉSULTATS: ${passedTests}/${totalTests} tests réussis`);
    
    if (passedTests === totalTests) {
        console.log("🎉 TOUS LES TESTS SONT PASSÉS !");
        return true;
    } else {
        console.log("⚠️  Certains tests ont échoué");
        return false;
    }
}

// Exécution si fichier lancé directement
if (import.meta.main) {
    runAllTests();
}

export { runAllTests, planifyLab };