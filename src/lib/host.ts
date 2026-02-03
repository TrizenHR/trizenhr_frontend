/**
 * Client-side host/subdomain helpers for platform vs tenant (Keka-style) flows.
 * Used by login page and API client to decide platform vs org context.
 */

const ROOT_DOMAIN_ENV = process.env.NEXT_PUBLIC_APP_DOMAIN;

/**
 * True if the current host is the main platform (trizenhr.com, localhost),
 * false if it's a tenant subdomain (e.g. xyz.trizenhr.com).
 */
export function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  const parts = host.split('.');
  return parts.length <= 2;
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
 * Build the login URL for a tenant (e.g. xyz -> https://xyz.trizenhr.com/login).
 * In development (localhost), uses subdomain.localhost:port so subdomain testing works
 * if the user has hosts or uses *.localhost.
 */
export function getCompanyLoginUrl(subdomain: string): string {
  const slug = subdomain.replace(/\./g, '').toLowerCase().trim();
  if (!slug) return '';
  if (typeof window === 'undefined') {
    const domain = getRootDomain();
    return `https://${slug}.${domain}/login`;
  }
  const root = getRootDomain();
  const protocol = window.location.protocol;
  const port = window.location.port;
  const base = `${protocol}//${slug}.${root}${port ? `:${port}` : ''}`;
  return `${base}/login`;
}
