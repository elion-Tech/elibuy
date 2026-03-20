const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Avoid double slashes if API_BASE_URL ends with / and endpoint starts with /
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
  return fetch(url, options);
};
