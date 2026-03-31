/**
 * Global configuration for the application
 */
export const CONFIG = {
  // Use VITE_API_URL from .env or default to localhost:8000
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Endpoints
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    ANALYZE: '/api/analyze/0',
  }
};

export const getApiUrl = (endpoint: string) => {
  const base = CONFIG.API_URL.endsWith('/') ? CONFIG.API_URL.slice(0, -1) : CONFIG.API_URL;
  return `${base}${endpoint}`;
};
