import React, { useState, useCallback } from 'react';
import { EnhancedEMGAnalyzer, EMGReportContainer } from '../services/enhancedEMGAnalyzer';
import { ModularEMGIntegrationService, ModularIntegrationResult } from '../services/modularEMGIntegrationService';
import { ConversionResult } from '../services/enhanced-file-converter';

interface ModularEMGAnalysisDemoProps {
  originalResult?: ConversionResult;
  fileContent?: string;
  fileName?: string;
  onAnalysisComplete?: (result: ModularIntegrationResult) => void;
}

const ModularEMGAnalysisDemo: React.FC<ModularEMGAnalysisDemoProps> = ({
  originalResult,
  fileContent,
  fileName,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ModularIntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    enableStrictValidation: true,
    enableFuzzyMatching: true,
    enableCrossValidation: true,
    minConfidenceThreshold: 0.6,
    debugMode: false
  });

  const runModularAnalysis = useCallback(async () => {
    if (!fileContent || !fileName) {
      setError('No hay contenido de archivo disponible');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🚀 Iniciando demostración de análisis modular EMG');
      
      // 1. Análisis modular directo
      const analyzer = EnhancedEMGAnalyzer.getInstance(config);
      const modularResult = await analyzer.analyzeCompleteReport(fileContent, fileName);
      
      console.log('📊 Resultado del análisis modular:', modularResult);

      // 2. Integración con sistema existente (si hay resultado original)
      let integrationResult: ModularIntegrationResult;
      
      if (originalResult) {
        const integrationService = ModularEMGIntegrationService.getInstance({
          enableModularAnalysis: true,
          enableFallbackToOriginal: true,
          enableQualityComparison: true,
          enableDetailedLogging: config.debugMode,
          modularConfig: config
        });

        integrationResult = await integrationService.integrateAnalysis(
          originalResult,
          fileContent,
          fileName
        );
      } else {
        // Simular resultado de integración solo con análisis modular
        integrationResult = {
          success: modularResult.confidence > 0,
          originalResult: { success: false, errors: [], warnings: [], confidence: 0, metadata: {} as any },
          enhancedResult: modularResult,
          integrationMetrics: {
            improvementScore: modularResult.confidence,
            newDataExtracted: modularResult.motorNCS.length + modularResult.sensoryNCS.length + modularResult.needleEMG.length,
            confidenceIncrease: modularResult.confidence,
            processingTime: 0
          },
          recommendations: ['Análisis modular completado exitosamente'],
          warnings: []
        };
      }

      setAnalysisResult(integrationResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(integrationResult);
      }

      console.log('✅ Demostración completada:', integrationResult);

    } catch (err) {
      console.error('❌ Error en demostración:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsAnalyzing(false);
    }
  }, [fileContent, fileName, originalResult, config, onAnalysisComplete]);

  const formatConfidence = (confidence: number) => `${(confidence * 100).toFixed(1)}%`;

  const formatProcessingTime = (time: number) => `${time}ms`;

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">
        🚀 Demostración: Análisis Modular EMG
      </h2>
      
      <p className="text-gray-300 mb-6">
        Este componente demuestra las capacidades del nuevo sistema de análisis modular EMG,
        basado en la propuesta de arquitectura mejorada.
      </p>

      {/* Configuración */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">⚙️ Configuración</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableStrictValidation}
              onChange={(e) => setConfig(prev => ({ ...prev, enableStrictValidation: e.target.checked }))}
              className="rounded"
            />
            <span>Validación Estricta</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableFuzzyMatching}
              onChange={(e) => setConfig(prev => ({ ...prev, enableFuzzyMatching: e.target.checked }))}
              className="rounded"
            />
            <span>Coincidencia Difusa</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableCrossValidation}
              onChange={(e) => setConfig(prev => ({ ...prev, enableCrossValidation: e.target.checked }))}
              className="rounded"
            />
            <span>Validación Cruzada</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.debugMode}
              onChange={(e) => setConfig(prev => ({ ...prev, debugMode: e.target.checked }))}
              className="rounded"
            />
            <span>Modo Debug</span>
          </label>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Umbral de Confianza: {formatConfidence(config.minConfidenceThreshold)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.minConfidenceThreshold}
            onChange={(e) => setConfig(prev => ({ ...prev, minConfidenceThreshold: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Botón de análisis */}
      <div className="mb-6">
        <button
          onClick={runModularAnalysis}
          disabled={isAnalyzing || !fileContent}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isAnalyzing || !fileContent
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isAnalyzing ? '🔄 Analizando...' : '🚀 Ejecutar Análisis Modular'}
        </button>
        
        {!fileContent && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ No hay contenido de archivo disponible para análisis
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded">
          <h3 className="text-red-400 font-semibold mb-2">❌ Error</h3>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Resumen general */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Resumen General</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Confianza Original</div>
                <div className="text-xl font-bold text-blue-400">
                  {formatConfidence(analysisResult.originalResult.confidence)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Confianza Mejorada</div>
                <div className="text-xl font-bold text-green-400">
                  {formatConfidence(analysisResult.enhancedResult.confidence)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Mejora</div>
                <div className="text-xl font-bold text-yellow-400">
                  +{formatConfidence(analysisResult.integrationMetrics.confidenceIncrease)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Tiempo</div>
                <div className="text-xl font-bold text-purple-400">
                  {formatProcessingTime(analysisResult.integrationMetrics.processingTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de integración */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📈 Métricas de Integración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Puntuación de Mejora</div>
                <div className="text-2xl font-bold text-green-400">
                  {(analysisResult.integrationMetrics.improvementScore * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Nuevos Datos</div>
                <div className="text-2xl font-bold text-blue-400">
                  {analysisResult.integrationMetrics.newDataExtracted}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Puntuación de Calidad</div>
                <div className="text-2xl font-bold text-purple-400">
                  {(analysisResult.enhancedResult.qualityMetrics.validationScore * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Datos extraídos */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📋 Datos Extraídos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">NCS Motor</div>
                <div className="text-xl font-bold text-blue-400">
                  {analysisResult.enhancedResult.motorNCS.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">NCS Sensitivo</div>
                <div className="text-xl font-bold text-green-400">
                  {analysisResult.enhancedResult.sensoryNCS.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">EMG Aguja</div>
                <div className="text-xl font-bold text-yellow-400">
                  {analysisResult.enhancedResult.needleEMG.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Estudios Especiales</div>
                <div className="text-xl font-bold text-purple-400">
                  {analysisResult.enhancedResult.fWaves.length + analysisResult.enhancedResult.hReflexes.length}
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          {analysisResult.recommendations.length > 0 && (
            <div className="p-4 bg-blue-900/30 border border-blue-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">💡 Recomendaciones</h3>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advertencias */}
          {analysisResult.warnings.length > 0 && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">⚠️ Advertencias</h3>
              <ul className="space-y-2">
                {analysisResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span className="text-yellow-200">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detalles del paciente */}
          {Object.keys(analysisResult.enhancedResult.patientInfo).length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">👤 Información del Paciente</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysisResult.enhancedResult.patientInfo).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="font-semibold text-gray-200">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusión */}
          {analysisResult.enhancedResult.conclusion && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">📝 Conclusión</h3>
              <div className="bg-gray-700 p-3 rounded text-gray-200 whitespace-pre-wrap">
                {analysisResult.enhancedResult.conclusion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModularEMGAnalysisDemo; 