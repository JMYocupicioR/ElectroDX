import React, { useState, useCallback } from 'react';
import { RobustEMGParser, ParsedEMGData, ParserConfig } from '../services/robustEMGParser';

interface RobustParserDemoProps {
  reportText?: string;
  onParsingComplete?: (result: ParsedEMGData) => void;
}

const RobustParserDemo: React.FC<RobustParserDemoProps> = ({
  reportText,
  onParsingComplete
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [parsingResult, setParsingResult] = useState<ParsedEMGData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ParserConfig>({
    enableAdaptiveLearning: true,
    enableFuzzyMatching: true,
    enableCrossValidation: true,
    strictMode: false,
    debugMode: false,
    minConfidenceThreshold: 0.6
  });

  const runRobustParsing = useCallback(async () => {
    if (!reportText) {
      setError('No hay texto de reporte disponible');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      console.log('🚀 Iniciando parsing robusto del reporte EMG');
      
      const parser = RobustEMGParser.getInstance(config);
      const result = await parser.parseEMGReport(reportText);
      
      setParsingResult(result);
      
      if (onParsingComplete) {
        onParsingComplete(result);
      }

      console.log('✅ Parsing robusto completado:', result);

    } catch (err) {
      console.error('❌ Error en parsing robusto:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsParsing(false);
    }
  }, [reportText, config, onParsingComplete]);

  const formatConfidence = (confidence: number) => `${(confidence * 100).toFixed(1)}%`;

  const formatValue = (value: number, unit: string) => `${value} ${unit}`;

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-green-400">
        🔍 Demostración: Parser Robusto EMG
      </h2>
      
      <p className="text-gray-300 mb-6">
        Este componente demuestra las capacidades del nuevo parser robusto y adaptativo,
        que soluciona los problemas identificados en la propuesta conceptual original.
      </p>

      {/* Configuración del Parser */}
      <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-green-400">⚙️ Configuración del Parser</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enableAdaptiveLearning}
              onChange={(e) => setConfig(prev => ({ ...prev, enableAdaptiveLearning: e.target.checked }))}
              className="rounded"
            />
            <span>Aprendizaje Adaptativo</span>
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
              checked={config.strictMode}
              onChange={(e) => setConfig(prev => ({ ...prev, strictMode: e.target.checked }))}
              className="rounded"
            />
            <span>Modo Estricto</span>
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

      {/* Botón de Parsing */}
      <div className="mb-6">
        <button
          onClick={runRobustParsing}
          disabled={isParsing || !reportText}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isParsing || !reportText
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isParsing ? '🔍 Parseando...' : '🚀 Ejecutar Parser Robusto'}
        </button>
        
        {!reportText && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ No hay texto de reporte disponible para parsing
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

      {/* Resultados del Parsing */}
      {parsingResult && (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Resumen del Parsing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Confianza</div>
                <div className="text-xl font-bold text-green-400">
                  {formatConfidence(parsingResult.confidence)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">NCS Motor</div>
                <div className="text-xl font-bold text-blue-400">
                  {parsingResult.motorNCS.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">NCS Sensitivo</div>
                <div className="text-xl font-bold text-purple-400">
                  {parsingResult.sensoryNCS.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">EMG Aguja</div>
                <div className="text-xl font-bold text-yellow-400">
                  {parsingResult.needleEMG.length}
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Paciente */}
          {Object.keys(parsingResult.patient).length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">👤 Datos del Paciente</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(parsingResult.patient).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="font-semibold text-gray-200">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados NCS Motor */}
          {parsingResult.motorNCS.length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">⚡ NCS Motor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-2">Nervio</th>
                      <th className="text-left p-2">Lado</th>
                      <th className="text-left p-2">Latencia (ms)</th>
                      <th className="text-left p-2">Amplitud (mV)</th>
                      <th className="text-left p-2">Velocidad (m/s)</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsingResult.motorNCS.map((ncs, index) => (
                      <tr key={ncs.id} className="border-b border-gray-700">
                        <td className="p-2 font-medium">{ncs.nerve}</td>
                        <td className="p-2">{ncs.side}</td>
                        <td className="p-2">{formatValue(ncs.latency, 'ms')}</td>
                        <td className="p-2">{formatValue(ncs.amplitude, 'mV')}</td>
                        <td className="p-2">{ncs.velocity > 0 ? formatValue(ncs.velocity, 'm/s') : 'N/A'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            ncs.status === 'normal' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {ncs.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resultados NCS Sensitivo */}
          {parsingResult.sensoryNCS.length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">🖐️ NCS Sensitivo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-2">Nervio</th>
                      <th className="text-left p-2">Lado</th>
                      <th className="text-left p-2">Latencia (ms)</th>
                      <th className="text-left p-2">Amplitud (μV)</th>
                      <th className="text-left p-2">Velocidad (m/s)</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsingResult.sensoryNCS.map((ncs, index) => (
                      <tr key={ncs.id} className="border-b border-gray-700">
                        <td className="p-2 font-medium">{ncs.nerve}</td>
                        <td className="p-2">{ncs.side}</td>
                        <td className="p-2">{formatValue(ncs.latency, 'ms')}</td>
                        <td className="p-2">{formatValue(ncs.amplitude, 'μV')}</td>
                        <td className="p-2">{ncs.velocity > 0 ? formatValue(ncs.velocity, 'm/s') : 'N/A'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            ncs.status === 'normal' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {ncs.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resultados EMG de Aguja */}
          {parsingResult.needleEMG.length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">🪡 EMG de Aguja</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-2">Músculo</th>
                      <th className="text-left p-2">Lado</th>
                      <th className="text-left p-2">Act. Inserción</th>
                      <th className="text-left p-2">Fibrilaciones</th>
                      <th className="text-left p-2">Ondas Positivas</th>
                      <th className="text-left p-2">Amplitud PUM (μV)</th>
                      <th className="text-left p-2">Duración PUM (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsingResult.needleEMG.map((emg, index) => (
                      <tr key={emg.id} className="border-b border-gray-700">
                        <td className="p-2 font-medium">{emg.muscleOrNerveName}</td>
                        <td className="p-2">{emg.side}</td>
                        <td className="p-2">{emg.insertionalActivity}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            emg.spontaneousActivity.fibrillations ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            {emg.spontaneousActivity.fibrillations ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            emg.spontaneousActivity.positiveWaves ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            {emg.spontaneousActivity.positiveWaves ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="p-2">{formatValue(emg.motorUnitPotentials.amplitude, 'μV')}</td>
                        <td className="p-2">{formatValue(emg.motorUnitPotentials.duration, 'ms')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estudios Especiales */}
          {parsingResult.specialStudies.length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">🔬 Estudios Especiales</h3>
              <div className="space-y-2">
                {parsingResult.specialStudies.map((study, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{study.type.toUpperCase()}</span>
                        <span className="text-gray-400 ml-2">- {study.nerve} ({study.side})</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        study.status === 'normal' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {study.status}
                      </span>
                    </div>
                    {Object.entries(study.values).length > 0 && (
                      <div className="mt-2 text-sm text-gray-300">
                        {Object.entries(study.values).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hallazgos Clínicos */}
          {parsingResult.clinicalFindings.length > 0 && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">🔍 Hallazgos Clínicos</h3>
              <div className="space-y-2">
                {parsingResult.clinicalFindings.map((finding, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium capitalize">{finding.category}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          finding.severity === 'severe' ? 'bg-red-600' :
                          finding.severity === 'moderate' ? 'bg-yellow-600' : 'bg-green-600'
                        }`}>
                          {finding.severity}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatConfidence(finding.confidence)}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-300">{finding.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusión */}
          {parsingResult.conclusion && (
            <div className="p-4 bg-gray-800 rounded border border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-green-400">📝 Conclusión</h3>
              <div className="bg-gray-700 p-3 rounded text-gray-200 whitespace-pre-wrap">
                {parsingResult.conclusion}
              </div>
            </div>
          )}

          {/* Advertencias */}
          {parsingResult.warnings.length > 0 && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">⚠️ Advertencias</h3>
              <ul className="space-y-2">
                {parsingResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span className="text-yellow-200">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Errores */}
          {parsingResult.errors.length > 0 && (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded">
              <h3 className="text-lg font-semibold mb-3 text-red-400">❌ Errores</h3>
              <ul className="space-y-2">
                {parsingResult.errors.map((error, index) => (
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

export default RobustParserDemo; 