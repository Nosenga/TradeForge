import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-trade-bg">
      {/* Navbar */}
      <nav className="bg-trade-card border-b border-trade-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-white">
              TradeForge
            </Link>
            {isAuthenticated && (
              <div className="flex space-x-6">
                <Link to="/" className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link to="/strategies" className="text-gray-300 hover:text-white transition">Strategies</Link>
                <Link to="/chart" className="text-gray-300 hover:text-white transition">Chart</Link>
                <Link to="/learn" className="text-gray-300 hover:text-white transition">Learn</Link>
                <Link to="/backtest" className="text-gray-300 hover:text-white transition">Backtest</Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;