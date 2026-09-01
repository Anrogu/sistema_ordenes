import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../api/AuthContext';
import { CornerMarks } from '../components/ui/CornerMarks';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await api.post('/auth/login', params);
      login(response.data.rol);
      navigate('/tablero');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error de red al conectar con el servidor.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-6 py-12">
      <div className="relative w-full max-w-sm border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-10">
        <CornerMarks />

        <div className="mb-10 mt-4 flex items-start gap-3">
          <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0" aria-hidden="true">
            {/* Silueta de inserto pentagonal de torneado, con el barreno central de sujeción */}
            <polygon
              points="12,3 20.56,9.22 17.29,19.28 6.71,19.28 3.44,9.22"
              fill="white"
              stroke="#1C1F24"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.6" fill="#E0972B" />
          </svg>
          <span className="mt-2 font-['Oswald',sans-serif] text-base font-semibold uppercase tracking-wide text-[#1C1F24]">
            Metalmod Core
          </span>
        </div>

        <h1 className="font-['Oswald',sans-serif] text-2xl font-semibold uppercase tracking-wide text-[#1C1F24]">
          Control de producción
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Acceso restringido a personal autorizado. Usa las credenciales que te asignó el área de sistemas.
        </p>

        {error && (
          <div role="alert" className="mt-6 border-l-4 border-[#C1272D] bg-red-50 p-3 text-sm text-[#C1272D]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="username" className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full border border-slate-300 bg-white p-2.5 text-sm font-mono text-[#1C1F24] focus:border-[#E0972B] focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full border border-slate-300 bg-white p-2.5 text-sm font-mono text-[#1C1F24] focus:border-[#E0972B] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 bg-[#1C1F24] py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#E0972B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400">
          ¿No puedes entrar? Las cuentas se crean y restablecen desde el área de sistemas — no hay registro de autoservicio.
        </p>
      </div>
    </div>
  );
}
