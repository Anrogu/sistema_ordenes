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

const INTERVALO_ACTUALIZACION_MS = 30000; // 30s — ajustable

export function Tablero() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [avisoAccion, setAvisoAccion] = useState(null);

  // ESTADOS MODAL DE EXCEL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // ESTADOS MODAL DE VENTAS (agregar cantidad)
  const [isVentasModalOpen, setIsVentasModalOpen] = useState(false);
  const [partesDisponibles, setPartesDisponibles] = useState([]);
  const [numeroParteSeleccionado, setNumeroParteSeleccionado] = useState('');
  const [cantidadAAgregar, setCantidadAAgregar] = useState('');
  const [agregarStatus, setAgregarStatus] = useState('idle');
  const [agregarMessage, setAgregarMessage] = useState('');

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
        if (err.name === 'CanceledError') return;
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Error al obtener datos. Verifica el servidor.');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Carga inicial + polling automático
  useEffect(() => {
    const controller = new AbortController();
    cargarDatos(controller.signal);

    const intervalId = setInterval(() => {
      // No mostramos el spinner de "loading" en los refrescos silenciosos,
      // solo en la carga inicial — así la tabla no parpadea cada 30s.
      cargarDatos();
    }, INTERVALO_ACTUALIZACION_MS);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [cargarDatos]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const actualizarPrioridad = async (idOrden, nuevaPrioridad) => {
    try {
      await api.put(`/ordenes/${idOrden}/prioridad`, null, {
        params: { nivel: nuevaPrioridad || undefined },
      });
      await cargarDatos();
      setAvisoAccion(null);
    } catch (err) {
      setAvisoAccion(`No se pudo actualizar la prioridad de ${idOrden}. Verifica tus permisos.`);
    }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!archivo) return;

    setUploadStatus('loading');
    setUploadMessage('Procesando archivo, por favor espera...');

    const formData = new FormData();
    formData.append('file', archivo);

    try {
      await api.post('/ordenes/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadStatus('success');
      setUploadMessage('Archivo procesado y base de datos actualizada exitosamente.');

      await cargarDatos();

      setTimeout(() => {
        setIsModalOpen(false);
        setArchivo(null);
        setUploadStatus('idle');
      }, 2500);
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(err.response?.data || 'Error al subir el archivo');
    }
  };

  const abrirModalVentas = async () => {
    setIsVentasModalOpen(true);
    try {
      const response = await api.get('/ordenes/partes');
      setPartesDisponibles(response.data);
    } catch (err) {
      setAgregarStatus('error');
      setAgregarMessage('No se pudo cargar el catálogo de piezas.');
    }
  };

  const handleAgregarCantidad = async (e) => {
    e.preventDefault();
    if (!numeroParteSeleccionado || !cantidadAAgregar) return;

    setAgregarStatus('loading');
    setAgregarMessage('Actualizando cantidad, por favor espera...');

    try {
      await api.post('/ordenes/ventas/agregar-cantidad', {
        numeroParte: numeroParteSeleccionado,
        cantidad: Number(cantidadAAgregar),
      });

      setAgregarStatus('success');
      setAgregarMessage('Cantidad agregada correctamente.');
      await cargarDatos();

      setTimeout(() => {
        setIsVentasModalOpen(false);
        setNumeroParteSeleccionado('');
        setCantidadAAgregar('');
        setAgregarStatus('idle');
      }, 2000);
    } catch (err) {
      setAgregarStatus('error');
      setAgregarMessage(err.response?.data?.message || 'Error al agregar la cantidad.');
    }
  };

  const ordenes = datos?.ordenes || [];

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

      {/* MODAL: SUBIR EXCEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1F24]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-lg">
            <CornerMarks />
            <h2 className="mb-2 font-['Oswald',sans-serif] text-xl font-semibold uppercase tracking-wide text-[#1C1F24]">Actualizar Catálogo</h2>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Formato requerido: .xlsx</p>

            <form onSubmit={handleUploadExcel} className="flex flex-col gap-4">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setArchivo(e.target.files[0])}
                className="w-full border border-dashed border-slate-400 bg-slate-50 p-4 font-mono text-xs text-slate-700 file:mr-4 file:border-0 file:bg-[#1C1F24] file:px-3 file:py-1 file:text-xs file:font-mono file:text-white file:cursor-pointer hover:bg-slate-100 cursor-pointer transition-colors"
                required
              />

              {uploadStatus !== 'idle' && (
                <div className={`border-l-4 p-3 text-xs font-mono uppercase tracking-wider ${
                  uploadStatus === 'loading' ? 'border-[#E0972B] bg-yellow-50 text-[#E0972B]' :
                  uploadStatus === 'success' ? 'border-[#2E7D46] bg-green-50 text-[#2E7D46]' :
                  'border-[#C1272D] bg-red-50 text-[#C1272D]'
                }`}>
                  {uploadMessage}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setUploadStatus('idle'); setArchivo(null); }}
                  className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#1C1F24] transition-colors disabled:opacity-50"
                  disabled={uploadStatus === 'loading'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1F24] px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-[#E0972B] transition-colors disabled:opacity-50"
                  disabled={!archivo || uploadStatus === 'loading'}
                >
                  {uploadStatus === 'loading' ? 'Subiendo...' : 'Procesar Excel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR CANTIDAD (VENTAS) */}
      {isVentasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1F24]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-lg">
            <CornerMarks />
            <h2 className="mb-2 font-['Oswald',sans-serif] text-xl font-semibold uppercase tracking-wide text-[#1C1F24]">
              Agregar Cantidad
            </h2>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Selecciona una pieza y la cantidad a sumar
            </p>

            <form onSubmit={handleAgregarCantidad} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Número de parte
                </label>
                <select
                  value={numeroParteSeleccionado}
                  onChange={(e) => setNumeroParteSeleccionado(e.target.value)}
                  required
                  className="w-full border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-[#1C1F24] focus:outline-none focus:border-[#2B5C8C] transition-colors"
                >
                  <option value="">Selecciona una pieza…</option>
                  {partesDisponibles.map((parte) => (
                    <option key={parte} value={parte}>{parte}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Cantidad a agregar
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidadAAgregar}
                  onChange={(e) => setCantidadAAgregar(e.target.value)}
                  required
                  className="w-full border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-[#1C1F24] focus:outline-none focus:border-[#2B5C8C] transition-colors"
                />
              </div>

              {agregarStatus !== 'idle' && (
                <div className={`border-l-4 p-3 text-xs font-mono uppercase tracking-wider ${
                  agregarStatus === 'loading' ? 'border-[#E0972B] bg-yellow-50 text-[#E0972B]' :
                  agregarStatus === 'success' ? 'border-[#2E7D46] bg-green-50 text-[#2E7D46]' :
                  'border-[#C1272D] bg-red-50 text-[#C1272D]'
                }`}>
                  {agregarMessage}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsVentasModalOpen(false);
                    setAgregarStatus('idle');
                    setNumeroParteSeleccionado('');
                    setCantidadAAgregar('');
                  }}
                  className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#1C1F24] transition-colors disabled:opacity-50"
                  disabled={agregarStatus === 'loading'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1F24] px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-[#2B5C8C] transition-colors disabled:opacity-50"
                  disabled={!numeroParteSeleccionado || !cantidadAAgregar || agregarStatus === 'loading'}
                >
                  {agregarStatus === 'loading' ? 'Guardando…' : 'Agregar cantidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            {userRole === 'ROLE_VENTAS' && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="border border-[#E0972B] bg-[#E0972B]/10 px-3 py-1 text-[#E0972B] hover:bg-[#E0972B] hover:text-[#1C1F24] transition-colors"
                >
                  + SUBIR EXCEL
                </button>
                <button
                  onClick={abrirModalVentas}
                  className="border border-[#2B5C8C] bg-[#2B5C8C]/10 px-3 py-1 text-[#2B5C8C] hover:bg-[#2B5C8C] hover:text-white transition-colors"
                >
                  + AGREGAR CANTIDAD
                </button>
              </>
            )}

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
