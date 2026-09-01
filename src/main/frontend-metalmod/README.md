# Refactor — Tablero Metalmod

## Estructura

```
src/
  api/
    client.js          # instancia axios con baseURL e interceptor 401
    AuthContext.jsx     # login/logout centralizados (corrige el bug de logout)
  components/
    RutaPrivada.jsx     # guard de ruta
    ui/
      CornerMarks.jsx
      ChipPrioridad.jsx
      SelectorPrioridad.jsx
      FilaOrden.jsx
      TablaOrdenes.jsx   # una sola tabla reutilizada por Top 10 y Catálogo
      GraficaPrioridad.jsx
      Panel.jsx
  pages/
    Login.jsx
    Tablero.jsx
  utils/
    ordenamiento.js      # comparador y filtro, antes duplicados
    useDebounce.js
  theme.js                # colores y estilos de prioridad centralizados
  App.jsx
```

## Qué cambió y por qué

1. **Bug de logout corregido**: `AuthContext` mantiene sincronizados `localStorage` y el estado de React en un solo lugar. Antes `handleLogout` limpiaba `localStorage` pero no el estado de `App`.
2. **URLs centralizadas**: `api/client.js` usa `VITE_API_URL` en vez de `http://localhost:8080` repetido en 5+ lugares. Copia `.env.example` a `.env` y ajusta el valor para producción.
3. **Sin tablas/lógica duplicada**: `TablaOrdenes` + `FilaOrden` + `SelectorPrioridad` reemplazan las dos tablas casi idénticas. `compararPorPrioridad` y `filtrarOrdenes` reemplazan el comparador copiado y pegado.
4. **`useMemo`**: ordenar y filtrar ya no se repite en cada render que no cambia `ordenes` o la búsqueda.
5. **Debounce en el buscador**: 250ms antes de filtrar, para catálogos grandes.
6. **`AbortController`**: la petición de `/tablero/datos` se cancela si el componente se desmonta, evitando el warning de "setState en componente desmontado".
7. **PUT con body JSON** en vez de query param para actualizar prioridad.
8. **Sin `alert()` bloqueante**: errores de acción se muestran como banner dismisible (`avisoAccion`).
9. **`RutaPrivada`**: protege `/tablero` en el cliente en vez de depender solo del 401 del backend.
10. **PropTypes** en todos los componentes nuevos, para detectar props mal pasadas en desarrollo.
11. **Accesibilidad**: `aria-label` en inputs/selects, `<label htmlFor>` en el login, `role="alert"` en mensajes de error.

## Pendiente / a tu criterio

- Si el backend expone roles con Spring Security + JWT en cookie httpOnly, considera mover la verificación de sesión a un endpoint `/me` en vez de confiar en `localStorage` (que es legible por cualquier script, incluido uno inyectado por XSS).
- Instala `prop-types` si no lo tienes: `npm install prop-types`.
