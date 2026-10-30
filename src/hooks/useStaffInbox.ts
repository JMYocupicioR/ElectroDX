import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { notifyStaffInboxDecision } from '../services/deviceNotificationService';
import { listStaffInbox } from '../services/staffInboxService';
import {
  countStaffInboxBadge,
  countStaffInboxByKind,
  type RankedStaffInboxItem,
} from '../utils/staffInboxRank';

export interface StaffInboxCounts {
  pendingUsers: number;
  pendingEnrollments: number;
  pendingCourseEnrollments: number;
  pendingRevisions: number;
  pendingTeacherReviews: number;
  pendingQuizzes: number;
  totalPending: number;
}

export interface StaffInboxState {
  items: RankedStaffInboxItem[];
  counts: StaffInboxCounts;
  loading: boolean;
  error: string | null;
}

const EMPTY_COUNTS: StaffInboxCounts = {
  pendingUsers: 0,
  pendingEnrollments: 0,
  pendingCourseEnrollments: 0,
  pendingRevisions: 0,
  pendingTeacherReviews: 0,
  pendingQuizzes: 0,
  totalPending: 0,
};

const EMPTY_STATE: StaffInboxState = {
  items: [],
  counts: EMPTY_COUNTS,
  loading: true,
  error: null,
};

let cached: StaffInboxState | null = null;
let lastFetchedAt = 0;
let inFlight: Promise<StaffInboxState> | null = null;
const listeners = new Set<(state: StaffInboxState) => void>();
let realtimeStop: (() => void) | null = null;
let refetchTimer: ReturnType<typeof setTimeout> | null = null;
let knownP0 = new Set<string>();
let hasHydrated = false;

const CACHE_TTL_MS = 15_000;

function countsFromItems(items: RankedStaffInboxItem[]): StaffInboxCounts {
  const byKind = countStaffInboxByKind(items);
  return {
    pendingUsers: byKind.pendingEnrollments,
    pendingEnrollments: byKind.pendingEnrollments,
    pendingCourseEnrollments: byKind.pendingCourseEnrollments,
    pendingRevisions: byKind.pendingRevisions,
    pendingTeacherReviews: byKind.pendingTeacherReviews,
    pendingQuizzes: byKind.pendingQuizzes,
    totalPending: countStaffInboxBadge(items),
  };
}

function emit(state: StaffInboxState) {
  cached = state;
  lastFetchedAt = Date.now();
  listeners.forEach((listener) => listener(state));
}

function notifyNewP0(items: RankedStaffInboxItem[]) {
  const nextP0 = new Set(items.filter((item) => item.level === 0).map((item) => item.source_key));
  if (hasHydrated) {
    for (const item of items) {
      if (item.level !== 0 || knownP0.has(item.source_key)) continue;
      notifyStaffInboxDecision({
        sourceKey: item.source_key,
        title: item.title,
        body: [item.actor_name, item.context_label, item.message].filter(Boolean).join(' · '),
        url: item.link_url || '/admin',
      });
    }
  }
  knownP0 = nextP0;
  hasHydrated = true;
}

async function fetchInbox(): Promise<StaffInboxState> {
  try {
    const items = await listStaffInbox();
    notifyNewP0(items);
    return {
      items,
      counts: countsFromItems(items),
      loading: false,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'No se pudo leer la bandeja';
    return {
      items: cached?.items ?? [],
      counts: cached?.counts ?? EMPTY_COUNTS,
      loading: false,
      error: message,
    };
  }
}

function refreshStaffInbox(force = false) {
  const now = Date.now();
  if (!force && cached && now - lastFetchedAt < CACHE_TTL_MS && !inFlight) {
    emit(cached);
    return;
  }
  if (!inFlight) {
    inFlight = fetchInbox().finally(() => {
      inFlight = null;
    });
  }
  void inFlight.then(emit);
}

function scheduleRefresh() {
  if (refetchTimer) return;
  refetchTimer = setTimeout(() => {
    refetchTimer = null;
    refreshStaffInbox(true);
  }, 400);
}

function startRealtime(userId: string) {
  if (realtimeStop || !isSupabaseConfigured) return;
  const channel = supabase
    .channel(`staff-inbox-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'student_assignments' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'student_qa_threads' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'student_qa_replies' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'course_enrollments' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'content_revisions' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'published_quizzes' }, scheduleRefresh)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_notifications',
        filter: `user_id=eq.${userId}`,
      },
      scheduleRefresh
    )
    .subscribe();

  realtimeStop = () => {
    void supabase.removeChannel(channel);
    realtimeStop = null;
  };
}

export function invalidateStaffInbox() {
  lastFetchedAt = 0;
  refreshStaffInbox(true);
}

export function useStaffInbox(): StaffInboxState {
  const { isAdmin, isEditor, user } = useAuth();
  const [state, setState] = useState<StaffInboxState>(() => cached ?? EMPTY_STATE);
  const staff = Boolean(user && (isAdmin || isEditor));

  useEffect(() => {
    if (!isSupabaseConfigured || !staff || !user?.id) return;
    listeners.add(setState);
    startRealtime(user.id);
    if (cached && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
      setState(cached);
    } else {
      refreshStaffInbox();
    }
    return () => {
      listeners.delete(setState);
      if (listeners.size === 0) {
        realtimeStop?.();
        if (refetchTimer) {
          clearTimeout(refetchTimer);
          refetchTimer = null;
        }
      }
    };
  }, [staff, user?.id]);

  return state;
}
