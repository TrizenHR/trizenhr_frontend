/**
 * Custom-scheme deep links for the TrizenHR mobile app.
 * Emails still use https web URLs; mobile browsers can hand off to the app.
 */

export function isLikelyMobileUserAgent(ua?: string): boolean {
  if (typeof window === 'undefined' && !ua) {
    return false;
  }
  const value = ua ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /Android|iPhone|iPad|iPod|Mobile/i.test(value);
}

export function buildMobileSetPasswordDeepLink(params: {
  email?: string | null;
  organizationId?: string | null;
  role?: string | null;
  subdomain?: string | null;
  token?: string | null;
  flow?: string | null;
}): string {
  const query = new URLSearchParams();
  if (params.email) query.set('email', params.email);
  if (params.organizationId) query.set('organizationId', params.organizationId);
  if (params.role) query.set('role', params.role);
  if (params.subdomain) query.set('subdomain', params.subdomain);
  if (params.token) query.set('token', params.token);
  if (params.flow) query.set('flow', params.flow);
  const qs = query.toString();
  return qs ? `trizenhr://auth/set-password?${qs}` : 'trizenhr://auth/set-password';
}

export function openMobileSetPasswordDeepLink(params: {
  email?: string | null;
  organizationId?: string | null;
  role?: string | null;
  subdomain?: string | null;
  token?: string | null;
  flow?: string | null;
}): string {
  const href = buildMobileSetPasswordDeepLink(params);
  if (typeof window !== 'undefined') {
    window.location.href = href;
  }
  return href;
}
