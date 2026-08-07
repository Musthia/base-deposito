# Dashboard — Plan de Optimización y Rediseño

Basado en: `docs/dashboard_analisis_diseno.md`
Objetivo: mejorar **legibilidad**, **prioridad visual de datos** y **coherencia** para el usuario promedio, aplicando buenas prácticas de diseño (jerarquía, agrupación, espacio, contraste) sin cambiar la funcionalidad.

---

## 1. Principios rectores

1. **Jerarquía clara**: lo más importante primero, mayor tamaño/contraste.
2. **Agrupación visible**: tarjetas, listas, campos y botones separados con espacio uniforme.
3. **Consistencia total**: un solo sistema de tokens de color, espaciado y radio.
4. **Accesibilidad**: no depender solo del hover; soporte táctil y teclado.
5. **Reducción de carga cognitiva**: menos ruido, etiquetas explícitas, unidades claras.

---

## 2. Sistema de tokens unificado (crear `dashboardTokens` o usar theme)

Reemplazar los hex hardcodeados por tokens del tema, o un conjunto local reutilizable:

```js
const ACCENT = {
  datcorr: "var(--primary)",      // antes #0284c7 (azul fijo)
  verificado: "var(--success)",  // antes #16a34a
  pendiente: "var(--warning)",   // antes naranja EA580C → token warning
  alerta: "var(--danger)",        // rojo
};
```

**Acción**:
- [ ] Mover `iconBg`/`iconColor` de KPI a tokens (gradientes translúcidos de `var(--primary)` etc.).
- [ ] Unificar colores DATCORR/VERIFICADO en tabla y totales con el mismo token.
- [ ] Definir una sola escala de `radius` (8px tarjetas, 12px KPI, 4px badges) y `spacing` (8/16/24).

---

## 3. Jerarquía y prioridad de datos

### 3.1 Welcome card (nivel 1 — baja prioridad)
- Reducir a encabezado de página: título + breadcrumb de contexto.
- Quitar el badge `v8.1` del flujo principal (moverlo discreto al footer/sidebar). Evita competencia visual.

### 3.2 KPI Row (nivel 2 — enfoque principal)
- **No todos los KPIs pesan igual**: destacar los 1–2 críticos (Registros totales y Altas pendientes) con borde de acento o mayor tamaño de `value`.
- Separar visualmente KPI **accionables** (con `onClick`, e.g. Altas) del resto mediante borde primario y cursor pointer visible (`role="button"`, `tabIndex=0`).
- Sustituir el hover-only por un **panel de detalle alternable por click** (para táctiles): botón "ver detalle".

### 3.3 Zona inferior (nivel 3 — detalle)
- La tabla "Registros por base" y el timeline "Actividad" son secundarios → panel más tenue, separados por 24px.
- Timeline limitado a `max-height` con scroll para no desbordar.

---

## 4. Separación uniforme de botones, listas, campos y cuadros

Proponer un **grid base de espaciado** (8pt system):

| Uso | Espacio |
|---|---|
| entre tarjetas KPI | 16px |
| entre tarjetas de sección (welcome / bottom) | 24px |
| dentro de tarjeta (label→valor) | 4px |
| separación de sección dentro de tarjeta | 16px |
| tabla fila | 12px vertical |

- Aplicar **aliniación consistente**: KPIs en `grid`, ítems de tabla alineados por tipo (números a la derecha, texto a la izquierda).
- Uniformar el **radio** de tarjetas a 8px y los **iconos-badge** a 8px.

---

## 5. Visualización de prioridad de datos para el usuario promedio

| Dato | Prioridad | Tratamiento propuesto |
|---|---|---|
| Registros totales | **ALTA** | valor más grande, a la izquierda, mayor contraste |
| Bases activas | ALTA | segundo, idéntico peso al primero |
| Altas pendientes | **CRÍTICA** (si aplica) | acento warning, número destacado< borde |
| Usuarios activos | MEDIA | tercero |
| Actividad reciente | MEDIA | timeline compacto |

Regla: **1 dato = 1 número grande**; evitar dobles énfasis (icono color + borde + resaltado) en todo a la vez.

---

## 6. Concretización de mejoras recomendadas

### A. Render de KPI con detalle accesible
```js
// en lugar de toggle solo-on-hover
<button role="button" tabIndex={0}
  onClick={() => setShowDetails(s => !s)}>
  <span>Ver detalle ▾</span>
</button>
```

### B. Semántica de tabla mejorada
- Agrupar columnas hijas con `<colgroup><col span=2>` y cabecera combinada "Origen / Total".
- Leyenda corta de colores (DATCORR azul = fuente, VERIFICADO verde = confirmado) 1 linea.

### C. Estados de carga/error
- Mantener, pero mover al área del contenido (no pantalla completa 100vh) para no des-ayudar el layout.

### D. Tipografía y contraste
- `text-muted` en texto secundario (12–13px), `text-main` en valores (22–24px).
- Asegurar contraste ≥ 4.5:1 de `--text-muted` (#8896b8) sobre `#141a2e` (verificar, actual es límite).

---

## 7. Optimizaciones de rendimiento (menor)

- `React.memo` en `KpiCard` (recibe props estables) → evita re-render de toda la fila al hoverear.
- Memoizar `formatAction`/`formatDate` (heavy en listas) — innecesario por ahora (datos < 100).

---

## 8. Plan de implementación por fases

| Fase | Alcance | Esfuerzo |
|---|---|---|
| **1** | Crear tokens de acento y sustituir hex hardcodeados | 1 sesión |
| **2** | Jerarquía KPI: destacar críticos + botón de detalle accesible | 1 sesión |
| **3** | Unificar espaciado/radio (grid base) y separación de secciones | 1 sesión |
| **4** | Tabla con `colgroup`, leyenda de colores y timeline compacto | 1 sesión |
| **5** | Estados de carga/error dentro de contenido + `React.memo` | ½ sesión |

**Verificación**: `npm run build` (vite) sin errores; revisar contraste en dark; probar click en táctil.

---

## 9. Criterios de aceptación

1. Sin colores hardcodeados distintos del token semántico.
2. El dato crítico se distingue a primera vista (scan ≤ 5s).
3. Se­pación uniforme de tarjetas, listas y campos.
4. KPIs accesibles por click/teclado (no solo hover).
5. Contraste ≥ 4.5:1 entre texto y fondo.