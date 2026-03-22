import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ClipboardList, 
  Activity, 
  Brain, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Printer,
  FileJson,
  FileText as FileTextIcon,
  FileUp,
  XCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ClinicalSymptomsForm, { ClinicalSymptomsData } from './ClinicalSymptomsForm';
import NeuroConductionForm from './NeuroConductionForm';
import EMGNeedleAnalysis, { EMGNerveRecord } from './EMGNeedleAnalysis';
import { JsonReportGenerator, ClinicalReport, EMGMuscleResult, NCSTestResult as ReportNCSTestResult } from '../services/jsonReportGenerator';
import { DiagnosticPatternAnalyzer, DiagnosticPattern, DiagnosticRecommendation } from '../services/diagnosticPatternAnalyzer';
import { Patient } from '../types/patient';
import { NCSTestResult } from '../types/ncs';

interface CompleteClinicalWorkflowProps {
  patient: Patient;
  initialFormData?: any; // 🔥 DATOS MAPEADOS DESDE ARCHIVO
  onComplete?: (result: WorkflowResult) => void;
  onBack?: () => void;
}

interface WorkflowResult {
  clinicalReport: ClinicalReport;
  diagnosticPatterns: DiagnosticPattern[];
  recommendations: DiagnosticRecommendation[];
  jsonReport: string;
}

type EmgStatus = EMGNerveRecord[] | 'skipped' | null;

type WorkflowStep = 'symptoms' | 'ncs' | 'emg' | 'analysis' | 'report';

const FormattedReportDisplay: React.FC<{ report: ClinicalReport, patient: Patient }> = ({ report, patient }) => {

  const renderNCSValue = (label: string, value?: string | number, unit?: string, isAbnormal?: boolean) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <p className="text-sm"><strong className="text-gray-400">{label}:</strong> <span className={isAbnormal ? 'text-red-400 font-semibold' : 'text-gray-200'}>{value}</span>{unit ? ` ${unit}` : ''}</p>
    );
  };

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-gray-700 max-w-none overflow-auto text-gray-300">
      <h2 className="text-2xl font-bold text-gray-100 border-b pb-2 mb-4 border-gray-600">Reporte Clínico Detallado</h2>
      
      <section className="mb-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Información del Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <p><strong>ID:</strong> {patient.id}</p>
            <p><strong>Nombre:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Fecha de Nacimiento:</strong> {patient.dateOfBirth}</p>
            <p><strong>Edad:</strong> {report.patient.demographics.age} años</p>
            <p><strong>Sexo:</strong> {patient.sex}</p>
            <p className="md:col-span-2"><strong>Motivo de Consulta:</strong> {report.patient.consultReason}</p>
        </div>
      </section>

      {report.clinicalSymptoms && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Resumen de Síntomas</h3>
          {Object.entries(report.clinicalSymptoms).map(([key, category]) => (
            category.present && (
                <div key={key} className="mb-2 text-sm">
                    <strong className="capitalize text-gray-100">{key}:</strong> {category.count} {category.count === 1 ? 'síntoma' : 'síntomas'} (Severidad General: {category.severity}).
                    <ul className="list-disc pl-6 mt-1 text-gray-400">
                        {category.symptoms.filter(s => s.present).map(s => <li key={s.name} className="text-xs">{s.name} ({s.severity}) - {s.locations?.join(', ') || 'N/A'}</li>)}
                    </ul>
                </div>
            )
          ))}
        </section>
      )}

      {report.electrophysiologicalData.ncs && report.electrophysiologicalData.ncs.results.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Hallazgos de Neuroconducción (NCS)</h3>
          <div className="space-y-3">
            {report.electrophysiologicalData.ncs.results.map((ncs: ReportNCSTestResult, index) => (
              <div key={index} className="p-3 border border-gray-600 rounded bg-gray-700/40">
                <p className="font-semibold text-gray-100">{ncs.nerve} ({ncs.side}) - Estado: <span className={`${ncs.status && ncs.status.toLowerCase() === 'abnormal' ? 'text-red-400 font-bold' : 'text-green-400'}`}>{ncs.status || 'N/A'}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
                  {renderNCSValue('Latencia', ncs.latency, 'ms', ncs.abnormalParameters?.includes('latency'))}
                  {renderNCSValue('Amplitud', ncs.amplitude, ncs.amplitudeUnit, ncs.abnormalParameters?.includes('amplitude'))}
                  {renderNCSValue('Velocidad', ncs.velocity, 'm/s', ncs.abnormalParameters?.includes('velocity'))}
                  {ncs.fWave !== undefined && renderNCSValue('Onda F', ncs.fWave, 'ms', ncs.abnormalParameters?.includes('fWave'))}
                </div>
                {ncs.findings && ncs.findings.length > 0 && <p className="text-xs text-gray-400 mt-1">Interpretación: {ncs.findings.join('. ')}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {report.electrophysiologicalData.emg ? (
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Hallazgos de Electromiografía (EMG)</h3>
          {report.electrophysiologicalData.emg.status === 'skipped' ? (
            <p className="italic text-gray-400 p-3 bg-gray-700/30 rounded-md">Estudio de Electromiografía (EMG) no realizado.</p>
          ) : report.electrophysiologicalData.emg.status === 'nodata' || !report.electrophysiologicalData.emg.muscles || report.electrophysiologicalData.emg.muscles.length === 0 ? (
            <p className="italic text-gray-400 p-3 bg-gray-700/30 rounded-md">No se registraron datos de EMG o el estudio no fue completado.</p>
          ) : (
            <div className="space-y-3">
            {report.electrophysiologicalData.emg.muscles.map((muscle: EMGMuscleResult, index) => (
              <div key={index} className="p-3 border border-gray-600 rounded bg-gray-700/40">
                <p className="font-semibold text-gray-100">{muscle.muscleName} ({muscle.side})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                    <p><strong className="text-gray-400">Act. Inserción:</strong> <span className={muscle.insertionalActivity !== 'normal' && muscle.insertionalActivity !=='no especificada' ? 'text-yellow-400' : 'text-gray-200' }>{muscle.insertionalActivity}</span></p>
                    <p><strong className="text-gray-400">Act. Espontánea:</strong> <span className={muscle.spontaneousActivitySummary !== 'Ausente' && muscle.spontaneousActivitySummary !=='Normal' ? 'text-yellow-400' : 'text-gray-200' }>{muscle.spontaneousActivitySummary}</span></p>
                    <div><strong className="text-gray-400">PUMs:</strong>
                        <ul className="list-disc list-inside pl-4 text-gray-300">
                            <li>Amplitud: {muscle.mupAmplitude}µV</li>
                            <li>Duración: {muscle.mupDuration}ms</li>
                            <li>Polifasia: {muscle.mupPolyphasia}%</li>
                        </ul>
                    </div>
                    <p><strong className="text-gray-400">Reclutamiento:</strong> <span className={muscle.recruitmentPattern !== 'normal' && muscle.recruitmentPattern !=='no especificado' ? 'text-yellow-400' : 'text-gray-200' }>{muscle.recruitmentPattern}</span></p>
                </div>
                {muscle.interpretationNotes && <p className="text-xs text-gray-500 mt-2">Notas Específicas: {muscle.interpretationNotes}</p>}
              </div>
            ))}
            </div>
          )}
           {report.electrophysiologicalData.emg.globalFindings && report.electrophysiologicalData.emg.status === 'performed' && (
            <div className="mt-4 p-3 bg-gray-700/20 rounded-md border border-gray-600/50 text-sm">
                <h4 className="font-medium text-gray-300 mb-1">Hallazgos Globales EMG:</h4>
                <p><strong className="text-gray-400">Patrón General:</strong> {report.electrophysiologicalData.emg.globalFindings.overallPattern}</p>
                <p><strong className="text-gray-400">Distribución:</strong> {report.electrophysiologicalData.emg.globalFindings.distribution}</p>
                <p><strong className="text-gray-400">Severidad:</strong> {report.electrophysiologicalData.emg.globalFindings.severity}</p>
                <p><strong className="text-gray-400">Cronicidad:</strong> {report.electrophysiologicalData.emg.globalFindings.chronicity}</p>
            </div>
            )}
        </section>
      ) : null}
      
      {report.analysis && (report.analysis.electrophysiologicalPatterns.length > 0 || report.analysis.riskFactors.length > 0 || report.analysis.redFlags.length >0 ) && (
         <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Análisis y Puntuaciones</h3>
           {report.analysis.electrophysiologicalPatterns.length > 0 && <div className="mb-2"><strong className="text-gray-400">Patrones Electrofisiológicos:</strong> {report.analysis.electrophysiologicalPatterns.map(p => p.patternName).join(', ')}</div>}
           {/* Could add SymptomPatternScore display here */}
           {report.analysis.redFlags.length > 0 && <div className="text-red-400"><strong className="text-red-300">Banderas Rojas:</strong> {report.analysis.redFlags.map(rf => rf.flag).join(', ')}</div>}
        </section>
      )}

      {report.conclusion && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-1">Conclusión</h3>
          <p><strong>Diagnóstico Principal:</strong> <span className="text-blue-300 font-semibold">{report.conclusion.primaryDiagnosis}</span></p>
          <p><strong>Confianza Diagnóstica:</strong> {report.conclusion.confidence * 100}%</p>
          <p><strong>Nivel de Urgencia:</strong> <span className={`${report.conclusion.urgency === 'urgent' ? 'text-red-400 font-bold' : report.conclusion.urgency === 'high' ? 'text-orange-400' : 'text-gray-300'}`}>{report.conclusion.urgency.toUpperCase()}</span></p>
          {report.conclusion.differentialDiagnoses && report.conclusion.differentialDiagnoses.length > 0 &&
            <p><strong className="text-gray-400">Diagnósticos Diferenciales:</strong> {report.conclusion.differentialDiagnoses.join(', ')}</p> }
          <h4 className="text-lg font-medium text-gray-300 mt-3 mb-1">Recomendaciones:</h4>
          <ul className="list-disc pl-5 text-gray-300 space-y-1 text-sm">
            {report.conclusion.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ul>
        </section>
      )}
      <hr className="border-gray-700 my-6"/>
      <p className="text-xs text-gray-500 text-center">Reporte generado el: {new Date(report.timestamp).toLocaleString()} por la versión {report.version} del sistema.</p>
    </div>
  );
};

const CompleteClinicalWorkflow: React.FC<CompleteClinicalWorkflowProps> = ({
  patient,
  initialFormData, // 🔥 DATOS MAPEADOS DESDE ARCHIVO
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('symptoms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 LOGGING DE DATOS INICIALES
  React.useEffect(() => {
    if (initialFormData) {
      console.log('🎯 CompleteClinicalWorkflow recibió datos iniciales:', {
        hasSymptoms: !!initialFormData.symptoms,
        symptomsSuccess: initialFormData.symptoms?.success,
        symptomsDataLength: initialFormData.symptoms?.data ? Object.keys(initialFormData.symptoms.data).length : 0,
        overallSuccess: initialFormData.overall?.success,
        totalLogs: initialFormData.overall?.logs?.length || 0,
        warnings: initialFormData.overall?.warnings?.length || 0,
        errors: initialFormData.overall?.errors?.length || 0
      });

      // Mostrar datos de síntomas mapeados
      if (initialFormData.symptoms?.data) {
        console.group('📋 Datos de síntomas mapeados');
        Object.entries(initialFormData.symptoms.data).forEach(([category, symptoms]) => {
          console.log(`${category}:`, symptoms);
        });
        console.groupEnd();
      }
    } else {
      console.log('⚠️ CompleteClinicalWorkflow NO recibió datos iniciales - modo manual');
    }
  }, [initialFormData]);

  const [symptomsData, setSymptomsData] = useState<ClinicalSymptomsData | null>(null);
  const [ncsResults, setNcsResults] = useState<NCSTestResult[]>([]);
  const [emgResults, setEmgResults] = useState<EmgStatus>(null);
  const [clinicalReport, setClinicalReport] = useState<ClinicalReport | null>(null);
  const [diagnosticPatterns, setDiagnosticPatterns] = useState<DiagnosticPattern[]>([]);
  const [recommendations, setRecommendations] = useState<DiagnosticRecommendation[]>([]);
  
  const reportContentRef = useRef<HTMLDivElement>(null);

  const stepTitles = {
    symptoms: 'Evaluación de Síntomas',
    ncs: 'Neuroconducciones',
    emg: 'Electromiografía',
    analysis: 'Análisis Diagnóstico',
    report: 'Reporte Final'
  };

  const stepIcons = {
    symptoms: ClipboardList,
    ncs: Activity,
    emg: Brain,
    analysis: AlertTriangle,
    report: FileText
  };

  const handleSymptomsComplete = (data: ClinicalSymptomsData) => {
    setSymptomsData(data);
    setCurrentStep('ncs');
  };

  const handleNCSComplete = (data: any) => {
    // Handle the new structure with NCS results and special studies
    if (data && typeof data === 'object' && 'ncsResults' in data) {
      setNcsResults(data.ncsResults || []);
      // Store special studies data (you may want to add this to state)
      console.log('Special studies data:', data.specialStudies);
    } else {
      // Fallback for old structure
      const ncsDataArray: NCSTestResult[] = Array.isArray(data) ? data : [data];
      setNcsResults(ncsDataArray);
    }
    setCurrentStep('emg');
  };

  const handleEMGComplete = (data: EMGNerveRecord[]) => {
    setEmgResults(data);
    if (symptomsData && ncsResults) {
        processCompleteData(symptomsData, ncsResults, data);
    }
  };

  const handleEMGNotPerformed = () => {
    setEmgResults('skipped');
    if (symptomsData && ncsResults) {
        processCompleteData(symptomsData, ncsResults, 'skipped');
    }
  };

  const processCompleteData = async (
    symptoms: ClinicalSymptomsData, 
    ncs: NCSTestResult[], 
    emg: EmgStatus
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Generando reporte JSON con EMG datos:', emg);
      const report = JsonReportGenerator.generateCompleteReport(
        patient,
        symptoms,
        emg,
        ncs
      );
      setClinicalReport(report);

      console.log('Analizando patrones diagnósticos...');
      const analysisResult = DiagnosticPatternAnalyzer.analyzeReport(report);
      setDiagnosticPatterns(analysisResult.patterns);
      setRecommendations(analysisResult.recommendations);

      setCurrentStep('analysis');

    } catch (err: any) {
      console.error('Error procesando datos:', err);
      setError(`Error al procesar los datos clínicos: ${err.message || 'Por favor, intente nuevamente.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalysisComplete = () => {
    setCurrentStep('report');
  };

  const handleWorkflowComplete = () => {
    if (onComplete && clinicalReport) {
      const result: WorkflowResult = {
        clinicalReport,
        diagnosticPatterns,
        recommendations,
        jsonReport: JsonReportGenerator.exportAsJsonString(clinicalReport)
      };
      onComplete(result);
    }
  };

  const downloadJsonReport = () => {
    if (clinicalReport) {
      JsonReportGenerator.downloadAsJsonFile(clinicalReport, `reporte-clinico-${patient.id}-${Date.now()}.json`);
    }
  };

  const generatePlainTextReport = (report: ClinicalReport): string => {
    if (!report) return "Reporte no disponible.";
    let content = `REPORTE CLÍNICO - ${new Date(report.timestamp).toLocaleString()}\n`;
    content += `Versión del Reporte: ${report.version}\n`;
    content += `==================================================\n`;
    content += `PACIENTE\n`;
    content += `--------------------------------------------------\n`;
    content += `ID: ${report.patient.id}\n`;
    content += `Nombre: ${patient.firstName} ${patient.lastName}\n`;
    content += `Edad: ${report.patient.demographics.age} años\n`;
    content += `Sexo: ${report.patient.demographics.sex}\n`;
    content += `Motivo Consulta: ${report.patient.consultReason}\n\n`;

    content += `SÍNTOMAS CLÍNICOS\n`;
    content += `--------------------------------------------------\n`;
    for (const key in report.clinicalSymptoms) {
        const category = report.clinicalSymptoms[key as keyof ClinicalReport['clinicalSymptoms']];
        content += `${key.toUpperCase()}: ${category.present ? 'Presente' : 'Ausente'} (Conteo: ${category.count}, Severidad General: ${category.severity})\n`;
        category.symptoms.forEach(symptom => {
            if(symptom.present) content += `  - ${symptom.name}: Severidad ${symptom.severity}, Duración ${symptom.duration}, Inicio ${symptom.onset}, Progresión ${symptom.progression}, Localización: ${symptom.locations.join(', ')}\n`;
        });
        content += `\n`;
    }

    if (report.electrophysiologicalData.ncs && report.electrophysiologicalData.ncs.results.length > 0) {
      content += `NEUROCONDUCCIONES (NCS)\n`;
      content += `--------------------------------------------------\n`;
      report.electrophysiologicalData.ncs.results.forEach(ncs => {
        content += `Nervio: ${ncs.nerve} (${ncs.side}) - Estado: ${ncs.status}\n`;
        if (ncs.latency) content += `  Latencia: ${ncs.latency}${ncs.latencyUnit || 'ms'} ${ncs.abnormalParameters?.includes('latency') ? '(Anormal)' : ''}\n`;
        if (ncs.amplitude) content += `  Amplitud: ${ncs.amplitude}${ncs.amplitudeUnit || 'µV'} ${ncs.abnormalParameters?.includes('amplitude') ? '(Anormal)' : ''}\n`;
        if (ncs.velocity) content += `  Velocidad: ${ncs.velocity}m/s ${ncs.abnormalParameters?.includes('velocity') ? '(Anormal)' : ''}\n`;
        if (ncs.fWave) content += `  Onda F: ${ncs.fWave}ms ${ncs.abnormalParameters?.includes('fWave') ? '(Anormal)' : ''}\n`;
        if (ncs.findings && ncs.findings.length > 0) content += `  Interpretación: ${ncs.findings.join('. ')}\n`;
        content += `\n`;
      });
    }

    if (report.electrophysiologicalData.emg) {
      content += `ELECTROMIOGRAFÍA (EMG)\n`;
      content += `--------------------------------------------------\n`;
      if (report.electrophysiologicalData.emg.status === 'skipped') {
        content += `Estudio de Electromiografía (EMG) no realizado.\n`;
      } else if (report.electrophysiologicalData.emg.status === 'nodata' || !report.electrophysiologicalData.emg.muscles || report.electrophysiologicalData.emg.muscles.length === 0) {
        content += `No se registraron datos de EMG o el estudio no fue completado.\n`;
      } else if (report.electrophysiologicalData.emg.muscles) {
        report.electrophysiologicalData.emg.muscles.forEach(muscle => {
          content += `Músculo: ${muscle.muscleName} (${muscle.side})\n`;
          content += `  Act. Inserción: ${muscle.insertionalActivity}\n`;
          content += `  Act. Espontánea: ${muscle.spontaneousActivitySummary}\n`;
          content += `  PUMs: Amplitud: ${muscle.mupAmplitude}µV, Duración: ${muscle.mupDuration}ms, Polifasia: ${muscle.mupPolyphasia}%\n`;
          content += `  Reclutamiento: ${muscle.recruitmentPattern}\n`;
          if (muscle.interpretationNotes) content += `  Notas: ${muscle.interpretationNotes}\n`;
          content += `\n`;
        });
      }
      content += `\n`;
    }
    
    if (report.analysis) {
        content += `ANÁLISIS Y PATRONES\\n`;
        content += `--------------------------------------------------\\n`;
        if(report.analysis.electrophysiologicalPatterns.length > 0){
            content += `Patrones Electrofisiológicos:\n`;
            report.analysis.electrophysiologicalPatterns.forEach(p => {
                content += `  - ${p.patternName} (Confianza: ${(p.confidence * 100).toFixed(0)}%)\n`;
            });
        }
        if(report.analysis.redFlags.length > 0){
            content += `Banderas Rojas:\n`;
            report.analysis.redFlags.forEach(rf => {
                content += `  - ${rf.flag} (Urgencia: ${rf.urgency})\n`;
            });
        }
        content += `\n`;
    }

    content += `CONCLUSIÓN\\n`;
    content += `--------------------------------------------------\\n`;
    content += `Diagnóstico Principal: ${report.conclusion.primaryDiagnosis}\\n`;
    content += `Confianza: ${(report.conclusion.confidence * 100).toFixed(0)}%\\n`;
    content += `Urgencia: ${report.conclusion.urgency.toUpperCase()}\\n`;
    content += `Recomendaciones:\\n`;
    report.conclusion.recommendations.forEach(rec => content += `  - ${rec}\\n`);
    content += `\\nReporte ID: ${report.reportId}\\n`;
    return content;
  };

  const handleExportToTXT = () => {
    if (!clinicalReport) return;
    const textContent = generatePlainTextReport(clinicalReport);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-clinico-${patient.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportToPDF = () => {
    if (!reportContentRef.current || !clinicalReport) {
      console.error("No hay contenido del reporte para exportar a PDF o el reporte no está disponible.");
      return;
    }
    html2canvas(reportContentRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#111827' // Dark background for canvas similar to bg-gray-900
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = pdf.internal.pageSize.getHeight(); // Not directly used for adding image parts
      const imgReportWidth = canvas.width;
      const imgReportHeight = canvas.height;
      const ratio = pdfWidth / imgReportWidth;
      const calculatedImgHeight = imgReportHeight * ratio;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedImgHeight);
      let heightLeft = calculatedImgHeight - pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedImgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`reporte-clinico-${patient.id}-${Date.now()}.pdf`);
    }).catch(err => {
        console.error("Error al generar PDF:", err);
        setError("Error al generar el PDF. Verifique la consola para más detalles.");
    });
  };

  const renderProgressBar = () => {
    const steps: WorkflowStep[] = ['symptoms', 'ncs', 'emg', 'analysis', 'report'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = stepIcons[step];
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-green-600 text-white' 
                    : isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium transition-colors duration-300 ${
                  isCurrent ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {stepTitles[step]}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-1 flex-1 rounded ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Procesando datos clínicos...</h3>
          <p className="text-gray-400 text-center">
            Generando reporte JSON y analizando patrones diagnósticos
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case 'symptoms':
        // 🔥 PASAR DATOS INICIALES AL FORMULARIO DE SÍNTOMAS
        const initialSymptomsData = initialFormData?.symptoms?.data || undefined;
        
        console.log('📋 Pasando datos iniciales a ClinicalSymptomsForm:', {
          hasInitialData: !!initialSymptomsData,
          dataKeys: initialSymptomsData ? Object.keys(initialSymptomsData) : []
        });
        
        return (
          <ClinicalSymptomsForm 
            onComplete={handleSymptomsComplete} 
            onBack={onBack}
            initialData={initialSymptomsData} // 🔥 DATOS AUTO-LLENADOS
          />
        );

      case 'ncs':
        // 🔥 PREPARAR DATOS INICIALES PARA NCS AUTO-LLENADO
        const initialNCSData = initialFormData?.ncs ? {
          ncsResults: initialFormData.ncs.data || [],
          specialStudies: initialFormData.specialStudies?.data || { notPerformed: true, tests: [] }
        } : undefined;
        
        console.log('🔌 Pasando datos iniciales a NeuroConductionForm:', {
          hasInitialData: !!initialNCSData,
          ncsResultsCount: initialNCSData?.ncsResults?.length || 0,
          specialStudiesCount: initialNCSData?.specialStudies?.tests?.length || 0,
          rawInitialFormData: initialFormData,
          processedNCSData: initialNCSData,
          // 🔍 DEBUG: Mostrar estructura completa
          formDataStructure: {
            hasNcs: !!initialFormData?.ncs,
            ncsSuccess: initialFormData?.ncs?.success,
            ncsDataLength: initialFormData?.ncs?.data?.length || 0,
            hasEmg: !!initialFormData?.emg,
            emgSuccess: initialFormData?.emg?.success,
            emgDataLength: initialFormData?.emg?.data?.length || 0
          }
        });
        
        // 🔍 DEBUG: Mostrar estructura detallada de los datos NCS
        if (initialNCSData?.ncsResults) {
          console.log('📊 Datos NCS procesados para enviar:', initialNCSData.ncsResults);
          initialNCSData.ncsResults.forEach((ncs, index) => {
            console.log(`   NCS ${index + 1}:`, {
              id: ncs.id,
              nerve: ncs.nerve,
              side: ncs.side,
              type: ncs.type,
              latency: ncs.latency,
              amplitude: ncs.amplitude,
              velocity: ncs.velocity,
              status: ncs.status
            });
          });
        } else {
          console.warn('⚠️ No hay datos NCS para pasar al formulario');
        }
        
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Estudios de Neuroconducción</h2>
                <p className="text-gray-300">Complete los valores de velocidades, amplitudes y latencias de cada nervio estudiado.</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-1">
                    <NeuroConductionForm 
                      onSave={handleNCSComplete} 
                      initialData={initialNCSData} // 🔥 DATOS AUTO-LLENADOS PARA NCS
                    />
                </div>
                <div className="mt-6 flex justify-start">
                    <button onClick={() => setCurrentStep('symptoms')} className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 flex items-center transition-colors"><ArrowLeft className="w-4 h-4 mr-2" />Volver a Síntomas</button>
                </div>
            </div>
        );

      case 'emg':
        // 🔥 PREPARAR DATOS INICIALES PARA EMG AUTO-LLENADO
        const initialEMGData = initialFormData?.emg?.data || undefined;
        
        console.log('🔬 Pasando datos iniciales a EMGNeedleAnalysis:', {
          hasInitialData: !!initialEMGData,
          emgRecordsCount: initialEMGData?.length || 0,
          muscles: initialEMGData?.map(record => `${record.muscleOrNerveName} (${record.side})`) || [],
          rawInitialFormData: initialFormData,
          processedEMGData: initialEMGData,
          // 🔍 DEBUG: Verificar estructura EMG
          emgStructure: {
            hasEmg: !!initialFormData?.emg,
            emgSuccess: initialFormData?.emg?.success,
            emgDataLength: initialFormData?.emg?.data?.length || 0,
            mappingStats: initialFormData?.emg?.mappingStats
          }
        });
        
        // 🔍 DEBUG: Mostrar estructura detallada de los datos EMG
        if (initialEMGData) {
          console.log('📊 Datos EMG procesados para enviar:', initialEMGData);
          initialEMGData.forEach((emg, index) => {
            console.log(`   EMG ${index + 1}:`, {
              id: emg.id,
              muscle: emg.muscleOrNerveName,
              side: emg.side,
              insertionalActivity: emg.insertionalActivity,
              recruitmentPattern: emg.recruitmentPattern,
              hasSpont: !!emg.spontaneousActivity,
              hasMUP: !!emg.motorUnitPotentials
            });
          });
        } else {
          console.warn('⚠️ No hay datos EMG para pasar al formulario');
        }
        
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">Electromiografía con Aguja</h2>
                    <p className="text-gray-300 mb-4">Complete los datos de electromiografía para generar el análisis diagnóstico, o indique si el estudio no se realizó.</p>
                    <button
                        onClick={handleEMGNotPerformed}
                        className="mb-4 flex items-center px-4 py-2 text-sm bg-yellow-600/80 text-white rounded-md hover:bg-yellow-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Marcar EMG como No Realizada y Continuar
                    </button>
                </div> 
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-1">
                    <EMGNeedleAnalysis 
                      onComplete={handleEMGComplete} 
                      initialData={initialEMGData} // 🔥 DATOS AUTO-LLENADOS PARA EMG
                    />
                </div>
                <div className="mt-6 flex justify-start">
                    <button onClick={() => setCurrentStep('ncs')} className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 flex items-center transition-colors"><ArrowLeft className="w-4 h-4 mr-2" />Volver a Neuroconducciones</button>
                </div>
            </div>
        );

      case 'analysis':
        if (!clinicalReport) {
            return <div className="text-center text-gray-400 py-10">Generando reporte para análisis...</div>;
        }
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Análisis Diagnóstico</h2>
                <p className="text-gray-300">Resultados del análisis automático de patrones diagnósticos.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded-lg">
                        <div className="flex items-center">
                        <Brain className="w-8 h-8 text-blue-400 mr-3" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-300">Patrones Identificados</h3>
                            <p className="text-2xl font-bold text-blue-400">{diagnosticPatterns.length}</p>
                        </div>
                        </div>
                    </div>
                    <div className="bg-green-900/30 border border-green-700/50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                            <div>
                            <h3 className="text-lg font-semibold text-green-300">Alta Confianza</h3>
                            <p className="text-2xl font-bold text-green-400">{diagnosticPatterns.filter(p => p.confidence > 0.8).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-900/30 border border-orange-700/50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-orange-400 mr-3" />
                            <div>
                            <h3 className="text-lg font-semibold text-orange-300">Urgentes</h3>
                            <p className="text-2xl font-bold text-orange-400">{diagnosticPatterns.filter(p => p.urgencyLevel === 'urgent').length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-8 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Patrones Diagnósticos Detallados</h3>
                    {diagnosticPatterns.length > 0 ? (
                        <div className="space-y-4">
                        {diagnosticPatterns.map((pattern) => (
                            <div key={pattern.id} className="bg-gray-700/70 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-lg font-medium text-gray-100">{pattern.name}</h4>
                                    {/* Confidence and urgency badges would go here */}
                                </div>
                                <p className="text-sm text-gray-300 mb-1">Relevancia Clínica: {(pattern.clinicalRelevance * 100).toFixed(0)}%</p>
                                <div className="text-sm text-gray-300">
                                    <strong className="text-gray-400">Evidencia de Apoyo:</strong>
                                    <ul className="list-disc list-inside pl-4 mt-1">
                                    {pattern.supportingEvidence.map((ev, i) => <li key={i}>{ev.description}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-gray-400">No se identificaron patrones diagnósticos específicos.</p>}
                </div>

                {recommendations.length > 0 && (
                    <div className="mb-8 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Recomendaciones Clínicas</h3>
                     <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="p-3 bg-gray-700/70 rounded-md border border-gray-600">
                                <h5 className="font-semibold text-blue-300">{rec.diagnosisName} (Confianza: {(rec.overallConfidence * 100).toFixed(0)}%)</h5>
                                <p className="text-sm text-gray-300"><strong className="text-gray-400">Pasos Siguientes:</strong> {rec.nextSteps.join(', ')}</p>
                                <p className="text-sm text-gray-300"><strong className="text-gray-400">Especialistas:</strong> {rec.specialists.join(', ')}</p>
                                <p className="text-sm text-gray-300"><strong className="text-gray-400">Tiempo Estimado:</strong> {rec.timeframe}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <button onClick={() => setCurrentStep('emg')} className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 flex items-center transition-colors"><ArrowLeft className="w-4 h-4 mr-2" />Volver a EMG</button>
                    <button onClick={handleAnalysisComplete} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"><ArrowRight className="w-4 h-4 ml-2" />Ver Reporte Final</button>
                </div>
            </div>
        );

      case 'report':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 text-center no-print">
              <h2 className="text-3xl font-bold text-gray-100 mb-1">Reporte de Electroneuromiografía</h2>
              <p className="text-gray-400">Resumen de la evaluación completa del paciente.</p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 mb-6 no-print">
              <button
                onClick={downloadJsonReport}
                className="flex items-center px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </button>
              <button
                onClick={handleExportToTXT}
                className="flex items-center px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                TXT
              </button>
              <button
                onClick={handleExportToPDF}
                className="flex items-center px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                <FileUp className="w-4 h-4 mr-2" /> 
                PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </button>
            </div>

            {clinicalReport ? (
              <div ref={reportContentRef} className="print-content">
                <div className="hidden print:block mb-6 text-center">
                  <h1 className="text-3xl font-bold text-black mb-4">Reporte de Electroneuromiografía</h1>
                  <hr className="border-black mb-4" />
                </div>
                <FormattedReportDisplay report={clinicalReport} patient={patient} />
              </div>
            ) : (
              <p className="text-center text-gray-400 py-10">No hay reporte clínico disponible para mostrar.</p>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
              <button
                onClick={() => setCurrentStep('analysis')}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Análisis
              </button>
              <button
                onClick={handleWorkflowComplete}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Completar y Cerrar Evaluación
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 text-gray-100">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold">
                Evaluación Clínica Completa
              </h1>
              <p className="text-gray-300">
                Paciente: {patient.firstName} {patient.lastName} - ID: {patient.id}
              </p>
            </div>
          </div>
          
          {renderProgressBar()}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default CompleteClinicalWorkflow;
export type { WorkflowResult }; 