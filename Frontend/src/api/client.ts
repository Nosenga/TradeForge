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

// Trading endpoints
export const trading = {
  // Place a manual order
  placeOrder: (data: {
    symbol: string;
    action: string;
    lot_size: number;
    stop_loss?: number;
    take_profit?: number;
  }) => api.post('/api/v1/trade/order', data),
  
  // Get all orders
  getOrders: (status?: string) => 
    api.get(`/api/v1/trade/orders${status ? `?status=${status}` : ''}`),
  
  // Get open positions
  getPositions: () => api.get('/api/v1/trade/positions'),

  closePosition: (positionId: string) =>
    api.post(`/api/v1/trade/close/${positionId}`),
  cleanup: () => api.post('/api/v1/trade/cleanup'),
};

// Bot endpoints
export const bots = {
  // Create a new bot
  create: (data: {
    strategy_id: number;
    symbol: string;
    timeframe: string;
    lot_size: number;
    risk_percent: number;
    stop_loss_pips: number;
    take_profit_pips: number;
    min_confidence: number;
  }) => api.post('/api/v1/bots/create', data),
  
  // Start a bot
  start: (botId: number) => api.post(`/api/v1/bots/${botId}/start`),
  
  // Stop a bot
  stop: (botId: number) => api.post(`/api/v1/bots/${botId}/stop`),

  // Delete a bot
  delete: (botId: number) => api.delete(`/api/v1/bots/${botId}`),
  
  // Get all bots
  getAll: () => api.get('/api/v1/bots'),
};

// Dashboard endpoint
export const dashboard = {
  getSummary: () => api.get('/api/v1/dashboard'),
};

export const marketOverview = {
  get: () => api.get('/api/v1/market-overview'),
};

export const marketStatus = {
  get: () => api.get('/api/v1/market-status'),
};

export const account = {
  get: () => api.get('/api/v1/account'),
  reset: (newBalance?: number) => 
    api.post(`/api/v1/account/reset${newBalance ? `?new_balance=${newBalance}` : ''}`),
};

export const news = {
  get: (category: string = 'forex', limit: number = 5) => 
    api.get(`/api/v1/news?category=${category}&limit=${limit}`),
};