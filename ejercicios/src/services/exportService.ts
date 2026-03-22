import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';

export class ExportService {
  static exportToCSV(data: ClinicalEvaluationFormData): string {
    const rows = [
      ['Reporte de Electromiografía'],
      [''],
      ['Datos del Paciente'],
      ['Nombre', `${data.patientData.firstName} ${data.patientData.lastName}`],
      ['ID', data.patientData.id],
      ['Edad', data.patientData.age.toString()],
      [''],
      ['Resultados'],
      ['Nervios Evaluados', Object.keys(data.ncsData.motor).join(', ')],
      ['Músculos Evaluados', Object.keys(data.emgData).join(', ')],
      [''],
      ['Interpretación'],
      ['Patrón', data.interpretation.pattern],
      ['Severidad', data.interpretation.severity],
      ['Cronicidad', data.interpretation.chronicity],
      ['Diagnóstico', data.interpretation.diagnosis],
      [''],
      ['Recomendaciones'],
      ['Estudios Adicionales', data.recommendations.additionalStudies.join(', ')],
      ['Seguimiento', data.recommendations.followUp],
      ['Tratamiento', data.recommendations.treatment]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  static exportToPDF(data: ClinicalEvaluationFormData): void {
    // Esta función se implementará más adelante usando una librería como jsPDF
    console.log('Exportando a PDF:', data);
  }

  static exportToRTF(data: ClinicalEvaluationFormData): string {
    const rtfHeader = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\n';
    const rtfFooter = '}';
    
    const content = [
      '\\f0\\fs24\\b Reporte de Electromiografía\\b0\\par\\par',
      '\\b Datos del Paciente\\b0\\par',
      `Nombre: ${data.patientData.firstName} ${data.patientData.lastName}\\par`,
      `ID: ${data.patientData.id}\\par`,
      `Edad: ${data.patientData.age}\\par\\par`,
      '\\b Resultados\\b0\\par',
      `Nervios Evaluados: ${Object.keys(data.ncsData.motor).join(', ')}\\par`,
      `Músculos Evaluados: ${Object.keys(data.emgData).join(', ')}\\par\\par`,
      '\\b Interpretación\\b0\\par',
      `Patrón: ${data.interpretation.pattern}\\par`,
      `Severidad: ${data.interpretation.severity}\\par`,
      `Cronicidad: ${data.interpretation.chronicity}\\par`,
      `Diagnóstico: ${data.interpretation.diagnosis}\\par\\par`,
      '\\b Recomendaciones\\b0\\par',
      `Estudios Adicionales: ${data.recommendations.additionalStudies.join(', ')}\\par`,
      `Seguimiento: ${data.recommendations.followUp}\\par`,
      `Tratamiento: ${data.recommendations.treatment}\\par`
    ].join('');

    return rtfHeader + content + rtfFooter;
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
} 