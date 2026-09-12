import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../layouts/AdminLayout';
import { Upload, FileJson, FileType, Code } from 'lucide-react';


import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type PendingIsland = { name: string; selected: boolean };
type PendingTopic = { island_name: string; topic_name: string; selected: boolean };

import { parseQuestionsCSV } from '../utils/csvParser';
import { normalizeQuestions } from '../utils/questionNormalizer';



// Helper to normalize text (remove accents, lowercase, trim)
const normalizeText = (text: string) => {
    return (text || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const BulkUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [pendingIslands, setPendingIslands] = useState<PendingIsland[]>([]);
    const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
    const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
    const [jsonInput, setJsonInput] = useState('');

    // Context from URL
    const [searchParams] = useSearchParams();
    const contextIslandId = searchParams.get('island_id');
    const contextTopicId = searchParams.get('topic_id');
    const [contextData, setContextData] = useState<{islandName: string, topicName: string} | null>(null);

    React.useEffect(() => {
        if (contextIslandId && contextTopicId) {
            Promise.all([
                supabase.from('islands').select('name').eq('id', contextIslandId).single(),
                supabase.from('topics').select('name').eq('id', contextTopicId).single()
            ]).then(([islandRes, topicRes]) => {
                if (islandRes.data && topicRes.data) {
                    setContextData({
                        islandName: islandRes.data.name,
                        topicName: topicRes.data.name
                    });
                }
            });
        }
    }, [contextIslandId, contextTopicId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setLogs([]);
        setError(null);
        
        try {
            let questions: any[] = [];
            
            if (file.name.endsWith('.json')) {
                const text = await file.text();
                questions = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                try {
                    questions = await parseQuestionsCSV(file);
                } catch (parseError: any) {
                    // Start of Selection
                    const errorMessage = Array.isArray(parseError) 
                        ? parseError.map(e => `Fila ${e.row}: ${e.message}`).join('\n')
                        : parseError.message || "Error desconocido al parsear CSV";
                    setError(errorMessage);
                    setUploading(false);
                    return;
                }
            } else {
                setError("Formato no soportado. Usa JSON o CSV.");
                setUploading(false);
                return;
            }

            // Analyze questions for missing islands/topics
            await analyzeFile(questions);
        } catch (err: any) {
            setError("Error leyendo archivo: " + err.message);
            setUploading(false);
        }
    };

    const handleJsonPaste = async () => {
        if (!jsonInput.trim()) return;

        setUploading(true);
        setLogs([]);
        setError(null);

        try {
            const questions = JSON.parse(jsonInput);
            if (!Array.isArray(questions)) throw new Error("El JSON debe ser un array de objetos.");
            
            await analyzeFile(questions);
        } catch (err: any) {
            setError("Error al procesar JSON: " + err.message);
            setUploading(false);
        }
    };

    const analyzeFile = async (questions: any[]) => {
        addLog(`Analizando ${questions.length} preguntas...`);
        
        // --- NORMALIZE QUESTIONS (Auto-detect and fix format issues) ---
        addLog('🔄 Normalizando y validando formato...');
        const normalizationResult = normalizeQuestions(questions);
        
        // Log summary
        if (normalizationResult.totalErrors > 0) {
            addLog(`❌ ${normalizationResult.totalErrors} errores críticos encontrados`);
        }
        if (normalizationResult.totalCorrections > 0) {
            addLog(`🔧 ${normalizationResult.totalCorrections} preguntas corregidas automáticamente`);
        }
        if (normalizationResult.totalWarnings > 0) {
            addLog(`⚠️ ${normalizationResult.totalWarnings} advertencias generadas`);
        }
        
        // Log details for each problematic question
        normalizationResult.details.forEach(detail => {
            if (detail.errors.length > 0) {
                addLog(`\n❌ Pregunta ${detail.index}:`);
                detail.errors.forEach(err => addLog(`   - ${err}`));
            } else if (detail.warnings.length > 0) {
                addLog(`\n🔧 Pregunta ${detail.index} (correcciones aplicadas):`);
                detail.warnings.forEach(warn => addLog(`   - ${warn}`));
            }
        });
        
        // If there are any errors, stop processing
        if (normalizationResult.totalErrors > 0) {
            setError(`${normalizationResult.totalErrors} preguntas tienen errores críticos que no pueden ser corregidos automáticamente. Revisa el log para más detalles.`);
            setUploading(false);
            return;
        }
        
        // Use normalized questions from here on
        const normalizedQuestions = normalizationResult.normalized;
        addLog(`✅ Normalización completada. Procesando ${normalizedQuestions.length} preguntas...\n`);
        
        const { data: islands } = await supabase.from('islands').select('id, name');
        const { data: topics } = await supabase.from('topics').select('id, name, island_id');

        if (!islands || !topics) {
            setError("No se pudieron cargar Islas/Temas de la BD.");
            setUploading(false);
            return;
        }

        // --- DUPLICATE DETECTION START ---
        
        // 1. Internal Batch Deduplication
        const seenStems = new Set<string>();
        const uniqueQuestions: any[] = [];
        let internalDuplicatesCount = 0;

        normalizedQuestions.forEach(q => {
            const stem = q.content.stem.trim();
            // Create a simple hash/signature (stem + first option text) to be more robust
            const signature = stem + (q.content.options[0]?.text || ''); 
            
            if (seenStems.has(signature)) {
                internalDuplicatesCount++;
            } else {
                seenStems.add(signature);
                uniqueQuestions.push(q);
            }
        });

        if (internalDuplicatesCount > 0) {
            addLog(`⚠️ Detectados ${internalDuplicatesCount} duplicados internos en el archivo (ignorados automaticamente).`);
        }

        // 2. Database Duplication Check
        addLog('🔍 Verificando duplicados en la base de datos...');
        const stemsToCheck = uniqueQuestions.map(q => q.content.stem);
        
        // We'll verify in chunks to avoid URL length limits if many questions
        const dbDuplicatesCount = await checkDatabaseDuplicates(stemsToCheck);
        
        // Filter out DB duplicates
        // Note: checkDatabaseDuplicates returns a Set of existing stems
        const finalQuestions = uniqueQuestions.filter(q => !dbDuplicatesCount.has(q.content.stem));
        const skippedCount = uniqueQuestions.length - finalQuestions.length;

        if (skippedCount > 0) {
            addLog(`⚠️ ${skippedCount} preguntas ya existen en la base de datos y serán ignoradas.`);
        }

        if (finalQuestions.length === 0) {
            addLog('🛑 Todas las preguntas fueron identificadas como duplicadas. No hay nada nuevo para subir.');
            setUploading(false);
            return;
        }

        addLog(`✅ Todo listo. ${finalQuestions.length} preguntas nuevas para procesar.`);

        // Extract unique island and topic names from FINAL questions
        const uniqueIslands = new Set<string>();
        const uniqueTopics = new Map<string, Set<string>>(); // island_name -> Set of topic_names

        finalQuestions.forEach(q => {
            // Apply context defaults if missing in file
            if (!q.island_name && contextData?.islandName) q.island_name = contextData.islandName;
            if (!q.topic_name && contextData?.topicName) q.topic_name = contextData.topicName;

            const islandName = q.island_name?.trim();
            const topicName = q.topic_name?.trim();
            
            if (islandName) {
                uniqueIslands.add(islandName);
                if (topicName) {
                    if (!uniqueTopics.has(islandName)) {
                        uniqueTopics.set(islandName, new Set());
                    }
                    uniqueTopics.get(islandName)!.add(topicName);
                }
            }
        });

        // Find missing islands
        const missingIslands: PendingIsland[] = [];
        uniqueIslands.forEach(name => {
            const exists = islands.find(i => normalizeText(i.name) === normalizeText(name));
            if (!exists) {
                missingIslands.push({ name, selected: true });
            }
        });

        // Find missing topics
        const missingTopics: PendingTopic[] = [];
        uniqueTopics.forEach((topicSet, islandName) => {
            topicSet.forEach(topicName => {
                const island = islands.find(i => normalizeText(i.name) === normalizeText(islandName));
                if (island) {
                    const exists = topics.find(t => 
                        normalizeText(t.name) === normalizeText(topicName) && 
                        t.island_id === island.id
                    );
                    if (!exists) {
                        missingTopics.push({ island_name: islandName, topic_name: topicName, selected: true });
                    }
                }
            });
        });

        if (missingIslands.length > 0 || missingTopics.length > 0) {
            addLog(`⚠️ Encontradas ${missingIslands.length} islas y ${missingTopics.length} temas faltantes.`);
            setPendingIslands(missingIslands);
            setPendingTopics(missingTopics);
            setPendingQuestions(finalQuestions); // Use deduplicated questions
            setShowCreationModal(true);
            setUploading(false);
        } else {
            addLog('✅ Todas las islas y temas ya existen.');
            await processQuestions(finalQuestions); // Use deduplicated questions
        }
    };

    // Helper to check DB duplicates
    const checkDatabaseDuplicates = async (stems: string[]): Promise<Set<string>> => {
        if (stems.length === 0) return new Set();
        
        const existingStems = new Set<string>();
        // Check ONLY for the last 5000 questions to catch recent content
        // This is a comprehensive check without fetching the entire DB history if it grows huge
        const { data } = await supabase
            .from('questions')
            .select('content')
            .order('created_at', { ascending: false })
            .limit(5000);
            
        if (data) {
            data.forEach((row: any) => {
               if (row.content?.stem) existingStems.add(row.content.stem.trim()); 
            });
        }
        
        // Return only stems that are in our input list
        const duplicates = new Set<string>();
        stems.forEach(stem => {
            if (existingStems.has(stem.trim())) {
                duplicates.add(stem.trim());
            }
        });
        
        return duplicates;
    };

    const handleCreateEntities = async () => {
        setShowCreationModal(false);
        setUploading(true);
        
        const selectedIslands = pendingIslands.filter(i => i.selected);
        const selectedTopics = pendingTopics.filter(t => t.selected);
        
        addLog(`Creando ${selectedIslands.length} islas y ${selectedTopics.length} temas...`);
        
        try {
            // Create islands
            if (selectedIslands.length > 0) {
                const { data: existingIslands } = await supabase
                    .from('islands')
                    .select('order')
                    .order('order', { ascending: false })
                    .limit(1);
                
                const nextOrder = (existingIslands?.[0]?.order || 0) + 1;
                
                const islandsToCreate = selectedIslands.map((island, index) => ({
                    name: island.name,
                    order: nextOrder + index,
                    description: `Nueva área: ${island.name}`
                }));
                
                const { error: islandError } = await supabase
                    .from('islands')
                    .insert(islandsToCreate);
                    
                if (islandError) throw islandError;
                addLog(`✅ ${selectedIslands.length} islas creadas.`);
            }
            
            // Create topics (need to fetch island IDs first)
            if (selectedTopics.length > 0) {
                const { data: islands } = await supabase.from('islands').select('id, name');
                
                const topicsToCreate = selectedTopics.map(topic => {
                    const island = islands?.find(i => normalizeText(i.name) === normalizeText(topic.island_name));
                    if (!island) {
                        addLog(`⚠️ No se pudo crear tema "${topic.topic_name}" - isla "${topic.island_name}" no encontrada.`);
                        return null;
                    }
                    return {
                        island_id: island.id,
                        name: topic.topic_name,
                        description: `Nuevo tema: ${topic.topic_name}`
                    };
                }).filter(t => t !== null);
                
                if (topicsToCreate.length > 0) {
                    const { error: topicError } = await supabase
                        .from('topics')
                        .insert(topicsToCreate);
                        
                    if (topicError) throw topicError;
                    addLog(`✅ ${topicsToCreate.length} temas creados.`);
                }
            }
            
            // Now process the questions
            addLog('Procediendo con la carga de preguntas...');
            await processQuestions(pendingQuestions);
            
        } catch (err: any) {
            setError('Error creando entidades: ' + err.message);
            setUploading(false);
        }
    };

    const handleCancelCreation = () => {
        setShowCreationModal(false);
        setPendingIslands([]);
        setPendingTopics([]);
        setPendingQuestions([]);
        setUploading(false);
        addLog('❌ Carga cancelada por el usuario.');
    };

    const toggleIslandSelection = (index: number) => {
        setPendingIslands(prev => prev.map((island, i) => 
            i === index ? { ...island, selected: !island.selected } : island
        ));
    };

    const toggleTopicSelection = (index: number) => {
        setPendingTopics(prev => prev.map((topic, i) => 
            i === index ? { ...topic, selected: !topic.selected } : topic
        ));
    };

    const processQuestions = async (questions: any[]) => {
        addLog(`Iniciando procesamiento de ${questions.length} preguntas...`);
        const { data: islands } = await supabase.from('islands').select('id, name');
        const { data: topics } = await supabase.from('topics').select('id, name, island_id');

        if (!islands || !topics) {
            setError("No se pudieron cargar Islas/Temas de la BD.");
            setUploading(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const [index, q] of questions.entries()) {
            try {
                const island = islands.find(i => normalizeText(i.name) === normalizeText(q.island_name));
                if (!island) throw new Error(`Isla '${q.island_name}' no encontrada.`);

                const topic = topics.find(t => normalizeText(t.name) === normalizeText(q.topic_name) && t.island_id === island.id);
                if (!topic) throw new Error(`Tema '${q.topic_name}' no encontrado.`);

                const dbPayload = {
                    topic_id: topic.id,
                    difficulty: q.difficulty,
                    is_critical: q.is_critical,
                    pearl: q.pearl,
                    source_reference: q.source_reference,
                    content: q.content,
                    status: 'PUBLISHED'
                };

                const { error } = await supabase.from('questions').insert(dbPayload);
                if (error) throw error;

                addLog(`✅ Pregunta ${index + 1}: Guardada.`);
                successCount++;
            } catch (err: any) {
                addLog(`❌ Pregunta ${index + 1}: ${err.message}`);
                failCount++;
            }
        }

        setUploading(false);
        addLog(`--- FIN ---`);
        addLog(`Éxito: ${successCount} | Fallos: ${failCount}`);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    return (
        <AdminLayout title="Carga Masiva de Preguntas">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    {contextData && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center text-blue-800 mb-6">
                            <ArrowLeft className="mr-3 cursor-pointer hover:scale-110 transition-transform" onClick={() => window.history.back()} />
                            <div>
                                <p className="font-bold">Modo Contextual Activo</p>
                                <p className="text-sm">
                                    Las preguntas sin isla/tema especificados se asignarán a: 
                                    <span className="font-semibold text-blue-900 mx-1">{contextData.islandName}</span> 
                                    / 
                                    <span className="font-semibold text-blue-900 mx-1">{contextData.topicName}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Templates Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-surface flex items-center justify-between hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                                <FileJson className="text-yellow-600" />
                                <div>
                                    <h3 className="font-bold">Plantilla JSON</h3>
                                    <p className="text-xs text-gray-500">Recomendado</p>
                                </div>
                            </div>
                            <a href="/templates/questions_template.json" download className="text-secondary-dark text-sm hover:underline font-medium">Descargar</a>
                        </div>
                        <div className="p-4 border rounded-lg bg-surface flex items-center justify-between hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                                <FileType className="text-green-600" />
                                <div>
                                    <h3 className="font-bold">Plantilla CSV</h3>
                                    <p className="text-xs text-gray-500">Simple (Excel)</p>
                                </div>
                            </div>
                            <a href="/templates/questions_template.csv" download className="text-secondary-dark text-sm hover:underline font-medium">Descargar</a>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-surface hover:border-secondary transition-colors group">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-secondary" />
                        <label htmlFor="file-upload" className="mt-2 cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                Sube o arrastra tu archivo aquí
                            </span>
                            <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                accept=".json,.csv"
                                className="sr-only" 
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">JSON o CSV hasta 10MB</p>
                    </div>

                    <div className="flex items-center justify-center text-gray-400 font-medium text-sm">
                        <span>- O -</span>
                    </div>

                    {/* Manual JSON Input Section */}
                    <div className="border rounded-lg p-6 hover:bg-surface transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <Code className="text-secondary" />
                            <h3 className="font-bold text-gray-700">Pegar Código JSON</h3>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[ { "island_name": "...", "topic_name": "...", ... } ]'
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-secondary focus:border-secondary"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleJsonPaste}
                                disabled={uploading || !jsonInput.trim()}
                                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Procesar JSON
                            </button>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    {(uploading || logs.length > 0 || error) && (
                        <div className="bg-primary-dark text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto shadow-inner">
                            {error && <div className="text-red-500 font-bold mb-2">{error}</div>}
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                            {uploading && <div className="animate-pulse mt-2">Procesando...</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* Creation Confirmation Modal */}
            {showCreationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-secondary to-secondary-dark p-6">
                            <h2 className="text-2xl font-bold text-white">Crear Nuevas Islas y Temas</h2>
                            <p className="text-white/80 text-sm mt-1">Selecciona qué elementos deseas crear</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {pendingIslands.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">{pendingIslands.length}</span>
                                        Islas Nuevas
                                    </h3>
                                    <div className="space-y-2">
                                        {pendingIslands.map((island, index) => (
                                            <label key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-surface cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={island.selected}
                                                    onChange={() => toggleIslandSelection(index)}
                                                    className="w-5 h-5 text-secondary focus:ring-secondary"
                                                />
                                                <span className="font-medium">{island.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {pendingTopics.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{pendingTopics.length}</span>
                                        Temas Nuevos
                                    </h3>
                                    <div className="space-y-2">
                                        {pendingTopics.map((topic, index) => (
                                            <label key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-surface cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={topic.selected}
                                                    onChange={() => toggleTopicSelection(index)}
                                                    className="w-5 h-5 text-secondary focus:ring-secondary"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-medium">{topic.topic_name}</span>
                                                    <span className="text-gray-500 text-sm ml-2">→ {topic.island_name}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t p-6 bg-surface flex gap-3 justify-end">
                            <button
                                onClick={handleCancelCreation}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateEntities}
                                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors font-medium"
                            >
                                Crear Seleccionados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
