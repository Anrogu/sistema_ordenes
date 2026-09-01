import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

const CHART_OPTIONS = {
  responsive: true,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: "'JetBrains Mono', monospace", size: 11 }, color: '#4B5563', boxWidth: 10, padding: 12 },
    },
    tooltip: {
      backgroundColor: '#1C1F24',
      titleFont: { family: "'JetBrains Mono', monospace" },
      bodyFont: { family: "'JetBrains Mono', monospace" },
    },
  },
};

export function GraficaPrioridad({ labels, valores, colores }) {
  const data = {
    labels,
    datasets: [{ data: valores, backgroundColor: colores, borderWidth: 0 }],
  };
  return <Doughnut data={data} options={CHART_OPTIONS} />;
}

GraficaPrioridad.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  valores: PropTypes.arrayOf(PropTypes.number).isRequired,
  colores: PropTypes.arrayOf(PropTypes.string).isRequired,
};
