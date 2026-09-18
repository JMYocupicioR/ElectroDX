import { supabase, sb } from '../lib/supabase';
import { DEFAULT_COURSES, DEFAULT_COURSE_MODULES } from '../content/courseCatalog';
import type {
  ModuleAccess,
  LiveWorkshop,
  WorkshopRegistration,
  AccessTier,
  Course,
  CourseId,
  CourseModuleRow,
  CourseEnrollment,
  CourseEnrollmentStatus,
  CourseWaitlistRow,
  SyllabusTopicOverride,
} from '../types/database';

// ─── Module Access ──────────────────────────────────────────────────────────

export async function getModuleAccessMap(): Promise<Map<string, ModuleAccess>> {
  const { data, error } = await supabase
    .from('module_access')
    .select('*');
  if (error) throw error;
  const map = new Map<string, ModuleAccess>();
  for (const row of (data ?? []) as ModuleAccess[]) {
    map.set(row.module_id, row);
  }
  return map;
}

export async function setModuleAccess(
  moduleId: string,
  tier: AccessTier,
  previewTopicIds: string[] = []
) {
  const { error } = await supabase
    .from('module_access')
    .upsert(
      {
        module_id: moduleId,
        required_tier: tier,
        preview_topic_ids: previewTopicIds,
      },
      { onConflict: 'module_id' }
    );
  if (error) throw error;
}

// ─── Live Workshops ─────────────────────────────────────────────────────────

export async function getWorkshops(options?: {
  moduleId?: string;
  status?: string[];
  limit?: number;
}): Promise<LiveWorkshop[]> {
  let query = supabase
    .from('live_workshops')
    .select('*')
    .order('scheduled_at', { ascending: false });

  if (options?.moduleId) {
    query = query.eq('module_id', options.moduleId);
  }
  if (options?.status?.length) {
    query = query.in('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LiveWorkshop[];
}

export async function getUpcomingWorkshops(limit = 5): Promise<LiveWorkshop[]> {
  const { data, error } = await supabase
    .from('live_workshops')
    .select('*')
    .in('status', ['scheduled', 'live'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LiveWorkshop[];
}

export async function getWorkshopById(id: string): Promise<LiveWorkshop | null> {
  const { data, error } = await supabase
    .from('live_workshops')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as LiveWorkshop | null) ?? null;
}

export async function createWorkshop(
  workshop: Omit<LiveWorkshop, 'id' | 'created_at' | 'updated_at'>
): Promise<LiveWorkshop> {
  const { data, error } = await supabase
    .from('live_workshops')
    .insert(workshop as any)
    .select('*')
    .single();
  if (error) throw error;
  return data as LiveWorkshop;
}

export async function updateWorkshop(
  id: string,
  updates: Partial<LiveWorkshop>
): Promise<LiveWorkshop> {
  const { data, error } = await supabase
    .from('live_workshops')
    .update(updates as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as LiveWorkshop;
}

export async function setWorkshopAttendanceClosed(
  id: string,
  closed: boolean
): Promise<LiveWorkshop> {
  return updateWorkshop(id, { attendance_closed: closed });
}


// ─── Workshop Registrations ─────────────────────────────────────────────────

export async function registerForWorkshop(workshopId: string, userId: string) {
  const { error } = await supabase
    .from('workshop_registrations')
    .insert({ workshop_id: workshopId, user_id: userId } as any);
  if (error) throw error;
}

export async function getWorkshopRegistrations(workshopId: string): Promise<WorkshopRegistration[]> {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select('*')
    .eq('workshop_id', workshopId)
    .order('registered_at');
  if (error) throw error;
  return (data ?? []) as WorkshopRegistration[];
}

export async function getMyRegistrations(userId: string): Promise<WorkshopRegistration[]> {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkshopRegistration[];
}

export async function markAttendance(workshopId: string, userId: string, attended: boolean) {
  const { error } = await supabase
    .from('workshop_registrations')
    .update({ attended })
    .eq('workshop_id', workshopId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ─── Courses / syllabus ─────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('[courseService] getCourses fallback:', error.message);
    return DEFAULT_COURSES;
  }
  return ((data ?? []) as Course[]).length ? (data as Course[]) : DEFAULT_COURSES;
}

export async function getCourseModules(): Promise<CourseModuleRow[]> {
  const { data, error } = await supabase
    .from('course_modules')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('[courseService] getCourseModules fallback:', error.message);
    return DEFAULT_COURSE_MODULES;
  }
  return ((data ?? []) as CourseModuleRow[]).length ? (data as CourseModuleRow[]) : DEFAULT_COURSE_MODULES;
}

export async function getSyllabusTopicOverrides(): Promise<SyllabusTopicOverride[]> {
  const { data, error } = await supabase.from('syllabus_topic_overrides').select('*');
  if (error) {
    console.warn('[courseService] getSyllabusTopicOverrides:', error.message);
    return [];
  }
  return (data ?? []) as SyllabusTopicOverride[];
}

export async function getSyllabusCatalog(): Promise<{
  courses: Course[];
  assignments: CourseModuleRow[];
  overrides: SyllabusTopicOverride[];
}> {
  const [courses, assignments, overrides] = await Promise.all([
    getCourses(),
    getCourseModules(),
    getSyllabusTopicOverrides(),
  ]);
  return { courses, assignments, overrides };
}

export async function updateCourseMetadata(
  courseId: CourseId,
  updates: Partial<Pick<Course, 'title' | 'description' | 'price_display' | 'is_active' | 'sort_order'>>
): Promise<void> {
  const { error } = await sb.from('courses').update(updates).eq('id', courseId);
  if (error) throw error;
}

/**
 * Elimina un curso de forma segura desvinculando constancias y
 * liberando sus módulos a la sección 'Sin asignar'.
 */
export async function deleteCourse(courseId: CourseId): Promise<void> {
  // 1. Intentar llamar a la función RPC admin_delete_course si está desplegada
  try {
    const { error: rpcError } = await (sb.rpc as any)('admin_delete_course', {
      p_course_id: courseId,
    });
    if (!rpcError) return;
    console.warn('[courseService] admin_delete_course RPC fallo o no existe, usando fallback directo:', rpcError.message);
  } catch (err) {
    console.warn('[courseService] admin_delete_course RPC error:', err);
  }

  // 2. Fallback resiliente mediante operaciones directas en Supabase
  try {
    await (sb.from('academic_certificates') as any).update({ course_id: null }).eq('course_id', courseId);
  } catch {
    // Si no existen certificados asociados o no está la columna, continuar
  }

  // Desasignar módulos del curso para que pasen a "Sin asignar"
  const { error: modError } = await sb.from('course_modules').delete().eq('course_id', courseId);
  if (modError) {
    console.warn('[courseService] deleteCourse unassign modules warning:', modError.message);
  }

  // Eliminar inscripciones del curso
  const { error: enrError } = await sb.from('course_enrollments').delete().eq('course_id', courseId);
  if (enrError) {
    console.warn('[courseService] deleteCourse enrollments warning:', enrError.message);
  }

  // Eliminar el registro del curso de la tabla courses
  const { error } = await sb.from('courses').delete().eq('id', courseId);
  if (error) throw error;
}

export async function assignModuleToCourse(
  moduleId: string,
  courseId: CourseId | null,
  sortOrder = 0,
  isVisible = true
): Promise<void> {
  if (!courseId) {
    const { error } = await sb.from('course_modules').delete().eq('module_id', moduleId);
    if (error) throw error;
    return;
  }
  const { error } = await sb.from('course_modules').upsert(
    {
      module_id: moduleId,
      course_id: courseId,
      sort_order: sortOrder,
      is_visible: isVisible,
    },
    { onConflict: 'module_id' }
  );
  if (error) throw error;
}

export async function setCourseModuleVisible(moduleId: string, isVisible: boolean): Promise<void> {
  const { error } = await sb.from('course_modules').update({ is_visible: isVisible }).eq('module_id', moduleId);
  if (error) throw error;
}

/** Reordena los módulos de un curso en una sola transacción (RPC atómica). */
export async function reorderCourseModules(courseId: CourseId, moduleIds: string[]): Promise<void> {
  const { error } = await sb.rpc('reorder_course_modules', {
    p_course_id: courseId,
    p_module_ids: moduleIds,
  });
  if (error) throw error;
}

export interface SyllabusTopicOverrideInput {
  topic_id: string;
  sort_order: number;
  is_visible: boolean;
}

/** Upsert atómico (una transacción) de los overrides de temas de un módulo. */
export async function setSyllabusTopicOverrides(
  moduleId: string,
  overrides: SyllabusTopicOverrideInput[]
): Promise<void> {
  if (!overrides.length) return;
  const { error } = await sb.rpc('set_syllabus_topic_overrides', {
    p_module_id: moduleId,
    p_overrides: overrides,
  });
  if (error) throw error;
}

export async function getMyCourseEnrollments(status?: CourseEnrollmentStatus | 'all'): Promise<CourseEnrollment[]> {
  let query = supabase
    .from('course_enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CourseEnrollment[];
}

export async function requestCourseEnrollment(
  courseId: CourseId,
  options?: { notes?: string; paymentReference?: string }
): Promise<CourseEnrollment> {
  const { data, error } = await (sb.rpc as any)('request_course_enrollment', {
    p_course_id: courseId,
    p_notes: options?.notes?.trim() || null,
    p_payment_reference: options?.paymentReference?.trim() || null,
  });
  if (error) throw error;
  return data as CourseEnrollment;
}

export async function cancelCourseEnrollmentRequest(courseId: CourseId): Promise<void> {
  const { error } = await (sb.rpc as any)('cancel_course_enrollment_request', {
    p_course_id: courseId,
  });
  if (error) throw error;
}

export async function adminAdmitStudentToCourse(
  userId: string,
  courseId: CourseId,
  options?: { notes?: string; method?: string; reference?: string; expiresAt?: string | null }
): Promise<CourseEnrollment> {
  const { data, error } = await (sb.rpc as any)('admin_admit_student_to_course', {
    p_user_id: userId,
    p_course_id: courseId,
    p_notes: options?.notes?.trim() || null,
    p_payment_method: options?.method ?? 'manual',
    p_payment_reference: options?.reference?.trim() || null,
    p_expires_at: options?.expiresAt ?? null,
  });
  if (error) throw error;
  return data as CourseEnrollment;
}

export async function adminRejectCourseRequest(
  userId: string,
  courseId: CourseId,
  reason?: string
): Promise<void> {
  const { error } = await (sb.rpc as any)('admin_reject_course_request', {
    p_user_id: userId,
    p_course_id: courseId,
    p_reason: reason?.trim() || null,
  });
  if (error) throw error;
}

export async function getAdminCourseWaitlist(
  courseId?: CourseId | null,
  status?: CourseEnrollmentStatus | 'all'
): Promise<CourseWaitlistRow[]> {
  const { data, error } = await (sb.rpc as any)('admin_get_course_waitlist', {
    p_course_id: courseId ?? null,
    p_status: status ?? 'pending',
  });
  if (error) throw error;
  return (data ?? []) as CourseWaitlistRow[];
}

export async function adminUpdateCoursePrice(courseId: CourseId, priceDisplay: string): Promise<void> {
  const { error } = await (sb.rpc as any)('admin_update_course_price', {
    p_course_id: courseId,
    p_price_display: priceDisplay.trim(),
  });
  if (error) throw error;
}

export async function getCourseEnrollmentsForUsers(userIds: string[]): Promise<CourseEnrollment[]> {
  if (!userIds.length) return [];
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .in('user_id', userIds);
  if (error) throw error;
  return (data ?? []) as CourseEnrollment[];
}

export async function grantCourseAccess(
  userId: string,
  courseId: CourseId,
  options?: { method?: string; reference?: string; notes?: string; expiresAt?: string | null }
): Promise<void> {
  const { error } = await sb.rpc('grant_course_access', {
    target_user_id: userId,
    p_course_id: courseId,
    p_method: options?.method ?? 'manual',
    p_reference: options?.reference ?? null,
    p_notes: options?.notes ?? null,
    p_expires_at: options?.expiresAt ?? null,
  });
  if (error) throw error;
}

export async function revokeCourseAccess(userId: string, courseId: CourseId): Promise<void> {
  const { error } = await sb.rpc('revoke_course_access', {
    target_user_id: userId,
    p_course_id: courseId,
  });
  if (error) throw error;
}
