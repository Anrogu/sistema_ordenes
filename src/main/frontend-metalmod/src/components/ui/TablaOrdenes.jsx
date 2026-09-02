import PropTypes from 'prop-types';
import { FilaOrden } from './FilaOrden';

export function TablaOrdenes({ 
  ordenes, 
  userRole, 
  onCambiarPrioridad, 
  mensajeVacio, 
  sticky = false, 
  ordenesConMultiplesFechas = [] 
}) {
  return (
    <table className="w-full border-collapse text-sm text-left">
      <thead className={sticky ? 'sticky top-0 bg-slate-50 shadow-sm z-10' : 'bg-slate-50'}>
        <tr className="border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          <th className="px-4 py-3 text-center">Prioridad</th>
          <th className="px-4 py-3">Orden</th>
          <th className="px-4 py-3">Nº Parte</th>
          <th className="px-4 py-3">Cant.</th>
          <th className="px-4 py-3">Hechas</th>
          <th className="px-4 py-3">Faltan</th>
          <th className="px-4 py-3">Fecha Límite</th>
          <th className="px-4 py-3">Ajuste Ventas</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {ordenes.length === 0 ? (
          <tr>
            <td colSpan="8" className="px-4 py-6 text-center text-slate-400">
              {mensajeVacio}
            </td>
          </tr>
        ) : (
          ordenes.map((orden) => (
            <FilaOrden
              key={orden.idOrden}
              orden={orden}
              userRole={userRole}
              onCambiarPrioridad={onCambiarPrioridad}
              tieneMultiplesFechas={ordenesConMultiplesFechas.includes(orden.idOrden)}
            />
          ))
        )}
      </tbody>
    </table>
  );
}

TablaOrdenes.propTypes = {
  ordenes: PropTypes.array.isRequired,
  userRole: PropTypes.string,
  onCambiarPrioridad: PropTypes.func.isRequired,
  mensajeVacio: PropTypes.string.isRequired,
  sticky: PropTypes.bool,
  ordenesConMultiplesFechas: PropTypes.array,
};
