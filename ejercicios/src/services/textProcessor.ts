import { PatientDemographics, NerveConductionTest, MedicalReport } from '../types/medical';

export class TextProcessor {
  private static instance: TextProcessor;

  private constructor() {}

  public static getInstance(): TextProcessor {
    if (!TextProcessor.instance) {
      TextProcessor.instance = new TextProcessor();
    }
    return TextProcessor.instance;
  }

  private extractPatientData(text: string): PatientDemographics {
    // Extract patient demographics using regex patterns
    const ageMatch = text.match(/Edad:\s*(\d+)/i);
    const genderMatch = text.match(/Género:\s*([MF])/i);
    const heightMatch = text.match(/Estatura:\s*(\d+(?:\.\d+)?)\s*cm/i);
    const weightMatch = text.match(/Peso:\s*(\d+(?:\.\d+)?)\s*kg/i);

    const age = ageMatch ? parseInt(ageMatch[1]) : 0;
    const gender = genderMatch ? (genderMatch[1] as 'M' | 'F') : 'O';
    const height = heightMatch ? parseFloat(heightMatch[1]) : 0;
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

    return {
      id: this.generatePatientId(),
      age,
      gender,
      height,
      weight,
      bmi: weight && height ? weight / ((height / 100) ** 2) : 0
    };
  }

  private extractNerveTests(text: string): NerveConductionTest[] {
    const tests: NerveConductionTest[] = [];
    const testSections = text.split(/(?=Nervio:)/i);

    for (const section of testSections) {
      if (!section.trim()) continue;

      const nerveMatch = section.match(/Nervio:\s*([^\n]+)/i);
      const sideMatch = section.match(/Lado:\s*([^\n]+)/i);
      const latencyMatch = section.match(/Latencia:\s*(\d+(?:\.\d+)?)\s*ms/i);
      const amplitudeMatch = section.match(/Amplitud:\s*(\d+(?:\.\d+)?)\s*mV/i);
      const velocityMatch = section.match(/Velocidad:\s*(\d+(?:\.\d+)?)\s*m\/s/i);
      const distanceMatch = section.match(/Distancia:\s*(\d+(?:\.\d+)?)\s*cm/i);
      const tempMatch = section.match(/Temperatura:\s*(\d+(?:\.\d+)?)\s*°C/i);

      if (nerveMatch) {
        tests.push({
          testId: this.generateTestId(),
          date: new Date().toISOString(),
          nerve: nerveMatch[1].trim(),
          side: sideMatch ? (sideMatch[1].trim().toLowerCase() as 'left' | 'right' | 'bilateral') : 'bilateral',
          latency: latencyMatch ? parseFloat(latencyMatch[1]) : 0,
          amplitude: amplitudeMatch ? parseFloat(amplitudeMatch[1]) : 0,
          velocity: velocityMatch ? parseFloat(velocityMatch[1]) : 0,
          distance: distanceMatch ? parseFloat(distanceMatch[1]) : 0,
          temperature: tempMatch ? parseFloat(tempMatch[1]) : 0,
          referenceRange: {
            min: 0,
            max: 0
          }
        });
      }
    }

    return tests;
  }

  private extractDiagnosis(text: string): string {
    const diagnosisMatch = text.match(/Diagnóstico:\s*([^\n]+)/i);
    return diagnosisMatch ? diagnosisMatch[1].trim() : '';
  }

  private extractNotes(text: string): string {
    const notesMatch = text.match(/Notas:\s*([\s\S]+?)(?=\n\n|$)/i);
    return notesMatch ? notesMatch[1].trim() : '';
  }

  private generatePatientId(): string {
    return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestId(): string {
    return `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public processText(text: string): MedicalReport {
    const patient = this.extractPatientData(text);
    const tests = this.extractNerveTests(text);
    const diagnosis = this.extractDiagnosis(text);
    const notes = this.extractNotes(text);

    return {
      patient,
      tests,
      diagnosis,
      notes,
      metadata: {
        originalFormat: 'text',
        conversionDate: new Date().toISOString(),
        confidenceScore: this.calculateConfidenceScore(text, tests),
        processingErrors: []
      }
    };
  }

  private calculateConfidenceScore(text: string, tests: NerveConductionTest[]): number {
    // Simple confidence score calculation based on data extraction
    const totalFields = 7; // Number of fields we try to extract
    const extractedFields = tests.reduce((count, test) => {
      return count + Object.values(test).filter(value => value !== 0 && value !== '').length;
    }, 0);

    return Math.min(1, extractedFields / (totalFields * tests.length));
  }
} 