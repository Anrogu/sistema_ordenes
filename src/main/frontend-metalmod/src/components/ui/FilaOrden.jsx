import PropTypes from 'prop-types';

export function FilaOrden({ orden, userRole, onCambiarPrioridad }) {
  // Cálculo matemático al vuelo para no depender del #ERROR! de Excel
  const cantidad = orden.cantidad || 0;
  const terminadas = orden.cantidadTerminada || 0;
  const faltan = cantidad - terminadas;

  // Formateo seguro de fecha
  const fechaFormateada = orden.fechaEntregaPrometida 
    ? new Date(orden.fechaEntregaPrometida).toLocaleDateString('es-MX', { timeZone: 'UTC' }) 
    : 'Sin fecha';

  // Badges de color según prioridad (1=Crítica, 2=Alta, 3=Normal, 4=Baja)
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
      {/* Resalta en rojo las piezas que faltan por fabricar */}
      <td className="px-4 py-3 font-mono font-bold text-[#C1272D]">{faltan < 0 ? 0 : faltan}</td>
      <td className="px-4 py-3 font-mono text-slate-600">{fechaFormateada}</td>
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
};
