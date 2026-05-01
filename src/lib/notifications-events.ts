/** Dispatched after mutations that change notification-relevant data (e.g. org delete). */
export const NOTIFICATIONS_REFRESH_EVENT = 'trizenhr:notifications-refresh';

export function requestNotificationsRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
}
