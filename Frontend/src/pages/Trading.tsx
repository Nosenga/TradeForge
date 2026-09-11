import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Bot as BotIcon, 
  Play, 
  Square, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Activity,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';
import api, { trading, bots as botApi } from '../api/client';
import { Skeleton, SkeletonStats, SkeletonBotRow, SkeletonTableRow } from '../components/Skeleton';

interface Bot {
  bot_id: number;
  user_id: number;
  strategy_id: number;
  symbol: string;
  timeframe: string;
  lot_size: number;
  risk_percent: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  min_confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Position {
  position_id: string;
  order_id: string;
  symbol: string;
  action: string;
  lots: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  open_time: string;
  status: string;
}

interface Order {
  order_id: string;
  symbol: string;
  action: string;
  lot_size: number;
  status: string;
  entry_price: number;
  filled_price: number;
  created_at: string;
}

const Trading: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [strategiesLoaded, setStrategiesLoaded] = useState(false);

  const [tradeForm, setTradeForm] = useState({
    symbol: 'EURUSD',
    action: 'BUY',
    lot_size: 0.01,
    stop_loss: '',
    take_profit: ''
  });

  const [botForm, setBotForm] = useState({
    strategy_id: 1,
    symbol: 'EURUSD',
    timeframe: '1h',
    lot_size: 0.01,
    risk_percent: 1.0,
    stop_loss_pips: 50,
    take_profit_pips: 100,
    min_confidence: 0.6
  });

  // Load strategies ONCE
  useEffect(() => {
    const loadStrategies = async () => {
      if (strategiesLoaded) return;
      try {
        const res = await api.get('/api/v1/strategies');
        setStrategies(res.data || []);
        setStrategiesLoaded(true);
      } catch (err) {
        console.error('Failed to load strategies:', err);
      }
    };
    loadStrategies();
  }, [strategiesLoaded]);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [botsRes, positionsRes, ordersRes] = await Promise.all([
        botApi.getAll(),
        trading.getPositions(),
        trading.getOrders()
      ]);
      
      setBots(botsRes.data.bots || []);
      setPositions(positionsRes.data.positions || []);
      setOrders(ordersRes.data.orders || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStartBot = async (botId: number) => {
    if (actionLoading) return;
    setActionLoading(`start-${botId}`);
    setBots(prev => prev.map(b => 
      b.bot_id === botId ? { ...b, status: 'RUNNING' } : b
    ));
    try {
      await botApi.start(botId);
      toast.success(`Bot #${botId} started successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to start bot #${botId}`);
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopBot = async (botId: number) => {
    if (actionLoading) return;
    setActionLoading(`stop-${botId}`);
    setBots(prev => prev.map(b => 
      b.bot_id === botId ? { ...b, status: 'STOPPED' } : b
    ));
    try {
      await botApi.stop(botId);
      toast.success(`Bot #${botId} stopped successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to stop bot #${botId}`);
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBot = async (botId: number) => {
    if (actionLoading) return;
    setActionLoading(`delete-${botId}`);
    try {
      await botApi.delete(botId);
      setBots(prev => prev.filter(b => b.bot_id !== botId));
      toast.success(`Bot #${botId} deleted successfully`);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to delete bot #${botId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading('create-bot');
    try {
      const response = await botApi.create(botForm);
      const newBot: Bot = {
        bot_id: response.data.bot_id,
        user_id: 0,
        strategy_id: botForm.strategy_id,
        symbol: botForm.symbol,
        timeframe: botForm.timeframe,
        lot_size: botForm.lot_size,
        risk_percent: botForm.risk_percent,
        stop_loss_pips: botForm.stop_loss_pips,
        take_profit_pips: botForm.take_profit_pips,
        min_confidence: botForm.min_confidence,
        status: 'STOPPED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setBots(prev => [newBot, ...prev]);
      setShowCreateBot(false);
      toast.success(`Bot #${newBot.bot_id} created successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to create bot`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading('place-order');
    try {
      const data: any = {
        symbol: tradeForm.symbol,
        action: tradeForm.action,
        lot_size: parseFloat(tradeForm.lot_size.toString()),
      };
      if (tradeForm.stop_loss) data.stop_loss = parseFloat(tradeForm.stop_loss);
      if (tradeForm.take_profit) data.take_profit = parseFloat(tradeForm.take_profit);
      
      const response = await trading.placeOrder(data);
      toast.success(`${tradeForm.action} ${tradeForm.symbol} order placed @ ${response.data.filled_price}`);
      setTradeForm({ ...tradeForm, stop_loss: '', take_profit: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to place order`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClosePosition = async (positionId: string, symbol: string) => {
    if (!confirm(`Close ${symbol} position at market price?`)) return;
    setActionLoading(`close-${positionId}`);
    try {
      const response = await trading.closePosition(positionId);
      toast.success(`${symbol} closed @ ${response.data.exit_price}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to close position');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Close ALL open positions? This cannot be undone.')) return;
    setActionLoading('cleanup');
    try {
      const response = await trading.cleanup();
      toast.success(`Closed ${response.data.closed} positions`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Cleanup failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
      case 'FILLED': return 'text-trade-green';
      case 'PENDING': return 'text-trade-yellow';
      case 'CANCELLED': return 'text-trade-red';
      case 'OPEN': return 'text-trade-blue';
      default: return 'text-text-tertiary';
    }
  };

  const stats = useMemo(() => {
    const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
    const activeBots = bots.filter(b => b.status === 'RUNNING').length;
    const openPositions = positions.filter(p => p.status === 'OPEN').length;
    return { totalPnl, activeBots, openPositions, totalOrders: orders.length };
  }, [bots, positions, orders]);

  if (loading) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton height="32px" width="150px" />
          <Skeleton height="16px" width="280px" />
        </div>
        <div className="flex gap-3">
          <Skeleton width="100px" height="40px" />
          <Skeleton width="120px" height="40px" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <SkeletonStats count={4} />

      {/* Bots Skeleton */}
      <div className="glass p-6">
        <Skeleton height="24px" width="140px" className="mb-4" />
        <div className="space-y-3">
          <SkeletonBotRow />
          <SkeletonBotRow />
        </div>
      </div>

      {/* Positions Skeleton */}
      <div className="glass p-6">
        <Skeleton height="24px" width="160px" className="mb-4" />
        <table className="w-full">
          <tbody>
            <SkeletonTableRow columns={7} />
            <SkeletonTableRow columns={7} />
            <SkeletonTableRow columns={7} />
          </tbody>
        </table>
      </div>

      {/* Manual Trade Skeleton */}
      <div className="glass p-6">
        <Skeleton height="24px" width="120px" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton height="12px" width="60%" />
              <Skeleton height="40px" width="100%" />
            </div>
          ))}
        </div>
      </div>

      {/* Orders Skeleton */}
      <div className="glass p-6">
        <Skeleton height="24px" width="140px" className="mb-4" />
        <table className="w-full">
          <tbody>
            <SkeletonTableRow columns={6} />
            <SkeletonTableRow columns={6} />
            <SkeletonTableRow columns={6} />
            <SkeletonTableRow columns={6} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6 content-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Trading</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage bots and execute trades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn-ghost"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateBot(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create Bot
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass p-4 border-trade-red/30 flex justify-between items-center animate-fade-in">
          <span className="text-trade-red text-sm">{error}</span>
          <button onClick={() => setError('')} className="text-trade-red hover:text-trade-red/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <BotIcon className="w-4 h-4" />
            <span className="stat-label">Active Bots</span>
          </div>
          <p className="stat-value">{stats.activeBots}</p>
        </div>
        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <Activity className="w-4 h-4" />
            <span className="stat-label">Open Positions</span>
          </div>
          <p className="stat-value">{stats.openPositions}</p>
        </div>
        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="stat-label">Total P&L</span>
          </div>
          <p className={`stat-value ${stats.totalPnl >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
            {formatCurrency(stats.totalPnl)}
          </p>
        </div>
        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="stat-label">Total Orders</span>
          </div>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
      </div>

      {/* Trading Bots */}
      <div className="glass p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <BotIcon className="w-5 h-5 text-trade-blue" />
          Trading Bots
        </h2>
        
        {bots.length === 0 ? (
          <p className="text-text-tertiary text-center py-8">
            No bots yet. Create your first bot to start automated trading.
          </p>
        ) : (
          <div className="space-y-3">
            {bots.map((bot) => (
              <div key={bot.bot_id} className="bg-trade-bg/50 rounded-lg p-4 border border-trade-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      bot.status === 'RUNNING' ? 'bg-trade-green shadow-glow-green' : 'bg-text-tertiary'
                    }`}></div>
                    <div>
                      <h3 className="text-text-primary font-medium">Bot #{bot.bot_id}</h3>
                      <p className="text-text-tertiary text-xs font-mono">
                        {bot.symbol} • {bot.timeframe} • {bot.lot_size} lots
                      </p>
                    </div>
                    <span className={`badge ${
                      bot.status === 'RUNNING' ? 'badge-green' : 'badge-blue'
                    }`}>
                      {bot.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {bot.status === 'RUNNING' ? (
                      <button
                        onClick={() => handleStopBot(bot.bot_id)}
                        disabled={actionLoading === `stop-${bot.bot_id}`}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        <Square className="w-3 h-3" />
                        {actionLoading === `stop-${bot.bot_id}` ? 'Stopping...' : 'Stop'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartBot(bot.bot_id)}
                        disabled={actionLoading === `start-${bot.bot_id}`}
                        className="btn-success text-xs py-1.5 px-3"
                      >
                        <Play className="w-3 h-3" />
                        {actionLoading === `start-${bot.bot_id}` ? 'Starting...' : 'Start'}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(bot.bot_id)}
                      disabled={actionLoading === `delete-${bot.bot_id}`}
                      className="text-trade-red bg-trade-red/10 border border-trade-red/20 rounded-lg text-xs py-1.5 px-3 hover:bg-trade-red/20 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Positions */}
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-trade-blue" />
            Open Positions
          </h2>
          {positions.length > 0 && (
            <button
              onClick={handleCleanup}
              disabled={actionLoading === 'cleanup'}
              className="text-trade-red bg-trade-red/10 border border-trade-red/20 rounded-lg text-xs py-1.5 px-3 hover:bg-trade-red/20 transition disabled:opacity-50"
            >
              {actionLoading === 'cleanup' ? 'Cleaning up...' : 'Close All'}
            </button>
          )}
        </div>
        
        {positions.length === 0 ? (
          <p className="text-text-tertiary text-center py-8">No open positions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wider border-b border-trade-border">
                  <th className="text-left py-3">Symbol</th>
                  <th className="text-left py-3">Action</th>
                  <th className="text-right py-3">Lots</th>
                  <th className="text-right py-3">Entry</th>
                  <th className="text-right py-3">Current</th>
                  <th className="text-right py-3">P&L</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.position_id} className="border-b border-trade-border/50 hover:bg-trade-bg/30 transition">
                    <td className="py-3 text-text-primary font-mono">{pos.symbol}</td>
                    <td className="py-3">
                      <span className={pos.action === 'BUY' ? 'badge-green' : 'badge-red'}>
                        {pos.action}
                      </span>
                    </td>
                    <td className="py-3 text-right text-text-secondary font-mono">{pos.lots}</td>
                    <td className="py-3 text-right text-text-secondary font-mono">{pos.entry_price}</td>
                    <td className="py-3 text-right text-text-secondary font-mono">{pos.current_price}</td>
                    <td className={`py-3 text-right font-mono font-medium ${
                      pos.pnl >= 0 ? 'text-trade-green' : 'text-trade-red'
                    }`}>
                      {formatCurrency(pos.pnl)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleClosePosition(pos.position_id, pos.symbol)}
                        disabled={actionLoading === `close-${pos.position_id}`}
                        className="text-trade-red bg-trade-red/10 border border-trade-red/20 rounded px-3 py-1 text-xs hover:bg-trade-red/20 transition disabled:opacity-50"
                      >
                        {actionLoading === `close-${pos.position_id}` ? 'Closing...' : 'Close'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Trade */}
      <div className="glass p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Manual Trade</h2>
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Symbol</label>
            <select
              value={tradeForm.symbol}
              onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value })}
              className="input"
            >
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="BTCUSD">BTCUSD</option>
            </select>
          </div>
          <div>
            <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Action</label>
            <select
              value={tradeForm.action}
              onChange={(e) => setTradeForm({ ...tradeForm, action: e.target.value })}
              className="input"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Lot Size</label>
            <input
              type="number"
              step="0.01"
              value={tradeForm.lot_size}
              onChange={(e) => setTradeForm({ ...tradeForm, lot_size: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Stop Loss</label>
            <input
              type="number"
              step="0.0001"
              value={tradeForm.stop_loss}
              onChange={(e) => setTradeForm({ ...tradeForm, stop_loss: e.target.value })}
              placeholder="Optional"
              className="input"
            />
          </div>
          <div>
            <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Take Profit</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.0001"
                value={tradeForm.take_profit}
                onChange={(e) => setTradeForm({ ...tradeForm, take_profit: e.target.value })}
                placeholder="Optional"
                className="input"
              />
              <button
                type="submit"
                disabled={actionLoading === 'place-order'}
                className="btn-primary whitespace-nowrap"
              >
                {actionLoading === 'place-order' ? 'Placing...' : 'Place'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Orders */}
      <div className="glass p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <p className="text-text-tertiary text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wider border-b border-trade-border">
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Symbol</th>
                  <th className="text-left py-3">Action</th>
                  <th className="text-right py-3">Lots</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-right py-3">Filled</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.order_id} className="border-b border-trade-border/50 hover:bg-trade-bg/30 transition">
                    <td className="py-3 text-text-tertiary text-xs font-mono">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-text-primary font-mono">{order.symbol}</td>
                    <td className="py-3">
                      <span className={order.action === 'BUY' ? 'badge-green' : 'badge-red'}>
                        {order.action}
                      </span>
                    </td>
                    <td className="py-3 text-right text-text-secondary font-mono">{order.lot_size}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-text-secondary font-mono">
                      {order.filled_price || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Bot Modal */}
      {showCreateBot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Create New Bot</h2>
              <button onClick={() => setShowCreateBot(false)} className="text-text-tertiary hover:text-text-primary transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Strategy</label>
                  <select
                    value={botForm.strategy_id}
                    onChange={(e) => setBotForm({ ...botForm, strategy_id: parseInt(e.target.value) })}
                    className="input"
                  >
                    {strategies.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Symbol</label>
                  <select
                    value={botForm.symbol}
                    onChange={(e) => setBotForm({ ...botForm, symbol: e.target.value })}
                    className="input"
                  >
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="BTCUSD">BTCUSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Timeframe</label>
                  <select
                    value={botForm.timeframe}
                    onChange={(e) => setBotForm({ ...botForm, timeframe: e.target.value })}
                    className="input"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="4h">4 Hours</option>
                    <option value="1d">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Lot Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={botForm.lot_size}
                    onChange={(e) => setBotForm({ ...botForm, lot_size: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Stop Loss (pips)</label>
                  <input
                    type="number"
                    value={botForm.stop_loss_pips}
                    onChange={(e) => setBotForm({ ...botForm, stop_loss_pips: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Take Profit (pips)</label>
                  <input
                    type="number"
                    value={botForm.take_profit_pips}
                    onChange={(e) => setBotForm({ ...botForm, take_profit_pips: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Min Confidence</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={botForm.min_confidence}
                    onChange={(e) => setBotForm({ ...botForm, min_confidence: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-text-tertiary text-xs mb-1.5 uppercase tracking-wider">Risk %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={botForm.risk_percent}
                    onChange={(e) => setBotForm({ ...botForm, risk_percent: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateBot(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create-bot'}
                  className="btn-primary flex-1"
                >
                  {actionLoading === 'create-bot' ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal — MOVED OUTSIDE the bot loop ✅ */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass p-6 max-w-md w-full animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Delete Bot?</h2>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="text-text-tertiary hover:text-text-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete <span className="text-text-primary font-semibold">Bot #{deleteConfirm}</span>?
              This action cannot be undone. Any open positions will remain open.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBot(deleteConfirm)}
                disabled={actionLoading === `delete-${deleteConfirm}`}
                className="btn-danger flex-1"
              >
                <Trash2 className="w-4 h-4" />
                {actionLoading === `delete-${deleteConfirm}` ? 'Deleting...' : 'Delete Bot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trading;