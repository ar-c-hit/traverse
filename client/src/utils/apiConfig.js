/**
 * Traverse API & WebSocket Configuration for Production (Vercel + Render) and Development
 */

const getInitialApiBase = () => {
  if (typeof window === 'undefined') {
    return (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  }

  // 1. Check URL query param ?api=... or ?backend=...
  try {
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get('api') || params.get('backend');
    if (paramUrl && (paramUrl.startsWith('http://') || paramUrl.startsWith('https://'))) {
      const clean = paramUrl.trim().replace(/\/+$/, '');
      localStorage.setItem('traverse_api_url', clean);
      return clean;
    }
  } catch (_) {}

  // 2. Check localStorage saved backend URL
  try {
    const saved = localStorage.getItem('traverse_api_url');
    if (saved && (saved.startsWith('http://') || saved.startsWith('https://'))) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch (_) {}

  // 3. Check window injection
  if (typeof window !== 'undefined' && window.__TRAVERSE_API_URL__) {
    return window.__TRAVERSE_API_URL__.trim().replace(/\/+$/, '');
  }

  // 4. Check Vite build-time environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  return '';
};

export let API_BASE_URL = getInitialApiBase();
export let SOCKET_URL = API_BASE_URL || (import.meta.env.VITE_SOCKET_URL || '').replace(/\/+$/, '') || '/';

export const setApiBaseUrl = (newUrl) => {
  if (!newUrl) {
    try { localStorage.removeItem('traverse_api_url'); } catch (_) {}
    API_BASE_URL = '';
    SOCKET_URL = '/';
  } else {
    let clean = newUrl.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    try { localStorage.setItem('traverse_api_url', clean); } catch (_) {}
    API_BASE_URL = clean;
    SOCKET_URL = clean;
  }
};

/**
 * Returns full URL for a given API endpoint.
 * Example: getApiUrl('/api/trips') -> 'https://traverse-backend.onrender.com/api/trips'
 */
export const getApiUrl = (endpoint = '') => {
  if (!API_BASE_URL) return endpoint;
  if (typeof endpoint !== 'string') return endpoint;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Intercepts relative fetch('/api/...') calls to prepend API_BASE_URL
 * when running in production pointing to Render.
 */
export const initApiConfig = () => {
  if (typeof window === 'undefined' || !window.fetch) return;

  const originalFetch = window.fetch;
  window.fetch = async function (resource, init) {
    let target = resource;
    if (typeof resource === 'string') {
      if (resource.startsWith('/api') || resource.startsWith('api/')) {
        target = getApiUrl(resource);
      }
    } else if (resource && typeof resource === 'object' && resource.url) {
      const url = resource.url;
      if (url.startsWith('/api') || url.startsWith('api/')) {
        target = new Request(getApiUrl(url), resource);
      }
    }

    try {
      const res = await originalFetch(target, init);

      // Detect when Vercel rewrote /api to index.html (meaning no backend URL was connected)
      const contentType = res.headers.get('content-type') || '';
      const isApiCall = typeof target === 'string' && (target.includes('/api/') || target.endsWith('/api'));
      if (isApiCall && contentType.includes('text/html') && res.status === 200) {
        window.dispatchEvent(new CustomEvent('traverse:backend_missing', { detail: { url: target } }));
      }

      return res;
    } catch (err) {
      throw err;
    }
  };

  if (API_BASE_URL) {
    console.log(`[Traverse] API target: ${API_BASE_URL}`);
  }
};
