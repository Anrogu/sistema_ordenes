import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../api/AuthContext';
import { useDebounce } from '../utils/useDebounce';
import { compararPorPrioridad, filtrarOrdenes } from '../utils/ordenamiento';
import { Panel } from '../components/ui/Panel';
import { CornerMarks } from '../components/ui/CornerMarks';
import { GraficaDispersion } from '../components/ui/GraficaDispersion';
import { TablaOrdenes } from '../components/ui/TablaOrdenes';

export function Tablero() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [avisoAccion, setAvisoAccion] = useState(null); // reemplaza el alert() bloqueante

  const { userRole, logout } = useAuth();
  const navigate = useNavigate();
  const busquedaDebounced = useDebounce(busqueda, 250);

  const cargarDatos = useCallback((signal) => {
    return api
      .get('/tablero/datos', { signal })
      .then((response) => {
        setDatos(response.data);
        setError(null);
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return; // request cancelada al desmontar, no es un error real
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Error al obtener datos. Verifica el servidor.');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    cargarDatos(controller.signal);
    return () => controller.abort(); // evita setState en un componente ya desmontado
  }, [cargarDatos]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const actualizarPrioridad = async (idOrden, nuevaPrioridad) => {
    try {
      // El backend espera "nivel" como @RequestParam, no como body JSON.
      // Con axios `params`, si el valor es undefined el param se omite del
      // todo (equivalente a required = false -> modo automático).
      await api.put(`/ordenes/${idOrden}/prioridad`, null, {
        params: { nivel: nuevaPrioridad || undefined },
      });
      await cargarDatos();
      setAvisoAccion(null);
    } catch (err) {
      setAvisoAccion(`No se pudo actualizar la prioridad de ${idOrden}. Verifica tus permisos.`);
    }
  };

  const ordenes = datos?.ordenes || [];

  // useMemo evita re-ordenar/filtrar en cada render que no dependa de
  // `ordenes` o de la búsqueda (por ejemplo, al escribir sin que cambien los datos).
  const ordenesOrdenadas = useMemo(() => [...ordenes].sort(compararPorPrioridad), [ordenes]);
  const top10 = useMemo(() => ordenesOrdenadas.slice(0, 10), [ordenesOrdenadas]);
  const ordenesFiltradas = useMemo(
    () => filtrarOrdenes(ordenesOrdenadas, busquedaDebounced),
    [ordenesOrdenadas, busquedaDebounced]
  );

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
            <button
              onClick={handleLogout}
              className="border border-slate-600 px-3 py-1 text-[#8A94A3] hover:text-white hover:border-[#C1272D] transition-colors"
            >
              SALIR
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {avisoAccion && (
          <div role="alert" className="mb-6 border-l-4 border-[#C1272D] bg-red-50 px-4 py-3 text-sm text-[#C1272D] flex items-center justify-between">
            <span>{avisoAccion}</span>
            <button onClick={() => setAvisoAccion(null)} className="font-mono text-xs underline">
              Cerrar
            </button>
          </div>
        )}

        <section className="mb-8">
          <Panel eyebrow="Vista general" title="Urgencia por Fecha de Entrega" tone="primary">
            <div className="w-full">
              <GraficaDispersion ordenes={ordenes} />
            </div>
          </Panel>
        </section>

        <section className="relative border border-slate-200 bg-white shadow-sm mb-8">
          <CornerMarks />
          <div className="flex items-center justify-between border-b border-[#C1272D]/30 bg-[#C1272D] px-4 py-3">
            <span className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide text-white">
              Top 10 · Órdenes de Máxima Prioridad
            </span>
          </div>
          <div className="overflow-x-auto">
            <TablaOrdenes
              ordenes={top10}
              userRole={userRole}
              onCambiarPrioridad={actualizarPrioridad}
              mensajeVacio="No hay órdenes registradas"
            />
          </div>
        </section>

        <section className="relative border border-slate-200 bg-white shadow-sm">
          <CornerMarks />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 bg-[#1C1F24] px-4 py-3 gap-4">
            <div>
              <span className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide text-white">
                Catálogo General de Órdenes
              </span>
              <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A94A3]">
                {ordenesFiltradas.length} registros
              </span>
            </div>
            <input
              type="text"
              aria-label="Buscar orden o cliente"
              placeholder="BUSCAR ORDEN O CLIENTE..."
              className="w-full sm:w-72 bg-[#2A2E35] border border-slate-600 px-3 py-1.5 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-[#E0972B] rounded-sm transition-colors"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <TablaOrdenes
              ordenes={ordenesFiltradas}
              userRole={userRole}
              onCambiarPrioridad={actualizarPrioridad}
              mensajeVacio="No se encontraron resultados"
              sticky
            />
          </div>
        </section>
      </main>
    </div>
  );
}
