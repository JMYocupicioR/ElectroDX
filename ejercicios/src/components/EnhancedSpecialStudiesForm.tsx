import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Zap, 
  RotateCcw, 
  AlertTriangle, 
  Target, 
  Settings,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { 
  specialStudiesDatabase, 
  specialStudiesCategories, 
  getStudiesByCategory,
  getRecommendedStudies,
  SpecialStudyDefinition
} from '../data/specialStudiesDatabase';
import { ReferenceValueRange } from '../types/ncs';

interface SpecialStudyResult {
  id: string;
  studyDefinition: SpecialStudyDefinition;
  side: 'left' | 'right' | 'bilateral';
  values: Record<string, number>;
  status: 'normal' | 'abnormal' | 'borderline';
  findings: string[];
  notes?: string;
  timestamp: string;
}

interface EnhancedSpecialStudiesFormProps {
  studies: SpecialStudyResult[];
  onChange: (studies: SpecialStudyResult[]) => void;
  clinicalContext?: string[];
}

const EnhancedSpecialStudiesForm: React.FC<EnhancedSpecialStudiesFormProps> = ({ 
  studies, 
  onChange,
  clinicalContext = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof specialStudiesCategories | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommended, setShowRecommended] = useState(false);
  const [currentStudy, setCurrentStudy] = useState<{
    definition: SpecialStudyDefinition | null;
    side: 'left' | 'right' | 'bilateral';
    values: Record<string, number>;
    notes: string;
  }>({
    definition: null,
    side: 'bilateral',
    values: {},
    notes: ''
  });

  // Filtrar estudios según criterios
  const filteredStudies = useMemo(() => {
    let filtered = specialStudiesDatabase;

    if (selectedCategory !== 'all') {
      filtered = getStudiesByCategory(selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(study => 
        study.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.clinicalIndications.some(indication => 
          indication.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (showRecommended && clinicalContext.length > 0) {
      const recommended = new Set();
      clinicalContext.forEach(context => {
        getRecommendedStudies(context).forEach(study => recommended.add(study.id));
      });
      filtered = filtered.filter(study => recommended.has(study.id));
    }

    return filtered;
  }, [selectedCategory, searchTerm, showRecommended, clinicalContext]);

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      Activity, Zap, RotateCcw, AlertTriangle, Target, Settings
    };
    const iconName = specialStudiesCategories[category as keyof typeof specialStudiesCategories]?.icon;
    return iconMap[iconName as keyof typeof iconMap] || Activity;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    const color = specialStudiesCategories[category as keyof typeof specialStudiesCategories]?.color;
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const isValueOutOfRange = (parameter: string, value: number, referenceValues: Record<string, ReferenceValueRange>): boolean => {
    const ref = referenceValues[parameter];
    if (!ref) return false;
    return value < ref.min || value > ref.max;
  };

  const calculateStudyStatus = (definition: SpecialStudyDefinition, values: Record<string, number>): 'normal' | 'abnormal' | 'borderline' => {
    const abnormalCount = definition.parameters.filter(param => {
      const value = values[param];
      if (value === undefined || value === null) return false;
      return isValueOutOfRange(param, value, definition.referenceValues);
    }).length;

    if (abnormalCount === 0) return 'normal';
    if (abnormalCount >= definition.parameters.length / 2) return 'abnormal';
    return 'borderline';
  };

  const generateFindings = (definition: SpecialStudyDefinition, values: Record<string, number>): string[] => {
    const findings: string[] = [];
    
    definition.parameters.forEach(param => {
      const value = values[param];
      const ref = definition.referenceValues[param];
      
      if (value !== undefined && ref) {
        if (value < ref.min) {
          findings.push(`${param} reducido (${value} ${definition.units[param]}, normal: ${ref.min}-${ref.max})`);
        } else if (value > ref.max) {
          findings.push(`${param} prolongado/aumentado (${value} ${definition.units[param]}, normal: ${ref.min}-${ref.max})`);
        }
      }
    });

    return findings;
  };

  const handleAddStudy = () => {
    if (!currentStudy.definition) return;

    const status = calculateStudyStatus(currentStudy.definition, currentStudy.values);
    const findings = generateFindings(currentStudy.definition, currentStudy.values);

    const newStudy: SpecialStudyResult = {
      id: `${currentStudy.definition.id}_${currentStudy.side}_${Date.now()}`,
      studyDefinition: currentStudy.definition,
      side: currentStudy.side,
      values: { ...currentStudy.values },
      status,
      findings,
      notes: currentStudy.notes,
      timestamp: new Date().toISOString()
    };

    onChange([...studies, newStudy]);
    
    setCurrentStudy({
      definition: null,
      side: 'bilateral',
      values: {},
      notes: ''
    });
  };

  const handleRemoveStudy = (studyId: string) => {
    onChange(studies.filter(study => study.id !== studyId));
  };

  const canAddStudy = () => {
    if (!currentStudy.definition) return false;
    
    const requiredParams = currentStudy.definition.parameters.filter(param => 
      currentStudy.definition?.referenceValues[param]
    );
    
    return requiredParams.every(param => 
      currentStudy.values[param] !== undefined && 
      currentStudy.values[param] !== null &&
      !isNaN(currentStudy.values[param])
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Estudios Especiales Avanzados
        </h3>
        <p className="text-blue-200 text-sm">
          Sistema expandido con 15+ estudios especializados organizados por categorías con validación automática.
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Search className="h-4 w-4 inline mr-1" />
            Buscar estudios
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o indicación..."
            className="w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Filter className="h-4 w-4 inline mr-1" />
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(specialStudiesCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecommended}
              onChange={(e) => setShowRecommended(e.target.checked)}
              className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Solo recomendados</span>
          </label>
        </div>
      </div>

      {/* Lista de estudios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStudies.map((study) => {
          const Icon = getCategoryIcon(study.category);
          const isSelected = currentStudy.definition?.id === study.id;
          
          return (
            <div
              key={study.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-900/30 border-blue-500 shadow-lg'
                  : 'bg-gray-800/30 border-gray-600 hover:bg-gray-700/30'
              }`}
              onClick={() => setCurrentStudy(prev => ({
                ...prev,
                definition: study,
                values: {},
                side: study.sideOptions.includes('bilateral') ? 'bilateral' : study.sideOptions[0]
              }))}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium text-gray-200">{study.name}</h4>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(study.category)}`}>
                  {specialStudiesCategories[study.category].name}
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-2">{study.description}</p>
              
              <div className="text-xs text-gray-500">
                <div className="mb-1">
                  <strong>Indicaciones:</strong> {study.clinicalIndications.slice(0, 2).join(', ')}
                  {study.clinicalIndications.length > 2 && '...'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulario de configuración */}
      {currentStudy.definition && (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
          <h4 className="text-lg font-semibold text-gray-200 mb-4">
            Configurar: {currentStudy.definition.name}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Lado</label>
              <select
                value={currentStudy.side}
                onChange={(e) => setCurrentStudy(prev => ({ ...prev, side: e.target.value as any }))}
                className="w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              >
                {currentStudy.definition.sideOptions.map(side => (
                  <option key={side} value={side}>
                    {side === 'left' ? 'Izquierdo' : side === 'right' ? 'Derecho' : 'Bilateral'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parámetros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {currentStudy.definition.parameters.map(parameter => {
              const value = currentStudy.values[parameter];
              const ref = currentStudy.definition!.referenceValues[parameter];
              const unit = currentStudy.definition!.units[parameter];
              const isOutOfRange = value !== undefined && ref && isValueOutOfRange(parameter, value, currentStudy.definition!.referenceValues);

              return (
                <div key={parameter}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {parameter} {unit && `(${unit})`}
                    {ref && (
                      <span className="text-gray-500 text-xs ml-1">
                        [{ref.min}-{ref.max}]
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={value || ''}
                      onChange={(e) => setCurrentStudy(prev => ({
                        ...prev,
                        values: { ...prev.values, [parameter]: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 focus:ring-blue-500 pr-8 ${
                        isOutOfRange ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="0.0"
                    />
                    {value !== undefined && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {isOutOfRange ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Notas adicionales</label>
            <textarea
              value={currentStudy.notes}
              onChange={(e) => setCurrentStudy(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2.5 border rounded-md bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Observaciones técnicas..."
            />
          </div>

          <button
            onClick={handleAddStudy}
            disabled={!canAddStudy()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              canAddStudy()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Estudio</span>
          </button>
        </div>
      )}

      {/* Estudios agregados */}
      {studies.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-200">Estudios Realizados ({studies.length})</h4>
          {studies.map((study) => (
            <div key={study.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium text-gray-200">{study.studyDefinition.name}</h5>
                  <p className="text-sm text-gray-400">
                    {study.side === 'left' ? 'Izquierdo' : study.side === 'right' ? 'Derecho' : 'Bilateral'} - 
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      study.status === 'normal' ? 'bg-green-500/20 text-green-300' :
                      study.status === 'abnormal' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {study.status === 'normal' ? 'Normal' : 
                       study.status === 'abnormal' ? 'Anormal' : 'Limítrofe'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveStudy(study.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {Object.entries(study.values).map(([param, value]) => (
                  <div key={param} className="text-sm">
                    <span className="text-gray-500">{param}:</span>
                    <span className="text-gray-200 ml-1">
                      {value} {study.studyDefinition.units[param]}
                    </span>
                  </div>
                ))}
              </div>

              {study.findings.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-300 mb-1">Hallazgos:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {study.findings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {study.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Notas:</p>
                  <p className="text-sm text-gray-400">{study.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSpecialStudiesForm; 