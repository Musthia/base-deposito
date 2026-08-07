# DatCorr — Dashboard: Diseño y Optimización

Apuesta: **estilo moderno, profesional e institucional a modo gubernamental**, priorizando **lectura y comprensión rápida** sin sacrificar modernidad ni seriedad.

---

## 1. Decisión de diseño (la síntesis)

Se conserva la **identidad Navy "Azul Marino Profundo"** actual de DatCorr (consistencia de marca) y se le aplican las **buenas prácticas**: jerarquía, agrupación, tokenización, accesibilidad y responsive. La propuesta "light/white" de dos de los documentos (estilo GOV.UK) **no se adopta literalmente** porque rompería la marca; en su lugar se usa su **metodología** (contraste, lectura Z, componentes uniformes) sobre la paleta oscura institucional.

| Decisión             | Opción elegida                                | Por qué                         |
| --------------------- | ---------------------------------------------- | -------------------------------- |
| Tema                  | Mariño institucional existente (fondo oscuro) | Consistencia de marca            |
| Legibilidad           | Contraste ≥ 4.5:1, texto claro sobre card     | La guía de legibilidad          |
| Jerarquía            | 3 niveles tipográficos máx.                  | Lo proponen los 5 docs           |
| Información crítica | **Siempre visible** (no hover)           | Todas las fuentes                |
| Estilo                | Plano + bordes sutiles + radius 8–12px        | Moderno y sobrio                 |
| Tono                  | Institucional / gubernamental                  | Misión gubernamental de DatCorr |

---

## 2. Principios rectores (adaptados)

| Principio                     | Regla operativa                                                  |
| ----------------------------- | ---------------------------------------------------------------- |
| Priorización (Nivel 1→2→3) | Dato crítico grande y oscuro; contexto medio; detalle menor     |
| Proximidad                    | Relacionados juntos (gap 8px); grupos separados (≥16px)         |
| Consistencia                  | Un token para botones, campos, listas y cards                    |
| Legibilidad                   | Fuente mín 13px interfaz / 14px datos; yes/4.5:1 contraste      |
| Claridad                      | 1 botón primario por área; números a la derecha, tabular-nums |

---

## 3. Sistema de tokens de diseño (definitivo)

### Espaciado (escala 8px)

```css
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px;
```

### Bordes

```css
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
--border-main: #2a3050;       /* separadores fuertes */
--border-subtle: #1f2740;     /* divisores finos */
```

### Tipografía

```css
--font-family: 'Open Sans', system-ui, sans-serif;
--text-xs: 11px; --text-sm: 13px; --text-base: 14px;
--text-lg: 16px; --text-xl: 18px; --text-2xl: 22px; --text-3xl: 26px;
--weight-400/500/600/700;
```

### Colores (mariño institucional + estados semánticos)

```css
--bg-page:      #0a0e1a;
--bg-card:      #141a2e;
--bg-muted:     #0f1425;      /* encabezados/zonas atenuadas */
--text-primary: #f0f2f5;
--text-secondary: #aeb6cf;    /* leve entre primary y muted */
--text-muted:   #8896b8;

--primary:      #2563eb;      /* marca / acciones principales */
--primary-light: rgba(37,99,235,.15);
--success:      #34d399;      --success-light: rgba(52,211,153,.15);
--warning:      #f59e0b;      --warning-light: rgba(245,158,11,.18);
--danger:       #f87171;      --danger-light:  rgba(248,113,113,.18);
--info:         #60a5fa;      --info-light:    rgba(96,165,250,.15);
```

### Mapa de prioridad por color (niveles)

| Nivel              | Concepto                                      | Fondo               | Borde         | Texto              |
| ------------------ | --------------------------------------------- | ------------------- | ------------- | ------------------ |
| **Crítico** | Acción requerida (Altas pendientes, errores) | `--danger-light`  | `--danger`  | `--danger`       |
| **Alta**     | Pendiente / en proceso                        | `--warning-light` | `--warning` | `--warning`      |
| **Media**    | Informativo activo (DATCORR)                  | `--info-light`    | `--info`    | `--info`         |
| **Bajo**     | Positivo / realizado (VERIFICADO)             | `--success-light` | `--success` | `--success`      |
| **Neutro**   | Datos generales                               | `--bg-card`       | `--border`  | `--text-primary` |

> Color = **semántica**, no decoración. Rojo solo peligro, amarillo solo advertencia, verde solo éxito.

---

## 3. Arquitectura de estilos (refactor recomendado)

| Hoy                                          | Meta                                                |
| -------------------------------------------- | --------------------------------------------------- |
| Objetos CSS-in-JS inline en`Dashboard.jsx` | Tokens CSS + componentes atómicos                  |
| Colores hex hardcodeados (10+)               | Tokens`--success`, `--info`, etc.               |
| `KpiCard` con hover-only                   | `<KpiCard>` con detalle siempre visible           |
| Tabla inline                                 | `<DataTable>` con `colgroup` y `% Verificado` |

**Componentes base a crear**: `<Card>`, `<SectionTitle>`, `<Badge>`, `<KpiCard>`, `<TimelineItem>`, `<DataTable>`, `<Button>`.

---

## 4. Rediseño por componente (layout del dashboard)

```
┌─────────────────────────────────────────────────────────────┐  HEADER (56px, --topbar-bg)
├─────────────────────────────────────────────────────────────┤
│  HEADER PÁGINA (welcome)                                     │  --bg-card · borde inf --border
│  "Panel de control"                      [v8.1]              │  título 22/700 · desc 14/muted
├─────────────────────────────────────────────────────────────┤
│  KPI ROW   grid auto-fit minmax(220px,1fr) · gap 16          │  ← nivel 2 (enfoque)
│  [CRÍTICO ALERTA] [Registros] [Usuarios] [Bases] [Actividad] │
├─────────────────────────────────────────────────────────────┤
│  TABLA "Registros por base"                    [Ver más →]    │  ← nivel 3 (detalle)
│  Base | Registros | DATCORR | VERIFICADO | % Progreso        │
├─────────────────────────────────────────────────────────────┤
│  TIMELINE "Actividad reciente"                 [Ver todo →]   │  ← nivel 3 (detalle)
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Header de página

- Fondo `--bg-card`, borde inferior `2px solid --border`.
- Órden: título a la izquierda, versión discreta a la derecha.
- No compite con KPIs (sin sombra, sin badge llamativo).

### 4.2 KPI Cards — prioritización y accesibilidad

- Todos los KPIs muestran su **detalle siempre visible** (fin del hover-only) → usable en PC y táctil.
- **KPI crítico "Altas pendientes"**:
  - Borde `2px solid --danger`, badge superior "Requiere atención" (`--danger`).
  - Se **reordena a posición 1** (o 2) dentro de la fila.
- Iconos tokenizados: círculo 40px con fondo derivado de `--info-light`/`--success-light`/etc. (no hex hardcoded).
- Tipografía KPI: label `13/muted`, valor `22–26/700/primary`, sub `12/muted`, detalle `12/secondary`.
- Clickables (`onClick` a `/altas-pendientes`): cursor pointer + `role=button` + `tabIndex=0` + arrow "→".

### 4.3 Tabla "Registros por base"

- Card `--bg-card`, borde `--border-subtle`, radius `--radius-md`, `overflow:hidden`.
- Cabecera: `--bg-muted`, `--text-xs/700`, uppercase, `letter-spacing .05em`.
- Celdas: padding `12px 14px`, números a la derecha con `tabular-nums`.
- Columna **DATCORR** → texto `--info`, celda `--info-light`.
- Columna **VERIFICADO** → texto `--success`, celda `--success-light`.
- **Nueva columna "% Progreso"** con barra visual débil (verificado/total) → dato comparativo entendible en un vistazo.
- Pie de tabla: `--bg-muted`, border-top `2px solid --border`, peso 700, totales.
- UX: `caption` accesible; si columna vacía, usar "–".

### 4.4 Timeline "Actividad reciente"

- Card `--bg-card`, radius `--radius-md`, padding `--space-5`.
- Título + link "Ver todo →" a la derecha.
- Íconos círculo 20px (sin línea conectora para reducir ruido).
- **Agrupar por tipo** y resaltar críticas: `LOGIN_FAILED`/`DELETE_LOGICO` → `--danger`; éxitos → `--success`.
- Límite 5–8 items con acceso al historial completo.

### 4.2 (estados) Loading / Error

- **Loading**: `CircularProgress --primary` centrado + "Cargando…", dentro del área de contenido (no 100vh).
- **Error**: card `--danger-light`, título, descripción textual, botón **Primario `--primary`** "Reintentar".

---

## 5. Priorización de datos (matriz)

| Dato                       | Impacto        | Frecuencia | Visibilidad                                    |
| -------------------------- | -------------- | ---------- | ---------------------------------------------- |
| Registros totales          | Alta           | Alta       | KPI (pos 1–2)                                 |
| **Altas pendientes** | **Alta** | Media      | **KPI crítico, SIEMPRE visible, pos 1** |
| Usuarios activos           | Media          | Media      | KPI                                            |
| Bases activas              | Baja           | Baja       | KPI compacto                                   |
| Actividad reciente         | Baja           | Media      | KPI + timeline                                 |
| DAT vs VERIF               | Media          | Media      | Tabla + barra %                                |

**Reglas**:

1. Dato crítico nunca oculto (inline, no hover).
2. Contexto con menor peso tipográfico.
3. Complementario colapsable o discreto.
4. La crítica va primero; lo auxiliar después.

---

## 6. Guía de componentes uniformes

| Componente        | Padding | Radius | Fuente | Fondo / borde                       | Texto              |
| ----------------- | ------- | ------ | ------ | ----------------------------------- | ------------------ |
| Botón primario   | 12/20   | 8      | 14/600 | `--primary`                       | blanco             |
| Botón secundario | 12/20   | 8      | 14/500 | transparente /`--border`          | `--text-primary` |
| Botón peligro    | 12/20   | 8      | 14/600 | `--danger`                        | blanco             |
| Input             | 8/12    | 40     | 14     | `--bg-card` / `--border`        | `--text-primary` |
| Tabla celda       | 12/14   | ≥40   | 14     | borde`--border-subtle`            | según columna     |
| Card              | 20      | —     | —     | `--bg-card` / `--border-subtle` | —                 |

Reglas: un **flecha primario** por área; target **≥ 44px**; separación **≥8px** entre botones; focus visible `outline 2px --primary offset 2`; hover +10% de tono.

---

## 7. Tipografía y legibilidad

| Uso              | Tamaño | Peso | Line-height |
| ---------------- | ------- | ---- | ----------- |
| Título página  | 22      | 700  | 1.2         |
| Título sección | 18      | 600  | 1.3         |
| Texto cuerpo     | 14      | 400  | 1.5         |
| Etiqueta/Caption | 11–13  | 500  | 1.4         |
| Dato KPI         | 22      | 700  | 1.2         |

- **Contraste** ≥ 4.5:1 texto normal, ≥ 3:1 texto grande (>18px).
- Números con `font-variant-numeric: tabular-nums`.
- **Máximo 3 niveles tipográficos por vista**.
- Filas de tabla mín. 40–48px.

---

## 8. Layout y responsive

| Breakpoint | Columnas | Gap | Padding |
| ---------- | -------- | --- | ------- |
| ≥1280px   | 12       | 24  | 32      |
| ≥1024px   | 8        | 20  | 24      |
| ≥768px    | 4        | 16  | 20      |
| <768px     | 2        | 12  | 16      |

CEPAL responsive:

- KPI grid colapsa a 1–2 columnas en móvil (flex/grid).
- Tabla: `overflow-x auto` + sticky primera columna en móvil; ocultar columnas secundarias con "… para más".
- **Diseñ First touch**: todos los toggles por click/tap, targets ≥44px, separación ≥8px.

---

## 9. Accesibilidad (WCAG 2.1 AA) — prioridad alta

| Criterio           | Medida concreta                                                 |
| ------------------ | --------------------------------------------------------------- |
| 1.3.1 Semántica   | `<header>`, `<main>`, `<section>`, `<caption>` de tabla |
| 1.4.1 Color        | No usar color como único significado (icono + texto)           |
| 1.4.3 Contraste    | Verificar ≥4.5:1                                               |
| 2.1.1 Teclado      | KPI clickeables por Enter/Space                                 |
| 2.4.7 Foco visible | Outline personalizado`--primary`                              |
| 3.2.2              | Sin cambios de contexto automáticos                            |
| 4.1.2              | `aria-label`, `role`, `aria-current` en secciones         |

---

## 10. Plan por fases (ejecución)

| Fase                             | Alcance                                                                                                                                     | Entregable                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **1. Infraestructura**     | Crear`styles/tokens.css`, integrar a `index.css`, actualizar `theme.js`, crear `<Card>`/`<SectionTitle>`/`<Badge>`/`<Button>` | Sistema de tokens activo     |
| **2. KPI + Header**        | Header página, KPI con detalle visible, prioridad crítica, tokenizar iconos                                                               | KPI accesibles y priorizados |
| **3. Tabla + Timeline**    | Tabla con`colgroup` + % Progreso + sticky col; timeline agrupado y resaltado                                                              | Detalle legible              |
| **4. Estados + Acceso**    | Loading/Error en contenido; landmarks, ARIA, focus visible                                                                                  | WCAG AA                      |
| **5. Responsive + pulido** | Breakpoints 1280/1024/768/375; grid KPI móvil; verificación contraste                                                                     | Responsive total             |

**Verificación por fase**: `npm run build` (vite) sin errores; revisar contraste en dark; probar click táctil; mantener 100% de funcionalidad y permisos.

---

## 10. Métricas de éxito y checklist

| Métrica                  | Antes         | Después                 |
| ------------------------- | ------------- | ------------------------ |
| Colores hardcodeados      | 10+           | 0                        |
| Datos críticos ocultos   | 3 KPI (hover) | 0                        |
| Tiempo de comprensión    | ~1.2s         | ≤ 5s para 3 datos clave |
| Accesibilidad táctil     | 0% (hover)    | 100% visible             |
| Contraste                 | ~6:1          | ≥ 7:1                   |
| Componentes reutilizables | 3             | 8+                       |

**Checklist**

- [ ] 0 colores hardcodeados (todo token)
- [ ] 0 espaciados arbitrarios
- [ ] "Altas pendientes" visible sin interacción, en posición 1
- [ ] Tipografía ≤ 3 niveles
- [ ] Contraste ≥ 4.5:1
- [ ] Navegación completa por teclado + focus visible
- [ ] Funcional en 1280/1024/768/375px

---

## 11. Riesgos y precauciones

1. **No romper funcionalidad/permissions**: preservar todas las rutas, datos y `usePermissions.isConsulta`.
2. **Consistencia de marca**: evitar el salto a tema claro; el "light" de los docs se usa solo como fuente de mejores prácticas, no para reemplazar la paleta.
3. **Modernidad vs. seriedad**: priorizar contraste alto, bordes sutiles y números claros; evitar decoración excesiva. Estilo institucional, sobrio, confiable.
4. **Backward compatibility**: mantener `KpiCard` como export durante la transición.

---

## 12. Referencias de estándar

- GOV.UK Design System · Material Design 3 · Apple HIG
- WCAG 2.1 AA · Data Visualization Best Practices (Tableau)

> **Fuente de las métricas/contenido**: síntesis directa de los 5 documentos consolidados y de la inspección real de `frontend/src/pages/Dashboard.jsx`, `frontend/src/theme.js` y `dashboardService.js`.
