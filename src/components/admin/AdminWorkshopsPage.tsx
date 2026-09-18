import { useEffect, useState } from 'react';
import { Calendar, Video, Plus, Users, XCircle, Bell } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getWorkshops, createWorkshop, updateWorkshop } from '../../services/courseService';
import { sendAcademicPush } from '../../services/studentToolsService';
import { allModules } from '../../content/modules';
import type { LiveWorkshop, WorkshopStatus } from '../../types/database';
import type { Module } from '../../types/content';

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [pushTitle, setPushTitle] = useState('Aviso académico ElectoDX');
  const [pushBody, setPushBody] = useState('');
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const ws = await getWorkshops();
      setWorkshops(ws);
      setModules(allModules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt || !moduleId) return;
    
    try {
      await createWorkshop({
        title,
        description,
        module_id: moduleId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        stream_url: streamUrl,
        status: 'draft',
        max_capacity: 100
      } as any);
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setScheduledAt('');
      setStreamUrl('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al crear');
    }
  };

  const setStatus = async (id: string, status: WorkshopStatus) => {
    try {
      await updateWorkshop(id, { status });
      load();
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <AdminLayout title="Gestión de Talleres En Vivo">
      <div className="mb-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4" /> Aviso push a inscritos
        </h3>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setPushStatus(null);
            try {
              const result = await sendAcademicPush({ title: pushTitle, body: pushBody, url: '/talleres' });
              setPushStatus(`Enviados ${result.sent} de ${result.queued}. Fallidos: ${result.failed}.`);
              setPushBody('');
            } catch (err) {
              setPushStatus(err instanceof Error ? err.message : 'No se pudo enviar');
            }
          }}
        >
          <input
            className="w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-lg border px-3 py-2 dark:bg-slate-800"
            rows={3}
            placeholder="Mensaje del aviso (taller, recordatorio, cambio de horario)"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            required
          />
          <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
            Enviar aviso
          </button>
          {pushStatus && <p className="text-xs text-slate-500">{pushStatus}</p>}
        </form>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">
          Programa y administra los talleres híbridos de discusión de casos.
        </p>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-orange-700 transition"
        >
          {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Taller</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Programar Nuevo Taller</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-transparent dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Módulo Asociado</label>
              <select 
                required 
                value={moduleId} 
                onChange={e => setModuleId(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
              >
                <option value="">Selecciona un módulo...</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha y Hora</label>
              <input 
                required 
                type="datetime-local" 
                value={scheduledAt} 
                onChange={e => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-transparent dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enlace (Zoom/Meet)</label>
              <input 
                type="url" 
                value={streamUrl} 
                onChange={e => setStreamUrl(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-transparent dark:text-white" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción corta</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 bg-transparent dark:text-white" 
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold">
              Guardar Borrador
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando talleres...</p>
      ) : workshops.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay talleres programados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map(w => {
            const mod = modules.find(m => m.id === w.module_id);
            const date = new Date(w.scheduled_at);
            return (
              <div key={w.id} className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{w.title}</h4>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${
                    w.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                    w.status === 'scheduled' ? 'bg-orange-100 text-orange-600' :
                    w.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {w.status}
                  </span>
                </div>
                
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4 line-clamp-1 flex-shrink-0">
                  {mod?.title || 'Módulo desconocido'}
                </p>

                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{date.toLocaleDateString('es-MX')} {date.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {w.stream_url && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 truncate">
                      <Video className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <a href={w.stream_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">Enlace de acceso</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>0 / {w.max_capacity} inscritos</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  {w.status === 'draft' && (
                    <button onClick={() => setStatus(w.id, 'scheduled')} className="flex-1 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200">
                      Programar
                    </button>
                  )}
                  {w.status === 'scheduled' && (
                    <button onClick={() => setStatus(w.id, 'live')} className="flex-1 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                      En Vivo
                    </button>
                  )}
                  {w.status === 'live' && (
                    <button onClick={() => setStatus(w.id, 'completed')} className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200">
                      Finalizar
                    </button>
                  )}
                  {['draft', 'scheduled'].includes(w.status) && (
                    <button onClick={() => setStatus(w.id, 'cancelled')} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
