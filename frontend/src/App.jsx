import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AgentPage from './pages/AgentPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ItemsPage from './pages/ItemsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  const { token } = useAuth();

  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
