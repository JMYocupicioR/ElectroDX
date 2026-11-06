/** Notifica a TopicPage / CourseSidebar que cambiaron los vínculos de clases grabadas. */
export const RECORDING_LINKS_CHANGED_EVENT = 'neurosafe:recording-links-changed';

export function notifyRecordingLinksChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RECORDING_LINKS_CHANGED_EVENT));
}
