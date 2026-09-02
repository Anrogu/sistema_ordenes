import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export function AgregarCantidadVentas() {
  const [partes, setPartes] = useState([]);
  const [numeroParte, setNumeroParte] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    axiosClient.get('/api/ordenes/partes').then((res) => setPartes(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    try {
      await axiosClient.post('/api/ordenes/ventas/agregar-cantidad', {
        numeroParte,
        cantidad: Number(cantidad),
      });
      setMensaje({ tipo: 'ok', texto: 'Cantidad agregada correctamente.' });
      setCantidad('');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message ?? 'Error al agregar cantidad.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <select value={numeroParte} onChange={(e) => setNumeroParte(e.target.value)} required
        className="border border-slate-300 rounded px-3 py-2 text-sm">
        <option value="">Selecciona una pieza</option>
        {partes.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
        placeholder="Cantidad" required className="border border-slate-300 rounded px-3 py-2 text-sm" />
      <button type="submit" className="bg-slate-800 text-white rounded px-3 py-2 text-sm">
        Agregar cantidad
      </button>
      {mensaje && (
        <p className={mensaje.tipo === 'ok' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>{mensaje.texto}</p>
      )}
    </form>
  );
}
