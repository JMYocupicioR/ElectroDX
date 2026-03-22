import * as React from 'react';
import { Plus, Trash2, Save, AlertTriangle, Activity } from 'lucide-react';

// Tipos de datos para EMG
interface EMGMotorUnitPotential {
  amplitude: number; // μV
  duration: number;  // ms
  polyphasia: number; // %
  // Podríamos añadir morfología, frecuencia de reclutamiento, etc.
}

interface EMGSpontaneousActivity {
  fibrillations: boolean;
  positiveWaves: boolean;
  fasciculations: boolean;
  // Podríamos añadir descargas miotónicas, CRDs, etc.
}

export interface EMGNerveRecord {
  id: string; // ID único para esta entrada de registro
  muscleOrNerveName: string; // Nombre del músculo o nervio evaluado
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased' | 'absent' | '';
  spontaneousActivity: EMGSpontaneousActivity;
  motorUnitPotentials: EMGMotorUnitPotential;
  recruitmentPattern: 'normal' | 'reduced_incomplete' | 'reduced_complete' | 'early' | 'discrete' | '';
  interpretationNotes?: string; // Notas opcionales para este registro específico
}

interface EMGNeedleAnalysisProps {
  onComplete: (data: EMGNerveRecord[]) => void; // Actualizado para enviar un array de registros
  initialData?: EMGNerveRecord[]; // 🔥 NUEVO: Soporte para datos iniciales
}

// Lista simplificada de músculos/nervios para EMG. Esto podría venir de un archivo de datos.
const emgMusclesDatabase: { id: string; name: string }[] = [
  { id: 'deltoid', name: 'Deltoides' },
  { id: 'biceps_brachii', name: 'Bíceps Braquial' },
  { id: 'triceps_brachii', name: 'Tríceps Braquial' },
  { id: 'first_dorsal_interosseous', name: '1er Interóseo Dorsal (Mano)' },
  { id: 'abductor_pollicis_brevis', name: 'Abductor Corto del Pulgar (APB)' },
  { id: 'tibialis_anterior', name: 'Tibial Anterior' },
  { id: 'gastrocnemius_medial', name: 'Gastrocnemio Medial' },
  { id: 'vastus_medialis', name: 'Vasto Medial' },
  { id: 'lumbar_paraspinals', name: 'Paraespinales Lumbares' },
];

const initialCurrentRecordState: Partial<EMGNerveRecord> = {
  muscleOrNerveName: '',
  side: 'right',
  insertionalActivity: '',
  spontaneousActivity: {
    fibrillations: false,
    positiveWaves: false,
    fasciculations: false,
  },
  motorUnitPotentials: {
    amplitude: 0,
    duration: 0,
    polyphasia: 0,
  },
  recruitmentPattern: '',
  interpretationNotes: '',
};

const EMGNeedleAnalysis: React.FC<EMGNeedleAnalysisProps> = ({ onComplete, initialData }) => {
  const [emgRecords, setEmgRecords] = React.useState<EMGNerveRecord[]>([]);
  const [currentRecord, setCurrentRecord] = React.useState<Partial<EMGNerveRecord>>(initialCurrentRecordState);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // 🔥 Auto-fill effect para cargar datos iniciales EMG
  React.useEffect(() => {
    if (initialData) {
      console.log('🔬 EMGNeedleAnalysis: Cargando datos iniciales...', initialData);
      console.log('🔍 Estructura de initialData EMG:', {
        hasInitialData: !!initialData,
        isArray: Array.isArray(initialData),
        length: Array.isArray(initialData) ? initialData.length : 0,
        dataType: typeof initialData
      });
      
      if (Array.isArray(initialData) && initialData.length > 0) {
        console.log(`📊 Auto-llenando ${initialData.length} registros EMG`);
        
        // Verificar estructura de cada registro EMG
        initialData.forEach((emg, index) => {
          console.log(`   EMG ${index + 1}:`, {
            id: emg.id,
            muscleOrNerveName: emg.muscleOrNerveName,
            side: emg.side,
            insertionalActivity: emg.insertionalActivity,
            hasRequiredFields: !!(emg.id && emg.muscleOrNerveName && emg.side)
          });
        });
        
        // Cargar registros EMG existentes
        setEmgRecords(initialData);
        
        console.log('✅ EMGNeedleAnalysis: Datos iniciales cargados exitosamente');
        console.log('🎯 Registros EMG cargados:', initialData.map(record => 
          `${record.muscleOrNerveName} (${record.side})`
        ).join(', '));
        
        // 🔥 FORZAR RE-RENDER para asegurar que la lista se actualice
        setTimeout(() => {
          console.log('🔄 Estado actual de emgRecords:', emgRecords.length);
          console.log('🔄 Estado actual de setEmgRecords después de timeout:', initialData.length);
        }, 100);
      } else {
        console.warn('⚠️ No hay datos EMG válidos para cargar:', {
          exists: !!initialData,
          isArray: Array.isArray(initialData),
          length: Array.isArray(initialData) ? initialData.length : 0
        });
      }
    } else {
      console.warn('⚠️ EMGNeedleAnalysis: No se recibieron datos iniciales');
    }
  }, [initialData]);

  const handleInputChange = (field: keyof EMGNerveRecord, value: any) => {
    setCurrentRecord(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (
    section: 'spontaneousActivity' | 'motorUnitPotentials',
    field: keyof EMGSpontaneousActivity | keyof EMGMotorUnitPotential,
    value: any
  ) => {
    setCurrentRecord(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const validateCurrentRecord = (): boolean => {
    const errors: Record<string, string> = {};
    if (!currentRecord.muscleOrNerveName) errors.muscleOrNerveName = 'Seleccione un músculo/nervio.';
    if (!currentRecord.insertionalActivity) errors.insertionalActivity = 'Seleccione actividad de inserción.';
    if (currentRecord.motorUnitPotentials?.amplitude === undefined || currentRecord.motorUnitPotentials.amplitude < 0) errors.mup_amplitude = 'Amplitud PUM inválida.';
    if (currentRecord.motorUnitPotentials?.duration === undefined || currentRecord.motorUnitPotentials.duration < 0) errors.mup_duration = 'Duración PUM inválida.';
    if (currentRecord.motorUnitPotentials?.polyphasia === undefined || currentRecord.motorUnitPotentials.polyphasia < 0 || currentRecord.motorUnitPotentials.polyphasia > 100) errors.mup_polyphasia = 'Polifasia PUM inválida (0-100%).';
    if (!currentRecord.recruitmentPattern) errors.recruitmentPattern = 'Seleccione patrón de reclutamiento.';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addEmgRecord = () => {
    if (!validateCurrentRecord()) return;

    const newRecord: EMGNerveRecord = {
      id: crypto.randomUUID(),
      muscleOrNerveName: currentRecord.muscleOrNerveName!,
      side: currentRecord.side!,
      insertionalActivity: currentRecord.insertionalActivity!,
      spontaneousActivity: currentRecord.spontaneousActivity!,
      motorUnitPotentials: currentRecord.motorUnitPotentials!,
      recruitmentPattern: currentRecord.recruitmentPattern!,
      interpretationNotes: currentRecord.interpretationNotes,
    };
    setEmgRecords(prev => [...prev, newRecord]);
    setCurrentRecord(initialCurrentRecordState); // Reset form
    setValidationErrors({});
  };

  const removeEmgRecord = (id: string) => {
    setEmgRecords(prev => prev.filter(record => record.id !== id));
  };

  const handleSaveEvaluation = () => {
    if (emgRecords.length === 0) {
      setValidationErrors({ form: 'Debe agregar al menos un registro EMG.' });
      return;
    }
    onComplete(emgRecords);
  };
  
  const getMuscleDisplayName = (id: string) => emgMusclesDatabase.find(m => m.id === id)?.name || id;

  return (
    <div className="space-y-6">
      {validationErrors.form && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-md flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-300 text-sm">{validationErrors.form}</span>
        </div>
      )}

      {/* Formulario para agregar nuevo registro EMG */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50 space-y-6">
        <h3 className="text-xl font-semibold text-gray-200">Agregar Registro EMG por Músculo/Nervio</h3>

        {/* Selección de Músculo y Lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="muscleOrNerveName" className="block text-sm font-medium text-gray-300 mb-1">Músculo/Nervio</label>
            <select
              id="muscleOrNerveName"
              value={currentRecord.muscleOrNerveName}
              onChange={(e) => handleInputChange('muscleOrNerveName', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border ${validationErrors.muscleOrNerveName ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Seleccione un músculo/nervio...</option>
              {emgMusclesDatabase.map(muscle => (
                <option key={muscle.id} value={muscle.id}>{muscle.name}</option>
              ))}
            </select>
            {validationErrors.muscleOrNerveName && <p className="mt-1 text-sm text-red-400">{validationErrors.muscleOrNerveName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lado</label>
            <div className="flex space-x-3">
              {(['left', 'right'] as const).map(sideOption => (
                <button
                  key={sideOption}
                  type="button"
                  onClick={() => handleInputChange('side', sideOption)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentRecord.side === sideOption 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {sideOption === 'left' ? 'Izquierdo' : 'Derecho'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad de Inserción */}
        <div>
          <label htmlFor="insertionalActivity" className="block text-sm font-medium text-gray-300 mb-1">Actividad de Inserción</label>
          <select
            id="insertionalActivity"
            value={currentRecord.insertionalActivity}
            onChange={(e) => handleInputChange('insertionalActivity', e.target.value as EMGNerveRecord['insertionalActivity'])}
            className={`w-full px-3 py-2 bg-gray-800 border ${validationErrors.insertionalActivity ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Seleccione...</option>
            <option value="normal">Normal</option>
            <option value="increased">Aumentada</option>
            <option value="decreased">Disminuida</option>
            <option value="absent">Ausente</option>
          </select>
          {validationErrors.insertionalActivity && <p className="mt-1 text-sm text-red-400">{validationErrors.insertionalActivity}</p>}
        </div>

        {/* Actividad Espontánea */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-300 mb-1">Actividad Espontánea</legend>
          {(Object.keys(currentRecord.spontaneousActivity || {}) as (keyof EMGSpontaneousActivity)[]).map(key => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentRecord.spontaneousActivity?.[key] || false}
                onChange={(e) => handleNestedInputChange('spontaneousActivity', key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-sm">
                {key === 'fibrillations' ? 'Fibrilaciones' : key === 'positiveWaves' ? 'Ondas Positivas' : 'Fasciculaciones'}
              </span>
            </label>
          ))}
        </fieldset>

        {/* Potenciales de Unidad Motora (PUM) */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-300 mb-1">Potenciales de Unidad Motora (PUM)</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="mup_amplitude" className="block text-xs font-medium text-gray-400 mb-0.5">Amplitud (µV)</label>
              <input
                type="number"
                id="mup_amplitude"
                value={currentRecord.motorUnitPotentials?.amplitude ?? ''}
                onChange={(e) => handleNestedInputChange('motorUnitPotentials', 'amplitude', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 text-sm bg-gray-800 border ${validationErrors.mup_amplitude ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.mup_amplitude && <p className="mt-1 text-xs text-red-400">{validationErrors.mup_amplitude}</p>}
            </div>
            <div>
              <label htmlFor="mup_duration" className="block text-xs font-medium text-gray-400 mb-0.5">Duración (ms)</label>
              <input
                type="number"
                id="mup_duration"
                value={currentRecord.motorUnitPotentials?.duration ?? ''}
                onChange={(e) => handleNestedInputChange('motorUnitPotentials', 'duration', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 text-sm bg-gray-800 border ${validationErrors.mup_duration ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.mup_duration && <p className="mt-1 text-xs text-red-400">{validationErrors.mup_duration}</p>}
            </div>
            <div>
              <label htmlFor="mup_polyphasia" className="block text-xs font-medium text-gray-400 mb-0.5">Polifasia (%)</label>
              <input
                type="number"
                id="mup_polyphasia"
                min="0" max="100"
                value={currentRecord.motorUnitPotentials?.polyphasia ?? ''}
                onChange={(e) => handleNestedInputChange('motorUnitPotentials', 'polyphasia', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 text-sm bg-gray-800 border ${validationErrors.mup_polyphasia ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {validationErrors.mup_polyphasia && <p className="mt-1 text-xs text-red-400">{validationErrors.mup_polyphasia}</p>}
            </div>
          </div>
        </fieldset>

        {/* Patrón de Reclutamiento */}
        <div>
          <label htmlFor="recruitmentPattern" className="block text-sm font-medium text-gray-300 mb-1">Patrón de Reclutamiento</label>
          <select
            id="recruitmentPattern"
            value={currentRecord.recruitmentPattern}
            onChange={(e) => handleInputChange('recruitmentPattern', e.target.value as EMGNerveRecord['recruitmentPattern'])}
            className={`w-full px-3 py-2 bg-gray-800 border ${validationErrors.recruitmentPattern ? 'border-red-500' : 'border-gray-700'} text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Seleccione...</option>
            <option value="normal">Normal</option>
            <option value="reduced_incomplete">Reducido (incompleto)</option>
            <option value="reduced_complete">Reducido (completo)</option>
            <option value="early">Precoz</option>
            <option value="discrete">Discreto</option>
          </select>
          {validationErrors.recruitmentPattern && <p className="mt-1 text-sm text-red-400">{validationErrors.recruitmentPattern}</p>}
        </div>
        
        {/* Notas de Interpretación */}
        <div>
            <label htmlFor="interpretationNotes" className="block text-sm font-medium text-gray-300 mb-1">Notas de Interpretación (Opcional)</label>
            <textarea
                id="interpretationNotes"
                value={currentRecord.interpretationNotes || ''}
                onChange={(e) => handleInputChange('interpretationNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anotaciones específicas para este músculo/nervio..."
            />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={addEmgRecord}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Registro EMG
          </button>
        </div>
      </div>

      {/* Lista de Registros EMG Agregados */}
      {emgRecords.length > 0 && (
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/40">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Registros EMG Guardados</h3>
          <div className="space-y-4">
            {emgRecords.map((record) => (
              <div key={record.id} className="bg-gray-700/50 p-4 rounded-md border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-100">
                    {getMuscleDisplayName(record.muscleOrNerveName)} ({record.side === 'left' ? 'Izq.' : 'Der.'})
                  </h4>
                  <button
                    onClick={() => removeEmgRecord(record.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    aria-label="Eliminar registro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <p><strong className="text-gray-400">Inserción:</strong> <span className="text-gray-200">{record.insertionalActivity}</span></p>
                  <p><strong className="text-gray-400">Reclutamiento:</strong> <span className="text-gray-200">{record.recruitmentPattern}</span></p>
                  <div>
                    <strong className="text-gray-400">Act. Espontánea:</strong>
                    <ul className="list-disc list-inside ml-1">
                      {record.spontaneousActivity.fibrillations && <li className="text-gray-300">Fibrilaciones</li>}
                      {record.spontaneousActivity.positiveWaves && <li className="text-gray-300">Ondas Positivas</li>}
                      {record.spontaneousActivity.fasciculations && <li className="text-gray-300">Fasciculaciones</li>}
                      {!(record.spontaneousActivity.fibrillations || record.spontaneousActivity.positiveWaves || record.spontaneousActivity.fasciculations) && <li className="text-gray-500">Ninguna</li>}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-400">PUM Amplitud:</strong> <span className="text-gray-200">{record.motorUnitPotentials.amplitude} µV</span>
                  </div>
                  <div>
                    <strong className="text-gray-400">PUM Duración:</strong> <span className="text-gray-200">{record.motorUnitPotentials.duration} ms</span>
                  </div>
                  <div>
                    <strong className="text-gray-400">PUM Polifasia:</strong> <span className="text-gray-200">{record.motorUnitPotentials.polyphasia}%</span>
                  </div>
                </div>
                {record.interpretationNotes && (
                    <p className="text-sm mt-2"><strong className="text-gray-400">Notas:</strong> <span className="text-gray-300">{record.interpretationNotes}</span></p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Guardar Evaluación Completa */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSaveEvaluation}
          disabled={emgRecords.length === 0}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="mr-2 h-5 w-5" />
          Guardar Evaluación EMG Completa
        </button>
      </div>
    </div>
  );
};

export default EMGNeedleAnalysis; 