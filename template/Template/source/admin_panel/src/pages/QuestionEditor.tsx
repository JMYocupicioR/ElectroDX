
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { StemEditor } from '../components/forms/StemEditor';
import { FindingsBuilder } from '../components/forms/FindingsBuilder';
import { OptionsBuilder } from '../components/forms/OptionsBuilder';
import { useNavigate, useParams, useSearchParams, useBlocker } from 'react-router-dom';
import { Save, Image as ImageIcon, Loader } from 'lucide-react';
import { AdminLayout } from '../layouts/AdminLayout';
import { useIslands } from '../hooks/useIslands';
import { useTopics } from '../hooks/useTopics';

// --- Zod Schema ---
const questionSchema = z.object({
    island_id: z.string().min(1, "Selecciona una isla"),
    topic_id: z.string().min(1, "Selecciona un tema"),
    difficulty: z.coerce.number().min(1).max(5),
    is_critical: z.boolean(),
    pearl: z.string().min(5, "La Perla del Consejo es obligatoria"),
    source_reference: z.string().min(3, "Fuente bibliográfica requerida"),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    content: z.object({
        stem: z.string().min(10, "El caso clínico es muy corto"),
        findings: z.array(z.object({
            type: z.string(),
            label: z.string(),
            value: z.string()
        })).optional(),
        image_url: z.string().optional()
    }),
    options: z.array(z.object({
        text: z.string().min(1, "Texto de opción requerido"),
        is_correct: z.boolean(),
        feedback_clinical: z.string().optional()
    })).refine((opts) => opts.filter(o => o.is_correct).length === 1, {
        message: "Debe haber exactamente UNA respuesta correcta",
    }).refine((opts) => opts.length >= 2, {
        message: "Debe haber al menos 2 opciones",
    })
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export const QuestionEditor = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlIslandId = searchParams.get('island_id');
    const urlTopicId = searchParams.get('topic_id');

    const [loading, setLoading] = useState(false);
    
    // Image Upload State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const methods = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema) as any,
        defaultValues: {
            difficulty: 1,
            is_critical: false,
            status: 'DRAFT',
            island_id: urlIslandId || '',
            topic_id: urlTopicId || '',
            content: { findings: [] },
            options: [
                { text: '', is_correct: false, feedback_clinical: '' },
                { text: '', is_correct: false, feedback_clinical: '' }
            ]
        }
    });

    const { register, control, handleSubmit, watch, formState: { errors, isDirty } } = methods;
    const selectedIslandId = watch('island_id');

    // Use hooks for islands and topics (topics auto-refetch when island changes)
    const { islands, refetch: refetchIslands } = useIslands({ select: '*' });
    const { topics, refetch: refetchTopics } = useTopics({ islandId: selectedIslandId || undefined });

    // ─── Data Loss Prevention ───────────────────────────────────
    // Block in-app navigation when form has unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    // Block browser tab close / refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const { id } = useParams<{ id: string }>(); // Get ID from URL
    const [isEditMode, setIsEditMode] = useState(false);

    // ... (rest of state items)

    // ... (useForm definition)

    // Check for Edit Mode
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            setLoading(true);
            supabase.from('questions').select('*').eq('id', id).single().then(({ data }) => {
                if (data) {
                    methods.reset({
                        island_id: '', // Will be set but needs content
                        topic_id: data.topic_id,
                        difficulty: data.difficulty,
                        is_critical: data.is_critical,
                        status: data.status,
                        pearl: data.pearl,
                        source_reference: data.source_reference,
                        content: data.content,
                        options: data.content.options // Adapting to structure
                    });
                    
                    // We need to fetch the island based on the topic to set it correctly
                    supabase.from('topics').select('island_id').eq('id', data.topic_id).single().then(({ data: topicData }) => {
                        if (topicData) {
                            methods.setValue('island_id', topicData.island_id);
                        }
                    });

                    // Set Image Preview if exists
                    if (data.content.image_url) {
                        setImagePreview(data.content.image_url);
                    }
                }
                setLoading(false);
            });
        }
    }, [id, methods]);


    const onSubmit = async (data: QuestionFormValues) => {
        setLoading(true);
        
        let imageUrl = data.content.image_url;

        // Handle Image Upload
        if (imageFile) {
            setUploadingImage(true);
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('question_images')
                .upload(filePath, imageFile);

            if (uploadError) {
                toast.error('Error subiendo imagen: ' + uploadError.message);
                setLoading(false);
                setUploadingImage(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('question_images')
                .getPublicUrl(filePath);

            imageUrl = publicUrl;
            setUploadingImage(false);
        }

        // Transform data for DB (Question Table)
        const dbPayload = {
            topic_id: data.topic_id,
            difficulty: data.difficulty,
            is_critical: data.is_critical,
            pearl: data.pearl,
            source_reference: data.source_reference,
            content: {
                ...data.content,
                image_url: imageUrl,
                options: data.options
            },
            status: data.status // Uses form value which we set on submit
        };

        let result;
        if (isEditMode && id) {
            result = await supabase.from('questions').update(dbPayload).eq('id', id);
        } else {
            result = await supabase.from('questions').insert(dbPayload);
        }

        const { error } = result;

        if (error) {
            toast.error('Error al guardar: ' + error.message);
        } else {
            toast.success(isEditMode ? 'Pregunta actualizada exitosamente' : 'Pregunta guardada exitosamente');
            navigate(-1); // Go back
        }
        setLoading(false);
    };

    // Inline Creation State
    const [isCreatingIsland, setIsCreatingIsland] = useState(false);
    const [newIslandName, setNewIslandName] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');

    const handleCreateIsland = async () => {
        if (!newIslandName.trim()) return;
        setLoading(true);
        
        // Get max order
        const maxOrder = islands.reduce((max, i) => Math.max(max, i.order || 0), 0);
        
        const { data, error } = await supabase
            .from('islands')
            .insert({ name: newIslandName, order: maxOrder + 1 })
            .select()
            .single();

        if (error) {
            toast.error('Error al crear isla: ' + error.message);
        } else if (data) {
            refetchIslands();
            methods.setValue('island_id', data.id);
            setNewIslandName('');
            setIsCreatingIsland(false);
        }
        setLoading(false);
    };

    const handleCreateTopic = async () => {
        if (!newTopicName.trim() || !selectedIslandId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('topics')
            .insert({ name: newTopicName, island_id: selectedIslandId })
            .select()
            .single();

        if (error) {
            toast.error('Error al crear tema: ' + error.message);
        } else if (data) {
            refetchTopics();
            methods.setValue('topic_id', data.id);
            setNewTopicName('');
            setIsCreatingTopic(false);
        }
        setLoading(false);
    };

    return (
        <AdminLayout title={isEditMode ? "Editar Pregunta" : "Agregar Nueva Pregunta"}>
            {/* ─── Unsaved Changes Dialog ──────────────────────────── */}
            {blocker.state === 'blocked' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Salir sin guardar?</h3>
                        <p className="text-sm text-gray-600 mb-5">
                            Tienes cambios sin guardar. Si sales ahora, perderás tu progreso.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => blocker.reset?.()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Seguir editando
                            </button>
                            <button
                                onClick={() => blocker.proceed?.()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Salir sin guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* Metadata Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Isla</label>
                                    {isCreatingIsland ? (
                                        <div className="flex gap-2 items-center mt-1">
                                            <input 
                                                type="text" 
                                                value={newIslandName}
                                                onChange={(e) => setNewIslandName(e.target.value)}
                                                placeholder="Nombre de nueva isla"
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-secondary focus:ring-secondary py-2 text-sm"
                                                autoFocus
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleCreateIsland}
                                                className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsCreatingIsland(false)}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <select {...register('island_id')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-secondary focus:ring-secondary py-2">
                                                <option value="">Selecciona una Isla</option>
                                                {islands.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                            </select>
                                            <button 
                                                type="button"
                                                onClick={() => setIsCreatingIsland(true)}
                                                className="mt-1 px-3 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-100"
                                                title="Crear nueva isla"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                    {errors.island_id && <p className="text-red-500 text-xs mt-1">{errors.island_id.message}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tema (Topic)</label>
                                    {isCreatingTopic ? (
                                        <div className="flex gap-2 items-center mt-1">
                                            <input 
                                                type="text" 
                                                value={newTopicName}
                                                onChange={(e) => setNewTopicName(e.target.value)}
                                                placeholder="Nombre del nuevo tema"
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-secondary focus:ring-secondary py-2 text-sm"
                                                autoFocus
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleCreateTopic}
                                                className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsCreatingTopic(false)}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <select 
                                                {...register('topic_id')} 
                                                disabled={!selectedIslandId}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-secondary focus:ring-secondary py-2 disabled:bg-gray-50 disabled:text-gray-400"
                                            >
                                                <option value="">{selectedIslandId ? 'Selecciona un Tema' : 'Primero selecciona una isla'}</option>
                                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    if (!selectedIslandId) toast.warning('Primero selecciona una isla');
                                                    else setIsCreatingTopic(true);
                                                }}
                                                disabled={!selectedIslandId}
                                                className="mt-1 px-3 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Crear nuevo tema"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                    {errors.topic_id && <p className="text-red-500 text-xs mt-1">{errors.topic_id.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dificultad (1-5)</label>
                                    <input type="number" {...register('difficulty')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-secondary focus:ring-secondary" />
                                </div>

                                <div className="flex items-center mt-6">
                                    <input type="checkbox" {...register('is_critical')} className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                    <label className="ml-2 block text-sm text-gray-900 font-bold">¿Es Pregunta Crítica?</label>
                                </div>
                            </div>

                            <StemEditor register={register} errors={errors} />

                            {/* Image Upload Section */}
                            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen del Caso (Opcional)</label>
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative">
                                            <div className="space-y-1 text-center">
                                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                                        <span>Subir un archivo</span>
                                                        <input 
                                                            id="file-upload" 
                                                            name="file-upload" 
                                                            type="file" 
                                                            className="sr-only" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const file = e.target.files[0];
                                                                    setImageFile(file);
                                                                    setImagePreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    <p className="pl-1">o arrastrar y soltar</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {imagePreview && (
                                        <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                    methods.setValue('content.image_url', undefined); // Clear from form data too if needed logic-wise, though mostly handled in submit
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <span className="sr-only">Remove</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <FindingsBuilder control={control} register={register} />
                            
                            <OptionsBuilder control={control} register={register} errors={errors} />

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Perla del Consejo 💡</label>
                                    <textarea {...register('pearl')} rows={2} className="mt-1 block w-full border-yellow-200 rounded-md shadow-sm bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500" placeholder="Concepto clave..." />
                                    {errors.pearl && <p className="text-red-500 text-xs">{errors.pearl.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Referencia Bibliográfica</label>
                                    <input {...register('source_reference')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej. Braddom 6ta Ed, p. 450" />
                                    {errors.source_reference && <p className="text-red-500 text-xs">{errors.source_reference.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        methods.setValue('status', 'DRAFT');
                                        handleSubmit(onSubmit)();
                                    }}
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                    Guardar Como Borrador
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        methods.setValue('status', 'PUBLISHED');
                                        handleSubmit(onSubmit)();
                                    }}
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-primary hover:bg-primary-light focus:outline-none disabled:opacity-50 transition-colors"
                                >
                                    {loading || uploadingImage ? (
                                        <>
                                            <Loader className="mr-2 h-5 w-5 animate-spin" />
                                            {uploadingImage ? 'Subiendo imagen...' : 'Guardando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Publicar Pregunta
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>
        </AdminLayout>
    );
};
