import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, PointElement, LinearScale, Tooltip, Legend } from 'chart.js';
import { AuthProvider } from './api/AuthContext';
import { Login } from './pages/Login';
import { Tablero } from './pages/Tablero';
import { RutaPrivada } from './components/RutaPrivada';

ChartJS.register(ArcElement, PointElement, LinearScale, Tooltip, Legend);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tablero"
            element={
              <RutaPrivada>
                <Tablero />
              </RutaPrivada>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
