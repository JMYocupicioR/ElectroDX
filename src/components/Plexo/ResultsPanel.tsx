import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { type ResultadoDiagnostico, type HallazgoInervacionDual, type DatosEvaluacion, EXPLICACIONES_ANATOMICAS } from './plexoBraquial';
import { generarCadenaRazonamiento } from './clinicalReasoningChain';
import GuidedReasoningPanel from './GuidedReasoningPanel';

interface Props {
  resultados: ResultadoDiagnostico[];
  hallazgos: HallazgoInervacionDual[];
  datos: DatosEvaluacion;
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? 'from-emerald-400 to-emerald-600' :
    pct >= 50 ? 'from-amber-400 to-amber-600' :
    'from-red-400 to-red-600';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Coincidencia</span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    radicular: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    tronco: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    fasciculo: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    nervio_periferico: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    combinada: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    obstetrica: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    traumatica: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    iatrogena: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[cat] || 'bg-slate-100 text-slate-600'}`}>
      {cat.replace('_', ' ')}
    </span>
  );
}

export default function ResultsPanel({ resultados, hallazgos, datos }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [showReasoning, setShowReasoning] = useState(false);

  // Generate reasoning chain
  const cadenaRazonamiento = useMemo(() => {
    if (resultados.length > 0 && datos) {
      return generarCadenaRazonamiento(datos, resultados);
    }
    return null;
  }, [resultados, datos]);

  if (resultados.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">🔍</span>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Sin diagnósticos compatibles</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Los hallazgos ingresados no alcanzan el umbral para ningún diagnóstico. Revise la evaluación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Diagnósticos Probables</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{resultados.length} diagnóstico{resultados.length !== 1 ? 's' : ''} supera{resultados.length === 1 ? '' : 'n'} el umbral</p>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {resultados.map((r, idx) => {
          const isExpanded = expandedIdx === idx;
          const expl = EXPLICACIONES_ANATOMICAS[r.nombreLesion];

          return (
            <motion.div
              key={r.nombreLesion}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl border-2 overflow-hidden transition-colors ${
                idx === 0 ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40'
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {idx === 0 && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">🥇 Más probable</span>}
                      <CategoryBadge cat={r.categoria} />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{r.nombreLesion}</h4>
                  </div>
                  <span className="text-slate-400 text-xl transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                </div>
                <div className="mt-3">
                  <ConfidenceBar score={r.normalizedScore} />
                </div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="p-5 space-y-5">
                      {/* Muscles */}
                      <div>
                        <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">💪 Músculos Evaluados</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {r.detalles.musculos.map(m => (
                            <span key={m.nombre} className={`text-xs px-2 py-1 rounded-md font-medium ${
                              m.esperado && m.mrc < 5
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : m.esperado
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {m.nombre} (MRC {m.mrc})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Reflexes */}
                      <div>
                        <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔨 Reflejos</h5>
                        <div className="flex flex-wrap gap-2">
                          {r.detalles.reflejos.map(ref => (
                            <span key={ref.nombre} className={`text-xs px-2 py-1 rounded-md font-medium ${ref.match ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                              {ref.nombre}: {ref.encontrado} {ref.match ? '✓' : `(esperado: ${ref.esperado})`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sensory Areas */}
                      {r.detalles.sensibilidad.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🖐️ Áreas Sensitivas</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{r.detalles.sensibilidad.join(', ')}</p>
                        </div>
                      )}

                      {/* Peripheral Nerves */}
                      {r.detalles.nerviosPerifericos.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚡ Nervios Periféricos</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{r.detalles.nerviosPerifericos.join(', ')}</p>
                        </div>
                      )}

                      {/* Anatomical Path */}
                      {expl && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30">
                          <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">🗺️ Recorrido Anatómico</h5>
                          <div className="flex flex-wrap items-center gap-2">
                            {expl.recorrido.map((paso, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                  {paso.icono} {paso.estructura}
                                </span>
                                {i < expl.recorrido.length - 1 && <span className="text-blue-400">→</span>}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 italic">{expl.correlacionClinica}</p>
                        </div>
                      )}

                      {/* Severity & Prognosis */}
                      {r.severidadEsperada && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Severidad (Sunderland)</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">Grado {r.severidadEsperada.grado}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pronóstico</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{r.severidadEsperada.pronostico}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Recuperación</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.severidadEsperada.tiempoRecuperacion}</p>
                          </div>
                        </div>
                      )}

                      {/* Confidence Indicators */}
                      {r.indicadoresConfianza && (
                        <div className="space-y-2">
                          {r.indicadoresConfianza.factoresPositivos.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {r.indicadoresConfianza.factoresPositivos.map((f, i) => (
                                <span key={i} className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 rounded-md">✅ {f}</span>
                              ))}
                            </div>
                          )}
                          {r.indicadoresConfianza.factoresNegativos.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {r.indicadoresConfianza.factoresNegativos.map((f, i) => (
                                <span key={i} className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-md">⚠️ {f}</span>
                              ))}
                            </div>
                          )}
                          {r.indicadoresConfianza.estudiosRecomendados && (
                            <div className="flex flex-wrap gap-1.5">
                              {r.indicadoresConfianza.estudiosRecomendados.map((e, i) => (
                                <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md">📋 {e}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* 🧠 Guided Clinical Reasoning */}
      {cadenaRazonamiento && (
        <div className="rounded-xl border-2 border-indigo-300 dark:border-indigo-600/50 overflow-hidden">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div className="text-left">
                <h4 className="font-bold text-indigo-700 dark:text-indigo-300">Razonamiento Clínico Paso a Paso</h4>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">7 pasos para entender CÓMO se llega al diagnóstico topográfico</p>
              </div>
            </div>
            <span className={`text-indigo-400 text-xl transition-transform ${showReasoning ? 'rotate-180' : ''}`}>▾</span>
          </button>
          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-indigo-200 dark:border-indigo-700/30"
              >
                <div className="p-5 bg-slate-900/80">
                  <GuidedReasoningPanel cadena={cadenaRazonamiento} mode="reveal" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Dual Innervation Findings */}
      {hallazgos.length > 0 && (
        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300 mb-3">
            <span>⚡</span> Hallazgos de Inervación Dual
          </h4>
          <div className="space-y-2">
            {hallazgos.map(h => (
              <div key={h.musculo} className="flex items-start gap-2 text-sm">
                <span className={`inline-block w-2 h-2 mt-1.5 rounded-full ${h.relevancia === 'Alta' ? 'bg-red-500' : h.relevancia === 'Moderada' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{h.musculo}</span>
                  <span className="text-slate-500 dark:text-slate-400"> (MRC {h.mrc}): </span>
                  <span className="text-slate-600 dark:text-slate-300">{h.interpretacion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temporal Analysis */}
      {resultados[0]?.analisisTemporal && (
        <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-700/30 p-5">
          <h4 className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <span>⏱️</span> Análisis Temporal — Fase: {resultados[0].analisisTemporal.faseEvolutiva}
          </h4>
          <ul className="space-y-1.5">
            {resultados[0].analisisTemporal.factoresPronostico.map((f, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
