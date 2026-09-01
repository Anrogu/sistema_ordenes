import { createContext, useContext, useState, useCallback } from 'react';
import api from './client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  const login = useCallback((rol) => {
    localStorage.setItem('userRole', rol);
    setUserRole(rol);
  }, []);

  // Antes: handleLogout borraba localStorage pero no el estado de React,
  // así que la UI podía seguir "logueada" en memoria. Ahora un solo punto
  // limpia ambos siempre, incluso si la llamada al backend falla.
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor', err);
    } finally {
      localStorage.removeItem('userRole');
      setUserRole(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
