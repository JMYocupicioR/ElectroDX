import React, { useState, useCallback, useEffect } from 'react';
import { 
  RobustParserIntegration, 
  IntegrationResult, 
  IntegrationConfig,
  getIntegrationRecommendations,
  getIntegrationBenefits
} from '../services/robustParserIntegration';
import { RobustEMGParser, ParserConfig } from '../services/robustEMGParser';

interface IntegratedEMGParserProps {
  reportText?: string;
  fileName?: string;
  onProcessingComplete?: (result: IntegrationResult) => void;
  onError?: (error: string) => void;
}

const IntegratedEMGParser: React.FC<IntegratedEMGParserProps> = ({
  reportText,
  fileName,
  onProcessingComplete,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<IntegrationConfig>({
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

  const [stats, setStats] = useState<{
    totalProcessed: number;
    successRate: number;
    averageConfidence: number;
    averageProcessingTime: number;
  }>({
    totalProcessed: 0,
    successRate: 0,
    averageConfidence: 0,
    averageProcessingTime: 0
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const integration = RobustParserIntegration.getInstance();
    setStats(integration.getProcessingStats());
  }, []);

  const runIntegratedProcessing = useCallback(async () => {
    if (!reportText) {
      const errorMsg = 'No hay texto de reporte disponible';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔗 Iniciando procesamiento integrado EMG');
      
      const integration = RobustParserIntegration.getInstance(config);
      const processingResult = await integration.processEMGReport(reportText, fileName);
      
      setResult(processingResult);
      
      // Actualizar estadísticas
      setStats(integration.getProcessingStats());
      
      if (processingResult.success) {
        if (onProcessingComplete) {
          onProcessingComplete(processingResult);
        }
        console.log('✅ Procesamiento integrado completado:', processingResult);
      } else {
        const errorMsg = 'El procesamiento no fue exitoso';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }

    } catch (err) {
      console.error('❌ Error en procesamiento integrado:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [reportText, fileName, config, onProcessingComplete, onError]);

  const formatConfidence = (confidence: number) => `${(confidence * 100).toFixed(1)}%`;

  const formatTime = (time: number) => `${time.toFixed(0)}ms`;

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-green-400">
        🔗 Parser EMG Integrado - Sistema Robusto
      </h2>
      
      <p className="text-gray-300 mb-6">
        Sistema integrado que combina el parser robusto con el sistema existente,
        proporcionando fallback automático y comparación de resultados.
      </p>

      {/* Estadísticas del Sistema */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Estadísticas del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Total Procesados</div>
            <div className="text-xl font-bold text-blue-400">{stats.totalProcessed}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Tasa de Éxito</div>
            <div className="text-xl font-bold text-green-400">
              {formatConfidence(stats.successRate)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Confianza Promedio</div>
            <div className="text-xl font-bold text-purple-400">
              {formatConfidence(stats.averageConfidence)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Tiempo Promedio</div>
            <div className="text-xl font-bold text-yellow-400">
              {formatTime(stats.averageProcessingTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Integración */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">⚙️ Configuración de Integración</h3>
        
        {/* Configuración Principal */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.useRobustParser}
              onChange={(e) => setConfig(prev => ({ ...prev, useRobustParser: e.target.checked }))}
              className="rounded"
            />
            <span>Usar Parser Robusto</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.fallbackToOriginal}
              onChange={(e) => setConfig(prev => ({ ...prev, fallbackToOriginal: e.target.checked }))}
              className="rounded"
            />
            <span>Fallback al Original</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableComparison}
              onChange={(e) => setConfig(prev => ({ ...prev, enableComparison: e.target.checked }))}
              className="rounded"
            />
            <span>Comparación Automática</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableValidation}
              onChange={(e) => setConfig(prev => ({ ...prev, enableValidation: e.target.checked }))}
              className="rounded"
            />
            <span>Validación de Resultados</span>
          </label>
        </div>

        {/* Configuración del Parser */}
        {config.parserConfig && (
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-md font-semibold mb-3 text-blue-400">Configuración del Parser Robusto</h4>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.parserConfig.enableAdaptiveLearning}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    parserConfig: { ...prev.parserConfig!, enableAdaptiveLearning: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span>Aprendizaje Adaptativo</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.parserConfig.enableFuzzyMatching}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    parserConfig: { ...prev.parserConfig!, enableFuzzyMatching: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span>Coincidencia Difusa</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.parserConfig.enableCrossValidation}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    parserConfig: { ...prev.parserConfig!, enableCrossValidation: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span>Validación Cruzada</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.parserConfig.strictMode}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    parserConfig: { ...prev.parserConfig!, strictMode: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span>Modo Estricto</span>
              </label>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Umbral de Confianza: {formatConfidence(config.parserConfig.minConfidenceThreshold)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.parserConfig.minConfidenceThreshold}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  parserConfig: { ...prev.parserConfig!, minConfidenceThreshold: parseFloat(e.target.value) }
                }))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botón de Procesamiento */}
      <div className="mb-6">
        <button
          onClick={runIntegratedProcessing}
          disabled={isProcessing || !reportText}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isProcessing || !reportText
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isProcessing ? '🔗 Procesando...' : '🚀 Ejecutar Parser Integrado'}
        </button>
        
        {!reportText && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ No hay texto de reporte disponible para procesamiento
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

      {/* Resultados del Procesamiento */}
      {result && (
        <div className="space-y-6">
          {/* Resumen del Resultado */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📋 Resumen del Procesamiento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Estado</div>
                <div className={`text-xl font-bold ${getStatusColor(result.success)}`}>
                  {result.success ? '✅ Exitoso' : '❌ Fallido'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Confianza</div>
                <div className={`text-xl font-bold ${getConfidenceColor(result.data?.confidence || 0)}`}>
                  {formatConfidence(result.data?.confidence || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Método Usado</div>
                <div className="text-xl font-bold text-blue-400">
                  {result.robustResult ? 'Parser Robusto' : 'Sistema Original'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Datos Extraídos</div>
                <div className="text-xl font-bold text-purple-400">
                  {result.data ? 
                    (result.data.motorNCS.length + result.data.sensoryNCS.length + result.data.needleEMG.length) : 
                    0
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Comparación de Métodos */}
          {result.comparison && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Comparación de Métodos</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Completitud</div>
                  <div className={`text-lg font-bold ${
                    result.comparison.dataCompleteness > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.comparison.dataCompleteness > 0 ? '+' : ''}
                    {(result.comparison.dataCompleteness * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confianza</div>
                  <div className={`text-lg font-bold ${
                    result.comparison.confidenceImprovement > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.comparison.confidenceImprovement > 0 ? '+' : ''}
                    {(result.comparison.confidenceImprovement * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Validación</div>
                  <div className={`text-lg font-bold ${
                    result.comparison.validationScore > 0.7 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {(result.comparison.validationScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tiempo</div>
                  <div className="text-lg font-bold text-blue-400">
                    {formatTime(result.comparison.processingTime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Score General</div>
                  <div className={`text-lg font-bold ${
                    result.comparison.overallScore > 0.2 ? 'text-green-400' :
                    result.comparison.overallScore < -0.2 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {(result.comparison.overallScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {result.recommendations.length > 0 && (
            <div className="p-4 bg-blue-900/30 border border-blue-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">💡 Recomendaciones</h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-200">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advertencias */}
          {result.warnings.length > 0 && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">⚠️ Advertencias</h3>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span className="text-yellow-200">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Errores */}
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-red-400">❌ Errores</h3>
              <ul className="space-y-2">
                {result.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-400">•</span>
                    <span className="text-red-200">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Datos Extraídos (Resumen) */}
          {result.data && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Datos Extraídos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">NCS Motor</div>
                  <div className="text-xl font-bold text-blue-400">
                    {result.data.motorNCS.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">NCS Sensitivo</div>
                  <div className="text-xl font-bold text-purple-400">
                    {result.data.sensoryNCS.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">EMG Aguja</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {result.data.needleEMG.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Estudios Especiales</div>
                  <div className="text-xl font-bold text-green-400">
                    {result.data.specialStudies.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Beneficios del Sistema */}
      <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">🎯 Beneficios del Sistema Integrado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Recomendaciones</h4>
            <ul className="space-y-1 text-sm">
              {getIntegrationRecommendations().map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Beneficios</h4>
            <ul className="space-y-1 text-sm">
              {getIntegrationBenefits().map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-400">•</span>
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedEMGParser; 