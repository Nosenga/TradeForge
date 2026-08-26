import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signals } from '../api/client';

interface Signal {
  symbol: string;
  price: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: string;
  reasons: string[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [signalData, setSignalData] = useState<Record<string, Signal>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const symbols = ['EURUSD', 'GBPUSD', 'BTCUSD'];

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await signals.getMultiSignals(symbols);
      setSignalData(response.data.results || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-500';
      case 'SELL': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSignalBg = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-500/10 border-green-500';
      case 'SELL': return 'bg-red-500/10 border-red-500';
      default: return 'bg-yellow-500/10 border-yellow-500';
    }
  };

  const signalCount = Object.values(signalData).length;
  const buyCount = Object.values(signalData).filter(s => s.action === 'BUY').length;
  const sellCount = Object.values(signalData).filter(s => s.action === 'SELL').length;
  const holdCount = Object.values(signalData).filter(s => s.action === 'HOLD').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-gray-400">Welcome, {user?.username}!</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading signals...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          {/* Signal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {symbols.map((symbol) => {
              const signal = signalData[symbol];
              if (!signal) return null;

              return (
                <div
                  key={symbol}
                  className={`bg-trade-card rounded-xl p-6 border ${getSignalBg(signal.action)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{symbol}</h3>
                      <p className="text-gray-400 text-sm">
                        ${signal.price.toFixed(symbol === 'BTCUSD' ? 2 : 5)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getSignalColor(signal.action)}`}>
                        {signal.action}
                      </div>
                      <div className="text-sm text-gray-400">
                        {Math.round(signal.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {signal.reasons && signal.reasons.length > 0 && (
                      <div className="text-sm text-gray-400 space-y-1">
                        {signal.reasons.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
            <h2 className="text-white font-bold mb-4">Signal Summary</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-blue-400 text-2xl font-bold">{signalCount}</div>
                <div className="text-gray-400 text-sm">Total Signals</div>
              </div>
              <div>
                <div className="text-green-500 text-2xl font-bold">{buyCount}</div>
                <div className="text-gray-400 text-sm">Buy</div>
              </div>
              <div>
                <div className="text-red-500 text-2xl font-bold">{sellCount}</div>
                <div className="text-gray-400 text-sm">Sell</div>
              </div>
              <div>
                <div className="text-yellow-500 text-2xl font-bold">{holdCount}</div>
                <div className="text-gray-400 text-sm">Hold</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;