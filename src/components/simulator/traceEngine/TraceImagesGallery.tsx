// src/components/simulator/traceEngine/TraceImagesGallery.tsx
// Galería de imágenes complementarias con subida a Supabase Storage y asignación a patrón Normal vs Patológico

import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  Layers,
  ZoomIn,
  X,
  Stethoscope,
  Scan,
  Plus,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';
import type {
  TraceComplementaryImage,
  ComplementaryImageType,
  PatternScope,
  TraceStudyType,
} from './types';
import {
  uploadTraceImageFile,
  uploadMultipleTraceImages,
  TRACE_IMAGES_BUCKET,
} from '../../../services/traceImageStorage';

interface TraceImagesGalleryProps {
  images?: TraceComplementaryImage[];
  onAddImage?: (img: TraceComplementaryImage, scope?: PatternScope) => void;
  onAddMultipleImages?: (imgs: TraceComplementaryImage[], scope?: PatternScope) => void;
  onRemoveImage?: (imgId: string) => void;
  canEdit?: boolean;
  isPathologic?: boolean;
  studyType?: TraceStudyType;
  className?: string;
}

const TYPE_CONFIG: Record<
  ComplementaryImageType,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  electrode_technique: {
    label: 'Técnica de Electrodos',
    icon: Layers,
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  },
  ultrasound: {
    label: 'Ecografía Neuromuscular',
    icon: Scan,
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  },
  clinical: {
    label: 'Fotografía Clínica',
    icon: Stethoscope,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  mri: {
    label: 'Resonancia Magnética',
    icon: Layers,
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  },
};

export const TraceImagesGallery: React.FC<TraceImagesGalleryProps> = ({
  images = [],
  onAddImage,
  onAddMultipleImages,
  onRemoveImage,
  canEdit = false,
  isPathologic = false,
  studyType = 'motor',
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<TraceComplementaryImage | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');

  // Filtro de visualización: por defecto 'all' o sincronizado con el osciloscopio
  const [patternFilter, setPatternFilter] = useState<'all' | 'normal' | 'pathologic'>('all');

  // Ámbito de asignación al añadir imagen
  const [targetScope, setTargetScope] = useState<PatternScope>(
    isPathologic ? 'pathologic' : 'normal'
  );

  // Sincronizar automáticamente el ámbito del formulario cuando cambie el conmutador de la pantalla
  useEffect(() => {
    setTargetScope(isPathologic ? 'pathologic' : 'normal');
  }, [isPathologic]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states for manual or single image upload
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<ComplementaryImageType>('electrode_technique');
  const [newCaption, setNewCaption] = useState('');
  const [newMeasurement, setNewMeasurement] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Filtrar imágenes mostradas según el filtro seleccionado
  const filteredImages = images.filter((img) => {
    if (patternFilter === 'all') return true;
    if (patternFilter === 'normal') return img.patternScope === 'normal' || img.patternScope === 'both' || !img.patternScope;
    if (patternFilter === 'pathologic') return img.patternScope === 'pathologic' || img.patternScope === 'both' || !img.patternScope;
    return true;
  });

  const currentImage = filteredImages[activeTab] ?? filteredImages[0] ?? images[0];

  // Contadores
  const normalCount = images.filter((img) => img.patternScope === 'normal' || img.patternScope === 'both' || !img.patternScope).length;
  const pathCount = images.filter((img) => img.patternScope === 'pathologic' || img.patternScope === 'both' || !img.patternScope).length;

  // Manejador de selección de archivos (1 o varios)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setUploadError(null);

    // Caso 1: Se seleccionaron múltiples imágenes a la vez
    if (files.length > 1) {
      setIsUploading(true);
      setUploadProgressText(`Subiendo ${files.length} imágenes al bucket ${TRACE_IMAGES_BUCKET}...`);

      try {
        const results = await uploadMultipleTraceImages(files);
        const newImages: TraceComplementaryImage[] = results.map((res, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          title: res.title,
          url: res.url,
          type: res.inferredType,
          patternScope: targetScope,
          caption: `Imagen asignada al patrón ${targetScope === 'normal' ? 'Normal' : targetScope === 'pathologic' ? 'Patológico' : 'Compartido'} (${res.fileName})`,
        }));

        if (onAddMultipleImages) {
          onAddMultipleImages(newImages, targetScope);
        } else if (onAddImage) {
          newImages.forEach((img) => onAddImage(img, targetScope));
        }

        setShowAddForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setUploadError(err?.message || 'Error al subir múltiples imágenes');
      } finally {
        setIsUploading(false);
        setUploadProgressText('');
      }
      return;
    }

    // Caso 2: Se seleccionó 1 archivo
    const singleFile = files[0];
    setPreviewFile(singleFile);
    setIsUploading(true);
    setUploadProgressText(`Subiendo archivo al bucket ${TRACE_IMAGES_BUCKET}...`);

    try {
      const result = await uploadTraceImageFile(singleFile);
      setNewUrl(result.url);
      setNewTitle(result.title);
      setNewType(result.inferredType);
      if (result.inferredType === 'ultrasound') {
        setNewMeasurement(
          targetScope === 'normal'
            ? 'Área CSA normal: -- mm² (Norma: < 10 mm²)'
            : 'Área CSA patológica: -- mm² (Engrosamiento)'
        );
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim() || !onAddImage) return;

    onAddImage({
      id: `img-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      type: newType,
      patternScope: targetScope,
      caption: newCaption.trim(),
      measurementNote: newMeasurement.trim() || undefined,
    }, targetScope);

    setNewTitle('');
    setNewUrl('');
    setNewCaption('');
    setNewMeasurement('');
    setPreviewFile(null);
    setShowAddForm(false);
  };

  const handleDeleteImage = (imgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemoveImage) return;
    if (confirm('¿Eliminar esta imagen del trazo?')) {
      onRemoveImage(imgId);
      if (activeTab > 0) setActiveTab(activeTab - 1);
    }
  };

  if (images.length === 0 && !canEdit) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 text-slate-100 ${className}`}>
      {/* Cabecera de la galería con conmutador de patrones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Image className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Correlación Anatómica e Imagenología
              </h4>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 uppercase">
                {studyType === 'needle' ? 'EMG de Aguja' : studyType === 'sensory' ? 'SNAP Sensitivo' : 'CMAP Motor'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Imágenes del patrón normal vs. hallazgos patológicos (ecografía, montaje de electrodos y clínica)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro rápido: Todos vs Normal vs Patológico */}
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => { setPatternFilter('all'); setActiveTab(0); }}
              className={`px-2.5 py-0.5 rounded-md transition ${
                patternFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({images.length})
            </button>
            <button
              type="button"
              onClick={() => { setPatternFilter('normal'); setActiveTab(0); }}
              className={`px-2.5 py-0.5 rounded-md transition flex items-center gap-1 ${
                patternFilter === 'normal'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Normal ({normalCount})</span>
            </button>
            <button
              type="button"
              onClick={() => { setPatternFilter('pathologic'); setActiveTab(0); }}
              className={`px-2.5 py-0.5 rounded-md transition flex items-center gap-1 ${
                patternFilter === 'pathologic'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <AlertCircle className="h-3 w-3" />
              <span>Patológico ({pathCount})</span>
            </button>
          </div>

          {canEdit && onAddImage && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 rounded-lg border border-cyan-600/60 bg-cyan-950/60 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/60 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir Imagen</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulario para añadir imágenes (con asignación a patrón Normal o Patológico) */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-4 rounded-xl border border-cyan-800/80 bg-slate-950 p-3.5 space-y-3 text-xs shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-300">Nueva Imagen Complementaria</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                Bucket: {TRACE_IMAGES_BUCKET}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setPreviewFile(null);
                setUploadError(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selector de Patrón Fisiológico vs Patológico */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">
              Asociación al Patrón del Estudio ({studyType === 'needle' ? 'EMG de Aguja' : 'Neuroconducción'}) *
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTargetScope('normal')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  targetScope === 'normal'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Patrón Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('pathologic')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  targetScope === 'pathologic'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Patrón Anormal</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('both')}
                className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  targetScope === 'both'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Ambos Patrones</span>
              </button>
            </div>
          </div>

          {/* Selector de Modo: Subir Archivo vs URL */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                inputMode === 'upload'
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Subir Archivo(s) al Bucket</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                inputMode === 'url'
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Enlace URL Externo</span>
            </button>
          </div>

          {/* Zona de Arrastre / Selección de Archivos del Bucket */}
          {inputMode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-800/60 hover:border-cyan-500/80 rounded-xl p-4 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition flex flex-col items-center justify-center space-y-1.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFilesSelected}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex items-center gap-2 text-cyan-300 py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                  <span className="font-semibold">{uploadProgressText}</span>
                </div>
              ) : previewFile ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-semibold truncate max-w-xs">{previewFile.name} subido con éxito</span>
                  <span className="text-[10px] text-slate-400">({(previewFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Selecciona o arrastra una o varias imágenes para el patrón {targetScope === 'normal' ? 'Normal' : targetScope === 'pathologic' ? 'Patológico' : 'General'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {studyType === 'needle'
                        ? 'Ecografía de músculo sano vs. denervado, foto de punción o biopsia (hasta 10 MB)'
                        : 'Ecografías CSA, fotos de montaje o resonancia magnética (hasta 10 MB)'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Título de la Imagen *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  targetScope === 'normal'
                    ? 'Ej. Ecografía CSA Normal en Muñeca'
                    : 'Ej. Ecografía de Atrapamiento Severo / Neuroma'
                }
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Categoría / Tipo</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ComplementaryImageType)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs outline-none focus:border-cyan-400"
              >
                <option value="electrode_technique">
                  {studyType === 'needle' ? 'Técnica de Inserción / Aguja' : 'Técnica de Electrodos'}
                </option>
                <option value="ultrasound">
                  {studyType === 'needle' ? 'Ecografía Muscular (Heckmatt)' : 'Ecografía Neuromuscular'}
                </option>
                <option value="clinical">Fotografía Clínica / Atrofia</option>
                <option value="mri">Resonancia Magnética (T2/STIR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">
              URL del Archivo {inputMode === 'upload' && '(Asignada automáticamente por Supabase Storage)'} *
            </label>
            <input
              type="text"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://... o ruta del bucket"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs font-mono text-[11px] outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Nota de Medición (Opcional)</label>
              <input
                type="text"
                value={newMeasurement}
                onChange={(e) => setNewMeasurement(e.target.value)}
                placeholder={
                  targetScope === 'normal'
                    ? 'Ej. CSA: 7.5 mm² (Norma: < 10 mm²)'
                    : 'Ej. CSA: 15.2 mm² (Aumento patológico)'
                }
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Pie de Foto Explicativo</label>
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Ej. Comparación transversal de fascículos y ecogenicidad"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !newUrl.trim() || !newTitle.trim()}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-teal-400 transition disabled:opacity-50 shadow-md"
          >
            Guardar Imagen en el Patrón {targetScope === 'normal' ? 'Normal' : targetScope === 'pathologic' ? 'Patológico' : 'General'}
          </button>
        </form>
      )}

      {filteredImages.length > 0 ? (
        <div>
          {/* Pestañas de Imágenes filtradas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
            {filteredImages.map((img, idx) => {
              const conf = TYPE_CONFIG[img.type] || TYPE_CONFIG.electrode_technique;
              const Icon = conf.icon;
              return (
                <div
                  key={img.id || idx}
                  className={`flex items-center rounded-lg border transition whitespace-nowrap text-[11px] font-semibold ${
                    activeTab === idx
                      ? 'bg-slate-800 border-cyan-400 text-cyan-300 shadow-xs'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className="flex items-center gap-1.5 px-2.5 py-1"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{img.title}</span>
                    {/* Badge de ámbito clínico */}
                    {img.patternScope === 'normal' && (
                      <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 text-[9px] font-bold">
                        Normal
                      </span>
                    )}
                    {img.patternScope === 'pathologic' && (
                      <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 text-[9px] font-bold">
                        Patológico
                      </span>
                    )}
                  </button>
                  {canEdit && onRemoveImage && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteImage(img.id, e)}
                      className="pr-2 pl-1 text-slate-500 hover:text-rose-400 transition"
                      title="Eliminar esta imagen del trazo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Imagen Activa con Pie de Foto y Botón de Ampliación */}
          {currentImage && (
            <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <div className="relative group cursor-pointer" onClick={() => setSelectedImage(currentImage)}>
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-full h-44 sm:h-60 object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-3.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_CONFIG[currentImage.type]?.color}`}>
                        {TYPE_CONFIG[currentImage.type]?.label}
                      </span>
                      {currentImage.patternScope === 'normal' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Patrón Normal
                        </span>
                      )}
                      {currentImage.patternScope === 'pathologic' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Patrón Anormal
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">{currentImage.title}</p>
                    {currentImage.caption && (
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{currentImage.caption}</p>
                    )}
                  </div>
                  <span className="p-1.5 rounded-lg bg-slate-900/80 text-white shrink-0 ml-2 shadow-xs">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {currentImage.measurementNote && (
                <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                  <span>Métrica / Hallazgo Cuantitativo:</span>
                  <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                    {currentImage.measurementNote}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No hay imágenes registradas para el filtro seleccionado ({patternFilter === 'normal' ? 'Patrón Normal' : patternFilter === 'pathologic' ? 'Patrón Patológico' : 'Todos'}).
        </div>
      )}

      {/* Lightbox / Modal de Imagen a Pantalla Completa */}
      {selectedImage && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_CONFIG[selectedImage.type]?.color}`}>
                  {TYPE_CONFIG[selectedImage.type]?.label}
                </span>
                {selectedImage.patternScope === 'normal' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Normal
                  </span>
                )}
                {selectedImage.patternScope === 'pathologic' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Patológico
                  </span>
                )}
                <h3 className="font-bold text-sm text-white">{selectedImage.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-2 flex-1 overflow-auto flex items-center justify-center bg-black">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 text-xs">
              <p className="text-slate-200">{selectedImage.caption}</p>
              {selectedImage.measurementNote && (
                <p className="mt-1 font-mono text-cyan-400 font-bold">{selectedImage.measurementNote}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
