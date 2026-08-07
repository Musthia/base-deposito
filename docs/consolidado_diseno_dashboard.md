# Consolidado Técnico — Optimización y Rediseño del Dashboard

> **Documento**: Síntesis consolidada de análisis, identificación y propuesta de rediseño del Dashboard institucional.  
> **Fuente principal**: `frontend/src/pages/Dashboard.jsx` (474 líneas)  
> **Servicio de datos**: `frontend/src/services/dashboardService.js`  
> **Tema base**: `frontend/src/theme.js`  
> **Fecha**: 2026-08-06  
> **Objetivo**: Mejorar **legibilidad**, **prioridad visual de datos**, **coherencia estética** y **accesibilidad**, aplicando un sistema de diseño institucional moderno y gubernamental.

---

## 1. Resumen Ejecutivo

| Área | Estado actual | Propuesta consolidada |
|------|--------------|----------------------|
| **Colores** | 10+ valores hardcodeados fuera de tokens | Sistema de tokens CSS unificado; 0 hardcodeados |
| **Interacciones** | KPIs expuestos solo vía hover (inaccesible en táctil) | Información crítica siempre visible; interacción por click/tap y teclado |
| **Jerarquía visual** | Todos los KPIs con el mismo peso | Dato crítico ("Altas pendientes") destacado con borde acentuado y badge |
| **Sistema de espaciado** | Valores arbitrarios (16px, 24px, sin consistencia) | Sistema basado en múltiplos de 8 (`8/16/24/32px`) |
| **Tipografía** | Escala parcial (11px–32px), sin escala coherente | Escala tipográfica unificada, 3 niveles máximos por vista |
| **Accesibilidad** | HTML parcial, sin landmarks, sin ARIA, sin focus visible | WCAG 2.1 AA: landmarks semánticos, ARIA labels, foco visible |
| **Componentes reutilizables** | 3 componentes inline | 8+ componentes atómicos (`<Card>`, `<KpiCard>`, `<Badge>`, `<SectionTitle>`, `<DataTable>`, etc.) |

---

## 2. Principios Rectores

1. **Jerarquía clara**: lo más importante primero, con mayor tamaño y contraste.
2. **Agrupación visible**: tarjetas, listas y campos separados con espacio uniforme.
3. **Consistencia total**: un solo sistema de tokens de color, espaciado y radio.
4. **Accesibilidad universal**: sin dependencia de hover; soporte táctil y teclado.
5. **Reducción de carga cognitiva**: menos ruido, etiquetas explícitas, unidades claras.
6. **Prioridad institucional**: legibilidad y profesionalismo por encima de efectos decorativos.

---

## 3. Sistema de Diseño

### 3.1 Tokens de diseño (CSS)

```css
:root {
  /* ── Espaciado (base 8pt) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* ── Bordes y radios ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --border: #e2e8f0;
  --border-subtle: #f1f5f9;

  /* ── Tipografía ── */
  --font-family: 'Open Sans', system-ui, sans-serif;
  --text-xs: 11px;    /* caption / etiquetas */
  --text-sm: 13px;    /* subtítulos / auxiliares */
  --text-base: 14px;  /* cuerpo / datos tabulares */
  --text-lg: 16px;    /* subtítulos de sección */
  --text-xl: 18px;    /* títulos de sección */
  --text-2xl: 22px;   /* título de página / KPI valor */

  /* Pesos tipográficos */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ── Paleta institucional (modo claro) ── */
  --bg-page: #f8fafc;       /* fondo global */
  --bg-card: #ffffff;       /* fondo de tarjetas */
  --bg-muted: #f1f5f9;      /* fondos secundarios */
  --text-primary: #1e293b;  /* texto principal */
  --text-secondary: #64748b;/* texto secundario */
  --text-muted: #94a3b8;    /* texto de bajo contraste */
  --primary: #1e40af;       /* azul institucional */
  --primary-light: #dbeafe;
  --success: #16a34a;       /* estados positivos */
  --success-light: #dcfce7;
  --warning: #d97706;       /* estados de advertencia */
  --warning-light: #fef3c7;
  --danger: #dc2626;        /* errores y peligro */
  --danger-light: #fee2e2;
  --info: #0284c7;          /* información */
  --info-light: #e0f2fe;
}
```

### 3.2 Mapa de prioridad por color

| Prioridad | Concepto | Fondo | Borde | Texto |
|-----------|----------|-------|-------|-------|
| Alta | Acción requerida / Crítico | `--danger-light` | `--danger` | `--danger` |
| Media-Alta | Pendiente / En proceso | `--warning-light` | `--warning` | `--warning` |
| Media | Informativo activo | `--info-light` | `--info` | `--info` |
| Baja | Informativo positivo | `--success-light` | `--success` | `--success` |
| Neutra | Datos generales | `--bg-card` | `--border` | `--text-primary` |

---

## 4. Paleta de colores institucional

### 4.1 Tema claro (modo por defecto)

| Token CSS | Valor Hex | Uso en Dashboard |
|-----------|-----------|------------------|
| `--bg-page` | `#f8fafc` | Fondo global del layout |
| `--bg-card` | `#ffffff` | Fondo de tarjetas |
| `--border` | `#e2e8f0` | Bordes y divisores |
| `--text-primary` | `#1e293b` | Títulos, valores KPI, celdas |
| `--text-secondary` | `#64748b` | Etiquetas, subtítulos, tiempos |
| `--primary` | `#1e40af` | Acentos principales (institucional) |
| `--success` | `#16a34a` | Estados positivos |
| `--warning` | `#f59e0b` | Estados de advertencia |
| `--danger` | `#dc2626` | Errores / acciones destructivas |

### 4.2 Tokenización de colores semánticos (propuesta)

Reemplazar valores hardcodeados por tokens semánticos:

```js
const ACCENT = {
  datcorr: "var(--primary)",      // antes #0284c7
  verificado: "var(--success)",   // antes #16a34a
  pendiente: "var(--warning)",    // antes naranja EA580C
  alerta: "var(--danger)",        // rojo
};
```

### 4.3 Mapa de colores por acción (timeline)

| Acción | Token | Color |
|--------|-------|-------|
| LOGIN_SUCCESS | `--success` | `#16a34a` |
| CREATE | `--info` | `#0284c7` |
| UPDATE | `--warning` | `#ea580c` |
| DELETE_LOGICO / LOGIN_FAILED / LOGOUT_FAILED | `--danger` | `#dc2626` |
| LOGOUT_SUCCESS | `--text-secondary` | `#64748b` |
| TOKEN_* | `--info` (purple) | `#9333ea` → tokenizar como `--info-alt` |
| default | `--text-secondary` | `#64748b` |

---

## 5. Tipografía y Escalas

### 5.1 Escala tipográfica unificada

| Uso | Tamaño | Peso | Line-height |
|-----|--------|------|-------------|
| Título página | `--text-2xl` (22px) | 700 | 1.2 |
| Título sección | `--text-xl` (18px) | 600 | 1.3 |
| Subtítulo sección | `--text-lg` (16px) | 500 | 1.4 |
| Texto cuerpo | `--text-base` (14px) | 400 | 1.5 |
| Texto auxiliar | `--text-sm` (13px) | 400 | 1.5 |
| Etiqueta / Caption | `--text-xs` (11px) | 500 | 1.4 |
| Dato numérico KPI | `--text-2xl` (22px) | 700 | 1.2 |
| Dato tabular | `--text-base` (14px) | 400/600 | 1.4 |

### 5.2 Reglas de legibilidad

1. **Máximo 3 niveles tipográficos** por vista: título, cuerpo, auxiliar.
2. **Contraste mínimo**: 4.5:1 para texto normal, 3:1 para texto grande (>18px).
3. **Longitud de línea**: 60–80 caracteres en bloques de texto.
4. **Alineación**: izquierda en textos multilínea (nunca justificado).
5. **Números**: usar `font-variant-numeric: tabular-nums` en columnas numéricas.
6. **Unidades relativas**: usar `rem` o `em` (no `px` fijos) para escalar correctamente.

---

## 6. Sistema de espaciado

| Uso | Espacio |
|-----|---------|
| Entre tarjetas KPI | `--space-4` (16px) |
| Entre tarjetas de sección (welcome / bottom) | `--space-6` (24px) |
| Dentro de tarjeta (label → valor) | `--space-1` (4px) |
| Separación de sección dentro de tarjeta | `--space-4` (16px) |
| Tabla fila (vertical) | `--space-3` (12px) |
| Padding base tarjeta | `--space-5` (20px) |
| Padding base sección | `--space-6` (24px) |

---

## 7. Arquitectura del Dashboard

### 7.1 Layout general (patrón F invertida)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER — top bar (56px fijo)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── WELCOME / HEADER DE PÁGINA ─────────────────────────────────┐  │
│  │ padding: --space-5 --space-6, margin-bottom: --space-6        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── KPI ROW ────────────────────────────────────────────────────┐  │
│  │ grid: auto-fit minmax(220px, 1fr), gap: --space-4           │  │
│  │ margin-bottom: --space-6                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── TABLA REGISTROS ───────────────────────────────────────────┐  │
│  │ padding: --space-5, margin-bottom: --space-6                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── TIMELINE ──────────────────────────────────────────────────┐  │
│  │ padding: --space-5, margin-bottom: --space-6                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Orden de lectura

1. **Welcome Card** — primera fijación visual (título principal + contexto).
2. **KPI Row** — segunda fijación (escaneo izquierda → derecha).
3. **Bottom Section** — tercer área (tabla + timeline, lectura detallada).

---

## 8. Componentes

### 8.1 Welcome Card → Header de página

**Problema**: el título y el badge de versión compiten visualmente con los datos principales.

**Propuesta**:
```
┌───────────────────────────────────────────────────────────────┐
│ Panel de control                                      v8.1    │
│ Gestione y supervise las bases de datos documentales...       │
└───────────────────────────────────────────────────────────────┘
```

| Propiedad | Valor |
|-----------|-------|
| Fondo | `--bg-card` |
| Borde inferior | `2px solid --border` |
| Título | `--text-2xl`, peso 700, color `--text-primary` |
| Descripción | `--text-base`, peso 400, color `--text-secondary` |
| Badge | fondo `--bg-muted`, padding `--space-1 --space-2`, radius `--radius-sm` |

---

### 8.2 KPI Row → Métricas con prioridad visual

**Problema**: todos los KPIs tienen el mismo peso; "Altas pendientes" no destaca.

**Propuesta**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ B        │ │ R        │ │ U        │ │ ⚠ ALTAS │ │ A        │
│ Bases    │ │Registros │ │Usuarios  │ │Pendientes│ │Actividad │
│ 6        │ │ 1,234    │ │ 12       │ │   5      │ │  8       │
│ activas  │ │ totales  │ │activos   │ │solicitudes│ │acciones │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

| Propiedad | Valor |
|-----------|-------|
| Grid | `repeat(auto-fit, minmax(220px, 1fr))` |
| Gap | `--space-4` (16px) |
| Card base | fondo `--bg-card`, borde `1px solid --border`, padding `--space-5`, radius `--radius-md` |
| **KPI crítico** ("Altas pendientes") | borde `2px solid --danger`, badge superior "Requiere atención", icono `--danger` |
| **KPI con detalles** | Detalles **siempre visibles** (no hidden-by-default) |
| Icono | círculo `40px`, background derivado del color semántico (no hardcodeado) |
| Label | `--text-sm`, peso 500, color `--text-secondary` |
| Value | `--text-2xl`, peso 700, color `--text-primary` |
| Sub / Detalles | `--text-sm`, peso 400/500, color `--text-muted`/`--text-secondary` |

**Regla de prioridad**: 1 dato = 1 número grande; evitar dobles énfasis simultáneos (icono coloreado + borde + resaltado).

---

### 8.3 Bottom Section → Contenido apilado con separadores claros

**Problema**: tabla y timeline compiten en la misma fila; en pantallas pequeñas se apiñan.

**Propuesta**: apilar verticalmente con separador claro (`--space-6`).

#### Tabla "Registros por base"

```
┌─────────────────────────────────────────────────────────────┐
│ Registros por base                              Ver más →    │
├──────────┬──────────┬────────────┬────────────┬─────────────┤
│ Base     │Registros │ DATCORR    │ VERIFICADO │ % Progreso  │
├──────────┼──────────┼────────────┼────────────┼─────────────┤
│ ips      │ 450      │ 120        │ 330        │ ████████░░  │
│ pediatric│ 320      │ 80         │ 240        │ ██████░░░░  │
├──────────┼──────────┼────────────┼────────────┼─────────────┤
│ TOTAL    │ 1,234    │ 450        │ 784        │ ███████░░░  │
└──────────┴──────────┴────────────┴────────────┴─────────────┘
```

| Elemento | Estilo |
|----------|--------|
| Contenedor | fondo `--bg-card`, borde `1px solid --border`, radius `--radius-md`, `overflow: hidden` |
| Encabezados | fondo `--bg-muted`, texto `--text-xs`, peso 600, uppercase, letter-spacing 0.05em, padding `--space-3 --space-4` |
| Celdas | padding `--space-3 --space-4`, texto `--text-base`, border inferior `1px solid --border-subtle` |
| Valores numéricos | alineación derecha, peso 600, `tabular-nums` |
| Columna DATCORR | texto `--info`, background `--info-light` (10% opacidad) |
| Columna VERIFICADO | texto `--success`, background `--success-light` (10% opacidad) |
| Pie de tabla | fondo `--bg-muted`, border-top `2px solid --border`, peso 700 |
| **NUEVA**: % Progreso | barra visual (verificado / total) |
| Responsive | `overflow-x: auto`; columna sticky en móvil |

#### Timeline "Actividad reciente"

```
┌─────────────────────────────────────────────────────────────┐
│ Actividad reciente                              Ver todo →   │
│  ● Inicio de sesion                       Hace 2 min        │
│  │  admin · /login                                    │
│  ● Creacion                               Hace 15 min      │
│  │  usuario1 · /database/ips                           │
│  ● Actualizacion                          Hace 1 h         │
│  │  admin · /carga-datos                              │
└─────────────────────────────────────────────────────────────┘
```

| Elemento | Estilo |
|----------|--------|
| Contenedor | fondo `--bg-card`, borde `1px solid --border`, radius `--radius-md`, padding `--space-5` |
| Título | `--text-lg`, peso 600, con link "Ver todo →" alineado derecha |
| Icono | círculo `20px`, radius 50%, sin línea conectora vertical (reduce ruido) |
| Separación items | `--space-4` (16px) |
| Acciones críticas | icono background `--danger`, texto `--danger` |
| Acciones exitosas | icono background `--success` |

---

### 8.4 Cards (Tarjetas): estructura dinámica

| Propiedad | Valor |
|-----------|-------|
| Border radius | `--radius-md` (8px) |
| Sombra | sutil/difusa (`box-shadow` leve) — diseño plano preferido |
| Padding | mínimo `--space-4` (16px) en todos los lados |
| Jerarquía interna | Título arriba-izquierda (negrita, tamaño pequeño); dato principal debajo en tamaño grande |

---

### 8.5 Botones

| Variante | Padding | Font-size | Font-weight | Border-radius | Background | Texto |
|----------|---------|-----------|-------------|---------------|------------|-------|
| Primario | `--space-3 --space-5` | `--text-base` | 600 | `--radius-md` | `--primary` | `#ffffff` |
| Secundario | `--space-3 --space-5` | `--text-base` | 500 | `--radius-md` | transparente | `--text-primary` |
| Outline | `--space-3 --space-5` | `--text-base` | 500 | `--radius-md` | transparente | `--text-secondary` |
| Peligro | `--space-3 --space-5` | `--text-base` | 600 | `--radius-md` | `--danger` | `#ffffff` |
| Ghost / Link | `--space-2 --space-3` | `--text-sm` | 500 | 0 | transparente | `--primary` |

**Reglas**:
- Todos los botones: altura mínima `40px`.
- Focus visible: `outline: 2px solid --primary; outline-offset: 2px`.
- Hover: background oscurecido 10% o subrayado para ghost.
- Jerarquía: **1 botón primario** por sección; botones secundarios para acciones alternativas.
- Texto etiqueta: máximo 2 palabras (ej. "Exportar PDF", "Guardar").

---

### 8.6 Listas y tablas

| Propiedad | Regla |
|-----------|-------|
| Fila alterna | fondos sutiles solo si tabla > 10 columnas; si no, líneas divisorias `1px` (`--border-subtle`) |
| Alineación texto | izquierda |
| Alineación números/montos/fechas | derecha |
| Densidad fila | altura mínima `48px`; texto sin tocar bordes |
| Datos vacíos | guion medio (`-`) centrado |
| Columnas prioritarias (móvil) | ocultar secundarias; mostrar 2–3 principales + botón `...` para expandir |

---

### 8.7 Estados Loading y Error

#### Loading
- Fondo: `--bg-page`
- Spinner: MUI `CircularProgress`, color `--primary`, size 40px
- Texto: `--text-base`, `--text-secondary`, margin-top `--space-4`

#### Error
- Card: fondo `--bg-card`, borde `1px solid --danger-light`, radius `--radius-lg`, padding `--space-8`, max-width 400px
- Título: `--text-lg`, peso 600, `--text-primary`
- Descripción: `--text-base`, `--text-secondary`
- Botón "Reintentar": fondo `--primary`, texto blanco, padding `--space-3 --space-5`, radius `--radius-md`

**Nota**: mantener estados dentro del contenido (no pantalla completa 100vh) para no desalinear el layout.

---

## 9. Diseño Responsivo y Adaptativo

> Regla de oro: **diseñar primero para táctil**; el espacio se adaptará solo en desktop.

### 9.1 Grid por breakpoints

| Breakpoint | Columnas | Gap | Padding |
|------------|----------|-----|---------|
| ≥ 1280px | 12 | `--space-6` | `--space-8` |
| ≥ 1024px | 8 | `--space-5` | `--space-6` |
| ≥ 768px | 4 | `--space-4` | `--space-5` |
| < 768px | 2 | `--space-3` | `--space-4` |

### 9.2 Responsividad por componente

#### Cards adaptables
- PC: KPI cards en grid de 4 columnas.
- Móvil: colapsar a 1 columna vertical.
- Gráficos secundarios: **scroll horizontal** (carrusel táctil) en lugar de apilar infinito.

#### Botones y áreas táctiles
- **Tamaño mínimo**: `44x44px` (o `48x48px` según Google). El área invisible para tocar debe ser grande aunque el icono sea pequeño.
- **Separación anti-error**: `8px` mínimo entre botones.
- **Hover exclusivo**: prohibido. Toda información crucial debe ser visible sin pasar el mouse. Menús deben abrirse con click/tap.

#### Tablas flexibles
- **Transformación tabla → card**: en PC tabla tradicional; en móvil, cada fila se convierte en "minicard" vertical.
- **Columnas prioritarias**: ocultar secundarias en móvil; mantener 2–3 principales + botón `...` expandible.

#### Navegación multi-dispositivo
- **PC**: menú lateral izquierdo.
- **Móvil**: menú hamburguesa (`☰`) o barra inferior fija (4 secciones principales, al alcance del pulgar).
- **Filtros**: en PC fijos arriba; en móvil, botón "Filtrar" que abre modal pantalla completa.

---

## 10. Jerarquía y prioridad de datos

### 10.1 Matriz de prioridad

| Dato | Frecuencia uso | Impacto decisión | Visibilidad actual | Visibilidad objetivo |
|------|----------------|------------------|--------------------|--------------------|
| Total registros | Alta | Alta | KPI (visible) | KPI (visible) |
| Altas pendientes | Media | Alta | Hover-only | **Siempre visible** |
| Usuarios activos | Media | Media | KPI (visible) | KPI (visible) |
| Bases activas | Baja | Baja | KPI (visible) | KPI (visible) |
| Actividad reciente | Media | Baja | KPI + timeline | KPI + timeline |
| DATCORR vs VERIFICADO | Media | Media | Tabla | Tabla + barra progreso |
| Logins fallidos | Baja | Alta | Timeline (solo si ocurren) | Timeline con resalte |

### 10.2 Reglas de visualización

1. **Dato crítico**: nunca oculto. Si requiere contexto, mostrar inline (no en hover).
2. **Dato contextual**: visible, menor peso tipográfico.
3. **Dato complementario**: colapsable o segundo plano.
4. **Dato histórico**: timeline limitado a 5–8 items; link "Ver todo" para acceso completo.
5. **Dato comparativo**: usar color + barra visual (no solo números).

### 10.3 Aplicación al dashboard actual

| Elemento | Acción de priorización |
|----------|------------------------|
| "Altas pendientes" | Posición 1–2 en KPI row; badge "Acción requerida"; borde `--danger` |
| "Registros totales" | Posición 2; indicador de tendencia (↑/↓) |
| "Usuarios activos" | Mantener; mostrar % activos como barra pequeña |
| "Bases activas" | Mantener; reducir a icono + número si es necesario |
| Timeline | Agrupar por tipo de acción; resaltar fallidos y eliminaciones |
| Tabla | Agregar columna "% Verificado" con barra de progreso |

---

## 11. Accesibilidad

### 11.1 Checklist WCAG 2.1 AA

| Criterio | Estado | Propuesta |
|----------|--------|-----------|
| 1.1.1 Contenido no textual | ⚠ Parcial | Iconos decorativos + texto alternativo |
| 1.3.1 Info y relaciones | ⚠ Falta | Agregar landmarks: `<header>`, `<main>`, `<section>` |
| 1.4.1 Uso del color | ⚠ Insuficiente | Agregar icono o texto adicional a DATCORR/VERIFICADO |
| 1.4.3 Contraste (mínimo) | ✅ | Verificar ≥ 4.5:1 con herramienta |
| 1.4.11 Contraste no textual | ⚠ | Verificar tooltips |
| 2.1.1 Teclado | ⚠ Hover-only | Cambiar a click o visible-by-default |
| 2.4.1 Evitar bloqueo | ✅ | No hay modales bloqueantes |
| 2.4.7 Foco visible | ⚠ No definido | Agregar `outline` personalizado |
| 3.2.2 Al recibir entrada | ✅ | Sin cambios automáticos de contexto |
| 3.3.2 Etiquetas/instrucciones | ⚠ Sin `<caption>` | Agregar `<caption>` a tablas |
| 4.1.2 Nombre, rol, valor | ⚠ Sin ARIA | Agregar `aria-label` en secciones |

### 11.2 Navegación por teclado

| Elemento | Tab order | Teclas |
|----------|-----------|--------|
| Botones de top bar | Natural | Enter / Space |
| KPI clickeables | Natural | Enter / Space |
| Tabla | Lectura | Tab → celda por celda |
| Timeline | Lectura | Tab → item por item |
| Botón reintentar (error) | Natural | Enter / Space |

---

## 12. Componentes reutilizables

| Componente | Actual | Potencial reutilizable |
|------------|--------|------------------------|
| Card contenedora | `cardStyles.card` | `<Card>` |
| Título de sección | `sectionTitle` | `<SectionTitle>` |
| KPI Card | `KpiCard` (función) | `<KpiCard>` con detalles estáticos |
| Timeline item | `tlStyles.row` | `<TimelineItem>` |
| Tabla con totales | Inline | `<DataTable>` |
| Badge | — | `<Badge>` |
| Botones | Inline | `<Button>` (primario/secundario/outline/danger/ghost) |
| Estados loading/error | Inline | `<LoadingState>`, `<ErrorState>` |

---

## 13. Flujo de datos

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
  │     │           ├─ Tabla: stats.bases[]
  │     │           │     columnas: Base | Registros | DATCORR | VERIFICADO | % Progreso
  │     │           │     pie: totales globales
  │     │           └─ Timeline: stats.actividad[] (últimas 15)
  │     │                 formateado con actionColor + actionIcon + formatDate
  │     │
  │     └─► catch → setError(message)
  │           └─ Pantalla de error con botón reintentar
  │
  └─ Estado intermedio: CircularProgress + "Cargando panel..."
```

### Rutas de interacción

| Elemento | Interacción | Destino |
|----------|-------------|---------|
| KpiCard "Altas pendientes" | Click / tap | `/altas-pendientes` |
| KpiCard (otras) | Click → alterna detalle | Panel de detalle desplegable |
| Botón "Reintentar" (error) | Click | Re-ejecuta `getDashboardStats()` |
| Tabla registros | — | Solo visualización |
| Timeline | — | Solo visualización |

---

## 14. Optimizaciones de rendimiento

| Técnica | Aplicación | Beneficio |
|---------|-----------|-----------|
| `React.memo` en `KpiCard` | Props estables | Evita re-render de toda la fila al hoverear |
| Memoizar `formatAction` / `formatDate` | Listas timeline | Menos recálculos en render |
| Tokens CSS en `:root` | Todo el dashboard | 0 colores hardcodeados; bundle ~8KB |
| Componentes atómicos | Reutilización | Reducción de duplicación de estilos |

> Nota: para datos < 100 ítems, la memoización de formatos es innecesaria por ahora.

---

## 15. Plan de implementación por fases

| Fase | Alcance | Esfuerzo | Semana |
|------|---------|----------|--------|
| **1** | Infraestructura: crear `frontend/src/styles/tokens.css`; integrar tokens en `index.css`; actualizar `theme.js`; crear `<Card>`, `<SectionTitle>`, `<Badge>` | 1 sesión | 1 |
| **2** | Welcome Card y KPI Row: redefinir espaciado; detalles **siempre visibles** (no hover-only); prioridad visual para "Altas pendientes"; tokenizar colores de iconos | 1–2 sesiones | 1–2 |
| **3** | Tabla y Timeline: tokens de color; nueva columna "% Progreso" con barra visual; sticky first column en móvil; grupos visuales por tipo de acción; resalte acciones críticas; link "Ver todo" | 1 sesión | 2 |
| **4** | Estados y accesibilidad: loading/error dentro de contenido; landmarks semánticos (`<header>`, `<main>`, `<section>`); ARIA labels y roles; focus visible personalizado; pruebas de contraste y navegación por teclado | 1 sesión | 3 |
| **5** | Responsive y pulido: verificar breakpoints (1280px, 1024px, 768px, 375px); ajustar grid KPI para mobile (1–2 columnas); ajustar tabla para mobile (scroll horizontal + sticky column); pruebas en dispositivos reales | ½–1 sesión | 3 |

---

## 16. Checklist de validación

### Diseño
- [ ] Todos los colores usan tokens CSS (0 hardcodeados)
- [ ] Todos los espaciados usan tokens CSS (0 valores arbitrarios)
- [ ] Border radius consistente en todos los componentes
- [ ] Tipografía con máximo 3 niveles jerárquicos

### Información
- [ ] Dato crítico "Altas pendientes" visible sin interacción
- [ ] Todos los KPIs muestran detalles sin hover
- [ ] Timeline agrupa acciones por tipo
- [ ] Tabla muestra progreso visual (barras)

### Legibilidad
- [ ] Contraste verificado ≥ 4.5:1 en todos los textos
- [ ] Tamaño mínimo de fuente: 13px
- [ ] Padding consistente en todas las tarjetas

### Accesibilidad
- [ ] Navegación completa por teclado
- [ ] Focus visible en todos los elementos interactivos
- [ ] ARIA labels en secciones principales
- [ ] HTML semántico (`<header>`, `<main>`, `<section>`, `<table>`)

### Responsive
- [ ] Funcional en 1280px (desktop)
- [ ] Funcional en 1024px (laptop)
- [ ] Funcional en 768px (tablet)
- [ ] Funcional en 375px (móvil)

---

## 17. Métricas de éxito

| Métrica | Antes | Después |
|---------|-------|---------|
| Colores hardcodeados | 10+ | 0 |
| Información oculta por defecto | 3 KPI cards | 0 |
| Tiempo de carga visual | ~1.2s | < 1s |
| Tamaño bundle (estilos) | ~15KB inline | ~8KB tokens + componentes |
| Accesibilidad táctil | 0% (hover-only) | 100% (visible-by-default) |
| Contraste promedio | ~6:1 | ≥ 7:1 |
| Componentes reutilizables | 3 | 8+ |

---

## 18. Referencias y estándares

- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **GOV.UK Design System**: https://design-system.service.gov.uk/
- **Material Design 3**: https://m3.material.io/
- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Data Visualization Best Practices**: https://www.tableau.com/learn/articles/data-visualization
- **Diseño de dashboards**: Data Science Research, Databricks, Bismart, Excelmatic

---

## 19. Notas de implementación

1. **No eliminar funcionalidad**: todos los datos, rutas y permisos se preservan.
2. **Migración gradual**: implementar por fases para minimizar riesgo.
3. **Backward compatibility**: mantener `KpiCard` como componente exportado durante la transición.
4. **Testing**: probar con datos reales del entorno de producción (no solo mocks).
5. **Feedback de usuario**: involucrar usuarios reales en pruebas de legibilidad antes de cerrar la fase 5.
