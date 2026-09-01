import PropTypes from 'prop-types';

export function SelectorPrioridad({ idOrden, valorActual, onCambiar }) {
  return (
    <select
      aria-label={`Ajustar prioridad de ventas para la orden ${idOrden}`}
      className="border border-slate-300 bg-white font-mono text-xs text-slate-700 px-2 py-1 focus:outline-none focus:border-[#E0972B] rounded-sm cursor-pointer"
      value={valorActual || ''}
      onChange={(e) => onCambiar(idOrden, e.target.value)}
    >
      <option value="">AUTO</option>
      <option value="1">1 - CRÍTICA</option>
      <option value="2">2 - ALTA</option>
      <option value="3">3 - NORMAL</option>
      <option value="4">4 - BAJA</option>
    </select>
  );
}

SelectorPrioridad.propTypes = {
  idOrden: PropTypes.string.isRequired,
  valorActual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onCambiar: PropTypes.func.isRequired,
};
