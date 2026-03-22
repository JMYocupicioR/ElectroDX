import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';

// Definir tipos para síntomas estructurados
interface ClinicalSymptom {
  id: string;
  name: string;
  present: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  onset: 'acute' | 'gradual' | 'insidious';
  progression: 'improving' | 'stable' | 'worsening';
  location: string[];
  characteristics: string[];
  triggers: string[];
  alleviatingFactors: string[];
  associatedSymptoms: string[];
  notes: string;
}

interface MotorSymptoms {
  weakness: ClinicalSymptom;
  fatigue: ClinicalSymptom;
  cramps: ClinicalSymptom;
  stiffness: ClinicalSymptom;
  tremor: ClinicalSymptom;
  fasciculations: ClinicalSymptom;
}

interface SensorySymptoms {
  numbness: ClinicalSymptom;
  tingling: ClinicalSymptom;
  burning: ClinicalSymptom;
  pain: ClinicalSymptom;
  hyperalgesia: ClinicalSymptom;
  allodynia: ClinicalSymptom;
}

interface AutonomicSymptoms {
  sweating: ClinicalSymptom;
  temperature: ClinicalSymptom;
  skinChanges: ClinicalSymptom;
  vasomotor: ClinicalSymptom;
}

interface ClinicalSymptomsData {
  motor: MotorSymptoms;
  sensory: SensorySymptoms;
  autonomic: AutonomicSymptoms;
  functional: {
    walkingDifficulty: ClinicalSymptom;
    handFunction: ClinicalSymptom;
    balance: ClinicalSymptom;
    coordination: ClinicalSymptom;
  };
  constitutional: {
    weightLoss: ClinicalSymptom;
    sleep: ClinicalSymptom;
    mood: ClinicalSymptom;
  };
}

interface ClinicalSymptomsFormProps {
  onComplete: (symptomsData: ClinicalSymptomsData) => void;
  onBack?: () => void;
  initialData?: Partial<ClinicalSymptomsData>;
}

const ClinicalSymptomsForm: React.FC<ClinicalSymptomsFormProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  // Crear síntoma vacío para inicialización
  const createEmptySymptom = (id: string, name: string): ClinicalSymptom => ({
    id,
    name,
    present: false,
    severity: 'mild',
    duration: '',
    onset: 'gradual',
    progression: 'stable',
    location: [],
    characteristics: [],
    triggers: [],
    alleviatingFactors: [],
    associatedSymptoms: [],
    notes: ''
  });

  const [symptomsData, setSymptomsData] = useState<ClinicalSymptomsData>(() => ({
    motor: {
      weakness: createEmptySymptom('weakness', 'Debilidad muscular'),
      fatigue: createEmptySymptom('fatigue', 'Fatiga'),
      cramps: createEmptySymptom('cramps', 'Calambres'),
      stiffness: createEmptySymptom('stiffness', 'Rigidez'),
      tremor: createEmptySymptom('tremor', 'Temblor'),
      fasciculations: createEmptySymptom('fasciculations', 'Fasciculaciones')
    },
    sensory: {
      numbness: createEmptySymptom('numbness', 'Entumecimiento'),
      tingling: createEmptySymptom('tingling', 'Hormigueo'),
      burning: createEmptySymptom('burning', 'Ardor'),
      pain: createEmptySymptom('pain', 'Dolor'),
      hyperalgesia: createEmptySymptom('hyperalgesia', 'Hiperalgesia'),
      allodynia: createEmptySymptom('allodynia', 'Alodinia')
    },
    autonomic: {
      sweating: createEmptySymptom('sweating', 'Alteraciones sudoración'),
      temperature: createEmptySymptom('temperature', 'Disregulación térmica'),
      skinChanges: createEmptySymptom('skinChanges', 'Cambios en la piel'),
      vasomotor: createEmptySymptom('vasomotor', 'Síntomas vasomotores')
    },
    functional: {
      walkingDifficulty: createEmptySymptom('walkingDifficulty', 'Dificultad para caminar'),
      handFunction: createEmptySymptom('handFunction', 'Disfunción manual'),
      balance: createEmptySymptom('balance', 'Alteraciones del equilibrio'),
      coordination: createEmptySymptom('coordination', 'Problemas de coordinación')
    },
    constitutional: {
      weightLoss: createEmptySymptom('weightLoss', 'Pérdida de peso'),
      sleep: createEmptySymptom('sleep', 'Alteraciones del sueño'),
      mood: createEmptySymptom('mood', 'Cambios del estado de ánimo')
    },
    ...initialData
  }));

  const [currentSection, setCurrentSection] = useState<'motor' | 'sensory' | 'autonomic' | 'functional' | 'constitutional'>('motor');

  const updateSymptom = (section: keyof ClinicalSymptomsData, symptomKey: string, field: keyof ClinicalSymptom, value: any) => {
    setSymptomsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [symptomKey]: {
          ...prev[section][symptomKey as keyof typeof prev[section]],
          [field]: value
        }
      }
    }));
  };

  const addArrayItem = (section: keyof ClinicalSymptomsData, symptomKey: string, field: 'location' | 'characteristics' | 'triggers' | 'alleviatingFactors' | 'associatedSymptoms', value: string) => {
    if (value.trim()) {
      setSymptomsData(prev => {
        const currentSymptom = prev[section][symptomKey as keyof typeof prev[section]] as ClinicalSymptom;
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [symptomKey]: {
              ...currentSymptom,
              [field]: [...currentSymptom[field], value.trim()]
            }
          }
        };
      });
    }
  };

  const removeArrayItem = (section: keyof ClinicalSymptomsData, symptomKey: string, field: 'location' | 'characteristics' | 'triggers' | 'alleviatingFactors' | 'associatedSymptoms', index: number) => {
    setSymptomsData(prev => {
      const currentSymptom = prev[section][symptomKey as keyof typeof prev[section]] as ClinicalSymptom;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [symptomKey]: {
            ...currentSymptom,
            [field]: currentSymptom[field].filter((_, i) => i !== index)
          }
        }
      };
    });
  };

  // Estados para campos de entrada nuevos
  const [newInputs, setNewInputs] = useState<{[key: string]: string}>({});

  const getNewInputValue = (symptomId: string, field: string) => {
    return newInputs[`${symptomId}_${field}`] || '';
  };

  const setNewInputValue = (symptomId: string, field: string, value: string) => {
    setNewInputs(prev => ({
      ...prev,
      [`${symptomId}_${field}`]: value
    }));
  };

  const clearNewInputValue = (symptomId: string, field: string) => {
    setNewInputs(prev => {
      const newState = { ...prev };
      delete newState[`${symptomId}_${field}`];
      return newState;
    });
  };

  const renderSymptomCard = (section: keyof ClinicalSymptomsData, symptomKey: string, symptom: ClinicalSymptom) => {

    return (
      <div key={symptom.id} className={`p-4 border rounded-lg ${symptom.present ? 'border-orange-400 bg-orange-900/20' : 'border-gray-600 bg-gray-800/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-100">{symptom.name}</h4>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={symptom.present}
              onChange={(e) => updateSymptom(section, symptomKey, 'present', e.target.checked)}
              className="w-5 h-5 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-200">Presente</span>
          </label>
        </div>

        {symptom.present && (
          <div className="space-y-4">
            {/* Características básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Severidad</label>
                <select
                  value={symptom.severity}
                  onChange={(e) => updateSymptom(section, symptomKey, 'severity', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="mild">Leve</option>
                  <option value="moderate">Moderado</option>
                  <option value="severe">Severo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Inicio</label>
                <select
                  value={symptom.onset}
                  onChange={(e) => updateSymptom(section, symptomKey, 'onset', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="acute">Agudo</option>
                  <option value="gradual">Gradual</option>
                  <option value="insidious">Insidioso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Progresión</label>
                <select
                  value={symptom.progression}
                  onChange={(e) => updateSymptom(section, symptomKey, 'progression', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="improving">Mejorando</option>
                  <option value="stable">Estable</option>
                  <option value="worsening">Empeorando</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duración</label>
              <input
                type="text"
                value={symptom.duration}
                onChange={(e) => updateSymptom(section, symptomKey, 'duration', e.target.value)}
                placeholder="ej: 3 meses, 2 semanas"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Localización */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Localización</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={getNewInputValue(symptom.id, 'location')}
                  onChange={(e) => setNewInputValue(symptom.id, 'location', e.target.value)}
                  placeholder="Agregar localización"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = getNewInputValue(symptom.id, 'location');
                      addArrayItem(section, symptomKey, 'location', value);
                      clearNewInputValue(symptom.id, 'location');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const value = getNewInputValue(symptom.id, 'location');
                    addArrayItem(section, symptomKey, 'location', value);
                    clearNewInputValue(symptom.id, 'location');
                  }}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptom.location.map((loc, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
                    {loc}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(section, symptomKey, 'location', index)}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Características */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Características</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={getNewInputValue(symptom.id, 'characteristics')}
                  onChange={(e) => setNewInputValue(symptom.id, 'characteristics', e.target.value)}
                  placeholder="Agregar característica"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = getNewInputValue(symptom.id, 'characteristics');
                      addArrayItem(section, symptomKey, 'characteristics', value);
                      clearNewInputValue(symptom.id, 'characteristics');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const value = getNewInputValue(symptom.id, 'characteristics');
                    addArrayItem(section, symptomKey, 'characteristics', value);
                    clearNewInputValue(symptom.id, 'characteristics');
                  }}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptom.characteristics.map((char, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
                    {char}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(section, symptomKey, 'characteristics', index)}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notas adicionales</label>
              <textarea
                value={symptom.notes}
                onChange={(e) => updateSymptom(section, symptomKey, 'notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Información adicional sobre este síntoma..."
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const sectionTitles = {
    motor: 'Síntomas Motores',
    sensory: 'Síntomas Sensoriales',
    autonomic: 'Síntomas Autonómicos',
    functional: 'Síntomas Funcionales',
    constitutional: 'Síntomas Constitucionales'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(symptomsData);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Evaluación de Síntomas Clínicos</h2>
          <p className="text-gray-300">Complete la información detallada sobre los síntomas del paciente para generar un análisis diagnóstico preciso.</p>
        </div>

        {/* Navegación por secciones */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(sectionTitles).map(([key, title]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCurrentSection(key as keyof ClinicalSymptomsData)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSection === key
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-100">{sectionTitles[currentSection]}</h3>
          
          <div className="grid gap-6">
            {Object.entries(symptomsData[currentSection]).map(([key, symptom]) =>
              renderSymptomCard(currentSection, key, symptom as ClinicalSymptom)
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Atrás
            </button>
          )}

          <div className="flex gap-4">
            {currentSection !== 'constitutional' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = ['motor', 'sensory', 'autonomic', 'functional', 'constitutional'] as const;
                  const currentIndex = sections.indexOf(currentSection);
                  if (currentIndex < sections.length - 1) {
                    setCurrentSection(sections[currentIndex + 1]);
                  }
                }}
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Siguiente Sección
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completar Evaluación
              </button>
            )}
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicalSymptomsForm;
export type { ClinicalSymptomsData, ClinicalSymptom }; 