const EXAM_LOCK_KEY = 'neurosafe_exam_active';

export function setExamSessionLock(active: boolean) {
  try {
    if (active) sessionStorage.setItem(EXAM_LOCK_KEY, '1');
    else sessionStorage.removeItem(EXAM_LOCK_KEY);
  } catch {
    // ignore
  }
}

export function isExamSessionLocked() {
  try {
    return sessionStorage.getItem(EXAM_LOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function registerPwaUpdates() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  void import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (isExamSessionLocked()) return;
          void updateSW(true);
        },
      });
    })
    .catch(() => {
      // PWA plugin no disponible en tests
    });
}
