import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LineChart, FlaskConical, Bot, BookOpen, TrendingUp, LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/strategies', label: 'Strategies', icon: TrendingUp },
    { path: '/chart', label: 'Charts', icon: LineChart },
    { path: '/backtest', label: 'Backtest', icon: FlaskConical },
    { path: '/trading', label: 'Trading', icon: Bot },
    { path: '/learn', label: 'Learn', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-trade-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-trade-border/50 backdrop-blur-xl bg-trade-bg/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-white text-lg shadow-glow-blue transition-transform group-hover:scale-105">
                  T
                </div>
                <span className="text-lg font-bold text-text-primary tracking-tight hidden sm:block">
                  TradeForge
                </span>
              </Link>

              {isAuthenticated && (
                <div className="hidden lg:flex items-center gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-trade-blue/10 text-trade-blue shadow-glow-blue'
                            : 'text-text-secondary hover:text-text-primary hover:bg-trade-card'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-glow-blue">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-text-primary text-sm font-medium">
                      {user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-trade-red bg-trade-red/10 rounded-lg hover:bg-trade-red/20 transition-all border border-trade-red/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-ghost">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;