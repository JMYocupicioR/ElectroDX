import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { getStudentAssignments } from '../services/studentPlanService';
import { subscribeToRealtimeAssignments } from '../services/deviceNotificationService';

export function useStudentPendingAssignments() {
  const { user, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || isAdmin) {
      setPendingCount(0);
      return;
    }

    let isMounted = true;

    const fetchPending = async () => {
      try {
        const asgs = await getStudentAssignments(user.id);
        if (isMounted) {
          const count = asgs.filter((a) => a.status === 'pending').length;
          setPendingCount(count);
        }
      } catch {
        if (isMounted) setPendingCount(0);
      }
    };

    void fetchPending();

    // Listen to realtime changes from professor
    const unsubscribe = subscribeToRealtimeAssignments(user.id, () => {
      void fetchPending();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.id, isAdmin]);

  return { pendingCount };
}
