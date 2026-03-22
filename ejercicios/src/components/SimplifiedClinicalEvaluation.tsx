import React from 'react';
import EMGNeedleAnalysis from './EMGNeedleAnalysis';
import ResultAnalyzer from './ResultAnalyzer';

interface SimplifiedClinicalEvaluationProps {
  patient?: any;
  study?: any;
  onComplete?: (data: any) => void;
}

const SimplifiedClinicalEvaluation: React.FC<SimplifiedClinicalEvaluationProps> = ({
  patient,
  study,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [emgData, setEmgData] = React.useState(null);
  const [formData, setFormData] = React.useState({
    patientId: patient?.id || '',
    studyId: study?.id || '',
    date: new Date().toISOString(),
    examiner: '',
    clinicalHistory: '',
    physicalExamination: '',
    ncsFindings: '',
    emgFindings: '',
    preliminaryDiagnosis: '',
    results: { emg: [], ncs: [] }
  });

  const handleEMGComplete = (data: any) => {
    setEmgData(data);
    setCurrentStep(2);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete({
        formData,
        emgData,
        patient,
        study
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-6">
              Electromiografía con Aguja
            </h3>
            <EMGNeedleAnalysis onComplete={handleEMGComplete} />
          </div>
        );
      
      case 2:
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-6">
              Información Adicional del Estudio
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Examinador
                  </label>
                  <input
                    type="text"
                    value={formData.examiner}
                    onChange={(e) => handleInputChange('examiner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Estudio
                  </label>
                  <input
                    type="date"
                    value={formData.date.split('T')[0]}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Historia Clínica
                </label>
                <textarea
                  value={formData.clinicalHistory}
                  onChange={(e) => handleInputChange('clinicalHistory', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describa la historia clínica del paciente..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Examen Físico
                </label>
                <textarea
                  value={formData.physicalExamination}
                  onChange={(e) => handleInputChange('physicalExamination', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describa los hallazgos del examen físico..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico Preliminar
                </label>
                <input
                  type="text"
                  value={formData.preliminaryDiagnosis}
                  onChange={(e) => handleInputChange('preliminaryDiagnosis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Diagnóstico preliminar basado en los hallazgos..."
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Atrás
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Finalizar Evaluación
                </button>
              </div>
            </form>
          </div>
        );
      
      default:
        return <div>Paso no válido</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100">Evaluación Clínica Simplificada</h2>
        <div className="mt-4 flex space-x-1">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {renderStep()}
      </div>
    </div>
  );
};

export default SimplifiedClinicalEvaluation; 