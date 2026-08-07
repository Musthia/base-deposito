# Plan de Optimización y Rediseño del Dashboard

> Enfoque: legibilidad, priorización visual de datos, separación uniforme de componentes.
> Basado en: `frontend/src/pages/Dashboard.jsx`, `frontend/src/theme.js`, `docs/dashboard_identificacion_diseno.md`

---

## 1. Objetivos de Rediseño

| Objetivo | Métrica de éxito |
|----------|------------------|
| Reducir tiempo de comprensión del panel | ≤ 5 segundos para identificar los 3 datos más importantes |
| Hacer visible toda la información crítica sin interacción | 0 datos críticos ocultos por defecto |
| Unificar sistema de espaciado y colores | 100% de estilos usan tokens, 0 colores hardcodeados |
| Mejorar legibilidad en pantallas ≤ 1024px | Contenido usable sin scroll horizontal innecesario |
| Garantizar accesibilidad táctil y teclado | WCAG 2.1 AA (contraste ≥ 4.5:1, foco visible) |

---

## 2. Principios de Diseño Aplicados

### 2.1 Priorización visual (Visual Hierarchy)
- **Nivel 1**: Dato más importante → tamaño mayor, peso 700, color oscuro
- **Nivel 2**: Contexto del dato → tamaño medio, peso 500, color muted
- **Nivel 3**: Detalle complementario → tamaño menor, peso 400, color muted
- **Regla**: Nunca ocultar Nivel 1 detrás de hover o click

### 2.2 Separación de grupos (Grouping)
- **Proximidad**: Elementos relacionados se agrupan con gap reducido (8px)
- **Alineación**: Todos los grupos comparten la misma cuadrícula base
- **Contenedores**: Cada grupo tiene un contenedor visual delimitado (borde o background)
- **Regla**: La separación entre grupos debe ser mayor que la separación intra-grupo

### 2.3 Consistencia (Consistency)
- **Botones**: Mismo padding, border-radius, tipografía en todos los botones
- **Campos**: Mismo alto, borde, padding en inputs y tablas
- **Listas**: Mismo inter-lineado, icono, alineación en timelines y listados
- **Cuadros/Cards**: Mismo padding, border-radius, sombra en todas las tarjetas

### 2.4 Legibilidad (Readability)
- **Tamaño mínimo de fuente**: 13px para texto de interfaz, 14px para datos tabulares
- **Ancho de línea**: 60-80 caracteres máximo en bloques de texto
- **Contraste**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Espaciado entre líneas**: 1.5 para párrafos, 1.2 para datos densos

---

## 3. Sistema de Diseño Propuesto

### 3.1 Tokens de diseño

```css
:root {
  /* Espaciado */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Bordes */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --border: #e2e8f0;
  --border-subtle: #f1f5f9;

  /* Tipografía */
  --font-family: 'Open Sans', system-ui, sans-serif;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 22px;

  /* Pesos */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Colores */
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --bg-muted: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --primary: #1e40af;
  --primary-light: #dbeafe;
  --success: #16a34a;
  --success-light: #dcfce7;
  --warning: #d97706;
  --warning-light: #fef3c7;
  --danger: #dc2626;
  --danger-light: #fee2e2;
  --info: #0284c7;
  --info-light: #e0f2fe;
}
```

### 3.2 Mapa de prioridad por color

| Prioridad | Concepto | Color de fondo | Color de borde | Color de texto |
|-----------|----------|----------------|----------------|----------------|
| Alta | Acción requerida / Crítico | `--danger-light` | `--danger` | `--danger` |
| Media-Alta | Pendiente / En proceso | `--warning-light` | `--warning` | `--warning` |
| Media | Informativo activo | `--info-light` | `--info` | `--info` |
| Baja | Informativo positivo | `--success-light` | `--success` | `--success` |
| Neutra | Datos generales | `--bg-card` | `--border` | `--text-primary` |

---

## 4. Rediseño por Componente

### 4.1 Welcome Card → Header de Página

**Problema actual**: Compite visualmente con los KPIs; el título es demasiado prominente.

**Propuesta**:
```
┌─────────────────────────────────────────────────────────────┐
│ Panel de control                           v8.1              │
│ Gestione y supervise las bases de datos documentales...     │
└─────────────────────────────────────────────────────────────┘
```

**Cambios**:
- Fondo: `--bg-card` con borde inferior `2px solid --border` (sin sombra)
- Título: `--text-2xl`, peso 700, color `--text-primary`
- Descripción: `--text-base`, peso 400, color `--text-secondary`
- Badge: fondo `--bg-muted`, padding `--space-1 --space-2`, border-radius `--radius-sm`
- Padding: `--space-5 --space-6`
- Margin bottom: `--space-6`

### 4.2 KPI Row → Métricas con Prioridad Visual

**Problema actual**: Todos los KPIs tienen el mismo peso; "Altas pendientes" no destaca.

**Propuesta**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ B        │ │ R        │ │ U        │ │ ⚠ ALTAS │ │ A        │
│ Bases    │ │Registros │ │Usuarios  │ │Pendientes│ │Actividad │
│ 6        │ │ 1,234    │ │ 12       │ │   5      │ │  8       │
│ activas  │ │ totales  │ │activos   │ │solicitudes│ │acciones │
│          │ │DATCORR   │ │Reg: 15   │ │          │ │LOGIN x3 │
│Base 1    │ │VERIFICADO│ │Act: 12   │ │          │ │CREATE x5│
│Base 2    │ │          │ │Inac: 3   │ │          │ │          │
│Base 3    │ │          │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Cambios**:
- Grid: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`
- Gap: `--space-4` (16px)
- Card base: fondo `--bg-card`, borde `1px solid --border`, padding `--space-5`, border-radius `--radius-md`
- **KPI Crítico ("Altas pendientes")**: borde `2px solid --danger`, badge superior con texto "Requiere atención", color de icono `--danger`
- **KPI con detalles**: Detalles SIEMPRE visibles debajo del valor (no hidden-by-default)
- Iconos: círculo de `40px` con background derivado del color semántico (no hardcodeado)
- Tipografía:
  - Label: `--text-sm`, peso 500, color `--text-secondary`
  - Value: `--text-2xl`, peso 700, color `--text-primary`
  - Sub: `--text-sm`, peso 400, color `--text-muted`
  - Detalles: `--text-sm`, peso 400, color `--text-secondary`

### 4.3 Bottom Section → Contenido Apilado con Separadores Claros

**Problema actual**: Tabla y timeline compiten en la misma fila; en pantallas pequeñas se apiñan.

**Propuesta**:
```
┌─────────────────────────────────────────────────────────────┐
│ Registros por base                              Ver más →    │
├──────────┬──────────┬────────────┬────────────┬─────────────┤
│ Base     │Registros │ DATCORR    │ VERIFICADO │ % Progreso  │
├──────────┼──────────┼────────────┼────────────┼─────────────┤
│ ips      │ 450      │ 120        │ 330        │ ████████░░  │
│ pediatric│ 320      │ 80         │ 240        │ ██████░░░░  │
│ ...      │          │            │            │             │
├──────────┼──────────┼────────────┼────────────┼─────────────┤
│ TOTAL    │ 1,234    │ 450        │ 784        │ ███████░░░  │
└──────────┴──────────┴────────────┴────────────┴─────────────┘

───────────────────────────────────────────────────────────────

│ Actividad reciente                              Ver todo →   │
│                                                             │
│ ● Inicio de sesion                         Hace 2 min      │
│ │  admin · /login                                         │
│ │                                                          │
│ ● Creacion                               Hace 15 min      │
│ │  usuario1 · /database/ips                               │
│ │                                                          │
│ ● Actualizacion                          Hace 1 h         │
│ │  admin · /carga-datos                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Cambios en tabla**:
- Contenedor: fondo `--bg-card`, borde `1px solid --border`, border-radius `--radius-md`, overflow hidden
- Encabezados: fondo `--bg-muted`, texto `--text-xs`, peso 600, uppercase, letter-spacing 0.05em, padding `--space-3 --space-4`
- Celdas: padding `--space-3 --space-4`, texto `--text-base`, borde inferior `1px solid --border-subtle`
- Valores numéricos: alineación derecha, peso 600, tabular-nums
- **Columna DATCORR**: texto `--info`, background celda `--info-light` (10% opacidad)
- **Columna VERIFICADO**: texto `--success`, background celda `--success-light` (10% opacidad)
- Pie de tabla: fondo `--bg-muted`, border-top `2px solid --border`, peso 700
- **NUEVA**: Columna "% Progreso" con barra visual de progreso (verificado / total)
- Responsive: `overflow-x: auto` con scroll sutil; sticky first column en móvil

**Cambios en timeline**:
- Contenedor: fondo `--bg-card`, borde `1px solid --border`, border-radius `--radius-md`, padding `--space-5`
- Título: `--text-lg`, peso 600, con link "Ver todo →" alineado derecha
- Icono: círculo de `20px`, border-radius 50%, sin línea conectora vertical (reduce ruido visual)
- Separación entre items: `--space-4` (16px)
- Acciones críticas (LOGIN_FAILED, DELETE_LOGICO): icono con background `--danger`, texto en `--danger`
- Acciones exitosas: icono con background `--success`

### 4.4 Estados Loading y Error → Accesibles y Claros

**Loading**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [CircularProgress size={40}]                    │
│              Cargando panel de control...                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Fondo: `--bg-page`
- Spinner: MUI `CircularProgress` con color `--primary`
- Texto: `--text-base`, color `--text-secondary`, margin-top `--space-4`

**Error**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        ⚠                                    │
│              Error al cargar el panel                        │
│              No se pudo obtener la información del servidor  │
│                                                             │
│              [ Reintentar ]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Card: fondo `--bg-card`, borde `1px solid --danger-light`, border-radius `--radius-lg`, padding `--space-8`, max-width 400px
- Título: `--text-lg`, peso 600, color `--text-primary`
- Descripción: `--text-base`, color `--text-secondary`
- Botón: fondo `--primary`, texto blanco, padding `--space-3 --space-5`, border-radius `--radius-md`, hover `--primary` oscurecido 10%

---

## 5. Criterios de Priorización de Datos

### 5.1 Matriz de prioridad

| Dato | Frecuencia de uso | Impacto de decisión | Visibilidad actual | Visibilidad objetivo |
|------|-------------------|---------------------|--------------------|--------------------|
| Total registros | Alta | Alta | Visible (KPI) | Visible (KPI) |
| Altas pendientes | Media | Alta | Hover-only | SIEMPRE visible |
| Usuarios activos | Media | Media | Visible (KPI) | Visible (KPI) |
| Bases activas | Baja | Baja | Visible (KPI) | Visible (KPI) |
| Actividad reciente | Media | Baja | Visible (KPI + timeline) | Visible (KPI + timeline) |
| DATCORR vs VERIFICADO | Media | Media | Tabla | Tabla + barra progreso |
| Logins fallidos | Baja | Alta | Timeline (solo si ocurren) | Timeline con resalte |

### 5.2 Reglas de visualización

1. **Dato crítico**: Nunca oculto. Si requiere contexto, mostrarlo inline (no en hover).
2. **Dato contextual**: Visible pero con menor peso tipográfico.
3. **Dato complementario**: Colapsable o en segundo plano.
4. **Dato histórico**: Timeline con límite de 5-8 items; link "Ver todo" para acceso completo.
5. **Dato comparativo**: Usar color + barra visual (no solo números).

### 5.3 Aplicación al Dashboard actual

| Elemento | Acción de priorización |
|----------|------------------------|
| "Altas pendientes" | Mover a posición 1 o 2 en KPI row; agregar badge "Acción requerida" |
| "Registros totales" | Mantener posición 2; agregar indicador de tendencia (↑/↓) |
| "Usuarios activos" | Mantener; mostrar % de activos como barra pequeña |
| "Bases activas" | Mantener; reducir a icono + número si es necesario |
| Timeline | Agrupar por tipo de acción; resaltar fallidos y eliminaciones |
| Tabla | Agregar columna "% Verificado" con barra de progreso |

---

## 6. Guía de Componentes Uniformes

### 6.1 Botones

| Variante | Padding | Font-size | Font-weight | Border-radius | Background | Color |
|----------|---------|-----------|-------------|---------------|------------|-------|
| Primario | `--space-3 --space-5` | `--text-base` | 600 | `--radius-md` | `--primary` | `#ffffff` |
| Secundario | `--space-3 --space-5` | `--text-base` | 500 | `--radius-md` | transparent | `--text-primary` |
| Outline | `--space-3 --space-5` | `--text-base` | 500 | `--radius-md` | transparent | `--text-secondary` |
| Peligro | `--space-3 --space-5` | `--text-base` | 600 | `--radius-md` | `--danger` | `#ffffff` |
| Ghost / Link | `--space-2 --space-3` | `--text-sm` | 500 | 0 | transparent | `--primary` |

**Reglas**:
- Todos los botones usan la misma altura mínima: `40px`
- Focus visible: outline `2px solid --primary`, offset `2px`
- Hover: background oscurecido 10% o underline para ghost

### 6.2 Campos de Input

| Propiedad | Valor |
|-----------|-------|
| Height | `40px` |
| Padding | `--space-2 --space-3` |
| Border | `1px solid --border` |
| Border-radius | `--radius-md` |
| Font-size | `--text-base` |
| Focus border | `--primary` |
| Placeholder color | `--text-muted` |
| Background | `--bg-card` |

### 6.3 Listas y Timeline

| Propiedad | Valor |
|-----------|-------|
| Item padding | `--space-3 0` |
| Icono size | `20px` (pequeño) / `32px` (mediano) |
| Separador | `1px solid --border-subtle` |
| Alineación icono | Centro vertical |
| Alineación texto | Izquierda, alineado con icono |
| Gap icono-texto | `--space-3` |

### 6.4 Tarjetas / Cuadros

| Propiedad | Valor |
|-----------|-------|
| Background | `--bg-card` |
| Border | `1px solid --border` |
| Border-radius | `--radius-md` |
| Padding | `--space-5` |
| Shadow | `none` (diseño plano) |
| Gap interno | `--space-4` |
| Margin bottom | `--space-6` |

**Variante con borde izquierdo destacado** (para información importante):
```css
border-left: 4px solid --primary;
```

**Variante con header** (tabla, timeline):
```css
border-top: 2px solid --border;
```

---

## 7. Tipografía y Legibilidad

### 7.1 Escala tipográfica unificada

| Uso | Tamaño | Peso | Line-height |
|------|--------|------|-------------|
| Título página | `--text-2xl` | 700 | 1.2 |
| Título sección | `--text-xl` | 600 | 1.3 |
| Subtítulo sección | `--text-lg` | 500 | 1.4 |
| Texto cuerpo | `--text-base` | 400 | 1.5 |
| Texto auxiliar | `--text-sm` | 400 | 1.5 |
| Etiqueta / Caption | `--text-xs` | 500 | 1.4 |
| Dato numérico KPI | `--text-2xl` | 700 | 1.2 |
| Dato tabular | `--text-base` | 400/600 | 1.4 |

### 7.2 Reglas de legibilidad

1. **Máximo 3 niveles tipográficos por vista**: título, cuerpo, auxiliar
2. **Contraste mínimo**: 4.5:1 para texto normal, 3:1 para texto grande (>18px)
3. **Longitud de línea**: 60-80 caracteres para bloques de texto; sin límite para datos tabulares
4. **Evitar justificado**: Usar alineación izquierda en textos multilínea
5. **Números**: Usar `font-variant-numeric: tabular-nums` en columnas numéricas

---

## 8. Layout y Cuadrícula

### 8.1 Sistema de cuadrícula

| Breakpoint | Columnas | Gap | Padding |
|------------|----------|-----|---------|
| ≥ 1280px | 12 | `--space-6` | `--space-8` |
| ≥ 1024px | 8 | `--space-5` | `--space-6` |
| ≥ 768px | 4 | `--space-4` | `--space-5` |
| < 768px | 2 | `--space-3` | `--space-4` |

### 8.2 Zonas del Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (altura fija 56px, top bar)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── WELCOME ──────────────────────────────────────────────────┐  │
│  │ padding: --space-5 --space-6, margin-bottom: --space-6      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── KPI ROW ──────────────────────────────────────────────────┐  │
│  │ grid: auto-fit minmax(220px, 1fr), gap: --space-4           │  │
│  │ margin-bottom: --space-6                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── TABLA REGISTROS ──────────────────────────────────────────┐  │
│  │ padding: --space-5, margin-bottom: --space-6               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── TIMELINE ─────────────────────────────────────────────────┐  │
│  │ padding: --space-5, margin-bottom: --space-6               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Accesibilidad

### 9.1 Checklist WCAG 2.1 AA

| Criterio | Estado actual | Propuesta |
|-----------|--------------|-----------|
| 1.1.1 Contenido no textual | ✅ Iconos son decorativos o tienen texto alternativo | Mantener |
| 1.3.1 Info y relaciones | ⚠️ Falta `<header>`, `<main>`, `<section>` | Agregar landmarks semánticos |
| 1.4.1 Uso del color | ⚠️ DATCORR/VERIFICADO solo por color | Agregar icono o texto adicional |
| 1.4.3 Contraste (mínimo) | ✅ Contraste > 4.5:1 | Verificar con herramienta |
| 1.4.11 Contraste de texto no textual | ✅ | Verificar tooltips |
| 2.1.1 Teclado | ⚠️ Hover-only en KPIs | Cambiar a click o visible-by-default |
| 2.4.1 Evitar bloquear | ✅ No hay modales bloqueantes | Mantener |
| 2.4.7 Foco visible | ⚠️ No definido | Agregar outline personalizado |
| 3.2.2 Al recibir entrada | ✅ No hay cambios automáticos de contexto | Mantener |
| 3.3.2 Etiquetas o instrucciones | ⚠️ Tabla sin caption | Agregar `<caption>` |
| 4.1.2 Nombre, rol, valor | ⚠️ Sin aria-label en secciones | Agregar ARIA labels |

### 9.2 Navegación por teclado

| Elemento | Tab order | Teclas |
|----------|-----------|--------|
| Botones de top bar | Natural | Enter/Space para activar |
| KPI clickeables | Natural | Enter/Space para navegar |
| Tabla | Lectura | Tab → celda por celda |
| Timeline | Lectura | Tab → item por item |
| Botón reintentar (error) | Natural | Enter/Space |

---

## 10. Plan de Implementación por Fases

### Fase 1: Infraestructura (Semana 1)
1. Crear archivo de tokens CSS: `frontend/src/styles/tokens.css`
2. Integrar tokens en `frontend/src/index.css` global
3. Actualizar `theme.js` para exportar constantes de diseño
4. Crear componentes base: `<Card>`, `<SectionTitle>`, `<Badge>`

### Fase 2: Welcome Card y KPI Row (Semana 1-2)
1. Rediseñar Welcome Card con nuevo sistema de espaciado
2. Rediseñar KPI Card:
   - Detalles SIEMPRE visibles (no hover-only)
   - Priorización visual para "Altas pendientes"
   - Tokenizar colores de iconos
3. Actualizar Dashboard.jsx con nuevos estilos

### Fase 3: Tabla y Timeline (Semana 2)
1. Rediseñar tabla con:
   - Tokens de color
   - Nueva columna "% Progreso" con barra visual
   - sticky first column en móvil
2. Rediseñar timeline con:
   - Grupos visuales por tipo de acción
   - Resalte para acciones críticas
   - Link "Ver todo"

### Fase 4: Estados y Accesibilidad (Semana 3)
1. Rediseñar loading y error states
2. Agregar landmarks semánticos (`<header>`, `<main>`, `<section>`)
3. Agregar ARIA labels y roles
4. Implementar focus visible personalizado
5. Pruebas de contraste y navegación por teclado

### Fase 5: Responsive y Pulido (Semana 3)
1. Verificar breakpoints: 1280px, 1024px, 768px, 375px
2. Ajustar grid KPI para mobile (1-2 columnas)
3. Ajustar tabla para mobile (scroll horizontal + sticky column)
4. Pruebas en dispositivos reales

---

## 11. Checklist de Validación

### Diseño
- [ ] Todos los colores usan tokens CSS (0 hardcodeados)
- [ ] Todos los espaciados usan tokens CSS (0 valores arbitrarios)
- [ ] Border radius consistente en todos los componentes
- [ ] Tipografía con máximo 3 niveles jerárquicos

### Información
- [ ] Dato crítico "Altas pendientes" es visible sin interacción
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

## 12. Métricas de Éxito

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

## 13. Referencias y Estándares

- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **GOV.UK Design System**: https://design-system.service.gov.uk/
- **Material Design 3**: https://m3.material.io/
- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Data Visualization Best Practices**: https://www.tableau.com/learn/articles/data-visualization

---

## 14. Notas de Implementación

1. **No eliminar funcionalidad**: Todos los datos, rutas y permisos se preservan.
2. **Migración gradual**: Implementar por fases para minimizar riesgo.
3. **Backward compatibility**: Mantener `KpiCard` como componente exportado durante la transición.
4. **Testing**: Probar con datos reales del entorno de producción (no solo mocks).
5. **Feedback de usuario**: Involucrar a usuarios reales en pruebas de legibilidad antes de cerrar la fase 5.
