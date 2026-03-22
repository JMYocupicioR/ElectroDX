import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, User, ClipboardList, Activity, Brain, Upload, CheckCircle, Save, RotateCcw, ChevronLeft, ChevronRight, Zap, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Patient } from '../types/patient';
import PatientForm from './patients/PatientForm';
import CompleteClinicalWorkflow, { WorkflowResult } from './CompleteClinicalWorkflow';
// ✨ NUEVO: Importar tipos para auto-fill
import type { AutoFillContext, ExtractedFileData } from '../types/enhancedSystem';

const ClinicalWorkflow: React.FC = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'patient-selection' | 'workflow'>('patient-selection');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  // ✨ NUEVO: Estado para auto-fill desde archivo procesado
  const [autoFillContext, setAutoFillContext] = useState<AutoFillContext | null>(null);
  const [extractedFileData, setExtractedFileData] = useState<ExtractedFileData | null>(null);

  // 🔥 NUEVO: Estado de navegación flexible
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [isStepValid, setIsStepValid] = useState<Record<number, boolean>>({});
  const [savedProgress, setSavedProgress] = useState<boolean>(false);
  const [navigationMode, setNavigationMode] = useState<'linear' | 'flexible'>('flexible');

  // 🔥 NUEVO: Definición de pasos del flujo
  const workflowSteps = [
    {
      id: 0,
      title: 'Carga de Archivo',
      description: 'Subir archivo con datos electrodiagnósticos',
      required: true,
      icon: Upload
    },
    {
      id: 1,
      title: 'Datos Clínicos',
      description: 'Información del paciente y síntomas',
      required: true,
      icon: User
    },
    {
      id: 2,
      title: 'Estudios NCS',
      description: 'Resultados de conducción nerviosa',
      required: false,
      icon: Activity
    },
    {
      id: 3,
      title: 'Estudios EMG',
      description: 'Resultados de electromiografía',
      required: false,
      icon: Zap
    },
    {
      id: 4,
      title: 'Análisis',
      description: 'Interpretación y diagnóstico',
      required: false,
      icon: Brain
    },
    {
      id: 5,
      title: 'Reporte',
      description: 'Generar reporte final',
      required: false,
      icon: FileText
    }
  ];

  // 🔥 NUEVO: Función de navegación flexible
  const navigateToStep = (stepId: number) => {
    // Validar si se puede navegar al paso
    if (navigationMode === 'linear' && stepId > currentStep + 1) {
      // En modo lineal, solo se puede avanzar un paso
      return;
    }
    
    // Guardar datos del paso actual
    if (currentStep !== stepId) {
      saveCurrentStepData();
    }
    
    setCurrentStep(stepId);
  };

  // 🔥 NUEVO: Guardar datos del paso actual
  const saveCurrentStepData = () => {
    const currentStepData = getCurrentStepData();
    if (currentStepData) {
      setStepData(prev => ({
        ...prev,
        [currentStep]: currentStepData
      }));
      
      // Marcar paso como completado si es válido
      if (validateStepData(currentStep, currentStepData)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setIsStepValid(prev => ({
          ...prev,
          [currentStep]: true
        }));
      }
    }
  };

  // 🔥 NUEVO: Obtener datos del paso actual
  const getCurrentStepData = () => {
    // Esta función debe ser implementada según el paso actual
    // Por ahora retorna un objeto vacío
    return {};
  };

  // 🔥 NUEVO: Validar datos del paso
  const validateStepData = (stepId: number, data: any): boolean => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return false;
    
    switch (stepId) {
      case 0: // Carga de archivo
        return data.file && data.file.size > 0;
      case 1: // Datos clínicos
        return data.patientName && data.age;
      case 2: // NCS
        return !step.required || (data.ncsResults && data.ncsResults.length > 0);
      case 3: // EMG
        return !step.required || (data.emgResults && data.emgResults.length > 0);
      case 4: // Análisis
        return !step.required || data.analysisComplete;
      case 5: // Reporte
        return !step.required || data.reportGenerated;
      default:
        return true;
    }
  };

  // 🔥 NUEVO: Guardar progreso
  const saveProgress = async () => {
    try {
      const progressData = {
        currentStep,
        completedSteps: Array.from(completedSteps),
        stepData,
        timestamp: new Date().toISOString()
      };
      
      // Guardar en localStorage
      localStorage.setItem('clinicalWorkflowProgress', JSON.stringify(progressData));
      setSavedProgress(true);
      
      // Opcional: guardar en servidor
      // await saveProgressToServer(progressData);
      
      console.log('Progreso guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };

  // 🔥 NUEVO: Cargar progreso guardado
  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem('clinicalWorkflowProgress');
      if (savedData) {
        const progressData = JSON.parse(savedData);
        setCurrentStep(progressData.currentStep);
        setCompletedSteps(new Set(progressData.completedSteps));
        setStepData(progressData.stepData);
        console.log('Progreso cargado exitosamente');
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  };

  // 🔥 NUEVO: Reiniciar flujo
  const resetWorkflow = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepData({});
    setIsStepValid({});
    setSavedProgress(false);
    localStorage.removeItem('clinicalWorkflowProgress');
  };

  // 🔥 NUEVO: Componente de navegación de pasos
  const StepNavigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Indicador de pasos */}
          <div className="flex space-x-8">
            {workflowSteps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = currentStep === step.id;
              const isAccessible = navigationMode === 'flexible' || step.id <= currentStep + 1;
              
              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && navigateToStep(step.id)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : isAccessible
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {/* Icono */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Título */}
                  <div className="text-left">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Controles */}
          <div className="flex items-center space-x-4">
            {/* Modo de navegación */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Navegación:</label>
              <select
                value={navigationMode}
                onChange={(e) => setNavigationMode(e.target.value as 'linear' | 'flexible')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="flexible">Flexible</option>
                <option value="linear">Lineal</option>
              </select>
            </div>
            
            {/* Botón guardar */}
            <button
              onClick={saveProgress}
              className="flex items-center space-x-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            
            {/* Botón reiniciar */}
            <button
              onClick={resetWorkflow}
              className="flex items-center space-x-1 text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🔥 NUEVO: Componente de progreso general
  const ProgressOverview = () => {
    const totalSteps = workflowSteps.length;
    const completedCount = completedSteps.size;
    const progressPercentage = (completedCount / totalSteps) * 100;
    
    return (
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">
                Progreso General: {completedCount} de {totalSteps} pasos completados
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {progressPercentage.toFixed(0)}%
              </div>
            </div>
            
            {savedProgress && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Progreso guardado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🔥 NUEVO: Componente de navegación inferior
  const BottomNavigation = () => (
    <div className="bg-white border-t px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={() => navigateToStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>
        
        <div className="text-sm text-gray-600">
          Paso {currentStep + 1} de {workflowSteps.length}
        </div>
        
        <button
          onClick={() => navigateToStep(Math.min(workflowSteps.length - 1, currentStep + 1))}
          disabled={currentStep === workflowSteps.length - 1}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const handlePatientSaved = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowNewPatientForm(false);
    setCurrentView('workflow');
  };

  const handleStartWorkflow = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('workflow');
  };

  const handleWorkflowComplete = (result: WorkflowResult) => {
    console.log('Flujo completo terminado:', result);
    alert(`Evaluación completada para ${selectedPatient?.firstName} ${selectedPatient?.lastName}. Reporte y análisis generados.`);
    setCurrentView('patient-selection');
    setSelectedPatient(null);
  };

  const handleBackToPatientSelection = () => {
    setCurrentView('patient-selection');
    setSelectedPatient(null);
    setShowNewPatientForm(false);
  };

  if (currentView === 'workflow' && selectedPatient) {
    return (
      <CompleteClinicalWorkflow
        patient={selectedPatient}
        onComplete={handleWorkflowComplete}
        onBack={handleBackToPatientSelection}
      />
    );
  }

  // ✨ NUEVO: Efecto para recibir datos de auto-fill desde FileUpload
  useEffect(() => {
    if (location.state) {
      const { autoFillMode, extractedData, sourceFile, fallbackMode } = location.state as any;
      
      if (autoFillMode && extractedData) {
        console.log('🚀 Datos de auto-fill recibidos:', extractedData);
        
        setAutoFillContext({
          mode: true,
          sourceFile: sourceFile || 'archivo_procesado',
          fallbackMode: fallbackMode || false,
          confidence: extractedData.quality?.confidence || 0,
          data: {
            patient: extractedData.patient || {},
            symptoms: extractedData.symptoms || {},
            ncsResults: extractedData.ncsResults || [],
            emgResults: extractedData.emgResults || [],
            specialStudies: extractedData.specialStudies || [],
            metadata: {
              confidence: extractedData.quality?.confidence || 0,
              source: 'enhanced_file_processor',
              processingTime: extractedData.quality?.processingTime || 0,
              warnings: extractedData.warnings || []
            }
          }
        });
        
        setExtractedFileData(extractedData);
        
        // Auto-crear paciente si hay datos suficientes
        if (extractedData.patient?.name) {
          const autoPatient: Patient = {
            id: extractedData.patient.id || `auto_${Date.now()}`,
            firstName: extractedData.patient.name.split(' ')[0] || '',
            lastName: extractedData.patient.name.split(' ').slice(1).join(' ') || '',
            dateOfBirth: extractedData.patient.age 
              ? `${new Date().getFullYear() - extractedData.patient.age}-01-01`
              : '',
            sex: extractedData.patient.sex || 'male',
            medicalHistory: {
              previousDiseases: [],
              surgeries: [],
              currentMedications: [],
              allergies: []
            },
            contact: {
              phone: '',
              email: '',
              address: ''
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setSelectedPatient(autoPatient);
          setCurrentView('workflow');
          setCurrentStep(1); // Ir directo a datos clínicos
        }
      }
    }
  }, [location.state]);

  // ✨ NUEVO: Función para renderizar el paso actual
  const renderCurrentStep = () => {
    const currentStepInfo = workflowSteps[currentStep];
    
    switch (currentStep) {
      case 0: // Carga de archivo
        return (
          <div className="text-center py-8">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carga de Archivo</h2>
            <p className="text-gray-600 mb-6">
              {autoFillContext 
                ? `Archivo procesado: ${autoFillContext.sourceFile} (Confianza: ${(autoFillContext.confidence * 100).toFixed(1)}%)`
                : 'Sube un archivo con datos electrodiagnósticos para comenzar'
              }
            </p>
            
            {autoFillContext && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Archivo procesado exitosamente</span>
                </div>
                <div className="text-sm text-green-700 mt-2">
                  Se encontraron {autoFillContext.data.ncsResults.length} estudios NCS y {autoFillContext.data.emgResults.length} estudios EMG
                </div>
              </div>
            )}
            
            {!autoFillContext && (
              <button
                onClick={() => window.location.href = '/upload'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Ir a Carga de Archivo
              </button>
            )}
          </div>
        );
        
      case 1: // Datos clínicos
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Datos Clínicos</h2>
            <p className="text-gray-600 mb-6">
              {autoFillContext 
                ? 'Revisa y completa los datos del paciente extraídos automáticamente'
                : 'Ingresa los datos del paciente y síntomas clínicos'
              }
            </p>
            
            {autoFillContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Datos extraídos automáticamente:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {autoFillContext.data.patient.firstName && (
                    <li>• Nombre: {autoFillContext.data.patient.firstName} {autoFillContext.data.patient.lastName}</li>
                  )}
                  {Object.keys(autoFillContext.data.symptoms).length > 0 && (
                    <li>• Síntomas detectados: {Object.keys(autoFillContext.data.symptoms).length}</li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Aquí iría el formulario de paciente */}
            <div className="text-center py-8 text-gray-500">
              Formulario de datos clínicos (por implementar)
            </div>
          </div>
        );
        
      case 2: // Estudios NCS
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estudios de Conducción Nerviosa</h2>
            <p className="text-gray-600 mb-6">
              {autoFillContext 
                ? `Se encontraron ${autoFillContext.data.ncsResults.length} estudios NCS en el archivo`
                : 'Registra los resultados de estudios de conducción nerviosa'
              }
            </p>
            
            {autoFillContext && autoFillContext.data.ncsResults.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-900 mb-3">Estudios NCS extraídos:</h3>
                <div className="space-y-2">
                  {autoFillContext.data.ncsResults.slice(0, 3).map((ncs, index) => (
                    <div key={index} className="text-sm text-green-800 bg-white p-2 rounded">
                      {ncs.nerve} ({ncs.side}) - Latencia: {ncs.latency}ms, Amplitud: {ncs.amplitude}mV
                    </div>
                  ))}
                  {autoFillContext.data.ncsResults.length > 3 && (
                    <div className="text-sm text-green-700">
                      ... y {autoFillContext.data.ncsResults.length - 3} estudios más
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center py-8 text-gray-500">
              Formulario de estudios NCS (por implementar)
            </div>
          </div>
        );
        
      case 3: // Estudios EMG
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estudios de Electromiografía</h2>
            <p className="text-gray-600 mb-6">
              {autoFillContext 
                ? `Se encontraron ${autoFillContext.data.emgResults.length} estudios EMG en el archivo`
                : 'Registra los resultados de estudios de electromiografía'
              }
            </p>
            
            {autoFillContext && autoFillContext.data.emgResults.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-900 mb-3">Estudios EMG extraídos:</h3>
                <div className="space-y-2">
                  {autoFillContext.data.emgResults.slice(0, 3).map((emg, index) => (
                    <div key={index} className="text-sm text-green-800 bg-white p-2 rounded">
                      {emg.muscle} ({emg.side}) - {emg.insertionalActivity}
                    </div>
                  ))}
                  {autoFillContext.data.emgResults.length > 3 && (
                    <div className="text-sm text-green-700">
                      ... y {autoFillContext.data.emgResults.length - 3} estudios más
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center py-8 text-gray-500">
              Formulario de estudios EMG (por implementar)
            </div>
          </div>
        );
        
      case 4: // Análisis
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis e Interpretación</h2>
            <p className="text-gray-600 mb-6">Revisa e interpreta los resultados</p>
            
            {autoFillContext && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-900 mb-2">Datos disponibles para análisis:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-yellow-800">
                    <strong>NCS:</strong> {autoFillContext.data.ncsResults.length} estudios
                  </div>
                  <div className="text-yellow-800">
                    <strong>EMG:</strong> {autoFillContext.data.emgResults.length} estudios
                  </div>
                  <div className="text-yellow-800">
                    <strong>Especiales:</strong> {autoFillContext.data.specialStudies.length} estudios
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center py-8 text-gray-500">
              Módulo de análisis (por implementar)
            </div>
          </div>
        );
        
      case 5: // Reporte
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generación de Reporte</h2>
            <p className="text-gray-600 mb-6">Genera el reporte final del estudio</p>
            
            <div className="text-center py-8 text-gray-500">
              Generador de reportes (por implementar)
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Paso no implementado
          </div>
        );
    }
  };

  // 🔥 MEJORADO: Renderizado principal con navegación flexible
  return (
    <div className="min-h-screen bg-gray-50">
      <StepNavigation />
      <ProgressOverview />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenido del paso actual */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderCurrentStep()}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ClinicalWorkflow; 