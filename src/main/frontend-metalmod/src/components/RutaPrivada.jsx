import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

// Antes /tablero no verificaba sesión en el cliente: si alguien entraba
// directo por URL sin userRole, dependía de que el 401 del backend
// disparara la redirección tras el primer fetch fallido. Esto la hace
// inmediata y evita el parpadeo de contenido protegido.
export function RutaPrivada({ children }) {
  const { userRole } = useAuth();
  if (!userRole) return <Navigate to="/login" replace />;
  return children;
}

RutaPrivada.propTypes = {
  children: PropTypes.node.isRequired,
};
