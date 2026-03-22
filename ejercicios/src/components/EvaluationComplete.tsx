import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Patient, Study } from '../types/unified';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';

interface LocationState {
  patient: Patient;
  study: Study;
}

const EvaluationComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, study } = location.state as LocationState;

  const handleDownloadReport = () => {
    // Implementar la generación y descarga del reporte
    console.log('Generando reporte para:', patient, study);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Evaluación Completada
        </h1>
        <p className="text-gray-600">
          La evaluación ha sido guardada exitosamente.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumen de la Evaluación</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-gray-700">Paciente</h3>
            <p className="text-gray-900">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Fecha</h3>
            <p className="text-gray-900">
              {new Date(study.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {study.aiAnalysis && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Análisis de IA</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 whitespace-pre-wrap">
                {study.aiAnalysis.content}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Inicio
        </button>
        <button
          onClick={handleDownloadReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Descargar Reporte
        </button>
      </div>
    </div>
  );
};

export default EvaluationComplete; 