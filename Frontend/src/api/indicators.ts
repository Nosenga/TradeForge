import api from './client';

export const indicators = {
  // Get RSI data for a symbol
  getRSI: (symbol: string, interval: string = '1h', period: number = 14, limit: number = 100) =>
    api.get(`/api/v1/indicators/rsi/${symbol}?interval=${interval}&period=${period}&limit=${limit}`),
  
  // Get MACD data for a symbol
  getMACD: (symbol: string, interval: string = '1h', fast: number = 12, slow: number = 26, signal: number = 9, limit: number = 100) =>
    api.get(`/api/v1/indicators/macd/${symbol}?interval=${interval}&fast=${fast}&slow=${slow}&signal=${signal}&limit=${limit}`),
  
  // Get Bollinger Bands for a symbol
  getBollinger: (symbol: string, interval: string = '1h', window: number = 20, num_std: number = 2, limit: number = 100) =>
    api.get(`/api/v1/indicators/bollinger/${symbol}?interval=${interval}&window=${window}&num_std=${num_std}&limit=${limit}`),
};