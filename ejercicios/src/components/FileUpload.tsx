import * as React from 'react';
import { Upload, FileText, X, Check, ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createConverter, isConversionSuccessful } from '../services/enhanced-file-converter';
import { FileConversionResult } from '../types/medical';
// ✨ NUEVO: Usar tipos unificados del sistema
import type { ExtractedFileData, AutoFillContext, ExtendedFileConversionResult } from '../types/enhancedSystem';
// 🚀 NUEVO: Importar el parser robusto
import { RobustParserIntegration, IntegrationResult } from '../services/robustParserIntegration';
import { RobustEMGParser } from '../services/robustEMGParser';

interface FileUploadProps {}

const FileUpload: React.FC<FileUploadProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [conversionResult, setConversionResult] = React.useState<FileConversionResult | null>(null);
  // 🚀 NUEVO: Estado para el parser robusto
  const [robustParserResult, setRobustParserResult] = React.useState<IntegrationResult | null>(null);
  const [showParserOptions, setShowParserOptions] = React.useState(false);
  const [useRobustParser, setUseRobustParser] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allowedTypes = [
    'application/msword',                                                    // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/rtf',                                                      // .rtf
    'application/pdf'                                                       // .pdf
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Formato de archivo no soportado. Por favor, sube un archivo Word, RTF o PDF.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setErrorMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    
    try {
      let extractedData;
      
      if (useRobustParser) {
        // 🚀 USAR EL PARSER ROBUSTO INTEGRADO
        console.log('🔗 Procesando archivo con parser robusto integrado:', file.name);
        
        const robustResult = await processFileWithRobustParser(file);
        setRobustParserResult(robustResult);
        
        if (robustResult.success && robustResult.data) {
          extractedData = convertRobustResultToExtractedData(robustResult.data);
        } else {
          // Fallback al sistema original si el parser robusto falla
          console.log('⚠️ Parser robusto falló, usando sistema original como fallback');
          extractedData = await processFileWithAdvancedSystem(file);
        }
      } else {
        // 🚀 USAR EL PROCESADOR AVANZADO PARA EXTRAER DATOS REALES
        console.log('📁 Procesando archivo con sistema avanzado:', file.name);
        
        // Crear procesador avanzado (simulado por compatibilidad)
        extractedData = await processFileWithAdvancedSystem(file);
      }
      
      // Crear resultado con datos extraídos
      const mockResult: ExtendedFileConversionResult = {
        success: true,
        report: {
          patient: {
            id: extractedData.patient?.id || generatePatientId(),
            age: extractedData.patient?.age || 0,
            gender: (extractedData.patient?.sex === 'female' ? 'F' : 'M') as 'M' | 'F',
            height: 170, // Valores por defecto
            weight: 70,
            bmi: 24.2
          },
          tests: [], // Los tests NCS se mapearán luego
          diagnosis: 'Diagnóstico pendiente de evaluación',
          notes: 'Archivo procesado exitosamente con datos extraídos',
          metadata: {
            originalFormat: file.type,
            conversionDate: new Date().toISOString(),
            confidenceScore: extractedData.quality?.confidence || 0.8,
            processingErrors: []
          }
        },
        errors: [],
        warnings: extractedData.warnings || [],
        processingTime: extractedData.quality?.processingTime || 1500,
        // Agregar datos extraídos como propiedad adicional para compatibilidad
        extractedData: extractedData
      };
      
      setConversionResult(mockResult);
      setUploadStatus('success');
      
      // Mostrar mensaje informativo
      console.log('✅ Archivo procesado exitosamente');
      console.log('📊 Datos extraídos:', extractedData);
      
      // 🎯 REDIRIGIR AL CUESTIONARIO EMG CON DATOS PRE-LLENADOS
      setTimeout(() => {
        navigate('/clinical-emg', { 
          state: { 
            fileResult: mockResult,
            extractedData: extractedData,
            autoFillMode: true, // 🔥 MODO AUTOLLENADO ACTIVADO
            sourceFile: file.name
          } 
        });
      }, 1000);
      
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Error al procesar el archivo. El sistema continuará con datos básicos.');
      console.error('Error processing file:', error);
      
      // Incluso con error, permitir continuar con datos básicos
      setTimeout(() => {
        navigate('/clinical-emg', { 
          state: { 
            autoFillMode: false,
            sourceFile: file.name,
            fallbackMode: true
          } 
        });
      }, 2000);
    }
  };

  // 🚀 NUEVA FUNCIÓN: PROCESAR CON PARSER ROBUSTO
  const processFileWithRobustParser = async (file: File): Promise<IntegrationResult> => {
    try {
      console.log('🔗 Iniciando procesamiento con parser robusto...');
      
      // Leer el contenido del archivo
      const fileText = await readFileAsText(file);
      
      // Crear integración con configuración optimizada
      const integration = RobustParserIntegration.getInstance({
        useRobustParser: true,
        fallbackToOriginal: true,
        enableComparison: true,
        enableValidation: true,
        parserConfig: {
          enableAdaptiveLearning: true,
          enableFuzzyMatching: true,
          enableCrossValidation: true,
          strictMode: false,
          debugMode: false,
          minConfidenceThreshold: 0.6
        }
      });
      
      // Procesar con el parser robusto
      const result = await integration.processEMGReport(fileText, file.name);
      
      console.log('✅ Parser robusto completado:', {
        success: result.success,
        confidence: result.data?.confidence,
        motorNCS: result.data?.motorNCS.length,
        sensoryNCS: result.data?.sensoryNCS.length,
        needleEMG: result.data?.needleEMG.length
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en parser robusto:', error);
      return {
        success: false,
        data: null,
        recommendations: [],
        errors: [`Error en parser robusto: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings: []
      };
    }
  };

  // 🔄 NUEVA FUNCIÓN: CONVERTIR RESULTADO ROBUSTO A FORMATO EXISTENTE
  const convertRobustResultToExtractedData = (robustData: any) => {
    return {
      patient: {
        name: robustData.patient?.firstName || extractPatientName(file?.name || ''),
        id: robustData.patient?.id || generatePatientId(),
        age: robustData.patient?.age || null,
        sex: robustData.patient?.sex || 'male' as const
      },
      ncsResults: [
        ...robustData.motorNCS.map((ncs: any) => ({
          ...ncs,
          type: 'motor'
        })),
        ...robustData.sensoryNCS.map((ncs: any) => ({
          ...ncs,
          type: 'sensory'
        }))
      ],
      emgResults: robustData.needleEMG || [],
      specialStudies: robustData.specialStudies || [],
      symptoms: inferSymptomsFromRobustData(robustData),
      warnings: robustData.warnings || [],
      quality: {
        confidence: robustData.confidence || 0,
        sectionsFound: (robustData.motorNCS?.length || 0) + (robustData.sensoryNCS?.length || 0) + (robustData.needleEMG?.length || 0),
        processingTime: 0,
        textLength: 0,
        recommendations: robustData.recommendations || []
      }
    };
  };

  // 🧠 FUNCIÓN AUXILIAR: LEER ARCHIVO COMO TEXTO
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // 🧠 FUNCIÓN AUXILIAR: INFERIR SÍNTOMAS DE DATOS ROBUSTOS
  const inferSymptomsFromRobustData = (data: any) => {
    const symptoms: any = {};
    
    // Analizar NCS motor
    if (data.motorNCS?.length > 0) {
      const abnormalMotor = data.motorNCS.filter((ncs: any) => ncs.status === 'abnormal');
      if (abnormalMotor.length > 0) {
        symptoms.weakness = { present: true, severity: 'moderate' };
      }
    }
    
    // Analizar NCS sensitivo
    if (data.sensoryNCS?.length > 0) {
      const abnormalSensory = data.sensoryNCS.filter((ncs: any) => ncs.status === 'abnormal');
      if (abnormalSensory.length > 0) {
        symptoms.paresthesias = { present: true, severity: 'mild' };
      }
    }
    
    // Analizar EMG de aguja
    if (data.needleEMG?.length > 0) {
      const abnormalEMG = data.needleEMG.filter((emg: any) => 
        emg.spontaneousActivity?.fibrillations || emg.spontaneousActivity?.positiveWaves
      );
      if (abnormalEMG.length > 0) {
        symptoms.weakness = { present: true, severity: 'severe' };
        symptoms.pain = { present: true };
      }
    }
    
    return symptoms;
  };

  // 🧠 FUNCIÓN PARA PROCESAR EL ARCHIVO CON EL SISTEMA AVANZADO
  const processFileWithAdvancedSystem = async (file: File) => {
          // 🔥 USAR EL NUEVO SISTEMA INTEGRADO - EnhancedFileConverter
      console.log('🚀 Procesando archivo con EnhancedFileConverter...');
      
      try {
        // Importar el nuevo procesador integrado
        const { EnhancedFileConverter } = await import('../services/enhanced-file-converter');
        
        // Crear procesador con configuración de producción
        const processor = EnhancedFileConverter.getInstance({
          enableOCR: false,
          enableAIEnhancement: false,
          enableValidation: true,
          minConfidenceThreshold: 0.6,
          debugMode: false
        });
      
              // Procesar archivo con sistema completo
        const processingResult = await processor.convert(file);
      
      // Si el procesador reporta errores críticos, detén el flujo; de lo contrario, continúa aun con baja confianza.
      if (!processingResult.success && (processingResult.errors?.length ?? 0) > 0) {
        console.error('❌ Error en procesamiento crítico:', processingResult.errors);
        throw new Error(`Error en procesamiento: ${processingResult.errors.join(', ')}`);
      }
      
      // Los datos ya vienen en formato optimizado
      const extractedData = {
        patient: {
          name: processingResult.data?.patient?.firstName || extractPatientName(file.name),
          id: processingResult.data?.patient?.id || generatePatientId(),
          age: (processingResult.data?.patient as any)?.age || null,
          sex: processingResult.data?.patient?.sex || 'male' as const
        },
        ncsResults: processingResult.data?.ncsResults || [],
        emgResults: processingResult.data?.emgResults || [],
        specialStudies: processingResult.data?.specialStudies || [],
        symptoms: processingResult.data?.clinicalSymptoms || {},
        warnings: processingResult.warnings || [],
        // Metadatos de calidad mejorados
        quality: {
          confidence: processingResult.confidence || 0,
          sectionsFound: processingResult.metadata?.sectionsFound?.length || 0,
          processingTime: processingResult.metadata?.processingTimeMs || 0,
          textLength: processingResult.metadata?.extractedTextLength || 0,
          recommendations: processingResult.data?.recommendations || []
        }
      };

      console.log('✅ Datos extraídos con EnhancedFileConverter:', extractedData);
      console.log('📊 Estadísticas de calidad:', {
        confidence: `${(processingResult.confidence * 100).toFixed(1)}%`,
        sectionsProcessed: processingResult.metadata?.sectionsFound?.length || 0,
        dataPoints: (processingResult.data?.ncsResults?.length || 0) + (processingResult.data?.emgResults?.length || 0),
        processingTime: `${processingResult.metadata?.processingTimeMs}ms`,
        recommendations: processingResult.data?.recommendations?.length || 0
      });
      
      return extractedData;
      
    } catch (error) {
      console.error('❌ Error en EnhancedFileProcessor:', error);
      
      // Fallback mejorado con mejor manejo de errores
      const fallbackData = {
        patient: {
          name: extractPatientName(file.name),
          id: generatePatientId(),
          age: null,
          sex: 'male' as const
        },
        ncsResults: [],
        emgResults: [],
        specialStudies: [],
        symptoms: {},
        warnings: [
          'Error en procesamiento automático con EnhancedFileProcessor',
          'Se utilizaron datos mínimos como fallback',
          `Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`
        ],
        quality: {
          confidence: 0,
          sectionsFound: 0,
          processingTime: 0,
          textLength: 0,
          recommendations: ['Revisar formato del archivo', 'Verificar contenido médico']
        }
      };
      
      console.log('🔄 Usando datos fallback mejorados:', fallbackData);
      return fallbackData;
    }
  };

  // 🧠 FUNCIÓN AUXILIAR PARA INFERIR SÍNTOMAS
  const inferSymptomsFromData = (data: any) => {
    const symptoms: any = {};
    
    if (data?.ncsResults?.length > 0) {
      const hasAbnormalNCS = data.ncsResults.some((ncs: any) => ncs.status === 'abnormal');
      if (hasAbnormalNCS) {
        symptoms.paresthesias = { present: true, severity: 'mild' };
        symptoms.weakness = { present: true, severity: 'mild' };
      }
    }
    
    if (data?.emgResults?.length > 0) {
      const hasAbnormalEMG = data.emgResults.some((emg: any) => 
        emg.spontaneousActivity?.fibrillations || emg.spontaneousActivity?.positiveWaves
      );
      if (hasAbnormalEMG) {
        symptoms.weakness = { present: true, severity: 'moderate' };
        symptoms.pain = { present: true };
      }
    }
    
    return symptoms;
  };

  // 🧠 FUNCIÓN AUXILIAR PARA CALCULAR EDAD
  const calculateAge = (dateOfBirth: string): number => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 0;
    }
  };

  // Funciones auxiliares
  const extractPatientName = (filename: string): string => {
    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    return cleanName || 'Paciente EMG';
  };

  const generatePatientId = (): string => {
    return 'EMG-' + Date.now().toString().slice(-6);
  };

  const getFileIcon = () => {
    if (file?.type.includes('pdf')) return 'PDF';
    if (file?.type.includes('word')) return 'WORD';
    if (file?.type.includes('rtf')) return 'RTF';
    return 'DOC';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al inicio
        </button>

        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Subir Archivo de Evaluación</h1>
          
          {/* 🚀 NUEVO: Opciones del Parser Robusto */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-green-400 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Opciones de Procesamiento
              </h2>
              <button
                onClick={() => setShowParserOptions(!showParserOptions)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showParserOptions ? 'Ocultar' : 'Mostrar'} Opciones
              </button>
            </div>
            
            {showParserOptions && (
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={useRobustParser}
                    onChange={(e) => setUseRobustParser(e.target.checked)}
                    className="rounded"
                  />
                  <div>
                    <span className="font-medium">Usar Parser Robusto</span>
                    <p className="text-sm text-gray-400">
                      Sistema avanzado con validación fisiológica y aprendizaje adaptativo
                    </p>
                  </div>
                </label>
                
                {useRobustParser && (
                  <div className="ml-6 p-3 bg-gray-800 rounded border border-gray-600">
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Ventajas del Parser Robusto:</strong>
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Validación automática de rangos fisiológicos</li>
                      <li>• Soporte para 8+ nervios diferentes</li>
                      <li>• Aprendizaje adaptativo que mejora con cada uso</li>
                      <li>• Fallback automático al sistema original</li>
                      <li>• Comparación automática de resultados</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <span className="text-lg font-medium">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileIcon()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg">
                    Arrastra y suelta tu archivo aquí o{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      selecciona un archivo
                    </button>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Formatos soportados: Word, RTF, PDF • Tamaño máximo: 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
              {errorMessage}
            </div>
          )}

          {/* 🚀 NUEVO: Resultados del Parser Robusto */}
          {robustParserResult && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Resultados del Parser Robusto
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-400">Estado</div>
                  <div className={`font-bold ${robustParserResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {robustParserResult.success ? '✅ Exitoso' : '❌ Fallido'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confianza</div>
                  <div className="font-bold text-blue-400">
                    {robustParserResult.data?.confidence ? 
                      `${(robustParserResult.data.confidence * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">NCS Motor</div>
                  <div className="font-bold text-purple-400">
                    {robustParserResult.data?.motorNCS?.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">EMG Aguja</div>
                  <div className="font-bold text-yellow-400">
                    {robustParserResult.data?.needleEMG?.length || 0}
                  </div>
                </div>
              </div>

              {/* Comparación si está disponible */}
              {robustParserResult.comparison && (
                <div className="mb-3 p-3 bg-gray-800 rounded border border-gray-600">
                  <h4 className="text-md font-semibold mb-2 text-blue-400">Comparación de Métodos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Mejora Completitud:</span>
                      <span className={`ml-2 font-bold ${
                        robustParserResult.comparison.dataCompleteness > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(robustParserResult.comparison.dataCompleteness * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mejora Confianza:</span>
                      <span className={`ml-2 font-bold ${
                        robustParserResult.comparison.confidenceImprovement > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(robustParserResult.comparison.confidenceImprovement * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Score General:</span>
                      <span className={`ml-2 font-bold ${
                        robustParserResult.comparison.overallScore > 0.2 ? 'text-green-400' :
                        robustParserResult.comparison.overallScore < -0.2 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {(robustParserResult.comparison.overallScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {robustParserResult.recommendations.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-md font-semibold mb-2 text-green-400">Recomendaciones</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {robustParserResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {robustParserResult.warnings.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-md font-semibold mb-2 text-yellow-400">Advertencias</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {robustParserResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-400">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".doc,.docx,.rtf,.pdf"
            className="hidden"
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
              className={`
                px-6 py-2 rounded-lg font-medium flex items-center
                ${
                  !file || uploadStatus === 'uploading' || uploadStatus === 'success'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }
              `}
            >
              {uploadStatus === 'uploading' && (
                <React.Fragment>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Procesando...
                </React.Fragment>
              )}
              {uploadStatus === 'success' && (
                <React.Fragment>
                  <Check className="h-5 w-5 mr-2" />
                  ¡Procesado con éxito!
                </React.Fragment>
              )}
              {(uploadStatus === 'idle' || uploadStatus === 'error') && (
                <React.Fragment>
                  <Upload className="h-5 w-5 mr-2" />
                  Procesar archivo
                </React.Fragment>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;