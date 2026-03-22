import * as React from 'react';
import { useState } from 'react';
import { ChevronRight, Download, Brain, Edit, Save } from 'lucide-react';
import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';
import { ExportService } from '../services/exportService';

interface ReportGeneratorProps {
  evaluationData: ClinicalEvaluationFormData;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ evaluationData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Aquí se podría implementar la lógica para guardar los cambios en el backend
    console.log('Reporte guardado:', reportContent);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'rtf') => {
    if (isEditing) {
      alert('Por favor, guarda los cambios antes de exportar el reporte.');
      return;
    }

    const patientName = `${evaluationData.patientData.firstName}_${evaluationData.patientData.lastName}`;
    const date = new Date().toISOString().split('T')[0];
    const filename = `Reporte_EMG_${patientName}_${date}`;

    switch (format) {
      case 'csv':
        const csvContent = ExportService.exportToCSV(evaluationData);
        ExportService.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
        break;
      case 'pdf':
        ExportService.exportToPDF(evaluationData);
        break;
      case 'rtf':
        const rtfContent = ExportService.exportToRTF(evaluationData);
        ExportService.downloadFile(rtfContent, `${filename}.rtf`, 'application/rtf');
        break;
    }
  };

  const handleAIAnalysis = () => {
    // Esta función se implementará más adelante
    console.log('Iniciando análisis por IA');
  };

  const generateNerveReport = () => {
    const { motor, sensory } = evaluationData.ncsFindings;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Estudio de Conducción Nerviosa</h3>
        
        {/* Nervios Motores */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Nervios Motores</h4>
          {Object.entries(motor).map(([nerveName, data]) => (
            <div key={nerveName} className="border p-3 rounded-lg mb-2">
              <h5 className="font-medium">{nerveName}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Lado:</span> {data.side}
                </div>
                <div>
                  <span className="text-gray-600">Latencia Distal:</span> {data.distalLatency} ms
                </div>
                <div>
                  <span className="text-gray-600">Amplitud:</span> {data.amplitude} mV
                </div>
                <div>
                  <span className="text-gray-600">Velocidad:</span> {data.velocity} m/s
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nervios Sensitivos */}
        <div>
          <h4 className="font-medium mb-2">Nervios Sensitivos</h4>
          {Object.entries(sensory).map(([nerveName, data]) => (
            <div key={nerveName} className="border p-3 rounded-lg mb-2">
              <h5 className="font-medium">{nerveName}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Lado:</span> {data.side}
                </div>
                <div>
                  <span className="text-gray-600">Amplitud:</span> {data.amplitude} μV
                </div>
                <div>
                  <span className="text-gray-600">Velocidad:</span> {data.velocity} m/s
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateMuscleReport = () => {
    const { muscles } = evaluationData.emgFindings;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Estudio de Electromiografía</h3>
        
        {Object.entries(muscles).map(([muscleName, data]) => (
          <div key={muscleName} className="border p-3 rounded-lg mb-4">
            <h4 className="font-medium mb-2">{muscleName} ({data.side})</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actividad de Inserción */}
              <div>
                <h5 className="font-medium mb-1">Actividad de Inserción</h5>
                <p className="text-sm">{data.insertionalActivity}</p>
              </div>

              {/* Actividad Espontánea */}
              <div>
                <h5 className="font-medium mb-1">Actividad Espontánea</h5>
                <div className="text-sm">
                  <p>Fibrilaciones: {data.spontaneousActivity.fibrillations}</p>
                  <p>Ondas Positivas: {data.spontaneousActivity.positiveWaves}</p>
                  <p>Fasciculaciones: {data.spontaneousActivity.fasciculations}</p>
                </div>
              </div>

              {/* Análisis de MUP */}
              <div>
                <h5 className="font-medium mb-1">Análisis de MUP</h5>
                <div className="text-sm">
                  <p>Duración: {data.mupAnalysis.duration} ms</p>
                  <p>Amplitud: {data.mupAnalysis.amplitude} mV</p>
                  <p>Polifasia: {data.mupAnalysis.polyphasia}</p>
                  <p>Reclutamiento: {data.mupAnalysis.recruitment}</p>
                </div>
              </div>

              {/* Nervios y Raíces Asociados */}
              <div>
                <h5 className="font-medium mb-1">Nervios y Raíces</h5>
                <div className="text-sm">
                  <p>Nervios: {data.associatedNerves?.join(', ')}</p>
                  <p>Raíces: {data.associatedRoots?.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const generateInterpretation = () => {
    // Aquí se puede implementar lógica para generar una interpretación automática
    // basada en los hallazgos de nervios y músculos
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Interpretación</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">
            {/* Aquí iría la interpretación generada */}
            La interpretación se generará automáticamente basada en los hallazgos.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Reporte de Electromiografía</h2>
        <div className="flex space-x-4">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-secondary flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Reporte
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </button>
          )}
          <button
            onClick={handleAIAnalysis}
            className="btn btn-primary flex items-center"
            disabled={isEditing}
          >
            <Brain className="mr-2 h-4 w-4" />
            Analizar por IA
          </button>
        </div>
      </div>

      {/* Información del Paciente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Información del Paciente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm">
              <span className="font-medium">Nombre:</span> {evaluationData.patientInfo.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Edad:</span> {evaluationData.patientInfo.age}
            </p>
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">ID:</span> {evaluationData.patientInfo.id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Fecha:</span> {evaluationData.patientInfo.date}
            </p>
          </div>
        </div>
      </div>

      {/* Razón del Estudio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Razón del Estudio</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.reasonsForStudy}</p>
        </div>
      </div>

      {/* Hallazgos Clínicos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Hallazgos Clínicos</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.clinicalFindings}</p>
        </div>
      </div>

      {/* Reportes de Nervios y Músculos */}
      {generateNerveReport()}
      {generateMuscleReport()}

      {/* Interpretación */}
      {generateInterpretation()}

      {/* Diagnóstico */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Diagnóstico</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.diagnosis}</p>
        </div>
      </div>

      {/* Contenido del reporte */}
      <div className="mb-6">
        {isEditing ? (
          <textarea
            value={reportContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportContent(e.target.value)}
            className="w-full h-96 p-4 border rounded-lg"
            placeholder="Escribe el contenido del reporte aquí..."
          />
        ) : (
          <div className="border p-4 rounded-lg">
            <p>{reportContent || 'No hay contenido en el reporte. Haz clic en "Editar Reporte" para comenzar.'}</p>
          </div>
        )}
      </div>

      {/* Botones de exportación */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleExport('csv')}
          className="btn btn-outline flex items-center"
          disabled={isEditing}
        >
          <Download className="mr-2 h-4 w-4" />
          CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="btn btn-outline flex items-center"
          disabled={isEditing}
        >
          <Download className="mr-2 h-4 w-4" />
          PDF
        </button>
        <button
          onClick={() => handleExport('rtf')}
          className="btn btn-outline flex items-center"
          disabled={isEditing}
        >
          <Download className="mr-2 h-4 w-4" />
          RTF
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator; 