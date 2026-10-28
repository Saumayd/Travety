/**
 * API URL utility for local development and production environments (Vercel + Render).
 * When VITE_API_URL is configured (e.g. on Vercel pointing to Render), it prefixes all requests.
 * Otherwise, it uses relative paths (for local development or single-origin deployments).
 */

const RAW_API_BASE = import.meta.env.VITE_API_URL || '';
export const API_BASE = typeof RAW_API_BASE === 'string' ? RAW_API_BASE.replace(/\/+$/, '') : '';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

