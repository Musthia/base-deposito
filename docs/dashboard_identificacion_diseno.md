# Dashboard — Identificación de Diseño, Estilos y Flujo Visual

> Análisis del componente `frontend/src/pages/Dashboard.jsx` (474 líneas)
> Servicio de datos: `frontend/src/services/dashboardService.js`
> Tema: `frontend/src/theme.js` + variables CSS

---

## 1. Diseño General

### 1.1 Tipo de diseño
- **Patrón**: Dashboard administrativo de panel único (single-page dashboard)
- **Layout**: Columna vertical única con secciones apiladas top → bottom
- **Navegación**: Interna al panel; la navegación global depende del sidebar/topbar del layout principal
- **Enfoque**: Información jerárquica por tarjetas (KPI cards) + tabla de detalle + timeline de actividad

### 1.2 Estructura de contenedores

```
┌─────────────────────────────────────────────────────────────┐
│ WRAPPER (font-family + box-sizing)                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WELCOME CARD                                         │   │
│  │  Título + descripción + badge de versión             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ KPI ROW (grid auto-fit, min 240px)                   │   │
│  │  [Bases] [Registros] [Usuarios] [Altas*] [Actividad] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BOTTOM ROW (flex column)                             │   │
│  │  ┌─────────────────────┐  ┌───────────────────────┐  │   │
│  │  │ TABLA REGISTROS     │  │ TIMELINE ACTIVIDAD    │  │   │
│  │  │ por base            │  │                       │  │   │
│  │  └─────────────────────┘  └───────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Estados del componente
| Estado | Condición | Renderizado |
|--------|-----------|-------------|
| Loading | `!stats && !error` | Spinner centrado + texto "Cargando panel..." |
| Error | `error !== null` | Card centrada con ícono ⚠, título, descripción y botón "Reintentar" |
| Datos | `stats !== null` | Layout completo con welcome, KPIs, tabla y timeline |

---

## 2. Estructura de Estilos

### 2.1 Metodología
- **Enfoque**: CSS-in-JS mediante objetos de estilo constantes definidos al final del archivo
- **Patrón**: Constantes nombradas por sección, aplicadas por spread (`...kpiStyles.card`, `...tableStyles.thRight`)
- **Ventaja**: Tipado implícito, reutilización, acceso directo desde componentes
- **Desventaja**: Mezcla de jerarquía de caja, estado visual y variantes en un solo objeto; dificulta mantenimiento a escala

### 2.2 Catálogo de constantes de estilo

| Constante | Líneas | Rol |
|-----------|--------|-----|
| `dashboardStyles` | 318-323 | Envoltura global: tipografía + box-sizing |
| `welcomeStyles` | 325-361 | Tarjeta de encabezado: título, descripción, badge |
| `kpiStyles` | 363-399 | Fila grid + tarjetas KPI + iconos + hover states |
| `bottomStyles` | 401-409 | Layout inferior: fila + columnas left/right |
| `cardStyles` | 411-417 | Tarjeta contenedora genérica |
| `sectionTitle` | 419-424 | Títulos de sección (tabla, timeline) |
| `thStyles` / `tdStyles` | 426-438 | Celdas de encabezado y dato |
| `tableStyles` | 440-452 | Contenedor, tabla, filas, pie de tabla |
| `tlStyles` | 454-462 | Timeline: filas, iconos, líneas conectoras, texto |
| `loadingStyles` | 463-466 | Estado de carga |
| `errorStyles` | 468-473 | Estado de error |

### 2.3 Componente KpiCard — estilos y estado

El componente `KpiCard` (líneas 275-315) combina:
- Estructura base: `kpiStyles.card` + `kpiStyles.cardClickable` (si tiene `onClick`)
- Estado hover: `kpiStyles.cardHovered` (sombra + elevación)
- Expansión de detalles: controlled por `showDetails` state, se muestra solo en hover
- Transiciones: `transition: box-shadow 0.15s, transform 0.15s`

### 2.4 Inconsistencias de estilo detectadas

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| Colores hardcodeados en iconos KPI | Líneas 67-68, 79-80, 92-93, 105-106, 117-118 | Rompe tema dark; no escalable |
| Colores hardcodeados en tabla | Líneas 446-447, 451-452 | DATCORR `#0284c7`, VERIFICADO `#16a34a` fuera de tokens |
| Espaciados inconsistentes | Margins: welcome 24px, KPI 24px, bottom 24px | Separadores de sección no uniformes |
| Border radius mixto | KPI 8px, welcome 8px, iconWrap 8px | Falta token de radius consistente |
| Hover solo en KPI cards | Línea 285-286 | Inaccesible en táctil; oculta información |

---

## 3. Paleta de Colores

### 3.1 Tema institucional (LIGHT — modo por defecto)

Definido en `frontend/src/theme.js`:

| Token CSS | Valor Hex | Uso en Dashboard |
|-----------|-----------|------------------|
| `--bg-page` | `#0a0e1a` | Fondo global del layout (gradiente radial) |
| `--bg-card` | `#141a2e` | Fondo de tarjetas (welcome, KPI, tabla, timeline) |
| `--border` | `#2a3050` | Bordes de tablas, divisores, líneas de timeline |
| `--text-main` | `#f0f2f5` | Texto principal (títulos, valores KPI, celdas) |
| `--text-muted` | `#8896b8` | Texto secundario (etiquetas, subtítulos, tiempos) |
| `--primary` | `#2563eb` | Acentos principales (no usado extensamente en Dashboard) |
| `--success` | `#34d399` | Estados positivos |
| `--warning` | `#f59e0b` | Estados de advertencia |
| `--danger` | `#f87171` | Estados de error / acciones destructivas |

### 3.2 Colores semánticos hardcodeados (fuera de tema)

| Contexto | Color | Valor | Problema |
|----------|-------|-------|----------|
| Icono KPI "Bases" | fondo / texto | `#eff6ff` / `#0284c7` | No usa tokens |
| Icono KPI "Registros" | fondo / texto | `#f0fdf4` / `#16a34a` | No usa tokens |
| Icono KPI "Usuarios" | fondo / texto | `#faf5ff` / `#9333ea` | No usa tokens |
| Icono KPI "Altas" | fondo / texto | `#fef2f2` / `#dc2626` | No usa tokens |
| Icono KPI "Actividad" | fondo / texto | `#fff7ed` / `#ea580c` | No usa tokens |
| Columna tabla DATCORR | texto | `#0284c7` | Depende de estado, no de valor |
| Columna tabla VERIFICADO | texto | `#16a34a` | Depende de estado, no de valor |
| Acción LOGIN_SUCCESS | dot timeline | `#16a34a` | Hardcoded |
| Acción CREATE | dot timeline | `#0284c7` | Hardcoded |
| Acción UPDATE | dot timeline | `#ea580c` | Hardcoded |
| Acción DELETE_LOGICO | dot timeline | `#dc2626` | Hardcoded |

### 3.3 Mapa de color semántico propuesto (para rediseño)

| Concepto | Token Propuesto | Valor |
|----------|-----------------|-------|
| Fondo página | `--bg-page` | `#f8fafc` (slate-50) |
| Fondo tarjeta | `--bg-card` | `#ffffff` |
| Borde sutil | `--border` | `#e2e8f0` (slate-200) |
| Texto principal | `--text-main` | `#1e293b` (slate-800) |
| Texto secundario | `--text-muted` | `#64748b` (slate-500) |
| Primario | `--primary` | `#1e40af` (azul institucional) |
| Éxito | `--success` | `#16a34a` |
| Advertencia | `--warning` | `#f59e0b` |
| Peligro | `--danger` | `#dc2626` |
| Top bar | `--topbar-bg` | `#1e293b` |
| Top bar activo | `--topbar-active` | `#334155` |

---

## 4. Flujo de Información Visual

### 4.1 Orden de lectura (patrón F + Z)

El dashboard sigue un patrón de lectura en **F invertida**:

1. **Welcome Card** (líneas 49-61): Primera fijación visual. Contiene título principal "Panel de control" y contexto narrativo.
2. **KPI Row** (líneas 64-127): Segunda fijación. Cinco métricas clave en fila horizontal. El ojo escanea de izquierda a derecha.
3. **Bottom Section** (líneas 130-208): Tercer área. Contenido denso (tabla + timeline) que requiere lectura detallada.

### 4.2 Jerarquía tipográfica actual

| Elemento | Font-size | Peso | Color | Función |
|----------|-----------|------|-------|---------|
| Título welcome | 22px | 700 | `--text-main` | Encabezado principal |
| Descripción welcome | 14px | 400 | `--text-muted` | Contexto |
| Valor KPI | 24px | 700 | `--text-main` | Dato más importante |
| Etiqueta KPI | 13px | 500 | `--text-muted` | Categoría |
| Subtítulo KPI | 12px | 400 | `--text-muted` | Unidad / contexto |
| Título sección | 18px | 600 | `--text-main` | Divisor de contenido |
| Celda tabla | 14px | 400/600 | `--text-main` | Dato tabular |
| Encabezado tabla | 12px | 600 | `--text-muted` | Etiqueta columna |
| Timeline label | 13px | 500 | `--text-main` | Acción |
| Timeline time | 12px | 400 | `--text-muted` | Temporalidad |

### 4.3 Flujo de datos

```
Mount
  │
  ├─► getDashboardStats()
  │     GET /dashboard/stats
  │     │
  │     ├─ Response:
  │     │   bases: [{ nombre, registros, datcorr, verificado }]
  │     │   total_registros, total_bases, total_datcorr, total_verificado
  │     │   usuarios_activos, total_usuarios
  │     │   altas_pendientes
  │     │   actividad: [{ fecha, usuario, accion, detalle }]
  │     │
  │     ├─► setStats(state)
  │     │     │
  │     │     ├─ KPI Row: mapea stats.total_* a 5 tarjetas
  │     │     │     ├─ Bases activas → stats.total_bases + top 3 bases
  │     │     │     ├─ Registros totales → stats.total_registros + breakdown
  │     │     │     ├─ Usuarios activos → stats.usuarios_activos + breakdown
  │     │     │     ├─ Altas pendientes → stats.altas_pendientes (condicional)
  │     │     │     └─ Actividad reciente → stats.actividad.length + top 3
  │     │     │
  │     │     └─ Bottom Section:
  │     │           ├─ Tabla: stats.bases[] (todas las bases)
  │     │           │     columnas: Base | Registros | DATCORR | VERIFICADO
  │     │           │     pie: totales globales
  │     │           │
  │     │           └─ Timeline: stats.actividad[] (últimas 15)
  │     │                 formateado con actionColor + actionIcon + formatDate
  │     │
  │     └─► catch → setError(message)
  │           └─ Pantalla de error con botón reintentar
  │
  └─ Estado intermedio: CircularProgress + "Cargando panel..."
```

### 4.4 Rutas de interacción

| Elemento | Interacción | Destino |
|----------|-------------|---------|
| KpiCard "Altas pendientes" | `onClick` | `/altas-pendientes` |
| KpiCard (otras) | Hover → expande detalles | Ninguna (solo informativo) |
| Botón "Reintentar" (error) | `onClick` | Re-ejecuta `getDashboardStats()` |
| Tabla registros | Ninguna | Solo visualización |
| Timeline | Ninguna | Solo visualización |

### 4.5 Accesibilidad actual

| Aspecto | Estado | Nota |
|---------|--------|------|
| HTML semántico | Parcial | `<table>` con `<thead>` y `<tfoot>` correctos; falta `<header>`, `<main>`, `<section>` |
| Navegación por teclado | Limitada | Botones tienen foco nativo; timeline y tabla no tienen interacciones |
| ARIA | Bajo | Sin `role`, `aria-label`, ni `aria-current` en secciones |
| Contraste | Bueno | Texto claro sobre fondo oscuro (tema LIGHT/DARK) |
| Hover como única interacción KPI | Problemático | Inaccesible en dispositivos táctiles |
| Estados de foco | No definidos | Sin outline personalizado; depende del browser |

---

## 5. Tipografía

- **Familia**: `'Open Sans', system-ui, sans-serif` (definida en `dashboardStyles.wrapper`, línea 320)
- ** pesos usados**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Escala**: 11px → 32px (error icon), rango efectivo 12px-26px para contenido
- **Tracking**: `-0.4px` en welcome title (único uso de letter-spacing)
- **Line-height**: 1.2 en valores KPI, 1.5 en info footer (no usado en Dashboard principal)

---

## 6. Espaciado y Dimensiones

| Elemento | Padding | Margin | Gap |
|----------|---------|--------|-----|
| Welcome card | 20px 24px | bottom 24px | - |
| KPI card | 18px 20px | - | 16px (row) |
| Card genérica | 20px 24px | - | 24px (bottom row) |
| Celda tabla | 12px 14px | - | - |
| Timeline row | - | bottom 0-16px | 12px |

**Problema**: No existe un sistema de spacing consistente (4px, 8px, 16px, 24px). Los valores se repiten pero sin tokenizar.

---

## 7. Componentes Reutilizables Identificados

| Componente | Actual | Potencial |
|------------|--------|-----------|
| Card contenedora | `cardStyles.card` | Extraer a componente `<Card>` |
| Título de sección | `sectionTitle` | Componente `<SectionTitle>` |
| KPI Card | `KpiCard` (función) | Mejorar con detalles estáticos |
| Timeline item | `tlStyles.row` | Componente `<TimelineItem>` |
| Tabla con totales | Inline | Componente `<DataTable>` |

---

## 8. Resumen Ejecutivo

El dashboard actual es funcional pero presenta oportunidades claras de optimización:

1. **Colores hardcodeados** en 10+ lugares rompen la escalabilidad del tema
2. **Hover como única vía** de acceso a detalles críticos (inaccesible)
3. **Sin sistema de spacing** tokenizado
4. **Jerarquía visual plana** entre KPIs: "Altas pendientes" (acción crítica) no se distingue visualmente
5. **Tabla sin indicadores visuales** de densidad o prioridad de datos
6. **Timeline sin filtros** ni agrupación de acciones

El rediseño debe priorizar:
- Tokenización completa de colores y espaciado
- Información crítica siempre visible (no hidden-by-default)
- Separación visual clara entre grupos de información
- Jerarquía tipográfica consistente
- Componentes atómicos reutilizables
