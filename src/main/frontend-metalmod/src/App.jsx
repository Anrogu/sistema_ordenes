import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// -------------------------------------------------------------------------
// Paleta "planta industrial": grafito + acentos de señalización de seguridad
// -------------------------------------------------------------------------
const COLOR_CRITICA = '#C1272D';
const COLOR_ALTA    = '#E0972B';
const COLOR_NORMAL  = '#2E7D46';
const COLOR_BAJA    = '#2B5C8C';
const COLOR_AUTO    = '#8A94A3';

const PRIORIDAD_ESTILO = {
  1: { label: 'Crítica', color: COLOR_CRITICA },
  2: { label: 'Alta',    color: COLOR_ALTA },
  3: { label: 'Normal',  color: COLOR_NORMAL },
  4: { label: 'Baja',    color: COLOR_BAJA },
};

function ChipPrioridad({ prioridad }) {
  const estilo = PRIORIDAD_ESTILO[prioridad];
  if (!estilo) {
    return (
      <span className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-mono uppercase tracking-wider text-slate-500">
        Desconocida
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-2 rounded-sm border px-3 py-1 text-xs font-mono uppercase tracking-wider"
      style={{
        borderColor: estilo.color,
        color: estilo.color,
        backgroundColor: `${estilo.color}14`,
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: estilo.color }} />
      {prioridad} · {estilo.label}
    </span>
  );
}

function CornerMarks() {
  const base = 'absolute h-3 w-3 border-[#8A94A3]/60';
  return (
    <>
      <span className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}

function Panel({ eyebrow, title, tone = 'default', children }) {
  const headerTone =
    tone === 'primary'
      ? 'bg-[#1C1F24] text-white'
      : tone === 'danger'
      ? 'bg-[#C1272D] text-white'
      : 'bg-white text-[#1C1F24] border-b border-slate-200';

  return (
    <div className="relative border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <CornerMarks />
      <div className={`px-4 py-3 ${headerTone}`}>
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
            {eyebrow}
          </div>
        )}
        <div className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide">
          {title}
        </div>
      </div>
      <div className="p-4 flex-grow flex items-center justify-center min-h-[250px]">
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// COMPONENTE LOGIN
// -------------------------------------------------------------------------
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', params);
      const rolDelUsuario = response.data.rol; 
      
      onLoginSuccess(rolDelUsuario);
      navigate('/tablero');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error de red al conectar con el servidor.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] relative">
      <CornerMarks />
      <div className="w-full max-w-sm bg-white p-8 shadow-sm border border-slate-200 relative">
        <h2 className="mb-2 font-['Oswald',sans-serif] text-2xl font-semibold uppercase tracking-wide text-[#1C1F24] text-center">
          Metalmod Core
        </h2>
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Autenticación Requerida
        </p>
        
        {error && (
          <div className="mb-4 border-l-4 border-[#C1272D] bg-red-50 p-3 text-sm text-[#C1272D]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 p-2 text-sm font-mono focus:border-[#E0972B] focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">Clave de Acceso</label>
            <input 
              type="password" 
              className="w-full border border-slate-300 p-2 text-sm font-mono focus:border-[#E0972B] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-[#1C1F24] py-3 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#E0972B] transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// COMPONENTE TABLERO
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// COMPONENTE TABLERO
// -------------------------------------------------------------------------
function Tablero({ userRole }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NUEVO: Estado para el buscador
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/tablero/datos')
      .then((response) => {
        setDatos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          navigate('/login');
        } else {
          setError('Error al obtener datos. Verifica el servidor.');
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/auth/logout');
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  const actualizarPrioridad = async (idOrden, nuevaPrioridad) => {
    try {
      const url = nuevaPrioridad 
        ? `http://localhost:8080/api/ordenes/${idOrden}/prioridad?nivel=${nuevaPrioridad}`
        : `http://localhost:8080/api/ordenes/${idOrden}/prioridad`;

      await axios.put(url);
      const response = await axios.get('http://localhost:8080/api/tablero/datos');
      setDatos(response.data);
    } catch (error) {
      console.error("Error al actualizar la prioridad", error);
      alert("No se pudo actualizar la prioridad. Verifica tus permisos.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#1C1F24]" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            Cargando tablero en tiempo real…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7]">
        <div className="border-l-4 border-[#C1272D] bg-white px-6 py-4 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#C1272D]">Error de conexión</p>
          <p className="mt-1 text-sm text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  const ordenes = datos?.ordenes || [];
// NUEVO: Ordenamiento estricto también para el Top 10
// NUEVO: Generamos el Top 10 dinámicamente desde el catálogo completo
  const top10 = [...ordenes].sort((a, b) => {
    // Regla 1: Ordenar por Prioridad Final
    const prioA = a.prioridadFinal || 99;
    const prioB = b.prioridadFinal || 99;
    if (prioA !== prioB) return prioA - prioB;

    // Regla 2: Desempate. Primero los ajustes manuales de Ventas
    const manualA = a.prioridadVentas != null ? 0 : 1;
    const manualB = b.prioridadVentas != null ? 0 : 1;
    if (manualA !== manualB) return manualA - manualB;

    // Regla 3: Si todo es igual, ordenar por número de orden
    return a.idOrden.localeCompare(b.idOrden);
  }).slice(0, 10);
  // <-- Solo tomamos los primeros 10 elementos

  const countSys = (nivel) => ordenes.filter((o) => o.prioridadSistema === nivel).length;
  const countVen = (nivel) => ordenes.filter((o) => o.prioridadVentas === nivel).length;
  const countVenAuto = () => ordenes.filter((o) => o.prioridadVentas == null).length;
  const countFin = (nivel) => ordenes.filter((o) => o.prioridadFinal === nivel).length;

// NUEVO: Filtro en tiempo real y ORDENAMIENTO automático para el catálogo
  const ordenesFiltradas = ordenes
    .filter(orden => 
      orden.idOrden.toLowerCase().includes(busqueda.toLowerCase()) || 
      (orden.cliente && orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .sort((a, b) => {
      // Regla 1: Ordenar por Prioridad Final (1 Crítica siempre hasta arriba)
      const prioA = a.prioridadFinal || 99;
      const prioB = b.prioridadFinal || 99;
      if (prioA !== prioB) return prioA - prioB;

      // Regla 2: Desempate. Si dos órdenes tienen la misma prioridad, 
      // poner PRIMERO las que Ventas ajustó manualmente.
      const manualA = a.prioridadVentas != null ? 0 : 1;
      const manualB = b.prioridadVentas != null ? 0 : 1;
      if (manualA !== manualB) return manualA - manualB;

      // Regla 3: Si todo es igual, ordenar por número de orden
      return a.idOrden.localeCompare(b.idOrden);
    });
  const chartOptions = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: "'JetBrains Mono', monospace", size: 11 }, color: '#4B5563', boxWidth: 10, padding: 12 } },
      tooltip: { backgroundColor: '#1C1F24', titleFont: { family: "'JetBrains Mono', monospace" }, bodyFont: { family: "'JetBrains Mono', monospace" } },
    },
  };

  const dataSistema = {
    labels: ['Crítica', 'Alta', 'Normal', 'Baja'],
    datasets: [{ data: [countSys(1), countSys(2), countSys(3), countSys(4)], backgroundColor: [COLOR_CRITICA, COLOR_ALTA, COLOR_NORMAL, COLOR_BAJA], borderWidth: 0 }],
  };
  const dataVentas = {
    labels: ['Crítica', 'Alta', 'Normal', 'Baja', 'Auto'],
    datasets: [{ data: [countVen(1), countVen(2), countVen(3), countVen(4), countVenAuto()], backgroundColor: [COLOR_CRITICA, COLOR_ALTA, COLOR_NORMAL, COLOR_BAJA, COLOR_AUTO], borderWidth: 0 }],
  };
  const dataFinal = {
    labels: ['Crítica', 'Alta', 'Normal', 'Baja'],
    datasets: [{ data: [countFin(1), countFin(2), countFin(3), countFin(4)], backgroundColor: [COLOR_CRITICA, COLOR_ALTA, COLOR_NORMAL, COLOR_BAJA], borderWidth: 0 }],
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="border-b-4 border-[#E0972B] bg-[#1C1F24]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A94A3]">
              Metalmod · Área de Control de Ventas
            </p>
            <h1 className="font-['Oswald',sans-serif] text-2xl font-semibold uppercase tracking-wide text-white">
              Tablero de Produccion
            </h1>
          </div>
          <div className="hidden items-center gap-4 font-mono text-xs uppercase tracking-wider text-[#8A94A3] sm:flex">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2E7D46]" />
              En línea
            </div>
            <button onClick={handleLogout} className="border border-slate-600 px-3 py-1 text-[#8A94A3] hover:text-white hover:border-[#C1272D] transition-colors">
              SALIR
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Gráficas */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Panel eyebrow="Vista 01" title="Perspectiva del Sistema">
            <Doughnut data={dataSistema} options={chartOptions} />
          </Panel>
          <Panel eyebrow="Vista 02" title="Perspectiva de Ventas">
            <Doughnut data={dataVentas} options={chartOptions} />
          </Panel>
          <Panel eyebrow="Vista 03 · Definitiva" title="Realidad Operativa (Final)" tone="primary">
            <Doughnut data={dataFinal} options={chartOptions} />
          </Panel>
        </section>

        {/* TOP 10 */}
        <section className="relative border border-slate-200 bg-white shadow-sm mb-8">
          <CornerMarks />
          <div className="flex items-center justify-between border-b border-[#C1272D]/30 bg-[#C1272D] px-4 py-3">
            <span className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide text-white">
              Top 10 · Órdenes de Máxima Prioridad
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2 text-left">Orden</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Fecha prometida</th>
                  <th className="px-4 py-2 text-left">Ajuste Ventas</th>
                  <th className="px-4 py-2 text-left">Prioridad (Final)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10.map((orden) => (
                  <tr key={orden.idOrden} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-[#1C1F24]">{orden.idOrden}</td>
                    <td className="px-4 py-3 text-slate-700">{orden.cliente?.nombre}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{orden.fechaEntregaPrometida}</td>
                    <td className="px-4 py-3">
                      {userRole === 'ROLE_VENTAS' ? (
                        <select 
                          className="border border-slate-300 bg-white font-mono text-xs text-slate-700 px-2 py-1 focus:outline-none focus:border-[#E0972B] rounded-sm cursor-pointer"
                          value={orden.prioridadVentas || ''}
                          onChange={(e) => actualizarPrioridad(orden.idOrden, e.target.value)}
                        >
                          <option value="">AUTO</option>
                          <option value="1">1 - CRÍTICA</option>
                          <option value="2">2 - ALTA</option>
                          <option value="3">3 - NORMAL</option>
                          <option value="4">4 - BAJA</option>
                        </select>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{orden.prioridadVentas ? `${orden.prioridadVentas} (Manual)` : 'Auto'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><ChipPrioridad prioridad={orden.prioridadFinal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* NUEVO: CATÁLOGO GENERAL CON BUSCADOR */}
        <section className="relative border border-slate-200 bg-white shadow-sm">
          <CornerMarks />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 bg-[#1C1F24] px-4 py-3 gap-4">
            <div>
               <span className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide text-white">Catálogo General de Órdenes</span>
               <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A94A3]">{ordenesFiltradas.length} registros</span>
            </div>
            <input 
              type="text" 
              placeholder="BUSCAR ORDEN O CLIENTE..." 
              className="w-full sm:w-72 bg-[#2A2E35] border border-slate-600 px-3 py-1.5 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-[#E0972B] rounded-sm transition-colors"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-50 shadow-sm">
                <tr className="border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2 text-left">Orden</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Fecha prometida</th>
                  <th className="px-4 py-2 text-left">Ajuste Ventas</th>
                  <th className="px-4 py-2 text-left">Prioridad (Final)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-mono text-xs">No se encontraron resultados</td>
                  </tr>
                ) : (
                  ordenesFiltradas.map((orden) => (
                    <tr key={orden.idOrden} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-[#1C1F24]">{orden.idOrden}</td>
                      <td className="px-4 py-3 text-slate-700">{orden.cliente?.nombre}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{orden.fechaEntregaPrometida}</td>
                      <td className="px-4 py-3">
                        {userRole === 'ROLE_VENTAS' ? (
                          <select 
                            className="border border-slate-300 bg-white font-mono text-xs text-slate-700 px-2 py-1 focus:outline-none focus:border-[#E0972B] rounded-sm cursor-pointer"
                            value={orden.prioridadVentas || ''}
                            onChange={(e) => actualizarPrioridad(orden.idOrden, e.target.value)}
                          >
                            <option value="">AUTO</option>
                            <option value="1">1 - CRÍTICA</option>
                            <option value="2">2 - ALTA</option>
                            <option value="3">3 - NORMAL</option>
                            <option value="4">4 - BAJA</option>
                          </select>
                        ) : (
                          <span className="font-mono text-xs text-slate-500">{orden.prioridadVentas ? `${orden.prioridadVentas} (Manual)` : 'Auto'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><ChipPrioridad prioridad={orden.prioridadFinal} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
// -------------------------------------------------------------------------
// ENRUTADOR PRINCIPAL
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// ENRUTADOR PRINCIPAL
// -------------------------------------------------------------------------
export default function App() {
  // Al cargar, React buscará el rol en la memoria del navegador. Si no hay, será null.
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  const handleLoginSuccess = (rol) => {
    setUserRole(rol);
    localStorage.setItem('userRole', rol); // Guardamos el rol permanentemente
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/tablero" element={<Tablero userRole={userRole} />} />
      </Routes>
    </BrowserRouter>
  );
}
