---
name: EMG Exercise Template Creator
description: How to create new clinical case templates for the EMG Exercise Mode (ejercicios)
---

# EMG Exercise Template Creator

This skill documents the complete process for adding new clinical case templates to the EMG Exercise Mode in the `EMGeducativAPPDLM` platform.

## Architecture Overview

```
ejercicios/src/
├── types/ClinicalCase.ts          ← Core data types (v3)
├── data/
│   ├── CaseTemplates.ts           ← Original 8 templates + interfaces + ALL_CASE_TEMPLATES merge
│   ├── CaseTemplatesExpanded.ts   ← Templates 9-16 (plexopathies, NMJ, GBS, CIDP, entrapments)
│   └── CaseTemplatesExpanded2.ts  ← Templates 17-23 (STC severe, radiculopathies, MMN, pitfalls)
├── services/ClinicalCaseEngine.ts ← Case generator engine (randomizes values from templates)
├── components/ExerciseMode.tsx    ← Main UI component (renders NCS, EMG, RNS, feedback)
└── store/exerciseStore.ts         ← Zustand state (stats, streaks, history)
```

## Step-by-Step: Adding a New Template

### 1. Define the Template Object

Each template implements the `CaseTemplate` interface from `CaseTemplates.ts`. Add your template to either an existing `CaseTemplatesExpanded*.ts` file or create a new one.

```typescript
const newTemplate: CaseTemplate = {
  // ── Identity ──
  patternId: 'unique_snake_case_id',       // Must be unique across ALL templates
  patternName: 'Nombre Clínico Completo',   // Displayed to user
  category: 'entrapment',                   // See CATEGORIES below

  // ── Patient Generator ──
  patient: {
    ageRange: [30, 65],                     // Random age between these values
    sexBias: 'female',                      // Optional: 'male' | 'female' (50/50 if omitted)
    occupations: ['Costurera', 'Secretaria'], // Picked randomly
    complaints: ['Dolor en mano...'],        // Chief complaint (picked randomly)
    histories: ['Mujer de 45 años...'],      // Full clinical history
    physicalExams: ['Fza 4/5 APB...'],       // Physical exam findings
  },

  // ── NCS Templates ──
  ncs: [
    {
      nerve: 'Mediano',
      type: 'motor',                        // 'motor' | 'sensory'
      latency: [5.0, 7.0],                  // Range for generated values (abnormal)
      amplitude: [2, 5],                     // Range for generated values
      velocity: [35, 45],                    // Range for generated values
      normalRanges: {                        // Reference ranges for comparison
        latency: [2.5, 4.2] as [number, number],
        amplitude: [4, 12] as [number, number],
        velocity: [49, 65] as [number, number],
      },
      // Optional advanced fields:
      stimulationSite: 'distal',            // 'distal' | 'proximal' | 'across_elbow' | etc.
      proximalAmplitude: [1, 3],            // For conduction block calculation
      conductionBlock: true,                 // Displayed as red indicator
      temporalDispersion: true,              // Displayed alongside CB
    },
    // ... more nerves
  ],

  // ── EMG Templates ──
  emg: [
    {
      muscle: 'Abductor Pollicis Brevis',
      nerve: 'Mediano',
      root: 'C8-T1',
      insertionalActivity: ['increased'],   // Picked randomly from array
      fibrillations: ['2+', '3+'],          // Picked randomly
      positiveWaves: ['2+'],
      fasciculations: ['absent'],
      duration: [6, 10],                     // MUP duration ms range
      amplitude: [100, 800],                 // MUP amplitude μV range
      polyphasia: [20, 40],                  // % polyphasic
      recruitment: ['discrete', 'absent'],   // Picked randomly
      // Optional:
      myotonicDischarges: ['present'],       // For myotonic disorders
    },
    // ... more muscles
  ],

  // ── Diagnosis & Education ──
  explanation: 'Full explanation of findings and reasoning...',
  differentials: [
    {
      id: 'other_pattern_id',
      name: 'Otro Diagnóstico',
      whyNot: 'Razón por la que este diagnóstico no aplica...',
    },
  ],
  recommendations: ['Recomendación terapéutica 1.', 'Seguimiento EMG en X meses.'],

  // ── Optional Advanced Fields ──
  rns: [...],                    // RNS/ENR templates (for NMJ disorders)
  lateResponses: [...],          // F-wave / H-reflex templates
  skinTemperature: [28, 30],     // For temperature artifact cases
  technicalNotes: ['Nota...'],   // Technical notes displayed in UI
  isPitfall: true,               // Marks as trap/pitfall case
  pitfallExplanation: '⚠️...',  // Shown in amber banner after diagnosis
  severityGrade: 'moderate',     // 'mild' | 'moderate' | 'severe' | 'very_severe'
  severityExplanation: '...',    // Shown alongside severity badge
};
```

### 2. RNS Template (for NMJ cases)

```typescript
rns: [
  {
    nerve: 'Accesorio espinal',
    muscle: 'Trapecio',
    frequency: '3Hz',                       // '2Hz' | '3Hz' | '5Hz' | '20Hz' | '50Hz'
    baselineCMAP: [4, 10],                   // mV range
    decrementPercent: [-15, -30],            // Negative = decrement (>10% abnormal)
    postExerciseFacilitation: [5, 15],       // % increase after exercise
    postExerciseExhaustion: [-20, -40],      // % decrease 2-4 min post-exercise
  },
],
```

### 3. Late Response Template (for radiculopathies, GBS, CIDP)

```typescript
lateResponses: [
  {
    type: 'f_wave',                          // 'f_wave' | 'h_reflex'
    nerve: 'Mediano',
    side: 'right',                           // Optional: 'left' | 'right'
    minLatency: [38, 50],                    // ms range (for F-wave)
    persistence: [0, 30],                    // % persistence (for F-wave)
    chronodispersion: [8, 15],               // ms (for F-wave)
    normalRange: [24, 32],                   // Reference range
    status: ['abnormal', 'absent'],          // Picked randomly
  },
  {
    type: 'h_reflex',
    nerve: 'Tibial',
    latency: [36, 42],                       // ms range (for H-reflex)
    normalRange: [28, 34],
    status: ['abnormal'],
  },
],
```

### 4. Register the Template

If you created a new file, export the array and import it in `CaseTemplates.ts`:

```typescript
// In CaseTemplates.ts — add to the merge:
import { MY_NEW_TEMPLATES } from './CaseTemplatesNew';

export const ALL_CASE_TEMPLATES: CaseTemplate[] = [
  ...CASE_TEMPLATES,
  ...EXPANDED_TEMPLATES,
  ...EXPANDED_TEMPLATES_2,
  ...MY_NEW_TEMPLATES,              // ← Add here
];
```

If you added to an existing file, it's already merged automatically.

### 5. Add Pattern Hints (ExerciseMode.tsx)

Add educational hints for the new pattern in the `PATTERN_HINTS` object:

```typescript
my_new_pattern: [
  'Pista 1: Busca...',
  'Pista 2: Compara...',
  'Pista 3: El hallazgo clave es...',
],
```

### 6. Add Category Label (if new category)

If your template uses a new `category` value, add it to `CATEGORY_LABELS` in `ExerciseMode.tsx`:

```typescript
const CATEGORY_LABELS: Record<string, string> = {
  // ... existing
  my_new_category: 'Mi Categoría',
};
```

## Valid Categories

| Category | Label | Examples |
|----------|-------|---------|
| `normal` | Normal | Estudio normal |
| `axonal` | Axonal | Neuropatía axonal aguda/crónica |
| `demyelinating` | Desmielinizante | Neuropatía desmielinizante, GBS, CIDP |
| `myopathic` | Miopática | Miopatía inflamatoria |
| `entrapment` | Atrapamiento | STC, cubital codo, peroneal |
| `radiculopathy` | Radiculopatía | L5, S1, C5-C6 |
| `plexopathy` | Plexopatía | Erb-Duchenne, Klumpke |
| `motor_neuron_disease` | Enf. Motoneurona | ELA, MMN |
| `neuromuscular_junction` | Unión NM | MG, LEMS |
| `pitfall` | ⚠️ Trampa | Martin-Gruber, fasciculaciones benignas, hipotermia |

## Clinical Data Standards

### NCS Normal Ranges (commonly used)

| Nerve | Type | Latency (ms) | Amplitude | Velocity (m/s) |
|-------|------|-------------|-----------|----------------|
| Mediano | Motor | 2.5–4.2 | 4–12 mV | 49–65 |
| Mediano | Sensory | 2.0–3.5 | 15–50 μV | 50–65 |
| Cubital | Motor | 2.0–3.5 | 6–14 mV | 49–65 |
| Cubital | Sensory | 2.0–3.2 | 10–40 μV | 50–65 |
| Peroneo | Motor | 3.0–5.5 | 2–10 mV | 41–55 |
| Sural | Sensory | 2.5–4.0 | 6–30 μV | 40–55 |
| Tibial | Motor | 3.0–5.8 | 4–15 mV | 41–55 |

### EMG Grading Scale

| Grade | Fibrillations | Meaning |
|-------|--------------|---------|
| absent | None | Normal |
| 1+ | Persistent in ≥2 areas | Mild denervation |
| 2+ | Moderate number | Moderate denervation |
| 3+ | Many in all areas | Severe denervation |
| 4+ | Full screen | Very severe |

### Key Diagnostic Rules

1. **SNAP normal + motor abnormal** → Lesion proximal to DRG (radiculopathy, motor neuron)
2. **SNAP abnormal** → Lesion post-ganglionic (plexopathy, neuropathy)
3. **Velocity <70% LLN** → Demyelinating
4. **Amplitude ↓ with relatively preserved velocity** → Axonal
5. **CB + TD + prolonged F** → Demyelinating (GBS/CIDP/MMN)
6. **Decrement >10% at 3Hz** → NMJ postsynaptic (MG)
7. **Low baseline CMAP + facilitation >100%** → NMJ presynaptic (LEMS)
8. **H-reflex prolonged unilateral** → S1 radiculopathy
9. **Tibial posterior abnormal + peroneal abnormal** → L5 root (not peroneal nerve)

## How the Engine Works

1. `ClinicalCaseEngine.generateRandomCase(difficulty, category?)` picks a random template
2. For each NCS nerve: generates random value within template range, applies age correction, adds difficulty noise, determines status vs normal ranges
3. For each EMG muscle: picks random spontaneous activity from template arrays, generates MUP values within range
4. For RNS (if present): generates baseline CMAP, decrement, facilitation values
5. For late responses (if present): generates latency/persistence, picks random status
6. Assembles the `ClinicalCase` object with all results + correct diagnosis + differentials

## Verification Checklist

After adding a new template:

- [ ] `patternId` is unique (not duplicated in any other template)
- [ ] `category` exists in `CATEGORY_LABELS` in `ExerciseMode.tsx`
- [ ] Pattern hints added to `PATTERN_HINTS` in `ExerciseMode.tsx`
- [ ] Differentials reference valid `patternId`s from other templates
- [ ] Template values are within NCS normal range arrays (abnormal values should be OUTSIDE the `normalRanges`)
- [ ] Dev server compiles without errors (`npm run dev`)
- [ ] New template appears in the category filter UI with correct count
- [ ] Generated case displays correctly in NCS, EMG, and feedback steps
