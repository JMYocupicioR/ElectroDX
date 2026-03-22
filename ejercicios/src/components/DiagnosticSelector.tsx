import * as React from 'react';
import { diagnosticCategories } from '../data/diagnosticCategories';
import { Search } from 'lucide-react';

interface DiagnosticSelectorProps {
  onSelect: (diagnosisId: string) => void;
  selectedDiagnosis?: string;
}

const DiagnosticSelector: React.FC<DiagnosticSelectorProps> = ({ onSelect, selectedDiagnosis }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredCategories = diagnosticCategories.filter(category => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;
    if (!searchTerm) return true;
    return category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Selección de Diagnóstico Presuntivo</h2>
      
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar diagnóstico..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Filtro de categorías */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
        >
          <option value="all">Todas las categorías</option>
          {diagnosticCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de diagnósticos */}
      <div className="space-y-4">
        {filteredCategories.map(category => (
          <div key={category.id} className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700/30">
            <h3 className="bg-gray-700/50 p-3 text-lg font-medium text-gray-200">
              {category.name}
            </h3>
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => onSelect(`${category.id}_${subcategory.id}`)}
                    className={`text-left p-3 border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      selectedDiagnosis === `${category.id}_${subcategory.id}`
                        ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                        : 'hover:bg-gray-600/50 border-gray-600 text-gray-200'
                    }`}
                  >
                    <div className="font-medium">{subcategory.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticSelector;