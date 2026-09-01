/**
 * Comparador único de prioridad de órdenes. Antes vivía copiado y pegado
 * dos veces (Top 10 y Catálogo general); ahora un fix aplica a ambos.
 *
 * Regla 1: prioridad final (menor número = más urgente; sin prioridad -> al final)
 * Regla 2: desempate — primero los ajustes manuales de Ventas
 * Regla 3: desempate final — orden alfabético del folio
 */
export function compararPorPrioridad(a, b) {
  const prioA = a.prioridadFinal || 99;
  const prioB = b.prioridadFinal || 99;
  if (prioA !== prioB) return prioA - prioB;

  const manualA = a.prioridadVentas != null ? 0 : 1;
  const manualB = b.prioridadVentas != null ? 0 : 1;
  if (manualA !== manualB) return manualA - manualB;

  return a.idOrden.localeCompare(b.idOrden);
}

export function filtrarOrdenes(ordenes, busqueda) {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return ordenes;

  return ordenes.filter(
    (orden) =>
      orden.idOrden.toLowerCase().includes(termino) ||
      (orden.cliente?.nombre ?? '').toLowerCase().includes(termino)
  );
}

export function contarPorNivel(ordenes, campo, nivel) {
  return ordenes.filter((o) => o[campo] === nivel).length;
}

export function contarSinAjusteManual(ordenes) {
  return ordenes.filter((o) => o.prioridadVentas == null).length;
}
