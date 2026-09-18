import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Video,
  FileText,
  Lightbulb,
  Image,
  Search,
  BookOpen,
  User,
  ArrowRight,
  PlayCircle,
  Clock,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { getWorkshops } from '../../services/courseService';
import { getAllPublishedTopics, getPublicProfiles, getPublishedModules } from '../../services/editorialService';
import type { LiveWorkshop, PublishedTopic, Profile, PublishedModule } from '../../types/database';

type ContentFilter = 'all' | 'recordings' | 'guides' | 'pearls' | 'images';

export default function SpecialistContentHubPage() {
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [topics, setTopics] = useState<PublishedTopic[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [modules, setModules] = useState<Map<string, PublishedModule>>(new Map());
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [wsData, topData, profData, modData] = await Promise.all([
          getWorkshops(),
          getAllPublishedTopics(),
          getPublicProfiles(),
          getPublishedModules(),
        ]);

        setWorkshops(wsData);
        setTopics(topData);

        const profMap = new Map<string, Profile>();
        for (const p of profData) profMap.set(p.id, p);
        setProfiles(profMap);

        const modMap = new Map<string, PublishedModule>();
        for (const m of modData) modMap.set(m.id, m);
        setModules(modMap);
      } catch (err) {
        console.error('Error loading specialist content hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered workshops with recordings
  const recordedWorkshops = useMemo(() => {
    return workshops.filter((w) => Boolean(w.recording_url));
  }, [workshops]);

  // Topics with specialist multimedia or pearls
  const richTopics = useMemo(() => {
    return topics.filter((t) => {
      const hasMedia = Boolean(
        t.media?.videoUrls?.length ||
        t.media?.youtubeUrls?.length ||
        t.media?.vimeoUrls?.length ||
        t.media?.imageUrls?.length ||
        t.video_url
      );
      const hasPearls = Boolean(t.clinical_pearls?.length);
      const hasContent = Boolean(t.content && t.content.length > 50);
      return hasMedia || hasPearls || hasContent;
    });
  }, [topics]);

  // Combined searchable items
  const filteredRecordings = useMemo(() => {
    if (activeFilter === 'guides' || activeFilter === 'pearls' || activeFilter === 'images') {
      return [];
    }
    return recordedWorkshops.filter((w) => {
      if (selectedModule !== 'all' && w.module_id !== selectedModule) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        (w.description && w.description.toLowerCase().includes(q))
      );
    });
  }, [recordedWorkshops, activeFilter, selectedModule, searchQuery]);

  const filteredTopics = useMemo(() => {
    if (activeFilter === 'recordings') return [];
    return richTopics.filter((t) => {
      if (selectedModule !== 'all' && t.module_id !== selectedModule) return false;

      // Filter by type
      if (activeFilter === 'guides') {
        const hasGuideOrDoc = Boolean(
          (t.content && (t.content.includes('http') || t.content.includes('.pdf') || t.content.includes('Guía'))) ||
          t.tags?.some((tg) => tg.toLowerCase().includes('guía') || tg.toLowerCase().includes('protocolo'))
        );
        if (!hasGuideOrDoc) return false;
      }

      if (activeFilter === 'pearls') {
        if (!t.clinical_pearls || t.clinical_pearls.length === 0) return false;
      }

      if (activeFilter === 'images') {
        if (!t.media?.imageUrls || t.media.imageUrls.length === 0) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchPearls = t.clinical_pearls?.some((p) => p.toLowerCase().includes(q));
      const author = t.last_edited_by ? profiles.get(t.last_edited_by)?.display_name : '';
      const matchAuthor = author ? author.toLowerCase().includes(q) : false;

      return matchTitle || matchDesc || matchPearls || matchAuthor;
    });
  }, [richTopics, activeFilter, selectedModule, searchQuery, profiles]);

  const totalResultsCount = filteredRecordings.length + filteredTopics.length;

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-5 border border-blue-200/50 dark:border-blue-800/40">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Biblioteca Docente y Colaborativa
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          Contenido Aportado por <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            Médicos Especialistas
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Explora todas las clases grabadas, guías clínicas prácticas, trazados de electromiografía y perlas docentes compartidas por los especialistas para enriquecer tu aprendizaje.
        </p>
      </motion.div>

      {/* Search and Filters Bar */}
      <div className="mb-8 p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        {/* Search input & Module selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por tema, especialista, patología, técnica EMG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            >
              <option value="all">Todos los módulos curriculares</option>
              {Array.from(modules.values()).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todo el material ({recordedWorkshops.length + richTopics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('recordings')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'recordings'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Clases Grabadas ({recordedWorkshops.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('guides')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'guides'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Guías Clínicas y Documentos
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pearls')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'pearls'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Perlas Clínicas
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('images')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'images'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Trazados EMG e Ilustraciones
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-sm text-slate-500">Cargando biblioteca de especialistas...</p>
        </div>
      ) : totalResultsCount === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No se encontraron materiales
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            No hay elementos que coincidan con tu búsqueda o filtros seleccionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedModule('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Recorded Classes (if visible) */}
          {filteredRecordings.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Clases Magistrales Grabadas
                    </h2>
                    <p className="text-xs text-slate-500">
                      Grabaciones completas disponibles para reproducción inmediata
                    </p>
                  </div>
                </div>
                <Link
                  to="/talleres"
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  Ver todos los talleres <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecordings.map((ws) => {
                  const d = new Date(ws.scheduled_at);
                  const mod = ws.module_id ? modules.get(ws.module_id) : null;
                  return (
                    <div
                      key={ws.id}
                      className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            <PlayCircle className="w-3 h-3" />
                            Grabación
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {mod && (
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
                            <span>{mod.emoji}</span>
                            <span>{mod.title}</span>
                          </p>
                        )}

                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {ws.title}
                        </h3>

                        {ws.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                            {ws.description}
                          </p>
                        )}

                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ws.duration_minutes} min
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/taller/${ws.id}`}
                              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Detalles
                            </Link>
                            {ws.recording_url && (
                              <a
                                href={ws.recording_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                Ver Video ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Specialist Contributed Topic Content */}
          {filteredTopics.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Guías y Materiales en Lecciones del Curso
                    </h2>
                    <p className="text-xs text-slate-500">
                      Recursos clínicos, perlas y videos integrados en el currículo formativo
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map((top) => {
                  const mod = modules.get(top.module_id);
                  const author = top.last_edited_by ? profiles.get(top.last_edited_by) : null;
                  const hasVideos = Boolean(
                    top.media?.videoUrls?.length ||
                    top.media?.youtubeUrls?.length ||
                    top.media?.vimeoUrls?.length ||
                    top.video_url
                  );
                  const hasPearls = Boolean(top.clinical_pearls?.length);
                  const hasImages = Boolean(top.media?.imageUrls?.length);

                  return (
                    <div
                      key={top.id}
                      className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Module badge & badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {mod ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                              <span>{mod.emoji}</span>
                              <span className="truncate">{mod.title}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Lección Clínica</span>
                          )}

                          <div className="flex items-center gap-1">
                            {hasVideos && (
                              <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px]" title="Contiene video">
                                <Video className="w-3 h-3" />
                              </span>
                            )}
                            {hasPearls && (
                              <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 text-[10px]" title="Contiene perla clínica">
                                <Lightbulb className="w-3 h-3" />
                              </span>
                            )}
                            {hasImages && (
                              <span className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 text-[10px]" title="Contiene trazados EMG">
                                <Image className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {top.title}
                        </h3>

                        {top.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                            {top.description}
                          </p>
                        )}

                        {/* Pearls sample preview if any */}
                        {top.clinical_pearls && top.clinical_pearls.length > 0 && (
                          <div className="mb-4 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0">💡</span>
                            <p className="line-clamp-2">{top.clinical_pearls[0]}</p>
                          </div>
                        )}

                        {/* Footer info */}
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[130px]">
                              {author?.display_name || 'Especialista Colaborador'}
                            </span>
                          </div>

                          <Link
                            to={`/modulo/${top.module_id}/${top.slug || top.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all"
                          >
                            <span>Estudiar tema</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
