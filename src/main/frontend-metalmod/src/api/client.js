import axios from 'axios';

// En dev, si no hay VITE_API_URL, usamos el mismo host desde el que se
// cargó la página (window.location.hostname) en vez de "localhost" fijo.
// Así funciona igual si entras desde tu propia máquina (localhost) o desde
// otro dispositivo en la misma red (ej. celular en http://192.168.1.X:5173)
// — con "localhost" fijo, el celular intentaría conectarse a sí mismo.
const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${apiHost}:8080/api`,
  withCredentials: true, // envía la cookie de sesión si el backend usa sesiones
});

// Cualquier 401 en cualquier request cae aquí una sola vez, en vez de
// repetir el mismo catch en cada componente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Deja que quien llame decida qué limpiar (ver useAuth), pero
      // garantiza la redirección incluso si el componente no lo maneja.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
