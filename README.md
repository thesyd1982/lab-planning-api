# 🏥 Laboratoire - Système de Planification

## 📋 Description

Système de planification intelligent pour laboratoire médical gérant l'allocation optimale des échantillons aux techniciens et équipements spécialisés.

### 🎯 Fonctionnalités principales

- **Gestion des priorités** : STAT > URGENT > ROUTINE (respect absolu)
- **Spécialisations** : Matching technicien/équipement selon le type d'échantillon
- **Parallélisme intelligent** : Exécution simultanée quand les ressources le permettent
- **Métriques de performance** : Temps total, efficacité, détection de conflits

### 🏗️ Architecture

**Structure simple et claire avec séparation des responsabilités :**

```

src/
├── entities/                 \# Les objets métier du laboratoire
│   ├── Sample.ts            \# Échantillon à analyser
│   ├── Technician.ts        \# Technicien spécialisé
│   ├── Equipment.ts         \# Équipement de laboratoire
│   ├── ScheduleEntry.ts     \# Entrée de planning
│   ├── LabSchedule.ts       \# Planning complet
│   ├── Metrics.ts           \# Métriques de performance
│   ├── Priority.ts          \# Value Object priorité (STAT/URGENT/ROUTINE)
│   ├── SampleType.ts        \# Value Object type échantillon (BLOOD/URINE/TISSUE)
│   └── Speciality.ts        \# Value Object spécialité technicien
├── planning/                \# Toute la logique de planification
│   ├── Scheduler.ts         \# Algorithme principal de planification
│   ├── ResourceSelector.ts  \# Sélection des techniciens et équipements
│   ├── TimeManager.ts       \# Gestion des disponibilités et créneaux
│   ├── MetricsCalculator.ts \# Calculs des métriques de performance
│   └── TimeCalculator.ts    \# Utilitaires de calcul temporel
└── main.ts                  \# Point d'entrée

```

#### 📦 Responsabilités

- **`/entities/`** : Les "choses" du laboratoire (échantillons, techniciens, équipements...)
- **`/planning/`** : Tout ce qui fait fonctionner le planning (algorithmes, calculs, sélections)
- **`main.ts`** : Composition et orchestration

## 🚀 Installation

### Prérequis

- [Bun](https://bun.sh) v1.1.29 ou supérieur
- TypeScript

### Installation des dépendances

```bash
bun install
```


## 💻 Utilisation

### Exécution du programme principal

```bash
bun run src/main.ts
```


### Exécution des tests

```bash
bun run test-scheduler.ts
```


### 📊 Format des données d'entrée

```typescript
interface InputData {
  samples: Array<{
    id: string;
    type: "BLOOD" | "URINE" | "TISSUE";
    priority: "STAT" | "URGENT" | "ROUTINE";
    analysisTime: number;        // en minutes
    arrivalTime: string;         // format "HH:MM"
    patientId: string;
  }>;
  
  technicians: Array<{
    id: string;
    speciality: "BLOOD" | "URINE" | "TISSUE" | "GENERAL";
    startTime: string;           // format "HH:MM"
    endTime: string;             // format "HH:MM"
  }>;
  
  equipment: Array<{
    id: string;
    type: "BLOOD" | "URINE" | "TISSUE";
    available: boolean;
  }>;
}
```


### 📈 Format de sortie

```typescript
interface OutputData {
  schedule: Array<{
    sampleId: string;
    technicianId: string;
    equipmentId: string;
    startTime: string;           // format "HH:MM"
    endTime: string;             // format "HH:MM"
    priority: string;
  }>;
  
  metrics: {
    totalTime: number;           // durée totale en minutes
    efficiency: number;          // pourcentage d'efficacité
    conflicts: number;           // nombre de conflits détectés
  };
}
```


## 🧪 Exemples d'utilisation

### Exemple simple

```typescript
import { Sample, Technician, Equipment, Priority, SampleType, Speciality } from './src/entities';
import { Scheduler } from './src/planning';

// Création des entités
const samples = [
  new Sample("S001", SampleType.fromString("BLOOD"), Priority.fromString("URGENT"), 30, "09:00", "P001")
];

const technicians = [
  new Technician("T001", Speciality.fromString("BLOOD"), "08:00", "17:00")
];

const equipments = [
  new Equipment("E001", SampleType.fromString("BLOOD"), true)
];

// Utilisation du Scheduler
const scheduler = new Scheduler();
const result = scheduler.planify({ samples, technicians, equipments });

console.log(result);
```


### Résultat attendu

```json
{
  "schedule": [
    {
      "sampleId": "S001",
      "technicianId": "T001",
      "equipmentId": "E001",
      "startTime": "09:00",
      "endTime": "09:30",
      "priority": "URGENT"
    }
  ],
  "metrics": {
    "totalTime": 30,
    "efficiency": 100,
    "conflicts": 0
  }
}
```


## ⚡ Algorithme

### 🔄 Processus de planification (classe Scheduler)

1. **Tri des échantillons** par priorité (STAT > URGENT > ROUTINE) puis par heure d'arrivée
2. **Allocation séquentielle** pour chaque échantillon :
    - **ResourceSelector** : Sélection du technicien et équipement compatibles
    - **TimeManager** : Calcul du créneau optimal (max des disponibilités + heure d'arrivée)
    - Création de l'entrée de planning
3. **Parallélisme opportuniste** : Les analyses s'exécutent en parallèle naturellement quand les ressources sont libres

### 🏗️ Classes principales

- **`Scheduler`** : Orchestration générale du planning
- **`ResourceSelector`** : Logique de sélection des techniciens et équipements
- **`TimeManager`** : Gestion des disponibilités et calculs temporels
- **`MetricsCalculator`** : Calculs de performance du planning


### 🎯 Règles métier

- **Priorité absolue** : Un échantillon STAT passe toujours avant URGENT/ROUTINE
- **Spécialisations obligatoires** :
    - Technicien BLOOD → Échantillons BLOOD uniquement
    - Technicien GENERAL → Tous types d'échantillons
    - Équipement BLOOD → Échantillons BLOOD uniquement
- **Disponibilité** : Aucune ressource ne peut traiter 2 échantillons simultanément
- **Horaires** : Les techniciens travaillent selon leurs horaires (startTime → endTime)


## 📊 Métriques

### Temps total

Durée entre le début de la première analyse et la fin de la dernière analyse.

### Efficacité

Pourcentage d'utilisation moyenne des ressources selon la formule :

```
efficiency = (Σ(temps_occupation_technicien) / nombre_techniciens / temps_total_planning) * 100
```


### Conflits

Nombre de violations des règles détectées (doit être 0 dans un planning valide).

## 🧪 Tests

Le système inclut 5 tests automatisés couvrant :

1. **Basic Scheduling** : Planification simple d'un échantillon
2. **Priority Respect** : Vérification du respect des priorités STAT > URGENT > ROUTINE
3. **Specialization Matching** : Validation de l'assignation selon les spécialisations
4. **Parallel Execution** : Test du parallélisme intelligent
5. **Metrics Calculation** : Validation des calculs de métriques

### Exécution des tests

```bash
bun run test-scheduler.ts
```

Résultat attendu :

```
🎉 TOUS LES TESTS SONT PASSÉS !
📊 RÉSULTATS: 5/5 tests réussis
```


### Structure des tests

```typescript
import { Sample, Technician, Equipment } from './src/entities';
import { Scheduler } from './src/planning';

const scheduler = new Scheduler();
const result = scheduler.planify({ samples, technicians, equipments });
```


## 🔧 Architecture

Cette version implémente une **architecture simple et claire** avec :

- **Séparation des responsabilités** : entities/ vs planning/
- **Classes spécialisées** : Scheduler, ResourceSelector, TimeManager, MetricsCalculator
- **Structure intuitive** : Facile de trouver où est quoi
- **Gestion d'erreurs** : Validation des inputs et gestion des cas limites
- **Tests automatisés** : Couverture des fonctionnalités principales
- **Code maintenable** : Structure modulaire et documentation


### Avantages de cette structure

- **🎯 Simple** : 2 dossiers principaux seulement
- **🧠 Évident** : On sait immédiatement où chercher
- **⚡ Rapide** : Pas de sur-ingénierie
- **📈 Évolutif** : Facile d'ajouter de nouvelles fonctionnalités


### Améliorations futures possibles

- Gestion des pauses déjeuner (12h-15h)
- Maintenance des équipements
- Coefficients d'efficacité par technicien
- Temps de nettoyage entre échantillons
- Interface web pour visualisation


## 📝 Licence

Ce projet est développé dans le cadre d'un test technique.

## 👥 Auteur

Développé avec bonnes pratiques TypeScript.
