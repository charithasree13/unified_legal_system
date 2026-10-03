/**
 * Centralized API Configuration for Elite Legal Desk Frontend
 * Resolves production backend URL (e.g., Render) vs local development proxy.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
};

export const API_BASE = getApiBaseUrl();

/**
 * Returns full API URL for any endpoint.
 * Example: getApiUrl('/api/projects') -> 'https://unified-legal-system-api.onrender.com/api/projects'
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE) {
    return `${API_BASE}${cleanEndpoint}`;
  }
  return cleanEndpoint;
};
