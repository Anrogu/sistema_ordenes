import PropTypes from 'prop-types';
import { PRIORIDAD_ESTILO } from '../../theme';

export function ChipPrioridad({ prioridad }) {
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

ChipPrioridad.propTypes = {
  prioridad: PropTypes.oneOf([1, 2, 3, 4]),
};
