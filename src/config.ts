// API Base URL Configuration
// Automatically uses the correct API URL based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://rabuste-backend-production.up.railway.app'
    : `http://${window.location.hostname}:5000`);

