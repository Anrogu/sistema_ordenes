// Paleta "planta industrial": grafito + acentos de señalización de seguridad.
// Centralizada aquí para que cualquier componente nuevo (gráficas, chips,
// futuros indicadores) use los mismos valores en vez de recrearlos.
export const COLOR_CRITICA = '#C1272D';
export const COLOR_ALTA = '#E0972B';
export const COLOR_NORMAL = '#2E7D46';
export const COLOR_BAJA = '#2B5C8C';
export const COLOR_AUTO = '#8A94A3';

export const PRIORIDAD_ESTILO = {
  1: { label: 'Crítica', color: COLOR_CRITICA },
  2: { label: 'Alta', color: COLOR_ALTA },
  3: { label: 'Normal', color: COLOR_NORMAL },
  4: { label: 'Baja', color: COLOR_BAJA },
};
