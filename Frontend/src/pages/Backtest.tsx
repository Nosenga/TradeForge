import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import api from '../api/client';

interface BacktestResult {
  strategy_id: number;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_balance: number;
  final_balance: number;
  total_return: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  total_profit: number;
  total_loss: number;
  trades: any[];
  equity_curve: any[];
}

interface Strategy {
  id: number;
  name: string;
  description: string;
  timeframe: string;
}

const Backtest: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<number>(1);
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/api/v1/strategies');
      setStrategies(response.data || []);
    } catch (err) {
      console.error('Error fetching strategies:', err);
    }
  };

  const runBacktest = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/v1/backtest', {
        strategy_id: selectedStrategy,
        symbol,
        timeframe,
        start_date: startDate,
        end_date: endDate,
        initial_balance: initialBalance
      });
      console.log('Backtest Response:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('Backtest Error:', err);
      // ✅ Handle validation errors properly
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const messages = detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
          setError(`Validation Error: ${messages}`);
        } else {
          setError(detail);
        }
      } else {
        setError(err.message || 'Failed to run backtest');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (result && 'error' in result) {
    return (
      <div className="p-6 bg-trade-card rounded-xl border border-red-500">
        <p className="text-red-500">Error: {(result as any).error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 content-fade-in">
      <h1 className="text-2xl font-bold text-white">Backtesting</h1>

      {/* Configuration */}
      <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
        <h2 className="text-white font-semibold mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Strategy</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(Number(e.target.value))}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="BTCUSD">BTCUSD</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Initial Balance</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              className="w-full bg-trade-bg border border-trade-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Running Backtest...' : 'Run Backtest'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
              <p className="text-gray-400 text-sm">Final Balance</p>
              <p className={`text-2xl font-bold ${result.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(result.final_balance)}
              </p>
            </div>
            <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
              <p className="text-gray-400 text-sm">Total Return</p>
              <p className={`text-2xl font-bold ${result.total_return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.total_return.toFixed(2)}%
              </p>
            </div>
            <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {result.win_rate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
              <p className="text-gray-400 text-sm">Profit Factor</p>
              <p className="text-2xl font-bold text-white">
                {result.profit_factor.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Equity Curve */}
          {result.equity_curve && result.equity_curve.length > 0 && (
            <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
              <h3 className="text-white font-semibold mb-4">Equity Curve</h3>
              <div className="h-64 relative">
                <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end gap-0.5">
                  {(() => {
                    const points = result.equity_curve || [];
                    const maxBalance = Math.max(...points.map((p: any) => p.balance));
                    const minBalance = Math.min(...points.map((p: any) => p.balance));
                    const range = maxBalance - minBalance || 1;
                    
                    return points.map((point: any, index: number) => {
                      const height = ((point.balance - minBalance) / range) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500/50 hover:bg-blue-500 transition"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${point.timestamp}: ${formatCurrency(point.balance)}`}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Trade History */}
          {result.trades && result.trades.filter((t: any) => t.action === 'CLOSE').length > 0 && (
            <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
              <h3 className="text-white font-semibold mb-4">Trade History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-trade-border">
                      <th className="text-left py-2">Entry Time</th>
                      <th className="text-left py-2">Action</th>
                      <th className="text-right py-2">Entry</th>
                      <th className="text-right py-2">Exit</th>
                      <th className="text-right py-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.filter((t: any) => t.action === 'CLOSE').slice(-20).reverse().map((trade: any, index: number) => (
                      <tr key={index} className="border-b border-trade-border/50">
                        <td className="py-2 text-gray-300">{new Date(trade.entry_time).toLocaleDateString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.pnl >= 0 ? 'WIN' : 'LOSS'}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-300">{trade.entry_price.toFixed(5)}</td>
                        <td className="py-2 text-right text-gray-300">{trade.exit_price.toFixed(5)}</td>
                        <td className={`py-2 text-right font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(trade.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Backtest;