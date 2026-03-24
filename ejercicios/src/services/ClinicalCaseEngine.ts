// ClinicalCaseEngine.ts — Motor de generación de casos clínicos
// v3: +RNS, +LateResponses, +Temperature, +ConductionBlock, +Pitfall, +Severity
import type {
  ClinicalCase, Difficulty, NCSExerciseResult, EMGExerciseResult,
  ExercisePatient, KeyFinding, CorrectDiagnosis, DiagnosisOption,
  LateResponseResult, RNSResult, SeverityGrade
} from '../types/ClinicalCase';
import { ALL_CASE_TEMPLATES, DIAGNOSIS_OPTIONS, type CaseTemplate, type NCSTemplate, type EMGTemplate } from '../data/CaseTemplates';

// ─── Utilidades ───────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `case_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function determineStatus(
  value: number,
  normalRange: [number, number],
  isHighAbnormal: boolean = true
): 'normal' | 'abnormal' | 'borderline' {
  const [min, max] = normalRange;
  const margin = (max - min) * 0.1;
  if (isHighAbnormal) {
    if (value > max + margin) return 'abnormal';
    if (value > max - margin && value <= max + margin) return 'borderline';
    if (value < min - margin) return 'abnormal';
    if (value >= min - margin && value < min + margin) return 'borderline';
  } else {
    if (value < min - margin) return 'abnormal';
    if (value >= min - margin && value < min + margin) return 'borderline';
    if (value > max + margin) return 'abnormal';
    if (value > max - margin && value <= max + margin) return 'borderline';
  }
  return 'normal';
}

// ─── Motor Principal ──────────────────────────────────────────

export class ClinicalCaseEngine {

  /** Genera un caso aleatorio */
  static generateRandomCase(difficulty: Difficulty = 'medium', category?: string): ClinicalCase {
    const pool = category
      ? ALL_CASE_TEMPLATES.filter(t => t.category === category)
      : ALL_CASE_TEMPLATES;
    const template = pickRandom(pool.length > 0 ? pool : ALL_CASE_TEMPLATES);
    return this.generateCaseFromTemplate(template, difficulty);
  }

  /** Genera un caso de un patrón específico */
  static generateCaseForPattern(patternId: string, difficulty: Difficulty = 'medium'): ClinicalCase {
    const template = ALL_CASE_TEMPLATES.find(t => t.patternId === patternId);
    if (!template) throw new Error(`Pattern not found: ${patternId}`);
    return this.generateCaseFromTemplate(template, difficulty);
  }

  /** Genera un caso a partir de una plantilla */
  static generateCaseFromTemplate(template: CaseTemplate, difficulty: Difficulty): ClinicalCase {
    const patient = this.generatePatient(template.patient);
    const ncsResults = this.generateNCS(template.ncs, difficulty, patient.age);
    const emgResults = this.generateEMG(template.emg, difficulty);
    const keyFindings = this.extractKeyFindings(ncsResults, emgResults, template);

    // Generate RNS results if template has them
    const rnsResults = template.rns ? this.generateRNS(template.rns, difficulty) : undefined;
    // Generate late responses if template has them
    const lateResponses = template.lateResponses ? this.generateLateResponses(template.lateResponses, difficulty) : undefined;
    // Temperature
    const skinTemperature = template.skinTemperature ? randomBetween(template.skinTemperature[0], template.skinTemperature[1]) : undefined;
    const technicalNotes = template.technicalNotes ? pickRandom(template.technicalNotes) : undefined;

    const correctDiagnosis: CorrectDiagnosis = {
      patternId: template.patternId,
      patternName: template.patternName,
      category: template.category,
      explanation: template.explanation,
      keyFindings,
      differentials: template.differentials.map(d => ({
        patternId: d.id, patternName: d.name, whyNot: d.whyNot
      })),
      recommendations: template.recommendations,
      severityGrade: template.severityGrade,
      severityExplanation: template.severityExplanation,
    };

    return {
      id: generateId(),
      difficulty,
      patient,
      ncsResults,
      emgResults,
      lateResponses,
      rnsResults,
      correctDiagnosis,
      source: 'template',
      createdAt: new Date().toISOString(),
      skinTemperature,
      technicalNotes,
      isPitfall: template.isPitfall,
      pitfallExplanation: template.pitfallExplanation,
    };
  }

  /** Genera datos del paciente */
  private static generatePatient(template: CaseTemplate['patient']): ExercisePatient {
    const age = Math.floor(randomBetween(template.ageRange[0], template.ageRange[1]));
    const sex = template.sexBias || (Math.random() > 0.5 ? 'male' : 'female');
    return {
      age, sex,
      occupation: pickRandom(template.occupations),
      chiefComplaint: pickRandom(template.complaints),
      clinicalHistory: pickRandom(template.histories),
      physicalExam: pickRandom(template.physicalExams),
    };
  }

  /** Genera resultados NCS con variabilidad por dificultad */
  private static generateNCS(
    templates: NCSTemplate[], difficulty: Difficulty, patientAge: number
  ): NCSExerciseResult[] {
    const variability = { easy: 0.0, medium: 0.15, hard: 0.25 }[difficulty];

    return templates.map(t => {
      let latency = randomBetween(t.latency[0], t.latency[1]);
      let amplitude = randomBetween(t.amplitude[0], t.amplitude[1]);
      let velocity = randomBetween(t.velocity[0], t.velocity[1]);

      // Apply age correction for patients > 60
      if (patientAge > 60) {
        const yearsOver60 = patientAge - 60;
        velocity *= (1 - 0.004 * yearsOver60);
        amplitude *= (1 - 0.01 * yearsOver60);
        latency *= (1 + 0.005 * yearsOver60);
      }

      // Add difficulty-based noise (harder = values closer to borderline)
      if (variability > 0) {
        const nRange = t.normalRanges;
        const latNoise = (nRange.latency[1] - nRange.latency[0]) * variability * (Math.random() - 0.5);
        const ampNoise = (nRange.amplitude[1] - nRange.amplitude[0]) * variability * (Math.random() - 0.5);
        const velNoise = (nRange.velocity[1] - nRange.velocity[0]) * variability * (Math.random() - 0.5);
        latency += latNoise;
        amplitude += ampNoise;
        velocity += velNoise;
      }

      // Clamp to physiologic limits
      latency = Math.max(0.5, Math.round(latency * 10) / 10);
      amplitude = Math.max(0.1, Math.round(amplitude * 10) / 10);
      velocity = Math.max(15, Math.round(velocity * 10) / 10);

      const latStatus = determineStatus(latency, t.normalRanges.latency, true);
      const ampStatus = determineStatus(amplitude, t.normalRanges.amplitude, false);
      const velStatus = determineStatus(velocity, t.normalRanges.velocity, false);
      const overall = [latStatus, ampStatus, velStatus].includes('abnormal') ? 'abnormal'
        : [latStatus, ampStatus, velStatus].includes('borderline') ? 'borderline' : 'normal';

      const side = pickRandom(['left', 'right', 'bilateral'] as ('left' | 'right' | 'bilateral')[]);
      return {
        nerve: t.nerve,
        side,
        type: t.type,
        stimulationSite: t.stimulationSite,
        latency, amplitude, velocity,
        proximalAmplitude: t.proximalAmplitude ? randomBetween(t.proximalAmplitude[0], t.proximalAmplitude[1]) : undefined,
        conductionBlock: t.conductionBlock,
        temporalDispersion: t.temporalDispersion,
        normalRanges: {
          latency: { min: t.normalRanges.latency[0], max: t.normalRanges.latency[1] },
          amplitude: { min: t.normalRanges.amplitude[0], max: t.normalRanges.amplitude[1] },
          velocity: { min: t.normalRanges.velocity[0], max: t.normalRanges.velocity[1] },
        },
        status: overall,
      };
    });
  }

  /** Genera resultados EMG con variabilidad por dificultad */
  private static generateEMG(templates: EMGTemplate[], difficulty: Difficulty): EMGExerciseResult[] {
    return templates.map(t => {
      const duration = randomBetween(t.duration[0], t.duration[1]);
      const amplitude = randomBetween(t.amplitude[0], t.amplitude[1]);
      const polyphasia = randomBetween(t.polyphasia[0], t.polyphasia[1]);
      const phases = polyphasia > 25 ? Math.floor(randomBetween(5, 8)) : Math.floor(randomBetween(2, 4));

      const fibs = pickRandom(t.fibrillations) as any;
      const pw = pickRandom(t.positiveWaves) as any;
      const fasc = pickRandom(t.fasciculations) as any;
      const recruitment = pickRandom(t.recruitment) as any;
      const insertional = pickRandom(t.insertionalActivity) as any;

      const hasAbnormal = fibs !== 'absent' || pw !== 'absent' || fasc !== 'absent'
        || duration > 15 || duration < 6 || amplitude > 5000 || amplitude < 200
        || recruitment !== 'normal';

      return {
        muscle: t.muscle,
        side: pickRandom(['left', 'right'] as ('left' | 'right')[]),
        nerve: t.nerve,
        root: t.root,
        insertionalActivity: insertional,
        spontaneousActivity: {
          fibrillations: fibs,
          positiveWaves: pw,
          fasciculations: fasc,
          complexRepetitiveDischarges: 'absent' as const,
          myotonicDischarges: t.myotonicDischarges ? pickRandom(t.myotonicDischarges) as any : undefined,
        },
        motorUnitPotentials: {
          duration: Math.round(duration * 10) / 10,
          amplitude: Math.round(amplitude),
          polyphasia: Math.round(polyphasia),
          phases,
        },
        recruitmentPattern: recruitment,
        interferencePattern: recruitment === 'normal' ? 'full'
          : recruitment === 'reduced' ? 'reduced'
          : recruitment === 'early' ? 'full'
          : 'discrete' as any,
        status: hasAbnormal ? 'abnormal' : 'normal',
      };
    });
  }

  /** Genera resultados de ENR (Estimulación Nerviosa Repetitiva) */
  private static generateRNS(templates: NonNullable<CaseTemplate['rns']>, _difficulty: Difficulty): RNSResult[] {
    return templates.map(t => {
      const baselineCMAP = randomBetween(t.baselineCMAP[0], t.baselineCMAP[1]);
      const decrementPercent = randomBetween(t.decrementPercent[0], t.decrementPercent[1]);
      const postExerciseFacilitation = t.postExerciseFacilitation
        ? randomBetween(t.postExerciseFacilitation[0], t.postExerciseFacilitation[1]) : undefined;
      const postExerciseExhaustion = t.postExerciseExhaustion
        ? randomBetween(t.postExerciseExhaustion[0], t.postExerciseExhaustion[1]) : undefined;

      const status = decrementPercent <= -10 ? 'decremental'
        : (postExerciseFacilitation && postExerciseFacilitation > 100) ? 'incremental'
        : 'normal';

      return {
        nerve: t.nerve, muscle: t.muscle,
        side: pickRandom(['left', 'right'] as ('left' | 'right')[]),
        frequency: t.frequency,
        baselineCMAP: Math.round(baselineCMAP * 10) / 10,
        decrementPercent: Math.round(decrementPercent),
        postExerciseFacilitation: postExerciseFacilitation ? Math.round(postExerciseFacilitation) : undefined,
        postExerciseExhaustion: postExerciseExhaustion ? Math.round(postExerciseExhaustion) : undefined,
        status: status as RNSResult['status'],
      };
    });
  }

  /** Genera resultados de respuestas tardías (F-wave, H-reflex) */
  private static generateLateResponses(templates: NonNullable<CaseTemplate['lateResponses']>, _difficulty: Difficulty): LateResponseResult[] {
    return templates.map(t => {
      const status = pickRandom(t.status);
      return {
        type: t.type,
        nerve: t.nerve,
        side: t.side || pickRandom(['left', 'right'] as ('left' | 'right')[]),
        minLatency: t.minLatency && status !== 'absent' ? randomBetween(t.minLatency[0], t.minLatency[1]) : undefined,
        persistence: t.persistence && status !== 'absent' ? Math.round(randomBetween(t.persistence[0], t.persistence[1])) : undefined,
        chronodispersion: t.chronodispersion && status !== 'absent' ? randomBetween(t.chronodispersion[0], t.chronodispersion[1]) : undefined,
        latency: t.latency && status !== 'absent' ? randomBetween(t.latency[0], t.latency[1]) : undefined,
        normalRange: { min: t.normalRange[0], max: t.normalRange[1] },
        status,
      };
    });
  }

  /** Extrae hallazgos clave del caso generado */
  private static extractKeyFindings(
    ncs: NCSExerciseResult[], emg: EMGExerciseResult[], _template: CaseTemplate
  ): KeyFinding[] {
    const findings: KeyFinding[] = [];

    // NCS abnormalities
    ncs.forEach(n => {
      if (n.status === 'abnormal' || n.status === 'borderline') {
        if (n.latency > n.normalRanges.latency.max) {
          findings.push({
            parameter: 'Latencia distal', location: `${n.nerve} ${n.type}`,
            value: `${n.latency} ms`, normalValue: `${n.normalRanges.latency.min}-${n.normalRanges.latency.max} ms`,
            significance: 'Latencia prolongada sugiere desmielinización focal o difusa.',
            importance: 'critical',
          });
        }
        if (n.amplitude < n.normalRanges.amplitude.min) {
          findings.push({
            parameter: 'Amplitud', location: `${n.nerve} ${n.type}`,
            value: `${n.amplitude} ${n.type === 'motor' ? 'mV' : 'μV'}`,
            normalValue: `${n.normalRanges.amplitude.min}-${n.normalRanges.amplitude.max}`,
            significance: 'Amplitud reducida sugiere pérdida axonal.',
            importance: 'critical',
          });
        }
        if (n.velocity < n.normalRanges.velocity.min) {
          findings.push({
            parameter: 'Velocidad de conducción', location: `${n.nerve} ${n.type}`,
            value: `${n.velocity} m/s`, normalValue: `${n.normalRanges.velocity.min}-${n.normalRanges.velocity.max} m/s`,
            significance: 'Velocidad reducida sugiere desmielinización.',
            importance: 'major',
          });
        }
      }
    });

    // EMG abnormalities
    emg.forEach(e => {
      if (e.status === 'abnormal') {
        if (e.spontaneousActivity.fibrillations !== 'absent') {
          findings.push({
            parameter: 'Fibrilaciones', location: e.muscle,
            value: e.spontaneousActivity.fibrillations, normalValue: 'Ausente',
            significance: 'Fibrilaciones indican denervación activa (pérdida axonal reciente).',
            importance: 'critical',
          });
        }
        if (e.motorUnitPotentials.duration > 15 || e.motorUnitPotentials.duration < 6) {
          const isLong = e.motorUnitPotentials.duration > 15;
          findings.push({
            parameter: 'Duración PUM', location: e.muscle,
            value: `${e.motorUnitPotentials.duration} ms`, normalValue: '8-13 ms',
            significance: isLong
              ? 'PUM de larga duración indica reinervación crónica (patrón neurogénico).'
              : 'PUM de corta duración indica pérdida de fibras musculares (patrón miopático).',
            importance: 'major',
          });
        }
        if (e.recruitmentPattern !== 'normal') {
          findings.push({
            parameter: 'Reclutamiento', location: e.muscle,
            value: e.recruitmentPattern, normalValue: 'Normal',
            significance: e.recruitmentPattern === 'reduced'
              ? 'Reclutamiento reducido indica pérdida de unidades motoras funcionales.'
              : 'Reclutamiento precoz indica debilidad por causa muscular.',
            importance: 'major',
          });
        }
      }
    });

    return findings.slice(0, 8); // Limit to most important
  }

  /** Obtiene todas las opciones de diagnóstico para el selector */
  static getDiagnosisOptions(): DiagnosisOption[] {
    return DIAGNOSIS_OPTIONS;
  }

  /** Obtiene las opciones incluyendo distractores para un caso dado */
  static getOptionsForCase(correctPatternId: string, difficulty: Difficulty): DiagnosisOption[] {
    const correct = DIAGNOSIS_OPTIONS.find(o => o.patternId === correctPatternId);
    if (!correct) return DIAGNOSIS_OPTIONS;

    const others = DIAGNOSIS_OPTIONS.filter(o => o.patternId !== correctPatternId);

    // Number of options by difficulty
    const numOptions = { easy: 3, medium: 5, hard: 7 }[difficulty];

    // Pick distractors, prioritizing same category
    const sameCategory = others.filter(o => o.category === correct.category);
    const diffCategory = others.filter(o => o.category !== correct.category);

    const distractors: DiagnosisOption[] = [];
    const numSameCategory = Math.min(Math.floor(numOptions / 2), sameCategory.length);

    // Add some from same category (harder distractors)
    for (let i = 0; i < numSameCategory && sameCategory.length > 0; i++) {
      const idx = Math.floor(Math.random() * sameCategory.length);
      distractors.push(sameCategory.splice(idx, 1)[0]);
    }

    // Fill rest from different categories
    while (distractors.length < numOptions - 1 && diffCategory.length > 0) {
      const idx = Math.floor(Math.random() * diffCategory.length);
      distractors.push(diffCategory.splice(idx, 1)[0]);
    }

    // Shuffle in the correct answer
    const allOptions = [correct, ...distractors];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    return allOptions;
  }

  /** Evalúa la respuesta del alumno */
  static evaluateAnswer(
    selectedPatternId: string,
    clinicalCase: ClinicalCase,
    timeSpent?: number
  ) {
    const isCorrect = selectedPatternId === clinicalCase.correctDiagnosis.patternId;
    const baseScore = isCorrect ? 100 : 0;

    // Partial credit for same category
    const selectedOption = DIAGNOSIS_OPTIONS.find(o => o.patternId === selectedPatternId);
    const partialCredit = !isCorrect && selectedOption?.category === clinicalCase.correctDiagnosis.category ? 25 : 0;

    // Time bonus (max 20 points for answering in <60s)
    const timeBonus = isCorrect && timeSpent && timeSpent < 60 ? Math.round(20 * (1 - timeSpent / 60)) : 0;

    const selectedName = selectedOption?.patternName || selectedPatternId;
    const whyNotSelected = clinicalCase.correctDiagnosis.differentials
      .find(d => d.patternId === selectedPatternId);

    return {
      isCorrect,
      score: Math.min(100, baseScore + partialCredit + timeBonus),
      selectedAnswer: selectedPatternId,
      correctAnswer: clinicalCase.correctDiagnosis.patternId,
      correctPatternName: clinicalCase.correctDiagnosis.patternName,
      explanation: clinicalCase.correctDiagnosis.explanation,
      keyFindingsHighlighted: clinicalCase.correctDiagnosis.keyFindings,
      differentialExplanations: isCorrect
        ? clinicalCase.correctDiagnosis.differentials.map(d => ({
            patternName: d.patternName, whyNot: d.whyNot
          }))
        : [
            ...(whyNotSelected
              ? [{ patternName: selectedName, whyNot: whyNotSelected.whyNot }]
              : [{ patternName: selectedName, whyNot: `${selectedName} no aplica en este caso. ${clinicalCase.correctDiagnosis.explanation}` }]),
            ...clinicalCase.correctDiagnosis.differentials
              .filter(d => d.patternId !== selectedPatternId)
              .map(d => ({ patternName: d.patternName, whyNot: d.whyNot }))
          ],
      timeSpent,
    };
  }
}
