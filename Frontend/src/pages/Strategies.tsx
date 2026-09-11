import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PlayCircle,
  Eye,
  Clock,
  Trophy,
  Target
} from 'lucide-react';
import api from '../api/client';
import { SkeletonStats, SkeletonStrategyCard } from '../components/Skeleton';

interface Strategy {
  id: number;
  name: string;
  description: string;
  timeframe: string;
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  is_active: boolean;
  entry_rules: any;
  exit_rules: any;
  risk_rules: any;
  indicators: string[];
}

const Strategies: React.FC = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch strategies from backend
      const response = await api.get('/api/v1/strategies');
      setStrategies(response.data || []);
    } catch (err: any) {
      console.error('Error fetching strategies:', err);
      // If no strategies exist yet, use mock data
      setStrategies(getMockStrategies());
    } finally {
      setLoading(false);
    }
  };

  const getMockStrategies = (): Strategy[] => {
    return [
      {
        id: 1,
        name: 'RSI Oversold/Overbought',
        description: 'Buy when RSI drops below 30 (oversold), sell when RSI rises above 70 (overbought).',
        timeframe: '1h',
        win_rate: 62.5,
        total_trades: 87,
        profit_factor: 1.45,
        is_active: true,
        entry_rules: { indicator: 'RSI', period: 14, condition: '<', value: 30 },
        exit_rules: { indicator: 'RSI', period: 14, condition: '>', value: 70 },
        risk_rules: { stop_loss: 1.0, take_profit: 2.0, lot_size: 0.01 },
        indicators: ['RSI(14)']
      },
      {
        id: 2,
        name: 'MACD Crossover',
        description: 'Buy when MACD crosses above signal line, sell when MACD crosses below.',
        timeframe: '4h',
        win_rate: 58.3,
        total_trades: 112,
        profit_factor: 1.32,
        is_active: true,
        entry_rules: { indicator: 'MACD', condition: 'crossover' },
        exit_rules: { indicator: 'MACD', condition: 'crossunder' },
        risk_rules: { stop_loss: 1.5, take_profit: 2.5, lot_size: 0.01 },
        indicators: ['MACD(12,26,9)']
      },
      {
        id: 3,
        name: 'Bollinger Bands Breakout',
        description: 'Buy when price touches lower band, sell when price touches upper band.',
        timeframe: '1h',
        win_rate: 55.8,
        total_trades: 95,
        profit_factor: 1.28,
        is_active: true,
        entry_rules: { indicator: 'Bollinger', condition: 'touch_lower' },
        exit_rules: { indicator: 'Bollinger', condition: 'touch_upper' },
        risk_rules: { stop_loss: 1.2, take_profit: 2.0, lot_size: 0.01 },
        indicators: ['BB(20,2)']
      },
      {
        id: 4,
        name: 'SMA Crossover (Golden Cross)',
        description: 'Buy when 50-day SMA crosses above 200-day SMA, sell when it crosses below.',
        timeframe: '1d',
        win_rate: 65.2,
        total_trades: 45,
        profit_factor: 1.78,
        is_active: true,
        entry_rules: { indicator: 'SMA', fast: 50, slow: 200, condition: 'cross_above' },
        exit_rules: { indicator: 'SMA', fast: 50, slow: 200, condition: 'cross_below' },
        risk_rules: { stop_loss: 2.0, take_profit: 4.0, lot_size: 0.01 },
        indicators: ['SMA(50)', 'SMA(200)']
      },
      {
        id: 5,
        name: 'Breakout Strategy',
        description: 'Buy when price breaks above resistance, sell when price breaks below support.',
        timeframe: '4h',
        win_rate: 52.4,
        total_trades: 130,
        profit_factor: 1.15,
        is_active: true,
        entry_rules: { indicator: 'Price', condition: 'breakout' },
        exit_rules: { indicator: 'Price', condition: 'breakdown' },
        risk_rules: { stop_loss: 1.5, take_profit: 2.0, lot_size: 0.01 },
        indicators: ['Support/Resistance']
      }
    ];
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 60) return 'text-green-500';
    if (rate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWinRateBg = (rate: number) => {
    if (rate >= 60) return 'bg-green-500/10 border-green-500/30';
    if (rate >= 50) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const handleViewOnChart = (strategy: Strategy) => {
    navigate('/chart');
  };

  const handleBacktest = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    // TODO: Open backtest modal or navigate to backtest page
    alert(`Backtesting ${strategy.name}...`);
  };


  return (
    <div className="space-y-6 content-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Trading Strategies</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Backtest All
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
          <p className="text-gray-400 text-sm">Total Strategies</p>
          <p className="text-white text-2xl font-bold">{strategies.length}</p>
        </div>
        <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
          <p className="text-gray-400 text-sm">Average Win Rate</p>
          <p className="text-white text-2xl font-bold">
            {strategies.length > 0 
              ? (strategies.reduce((acc, s) => acc + s.win_rate, 0) / strategies.length).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
          <p className="text-gray-400 text-sm">Total Trades</p>
          <p className="text-white text-2xl font-bold">
            {strategies.reduce((acc, s) => acc + s.total_trades, 0)}
          </p>
        </div>
        <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
          <p className="text-gray-400 text-sm">Best Strategy</p>
          <p className="text-white text-lg font-bold truncate">
            {strategies.length > 0 
              ? strategies.reduce((best, s) => s.win_rate > best.win_rate ? s : best).name
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Strategies Grid */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonStats count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStrategyCard key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`bg-trade-card rounded-xl p-6 border ${getWinRateBg(strategy.win_rate)} hover:border-blue-500/50 transition`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {strategy.win_rate >= 60 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : strategy.win_rate >= 50 ? (
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="text-white font-semibold">{strategy.name}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  strategy.is_active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-trade-bg/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Timeframe</span>
                  </div>
                  <p className="text-white text-sm font-medium">{strategy.timeframe}</p>
                </div>
                <div className="bg-trade-bg/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Trophy className="w-3 h-3" />
                    <span>Win Rate</span>
                  </div>
                  <p className={`text-sm font-medium ${getWinRateColor(strategy.win_rate)}`}>
                    {strategy.win_rate}%
                  </p>
                </div>
                <div className="bg-trade-bg/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Target className="w-3 h-3" />
                    <span>Trades</span>
                  </div>
                  <p className="text-white text-sm font-medium">{strategy.total_trades}</p>
                </div>
              </div>

              {/* Indicators */}
              <div className="flex flex-wrap gap-1 mb-4">
                {strategy.indicators.map((indicator, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full"
                  >
                    {indicator}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewOnChart(strategy)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View on Chart
                </button>
                <button
                  onClick={() => handleBacktest(strategy)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-trade-bg border border-trade-border text-gray-300 rounded-lg hover:bg-trade-border transition text-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  Backtest
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Strategies;