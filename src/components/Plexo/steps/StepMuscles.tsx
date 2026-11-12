import { MUSCULOS_POR_REGION, OPCIONES_MRC, INERVACION_DUAL, type DatosEvaluacion } from '../plexoBraquial';
import { motion } from 'framer-motion';

interface Props {
  datos: DatosEvaluacion;
  onUpdate: (musculo: string, fuerza: number) => void;
}

const mrcColors: Record<number, string> = {
  0: 'bg-red-500 text-white',
  1: 'bg-red-400 text-white',
  2: 'bg-orange-400 text-white',
  3: 'bg-yellow-400 text-slate-900',
  4: 'bg-lime-400 text-slate-900',
  5: 'bg-emerald-400 text-slate-900',
};

const mrcBorder: Record<number, string> = {
  0: 'border-red-500',
  1: 'border-red-400',
  2: 'border-orange-400',
  3: 'border-yellow-400',
  4: 'border-lime-400',
  5: 'border-emerald-300',
};

export default function StepMuscles({ datos, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">💪</span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Evaluación Muscular (Escala MRC)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Modifique solo los músculos con debilidad. Por defecto todos están en 5 (normal).</p>
        </div>
      </div>

      {/* MRC Legend */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30">
        {OPCIONES_MRC.map(o => (
          <span key={o.value} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${mrcColors[o.value]}`}>
            {o.value} <span className="hidden sm:inline">- {o.label.split(' - ')[1]}</span>
          </span>
        ))}
      </div>

      {Object.entries(MUSCULOS_POR_REGION).map(([region, musculos]) => (
        <motion.div
          key={region}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 overflow-hidden"
        >
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200/50 dark:border-slate-700/30">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{region}</h4>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {musculos.map(musculo => {
              const mrc = datos.fuerzasMuscular[musculo] ?? 5;
              const evaluado = !datos.musculosEvaluados || datos.musculosEvaluados.includes(musculo);
              const dualInfo = INERVACION_DUAL[musculo];

              return (
                <div key={musculo} className={`flex items-center gap-3 px-4 py-3 transition-colors ${mrc < 5 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{musculo}</span>
                      {!evaluado && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 shrink-0">
                          sin evaluar
                        </span>
                      )}
                      {dualInfo && (
                        <span className="relative group">
                          <span className="text-xs text-amber-500 cursor-help">⚡dual</span>
                          <span className="absolute bottom-full left-0 mb-1 w-56 p-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                            {dualInfo.principal} + {dualInfo.secundario}: {dualInfo.relevanciaClinica}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => onUpdate(musculo, val)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 border-2 ${
                          mrc === val
                            ? `${mrcColors[val]} ${mrcBorder[val]} scale-110 shadow-md`
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
