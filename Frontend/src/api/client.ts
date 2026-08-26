import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Auth endpoints
export const auth = {
  register: (data: { username: string; email: string; password: string; full_name?: string }) =>
    api.post('/api/v1/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/api/v1/auth/login', data),
  
  me: () => api.get('/api/v1/auth/me'),
};

// Signal endpoints
export const signals = {
  getSignal: (symbol: string, timeframe: string = '1h') =>
    api.get(`/api/v1/signals/${symbol}?timeframe=${timeframe}`),
  
  getMultiSignals: (symbols: string[], timeframe: string = '1h') =>
    api.get(`/api/v1/signals/multi?symbols=${symbols.join(',')}&timeframe=${timeframe}`),
};

// Market data endpoints
export const marketData = {
  getOHLCV: (symbol: string, interval: string = '1h', limit: number = 100) =>{

    const adjustedLimit = interval === '1d' ? Math.min(limit, 90) : limit;
     return api.get(`/api/v1/market-data/${symbol}?interval=${interval}&limit=${adjustedLimit}`);
  },
  
  getLatest: (symbol: string) =>
    api.get(`/api/v1/market-data/${symbol}/latest`),
};