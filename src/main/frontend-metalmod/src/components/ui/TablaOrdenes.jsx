import PropTypes from 'prop-types';
import { FilaOrden } from './FilaOrden';

export function TablaOrdenes({ ordenes, userRole, onCambiarPrioridad, mensajeVacio, sticky = false }) {
  if (ordenes.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-slate-500 font-mono text-xs">{mensajeVacio}</p>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead className={sticky ? 'sticky top-0 bg-slate-50 shadow-sm' : 'bg-slate-50'}>
        <tr className="border-b border-slate-200 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          <th className="px-4 py-2 text-left">Orden</th>
          <th className="px-4 py-2 text-left">Cliente</th>
          <th className="px-4 py-2 text-left">Fecha prometida</th>
          <th className="px-4 py-2 text-left">Ajuste Ventas</th>
          <th className="px-4 py-2 text-left">Prioridad (Final)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {ordenes.map((orden) => (
          <FilaOrden
            key={orden.idOrden}
            orden={orden}
            userRole={userRole}
            onCambiarPrioridad={onCambiarPrioridad}
          />
        ))}
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
};
