/** Matches API client: platform host gets Super Admin org override via query param. */
export function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  const parts = host.split('.');
  return parts.length <= 2;
}
