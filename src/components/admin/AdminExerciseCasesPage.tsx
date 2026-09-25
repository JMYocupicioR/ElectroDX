import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Activity,
  Zap,
  Send,
  Edit,
  Copy,
  Trash2,
  Eye,
  ArrowLeft,
  RefreshCw,
  GraduationCap,
  SearchX,
  Globe,
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  loadAllCaseTemplates,
  deleteCaseTemplate,
  setExercisePublicVisibility,
  type CustomCaseTemplateRecord,
} from '../../services/emgExerciseService';
import { EmgCaseEditorModal } from './EmgCaseEditorModal';
import { AssignClinicalCaseModal } from './AssignClinicalCaseModal';
import { useAuth } from '../../contexts/AuthProvider';

const CATEGORY_NAMES: Record<string, string> = {
  all: 'Todas las Categorías',
  normal: 'Normal',
  axonal: 'Axonal',
  demyelinating: 'Desmielinizante',
  myopathic: 'Miopática',
  entrapment: 'Atrapamiento Focal',
  radiculopathy: 'Radiculopatía',
  plexopathy: 'Plexopatía',
  motor_neuron_disease: 'Enf. Motoneurona',
  neuromuscular_junction: 'Unión NM',
  pitfall: '⚠️ Trampa / Variante',
};

export default function AdminExerciseCasesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<CustomCaseTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'fallback'>('fallback');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'custom' | 'base'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'practice' | 'exam_only' | 'both'>('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'hidden'>('all');
  const [publicBusyId, setPublicBusyId] = useState<string | null>(null);

  // Modales
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CustomCaseTemplateRecord | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningPatternId, setAssigningPatternId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await loadAllCaseTemplates({ includeDrafts: true });
      setCases(res.templates);
      setSource(res.source);
    } catch (e) {
      console.error('Error cargando casos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de casos
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch =
        !searchTerm.trim() ||
        c.patternName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patternId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;

      const matchesOrigin =
        originFilter === 'all' ||
        (originFilter === 'custom' && c.is_custom) ||
        (originFilter === 'base' && !c.is_custom);

      const matchesUsage =
        usageFilter === 'all' ||
        (usageFilter === 'practice' && (c.usageMode === 'practice' || !c.usageMode)) ||
        (usageFilter === 'exam_only' && c.usageMode === 'exam_only') ||
        (usageFilter === 'both' && c.usageMode === 'both');

      const matchesPublic =
        publicFilter === 'all' ||
        (publicFilter === 'public' && c.isPublic) ||
        (publicFilter === 'hidden' && !c.isPublic);

      return matchesSearch && matchesCat && matchesOrigin && matchesUsage && matchesPublic;
    });
  }, [cases, searchTerm, categoryFilter, originFilter, usageFilter, publicFilter]);

  // Conteo de casos por categoría para las píldoras de filtrado
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: cases.length };
    cases.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [cases]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || categoryFilter !== 'all' || originFilter !== 'all' || usageFilter !== 'all' || publicFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setOriginFilter('all');
    setUsageFilter('all');
    setPublicFilter('all');
  };

  const publicCount = cases.filter(c => c.isPublic).length;

  const handleTogglePublic = async (c: CustomCaseTemplateRecord) => {
    if (c.usageMode === 'exam_only') {
      alert('Los casos exclusivos de examen no se publican en el simulador público.');
      return;
    }
    const next = !c.isPublic;
    setPublicBusyId(c.patternId);
    setCases(prev => prev.map(item => item.patternId === c.patternId ? { ...item, isPublic: next } : item));
    const result = await setExercisePublicVisibility(c.patternId, next, user?.id);
    setPublicBusyId(null);
    if (!result.success) {
      setCases(prev => prev.map(item => item.patternId === c.patternId ? { ...item, isPublic: !next } : item));
      alert(result.error || 'No se pudo actualizar la visibilidad pública. Aplica la migración emg_public_exercises.');
    }
  };

  // Métricas
  const totalCount = cases.length;
  const examCount = cases.filter(c => c.usageMode === 'exam_only').length;
  const practiceCount = cases.filter(c => c.usageMode === 'practice' || c.usageMode === 'both' || !c.usageMode).length;
  const customCount = cases.filter(c => c.is_custom).length;
  const rnsCount = cases.filter(c => c.rns && c.rns.length > 0).length;
  const pitfallCount = cases.filter(c => c.isPitfall).length;

  const handleCreateNew = () => {
    setEditingCase(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (c: CustomCaseTemplateRecord) => {
    setEditingCase(c);
    setIsEditorOpen(true);
  };

  const handleDuplicate = (c: CustomCaseTemplateRecord) => {
    const cloned: CustomCaseTemplateRecord = {
      ...c,
      patternId: `${c.patternId}_copia_${Date.now().toString(36).slice(-4)}`,
      patternName: `${c.patternName} (Copia)`,
      is_custom: true,
      id: undefined,
    };
    setEditingCase(cloned);
    setIsEditorOpen(true);
  };

  const handleDelete = async (patternId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el caso "${name}"?`)) return;
    try {
      const res = await deleteCaseTemplate(patternId);
      if (!res.success) {
        alert(res.error || 'Error al eliminar caso clínico');
        return;
      }
      await loadData();
    } catch (e) {
      alert('Error al eliminar caso clínico');
    }
  };

  const handleAssign = (patternId?: string) => {
    setAssigningPatternId(patternId);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Administración', to: '/admin' },
              { label: 'Casos y Ejercicios EMG' },
            ]}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Recargar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/simuladores/publico"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>Ver Simulador Público</span>
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-indigo-950 border border-amber-500/30 relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Gestor Académico de Casos Clínicos EMG</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-mono text-slate-300">
                {source === 'supabase' ? 'Sincronizado Supabase' : 'Catálogo Local'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Simulador de Casos y Ejercicios EMG
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Administra el catálogo de casos clínicos del motor de electromiografía, crea nuevos
              ejemplos con valores fisiológicos y asígnalos directamente a los alumnos de tu curso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Caso Clínico</span>
            </button>

            <button
              onClick={() => handleAssign()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Asignar a Alumnos</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Casos</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">En catálogo activo</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40">
            <div className="text-[11px] text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Banco Examen
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">{examCount}</div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">Protegidos (no libres)</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
            <div className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Práctica Libre</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{practiceCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Visibles en simulador</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">Casos Docentes</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">{customCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Creados a medida</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-rose-400 uppercase font-bold tracking-wider">Casos Trampa</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">{pitfallCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Variantes / artefactos</div>
          </div>
        </div>

        {/* Filter Bar & Category Chips */}
        <div className="space-y-3">
          {/* Barra de Filtros interactiva con chips de categoría */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
            {Object.entries(CATEGORY_NAMES).map(([catKey, catLabel]) => {
              const isActive = categoryFilter === catKey;
              const count = categoryCounts[catKey] || 0;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryFilter(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span>{catLabel}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/25 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, hallazgo o diagnóstico..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none font-medium"
              >
                <option value="all">Todos los Destinos</option>
                <option value="practice">📖 Solo Práctica Libre</option>
                <option value="exam_only">🎓 Solo Banco de Examen (Protegido)</option>
                <option value="both">🔄 Casos Híbridos</option>
              </select>

              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              >
                <option value="all">Todos los Orígenes</option>
                <option value="custom">Solo Creados por Docentes</option>
                <option value="base">Plantillas Base del Sistema (33)</option>
              </select>

              <select
                value={publicFilter}
                onChange={(e) => setPublicFilter(e.target.value as 'all' | 'public' | 'hidden')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              >
                <option value="all">Modo público: todos ({publicCount} visibles)</option>
                <option value="public">Solo visibles al público</option>
                <option value="hidden">Ocultos del modo público</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Restablecer todos los filtros"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Mostrando <strong className="text-white font-bold">{filteredCases.length}</strong> de{' '}
              <strong className="text-slate-300 font-semibold">{cases.length}</strong> casos clínicos
            </span>
            {categoryFilter !== 'all' && (
              <span className="text-[11px] text-amber-400 font-medium">
                Filtrado por: {CATEGORY_NAMES[categoryFilter]}
              </span>
            )}
          </div>
        </div>

        {/* Cases Grid or Illustrated Empty State */}
        {filteredCases.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <SearchX className="w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No se encontraron casos clínicos</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {hasActiveFilters
                  ? 'Ningún caso clínico coincide con el término de búsqueda o filtros seleccionados.'
                  : 'Aún no hay casos registrados en esta sección.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restablecer Filtros</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Nuevo Caso</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((c) => {
              const isPitfall = c.isPitfall;
              return (
                <div
                  key={c.patternId}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isPitfall
                      ? 'bg-gradient-to-b from-amber-950/20 to-slate-900/90 border-amber-800/40 hover:border-amber-600'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        c.category === 'entrapment' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        c.category === 'radiculopathy' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        c.category === 'axonal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        c.category === 'demyelinating' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        c.category === 'myopathic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        c.category === 'motor_neuron_disease' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        c.category === 'neuromuscular_junction' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {CATEGORY_NAMES[c.category] || c.category}
                      </span>

                      {/* Usage Mode Badge */}
                      {c.usageMode === 'exam_only' ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1" title="Exclusivo de examen. Oculto en el simulador libre.">
                          <GraduationCap className="w-3 h-3" /> Examen
                        </span>
                      ) : c.usageMode === 'both' ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1" title="Disponible en simulador y exámenes.">
                          🔄 Híbrido
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1" title="Práctica libre en simulador.">
                          📖 Práctica
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.is_custom && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Docente
                        </span>
                      )}
                      {isPitfall && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40">
                          Trampa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white line-clamp-2" title={c.patternName}>
                    {c.patternName}
                  </h3>

                  {/* Clinical Description Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {c.explanation}
                  </p>

                  {/* Test Counts and Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      {c.ncs?.length || 0} nervios
                    </span>

                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Zap className="w-3.5 h-3.5 text-green-400" />
                      {c.emg?.length || 0} músculos
                    </span>

                    {c.rns && c.rns.length > 0 && (
                      <span className="flex items-center gap-1 bg-cyan-950/40 text-cyan-300 px-2 py-1 rounded-lg border border-cyan-800/40 font-semibold">
                        ENR
                      </span>
                    )}

                    {c.lateResponses && c.lateResponses.length > 0 && (
                      <span className="flex items-center gap-1 bg-indigo-950/40 text-indigo-300 px-2 py-1 rounded-lg border border-indigo-800/40 font-semibold">
                        F/H
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      title="Editar caso clínico"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(c)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      title="Duplicar como variante"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/ejercicios?patternId=${c.patternId}`)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                      title="Probar en el simulador"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublic(c)}
                      disabled={publicBusyId === c.patternId || c.usageMode === 'exam_only'}
                      className={`p-2 rounded-xl border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        c.isPublic
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                          : 'bg-slate-800 border-transparent text-slate-400 hover:text-cyan-200'
                      }`}
                      title={
                        c.usageMode === 'exam_only'
                          ? 'Los casos de examen no se publican'
                          : c.isPublic
                            ? 'Visible en modo público. Clic para ocultar.'
                            : 'Oculto. Clic para mostrarlo en el simulador público.'
                      }
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    {c.is_custom && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.patternId, c.patternName)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition cursor-pointer"
                        title="Eliminar caso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssign(c.patternId)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Asignar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Modal: Editor de Casos */}
      <EmgCaseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={loadData}
        initialTemplate={editingCase}
      />

      {/* Modal: Asignación a Alumnos */}
      <AssignClinicalCaseModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        initialCasePatternId={assigningPatternId}
      />
    </div>
  );
}
