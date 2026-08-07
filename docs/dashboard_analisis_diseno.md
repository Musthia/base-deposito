# Dashboard — Análisis de Diseño Actual

Fecha: 2026-08-06
Archivo fuente: `frontend/src/pages/Dashboard.jsx` (474 líneas)
Servicio de datos: `frontend/src/services/dashboardService.js`
Tema: `frontend/src/theme.js` + `LIGHT`/`DARK`

---

## 1. Identidad visual

- **Familia tipográfica**: `'Open Sans', system-ui, sans-serif` (definida en `dashboardStyles.wrapper`, línea 320).
- **Tema**: NAVY OSCURO "Azul Marino Profundo". El `mode` por defecto es `"light"` en el contexto, pero la paleta `LIGHT` es de fondo oscuro:
  - `bgPage: #0a0e1a`, `bgCard: #141a2e`, `border: #2a3050`
  - `textMain: #f0f2f5`, `textMuted: #8896b8`
  - `primary: #2563eb`, `success: #34d399`, `warning: #f59e0b`, `danger: #f87171`
- **Fondo**: `backgroundImage: var(--bg-gradient)` — `radial-gradient(ellipse at 50% 30%, #0a0e1a, #050810, #000)` aplicado por el layout.

---

## 2. Estructura de estilos

Los estilos NO usan CSS modules ni una hoja externa; están **inline** mediante objetos JS constantes al final del archivo:

| Constante | Rol |
|---|---|
| `dashboardStyles` | envoltura (tipografía + box-sizing) |
| `welcomeStyles` | tarjeta de bienvenida / encabezado |
| `kpiStyles` | fila y tarjetas de métricas (KPI) |
| `bottomStyles` | layout inferior (fila + columnas) |
| `cardStyles` | tarjeta contenedora genérica |
| `sectionTitle` | títulos de sección |
| `thStyles` / `tdStyles` / `tableStyles` | tabla de registros |
| `tlStyles` | timeline de actividad |
| `loadingStyles` / `errorStyles` | estados de carga y error |

Ventaja: estilos tipados y reutilizables por spread (`...kpiStyles.card`, `...tableStyles.thRight`). Desventaja: mezcla jerarquía de caja y estado dentro del mismo objeto.

---

## 3. Paleta de colores usada en el componente

Colores **hardcoded** (no vía token) dentro de `Dashboard.jsx`:

| Tokem | Valor | Uso |
|---|---|---|
| Icono "Bases" | `#eff6ff` fondo / `#0284c7` texto | radio de tarjeta KPI |
| Icono "Registros" | `#f0fdf4` / `#16a34a` | radio de tarjeta KPI |
| Icono "Usuarios" | `#faf5ff` / `#9333ea` | radio de tarjeta KPI |
| Icono "Altas" | `#fef2f2` / `#dc2626` | radio de tarjeta KPI |
| Icono "Actividad" | `#fff7ed` / `#ea580c` | radio de tarjeta KPI |
| Columna DATCORR | `#0284c7` | tabla + total |
| Columna VERIFICADO | `#16a34a` | tabla + total |

Los colores foreground de KPI vienen del MUI Theme (`var(--bg-card)`, `var(--text-main)`, `var(--text-muted)`, `var(--border)`).

**Mapa de estados de acción** (`actionColor`, línea 215):

| Acción | Color |
|---|---|
| LOGIN_SUCCESS | `#16a34a` (verde) |
| CREATE | `#0284c7` (azul) |
| UPDATE | `#ea580c` (naranja) |
| DELETE_LOGICO / LOGIN_FAILED / LOGOUT_FAILED | `#dc2626` (rojo) |
| LOGOUT_SUCCESS | `#64748b` (gris) |
| TOKEN_* | `#9333ea` (púrpura) |
| default | `#64748b` |

> ⚠️ Los colores de íconos KPI y los de DATCORR/VERIFICADO están **hardcodeados** y no respetan la paleta/tokens del tema. Esto rompe con el sistema de `--text-main`, `--primary`.

---

## 4. Flujo de información visual (orden top→bottom)

```
┌─────────────────────────────────────────────────────────────┐
│ Welcome Card                                              │
│  "Panel de control" + v8.1                                  │
├─────────────────────────────────────────────────────────────┤
│ KPI Row (grid auto-fit, min 240px)                          │
│  [Bases] [Registros] [Usuarios] [Altas*] [Actividad]        │
│  * Altas solo si NO esConsulta                              │
├─────────────────────────────────────────────────────────────┤
│ Bottom Row (columna)                                        │
│  │▸ card izquierda : "Registros por base" (tabla)           │
│  │▸ card derecha   : "Actividad reciente" (timeline)        │
│  │   * derecha solo si NO esConsulta                        │
└─────────────────────────────────────────────────────────────┘
```

**Carga de datos**:
```
Mounted → getDashboardStats() → GET /dashboard/stats
       → ok: setStats(state)
       → error: setError(message)
Estados renderizados: loading (spinner) → error (retry) → datos
```

**Detalle de cada tarjeta KPI** (interacción hover):
- Al hacer hover se muestra un panel de **details** desplegado debajo con breakdown (ej. primeras 3 bases, totales por origen, usuarios registrados/activos/inactivos).
- Las tarjetas con `onClick` (solo "Altas pendientes") elevan sombra y cursor pointer y navegan a `/altas-pendientes`.

**Accesibilidad/UX actual**:
- Estados loading y error son pantallas completas (min-height 100vh).
- Los KPIs se expanden solo con hover (no click para alternar), no accesible en táctil.
- No hay jerarquía tipográfica fuerte entre nivel de datos (en los KPIs el `value` es 24px vs `label` 13px — bien).
- La tabla usa `<thead>` y `<tfoot>` con totales — buena.

---

## 5. Gráficos con Recharts (EstadísticasPage — referencia)

Dashboard NO usa gráficos; `EstadisticasPage` sí (Recharts). Las guías del tema para tooltip/ejes ya fueron ajustadas con **contrast fixes** (tick `#ccc`, tooltip bg dark, legend). Relevante para el plan como patrón a unificar.

---

## 6. Hallazgos / Problemas de diseño

1. **Colores hardcodeados** en iconos KPI y columnas tabla → no escalables, rompen modo dark en algunos elementos.
2. **Interacción solo hover** en KPIs → inaccesible en pantallas táctiles y reduce usabilidad del grupo de accesibilidad.
3. **Sin jerarquía de prioridad visual**: "Altas pendientes" (acción crítica) no se distingue del resto; todos los KPIs con mismo peso.
4. **Welcome card y KPIs en mismo nivel**: el título y la versión compiten con la data principal.
5. **Tabla con colspan débil**: las columnas hijas (DATCORR/VERIFICADO) no indican dependencia de su columna padre "Registros".
6. **Dobles fuentes de color semántico** (DATCORR azul, VERIFICADO verde hardcoded) sin explicación para el usuario.
7. **Espaciados inconsistentes** entre componentes (16px en KPIs, 24px en bottom/welcome) para separadores de sección.