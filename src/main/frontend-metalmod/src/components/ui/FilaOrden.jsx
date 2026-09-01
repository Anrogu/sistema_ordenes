import PropTypes from 'prop-types';
import { ChipPrioridad } from './ChipPrioridad';
import { SelectorPrioridad } from './SelectorPrioridad';

export function FilaOrden({ orden, userRole, onCambiarPrioridad }) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-4 py-3 font-mono font-semibold text-[#1C1F24]">{orden.idOrden}</td>
      <td className="px-4 py-3 text-slate-700">{orden.cliente?.nombre}</td>
      <td className="px-4 py-3 font-mono text-slate-500">{orden.fechaEntregaPrometida}</td>
      <td className="px-4 py-3">
        {userRole === 'ROLE_VENTAS' ? (
          <SelectorPrioridad
            idOrden={orden.idOrden}
            valorActual={orden.prioridadVentas}
            onCambiar={onCambiarPrioridad}
          />
        ) : (
          <span className="font-mono text-xs text-slate-500">
            {orden.prioridadVentas ? `${orden.prioridadVentas} (Manual)` : 'Auto'}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <ChipPrioridad prioridad={orden.prioridadFinal} />
      </td>
    </tr>
  );
}

FilaOrden.propTypes = {
  orden: PropTypes.shape({
    idOrden: PropTypes.string.isRequired,
    cliente: PropTypes.shape({ nombre: PropTypes.string }),
    fechaEntregaPrometida: PropTypes.string,
    prioridadVentas: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    prioridadFinal: PropTypes.number,
  }).isRequired,
  userRole: PropTypes.string,
  onCambiarPrioridad: PropTypes.func.isRequired,
};
