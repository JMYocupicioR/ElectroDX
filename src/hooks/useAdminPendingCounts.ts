import { useStaffInbox, invalidateStaffInbox, type StaffInboxCounts } from './useStaffInbox';

export type AdminPendingCountsData = StaffInboxCounts;

export function invalidateAdminPendingCounts() {
  invalidateStaffInbox();
}

export function useAdminPendingCounts(): AdminPendingCountsData {
  return useStaffInbox().counts;
}
