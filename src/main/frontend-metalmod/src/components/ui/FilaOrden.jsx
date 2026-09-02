import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../api/client';

export function FilaOrden({ orden, userRole, onCambiarPrioridad, tieneMultiplesFechas }) {
  const [popoverAbierto, setPopoverAbierto] = useState(false);
  const [entregas, setEntregas] = useState(null);
  const [cargandoEntregas, setCargandoEntregas] = useState(false);

  const cantidad = orden.cantidad || 0;
  const terminadas = orden.cantidadTerminada || 0;
  const faltan = cantidad - terminadas;

  const fechaFormateada = orden.fechaEntregaPrometida
    ? new Date(orden.fechaEntregaPrometida).toLocaleDateString('es-MX', { timeZone: 'UTC' })
    : 'Sin fecha';

  const toggleInfoFechas = async () => {
    if (popoverAbierto) {
      setPopoverAbierto(false);
      return;
    }
    setPopoverAbierto(true);
    if (entregas === null) {
      setCargandoEntregas(true);
      try {
        const response = await api.get(`/ordenes/${orden.idOrden}/entregas`);
        setEntregas(response.data);
      } catch (err) {
        setEntregas([]);
      } finally {
        setCargandoEntregas(false);
      }
    }
  };

  const renderPrioridad = (nivel) => {
    switch (nivel) {
      case 1: return <span className="bg-[#C1272D] text-white px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider">Crítica</span>;
      case 2: return <span className="bg-[#E0972B] text-white px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider">Alta</span>;
      case 3: return <span className="bg-slate-500 text-white px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider">Normal</span>;
      case 4: return <span className="bg-[#2B5C8F] text-white px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider">Baja</span>;
      default: return <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-sm text-[10px] uppercase font-bold tracking-wider">N/A</span>;
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-center">{renderPrioridad(orden.prioridadSistema)}</td>
      <td className="px-4 py-3 font-mono font-medium text-[#1C1F24]">{orden.idOrden}</td>
      <td className="px-4 py-3 font-sans text-slate-700">{orden.numeroParte || 'N/A'}</td>
      <td className="px-4 py-3 font-mono text-slate-700">{cantidad}</td>
      <td className="px-4 py-3 font-mono text-[#2E7D46]">{terminadas}</td>
      <td className="px-4 py-3 font-mono font-bold text-[#C1272D]">{faltan < 0 ? 0 : faltan}</td>

      <td className="relative px-4 py-3 font-mono text-slate-600">
        <div className="flex items-center gap-2">
          <span>{fechaFormateada}</span>
          {tieneMultiplesFechas && (
            <button
              type="button"
              onClick={toggleInfoFechas}
              className="border border-[#2B5C8C] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[#2B5C8C] hover:bg-[#2B5C8C] hover:text-white transition-colors"
            >
              + info
            </button>
          )}
        </div>

        {popoverAbierto && (
          <div className="absolute left-0 top-full z-20 mt-1 w-56 border border-slate-200 bg-white p-3 text-left shadow-lg">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400">
              Entregas programadas
            </p>
            {cargandoEntregas && <p className="text-xs text-slate-500">Cargando…</p>}
            {!cargandoEntregas && entregas?.length === 0 && (
              <p className="text-xs text-slate-500">Sin desglose disponible</p>
            )}
            {!cargandoEntregas && entregas?.map((e) => (
              <div key={e.id} className="flex justify-between border-b border-slate-100 py-1 text-xs last:border-0">
                <span className="text-slate-600">
                  {new Date(e.fechaEntrega).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                </span>
                <span className="font-mono font-medium text-[#1C1F24]">{e.cantidad} pzas</span>
              </div>
            ))}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {userRole === 'ROLE_VENTAS' ? (
          <select
            className="border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-700 focus:border-[#E0972B] focus:outline-none rounded-sm"
            value={orden.prioridadSistema || ''}
            onChange={(e) => onCambiarPrioridad(orden.idOrden, Number(e.target.value))}
          >
            <option value="" disabled>Ajustar...</option>
            <option value="1">1 - Crítica</option>
            <option value="2">2 - Alta</option>
            <option value="3">3 - Normal</option>
            <option value="4">4 - Baja</option>
          </select>
        ) : (
          <span className="text-slate-400 font-mono text-xs">Solo lectura</span>
        )}
      </td>
    </tr>
  );
}

FilaOrden.propTypes = {
  orden: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  onCambiarPrioridad: PropTypes.func.isRequired,
  tieneMultiplesFechas: PropTypes.bool,
};
