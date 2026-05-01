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
 * Root domain for building tenant URLs (e.g. "trizenhr.com").
 * Prefer NEXT_PUBLIC_APP_DOMAIN; fallback to current hostname when not localhost.
 */
export function getRootDomain(): string {
  if (ROOT_DOMAIN_ENV) return ROOT_DOMAIN_ENV;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host; // localhost in dev, trizenhr.com in prod when served from there
  }
  return 'trizenhr.com';
}

/**
 * Build the login URL for a tenant.
 * With NEXT_PUBLIC_TENANT_SUBDOMAIN=org: abc -> https://abc.org.trizenhr.com/login
 * Without: abc -> https://abc.trizenhr.com/login
 * In development (localhost), uses slug.localhost:port (tenant segment ignored so *.localhost works).
 */
export function getCompanyLoginUrl(subdomain: string): string {
  const slug = subdomain.replace(/\./g, '').toLowerCase().trim();
  if (!slug) return '';
  const root = getRootDomain();
  const useTenantSegment = TENANT_SUBDOMAIN_ENV && root !== 'localhost';
  const hostLabel = useTenantSegment ? `${slug}.${TENANT_SUBDOMAIN_ENV}` : slug;
  const host = `${hostLabel}.${root}`;
  if (typeof window === 'undefined') {
    return `https://${host}/login`;
  }
  const protocol = window.location.protocol;
  const port = window.location.port;
  const base = `${protocol}//${host}${port && root === 'localhost' ? `:${port}` : ''}`;
  return `${base}/login`;
}
