import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import Chart from './pages/Chart';
import Learn from './pages/Learn';
import Backtest from './pages/Backtest';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/strategies" element={
              <ProtectedRoute>
                <Strategies />
              </ProtectedRoute>
            } />
            <Route path="/chart" element={
              <ProtectedRoute>
                <Chart />
              </ProtectedRoute>
            } />
            <Route path='/learn' element = {
              <ProtectedRoute>
                <Learn />  
              </ProtectedRoute>
            }/>
            <Route path='/backtest' element = {
              <ProtectedRoute>
                <Backtest />  
              </ProtectedRoute>
            }/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;