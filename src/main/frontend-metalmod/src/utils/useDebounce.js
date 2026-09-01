import { useEffect, useState } from 'react';

/**
 * Retrasa la propagación de un valor que cambia rápido (p.ej. cada tecla
 * en un input de búsqueda) para no re-filtrar el catálogo en cada pulsación.
 */
export function useDebounce(valor, delayMs = 250) {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValorDebounced(valor), delayMs);
    return () => clearTimeout(timeoutId);
  }, [valor, delayMs]);

  return valorDebounced;
}
