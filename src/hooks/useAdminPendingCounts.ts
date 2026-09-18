import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAdminStats } from '../services/editorialService';
import { useAuth } from '../contexts/AuthProvider';

export function useAdminPendingCounts() {
  const { isAdmin, isEditor } = useAuth();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingEnrollments, setPendingEnrollments] = useState(0);
  const [pendingCourseEnrollments, setPendingCourseEnrollments] = useState(0);
  const [pendingRevisions, setPendingRevisions] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured || (!isAdmin && !isEditor)) return;

    getAdminStats()
      .then((s) => {
        setPendingUsers(s.pending_users);
        setPendingEnrollments(s.pending_enrollments ?? 0);
        setPendingCourseEnrollments(s.pending_course_enrollments ?? 0);
        setPendingRevisions(s.pending_revisions);
      })
      .catch(() => {
        setPendingUsers(0);
        setPendingEnrollments(0);
        setPendingCourseEnrollments(0);
        setPendingRevisions(0);
      });
  }, [isAdmin, isEditor]);

  const totalPending = pendingUsers + pendingEnrollments + pendingCourseEnrollments + pendingRevisions;

  return { pendingUsers, pendingEnrollments, pendingCourseEnrollments, pendingRevisions, totalPending };
}
