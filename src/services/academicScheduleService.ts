import { supabase } from '../lib/supabase';
import { allModules } from '../content/modules';
import { getAllTopicIds } from './studentService';
import type { AcademicMilestone, StudentMilestoneAudit, MilestoneTopicCheckItem } from '../types/academicGradebook';
import type { Topic } from '../types/content';

const KEY_LOCAL_MILESTONES = 'neurosafe_academic_milestones_';

// Hitos de corte predeterminados para la cohorte médica COMEFYR 2026
export const DEFAULT_ACADEMIC_MILESTONES: AcademicMilestone[] = [
  {
    id: 'mls_corte_1_fundamentos',
    cohort_id: '2026-general',
    title: 'Corte 1: Fundamentos de Neurofisiología y Conducción Nerviosa Básica',
    description: 'Bases bioeléctricas, neuroconducción motora y sensitiva, filtros y montaje de electrodos.',
    start_date: '2026-08-01T00:00:00Z',
    due_date: '2026-09-15T23:59:59Z',
    target_topic_ids: [
      'history',
      'clinical-role',
      'ethical-aspects',
      'safety-patient',
      'resting-potential',
      'action-potential',
      'nerve-structure',
      'motor-conduction',
      'sensory-conduction',
      'mixed-nerve',
      'temperature-effects',
    ],
    passing_grade: 80,
    order_index: 1,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'mls_corte_2_emg_aguja',
    cohort_id: '2026-general',
    title: 'Corte 2: Electromiografía de Aguja y Respuestas Tardías',
    description: 'Actividad de inserción, actividad espontánea anormal, morfología de PAUMs, onda F y reflejo H.',
    start_date: '2026-09-16T00:00:00Z',
    due_date: '2026-10-15T23:59:59Z',
    target_topic_ids: [
      'f-waves',
      'h-reflex',
      'axon-reflex',
      'blink-reflex',
      'emg-electrodes',
      'insertional-activity',
      'spontaneous-activity',
      'fibrillations-psws',
      'fasciculations',
      'mup-parameters',
      'recruitment-pattern',
    ],
    passing_grade: 80,
    order_index: 2,
    created_at: '2026-09-16T00:00:00Z',
    updated_at: '2026-09-16T00:00:00Z',
  },
  {
    id: 'mls_corte_3_union_radiculopatias',
    cohort_id: '2026-general',
    title: 'Corte 3: Unión Neuromuscular, Plexos y Radiculopatías',
    description: 'Estimulación repetitiva, miastenia gravis, ELA (Gold Coast) y mapeo miotomal de radiculopatías.',
    start_date: '2026-10-16T00:00:00Z',
    due_date: '2026-11-15T23:59:59Z',
    target_topic_ids: [
      'repetitive-stimulation-basics',
      'myasthenia-protocol',
      'lambert-eaton-protocol',
      'cervical-radiculopathy',
      'lumbosacral-radiculopathy',
      'brachial-plexus-anatomy',
      'lumbosacral-plexus',
      'als-gold-coast-criteria',
    ],
    passing_grade: 80,
    order_index: 3,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z',
  },
  {
    id: 'mls_corte_4_patologias_certificacion',
    cohort_id: '2026-general',
    title: 'Corte 4: Polineuropatías, Miopatías y Certificación COMEFYR',
    description: 'Criterios CIDP EAN/PNS 2021, variantes de Guillain-Barré, miopatías inflamatorias y control de calidad.',
    start_date: '2026-11-16T00:00:00Z',
    due_date: '2026-12-15T23:59:59Z',
    target_topic_ids: [
      'cidp-criteria-2021',
      'gbs-subtypes',
      'diabetic-neuropathy',
      'inflammatory-myopathies',
      'dystrophies',
      'qc-standards',
      'safety-electrical',
      'report-writing-standards',
    ],
    passing_grade: 80,
    order_index: 4,
    created_at: '2026-11-16T00:00:00Z',
    updated_at: '2026-11-16T00:00:00Z',
  },
];

// Mapeo auxiliar de temas para resolver títulos rápidamente
function findTopicMetadata(topicId: string): { topicTitle: string; moduleId: string; moduleTitle: string } {
  for (const mod of allModules) {
    const searchRecursive = (topics: Topic[]): Topic | null => {
      for (const t of topics) {
        if (t.id === topicId) return t;
        if (t.children && t.children.length > 0) {
          const found = searchRecursive(t.children);
          if (found) return found;
        }
      }
      return null;
    };

    const target = searchRecursive(mod.topics);
    if (target) {
      return {
        topicTitle: target.title,
        moduleId: mod.id,
        moduleTitle: mod.title,
      };
    }
  }

  return {
    topicTitle: `Tema ${topicId}`,
    moduleId: 'general',
    moduleTitle: 'Temario General',
  };
}

export async function getAcademicMilestones(): Promise<AcademicMilestone[]> {
  // 1. Supabase
  try {
    const { data, error } = await (supabase.from as any)('academic_milestones')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as AcademicMilestone[];
    }
  } catch {}

  // 2. LocalStorage Fallback
  try {
    const raw = localStorage.getItem(KEY_LOCAL_MILESTONES);
    if (raw) {
      const list: AcademicMilestone[] = JSON.parse(raw);
      if (list && list.length > 0) return list;
    }
  } catch {}

  // 3. Fallback a los predeterminados de COMEFYR
  try {
    localStorage.setItem(KEY_LOCAL_MILESTONES, JSON.stringify(DEFAULT_ACADEMIC_MILESTONES));
  } catch {}

  return DEFAULT_ACADEMIC_MILESTONES;
}

export async function saveMilestone(milestone: AcademicMilestone): Promise<AcademicMilestone> {
  const updatedItem: AcademicMilestone = {
    ...milestone,
    updated_at: new Date().toISOString(),
  };

  // 1. Local
  try {
    const raw = localStorage.getItem(KEY_LOCAL_MILESTONES);
    const list: AcademicMilestone[] = raw ? JSON.parse(raw) : [...DEFAULT_ACADEMIC_MILESTONES];
    const idx = list.findIndex((m) => m.id === milestone.id);
    if (idx !== -1) {
      list[idx] = updatedItem;
    } else {
      list.push(updatedItem);
    }
    localStorage.setItem(KEY_LOCAL_MILESTONES, JSON.stringify(list));
  } catch (e) {
    console.warn('[academicScheduleService] Local save error:', e);
  }

  // 2. Supabase
  try {
    const { data } = await (supabase.from as any)('academic_milestones')
      .upsert(updatedItem)
      .select()
      .single();
    if (data) return data as AcademicMilestone;
  } catch {}

  return updatedItem;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  // 1. Local
  try {
    const raw = localStorage.getItem(KEY_LOCAL_MILESTONES);
    if (raw) {
      const list: AcademicMilestone[] = JSON.parse(raw);
      const filtered = list.filter((m) => m.id !== milestoneId);
      localStorage.setItem(KEY_LOCAL_MILESTONES, JSON.stringify(filtered));
    }
  } catch {}

  // 2. Supabase
  try {
    await (supabase.from as any)('academic_milestones').delete().eq('id', milestoneId);
  } catch {}
}

export async function getStudentMilestoneAudits(
  studentId: string,
  completedTopicSet: Set<string>
): Promise<StudentMilestoneAudit[]> {
  const milestones = await getAcademicMilestones();
  const now = new Date();

  return milestones.map((milestone) => {
    const dueDate = new Date(milestone.due_date);
    const isPastDue = now > dueDate;

    const topicChecks: MilestoneTopicCheckItem[] = (milestone.target_topic_ids || []).map((tid) => {
      const meta = findTopicMetadata(tid);
      const isCompleted = completedTopicSet.has(tid);

      let status: 'on_time' | 'late' | 'pending' = 'pending';
      if (isCompleted) {
        // En una implementación con timestamp guardado, se compararía completion_date con due_date
        status = 'on_time';
      } else if (isPastDue) {
        status = 'late';
      }

      return {
        topicId: tid,
        topicTitle: meta.topicTitle,
        moduleId: meta.moduleId,
        moduleTitle: meta.moduleTitle,
        completed: isCompleted,
        status,
      };
    });

    const totalTopics = topicChecks.length;
    const completedTopics = topicChecks.filter((t) => t.completed).length;
    const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 100;
    const isOnTrack = !isPastDue || progressPct >= 80;

    return {
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      dueDate: milestone.due_date,
      totalTopics,
      completedTopics,
      progressPct,
      isOnTrack,
      topics: topicChecks,
    };
  });
}
