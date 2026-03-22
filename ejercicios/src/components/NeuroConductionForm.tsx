import React from 'react';
import { Activity, Save, AlertTriangle, Plus, Trash2, Zap, CheckCircle } from 'lucide-react';
import { NCSTestResult, NCSTestReferenceValues, ReferenceValueRange, SpecialStudyTest, SpecialStudyData } from '../types/ncs';
import { nerveDatabase } from '../data/nerveData';

// Extended NerveData interface for internal use
interface ExtendedNerveData {
  id: string;
  name: string;
  category: 'motor' | 'sensory';
  referenceValues: {
    latency: ReferenceValueRange;
    amplitude: ReferenceValueRange;
    velocity: ReferenceValueRange;
  };
  defaultAmplitudeUnit: 'mV' | 'µV';
}

// Helper function to get extended nerve data
const getExtendedNerveData = (id: string): ExtendedNerveData | undefined => {
  const baseNerve = nerveDatabase.find(n => n.id === id);
  if (!baseNerve) return undefined;

  // Determine category based on ID patterns
  const category: 'motor' | 'sensory' = 
    id.includes('sensory') || 
    id === 'sural' || 
    id === 'sural_sensory' ||
    id === 'superficial_peroneal' || 
    id === 'peroneal_superficial_sensory' ||
    id === 'lateral_femoral_cutaneous' || 
    id === 'saphenous' ||
    id === 'saphenous_sensory'
      ? 'sensory' 
      : 'motor';

  // Determine default amplitude unit based on category
  const defaultAmplitudeUnit: 'mV' | 'µV' = category === 'sensory' ? 'µV' : 'mV';

  return {
    id: baseNerve.id,
    name: baseNerve.name,
    category,
    referenceValues: baseNerve.referenceValues,
    defaultAmplitudeUnit
  };
};

// Helper functions to filter nerves by category and region
const getMotorNerves = (region: 'upper' | 'lower' | 'all' = 'all') => {
  return nerveDatabase.filter(nerve => {
    const isMotor = nerve.id.includes('motor') || 
                   nerve.id === 'peroneal' || 
                   nerve.id === 'tibial' || 
                   nerve.id === 'femoral' || 
                   nerve.id === 'sciatic' || 
                   nerve.id === 'axillary' || 
                   nerve.id === 'musculocutaneous' || 
                   nerve.id === 'suprascapular' || 
                   nerve.id === 'accessory';
    
    if (!isMotor) return false;
    
    if (region === 'upper') {
      return nerve.id.includes('median') || nerve.id.includes('ulnar') || nerve.id.includes('radial') ||
             nerve.id === 'axillary' || nerve.id === 'musculocutaneous' || nerve.id === 'suprascapular' || nerve.id === 'accessory';
    } else if (region === 'lower') {
      return nerve.id.includes('peroneal') || nerve.id.includes('tibial') || 
             nerve.id === 'femoral' || nerve.id === 'sciatic';
    }
    return true;
  });
};

const getSensoryNerves = (region: 'upper' | 'lower' | 'all' = 'all') => {
  return nerveDatabase.filter(nerve => {
    const isSensory = nerve.id.includes('sensory') || 
                     nerve.id === 'sural' || 
                     nerve.id === 'sural_sensory' ||
                     nerve.id === 'superficial_peroneal' || 
                     nerve.id === 'peroneal_superficial_sensory' ||
                     nerve.id === 'lateral_femoral_cutaneous' || 
                     nerve.id === 'saphenous' ||
                     nerve.id === 'saphenous_sensory';
    
    if (!isSensory) return false;
    
    if (region === 'upper') {
      return nerve.id.includes('median') || nerve.id.includes('ulnar') || nerve.id.includes('radial');
    } else if (region === 'lower') {
      return nerve.id.includes('sural') || nerve.id.includes('peroneal_superficial') || 
             nerve.id.includes('superficial_peroneal') || nerve.id.includes('saphenous') || 
             nerve.id === 'lateral_femoral_cutaneous';
    }
    return true;
  });
};



// Special studies database
const specialStudiesDatabase = [
  {
    id: 'h_reflex_soleus',
    name: 'Reflejo H - Sóleo',
    type: 'h_reflex' as const,
    parameters: ['latency', 'amplitude', 'bilateralDelay'],
    referenceValues: {
      latency: { min: 28, max: 35 },
      amplitude: { min: 0.3, max: 5.0 },
      bilateralDelay: { min: 0, max: 1.5 }
    },
    units: { latency: 'ms', amplitude: 'mV', bilateralDelay: 'ms' }
  },
  {
    id: 'blink_reflex',
    name: 'Reflejo de Parpadeo',
    type: 'blink_reflex' as const,
    parameters: ['r1Latency', 'r2IpsilateralLatency', 'r2ContralateralLatency'],
    referenceValues: {
      r1Latency: { min: 9, max: 14 },
      r2IpsilateralLatency: { min: 28, max: 45 },
      r2ContralateralLatency: { min: 28, max: 45 }
    },
    units: { r1Latency: 'ms', r2IpsilateralLatency: 'ms', r2ContralateralLatency: 'ms' }
  },
  {
    id: 'rns_3hz',
    name: 'Estimulación Repetitiva 3Hz',
    type: 'rns' as const,
    parameters: ['preExerciseAmplitude', 'postExerciseAmplitude', 'decrementPercentage'],
    referenceValues: {
      preExerciseAmplitude: { min: 1.0, max: 25.0 },
      postExerciseAmplitude: { min: 1.0, max: 25.0 },
      decrementPercentage: { min: 0, max: 10 }
    },
    units: { preExerciseAmplitude: 'mV', postExerciseAmplitude: 'mV', decrementPercentage: '%' }
  },
  {
    id: 'rns_30hz',
    name: 'Estimulación Repetitiva 30Hz',
    type: 'rns' as const,
    parameters: ['preExerciseAmplitude', 'postExerciseAmplitude', 'incrementPercentage'],
    referenceValues: {
      preExerciseAmplitude: { min: 1.0, max: 25.0 },
      postExerciseAmplitude: { min: 1.0, max: 25.0 },
      incrementPercentage: { min: 0, max: 200 }
    },
    units: { preExerciseAmplitude: 'mV', postExerciseAmplitude: 'mV', incrementPercentage: '%' }
  }
];

interface NeuroConductionFormProps {
  onSave: (data: { ncsResults: NCSTestResult[], specialStudies: SpecialStudyData }) => void;
  initialData?: {
    ncsResults?: NCSTestResult[];
    specialStudies?: SpecialStudyData;
  };
}

// Current NCS input state
interface CurrentNCSInput {
  nerveId: string;
  side: 'left' | 'right';
  latency: number | string;
  amplitude: number | string;
  velocity: number | string;
  notes?: string;
}

// Current Special Study input state
interface CurrentSpecialStudyInput {
  studyId: string;
  side: 'left' | 'right' | 'bilateral';
  values: Record<string, number | string>;
  notes?: string;
}

const initialCurrentInputState: CurrentNCSInput = {
  nerveId: '',
  side: 'right',
  latency: '',
  amplitude: '',
  velocity: '',
  notes: ''
};

const initialSpecialStudyInputState: CurrentSpecialStudyInput = {
  studyId: '',
  side: 'bilateral',
  values: {},
  notes: ''
};

const NeuroConductionForm: React.FC<NeuroConductionFormProps> = ({ onSave, initialData }) => {
  const [collectedResults, setCollectedResults] = React.useState<NCSTestResult[]>([]);
  const [currentInput, setCurrentInput] = React.useState<CurrentNCSInput>(initialCurrentInputState);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  
  // Special Studies states
  const [specialStudiesNotPerformed, setSpecialStudiesNotPerformed] = React.useState(true);
  const [collectedSpecialStudies, setCollectedSpecialStudies] = React.useState<SpecialStudyTest[]>([]);
  const [currentSpecialStudyInput, setCurrentSpecialStudyInput] = React.useState<CurrentSpecialStudyInput>(initialSpecialStudyInputState);
  const [specialStudyValidationErrors, setSpecialStudyValidationErrors] = React.useState<Record<string, string>>({});

  // Auto-fill effect para cargar datos iniciales
  React.useEffect(() => {
    if (initialData) {
      console.log('🔄 NeuroConductionForm: Cargando datos iniciales...', initialData);
      console.log('🔍 Estructura de initialData:', {
        hasInitialData: !!initialData,
        hasNcsResults: !!initialData.ncsResults,
        ncsResultsLength: initialData.ncsResults?.length || 0,
        hasSpecialStudies: !!initialData.specialStudies,
        specialStudiesStructure: initialData.specialStudies
      });
      
      // Cargar resultados NCS existentes
      if (initialData.ncsResults && Array.isArray(initialData.ncsResults) && initialData.ncsResults.length > 0) {
        console.log(`📊 Auto-llenando ${initialData.ncsResults.length} resultados NCS`);
        console.log('🔌 Datos NCS a cargar:', initialData.ncsResults);
        
        // Verificar estructura de cada resultado NCS
        initialData.ncsResults.forEach((ncs, index) => {
          console.log(`   NCS ${index + 1}:`, {
            id: ncs.id,
            nerve: ncs.nerve,
            side: ncs.side,
            type: ncs.type,
            latency: ncs.latency,
            amplitude: ncs.amplitude,
            velocity: ncs.velocity,
            status: ncs.status,
            hasAllRequiredFields: !!(ncs.id && ncs.nerve && ncs.side && ncs.latency !== undefined)
          });
        });
        
        setCollectedResults(initialData.ncsResults);
        console.log('✅ collectedResults actualizado con', initialData.ncsResults.length, 'elementos');
        
        // 🔥 CORRECCIÓN: Eliminar setTimeout anti-patrón
        // El estado se actualiza correctamente sin necesidad de setTimeout
        console.log('🔄 Estado de collectedResults actualizado correctamente');
      } else {
        console.warn('⚠️ No hay datos NCS válidos para cargar:', {
          exists: !!initialData.ncsResults,
          isArray: Array.isArray(initialData.ncsResults),
          length: initialData.ncsResults?.length || 0
        });
      }
      
      // Cargar estudios especiales
      if (initialData.specialStudies) {
        if (initialData.specialStudies.notPerformed) {
          console.log('📝 Estudios especiales marcados como NO realizados');
          setSpecialStudiesNotPerformed(true);
          setCollectedSpecialStudies([]);
        } else if (initialData.specialStudies.tests && initialData.specialStudies.tests.length > 0) {
          console.log(`🔬 Auto-llenando ${initialData.specialStudies.tests.length} estudios especiales`);
          setSpecialStudiesNotPerformed(false);
          setCollectedSpecialStudies(initialData.specialStudies.tests);
        }
      }
      
      console.log('✅ NeuroConductionForm: Datos iniciales cargados exitosamente');
    } else {
      console.warn('⚠️ NeuroConductionForm: No se recibieron datos iniciales');
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CurrentNCSInput, value: string | number) => {
    setCurrentInput(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const getSelectedNerveData = (): ExtendedNerveData | undefined => {
    return getExtendedNerveData(currentInput.nerveId);
  };

  const validateCurrentInput = (): boolean => {
    const errors: Record<string, string> = {};
    if (!currentInput.nerveId) errors.nerveId = 'Debe seleccionar un nervio.';
    
    const lat = parseFloat(String(currentInput.latency));
    const amp = parseFloat(String(currentInput.amplitude));
    const vel = parseFloat(String(currentInput.velocity));

    if (isNaN(lat) || lat <= 0) errors.latency = 'Latencia inválida (>0).';
    if (isNaN(amp) || amp <= 0) errors.amplitude = 'Amplitud inválida (>0).';
    if (isNaN(vel) || vel <= 0) errors.velocity = 'Velocidad inválida (>0).';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addNCSResult = () => {
    if (!validateCurrentInput()) return;

    const nerveInfo = getSelectedNerveData();
    if (!nerveInfo) {
      setValidationErrors(prev => ({...prev, nerveId: "Nervio seleccionado no válido."}))  
      return;
    }

    const lat = parseFloat(String(currentInput.latency));
    const amp = parseFloat(String(currentInput.amplitude));
    const vel = parseFloat(String(currentInput.velocity));

    const abnormalParameters: ('latency' | 'amplitude' | 'velocity')[] = [];
    const findings: string[] = [];

    if (nerveInfo.referenceValues.latency && (lat < nerveInfo.referenceValues.latency.min || lat > nerveInfo.referenceValues.latency.max)) {
      abnormalParameters.push('latency');
      findings.push(`Latencia (${lat}ms) fuera de rango (${nerveInfo.referenceValues.latency.min}-${nerveInfo.referenceValues.latency.max}ms).`);
    }
    if (nerveInfo.referenceValues.amplitude && (amp < nerveInfo.referenceValues.amplitude.min || amp > nerveInfo.referenceValues.amplitude.max)) {
      abnormalParameters.push('amplitude');
      findings.push(`Amplitud (${amp}${nerveInfo.defaultAmplitudeUnit}) fuera de rango (${nerveInfo.referenceValues.amplitude.min}-${nerveInfo.referenceValues.amplitude.max}${nerveInfo.defaultAmplitudeUnit}).`);
    }
    if (nerveInfo.referenceValues.velocity && (vel < nerveInfo.referenceValues.velocity.min || vel > nerveInfo.referenceValues.velocity.max)) {
      abnormalParameters.push('velocity');
      findings.push(`Velocidad (${vel}m/s) fuera de rango (${nerveInfo.referenceValues.velocity.min}-${nerveInfo.referenceValues.velocity.max}m/s).`);
    }

    const status: NCSTestResult['status'] = abnormalParameters.length > 0 ? 'abnormal' : 'normal';
    if (findings.length === 0 && status === 'normal') {
        findings.push("Estudio dentro de límites normales.");
    }

    const newResult: NCSTestResult = {
      id: crypto.randomUUID(),
      nerve: nerveInfo.name,
      type: nerveInfo.category,
      side: currentInput.side,
      latency: lat,
      amplitude: amp,
      amplitudeUnit: nerveInfo.defaultAmplitudeUnit,
      velocity: vel,
      status,
      abnormalParameters,
      referenceValues: nerveInfo.referenceValues as NCSTestReferenceValues,
      findings,
    };

    setCollectedResults(prev => [...prev, newResult]);
    setCurrentInput(initialCurrentInputState);
    setValidationErrors({});
  };

  const removeNCSResult = (id: string) => {
    setCollectedResults(prev => prev.filter(r => r.id !== id));
  };

  // Special Studies functions
  const handleSpecialStudyInputChange = (field: keyof CurrentSpecialStudyInput, value: string | number | Record<string, number | string>) => {
    setCurrentSpecialStudyInput(prev => ({ ...prev, [field]: value }));
    if (specialStudyValidationErrors[field]) {
      setSpecialStudyValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const handleSpecialStudyValueChange = (parameter: string, value: string | number) => {
    setCurrentSpecialStudyInput(prev => ({
      ...prev,
      values: { ...prev.values, [parameter]: value }
    }));
  };

  const getSelectedSpecialStudyData = () => {
    return specialStudiesDatabase.find(s => s.id === currentSpecialStudyInput.studyId);
  };

  const validateSpecialStudyInput = (): boolean => {
    const errors: Record<string, string> = {};
    if (!currentSpecialStudyInput.studyId) errors.studyId = 'Debe seleccionar un estudio especial.';
    
    const selectedStudy = getSelectedSpecialStudyData();
    if (selectedStudy) {
      for (const parameter of selectedStudy.parameters) {
        const value = parseFloat(String(currentSpecialStudyInput.values[parameter] || ''));
        if (isNaN(value) || value < 0) {
          errors[parameter] = `${parameter} inválido (≥0).`;
        }
      }
    }

    setSpecialStudyValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addSpecialStudyResult = () => {
    if (!validateSpecialStudyInput()) return;

    const studyInfo = getSelectedSpecialStudyData();
    if (!studyInfo) {
      setSpecialStudyValidationErrors(prev => ({...prev, studyId: "Estudio seleccionado no válido."}));
      return;
    }

    const abnormalParameters: string[] = [];
    const findings: string[] = [];

    // Convert values to numbers and check against reference values
    const processedValues: Record<string, number> = {};
    for (const parameter of studyInfo.parameters) {
      const value = parseFloat(String(currentSpecialStudyInput.values[parameter] || '0'));
      processedValues[parameter] = value;

      const refRange = studyInfo.referenceValues[parameter];
      if (refRange && (value < refRange.min || value > refRange.max)) {
        abnormalParameters.push(parameter);
        const unit = studyInfo.units[parameter] || '';
        findings.push(`${parameter} (${value}${unit}) fuera de rango (${refRange.min}-${refRange.max}${unit}).`);
      }
    }

    const status: SpecialStudyTest['status'] = abnormalParameters.length > 0 ? 'abnormal' : 'normal';
    if (findings.length === 0 && status === 'normal') {
      findings.push("Estudio dentro de límites normales.");
    }

    const newSpecialStudy: SpecialStudyTest = {
      id: crypto.randomUUID(),
      name: studyInfo.name,
      type: studyInfo.type,
      side: currentSpecialStudyInput.side,
      values: processedValues,
      status,
      abnormalParameters,
      referenceValues: studyInfo.referenceValues,
      findings
    };

    setCollectedSpecialStudies(prev => [...prev, newSpecialStudy]);
    setCurrentSpecialStudyInput(initialSpecialStudyInputState);
    setSpecialStudyValidationErrors({});
    
    // Auto-deselect "not performed" when adding a special study
    if (specialStudiesNotPerformed) {
      setSpecialStudiesNotPerformed(false);
    }
  };

  const removeSpecialStudyResult = (id: string) => {
    setCollectedSpecialStudies(prev => prev.filter(s => s.id !== id));
    
    // If no special studies left, can optionally re-enable "not performed"
    if (collectedSpecialStudies.length === 1) { // Will be 0 after removal
      setSpecialStudiesNotPerformed(true);
    }
  };

  const handleSpecialStudiesNotPerformedChange = (notPerformed: boolean) => {
    setSpecialStudiesNotPerformed(notPerformed);
    if (notPerformed) {
      // Clear all special studies if "not performed" is selected
      setCollectedSpecialStudies([]);
      setCurrentSpecialStudyInput(initialSpecialStudyInputState);
      setSpecialStudyValidationErrors({});
    }
  };

  const handleCompleteStudy = () => {
    if (collectedResults.length === 0) {
      setValidationErrors({ form: 'Debe agregar al menos una medición de neuroconducción.' });
      return;
    }
    
    const specialStudiesData: SpecialStudyData = {
      notPerformed: specialStudiesNotPerformed,
      tests: collectedSpecialStudies
    };

    onSave({ 
      ncsResults: collectedResults, 
      specialStudies: specialStudiesData 
    });
  };
  
  const isValueOutOfRangeLocal = (valueStr: string | number, parameter: 'latency' | 'amplitude' | 'velocity'): boolean => {
    const value = parseFloat(String(valueStr));
    if (isNaN(value) || value <= 0) return false;

    const nerveInfo = getSelectedNerveData();
    if (!nerveInfo) return false;

    const refRange = nerveInfo.referenceValues[parameter as keyof typeof nerveInfo.referenceValues] as ReferenceValueRange | undefined;
    if (!refRange) return false;
    
    return value < refRange.min || value > refRange.max;
  };

  const isSpecialStudyValueOutOfRange = (parameter: string, valueStr: string | number): boolean => {
    const value = parseFloat(String(valueStr));
    if (isNaN(value) || value < 0) return false;

    const studyInfo = getSelectedSpecialStudyData();
    if (!studyInfo) return false;

    const refRange = studyInfo.referenceValues[parameter];
    if (!refRange) return false;
    
    return value < refRange.min || value > refRange.max;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {validationErrors.form && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-md flex items-start mb-4">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-red-300 text-sm">{validationErrors.form}</span>
        </div>
      )}

      {/* Improved instructions */}
      <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Estudios de Neuroconducción
        </h3>
        <p className="text-blue-200 text-sm">
          Complete las mediciones de velocidades de conducción nerviosa, amplitudes y latencias para cada nervio estudiado. 
          Puede agregar estudios especiales como respuestas tardías en la sección correspondiente.
        </p>
      </div>
      
      <div className="bg-gray-700/30 p-4 sm:p-6 rounded-lg border border-gray-600">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Agregar Medición de Neuroconducción</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
          <div>
            <label htmlFor="nerveId" className="block text-sm font-medium text-gray-300 mb-1">Nervio</label>
            <select
              id="nerveId"
              name="nerveId"
              value={currentInput.nerveId}
              onChange={(e) => handleInputChange('nerveId', e.target.value)}
              className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 text-sm ${validationErrors.nerveId ? 'border-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
            >
              <option value="">Seleccionar nervio...</option>
              <optgroup label="MMSS - Motores">
                {getMotorNerves('upper').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </optgroup>
              <optgroup label="MMSS - Sensitivos">
                {getSensoryNerves('upper').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </optgroup>
              <optgroup label="MMII - Motores">
                {getMotorNerves('lower').map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </optgroup>
              <optgroup label="MMII - Sensitivos">
                {getSensoryNerves('lower').map(n => <option key={n.id} value={n.id}>{n.name}</option>)} 
              </optgroup>
            </select>
            {validationErrors.nerveId && <p className="mt-1 text-xs text-red-400">{validationErrors.nerveId}</p>}
            {currentInput.nerveId && getSelectedNerveData() && (
              <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                <p>Ref: Lat ({getSelectedNerveData()!.referenceValues.latency.min}-{getSelectedNerveData()!.referenceValues.latency.max}ms) 
                   Amp ({getSelectedNerveData()!.referenceValues.amplitude.min}-{getSelectedNerveData()!.referenceValues.amplitude.max}{getSelectedNerveData()!.defaultAmplitudeUnit}) 
                   Vel ({getSelectedNerveData()!.referenceValues.velocity.min}-{getSelectedNerveData()!.referenceValues.velocity.max}m/s)
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lado</label>
            <div className="flex space-x-3">
              {(['left', 'right'] as const).map(sideOption => (
                <button
                  key={sideOption}
                  type="button"
                  onClick={() => handleInputChange('side', sideOption)}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${currentInput.side === sideOption ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {sideOption === 'left' ? 'Izquierdo' : 'Derecho'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-4">
          <div>
            <label htmlFor="latency" className="block text-sm font-medium text-gray-300 mb-1">Latencia (ms)</label>
            <input id="latency" type="number" step="0.1" value={currentInput.latency} onChange={(e) => handleInputChange('latency', e.target.value)}
              className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm ${validationErrors.latency ? 'border-red-500' : isValueOutOfRangeLocal(currentInput.latency, 'latency') ? 'border-yellow-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            {validationErrors.latency && <p className="mt-1 text-xs text-red-400">{validationErrors.latency}</p>}
          </div>
          <div>
            <label htmlFor="amplitude" className="block text-sm font-medium text-gray-300 mb-1">Amplitud ({getSelectedNerveData()?.defaultAmplitudeUnit || 'µV/mV'})</label>
            <input id="amplitude" type="number" step="0.1" value={currentInput.amplitude} onChange={(e) => handleInputChange('amplitude', e.target.value)}
              className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm ${validationErrors.amplitude ? 'border-red-500' : isValueOutOfRangeLocal(currentInput.amplitude, 'amplitude') ? 'border-yellow-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            {validationErrors.amplitude && <p className="mt-1 text-xs text-red-400">{validationErrors.amplitude}</p>}
          </div>
          <div>
            <label htmlFor="velocity" className="block text-sm font-medium text-gray-300 mb-1">Velocidad (m/s)</label>
            <input id="velocity" type="number" step="0.1" value={currentInput.velocity} onChange={(e) => handleInputChange('velocity', e.target.value)}
              className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm ${validationErrors.velocity ? 'border-red-500' : isValueOutOfRangeLocal(currentInput.velocity, 'velocity') ? 'border-yellow-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            {validationErrors.velocity && <p className="mt-1 text-xs text-red-400">{validationErrors.velocity}</p>}
          </div>
        </div>
        
        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notas Adicionales <span className="text-gray-500 text-xs">(Opc.)</span></label>
            <input id="notes" type="text" value={currentInput.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Interpretación específica, hallazgos cualitativos..."
              className="w-full p-2.5 border border-gray-600 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        
        <div className="flex justify-end mt-5">
          <button type="button" onClick={addNCSResult}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors text-sm font-medium">
            <Plus className="mr-2 h-4 w-4" /> Agregar Medición
          </button>
        </div>
      </div>
      
      {collectedResults.length > 0 && (
        <div className="mt-6 bg-gray-700/30 p-4 sm:p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Mediciones de Neuroconducción Registradas</h3>
          <div className="space-y-4">
            {collectedResults.map((result) => (
              <div key={result.id} className="bg-gray-800/60 p-3 rounded-lg border border-gray-700 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-300">
                    {result.nerve} ({result.side === 'left' ? 'Izq.' : 'Der.'}) - <span className={result.status === 'abnormal' ? 'text-red-400' : 'text-green-400'}>{result.status.toUpperCase()}</span>
                  </h4>
                  <button onClick={() => removeNCSResult(result.id)} className="p-1 text-red-500 hover:text-red-400 transition-colors" aria-label="Eliminar medición">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                  <p>Lat: <span className={result.abnormalParameters?.includes('latency')?'text-red-400 font-bold':'text-gray-300'}>{result.latency}ms</span></p>
                  <p>Amp: <span className={result.abnormalParameters?.includes('amplitude')?'text-red-400 font-bold':'text-gray-300'}>{result.amplitude}{result.amplitudeUnit}</span></p>
                  <p>Vel: <span className={result.abnormalParameters?.includes('velocity')?'text-red-400 font-bold':'text-gray-300'}>{result.velocity}m/s</span></p>
                </div>
                {result.findings && result.findings.length > 0 && 
                    <div className="mt-1.5">
                        <p className="text-xs text-gray-400">Hallazgos: <span className="text-gray-300">{result.findings.join('; ')}</span></p>
                    </div>
                }
                {result.referenceValues && 
                    <div className="mt-1 text-xs text-gray-500">
                        (Ref: Lat {result.referenceValues.latency?.min}-{result.referenceValues.latency?.max}ms; 
                        Amp {result.referenceValues.amplitude?.min}-{result.referenceValues.amplitude?.max}{result.amplitudeUnit}; 
                        Vel {result.referenceValues.velocity?.min}-{result.referenceValues.velocity?.max}m/s)
                    </div>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Studies Section */}
      <div className="bg-gray-700/30 p-4 sm:p-6 rounded-lg border border-gray-600">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />
          Estudios Especiales (Respuestas Tardías)
        </h3>

        {/* Not Performed Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleSpecialStudiesNotPerformedChange(!specialStudiesNotPerformed)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                specialStudiesNotPerformed 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              No se realizaron estudios especiales
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Seleccione esta opción si no se realizaron estudios especiales. Se deseleccionará automáticamente al agregar un estudio.
          </p>
        </div>

        {/* Special Studies Form */}
        {!specialStudiesNotPerformed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div>
                <label htmlFor="studyId" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Estudio</label>
                <select
                  id="studyId"
                  name="studyId"
                  value={currentSpecialStudyInput.studyId}
                  onChange={(e) => handleSpecialStudyInputChange('studyId', e.target.value)}
                  className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 text-sm ${
                    specialStudyValidationErrors.studyId ? 'border-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Seleccionar estudio especial...</option>
                                     <optgroup label="Respuestas Tardías">
                     {specialStudiesDatabase
                       .filter(s => s.type === 'h_reflex' || s.type === 'blink_reflex')
                       .map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                   </optgroup>
                   <optgroup label="Estimulación Repetitiva">
                     {specialStudiesDatabase
                       .filter(s => s.type === 'rns')
                       .map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                   </optgroup>
                </select>
                {specialStudyValidationErrors.studyId && (
                  <p className="mt-1 text-xs text-red-400">{specialStudyValidationErrors.studyId}</p>
                )}
                
                {currentSpecialStudyInput.studyId && getSelectedSpecialStudyData() && (
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Parámetros: {getSelectedSpecialStudyData()!.parameters.join(', ')}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Lado</label>
                <div className="flex space-x-2">
                  {(['left', 'right', 'bilateral'] as const).map(sideOption => (
                    <button
                      key={sideOption}
                      type="button"
                      onClick={() => handleSpecialStudyInputChange('side', sideOption)}
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        currentSpecialStudyInput.side === sideOption 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {sideOption === 'left' ? 'Izq.' : sideOption === 'right' ? 'Der.' : 'Bilateral'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic parameter inputs based on selected study */}
            {currentSpecialStudyInput.studyId && getSelectedSpecialStudyData() && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-4">
                {getSelectedSpecialStudyData()!.parameters.map(parameter => {
                  const studyData = getSelectedSpecialStudyData()!;
                  const unit = studyData.units[parameter] || '';
                  const refRange = studyData.referenceValues[parameter];
                  
                  return (
                    <div key={parameter}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {parameter} ({unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentSpecialStudyInput.values[parameter] || ''}
                        onChange={(e) => handleSpecialStudyValueChange(parameter, e.target.value)}
                        className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm ${
                          specialStudyValidationErrors[parameter] 
                            ? 'border-red-500' 
                            : isSpecialStudyValueOutOfRange(parameter, currentSpecialStudyInput.values[parameter] || 0)
                              ? 'border-yellow-500' 
                              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                      {refRange && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ref: {refRange.min}-{refRange.max}{unit}
                        </p>
                      )}
                      {specialStudyValidationErrors[parameter] && (
                        <p className="mt-1 text-xs text-red-400">{specialStudyValidationErrors[parameter]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="specialStudyNotes" className="block text-sm font-medium text-gray-300 mb-1">
                Notas Adicionales <span className="text-gray-500 text-xs">(Opc.)</span>
              </label>
              <input
                id="specialStudyNotes"
                type="text"
                value={currentSpecialStudyInput.notes || ''}
                onChange={(e) => handleSpecialStudyInputChange('notes', e.target.value)}
                placeholder="Hallazgos adicionales, interpretación específica..."
                className="w-full p-2.5 border border-gray-600 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addSpecialStudyResult}
                disabled={!currentSpecialStudyInput.studyId}
                className="flex items-center px-5 py-2.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Estudio Especial
              </button>
            </div>
          </>
        )}

        {/* Display collected special studies */}
        {collectedSpecialStudies.length > 0 && (
          <div className="mt-6 border-t border-gray-600 pt-6">
            <h4 className="text-md font-semibold text-gray-200 mb-3">Estudios Especiales Registrados</h4>
            <div className="space-y-3">
              {collectedSpecialStudies.map((study) => (
                <div key={study.id} className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-yellow-300">
                      {study.name} ({study.side}) - <span className={study.status === 'abnormal' ? 'text-red-400' : 'text-green-400'}>
                        {study.status.toUpperCase()}
                      </span>
                    </h5>
                    <button 
                      onClick={() => removeSpecialStudyResult(study.id)} 
                      className="p-1 text-red-500 hover:text-red-400 transition-colors" 
                      aria-label="Eliminar estudio especial"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(study.values).map(([param, value]) => (
                      <p key={param}>
                        {param}: <span className={study.abnormalParameters?.includes(param) ? 'text-red-400 font-bold' : 'text-gray-300'}>
                          {value}
                        </span>
                      </p>
                    ))}
                  </div>
                  {study.findings && study.findings.length > 0 && (
                    <div className="mt-1.5">
                      <p className="text-xs text-gray-400">
                        Hallazgos: <span className="text-gray-300">{study.findings.join('; ')}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-900/20 border border-blue-700/50 p-4 sm:p-6 rounded-lg text-sm">
        <h3 className="text-md font-semibold text-blue-300 mb-3 flex items-center">
          <Activity className="h-5 w-5 mr-2" /> Interpretación General de Patrones NCS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-blue-200 mb-1">Desmielinizante</h4>
            <ul className="list-disc pl-5 text-blue-300/90 text-xs space-y-0.5">
              <li>Velocidad de conducción ↓↓</li>
              <li>Latencia distal/Pico ↑↑</li>
              <li>Amplitud normal o ↓ leve (por dispersión temporal)</li>
              <li>Ondas F prolongadas o ausentes</li>
              <li>Bloqueo de conducción / Dispersión temporal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-200 mb-1">Axonal</h4>
            <ul className="list-disc pl-5 text-blue-300/90 text-xs space-y-0.5">
              <li>Amplitud Potencial (CMAP/SNAP) ↓↓</li>
              <li>Velocidad de conducción normal o ↓ leve</li>
              <li>Latencia distal/Pico normal o ↑ leve</li>
              <li>Ondas F normales o ausentes si amplitud CMAP muy baja</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-200 mb-1">Mixto</h4>
            <ul className="list-disc pl-5 text-blue-300/90 text-xs space-y-0.5">
              <li>Combinación de hallazgos axonales y desmielinizantes.</li>
              <li>Velocidad ↓, Amplitud ↓, Latencia ↑</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button type="button" onClick={handleCompleteStudy}
          disabled={collectedResults.length === 0}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium">
          <Save className="mr-2 h-5 w-5" /> Guardar y Continuar
        </button>
      </div>
    </div>
  );
};

export default NeuroConductionForm;