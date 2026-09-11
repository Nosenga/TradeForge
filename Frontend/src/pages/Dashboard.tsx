import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signals } from '../api/client';
import { SkeletonStats, SkeletonSignalCard, Skeleton } from '../components/Skeleton';

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
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await signals.getMultiSignals(symbols);
      setSignalData(response.data.results || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  const getSignalStyles = (action: string) => {
    switch (action) {
      case 'BUY':
        return {
          badge: 'badge-green',
          text: 'text-trade-green',
          progress: 'progress-green',
          icon: '▲',
        };
      case 'SELL':
        return {
          badge: 'badge-red',
          text: 'text-trade-red',
          progress: 'progress-red',
          icon: '▼',
        };
      default:
        return {
          badge: 'badge-yellow',
          text: 'text-trade-yellow',
          progress: 'progress-blue',
          icon: '●',
        };
    }
  };

  const signalCount = Object.values(signalData).length;
  const buyCount = Object.values(signalData).filter(s => s.action === 'BUY').length;
  const sellCount = Object.values(signalData).filter(s => s.action === 'SELL').length;
  const holdCount = Object.values(signalData).filter(s => s.action === 'HOLD').length;

  

  return (
    <div className="space-y-6 content-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome back, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="text-text-secondary">
            Live market signals and trading overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <span className="status-dot-green"></span>
          <span>Live</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass glass-hover p-5 flex flex-col gap-2">
          <span className="stat-label">Total Signals</span>
          <span className="stat-value">{signalCount}</span>
          <div className="progress">
            <div className="progress-fill progress-blue w-full"></div>
          </div>
        </div>
        
        <div className="glass glass-hover p-5 flex flex-col gap-2">
          <span className="stat-label">Buy Signals</span>
          <span className="stat-value text-trade-green">{buyCount}</span>
          <div className="progress">
            <div 
              className="progress-fill progress-green"
              style={{ width: `${signalCount ? (buyCount / signalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="glass glass-hover p-5 flex flex-col gap-2">
          <span className="stat-label">Sell Signals</span>
          <span className="stat-value text-trade-red">{sellCount}</span>
          <div className="progress">
            <div 
              className="progress-fill progress-red"
              style={{ width: `${signalCount ? (sellCount / signalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="glass glass-hover p-5 flex flex-col gap-2">
          <span className="stat-label">Hold Signals</span>
          <span className="stat-value text-trade-yellow">{holdCount}</span>
          <div className="progress">
            <div 
              className="progress-fill progress-blue"
              style={{ width: `${signalCount ? (holdCount / signalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Signal Cards */}
      {loading ? (
        <div className = "space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-end">
            <div className="space-y-3">
              <Skeleton height="40px" width="320px" />
              <Skeleton height="20px" width="240px" />
            </div>
            <Skeleton height="20px" width="80px" />
          </div>
          {/* Stats Skeleton */}
          <SkeletonStats count={4} />
          {/* Signal Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonSignalCard key={i} />
            ))}
            </div>
        </div> 

      ) : error ? (
        <div className="glass p-8 text-center text-trade-red">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {symbols.map((symbol) => {
            const signal = signalData[symbol];
            if (!signal) return null;
            const styles = getSignalStyles(signal.action);
            
            return (
              <div key={symbol} className="glass glass-hover p-6 animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary font-mono tracking-tight">
                      {symbol}
                    </h3>
                    <p className="text-text-secondary text-sm mt-1 font-mono">
                      ${signal.price.toFixed(symbol === 'BTCUSD' ? 2 : 5)}
                    </p>
                  </div>
                  <span className={styles.badge}>
                    <span>{styles.icon}</span>
                    {signal.action}
                  </span>
                </div>

                {/* Confidence */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-tertiary">Confidence</span>
                    <span className={`font-bold font-mono ${styles.text}`}>
                      {Math.round(signal.confidence * 100)}%
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className={`progress-fill ${styles.progress}`}
                      style={{ width: `${signal.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reasons */}
                {signal.reasons && signal.reasons.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-trade-border/50">
                    {signal.reasons.slice(0, 3).map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className={`${styles.text} mt-0.5`}>▸</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;