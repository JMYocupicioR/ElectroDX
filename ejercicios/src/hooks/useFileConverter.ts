import * as React from 'react';
import { createConverter, ConversionResult, FileConverterConfig } from '../services/enhanced-file-converter';
import { getEMGAnalysis } from '../services/emgAIAnalysisService';
import { FileConverterUtils } from '../utils/fileConverterUtils';

// 🚀 HOOK PERSONALIZADO MEJORADO PARA CONVERSIÓN DE ARCHIVOS

export interface UseFileConverterOptions {
  config?: Partial<FileConverterConfig>;
  enableAutoAnalysis?: boolean;
  enableBatchProcessing?: boolean;
  onProgress?: (progress: number, step: string) => void;
  onSuccess?: (result: ConversionResult) => void;
  onError?: (error: string) => void;
}

export interface FileProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  results: ConversionResult[];
  errors: string[];
  aiAnalyses: Array<{ fileId: string; analysis: string }>;
  qualityReports: Array<{ fileId: string; report: any }>;
}

export function useFileConverter(options: UseFileConverterOptions = {}) {
  // Estados del procesamiento
  const [state, setState] = useState<FileProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    results: [],
    errors: [],
    aiAnalyses: [],
    qualityReports: []
  });

  // Referencias para limpieza
  const abortControllerRef = useRef<AbortController | null>(null);
  const converter = useRef(createConverter({
    enableValidation: true,
    enableAIEnhancement: options.enableAutoAnalysis ?? true,
    minConfidenceThreshold: 0.7,
    debugMode: process.env.NODE_ENV === 'development',
    ...options.config
  }));

  // Cache para archivos procesados
  const cache = useRef(new FileConverterUtils.Cache());

  // 📁 PROCESAMIENTO DE ARCHIVO ÚNICO
  const processFile = useCallback(async (file: File): Promise<ConversionResult | null> => {
    if (state.isProcessing) {
      throw new Error('Ya hay un procesamiento en curso');
    }

    // Crear controlador de cancelación
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      currentStep: 'Iniciando...',
      errors: []
    }));

    try {
      // Paso 1: Verificar cache
      updateProgress(10, 'Verificando cache...');
      const cachedResult = await cache.current.get(file);
      
      if (cachedResult) {
        updateProgress(100, 'Completado (desde cache)');
        
        setState(prev => ({
          ...prev,
          isProcessing: false,
          results: [...prev.results, cachedResult]
        }));
        
        options.onSuccess?.(cachedResult);
        return cachedResult;
      }

      // Paso 2: Validar archivo
      updateProgress(20, 'Validando archivo...');
      await validateFileBeforeProcessing(file);

      // Paso 3: Conversión
      updateProgress(30, 'Convirtiendo archivo...');
      const result = await converter.current.convert(file);

      if (!result.success) {
        throw new Error(`Error en conversión: ${result.errors.map(e => e.message).join(', ')}`);
      }

      // Paso 4: Guardar en cache
      updateProgress(50, 'Guardando en cache...');
      await cache.current.set(file, result);

      // Paso 5: Análisis con IA (opcional)
      let aiAnalysis = null;
      if (options.enableAutoAnalysis && result.data?.emgResults) {
        updateProgress(70, 'Analizando con IA...');
        aiAnalysis = await performAIAnalysis(result, file.name);
      }

      // Paso 6: Generar reporte de calidad
      updateProgress(90, 'Generando reporte de calidad...');
      const qualityReport = generateQualityReport(result);

      // Finalizar
      updateProgress(100, 'Completado');
      
      const fileId = crypto.randomUUID();
      setState(prev => ({
        ...prev,
        isProcessing: false,
        results: [...prev.results, result],
        ...(aiAnalysis && {
          aiAnalyses: [...prev.aiAnalyses, { fileId, analysis: aiAnalysis }]
        }),
        qualityReports: [...prev.qualityReports, { fileId, report: qualityReport }]
      }));

      options.onSuccess?.(result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, errorMessage],
        progress: 0,
        currentStep: 'Error'
      }));

      options.onError?.(errorMessage);
      return null;
    }
  }, [state.isProcessing, options]);

  // 📚 PROCESAMIENTO POR LOTES
  const processBatch = useCallback(async (files: File[]): Promise<ConversionResult[]> => {
    if (!options.enableBatchProcessing) {
      throw new Error('Procesamiento por lotes no habilitado');
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      currentStep: `Procesando lote de ${files.length} archivos...`,
      errors: [],
      results: []
    }));

    const results: ConversionResult[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileProgress = (i / totalFiles) * 100;
        
        updateProgress(fileProgress, `Procesando archivo ${i + 1}/${totalFiles}: ${file.name}`);
        
        try {
          const result = await converter.current.convert(file);
          results.push(result);
          
          // Guardar en cache
          if (result.success) {
            await cache.current.set(file, result);
          }
          
        } catch (error) {
          const errorMessage = `Error en ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          setState(prev => ({
            ...prev,
            errors: [...prev.errors, errorMessage]
          }));
        }
      }

      // Estadísticas del lote
      const successful = results.filter(r => r.success).length;
      const avgConfidence = successful > 0 
        ? results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) / successful
        : 0;

      updateProgress(100, `Lote completado: ${successful}/${totalFiles} exitosos (${(avgConfidence * 100).toFixed(1)}% confianza promedio)`);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        results: [...prev.results, ...results]
      }));

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en procesamiento por lotes';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, errorMessage]
      }));

      throw error;
    }
  }, [options.enableBatchProcessing]);

  // 🚫 CANCELAR PROCESAMIENTO
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 0,
      currentStep: 'Cancelado'
    }));
  }, []);

  // 🧹 LIMPIAR RESULTADOS
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      errors: [],
      aiAnalyses: [],
      qualityReports: []
    }));
  }, []);

  // 📊 OBTENER ESTADÍSTICAS
  const getStatistics = useCallback(() => {
    const { results } = state;
    const successful = results.filter(r => r.success);
    
    return {
      totalProcessed: results.length,
      successful: successful.length,
      failed: results.length - successful.length,
      averageConfidence: successful.length > 0 
        ? successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length
        : 0,
      averageProcessingTime: successful.length > 0
        ? successful.reduce((sum, r) => sum + r.metadata.processingTimeMs, 0) / successful.length
        : 0,
      cacheStats: cache.current.getStats()
    };
  }, [state.results]);

  // 🔧 FUNCIONES AUXILIARES
  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({ ...prev, progress, currentStep: step }));
    options.onProgress?.(progress, step);
  }, [options]);

  const validateFileBeforeProcessing = async (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size === 0) {
      throw new Error('El archivo está vacío');
    }
    
    if (file.size > maxSize) {
      throw new Error(`Archivo demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    const allowedExtensions = ['rtf', 'pdf', 'docx', 'doc', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`Formato no soportado: ${extension}. Formatos permitidos: ${allowedExtensions.join(', ')}`);
    }
  };

  const performAIAnalysis = async (result: ConversionResult, fileName: string): Promise<string | null> => {
    if (!result.data?.emgResults || result.data.emgResults.length === 0) {
      return null;
    }

    try {
      const patientData = {
        age: calculateAge(result.data.patient.dateOfBirth),
        gender: result.data.patient.sex,
        medicalHistory: result.data.notes
      };

      return await getEMGAnalysis(
        {
          id: crypto.randomUUID(),
          results: result.data.emgResults
        },
        patientData,
        { saveAnalysis: true, patientId: result.data.patient.id }
      );
    } catch (error) {
      console.warn(`Error en análisis IA para ${fileName}:`, error);
      return null;
    }
  };

  const generateQualityReport = (result: ConversionResult) => {
    if (!result.data) return null;
    
    return FileConverterUtils.Quality.generateQualityReport(result.data, '');
  };

  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Retornar API del hook
  return {
    // Estados
    ...state,
    
    // Funciones principales
    processFile,
    processBatch,
    cancelProcessing,
    clearResults,
    
    // Utilidades
    getStatistics,
    
    // Configuración
    updateConfig: (newConfig: Partial<FileConverterConfig>) => {
      converter.current.updateConfig(newConfig);
    },
    
    // Cache
    clearCache: () => cache.current.clear(),
    getCacheStats: () => cache.current.getStats()
  };
} 