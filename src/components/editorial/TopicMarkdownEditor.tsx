import { useState, useRef, useMemo, type ChangeEvent } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table,
  Lightbulb,
  Target,
  Minus,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  HelpCircle,
  Clock,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { RichContent } from '../content/RichContent';

interface TopicMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

type EditorTab = 'write' | 'preview' | 'split';

export function TopicMarkdownEditor({
  value,
  onChange,
  label = 'Contenido clínico (Markdown)',
  placeholder = 'Escribe aquí la lección en formato Markdown (soporta encabezados, tablas, perlas clínicas, listas, enlaces y código)...',
  minHeight = '360px',
}: TopicMarkdownEditorProps) {
  const [tab, setTab] = useState<EditorTab>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Estadísticas del texto
  const stats = useMemo(() => {
    const text = value.trim();
    if (!text) {
      return { words: 0, chars: 0, readTimeMinutes: 0 };
    }
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    // Promedio de lectura clínica: ~180 palabras por minuto
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
    return { words, chars, readTimeMinutes };
  }, [value]);

  // Inserción inteligente con soporte de selección
  const insertFormatting = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || defaultText;

    const updated =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(updated);

    // Reposicionar el cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + before.length + textToInsert.length + after.length
        : start + before.length;
      textarea.setSelectionRange(
        selectedText ? newCursorPos : start + before.length,
        selectedText ? newCursorPos : start + before.length + defaultText.length
      );
    }, 10);
  };

  const handleInsertTable = () => {
    const tableTemplate = `\n| Parámetro | Valor Normal | Criterio Patológico |\n| :--- | :--- | :--- |\n| Latencia de inicio | < 4.0 ms | Prolongada (Desmielinización) |\n| Amplitud pico a pico | > 4.0 mV | Reducida (Pérdida axonal) |\n| Velocidad de conducción | > 50 m/s | Enlentecida (< 70-80% límite) |\n\n`;
    insertFormatting(tableTemplate, '', '');
  };

  const handleInsertPearl = () => {
    insertFormatting('> 💡 **Perla Clínica:** ', '\n\n', 'Escribe aquí la recomendación diagnóstica clave...');
  };

  const handleInsertKeyPoint = () => {
    insertFormatting('> 🎯 **Punto Clave:** ', '\n\n', 'Concepto fundamental a recordar para la práctica clínica...');
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-white dark:bg-slate-900 border-blue-500 shadow-2xl p-4 overflow-hidden'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
      }`}
    >
      {/* Barra de cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </span>
          {stats.words > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {stats.words} palabras
            </span>
          )}
        </div>

        {/* Pestañas de modo */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tab === 'write'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Escribir</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista previa</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('split')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              tab === 'split'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Editor y vista previa en paralelo"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dividida</span>
          </button>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className={`p-1.5 rounded-lg transition-colors ${
              showCheatSheet
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
            title="Guía de sintaxis Markdown"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Barra de herramientas Markdown */}
      {(tab === 'write' || tab === 'split') && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
          {/* Encabezados */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => insertFormatting('\n## ', '\n', 'Título de sección')}
              className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold inline-flex items-center gap-0.5"
              title="Encabezado H2 (##)"
            >
              <Heading2 className="w-3.5 h-3.5" /> H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n### ', '\n', 'Subtítulo')}
              className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold inline-flex items-center gap-0.5"
              title="Encabezado H3 (###)"
            >
              <Heading3 className="w-3.5 h-3.5" /> H3
            </button>
          </div>

          {/* Formato de texto */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'texto en negrita')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Negrita (**texto**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'texto en cursiva')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Cursiva (*texto*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'texto tachado')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Tachado (~~texto~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Listas y citas */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '', 'Elemento de lista')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Lista con viñetas (- elemento)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n1. ', '', 'Elemento ordenado')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Lista numerada (1. elemento)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n> ', '\n', 'Texto destacado o cita')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Cita / Bloque (> cita)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cajas clínicas NeuroSAFE */}
          <div className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleInsertPearl}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold"
              title="Insertar caja de Perla Clínica"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Perla</span>
            </button>
            <button
              type="button"
              onClick={handleInsertKeyPoint}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold"
              title="Insertar caja de Punto Clave"
            >
              <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Punto clave</span>
            </button>
          </div>

          {/* Elementos estructurales */}
          <div className="flex items-center gap-0.5 px-2">
            <button
              type="button"
              onClick={handleInsertTable}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              title="Insertar tabla comparativa Markdown"
            >
              <Table className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://...)', 'Texto del enlace')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Insertar enlace ([texto](url))"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'código')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Código en línea (`código`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n---\n\n', '', '')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Separador horizontal (---)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Guía rápida colapsable */}
      {showCheatSheet && (
        <div className="p-3 sm:p-4 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Guía de formato Markdown para lecciones clínicas
            </h4>
            <button
              type="button"
              onClick={() => setShowCheatSheet(false)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/40">
              <span className="font-semibold text-blue-800 dark:text-blue-300 block mb-1">Encabezados</span>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">## Título Sección</p>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">### Subtítulo</p>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/40">
              <span className="font-semibold text-blue-800 dark:text-blue-300 block mb-1">Énfasis</span>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">**Texto en negrita**</p>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">*Texto en cursiva*</p>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/40">
              <span className="font-semibold text-blue-800 dark:text-blue-300 block mb-1">Cajas Clínicas</span>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">&gt; 💡 **Perla:** Diagnóstico...</p>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">&gt; 🎯 **Punto Clave:** Resumen...</p>
            </div>
          </div>
        </div>
      )}

      {/* Cuerpo principal del editor */}
      <div
        className={`flex-1 min-h-0 grid ${
          tab === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800' : 'grid-cols-1'
        }`}
        style={{ minHeight: isFullscreen ? 'calc(100vh - 160px)' : minHeight }}
      >
        {/* Panel de escritura */}
        {(tab === 'write' || tab === 'split') && (
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full flex-1 p-4 font-mono text-sm leading-relaxed bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-none outline-none resize-none focus:ring-0"
              style={{ minHeight: isFullscreen ? '100%' : minHeight }}
            />
          </div>
        )}

        {/* Panel de vista previa interactiva */}
        {(tab === 'preview' || tab === 'split') && (
          <div className="flex flex-col h-full bg-slate-50/60 dark:bg-slate-950/40 overflow-y-auto">
            <div className="sticky top-0 z-10 px-4 py-2 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs border-b border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Vista previa del alumno
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Renderizado idéntico al curso
              </span>
            </div>
            <div className="p-5 sm:p-6 max-w-none prose prose-slate dark:prose-invert">
              {value.trim() ? (
                <RichContent text={value} headingLevel={3} />
              ) : (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 italic text-sm">
                  <p>Comienza a escribir contenido para ver la vista previa en tiempo real.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Barra inferior de estado */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{stats.words}</strong> palabras
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{stats.chars}</strong> caracteres
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Tiempo de lectura: ~{stats.readTimeMinutes} min</span>
        </div>
      </div>
    </div>
  );
}

