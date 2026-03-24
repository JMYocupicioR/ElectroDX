// GuidedReasoningPanel.tsx — Panel interactivo de razonamiento clínico guiado
// Presenta la cadena de 7 pasos como un acordeón educativo donde el alumno
// puede pensar antes de ver la respuesta de cada paso.

import { useState } from 'react';
import type { CadenaRazonamiento, PasoRazonamiento } from './clinicalReasoningChain';

interface GuidedReasoningPanelProps {
  cadena: CadenaRazonamiento;
  /** Mode: 'reveal' = student clicks to reveal, 'open' = all steps shown */
  mode?: 'reveal' | 'open';
}

// ─── Icon mapping ───
const STEP_ICONS = ['📍', '🔀', '🔬', '🎯', '🗺️', '🔄', '✅'];

const TIPO_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  localizacion: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Localización' },
  discriminacion: { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Discriminación' },
  exclusion: { bg: 'bg-amber-500/20', text: 'text-amber-300', label: 'Exclusión' },
  confirmacion: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Confirmación' },
};

const CONFIANZA_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  alta: { ring: 'ring-green-500/50', bg: 'bg-green-500', text: 'text-green-400' },
  moderada: { ring: 'ring-amber-500/50', bg: 'bg-amber-500', text: 'text-amber-400' },
  baja: { ring: 'ring-red-500/50', bg: 'bg-red-500', text: 'text-red-400' },
};

export default function GuidedReasoningPanel({ cadena, mode = 'reveal' }: GuidedReasoningPanelProps) {
  // Track which steps have been revealed (in 'reveal' mode)
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(
    mode === 'open' ? new Set(cadena.pasos.map(p => p.numero)) : new Set()
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    mode === 'open' ? new Set([1]) : new Set()
  );

  const toggleReveal = (num: number) => {
    setRevealedSteps(prev => new Set(prev).add(num));
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const toggleExpand = (num: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const revealAll = () => {
    setRevealedSteps(new Set(cadena.pasos.map(p => p.numero)));
    setExpandedSteps(new Set(cadena.pasos.map(p => p.numero)));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2.5 rounded-xl">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Razonamiento Clínico Guiado</h3>
            <p className="text-xs text-gray-400">7 pasos para localizar la lesión topográficamente</p>
          </div>
        </div>
        {mode === 'reveal' && (
          <button
            onClick={revealAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
          >
            Revelar todos
          </button>
        )}
      </div>

      {/* Reasoning Chain Summary Bar */}
      <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Cadena de razonamiento</div>
        <div className="text-sm text-gray-200 font-mono leading-relaxed">{cadena.resumenRazonamiento}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-gray-500">Confianza global:</span>
          <div className="flex-1 bg-gray-700/50 rounded-full h-2 max-w-[200px]">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                cadena.nivelConfianzaGlobal >= 70 ? 'bg-green-500' :
                cadena.nivelConfianzaGlobal >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${cadena.nivelConfianzaGlobal}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">{cadena.nivelConfianzaGlobal}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {cadena.pasos.map((paso) => (
          <StepCard
            key={paso.numero}
            paso={paso}
            isRevealed={revealedSteps.has(paso.numero)}
            isExpanded={expandedSteps.has(paso.numero)}
            onReveal={() => toggleReveal(paso.numero)}
            onToggle={() => toggleExpand(paso.numero)}
          />
        ))}
      </div>

      {/* Final Diagnosis */}
      <div className={`rounded-xl p-4 border ${
        cadena.nivelConfianzaGlobal >= 60
          ? 'bg-green-900/20 border-green-700/40'
          : 'bg-amber-900/20 border-amber-700/40'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cadena.nivelConfianzaGlobal >= 60 ? '✅' : '⚠️'}</span>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Diagnóstico topográfico final</div>
            <div className="text-white font-bold text-lg">{cadena.diagnosticoFinal}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual Step Card ───
function StepCard({
  paso,
  isRevealed,
  isExpanded,
  onReveal,
  onToggle,
}: {
  paso: PasoRazonamiento;
  isRevealed: boolean;
  isExpanded: boolean;
  onReveal: () => void;
  onToggle: () => void;
}) {
  const tipoBadge = TIPO_BADGES[paso.tipo];
  const confianzaColor = CONFIANZA_COLORS[paso.confianza];
  const icon = STEP_ICONS[paso.numero - 1] || '📋';

  const indicatorColor = {
    green: 'border-green-500/50 bg-green-900/20',
    amber: 'border-amber-500/50 bg-amber-900/20',
    red: 'border-red-500/50 bg-red-900/20',
    blue: 'border-blue-500/50 bg-blue-900/20',
  }[paso.colorIndicador];

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isRevealed ? indicatorColor : 'border-gray-700/50 bg-gray-800/30'
    }`}>
      {/* Header — Always visible */}
      <button
        onClick={isRevealed ? onToggle : onReveal}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/5 transition-colors"
      >
        {/* Step number circle */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          isRevealed
            ? `${confianzaColor.bg}/20 ${confianzaColor.text} ring-1 ${confianzaColor.ring}`
            : 'bg-gray-700/50 text-gray-400'
        }`}>
          {isRevealed ? icon : paso.numero}
        </div>

        {/* Title + Question */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${isRevealed ? 'text-white' : 'text-gray-300'}`}>
              Paso {paso.numero}: {paso.titulo}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${tipoBadge.bg} ${tipoBadge.text}`}>
              {tipoBadge.label}
            </span>
          </div>
          {!isRevealed && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{paso.preguntaClinica}</p>
          )}
        </div>

        {/* Reveal / Expand indicator */}
        <div className="flex-shrink-0">
          {!isRevealed ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              Piensa y haz clic →
            </span>
          ) : (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded content — Only when revealed AND expanded */}
      {isRevealed && isExpanded && (
        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-white/5 pt-2.5">
          {/* Clinical Question */}
          <div className="bg-indigo-900/15 rounded-lg p-3 border-l-3 border-l-indigo-500">
            <div className="text-[9px] text-indigo-400 uppercase tracking-wider font-semibold mb-1">💭 Pregunta clínica</div>
            <p className="text-sm text-gray-200 leading-relaxed">{paso.preguntaClinica}</p>
          </div>

          {/* Observation */}
          <div className="bg-gray-800/50 rounded-lg p-3 border-l-3 border-l-cyan-500">
            <div className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold mb-1">👁️ Observación (datos)</div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{paso.observacion}</p>
          </div>

          {/* Reasoning */}
          <div className="bg-gray-800/50 rounded-lg p-3 border-l-3 border-l-purple-500">
            <div className="text-[9px] text-purple-400 uppercase tracking-wider font-semibold mb-1">⚙️ Razonamiento</div>
            <p className="text-sm text-gray-300 leading-relaxed">{paso.razonamiento}</p>
          </div>

          {/* Conclusion */}
          <div className={`rounded-lg p-3 border ${
            paso.colorIndicador === 'green' ? 'bg-green-900/20 border-green-700/40' :
            paso.colorIndicador === 'amber' ? 'bg-amber-900/20 border-amber-700/40' :
            paso.colorIndicador === 'red' ? 'bg-red-900/20 border-red-700/40' :
            'bg-blue-900/20 border-blue-700/40'
          }`}>
            <div className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{
              color: paso.colorIndicador === 'green' ? '#4ade80' :
                     paso.colorIndicador === 'amber' ? '#fbbf24' :
                     paso.colorIndicador === 'red' ? '#f87171' : '#60a5fa'
            }}>
              ✓ Conclusión
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">{paso.conclusion}</p>
          </div>

          {/* Teaching Pearl */}
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/10 rounded-lg p-3 border border-amber-700/30">
            <div className="text-[9px] text-amber-400 uppercase tracking-wider font-semibold mb-1">💡 Perla educativa</div>
            <p className="text-sm text-amber-200/90 leading-relaxed">{paso.pistaEducativa}</p>
          </div>

          {/* Confidence indicator */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-gray-500">Confianza del paso:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${confianzaColor.bg}/20 ${confianzaColor.text}`}>
              {paso.confianza.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
