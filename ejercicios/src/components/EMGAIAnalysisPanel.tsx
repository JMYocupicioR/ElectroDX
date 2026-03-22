import React from 'react';
import { Study } from '../types/unified';
import { Brain, Save } from 'lucide-react';

interface PatientData {
  age?: number;
  gender?: string;
  medicalHistory?: string;
}

interface EMGAIAnalysisPanelProps {
  emgData: Study;
  patientData?: PatientData;
  studyId: string;
  onSave: (analysis: string) => void;
}

const EMGAIAnalysisPanel: React.FC<EMGAIAnalysisPanelProps> = ({
  emgData,
  patientData,
  studyId,
  onSave
}: EMGAIAnalysisPanelProps) => {
  const [analysis, setAnalysis] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedAnalysis = `Análisis de IA para el estudio ${studyId}:
      
- Datos del paciente:
  * Edad: ${patientData?.age || 'No especificada'}
  * Género: ${patientData?.gender || 'No especificado'}
  * Antecedentes: ${patientData?.medicalHistory || 'No especificados'}

- Hallazgos principales:
  * Actividad de inserción: ${emgData.results.emg?.[0]?.insertionalActivity || 'No disponible'}
  * Actividad espontánea: ${emgData.results.emg?.[0]?.spontaneousActivity || 'No disponible'}
  * Patrón de reclutamiento: ${emgData.results.emg?.[0]?.recruitmentPattern || 'No disponible'}

- Interpretación:
  Los resultados sugieren un patrón electrodiagnóstico que requiere evaluación clínica adicional.
  Se recomienda correlación con la historia clínica y examen físico.`;

      setAnalysis(generatedAnalysis);
    } catch (error) {
      console.error('Error en el análisis de IA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          Análisis de IA
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Analizando...
            </>
          ) : (
            'Analizar con IA'
          )}
        </button>
      </div>

      {analysis && (
        <div className="mt-4">
          <textarea
            value={analysis}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnalysis(e.target.value)}
            className="w-full h-64 p-4 border rounded-md font-mono text-sm"
          />
          <button
            onClick={() => onSave(analysis)}
            className="mt-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Análisis
          </button>
        </div>
      )}
    </div>
  );
};

export default EMGAIAnalysisPanel; 