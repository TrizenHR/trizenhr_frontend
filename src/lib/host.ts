/**
 * Client-side host/subdomain helpers for platform vs tenant (Keka-style) flows.
 * Used by login page and API client to decide platform vs org context.
 *
 * When NEXT_PUBLIC_TENANT_SUBDOMAIN is set (e.g. "org"), tenant URLs are
 * abc.org.trizenhr.com; otherwise abc.trizenhr.com.
 */

const ROOT_DOMAIN_ENV = process.env.NEXT_PUBLIC_APP_DOMAIN;
const TENANT_SUBDOMAIN_ENV = (process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN || '').trim().toLowerCase();

/**
 * True if the current host is the main platform (trizenhr.com, www, org.trizenhr.com, localhost),
 * false if it's a tenant subdomain (e.g. abc.org.trizenhr.com or abc.trizenhr.com).
 */
export function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  const root = getRootDomain();
  if (host === root || host === `www.${root}`) return true;
  if (TENANT_SUBDOMAIN_ENV && host === `${TENANT_SUBDOMAIN_ENV}.${root}`) return true;
  return false;
}

/**
 * Root domain for building tenant URLs (e.g. "trizenhr.com" or "localhost").
 * Prefer NEXT_PUBLIC_APP_DOMAIN; otherwise derive from the current host.
 */
export function getRootDomain(): string {
  if (ROOT_DOMAIN_ENV) return ROOT_DOMAIN_ENV;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return 'localhost';
    // Tenant dev hosts: acme.localhost -> root is localhost (not acme.localhost)
    if (host.endsWith('.localhost')) return 'localhost';
    const parts = host.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return host;
  }
  return 'trizenhr.com';
}

/**
 * Hostname for a tenant slug (e.g. demoorg.localhost, acme.trizenhr.com, acme.org.trizenhr.com).
 */
export function getTenantHostname(subdomain: string): string {
  const slug = subdomain.replace(/\./g, '').toLowerCase().trim();
  if (!slug) return '';
  const root = getRootDomain();
  const useTenantSegment = TENANT_SUBDOMAIN_ENV && root !== 'localhost';
  const hostLabel = useTenantSegment ? `${slug}.${TENANT_SUBDOMAIN_ENV}` : slug;
  return `${hostLabel}.${root}`;
}

/** True when the current page is already served from the given tenant host. */
export function isCurrentTenantHost(subdomain: string): boolean {
  if (typeof window === 'undefined') return false;
  const expected = getTenantHostname(subdomain);
  if (!expected) return false;
  return window.location.hostname.toLowerCase() === expected;
}

/**
 * Login URL after set-password / invite accept.
 * Uses current origin when already on the tenant host (keeps port in local dev).
 * Otherwise builds the canonical tenant login URL for local or production.
 */
export function resolveTenantLoginUrl(subdomain?: string | null): string {
  const slug = subdomain?.replace(/\./g, '').toLowerCase().trim();

  if (typeof window !== 'undefined') {
    if (slug && isCurrentTenantHost(slug)) {
      return `${window.location.origin}/login`;
    }
    if (slug) {
      const tenantLogin = getCompanyLoginUrl(slug);
      if (tenantLogin) return tenantLogin;
    }
    return `${window.location.origin}/login`;
  }

  if (slug) {
    const tenantLogin = getCompanyLoginUrl(slug);
    if (tenantLogin) return tenantLogin;
  }
  return '/login';
}

/**
 * Build the login URL for a tenant.
 * With NEXT_PUBLIC_TENANT_SUBDOMAIN=org: abc -> https://abc.org.trizenhr.com/login
 * Without: abc -> https://abc.trizenhr.com/login
 * In development (localhost), uses slug.localhost:port (tenant segment ignored so *.localhost works).
 */
export function getCompanyLoginUrl(subdomain: string): string {
  const host = getTenantHostname(subdomain);
  if (!host) return '';
  const root = getRootDomain();
  if (typeof window === 'undefined') {
    const protocol = root === 'localhost' ? 'http' : 'https';
    const port =
      root === 'localhost'
        ? `:${process.env.NEXT_PUBLIC_FRONTEND_PORT || '3000'}`
        : '';
    return `${protocol}://${host}${port}/login`;
  }
  const protocol = window.location.protocol;
  const port = window.location.port;
  const includePort = Boolean(port) && root === 'localhost';
  const base = `${protocol}//${host}${includePort ? `:${port}` : ''}`;
  return `${base}/login`;
}

/** Tenant set-password URL for invitation emails (same host rules as login). */
export function getCompanySetPasswordUrl(subdomain: string): string {
  const loginUrl = getCompanyLoginUrl(subdomain);
  if (!loginUrl) return '';
  return loginUrl.replace(/\/login\/?$/, '/auth/set-password');
}
