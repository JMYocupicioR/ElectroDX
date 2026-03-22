import { ClinicalSymptomsData, ClinicalSymptom as SourceClinicalSymptom } from '../components/ClinicalSymptomsForm';
import { NCSTestResult, SpecialStudyData } from '../types/ncs'; 
import { Patient } from '../types/patient';

// EMG Types
interface EMGMotorUnitPotential {
  amplitude: number;
  duration: number;
  polyphasia: number;
}

interface EMGSpontaneousActivity {
  fibrillations: boolean;
  positiveWaves: boolean;
  fasciculations: boolean;
}

export interface EMGNerveRecord {
  id: string;
  muscleOrNerveName: string;
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased' | 'absent' | '';
  spontaneousActivity: EMGSpontaneousActivity;
  motorUnitPotentials: EMGMotorUnitPotential;
  recruitmentPattern: 'normal' | 'reduced_incomplete' | 'reduced_complete' | 'early' | 'discrete' | '';
  interpretationNotes?: string;
}

// --- Helper Interfaces for ClinicalReport (Internal to this module) ---
interface PatientDataForReport {
    id: string;
    demographics: { age: number; sex: string; weight?: number; height?: number; handDominance?: string; occupation?: string; };
    medicalHistory: { previousDiseases: string[]; surgeries: string[]; currentMedications: string[]; allergies: string[]; familyHistory?: string; };
    consultReason: string;
    mainDiagnosis?: string;
}

interface SymptomSummaryForReport { // Renamed from SymptomSummary to avoid conflict if imported elsewhere, though local scope is fine
  name: string;
  present: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  onset: string;
  progression: string;
  locations: string[]; 
  characteristics: string[];
  impactScore: number;
}

interface SymptomCategoryForReport { // Renamed from SymptomCategory
  present: boolean;
  count: number;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  symptoms: SymptomSummaryForReport[];
}

interface SymptomsDataForReport {
    motor: SymptomCategoryForReport;
    sensory: SymptomCategoryForReport;
    autonomic: SymptomCategoryForReport;
    functional: SymptomCategoryForReport;
    constitutional: SymptomCategoryForReport;
}

interface EMGGlobalFindingsForReport { // Renamed
  overallPattern: 'normal' | 'neuropathic' | 'myopathic' | 'mixed' | 'undetermined';
  distribution: 'focal' | 'multifocal' | 'generalized' | 'undetermined';
  severity: 'mild' | 'moderate' | 'severe' | 'undetermined';
  chronicity: 'acute' | 'subacute' | 'chronic' | 'undetermined';
}

interface NCSGlobalFindingsForReport { // Renamed
  overallPattern: 'normal' | 'axonal' | 'demyelinating' | 'mixed' | 'undetermined';
  distribution: 'focal' | 'multifocal' | 'generalized' | 'undetermined';
  severity: 'mild' | 'moderate' | 'severe' | 'undetermined';
}

interface ElectrophysiologicalPatternForReport { // Renamed
  patternId: string;
  patternName: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
}

interface SymptomPatternScoreForReport { // Renamed
  neuropathicScore: number;
  myopathicScore: number;
  radiculopathicScore: number;
  plexopathicScore: number;
  systemicScore: number;
}

interface DiagnosticScoreForReport { // Renamed
  diagnosisId: string;
  diagnosisName: string;
  overallScore: number;
  symptomScore: number;
  electrophysiologyScore: number;
  clinicalContext: number;
  confidence: number;
}

interface RiskFactorForReport { // Renamed
  factor: string;
  present: boolean;
  weight: number;
  description: string;
}

interface RedFlagForReport { // Renamed
  flag: string;
  present: boolean;
  urgency: 'medium' | 'high' | 'urgent';
  recommendation: string;
}

interface AnalysisDataForReport {
    symptomPatternScore: SymptomPatternScoreForReport;
    electrophysiologicalPatterns: ElectrophysiologicalPatternForReport[];
    combinedDiagnosticScore: DiagnosticScoreForReport[];
    riskFactors: RiskFactorForReport[];
    redFlags: RedFlagForReport[];
}

interface ConclusionDataForReport {
    primaryDiagnosis: string;
    confidence: number;
    differentialDiagnoses: string[];
    recommendations: string[];
    urgency: 'low' | 'medium' | 'high' | 'urgent';
}
// --- End of Helper Interfaces ---

export interface ClinicalReport { 
  reportId: string;
  timestamp: string;
  version: string;
  patient: PatientDataForReport;
  clinicalSymptoms: SymptomsDataForReport;
  electrophysiologicalData: {
    emg?: {
      records?: EMGNerveRecord[];
      muscles: EMGMuscleResult[]; 
      globalFindings: EMGGlobalFindingsForReport;
      status: 'performed' | 'skipped' | 'nodata';
    };
    ncs?: {
      results: NCSTestResult[]; 
      globalFindings: NCSGlobalFindingsForReport;
    };
    specialStudies?: SpecialStudyData;
  };
  analysis: AnalysisDataForReport;
  conclusion: ConclusionDataForReport;
}

export interface EMGMuscleResult { 
  muscleName: string;
  side: 'left' | 'right';
  insertionalActivity: string;
  spontaneousActivitySummary: string;
  mupAmplitude: number;
  mupDuration: number;
  mupPolyphasia: number;
  recruitmentPattern: string;
  abnormalityScore: number;
  interpretationNotes?: string;
}


export class JsonReportGenerator {
  static generateCompleteReport(
    patient: Patient,
    symptomsData: ClinicalSymptomsData,
    emgData?: EMGNerveRecord[] | 'skipped' | null, 
    ncsResults?: NCSTestResult[],
    specialStudies?: SpecialStudyData
  ): ClinicalReport {
    const reportId = this.generateReportId();
    const timestamp = new Date().toISOString();
    const analyzedClinicalSymptoms = this.analyzeSymptoms(symptomsData);

    const report: ClinicalReport = {
      reportId,
      timestamp,
      version: '1.2.0', 
      patient: this.formatPatientData(patient),
      clinicalSymptoms: analyzedClinicalSymptoms,
      electrophysiologicalData: this.formatElectrophysiologicalData(emgData, ncsResults, specialStudies),
      analysis: this.performComprehensiveAnalysis(analyzedClinicalSymptoms, emgData, ncsResults, specialStudies),
      conclusion: this.generateConclusion(analyzedClinicalSymptoms, emgData, ncsResults, specialStudies)
    };
    return report;
  }

  static exportAsJsonString(report: ClinicalReport): string {
    return JSON.stringify(report, null, 2);
  }

  static downloadAsJsonFile(report: ClinicalReport, filename?: string): void {
    const jsonString = this.exportAsJsonString(report);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `clinical-report-${report.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static generateReportId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CR-${timestamp}-${random}`.toUpperCase();
  }

  private static formatPatientData(patientInput: Patient): PatientDataForReport {
    const age = patientInput.dateOfBirth 
      ? new Date().getFullYear() - new Date(patientInput.dateOfBirth).getFullYear()
      : 0;
    return {
      id: patientInput.id,
      demographics: {
        age,
        sex: patientInput.sex,
      },
      medicalHistory: patientInput.medicalHistory || { previousDiseases:[], surgeries:[], currentMedications:[], allergies:[]},
      consultReason: patientInput.consultReason || '',
      mainDiagnosis: patientInput.mainDiagnosis
    };
  }

  private static analyzeSymptoms(symptomsData: ClinicalSymptomsData): SymptomsDataForReport {
    const analyzeSymptomSection = (categorySymptoms: Record<string, SourceClinicalSymptom>): SymptomCategoryForReport => {
        const symptomsArray: SourceClinicalSymptom[] = Object.values(categorySymptoms);
        const presentSymptomsDetails = symptomsArray.filter(s => s.present);
        const severityScores = presentSymptomsDetails.map(s => 
            s.severity === 'severe' ? 3 : s.severity === 'moderate' ? 2 : 1 
        );
        const avgSeverity = severityScores.length > 0 
            ? severityScores.reduce((a, b) => a + b, 0) / severityScores.length
            : 0;
        let overallSeverity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
        if (avgSeverity >= 2.5) overallSeverity = 'severe';
        else if (avgSeverity >= 1.5) overallSeverity = 'moderate';
        else if (avgSeverity > 0) overallSeverity = 'mild';

        return {
            present: presentSymptomsDetails.length > 0,
            count: presentSymptomsDetails.length,
            severity: overallSeverity,
            symptoms: symptomsArray.map((symptom: SourceClinicalSymptom): SymptomSummaryForReport => ({
                name: symptom.name,
                present: symptom.present,
                severity: symptom.severity === 'severe' ? 'severe' : 
                          symptom.severity === 'moderate' ? 'moderate' : 'mild',
                duration: symptom.duration || '',
                onset: symptom.onset || '',
                progression: symptom.progression || '',
                locations: symptom.location || [],
                characteristics: symptom.characteristics || [],
                impactScore: this.calculateSymptomImpact(symptom)
            }))
        };
    };
    return {
        motor: analyzeSymptomSection(symptomsData.motor as unknown as Record<string, SourceClinicalSymptom>),
        sensory: analyzeSymptomSection(symptomsData.sensory as unknown as Record<string, SourceClinicalSymptom>),
        autonomic: analyzeSymptomSection(symptomsData.autonomic as unknown as Record<string, SourceClinicalSymptom>),
        functional: analyzeSymptomSection(symptomsData.functional as unknown as Record<string, SourceClinicalSymptom>),
        constitutional: analyzeSymptomSection(symptomsData.constitutional as unknown as Record<string, SourceClinicalSymptom>)
    };
  }

  private static calculateSymptomImpact(symptom: SourceClinicalSymptom): number {
    let score = 0;
    if (symptom.present) {
        const severityValue = symptom.severity === 'severe' ? 3 : 
                              symptom.severity === 'moderate' ? 2 : 
                              (symptom.severity === 'mild' || symptom.severity === '') ? 1 : 0;
        score += severityValue;
        score += symptom.progression === 'worsening' ? 2 : symptom.progression === 'stable' ? 1 : 0;
        if (symptom.duration && (symptom.duration.includes('año') || symptom.duration.includes('meses'))) score += 2;
        else if (symptom.duration && symptom.duration.includes('semana')) score += 1;
        const locArray = symptom.location || [];
        if (locArray.length > 2) score += 1;
    }
    return Math.min(score, 10);
  }

  private static formatElectrophysiologicalData(
    emgData?: EMGNerveRecord[] | 'skipped' | null, 
    ncsResults?: NCSTestResult[],
    specialStudies?: SpecialStudyData
  ): ClinicalReport['electrophysiologicalData'] {
    const data: ClinicalReport['electrophysiologicalData'] = {};

    if (emgData === 'skipped') {
      data.emg = {
        status: 'skipped',
        records: [],
        muscles: [],
        globalFindings: {
          overallPattern: 'undetermined',
          distribution: 'undetermined',
          severity: 'undetermined',
          chronicity: 'undetermined'
        }
      };
    } else if (emgData && emgData.length > 0) {
      data.emg = {
        status: 'performed',
        records: emgData,
        muscles: emgData.map(record => this.transformEMGNerveRecordToMuscleResult(record)),
        globalFindings: {
          overallPattern: this.determineEMGPattern(emgData),
          distribution: this.determineEMGDistribution(emgData),
          severity: this.determineEMGSeverity(emgData),
          chronicity: this.determineEMGChronicity(emgData)
        }
      };
    } else {
      data.emg = {
        status: 'nodata',
        records: [],
        muscles: [],
        globalFindings: {
          overallPattern: 'undetermined',
          distribution: 'undetermined',
          severity: 'undetermined',
          chronicity: 'undetermined'
        }
      };
    }

    if (ncsResults && ncsResults.length > 0) {
      data.ncs = {
        results: ncsResults,
        globalFindings: {
          overallPattern: this.determineNCSPattern(ncsResults),
          distribution: this.determineNCSDistribution(ncsResults),
          severity: this.determineNCSSeverity(ncsResults)
        }
      };
    }

    if (specialStudies) {
      data.specialStudies = specialStudies;
    }

    return data;
  }
  
  private static transformEMGNerveRecordToMuscleResult(record: EMGNerveRecord): EMGMuscleResult {
    let spontaneousSummaryArray: string[] = [];
    if (record.spontaneousActivity.fibrillations) spontaneousSummaryArray.push('Fibrilaciones');
    if (record.spontaneousActivity.positiveWaves) spontaneousSummaryArray.push('Ondas Positivas');
    if (record.spontaneousActivity.fasciculations) spontaneousSummaryArray.push('Fasciculaciones');
    const spontaneousActivitySummary = spontaneousSummaryArray.length > 0 ? spontaneousSummaryArray.join(', ') : 'Ausente';
    let abnormalityScore = 0;
    if (record.insertionalActivity === 'increased' || record.insertionalActivity === 'decreased') abnormalityScore += 1;
    if (record.insertionalActivity === 'absent') abnormalityScore += 2;
    if (spontaneousSummaryArray.length > 0) abnormalityScore += spontaneousSummaryArray.length;
    if (record.motorUnitPotentials.amplitude < 100 || record.motorUnitPotentials.amplitude > 5000) abnormalityScore +=1;
    if (record.motorUnitPotentials.duration < 5 || record.motorUnitPotentials.duration > 15) abnormalityScore +=1;
    if (record.motorUnitPotentials.polyphasia > 20) abnormalityScore +=1;
    if (record.recruitmentPattern !== 'normal' && record.recruitmentPattern !== '') abnormalityScore +=1;
    return {
        muscleName: record.muscleOrNerveName,
        side: record.side,
        insertionalActivity: record.insertionalActivity || 'no especificada',
        spontaneousActivitySummary,
        mupAmplitude: record.motorUnitPotentials.amplitude,
        mupDuration: record.motorUnitPotentials.duration,
        mupPolyphasia: record.motorUnitPotentials.polyphasia,
        recruitmentPattern: record.recruitmentPattern || 'no especificado',
        abnormalityScore: Math.min(abnormalityScore, 10),
        interpretationNotes: record.interpretationNotes
    };
  }

  private static determineEMGPattern(emgRecords: EMGNerveRecord[]): EMGGlobalFindingsForReport['overallPattern'] {
    if (!emgRecords || emgRecords.length === 0) return 'undetermined';
    let hasNeuropathicSigns = false;
    let hasMyopathicSigns = false;
    let abnormalitiesPresent = false;
    for (const record of emgRecords) {
      if (record.insertionalActivity !== 'normal' && record.insertionalActivity !== '') abnormalitiesPresent = true;
      if (record.spontaneousActivity.fibrillations || record.spontaneousActivity.positiveWaves || record.spontaneousActivity.fasciculations) abnormalitiesPresent = true;
      if (record.recruitmentPattern !== 'normal' && record.recruitmentPattern !== '') abnormalitiesPresent = true;
      if (record.motorUnitPotentials.amplitude !== 0 || record.motorUnitPotentials.duration !== 0 || record.motorUnitPotentials.polyphasia !== 0) {
          if(record.motorUnitPotentials.duration > 12 || record.motorUnitPotentials.polyphasia > 25) abnormalitiesPresent = true;
          if(record.motorUnitPotentials.duration < 8 && record.motorUnitPotentials.polyphasia > 15) abnormalitiesPresent = true;
      }
      const isNeuropathicRecord = 
        (record.spontaneousActivity.fibrillations || record.spontaneousActivity.positiveWaves) &&
        (record.motorUnitPotentials.duration > 12 || record.motorUnitPotentials.amplitude > 2000 || record.motorUnitPotentials.polyphasia > 20) && 
        (record.recruitmentPattern === 'reduced_incomplete' || record.recruitmentPattern === 'reduced_complete' || record.recruitmentPattern === 'discrete');
      const isMyopathicRecord = 
        (record.motorUnitPotentials.duration < 8 || (record.motorUnitPotentials.amplitude < 500 && record.motorUnitPotentials.amplitude !==0) ) && 
        (record.motorUnitPotentials.polyphasia > 15) &&
        record.recruitmentPattern === 'early';
      if (isNeuropathicRecord) hasNeuropathicSigns = true;
      if (isMyopathicRecord) hasMyopathicSigns = true;
    }
    if (hasNeuropathicSigns && hasMyopathicSigns) return 'mixed';
    if (hasNeuropathicSigns) return 'neuropathic';
    if (hasMyopathicSigns) return 'myopathic';
    if (abnormalitiesPresent) return 'undetermined';
    return 'normal';
  }

  private static determineEMGSeverity(emgRecords: EMGNerveRecord[]): EMGGlobalFindingsForReport['severity'] {
    if (!emgRecords || emgRecords.length === 0) return 'undetermined';
    let maxIndividualSeverityScore = 0;
    let affectedRecordsCount = 0;
    for (const record of emgRecords) {
      let currentScore = 0;
      let isAffected = false;
      if (record.insertionalActivity === 'increased' || record.insertionalActivity === 'absent') { currentScore += 2; isAffected = true; }
      else if (record.insertionalActivity === 'decreased') { currentScore += 1; isAffected = true; }
      if (record.spontaneousActivity.fibrillations) { currentScore += 2; isAffected = true; }
      if (record.spontaneousActivity.positiveWaves) { currentScore += 2; isAffected = true; }
      if (record.spontaneousActivity.fasciculations && (record.spontaneousActivity.fibrillations || record.spontaneousActivity.positiveWaves)) currentScore += 1;
      if (record.motorUnitPotentials.polyphasia > 30) { currentScore += 1; isAffected = true; }
      if ((record.motorUnitPotentials.duration > 15 && record.motorUnitPotentials.duration !==0) || (record.motorUnitPotentials.duration < 5 && record.motorUnitPotentials.duration !==0)) { currentScore +=1; isAffected = true; }
      if ((record.motorUnitPotentials.amplitude < 100 && record.motorUnitPotentials.amplitude !==0) || (record.motorUnitPotentials.amplitude > 5000 && record.motorUnitPotentials.amplitude !==0) ) { currentScore +=1; isAffected = true; }
      if (record.recruitmentPattern === 'reduced_complete' || record.recruitmentPattern === 'discrete') { currentScore +=3; isAffected = true; }
      else if (record.recruitmentPattern === 'reduced_incomplete' || record.recruitmentPattern === 'early') { currentScore +=1.5; isAffected = true; }
      if (isAffected) affectedRecordsCount++;
      if (currentScore > maxIndividualSeverityScore) maxIndividualSeverityScore = currentScore;
    }
    if (affectedRecordsCount === 0 && emgRecords.length > 0) return 'undetermined';
    if (maxIndividualSeverityScore >= 7 || (maxIndividualSeverityScore >=4 && affectedRecordsCount >=3) ) return 'severe'; 
    if (maxIndividualSeverityScore >= 4 || (maxIndividualSeverityScore >=2 && affectedRecordsCount >=2) ) return 'moderate'; 
    if (maxIndividualSeverityScore > 0 || affectedRecordsCount > 0) return 'mild';
    return 'undetermined';
  }

  private static determineEMGChronicity(emgRecords: EMGNerveRecord[]): EMGGlobalFindingsForReport['chronicity'] {
    if (!emgRecords || emgRecords.length === 0) return 'undetermined';
    let hasChronicSigns = false;
    let hasAcuteOrSubacuteSigns = false;
    for (const record of emgRecords) {
      if (record.spontaneousActivity.fibrillations || record.spontaneousActivity.positiveWaves) {
        hasAcuteOrSubacuteSigns = true;
      }
      if ((record.motorUnitPotentials.duration > 15 && record.motorUnitPotentials.amplitude > 2000 && record.motorUnitPotentials.polyphasia > 25) || 
          (record.motorUnitPotentials.duration > 12 && record.recruitmentPattern === 'reduced_complete')) { 
        hasChronicSigns = true;
      }
    }
    if (hasChronicSigns && hasAcuteOrSubacuteSigns) return 'subacute';
    if (hasChronicSigns) return 'chronic';
    if (hasAcuteOrSubacuteSigns) return 'acute';
    const anyOtherAbnormality = emgRecords.some(r => (r.insertionalActivity !== 'normal' && r.insertionalActivity !== '') || (r.recruitmentPattern !== 'normal' && r.recruitmentPattern !== ''));
    if (anyOtherAbnormality) return 'undetermined'; 
    return 'undetermined';
  }
  
  private static determineEMGDistribution(emgRecords: EMGNerveRecord[]): EMGGlobalFindingsForReport['distribution'] {
    if (!emgRecords || emgRecords.length === 0) return 'undetermined';
    const affectedMuscles = emgRecords.filter(record => {
        return (record.insertionalActivity !== 'normal' && record.insertionalActivity !== '') ||
               record.spontaneousActivity.fibrillations ||
               record.spontaneousActivity.positiveWaves ||
               (record.motorUnitPotentials.duration !== 0 && (record.motorUnitPotentials.duration < 5 || record.motorUnitPotentials.duration > 15)) ||
               (record.motorUnitPotentials.amplitude !== 0 && (record.motorUnitPotentials.amplitude < 100 || record.motorUnitPotentials.amplitude > 5000)) ||
               (record.motorUnitPotentials.polyphasia !== 0 && record.motorUnitPotentials.polyphasia > 20) ||
               (record.recruitmentPattern !== 'normal' && record.recruitmentPattern !== '');
    });
    const affectedMusclesCount = affectedMuscles.length;
    if (affectedMusclesCount === 0) return 'undetermined'; 
    if (affectedMusclesCount === 1) return 'focal';
    const sides = new Set(affectedMuscles.map(m => m.side));
    const uniqueMuscles = new Set(affectedMuscles.map(m => m.muscleOrNerveName));
    if (uniqueMuscles.size > 3 || (sides.size > 1 && uniqueMuscles.size > 1)) return 'generalized';
    if (affectedMusclesCount > 1) return 'multifocal';
    return 'focal';
  }

  private static determineNCSPattern(ncsResults: NCSTestResult[]): NCSGlobalFindingsForReport['overallPattern'] {
    if (!ncsResults || ncsResults.length === 0) return 'undetermined';
    const abnormalResults = ncsResults.filter(r => r.status && r.status.toLowerCase() === 'abnormal');
    if (abnormalResults.length === 0) return 'normal';
    const hasAxonal = abnormalResults.some(r => r.findings?.some(f => f.toLowerCase().includes('amplitude')));
    const hasDemyelinating = abnormalResults.some(r => 
      r.findings?.some(f => f.toLowerCase().includes('velocity') || f.toLowerCase().includes('latency') || f.toLowerCase().includes('conduction block') || f.toLowerCase().includes('temporal dispersion'))
    );
    if (hasAxonal && hasDemyelinating) return 'mixed';
    if (hasAxonal) return 'axonal';
    if (hasDemyelinating) return 'demyelinating';
    return 'undetermined';
  }

  private static determineNCSDistribution(ncsResults: NCSTestResult[]): NCSGlobalFindingsForReport['distribution'] {
    if (!ncsResults || ncsResults.length === 0) return 'undetermined';
    const abnormalResults = ncsResults.filter(r => r.status && r.status.toLowerCase() === 'abnormal');
    if (abnormalResults.length === 0) return 'undetermined';
    if (abnormalResults.length === 1) return 'focal';
    const uniqueNerves = new Set(abnormalResults.map(r => r.nerve?.split(' ')[0]));
    if (uniqueNerves.size > 2 || (uniqueNerves.size > 1 && abnormalResults.length > 2)) return 'generalized';
    if (abnormalResults.length > 1) return 'multifocal'; 
    return 'focal';
  }

  private static determineNCSSeverity(ncsResults: NCSTestResult[]): NCSGlobalFindingsForReport['severity'] {
    if (!ncsResults || ncsResults.length === 0) return 'undetermined';
    const abnormalResults = ncsResults.filter(r => r.status && r.status.toLowerCase() === 'abnormal');
    const totalExams = ncsResults.length;
    if (totalExams === 0) return 'undetermined'; 
    if (abnormalResults.length === 0) return 'mild';
    const abnormalPercentage = (abnormalResults.length / totalExams) * 100;
    if (abnormalPercentage >= 66) return 'severe';
    if (abnormalPercentage >= 33) return 'moderate';
    return 'mild';
  }

  private static performComprehensiveAnalysis(
    analyzedClinicalSymptoms: SymptomsDataForReport,
    emgData?: EMGNerveRecord[] | 'skipped' | null, 
    ncsResults?: NCSTestResult[],
    specialStudies?: SpecialStudyData
  ): AnalysisDataForReport {
    return {
      symptomPatternScore: this.calculateSymptomPatternScores(analyzedClinicalSymptoms),
      electrophysiologicalPatterns: this.identifyElectrophysiologicalPatterns(emgData, ncsResults, specialStudies),
      combinedDiagnosticScore: this.calculateDiagnosticScores(analyzedClinicalSymptoms, emgData, ncsResults, specialStudies),
      riskFactors: this.identifyRiskFactors(analyzedClinicalSymptoms),
      redFlags: this.identifyRedFlags(analyzedClinicalSymptoms, emgData, ncsResults, specialStudies)
    };
  }

  private static calculateSymptomPatternScores(analyzedSymptoms: SymptomsDataForReport): SymptomPatternScoreForReport {
    const getScore = (symptoms: SymptomSummaryForReport[], keywords: string[], scores: number[]): number => {
        let totalScore = 0;
        keywords.forEach((keyword, index) => {
            if (symptoms.find(s => s.name.toLowerCase().includes(keyword.toLowerCase()) && s.present)) {
                totalScore += scores[index];
            }
        });
        return Math.min(totalScore, 10);
    };
    return {
      neuropathicScore: getScore(analyzedSymptoms.sensory.symptoms, ['entumecimiento', 'hormigueo', 'ardor', 'dolor neuropático'], [2,2,1,2]) + 
                        getScore(analyzedSymptoms.motor.symptoms, ['debilidad distal', 'atrofia'],[2,1]) + 
                        getScore(analyzedSymptoms.functional.symptoms, ['dificultad para abotonar', 'tropiezos frecuentes'],[1,1]),
      myopathicScore: getScore(analyzedSymptoms.motor.symptoms, ['debilidad proximal', 'fatiga muscular', 'dolor muscular (mialgia)', 'calambres musculares', 'rigidez muscular'], [3,2,1,1,1]),
      radiculopathicScore: getScore(analyzedSymptoms.sensory.symptoms, ['dolor irradiado', 'parestesias en dermatoma'], [3,2]) + 
                           getScore(analyzedSymptoms.motor.symptoms, ['debilidad en miotoma'], [3]),
      plexopathicScore: getScore(analyzedSymptoms.motor.symptoms, ['debilidad multifocal en una extremidad'], [3]) + 
                        getScore(analyzedSymptoms.sensory.symptoms, ['pérdida sensorial multifocal en una extremidad'], [2]),
      systemicScore: getScore(analyzedSymptoms.constitutional.symptoms, ['pérdida de peso inexplicable', 'fiebre persistente', 'fatiga extrema generalizada'], [2,2,1])
    };
  }

  private static identifyElectrophysiologicalPatterns(
    emgData?: EMGNerveRecord[] | 'skipped' | null,
    ncsResults?: NCSTestResult[]
  ): ElectrophysiologicalPatternForReport[] {
    const patterns: ElectrophysiologicalPatternForReport[] = [];
    let emgOverallPattern: EMGGlobalFindingsForReport['overallPattern'] = 'undetermined';

    if (emgData && emgData !== 'skipped' && emgData.length > 0) {
        emgOverallPattern = this.determineEMGPattern(emgData);
    } else if (emgData === 'skipped') {
        // No pattern if skipped
    }

    if (emgOverallPattern !== 'normal' && emgOverallPattern !== 'undetermined') {
        patterns.push({
            patternId: `emg_${emgOverallPattern}`,
            patternName: `Patrón EMG ${emgOverallPattern}`,
            confidence: 0.7,
            supportingEvidence: [`Hallazgos EMG consistentes con patrón ${emgOverallPattern}`],
            contradictingEvidence: []
        });
    }
    
    if (ncsResults && ncsResults.length > 0) {
        const ncsOverallPattern = this.determineNCSPattern(ncsResults);
        if (ncsOverallPattern !== 'normal' && ncsOverallPattern !== 'undetermined') {
             patterns.push({
                patternId: `ncs_${ncsOverallPattern}`,
                patternName: `Patrón NCS ${ncsOverallPattern}`,
                confidence: 0.7,
                supportingEvidence: [`Hallazgos NCS consistentes con patrón ${ncsOverallPattern}`],
                contradictingEvidence: []
            });
        }
    }
    return patterns;
  }

  private static calculateDiagnosticScores(
    analyzedSymptoms: SymptomsDataForReport,
    emgData?: EMGNerveRecord[] | 'skipped' | null,
    ncsResults?: NCSTestResult[]
  ): DiagnosticScoreForReport[] {
    return [];
  }

  private static identifyRiskFactors(analyzedSymptoms: SymptomsDataForReport): RiskFactorForReport[] {
    const riskFactors: RiskFactorForReport[] = [];
    if(analyzedSymptoms.constitutional.severity === 'severe' || analyzedSymptoms.constitutional.symptoms.some(s => s.name.toLowerCase().includes('pérdida de peso inexplicable') && s.present)){
        riskFactors.push({
            factor: "Severe constitutional symptoms or unexplained weight loss",
            present: true,
            weight: 2,
            description: "May indicate underlying systemic illness, malignancy, or significant catabolic state."
        });
    }
    return riskFactors;
  }

  private static identifyRedFlags(
    analyzedSymptoms: SymptomsDataForReport,
    emgData?: EMGNerveRecord[] | 'skipped' | null,
    ncsResults?: NCSTestResult[]
  ): RedFlagForReport[] {
    const redFlags: RedFlagForReport[] = [];
    const motorSymptoms = analyzedSymptoms.motor.symptoms;
    const motorWeaknessSymptom = motorSymptoms.find(s => s.name.toLowerCase().includes('debilidad'));
    if (motorWeaknessSymptom?.present && motorWeaknessSymptom.progression === 'worsening') {
      redFlags.push({
        flag: 'Rapidly progressive muscle weakness',
        present: true,
        urgency: 'high',
        recommendation: 'Urgent neurological evaluation required'
      });
    }
    if (emgData && emgData !== 'skipped' && emgData.length > 0) {
        const severeDenervationSigns = emgData.some(r => 
            (r.spontaneousActivity.fibrillations || r.spontaneousActivity.positiveWaves) &&
            (r.recruitmentPattern === 'reduced_complete' || r.recruitmentPattern === 'discrete')
        );
        const emgDistribution = this.determineEMGDistribution(emgData);
        if (severeDenervationSigns && (emgDistribution === 'generalized' || emgData.filter(r => (r.spontaneousActivity.fibrillations || r.spontaneousActivity.positiveWaves)).length > 2) ) { 
             redFlags.push({
                flag: 'Widespread or severe active denervation on EMG',
                present: true,
                urgency: 'urgent',
                recommendation: 'Urgent neurological eval for possible MND, severe polyradiculoneuropathy, or critical illness neuromyopathy.'
            });
        }
    }
    if (ncsResults) {
        const ncsPattern = this.determineNCSPattern(ncsResults);
        const ncsSeverity = this.determineNCSSeverity(ncsResults);
        const ncsDistribution = this.determineNCSDistribution(ncsResults);
        if (ncsPattern === 'demyelinating' && ncsSeverity === 'severe' && ncsDistribution === 'generalized') {
            redFlags.push({
                flag: 'Severe generalized demyelinating neuropathy on NCS',
                present: true,
                urgency: 'urgent',
                recommendation: 'Urgent evaluation for GBS, CIDP, or other acute/severe demyelinating conditions.'
            });
        }
        if (ncsPattern === 'axonal' && ncsSeverity === 'severe' && ncsDistribution === 'generalized') {
             redFlags.push({
                flag: 'Severe generalized axonal neuropathy on NCS',
                present: true,
                urgency: 'high',
                recommendation: 'Evaluation for severe systemic, toxic, or metabolic neuropathies.'
            });
        }
    }
    const dyspnea = motorSymptoms.find(s => s.name.toLowerCase().includes('disnea') || s.name.toLowerCase().includes('dificultad respiratoria'));
    if (dyspnea?.present && dyspnea.severity === 'severe') {
        redFlags.push({
            flag: 'Severe respiratory distress/dyspnea',
            present: true,
            urgency: 'urgent',
            recommendation: 'Immediate medical attention, assess respiratory function.'
        });
    }
    return redFlags;
  }

  private static generateConclusion(
    analyzedSymptoms: SymptomsDataForReport,
    emgData?: EMGNerveRecord[] | 'skipped' | null,
    ncsResults?: NCSTestResult[]
  ): ConclusionDataForReport {
    let primaryDiagnosis = 'Hallazgos no concluyentes. Se requiere correlación clínica.';
    let confidence = 0.3;
    const recommendations: string[] = ['Correlacionar con la historia clínica y examen físico detallado.'];
    let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'low';

    const electroPatterns = this.identifyElectrophysiologicalPatterns(emgData, ncsResults);
    const symptomScores = this.calculateSymptomPatternScores(analyzedSymptoms);
    const identifiedRedFlags = this.identifyRedFlags(analyzedSymptoms, emgData, ncsResults);

    if (identifiedRedFlags.some(flag => flag.urgency === 'urgent')) {
        urgency = 'urgent';
        const urgentFlag = identifiedRedFlags.find(f=>f.urgency === 'urgent');
        primaryDiagnosis = `Urgente: ${urgentFlag?.flag || 'Condición requiere atención inmediata.'}`;
        confidence = 0.85;
        recommendations.push(urgentFlag?.recommendation || 'Consulta especialista inmediata.');
    }
    else if (identifiedRedFlags.some(flag => flag.urgency === 'high')) {
        urgency = 'high';
        const highFlag = identifiedRedFlags.find(f=>f.urgency === 'high');
        primaryDiagnosis = `Alta Prioridad: ${highFlag?.flag || 'Condición requiere atención prioritaria.'}`;
        confidence = 0.75;
        recommendations.push(highFlag?.recommendation || 'Consulta especialista prioritaria.');
    }
    else if (electroPatterns.length > 0) {
        const mainPattern = electroPatterns.sort((a,b) => b.confidence - a.confidence)[0];
        primaryDiagnosis = `Hallazgos electrofisiológicos sugieren ${mainPattern.patternName.toLowerCase()}.`;
        confidence = mainPattern.confidence;
        let dominantSymptomPattern = '';
        let maxSymptomScore = 0;
        if(symptomScores.neuropathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.neuropathicScore; dominantSymptomPattern = 'neuropático';}
        if(symptomScores.radiculopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.radiculopathicScore; dominantSymptomPattern = 'radiculopático'; }
        if(symptomScores.myopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.myopathicScore; dominantSymptomPattern = 'miopático'; }
        if(symptomScores.plexopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.plexopathicScore; dominantSymptomPattern = 'plexopático'; }

        if (maxSymptomScore > 4 && mainPattern.patternName.toLowerCase().includes(dominantSymptomPattern.substring(0,3))) {
            confidence = Math.min(0.9, confidence + 0.15);
            recommendations.push(`Síntomas consistentes con ${dominantSymptomPattern} (${maxSymptomScore}/10).`);
        } else if (maxSymptomScore > 4) {
            recommendations.push(`Considerar síntomas ${dominantSymptomPattern} (${maxSymptomScore}/10) en el diferencial.`);
        }

        if (mainPattern.patternId.includes('neuropathic') || mainPattern.patternId.includes('axonal') || mainPattern.patternId.includes('demyelinating')) {
            recommendations.push('Investigar causas de neuropatía.');
        } else if (mainPattern.patternId.includes('myopathic')) {
            recommendations.push('Investigar causas de miopatía (e.g., CK, biopsia si es necesario).');
        }
        urgency = confidence > 0.7 ? 'high' : (confidence > 0.5 ? 'medium' : 'low');
    } else { 
        let maxSymptomScore = 0;
        let dominantSymptomPattern = '';
        if (symptomScores.neuropathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.neuropathicScore; dominantSymptomPattern = 'neuropático';}
        if (symptomScores.radiculopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.radiculopathicScore; dominantSymptomPattern = 'radiculopático';}
        if (symptomScores.myopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.myopathicScore; dominantSymptomPattern = 'miopático';}
        if (symptomScores.plexopathicScore > maxSymptomScore) { maxSymptomScore = symptomScores.plexopathicScore; dominantSymptomPattern = 'plexopático';}

        if (maxSymptomScore > 5) { 
            primaryDiagnosis = `Síntomas predominantemente sugieren un proceso ${dominantSymptomPattern} (${maxSymptomScore}/10).`;
            confidence = Math.max(0.4, maxSymptomScore / 15); 
            urgency = 'medium';
            recommendations.push(`Considerar estudios electrofisiológicos dirigidos para confirmar patrón ${dominantSymptomPattern}.`);
        }
    }
    
    if (emgData && emgData !== 'skipped' && this.determineEMGPattern(emgData) === 'myopathic') {
        recommendations.push('Considerar niveles de CK.');
    }
    if (emgData && emgData !== 'skipped' && this.determineEMGDistribution(emgData) === 'generalized' && 
        ncsResults && (this.determineNCSPattern(ncsResults) !=='normal' && this.determineNCSPattern(ncsResults) !=='undetermined')) {
        recommendations.push('Descartar causas sistémicas de polineuropatía/polineuromiopatía.');
    }

    return {
      primaryDiagnosis,
      confidence: parseFloat(confidence.toFixed(2)),
      differentialDiagnoses: [],
      recommendations: Array.from(new Set(recommendations)),
      urgency
    };
  }
}

export type { SymptomPatternScoreForReport as SymptomPatternScore, DiagnosticScoreForReport as DiagnosticScore }; 