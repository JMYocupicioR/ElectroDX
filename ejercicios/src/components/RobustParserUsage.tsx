import React, { useState } from 'react';
import { RobustParserIntegration, IntegrationResult } from '../services/robustParserIntegration';
import { RobustEMGParser, ParsedEMGData } from '../services/robustEMGParser';

interface RobustParserUsageProps {
  reportText?: string;
  fileName?: string;
  onResult?: (result: IntegrationResult) => void;
}

const RobustParserUsage: React.FC<RobustParserUsageProps> = ({
  reportText,
  fileName,
  onResult
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useIntegration, setUseIntegration] = useState(true);

  const runRobustParser = async () => {
    if (!reportText) {
      setError('No hay texto de reporte disponible');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let processingResult: IntegrationResult;

      if (useIntegration) {
        // Usar el sistema integrado
        console.log('🔗 Usando sistema integrado...');
        const integration = RobustParserIntegration.getInstance({
          useRobustParser: true,
          fallbackToOriginal: true,
          enableComparison: true,
          enableValidation: true
        });
        processingResult = await integration.processEMGReport(reportText, fileName);
      } else {
        // Usar solo el parser robusto
        console.log('🚀 Usando solo parser robusto...');
        const parser = RobustEMGParser.getInstance();
        const parsedData = await parser.parseEMGReport(reportText);
        
        processingResult = {
          success: parsedData.confidence > 0.5,
          data: parsedData,
          recommendations: [],
          errors: parsedData.errors,
          warnings: parsedData.warnings
        };
      }

      setResult(processingResult);
      
      if (onResult) {
        onResult(processingResult);
      }

      console.log('✅ Procesamiento completado:', processingResult);

    } catch (err) {
      console.error('❌ Error en procesamiento:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatConfidence = (confidence: number) => `${(confidence * 100).toFixed(1)}%`;

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-green-400">
        🔗 Uso del Parser Robusto
      </h2>
      
      <p className="text-gray-300 mb-6">
        Este componente demuestra cómo usar el parser robusto de forma independiente
        o integrado con el sistema existente.
      </p>

      {/* Opciones de Procesamiento */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">⚙️ Opciones de Procesamiento</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              checked={useIntegration}
              onChange={() => setUseIntegration(true)}
              className="rounded"
            />
            <div>
              <span className="font-medium">Sistema Integrado</span>
              <p className="text-sm text-gray-400">
                Combina parser robusto con sistema original + fallback automático
              </p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              checked={!useIntegration}
              onChange={() => setUseIntegration(false)}
              className="rounded"
            />
            <div>
              <span className="font-medium">Solo Parser Robusto</span>
              <p className="text-sm text-gray-400">
                Usa únicamente el parser robusto sin integración
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Botón de Procesamiento */}
      <div className="mb-6">
        <button
          onClick={runRobustParser}
          disabled={isProcessing || !reportText}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isProcessing || !reportText
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isProcessing ? '🔍 Procesando...' : '🚀 Ejecutar Parser Robusto'}
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

      {/* Resultados */}
      {result && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Resumen del Procesamiento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Estado</div>
                <div className={`text-xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? '✅ Exitoso' : '❌ Fallido'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Confianza</div>
                <div className="text-xl font-bold text-blue-400">
                  {result.data?.confidence ? formatConfidence(result.data.confidence) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">NCS Motor</div>
                <div className="text-xl font-bold text-purple-400">
                  {result.data?.motorNCS?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">EMG Aguja</div>
                <div className="text-xl font-bold text-yellow-400">
                  {result.data?.needleEMG?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Comparación */}
          {result.comparison && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">📈 Comparación de Métodos</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Completitud</div>
                  <div className={`font-bold ${
                    result.comparison.dataCompleteness > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(result.comparison.dataCompleteness * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confianza</div>
                  <div className={`font-bold ${
                    result.comparison.confidenceImprovement > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(result.comparison.confidenceImprovement * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Validación</div>
                  <div className="font-bold text-blue-400">
                    {(result.comparison.validationScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tiempo</div>
                  <div className="font-bold text-yellow-400">
                    {result.comparison.processingTime}ms
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Score General</div>
                  <div className={`font-bold ${
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
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-200">{rec}</span>
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
        </div>
      )}
    </div>
  );
};

export default RobustParserUsage; 