import React, { useState } from 'react';
import { Layers, Info } from 'lucide-react';
import type { EMGExerciseResult } from '../../types/ClinicalCase';

interface MyotomeBodyMapProps {
  emgResults: EMGExerciseResult[];
}

export const MyotomeBodyMap: React.FC<MyotomeBodyMapProps> = ({ emgResults }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<EMGExerciseResult | null>(
    emgResults[0] || null
  );

  // Determinar severidad de denervación para un músculo
  const getDenervationGrade = (res: EMGExerciseResult) => {
    const fibs = res.spontaneousActivity.fibrillations;
    const psw = res.spontaneousActivity.positiveWaves;

    if (fibs === '4+' || psw === '4+') return { grade: '4+', level: 'very_severe', color: 'bg-red-600 text-white', border: 'border-red-500' };
    if (fibs === '3+' || psw === '3+') return { grade: '3+', level: 'severe', color: 'bg-rose-500 text-white', border: 'border-rose-400' };
    if (fibs === '2+' || psw === '2+') return { grade: '2+', level: 'moderate', color: 'bg-amber-500 text-slate-950', border: 'border-amber-400' };
    if (fibs === '1+' || psw === '1+') return { grade: '1+', level: 'mild', color: 'bg-yellow-400 text-slate-950', border: 'border-yellow-300' };
    return { grade: '0', level: 'normal', color: 'bg-emerald-600 text-white', border: 'border-emerald-500' };
  };

  // Agrupar por segmento / extremidad
  const upperExtremity = emgResults.filter(r =>
    r.root.includes('C') || r.root.includes('T1') || r.root.includes('Bulbar')
  );
  const lowerExtremity = emgResults.filter(r =>
    r.root.includes('L') || r.root.includes('S')
  );

  return (
    <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Mapeo Anatómico de Miotomas y Raíces</h4>
            <p className="text-[11px] text-slate-400">
              Correlación de músculos explorados con distribución segmentaria y nervio periférico
            </p>
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="flex items-center gap-2 text-[10px] font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Denervación Leve/Mod (1-2+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Denervación Severa (3-4+)
          </span>
        </div>
      </div>

      {/* Cuadrícula de Distribución Anatómica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Miembro Superior / Región Cervical */}
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
            <span>Miembro Superior / Cervical</span>
            <span className="text-[10px] text-slate-500">{upperExtremity.length} músculos</span>
          </div>

          {upperExtremity.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No se evaluaron músculos de miembro superior en este caso.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {upperExtremity.map((res, i) => {
                const badge = getDenervationGrade(res);
                const isSelected = selectedMuscle?.muscle === res.muscle;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedMuscle(res)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{res.muscle}</span>
                        {res.muscle.toLowerCase().includes('paraspinal') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-semibold">
                            Raíz Pura
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Raíz: <strong className="text-indigo-300">{res.root}</strong> · Nervio: {res.nerve}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badge.color}`}>
                        {badge.grade === '0' ? 'Normal' : `Denerv. ${badge.grade}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Miembro Inferior / Región Lumbosacra */}
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
            <span>Miembro Inferior / Lumbosacro</span>
            <span className="text-[10px] text-slate-500">{lowerExtremity.length} músculos</span>
          </div>

          {lowerExtremity.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No se evaluaron músculos de miembro inferior en este caso.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {lowerExtremity.map((res, i) => {
                const badge = getDenervationGrade(res);
                const isSelected = selectedMuscle?.muscle === res.muscle;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedMuscle(res)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{res.muscle}</span>
                        {res.muscle.toLowerCase().includes('tibialis posterior') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-semibold">
                            Clave L5
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Raíz: <strong className="text-indigo-300">{res.root}</strong> · Nervio: {res.nerve}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badge.color}`}>
                        {badge.grade === '0' ? 'Normal' : `Denerv. ${badge.grade}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ficha Diagnóstica del Músculo Seleccionado */}
      {selectedMuscle && (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Detalle Neuroanatómico: {selectedMuscle.muscle}
            </span>
            <span className="text-[11px] text-indigo-300 font-medium">
              Raíz: {selectedMuscle.root} | Nervio: {selectedMuscle.nerve}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Act. Inserción</span>
              <strong className="text-slate-200">{selectedMuscle.insertionalActivity}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Fibrilaciones / PSW</span>
              <strong className={selectedMuscle.spontaneousActivity.fibrillations !== 'absent' ? 'text-red-400' : 'text-emerald-400'}>
                {selectedMuscle.spontaneousActivity.fibrillations} / {selectedMuscle.spontaneousActivity.positiveWaves}
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">PUM Duración / Amp</span>
              <strong className="text-slate-200">
                {selectedMuscle.motorUnitPotentials.duration} ms / {selectedMuscle.motorUnitPotentials.amplitude} μV
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Reclutamiento</span>
              <strong className={selectedMuscle.recruitmentPattern !== 'normal' ? 'text-amber-400' : 'text-emerald-400'}>
                {selectedMuscle.recruitmentPattern}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
