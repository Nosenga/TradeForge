import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboard as dashboardApi, marketOverview, marketStatus, news as newsApi } from '../api/client';
import { Skeleton, SkeletonStats } from '../components/Skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Bot as BotIcon, 
  Activity, 
  DollarSign, 
  Target,
  RefreshCw,
  Newspaper,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Position {
  position_id: string;
  symbol: string;
  action: string;
  lots: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  status: string;
}

interface Bot {
  bot_id: number;
  symbol: string;
  timeframe: string;
  status: string;
}

interface Order {
  order_id: string;
  symbol: string;
  action: string;
  lot_size: number;
  status: string;
  filled_price: number;
  created_at: string;
}

interface DashboardData {
  portfolio: {
    total_pnl: number;
    open_positions: number;
    active_bots: number;
    total_trades: number;
    win_rate: number;
    balance: number;
  };
  positions: Position[];
  bots: Bot[];
  orders: Order[];
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  timestamp: string;
  signal: {
    action: string;
    confidence: number;
    reasons: string[];
  };
}

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [marketStatusData, setMarketStatusData] = useState<any>(null);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [dashResponse, marketResponse, statusResponse, newsResponse] = await Promise.all([
        dashboardApi.getSummary(),
        marketOverview.get(),
        marketStatus.get(),
        newsApi.get()
      ]);
      
      setData(dashResponse.data);
      setMarketData(marketResponse.data.markets || []);
      setMarketStatusData(statusResponse.data);
      setNewsData(newsResponse.data.news || []);
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to load dashboard';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData(false);
    toast.success('Refreshing...');
  };

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(value).toFixed(2)}`;
  };

  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <Skeleton height="40px" width="320px" />
            <Skeleton height="20px" width="240px" />
          </div>
          <Skeleton height="32px" width="120px" />
        </div>
        <SkeletonStats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-trade-red mb-4">{error}</p>
        <button onClick={handleManualRefresh} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { portfolio, positions, bots, orders } = data;

  return (
    <div className="space-y-6 content-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="text-text-secondary">
            Your trading overview
            {lastUpdated && (
              <span className="text-text-tertiary text-xs ml-2">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn-ghost text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
          
          {marketStatusData && (
            <div className="flex items-center gap-2 text-sm">
              <span className={marketStatusData.forex_open ? 'status-dot-green' : 'status-dot-yellow'}></span>
              <span className={marketStatusData.forex_open ? 'text-trade-green' : 'text-trade-yellow'}>
                {marketStatusData.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PORTFOLIO OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="stat-label">Total P&L</span>
          </div>
          <p className={`stat-value ${portfolio.total_pnl >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
            {formatCurrency(portfolio.total_pnl)}
          </p>
        </div>

        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <Activity className="w-4 h-4" />
            <span className="stat-label">Open Positions</span>
          </div>
          <p className="stat-value">{portfolio.open_positions}</p>
        </div>

        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <Target className="w-4 h-4" />
            <span className="stat-label">Win Rate</span>
          </div>
          <p className="stat-value">
            {portfolio.win_rate.toFixed(0)}%
          </p>
        </div>

        <div className="glass glass-hover p-5">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-2">
            <BotIcon className="w-4 h-4" />
            <span className="stat-label">Active Bots</span>
          </div>
          <p className="stat-value">{portfolio.active_bots}</p>
        </div>
      </div>

      {/* LIVE MARKET OVERVIEW */}
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-trade-blue" />
            Live Markets
          </h2>
          <Link to="/chart" className="text-xs text-trade-blue hover:text-trade-purple transition">
            Open chart →
          </Link>
        </div>

        {marketData.length === 0 ? (
          <p className="text-text-tertiary text-center py-6 text-sm">
            Loading market data...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketData.map((market) => {
              const isUp = market.change >= 0;
              const signalStyles = 
                market.signal.action === 'BUY' 
                  ? { badge: 'badge-green', text: 'text-trade-green', icon: '▲' }
                  : market.signal.action === 'SELL'
                  ? { badge: 'badge-red', text: 'text-trade-red', icon: '▼' }
                  : { badge: 'badge-yellow', text: 'text-trade-yellow', icon: '●' };

              return (
                <div key={market.symbol} className="bg-trade-bg/50 rounded-lg p-4 border border-trade-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-text-primary font-mono font-bold text-lg">
                        {market.symbol}
                      </h3>
                      <p className="text-text-tertiary text-xs font-mono">
                        {new Date(market.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={signalStyles.badge}>
                      <span>{signalStyles.icon}</span>
                      {market.signal.action}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-text-primary text-xl font-mono font-bold">
                      ${market.price.toFixed(market.symbol === 'BTCUSD' ? 2 : 5)}
                    </span>
                    <span className={`text-sm font-mono font-medium ${
                      isUp ? 'text-trade-green' : 'text-trade-red'
                    }`}>
                      {isUp ? '▲' : '▼'} {Math.abs(market.change_pct).toFixed(2)}%
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Confidence</span>
                      <span className={`font-mono font-medium ${signalStyles.text}`}>
                        {Math.round(market.signal.confidence * 100)}%
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-fill ${
                          market.signal.action === 'BUY' ? 'progress-green' :
                          market.signal.action === 'SELL' ? 'progress-red' :
                          'progress-blue'
                        }`}
                        style={{ width: `${market.signal.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTS + POSITIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <BotIcon className="w-5 h-5 text-trade-blue" />
              Your Bots
            </h2>
            <Link to="/trading" className="text-xs text-trade-blue hover:text-trade-purple transition">
              Manage →
            </Link>
          </div>
          
          {bots.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-tertiary text-sm mb-3">No bots yet</p>
              <Link to="/trading" className="btn-primary text-xs inline-flex">
                Create your first bot
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bots.slice(0, 4).map((bot) => (
                <div key={bot.bot_id} className="flex items-center justify-between p-3 bg-trade-bg/50 rounded-lg border border-trade-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      bot.status === 'RUNNING' ? 'bg-trade-green shadow-glow-green' : 'bg-text-tertiary'
                    }`}></div>
                    <div>
                      <p className="text-text-primary text-sm font-medium">Bot #{bot.bot_id}</p>
                      <p className="text-text-tertiary text-xs font-mono">{bot.symbol} · {bot.timeframe}</p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${
                    bot.status === 'RUNNING' ? 'badge-green' : 'badge-blue'
                  }`}>
                    {bot.status}
                  </span>
                </div>
              ))}
              {bots.length > 4 && (
                <p className="text-text-tertiary text-xs text-center pt-2">
                  +{bots.length - 4} more
                </p>
              )}
            </div>
          )}
        </div>

        <div className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-trade-blue" />
              Open Positions
            </h2>
            <Link to="/trading" className="text-xs text-trade-blue hover:text-trade-purple transition">
              View all →
            </Link>
          </div>
          
          {positions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-tertiary text-sm">No open positions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.slice(0, 4).map((pos) => (
                <div key={pos.position_id} className="flex items-center justify-between p-3 bg-trade-bg/50 rounded-lg border border-trade-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${
                      pos.action === 'BUY' ? 'bg-trade-green/10' : 'bg-trade-red/10'
                    }`}>
                      {pos.action === 'BUY' 
                        ? <ArrowUpRight className="w-4 h-4 text-trade-green" />
                        : <ArrowDownRight className="w-4 h-4 text-trade-red" />
                      }
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-mono font-medium">{pos.symbol}</p>
                      <p className="text-text-tertiary text-xs font-mono">
                        {pos.lots} lots @ {pos.entry_price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-medium ${
                      pos.pnl >= 0 ? 'text-trade-green' : 'text-trade-red'
                    }`}>
                      {formatCurrency(pos.pnl)}
                    </p>
                    <p className="text-text-tertiary text-xs">
                      {pos.current_price}
                    </p>
                  </div>
                </div>
              ))}
              {positions.length > 4 && (
                <p className="text-text-tertiary text-xs text-center pt-2">
                  +{positions.length - 4} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MARKET CONTEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-trade-blue" />
              <h2 className="text-lg font-bold text-text-primary">Market News</h2>
            </div>
            <span className="text-xs text-text-tertiary">Live feed</span>
          </div>
          
          {newsData.length === 0 ? (
            <p className="text-text-tertiary text-center py-6 text-sm">
              Loading news...
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {newsData.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-trade-bg/50 border border-trade-border hover:border-trade-blue/50 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-text-primary text-sm font-medium mb-1 group-hover:text-trade-blue transition line-clamp-2">
                        {item.headline}
                      </h3>
                      {item.summary && (
                        <p className="text-text-tertiary text-xs line-clamp-2 mb-2">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-trade-blue font-medium">{item.source}</span>
                        <span className="text-text-tertiary">•</span>
                        <span className="text-text-tertiary">
                          {new Date(item.datetime * 1000).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-trade-blue" />
            <h2 className="text-lg font-bold text-text-primary">Market Sessions</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Sydney', flag: '🇦🇺', openUTC: 21, closeUTC: 6 },
              { name: 'Tokyo', flag: '🇯🇵', openUTC: 0, closeUTC: 9 },
              { name: 'London', flag: '🇬🇧', openUTC: 7, closeUTC: 16 },
              { name: 'New York', flag: '🇺🇸', openUTC: 12, closeUTC: 21 },
            ].map((session) => {
              const now = new Date();
              const hour = now.getUTCHours();
              const isOpen = session.openUTC < session.closeUTC
                ? hour >= session.openUTC && hour < session.closeUTC
                : hour >= session.openUTC || hour < session.closeUTC;

              return (
                <div key={session.name} className="flex items-center justify-between p-3 bg-trade-bg/50 rounded-lg border border-trade-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{session.flag}</span>
                    <div>
                      <p className="text-text-primary text-sm font-medium">{session.name}</p>
                      <p className="text-text-tertiary text-xs font-mono">
                        {String(session.openUTC).padStart(2, '0')}:00 – {String(session.closeUTC).padStart(2, '0')}:00 UTC
                      </p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${isOpen ? 'badge-green' : 'badge-red'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT TRADES */}
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-trade-blue" />
            Recent Activity
          </h2>
          <Link to="/trading" className="text-xs text-trade-blue hover:text-trade-purple transition">
            Full history →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-text-tertiary text-center py-6 text-sm">
            No recent activity
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-tertiary text-xs uppercase tracking-wider border-b border-trade-border">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-right py-2">Lots</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-b border-trade-border/30">
                    <td className="py-2 text-text-tertiary text-xs font-mono">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2 text-text-primary font-mono">{order.symbol}</td>
                    <td className="py-2">
                      <span className={order.action === 'BUY' ? 'badge-green' : 'badge-red'}>
                        {order.action}
                      </span>
                    </td>
                    <td className="py-2 text-right text-text-secondary font-mono">{order.lot_size}</td>
                    <td className="py-2 text-right text-text-secondary font-mono">
                      {order.filled_price || '-'}
                    </td>
                    <td className="py-2">
                      <span className={`text-xs font-medium ${
                        order.status === 'FILLED' ? 'text-trade-green' : 
                        order.status === 'PENDING' ? 'text-trade-yellow' : 
                        'text-text-tertiary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;