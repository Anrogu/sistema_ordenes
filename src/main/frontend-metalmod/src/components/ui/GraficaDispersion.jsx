import PropTypes from 'prop-types';
import { Scatter } from 'react-chartjs-2';
import { PRIORIDAD_ESTILO } from '../../theme';

const OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: "'JetBrains Mono', monospace", size: 11 }, color: '#4B5563', boxWidth: 10, padding: 12 },
    },
    tooltip: {
      backgroundColor: '#1C1F24',
      titleFont: { family: "'JetBrains Mono', monospace" },
      bodyFont: { family: "'JetBrains Mono', monospace" },
      callbacks: {
        label: (ctx) => {
          const punto = ctx.raw;
          const fecha = new Date(punto.x).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          return `${punto.idOrden} · entrega ${fecha}`;
        },
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Fecha de entrega prometida',
        font: { family: "'JetBrains Mono', monospace", size: 11 },
        color: '#4B5563',
      },
      ticks: {
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        color: '#8A94A3',
        callback: (value) => new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      },
      grid: { color: '#E5E7EB' },
    },
    y: {
      reverse: true, // Crítica (1) arriba, Baja (4) abajo — misma lectura que las cotas del resto del sistema
      min: 0.5,
      max: 4.5,
      ticks: {
        stepSize: 1,
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        color: '#8A94A3',
        callback: (value) => PRIORIDAD_ESTILO[value]?.label ?? '',
      },
      title: {
        display: true,
        text: 'Prioridad final',
        font: { family: "'JetBrains Mono', monospace", size: 11 },
        color: '#4B5563',
      },
      grid: { color: '#E5E7EB' },
    },
  },
};

export function GraficaDispersion({ ordenes }) {
  const ordenesGraficables = ordenes.filter((o) => o.fechaEntregaPrometida && o.prioridadFinal);

  if (ordenesGraficables.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
        Sin fechas de entrega registradas para graficar
      </p>
    );
  }

  // Un dataset por nivel de prioridad para que la leyenda muestre las
  // categorías (Crítica/Alta/Normal/Baja) igual que hacía el pastel.
  const datasets = [1, 2, 3, 4].map((nivel) => ({
    label: PRIORIDAD_ESTILO[nivel].label,
    backgroundColor: PRIORIDAD_ESTILO[nivel].color,
    pointRadius: 5,
    pointHoverRadius: 7,
    data: ordenesGraficables
      .filter((o) => o.prioridadFinal === nivel)
      .map((o) => ({
        x: new Date(o.fechaEntregaPrometida).getTime(),
        y: o.prioridadFinal,
        idOrden: o.idOrden,
      })),
  }));

  return <Scatter data={{ datasets }} options={OPTIONS} />;
}

GraficaDispersion.propTypes = {
  ordenes: PropTypes.array.isRequired,
};
