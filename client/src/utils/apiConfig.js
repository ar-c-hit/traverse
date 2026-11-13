/**
 * Traverse API & WebSocket Configuration for Production (Vercel + Render) and Development
 */

// Strip trailing slashes if present
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Socket URL: if VITE_API_URL is set, connect to Render; otherwise fallback to relative '/'
export const SOCKET_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || '').replace(/\/+$/, '') || '/';

/**
 * Returns full URL for a given API endpoint.
 * Example: getApiUrl('/api/trips') -> 'https://traverse-api.onrender.com/api/trips'
 */
export const getApiUrl = (endpoint = '') => {
  if (!API_BASE_URL) return endpoint;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Automatically intercepts relative fetch('/api/...') calls to prepend API_BASE_URL
 * when running with a configured remote backend (e.g. on Vercel pointing to Render).
 * When running in local development without VITE_API_URL, fetch works normally via Vite's proxy.
 */
export const initApiConfig = () => {
  if (API_BASE_URL && typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
      if (typeof resource === 'string' && resource.startsWith('/api')) {
        return originalFetch(getApiUrl(resource), init);
      }
      return originalFetch(resource, init);
    };
    console.log(`[Traverse] Remote backend API target: ${API_BASE_URL}`);
  }
};

