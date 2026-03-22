import * as React from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Settings, Brain, Eye, Info } from 'lucide-react';
import { 
  ConversionResult, 
  MedicalReportData, 
  ConversionError,
  FileConverterConfig,
  createConverter,
  isConversionSuccessful 
} from '../services/enhanced-file-converter';
import { getEMGAnalysis } from '../services/emgAIAnalysisService';

export interface EnhancedFileUploadProps {
  onConversionComplete?: (result: ConversionResult) => void;
  onDataExtracted?: (data: MedicalReportData) => void;
  onBatchComplete?: (results: ConversionResult[]) => void;
  maxFileSize?: number;
  enableAIAnalysis?: boolean;
  enablePreview?: boolean;
  enableBatchMode?: boolean;
  maxBatchSize?: number;
  className?: string;
}

interface UploadState {
  isDragOver: boolean;
  isConverting: boolean;
  conversionProgress: number;
  lastResult: ConversionResult | null;
  aiAnalysis: string | null;
  isAnalyzingWithAI: boolean;
  showSettings: boolean;
  showPreview: boolean;
  uploadProgress: number;
  uploadStage: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  detailedStatus: string;
  errorDetails: string;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onConversionComplete,
  onDataExtracted,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  enableAIAnalysis = false,
  enablePreview = false,
  className = ''
}) => {
  const [state, setState] = React.useState<UploadState>({
    isDragOver: false,
    isConverting: false,
    conversionProgress: 0,
    lastResult: null,
    aiAnalysis: null,
    isAnalyzingWithAI: false,
    showSettings: false,
    showPreview: false,
    uploadProgress: 0,
    uploadStage: 'idle',
    detailedStatus: '',
    errorDetails: ''
  });

  const [config, setConfig] = React.useState<Partial<FileConverterConfig>>({
    enableOCR: false,
    enableAIEnhancement: enableAIAnalysis,
    enableValidation: true,
    minConfidenceThreshold: 0.6,
    supportedFormats: ['pdf', 'docx', 'doc', 'rtf', 'txt'],
    languageDetection: false,
    debugMode: false
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const converter = createConverter(config);

  const handleFileSelect = React.useCallback(async (file: File) => {
    if (file.size > maxFileSize) {
      alert(`El archivo es demasiado grande. Tamaño máximo: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setState(prev => ({ ...prev, isConverting: true, conversionProgress: 0, aiAnalysis: null }));

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setState(prev => ({ 
          ...prev, 
          conversionProgress: Math.min(prev.conversionProgress + 5, 90) 
        }));
      }, 100);

      const result = await converter.convert(file);
      
      clearInterval(progressInterval);
      setState(prev => ({ ...prev, conversionProgress: 100, lastResult: result }));

      // Llamar callbacks
      onConversionComplete?.(result);
      if (result.data) {
        onDataExtracted?.(result.data);
      }

      // Análisis con IA si está habilitado y la conversión fue exitosa
      if (enableAIAnalysis && isConversionSuccessful(result) && result.data) {
        await performAIAnalysis(result.data, file);
      }

    } catch (error) {
      console.error('Error during file conversion:', error);
    } finally {
      setState(prev => ({ ...prev, isConverting: false }));
      setTimeout(() => {
        setState(prev => ({ ...prev, conversionProgress: 0 }));
      }, 2000);
    }
  }, [converter, maxFileSize, enableAIAnalysis, onConversionComplete, onDataExtracted]);

  const performAIAnalysis = async (data: MedicalReportData, file: File) => {
    if (!data.emgResults || data.emgResults.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzingWithAI: true }));

    try {
      const patientData = {
        age: data.patient.dateOfBirth ? calculateAge(data.patient.dateOfBirth) : undefined,
        gender: data.patient.sex,
        medicalHistory: data.notes
      };

      // Convertir EMG data para el análisis
      const emgDataForAI = {
        id: crypto.randomUUID(),
        results: data.emgResults,
        analysisDate: new Date().toISOString()
      };

      const aiAnalysis = await getEMGAnalysis(emgDataForAI, patientData, {
        saveAnalysis: true,
        patientId: data.patient.id
      });

      setState(prev => ({ ...prev, aiAnalysis }));

    } catch (error) {
      console.error('Error during AI analysis:', error);
      setState(prev => ({ 
        ...prev, 
        aiAnalysis: 'Error al realizar el análisis con IA. Por favor, intente nuevamente.' 
      }));
    } finally {
      setState(prev => ({ ...prev, isAnalyzingWithAI: false }));
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getSeverityColor = (severity: ConversionError['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderConversionResults = () => {
    if (!state.lastResult) return null;

    const { success, data, errors, warnings, confidence, metadata } = state.lastResult;

    return (
      <div className="mt-6 space-y-4">
        {/* Estado general */}
        <div className={`p-4 rounded-lg border ${
          success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={`font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
              {success ? 'Conversión exitosa' : 'Error en la conversión'}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              Confianza: {(confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Datos extraídos */}
        {data && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Datos Extraídos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Paciente:</span> {data.patient?.name || 'No encontrado'}
              </div>
              <div>
                <span className="font-medium">ID:</span> {data.patient?.id || 'No encontrado'}
              </div>
              <div>
                <span className="font-medium">Estudios NCS:</span> {data.ncsResults?.length || 0}
              </div>
              <div>
                <span className="font-medium">Estudios EMG:</span> {data.emgResults?.length || 0}
              </div>
            </div>
            
            {data.diagnosis && (
              <div className="mt-3">
                <span className="font-medium">Diagnóstico:</span>
                <p className="text-gray-600 mt-1">{data.diagnosis}</p>
              </div>
            )}
          </div>
        )}

        {/* Errores y advertencias */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Errores y Advertencias</h4>
            {errors.map((error, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{error.message}</p>
                    {error.suggestion && (
                      <p className="text-sm mt-1 opacity-80">{error.suggestion}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded">
                    {error.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Análisis con IA */}
        {enableAIAnalysis && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">Análisis con IA</h4>
            </div>
            
            {state.isAnalyzingWithAI ? (
              <div className="flex items-center text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Analizando con IA...
              </div>
            ) : state.aiAnalysis ? (
              <div className="text-purple-800 whitespace-pre-wrap">{state.aiAnalysis}</div>
            ) : success && data?.emgResults && data.emgResults.length > 0 ? (
              <p className="text-purple-600">Análisis con IA completado</p>
            ) : (
              <p className="text-purple-600">No hay datos EMG para analizar</p>
            )}
          </div>
        )}

        {/* Metadata */}
        {enablePreview && (
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Información Técnica
            </summary>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Archivo:</span> {metadata.originalFileName}</p>
              <p><span className="font-medium">Tamaño:</span> {(metadata.fileSize / 1024).toFixed(1)} KB</p>
              <p><span className="font-medium">Tiempo de procesamiento:</span> {metadata.processingTimeMs}ms</p>
              <p><span className="font-medium">Texto extraído:</span> {metadata.extractedTextLength} caracteres</p>
              <p><span className="font-medium">Secciones encontradas:</span> {metadata.sectionsFound.join(', ')}</p>
            </div>
          </details>
        )}
      </div>
    );
  };

  const handleFileUpload = async (file: File) => {
    try {
      setState(prev => ({ ...prev, uploadStage: 'uploading', uploadProgress: 0, detailedStatus: 'Iniciando carga de archivo...', errorDetails: '' }));

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setState(prev => ({ 
          ...prev, 
          uploadProgress: Math.min(prev.uploadProgress + 5, 90) 
        }));
      }, 200);

      // Validar archivo
      setState(prev => ({ ...prev, detailedStatus: 'Validando formato de archivo...' }));
      const validation = await validateFile(file);
      if (!validation.isValid) {
        throw new Error(`Archivo inválido: ${validation.errors.join(', ')}`);
      }

      // Procesar archivo
      setState(prev => ({ ...prev, uploadStage: 'processing', uploadProgress: 40, detailedStatus: 'Procesando contenido del archivo...' }));

      const processedData = await processFile(file);
      
      // Analizar contenido
      setState(prev => ({ ...prev, uploadStage: 'analyzing', uploadProgress: 70, detailedStatus: 'Analizando datos médicos...' }));

      const analysisResult = await analyzeFileContent(processedData);
      
      // Completar
      setState(prev => ({ ...prev, uploadStage: 'completed', uploadProgress: 100, detailedStatus: 'Archivo procesado exitosamente' }));

      clearInterval(progressInterval);
      
      // Llamar callback con resultado
      if (onConversionComplete) {
        onConversionComplete(analysisResult);
      }

    } catch (error) {
      setState(prev => ({ ...prev, uploadStage: 'error', errorDetails: error instanceof Error ? error.message : 'Error desconocido', detailedStatus: 'Error al procesar archivo' }));
      console.error('Error en carga de archivo:', error);
    }
  };

  const validateFile = async (file: File): Promise<{isValid: boolean; errors: string[]}> => {
    const errors: string[] = [];
    
    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('El archivo es demasiado grande (máximo 10MB)');
    }
    
    // Validar tipo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain',
      'text/rtf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de archivo no soportado');
    }
    
    // Validar contenido (lectura básica)
    try {
      const content = await file.text();
      if (content.length < 10) {
        errors.push('El archivo parece estar vacío');
      }
    } catch (error) {
      errors.push('No se pudo leer el contenido del archivo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const ProgressIndicator = () => (
    <div className="w-full space-y-4">
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${state.uploadProgress}%` }}
        />
      </div>
      
      {/* Indicador de etapa */}
      <div className="flex justify-between text-sm">
        <span className={`${state.uploadStage === 'uploading' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          Cargando
        </span>
        <span className={`${state.uploadStage === 'processing' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          Procesando
        </span>
        <span className={`${state.uploadStage === 'analyzing' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          Analizando
        </span>
        <span className={`${state.uploadStage === 'completed' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
          Completado
        </span>
      </div>
      
      {/* Estado detallado */}
      <div className="text-center">
        <p className="text-sm text-gray-600">{state.detailedStatus}</p>
        <p className="text-xs text-gray-500 mt-1">{state.uploadProgress}% completado</p>
      </div>
      
      {/* Indicador de actividad */}
      {state.uploadStage !== 'idle' && state.uploadStage !== 'completed' && state.uploadStage !== 'error' && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );

  const ErrorDisplay = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-sm font-medium text-red-800">Error al procesar archivo</h3>
      </div>
      <div className="mt-2">
        <p className="text-sm text-red-700">{state.errorDetails}</p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => {
            setState(prev => ({ ...prev, uploadStage: 'idle', uploadProgress: 0, errorDetails: '' }));
          }}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );

  const SuccessDisplay = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <h3 className="text-sm font-medium text-green-800">Archivo procesado exitosamente</h3>
      </div>
      <div className="mt-2">
        <p className="text-sm text-green-700">{state.detailedStatus}</p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => {
            setState(prev => ({ ...prev, uploadStage: 'idle', uploadProgress: 0 }));
          }}
          className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded"
        >
          Cargar otro archivo
        </button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Área de carga */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          state.isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${state.isConverting ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.rtf,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {state.uploadStage === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Formatos soportados: PDF, DOCX, DOC, RTF, TXT (máx. {(maxFileSize / 1024 / 1024).toFixed(0)}MB)
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Seleccionar Archivo
            </button>
          </>
        )}

        {(state.uploadStage === 'uploading' || state.uploadStage === 'processing' || state.uploadStage === 'analyzing') && (
          <ProgressIndicator />
        )}
        
        {state.uploadStage === 'error' && (
          <ErrorDisplay />
        )}
        
        {state.uploadStage === 'completed' && (
          <SuccessDisplay />
        )}
      </div>

      {/* Configuración */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configuración
          </button>
          
          {enablePreview && (
            <button
              onClick={() => setState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              Vista Previa
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Formatos: {converter.getSupportedFormats().join(', ').toUpperCase()}
        </div>
      </div>

      {/* Panel de configuración */}
      {state.showSettings && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Configuración de Conversión</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableValidation}
                onChange={(e) => setConfig(prev => ({ ...prev, enableValidation: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Validación de datos</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableOCR}
                onChange={(e) => setConfig(prev => ({ ...prev, enableOCR: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">OCR para documentos escaneados</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.debugMode}
                onChange={(e) => setConfig(prev => ({ ...prev, debugMode: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Modo debug</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umbral mínimo de confianza: {((config.minConfidenceThreshold || 0.6) * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.minConfidenceThreshold || 0.6}
                onChange={(e) => setConfig(prev => ({ ...prev, minConfidenceThreshold: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {renderConversionResults()}
    </div>
  );
}; 