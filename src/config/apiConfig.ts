const DEFAULT_API_URL = 'https://test-api.workdeck.com';

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    try {
      // Allow query param override: ?apiBase=https://custom-api.example.com
      const params = new URLSearchParams(window.location.search);
      const queryOverride = params.get('apiBase');
      if (queryOverride) {
        window.localStorage.setItem('api-base-url', queryOverride);
        return queryOverride;
      }

      const storedOverride = window.localStorage.getItem('api-base-url');
      if (storedOverride) {
        return storedOverride;
      }
    } catch (error) {
      console.warn('Unable to access localStorage for API override', error);
    }

    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local');

    if (isLocalhost) {
      return DEFAULT_API_URL;
    }
  }

  const fallbackUrl =
    envUrl && envUrl !== 'https://api.workdeck.com'
      ? envUrl
      : DEFAULT_API_URL;

  return fallbackUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();


