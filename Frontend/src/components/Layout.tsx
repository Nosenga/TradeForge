import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  LineChart, 
  FlaskConical, 
  Bot, 
  BookOpen, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import Footer from './Footer';
import Logo from './Logo';
import MarketBackdrop from './MarketBackdrop';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-trade-bg">
      <MarketBackdrop variant="ambient" />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-trade-border/50 backdrop-blur-xl bg-trade-bg/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo + Desktop Nav */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link to="/" className="flex items-center">
                <Logo size="md" />
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

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3">
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
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-ghost">Login</Link>
                  <Link to="/register" className="btn-primary">Register</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-text-primary hover:bg-trade-card rounded-lg transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden border-t border-trade-border/50 bg-trade-bg/95 backdrop-blur-xl animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-trade-blue/10 text-trade-blue'
                        : 'text-text-secondary hover:text-text-primary hover:bg-trade-card'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-trade-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-text-primary text-sm font-medium">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-trade-red bg-trade-red/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default Layout;