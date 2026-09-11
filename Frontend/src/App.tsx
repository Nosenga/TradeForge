import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import Chart from './pages/Chart';
import Backtest from './pages/Backtest';
import Trading from './pages/Trading';
import Learn from './pages/Learn';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ✅ Add Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121a',
              color: '#f8fafc',
              border: '1px solid #1f1f2e',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: { primary: '#00e676', secondary: '#0b0b0c' },
              style: {
                background: '#12121a',
                border: '1px solid rgba(0, 230, 118, 0.3)',
              },
            },
            error: {
              iconTheme: { primary: '#ff3d57', secondary: '#0b0b0c' },
              style: {
                background: '#12121a',
                border: '1px solid rgba(255, 61, 87, 0.3)',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/strategies" element={<ProtectedRoute><Strategies /></ProtectedRoute>} />
            <Route path="/chart" element={<ProtectedRoute><Chart /></ProtectedRoute>} />
            <Route path="/backtest" element={<ProtectedRoute><Backtest /></ProtectedRoute>} />
            <Route path="/trading" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;