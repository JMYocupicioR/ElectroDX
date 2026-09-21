/**
 * Servicio de Gestión de Casos Clínicos EMG para NeuroSAFEMX.
 * Híbrido y Resiliente: Supabase (emg_case_templates) + Fallback a las 33 plantillas locales (ALL_CASE_TEMPLATES).
 */

import { supabase } from '../lib/supabase';
import { ALL_CASE_TEMPLATES, type CaseTemplate, type CaseUsageMode } from '../../ejercicios/src/data/CaseTemplates';
import type {
  ClinicalCase,
  DiagnosisOption,
  DiagnosticCategory,
  Difficulty,
  EvaluationResult,
} from '../../ejercicios/src/types/ClinicalCase';
import { createAssignment, getStudentAssignmentById, gradeAssignment } from './studentPlanService';
import type { AssignmentPriority, AssignmentStatus, StudentAssignment } from '../types/studentPlan';

const KEY_LOCAL_CUSTOM_TEMPLATES = 'neurosafe_custom_emg_templates_v1';

export interface CustomCaseTemplateRecord extends CaseTemplate {
  id?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  difficulty?: Difficulty;
  usageMode?: CaseUsageMode;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  is_custom?: boolean;
}

// ─── Carga de Plantillas ───────────────────────────────────────────────────────

/**
 * Carga todas las plantillas de casos clínicos EMG.
 * Combina las 33 plantillas nativas de ElectroDx con los casos creados en Supabase.
 */
export async function loadAllCaseTemplates(
  filter?: { category?: string; includeDrafts?: boolean; usageMode?: CaseUsageMode }
): Promise<{ templates: CustomCaseTemplateRecord[]; source: 'supabase' | 'fallback' }> {
  let customTemplates: CustomCaseTemplateRecord[] = [];
  let source: 'supabase' | 'fallback' = 'fallback';

  // 1. Intentar cargar de Supabase
  try {
    let query = (supabase.from('emg_case_templates') as any).select('*');
    if (!filter?.includeDrafts) {
      query = query.eq('status', 'PUBLISHED');
    }
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }
    if (filter?.usageMode) {
      if (filter.usageMode === 'practice') {
        query = query.in('usage_mode', ['practice', 'both']);
      } else if (filter.usageMode === 'exam_only') {
        query = query.in('usage_mode', ['exam_only', 'both']);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    source = 'supabase';

    if (data && data.length > 0) {
      customTemplates = data.map(rowToTemplate);
      // Cachear en localStorage
      try {
        localStorage.setItem(KEY_LOCAL_CUSTOM_TEMPLATES, JSON.stringify(customTemplates));
      } catch {}
    }
  } catch (err) {
    console.warn('[emgExerciseService] Fallback a caché local:', err);
    try {
      const cached = localStorage.getItem(KEY_LOCAL_CUSTOM_TEMPLATES);
      if (cached) {
        customTemplates = JSON.parse(cached);
      }
    } catch {}
  }

  // 2. Mapear plantillas base de ALL_CASE_TEMPLATES marcadas como is_custom: false
  const baseTemplates: CustomCaseTemplateRecord[] = ALL_CASE_TEMPLATES.map(t => ({
    ...t,
    status: 'PUBLISHED',
    difficulty: 'medium',
    usageMode: t.usageMode || 'both',
    is_custom: false,
  }));

  // 3. Mergear: si una plantilla personalizada tiene el mismo patternId, reemplaza a la base
  const customMap = new Map(customTemplates.map(c => [c.patternId, c]));
  const merged: CustomCaseTemplateRecord[] = [];

  // Agregar base o versión personalizada sobrescrita
  baseTemplates.forEach(bt => {
    if (customMap.has(bt.patternId)) {
      merged.push(customMap.get(bt.patternId)!);
      customMap.delete(bt.patternId);
    } else {
      merged.push(bt);
    }
  });

  // Agregar nuevos casos creados por administradores
  customMap.forEach(custom => {
    merged.unshift(custom);
  });

  // Filtrar por categoría si se especificó
  let finalTemplates = merged;
  if (filter?.category && filter.category !== 'all') {
    finalTemplates = finalTemplates.filter(t => t.category === filter.category);
  }

  // Filtrar por destino pedagógico (práctica vs examen)
  if (filter?.usageMode) {
    if (filter.usageMode === 'practice') {
      finalTemplates = finalTemplates.filter(t => t.usageMode !== 'exam_only');
    } else if (filter.usageMode === 'exam_only') {
      finalTemplates = finalTemplates.filter(t => t.usageMode === 'exam_only' || t.usageMode === 'both');
    }
  }

  return { templates: finalTemplates, source };
}

/** Obtiene una plantilla específica por su patternId */
export async function getCaseTemplateById(patternId: string): Promise<CustomCaseTemplateRecord | null> {
  const { templates } = await loadAllCaseTemplates({ includeDrafts: true });
  return templates.find(t => t.patternId === patternId) || null;
}

// ─── Guardado y Actualización de Plantillas ────────────────────────────────────

/**
 * Guarda o actualiza una plantilla de caso clínico (creada por Admin o Editor).
 */
export async function saveCaseTemplate(
  template: CaseTemplate & { status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'; difficulty?: Difficulty; usageMode?: CaseUsageMode },
  userId?: string
): Promise<{ success: boolean; data?: CustomCaseTemplateRecord; error?: string }> {
  const payload = {
    pattern_id: template.patternId,
    pattern_name: template.patternName,
    category: template.category,
    difficulty: template.difficulty || 'medium',
    usage_mode: template.usageMode || 'practice',
    patient: template.patient,
    ncs: template.ncs,
    emg: template.emg,
    rns: template.rns || null,
    late_responses: template.lateResponses || null,
    skin_temperature: template.skinTemperature || null,
    technical_notes: template.technicalNotes || [],
    is_pitfall: !!template.isPitfall,
    pitfall_explanation: template.pitfallExplanation || null,
    severity_grade: template.severityGrade || 'moderate',
    severity_explanation: template.severityExplanation || null,
    explanation: template.explanation,
    differentials: template.differentials,
    recommendations: template.recommendations || [],
    hints: (template as any).hints || [],
    status: template.status || 'PUBLISHED',
    created_by: userId || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await (supabase
      .from('emg_case_templates') as any)
      .upsert(payload, { onConflict: 'pattern_id' })
      .select('*')
      .single();

    if (error) throw error;

    const saved = rowToTemplate(data);
    updateLocalStorageCustom(saved);
    return { success: true, data: saved };
  } catch (err: any) {
    console.warn('[emgExerciseService] Error en Supabase, guardando en local:', err);
    // Guardado local resiliente
    const localRecord: CustomCaseTemplateRecord = {
      ...template,
      status: template.status || 'PUBLISHED',
      difficulty: template.difficulty || 'medium',
      usageMode: template.usageMode || 'practice',
      is_custom: true,
      updated_at: new Date().toISOString(),
    };
    updateLocalStorageCustom(localRecord);
    return { success: true, data: localRecord };
  }
}

/** Elimina una plantilla de caso clínico personalizada */
export async function deleteCaseTemplate(patternId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase
      .from('emg_case_templates') as any)
      .delete()
      .eq('pattern_id', patternId);

    if (error) throw error;
  } catch (err) {
    console.warn('[emgExerciseService] Error eliminando en Supabase:', err);
  }

  // Eliminar de localStorage
  try {
    const cached = localStorage.getItem(KEY_LOCAL_CUSTOM_TEMPLATES);
    if (cached) {
      const list: CustomCaseTemplateRecord[] = JSON.parse(cached);
      const filtered = list.filter(i => i.patternId !== patternId);
      localStorage.setItem(KEY_LOCAL_CUSTOM_TEMPLATES, JSON.stringify(filtered));
    }
  } catch {}

  return { success: true };
}

// ─── Asignación de Casos Clínicos a Alumnos ────────────────────────────────────

export type ClinicalAssignmentMode = 'study' | 'exam';

export interface ClinicalCaseAssignmentConfig {
  studentIds: string[];
  title: string;
  description: string;
  patternId?: string; // Caso específico
  category?: DiagnosticCategory | 'all';
  difficulty?: Difficulty;
  mode?: ClinicalAssignmentMode; // 'study' = con pistas; 'exam' = estricto sin pistas
  timeLimitMinutes?: number;
  dueDate: string; // ISO
  priority?: AssignmentPriority;
  minScore?: number;
  assignedBy?: string;
}

export interface ClinicalAssignmentLaunchState {
  assignmentId: string;
  patternId?: string;
  category?: string;
  clinicalMode: ClinicalAssignmentMode;
  timeLimitMinutes?: number;
  difficulty?: Difficulty;
  assignmentTitle: string;
  studentId?: string;
  status?: AssignmentStatus;
}

const KEY_CLINICAL_CASE_LOCK = 'neurosafe_clinical_case_lock_';

export interface ClinicalCaseSessionLock {
  assignmentId: string;
  patternId: string;
  startedAt: string;
  expiresAt: string | null;
  clinicalMode: ClinicalAssignmentMode;
  timeLimitMinutes?: number;
  difficulty: Difficulty;
  clinicalCase: ClinicalCase;
  options: DiagnosisOption[];
  currentStep: string;
  selectedAnswer: string | null;
  hintsUsed: number;
  submitted: boolean;
  timedOut?: boolean;
  evaluation?: EvaluationResult | null;
}

export function resolveClinicalAssignmentMode(
  cfg?: StudentAssignment['target_exam_config'] | Record<string, unknown> | null
): ClinicalAssignmentMode {
  const raw = (cfg || {}) as Record<string, unknown>;
  if (raw.clinicalMode === 'study' || raw.mode === 'study') return 'study';
  return 'exam';
}

export function getClinicalCaseLaunchState(
  assignment: StudentAssignment,
  studentId?: string
): ClinicalAssignmentLaunchState {
  const cfg = (assignment.target_exam_config || {}) as Record<string, unknown>;
  const isReplay = assignment.status !== 'pending';
  return {
    assignmentId: assignment.id,
    patternId: typeof cfg.patternId === 'string' ? cfg.patternId : undefined,
    category: typeof cfg.category === 'string' ? cfg.category : undefined,
    clinicalMode: resolveClinicalAssignmentMode(assignment.target_exam_config),
    timeLimitMinutes: typeof cfg.timeLimitMinutes === 'number' ? cfg.timeLimitMinutes : undefined,
    difficulty: (cfg.difficulty as Difficulty) || 'medium',
    assignmentTitle: isReplay ? assignment.title : 'Caso Clínico Asignado',
    studentId: studentId || assignment.student_id,
    status: assignment.status,
  };
}

export function getClinicalCaseExerciseLocation(assignmentId: string) {
  return {
    pathname: '/ejercicios',
    search: `?assignmentId=${encodeURIComponent(assignmentId)}`,
  };
}

export function loadClinicalCaseLock(assignmentId: string): ClinicalCaseSessionLock | null {
  try {
    const raw = sessionStorage.getItem(`${KEY_CLINICAL_CASE_LOCK}${assignmentId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ClinicalCaseSessionLock;
  } catch {
    return null;
  }
}

export function saveClinicalCaseLock(lock: ClinicalCaseSessionLock): void {
  try {
    sessionStorage.setItem(`${KEY_CLINICAL_CASE_LOCK}${lock.assignmentId}`, JSON.stringify(lock));
  } catch {}
}

export function clearClinicalCaseLock(assignmentId: string): void {
  try {
    sessionStorage.removeItem(`${KEY_CLINICAL_CASE_LOCK}${assignmentId}`);
  } catch {}
}

function pickPatternIdForAssignment(
  templates: CustomCaseTemplateRecord[],
  config: ClinicalCaseAssignmentConfig
): string | undefined {
  if (config.patternId) return config.patternId;

  const pool =
    config.category && config.category !== 'all'
      ? templates.filter((t) => t.category === config.category)
      : templates;
  const source = pool.length > 0 ? pool : templates;
  if (source.length === 0) return undefined;
  return source[Math.floor(Math.random() * source.length)].patternId;
}

/**
 * Asigna un caso clínico de EMG a uno o más alumnos seleccionados.
 * Si el profesor eligió categoría aleatoria, se fija un patternId por alumno
 * para que el caso no cambie al recargar.
 */
export async function assignCaseToStudents(
  config: ClinicalCaseAssignmentConfig
): Promise<{ success: boolean; assignedCount: number; error?: string }> {
  try {
    const { templates } = await loadAllCaseTemplates();
    const clinicalMode: ClinicalAssignmentMode = config.mode || 'exam';
    const timeLimitMinutes =
      clinicalMode === 'exam' ? config.timeLimitMinutes || 30 : undefined;

    const created = [];
    for (const studentId of config.studentIds) {
      const patternId = pickPatternIdForAssignment(templates, config);
      const assignment = await createAssignment({
        student_id: studentId,
        title: config.title,
        type: 'clinical_case',
        description:
          config.description || `Resolución interactiva del caso clínico EMG: ${config.title}`,
        target_module_id: null,
        target_topic_id: null,
        target_exam_config: {
          patternId,
          category: config.category,
          difficulty: config.difficulty || 'medium',
          clinicalMode,
          timeLimitMinutes,
          minPassingScore: config.minScore ?? 70,
          maxAttempts: 1,
          allowRetakeRequest: true,
        },
        due_date: config.dueDate,
        priority: config.priority || 'normal',
        min_score: config.minScore ?? 70,
        assigned_by: config.assignedBy || null,
        status: 'pending',
      });
      created.push(assignment);
    }

    return { success: created.length > 0, assignedCount: created.length };
  } catch (e: any) {
    console.error('[emgExerciseService] Error asignando caso:', e);
    return { success: false, assignedCount: 0, error: e.message };
  }
}

export async function loadClinicalAssignmentLaunch(
  assignmentId: string,
  studentId?: string,
  fallback?: Partial<ClinicalAssignmentLaunchState>
): Promise<ClinicalAssignmentLaunchState | null> {
  const assignment = await getStudentAssignmentById(assignmentId, studentId);
  if (assignment) return getClinicalCaseLaunchState(assignment, studentId);

  if (!fallback?.patternId && !fallback?.category) return null;

  return {
    assignmentId,
    patternId: fallback.patternId,
    category: fallback.category,
    clinicalMode: fallback.clinicalMode || 'exam',
    timeLimitMinutes: fallback.timeLimitMinutes,
    difficulty: fallback.difficulty || 'medium',
    assignmentTitle: fallback.assignmentTitle || 'Caso Clínico Asignado',
    studentId: studentId || fallback.studentId,
    status: fallback.status || 'pending',
  };
}

/**
 * Registra la entrega y resolución del caso clínico asignado a un alumno.
 */
export async function submitClinicalCaseAssignment(
  assignmentId: string,
  studentId: string,
  evaluation: {
    score: number;
    isCorrect: boolean;
    selectedAnswer: string;
    correctPatternId: string;
    patternName: string;
    timeSpentSeconds: number;
    hintsUsed?: number;
  }
): Promise<boolean> {
  const feedbackNotes = evaluation.isCorrect
    ? `Diagnóstico acertado: ${evaluation.patternName}. Tiempo: ${evaluation.timeSpentSeconds}s. Pistas: ${evaluation.hintsUsed || 0}.`
    : `Diagnóstico seleccionado incorrecto: ${evaluation.selectedAnswer}. Caso correspondía a: ${evaluation.patternName}.`;

  try {
    await gradeAssignment(
      assignmentId,
      studentId,
      evaluation.score,
      feedbackNotes
    );
    return true;
  } catch (e) {
    console.error('[emgExerciseService] Error registrando entrega:', e);
    return false;
  }
}

// ─── Helpers de Conversión ────────────────────────────────────────────────────

function rowToTemplate(row: any): CustomCaseTemplateRecord {
  return {
    patternId: row.pattern_id,
    patternName: row.pattern_name,
    category: row.category,
    difficulty: row.difficulty || 'medium',
    usageMode: (row.usage_mode as CaseUsageMode) || 'practice',
    patient: row.patient,
    ncs: row.ncs,
    emg: row.emg,
    rns: row.rns || undefined,
    lateResponses: row.late_responses || undefined,
    skinTemperature: row.skin_temperature || undefined,
    technicalNotes: row.technical_notes || [],
    isPitfall: !!row.is_pitfall,
    pitfallExplanation: row.pitfall_explanation || undefined,
    severityGrade: row.severity_grade || 'moderate',
    severityExplanation: row.severity_explanation || undefined,
    explanation: row.explanation,
    differentials: row.differentials || [],
    recommendations: row.recommendations || [],
    hints: row.hints || [],
    status: row.status || 'PUBLISHED',
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    is_custom: true,
  } as CustomCaseTemplateRecord;
}

function updateLocalStorageCustom(record: CustomCaseTemplateRecord) {
  try {
    const raw = localStorage.getItem(KEY_LOCAL_CUSTOM_TEMPLATES);
    let list: CustomCaseTemplateRecord[] = raw ? JSON.parse(raw) : [];
    list = list.filter(item => item.patternId !== record.patternId);
    list.unshift(record);
    localStorage.setItem(KEY_LOCAL_CUSTOM_TEMPLATES, JSON.stringify(list));
  } catch {}
}
