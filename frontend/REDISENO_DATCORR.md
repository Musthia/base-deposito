# DATCORR — Propuesta de Rediseño Visual

## 1. Objetivo

Refinar la identidad visual de DATCORR hacia un estilo **corporativo gubernamental de alta fidelidad**: limpio, confiable, eficiente.
Mantener **todas las funcionalidades existentes** sin romperlas, respetando la arquitectura actual (React + MUI + Zustand + React Router).

---

## 2. Paleta de Color (Dark Mode por defecto)

| Token                | Valor actual              | Propuesto                 | Uso                              |
| -------------------- | ------------------------- | ------------------------- | -------------------------------- |
| `--bg-page`        | `#000000` / `#1e1e2e` | `#0f172a` (Slate 900)   | Fondo principal                  |
| `--bg-card`        | `#111111` / `#2a2a3e` | `#1e293b` (Slate 800)   | Tarjetas, paneles                |
| `--bg-elevated`    | —                        | `#334155` (Slate 700)   | Modales, dropdowns, hover states |
| `--border`         | `#333333` / `#3d3d5c` | `#475569` (Slate 600)   | Bordes sutiles                   |
| `--text-main`      | `#e5e5e5` / `#e4e4ec` | `#f8fafc` (Slate 50)    | Texto principal                  |
| `--text-muted`     | `#9ca3af`               | `#94a3b8` (Slate 400)   | Texto secundario                 |
| `--primary`        | `#60a5fa`               | `#3b82f6` (Blue 500)    | CTAs, enlaces, iconos            |
| `--primary-hover`  | —                        | `#2563eb` (Blue 600)    | Hover de botones primarios       |
| `--primary-subtle` | —                        | `rgba(59,130,246,0.12)` | Fondos sutiles de highlight      |
| `--success`        | `#34d399`               | `#10b981` (Emerald 500) | Estados positivos                |
| `--warning`        | `#fbbf24`               | `#f59e0b` (Amber 500)   | Alertas                          |
| `--danger`         | `#f87171`               | `#ef4444` (Red 500)     | Errores, eliminaciones           |

**Principios:**

- Fondo oscuro con **ligero matiz azulado** (navy) en vez de negro puro.
- Contraste WCAG AA garantizado sobre fondos oscuros.
- El `primary` se usa con moderación: CTAs, iconos de sección, bordes activos.

---

## 3. Tipografía

| Elemento           | Familia                         | Peso | Tamaño  |
| ------------------ | ------------------------------- | ---- | -------- |
| Títulos H1        | `'Inter', system-ui`          | 700  | 28–32px |
| Títulos H2        | `'Inter', system-ui`          | 600  | 20–24px |
| Títulos H3        | `'Inter', system-ui`          | 600  | 16–18px |
| Cuerpo             | `'Inter', system-ui`          | 400  | 14px     |
| Muted / helper     | `'Inter', system-ui`          | 400  | 12–13px |
| Mono (tablas, IDs) | `'JetBrains Mono', monospace` | 400  | 13px     |

**Acción:** instalar `@fontsource/inter` y `@fontsource/jetbrains-mono`. Aplicar en `theme.js` y en el CSS global.

---

## 4. Header / TopBar (Rediseño)

### Estado actual

- Fondo gris `#646363`, altura 56px.
- Botones con bordes duros, sin jerarquía visual clara.

### Propuesta

- **Fondo:** `var(--bg-card)` con un borde inferior sutil de `1px solid var(--border)`.
- **Altura:** 64px (más aire).
- **Logo:** SVG limpio + texto "DATCORR" en `Inter` weight 700, color blanco, tracking ligeramente aumentado (`letter-spacing: 0.5px`).
- **Nav:** botones planos con padding 10px 16px, border-radius 8px.
  - Estado activo: `background: var(--primary-subtle)` + `color: var(--primary)`.
  - Hover: `background: rgba(255,255,255,0.06)`.
- **Dropdowns (Acerca, Online):** panel con `background: var(--bg-elevated)`, border-radius 12px, sombra suave, border `1px solid var(--border)`.
- **Avatar + nombre:** pill sutil con borde `1px solid var(--border)`, hover con `var(--primary-subtle)`.
- **Botón logout:** `color: var(--danger)`, border `1px solid rgba(239,68,68,0.3)`, hover `background: rgba(239,68,68,0.1)`.

**Aspecto clave:** mantener **toda la lógica** (dropdowns, contador de online, mensajería, responsive mobile). Solo cambia el skin.

---

## 5. Sidebar (Rediseño)

### Estado actual

- Fondo `#222433`, ancho 220px.
- Items con texto blanco, íconos MUI.

### Propuesta

- **Ancho:** 240px (mejor legibilidad).
- **Fondo:** degradado sutil de `#0f172a` a `#1e293b`.
- **Borde derecho:** `1px solid var(--border)`.
- **Secciones:** etiquetas pequeñas uppercase, tracking 1px, color `var(--text-muted)`, margin superior 24px.
- **Items de menú:**
  - Height 40px, border-radius 8px, padding 0 16px.
  - Activo: `background: var(--primary-subtle)`, borde izquierdo `3px solid var(--primary)`.
  - Hover: `background: rgba(255,255,255,0.04)`.
- **User card (bottom):**
  - Fondo `var(--bg-elevated)`, border-radius 12px, padding 16px.
  - Avatar con inicial, borde `2px solid var(--primary)`.
  - Nombre + rol en tipografía clara.
- **Toggle tema:** ícono sol/luna con tooltip, pero **sin cambiar la lógica** (por ahora seguiría en dark-forzado).

---

## 6. Login Público (Rediseño)

### Estado actual

- Split layout: panel izquierdo de marca, panel derecho de formulario.
- Fondo animado con SVG de nodos.

### Propuesta

- **Layout:** mantener el split, pero refinarlo.
- **Panel izquierdo:**
  - Fondo `linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)`.
  - Logo DATCORR grande, color blanco.
  - Headline: *"Gestione Legajos y Expedientes con Confianza"* en blanco, Inter 700, 26px.
  - Subheadline: texto muted explicando la plataforma.
  - Ilustración abstracta: **mockup de laptop** en estilo vectorial/neumórfico, con "pantalla" mostrando barras azules y un gráfico de torta (simplificado, no screenshot real).
- **Panel derecho:**
  - Fondo blanco (o `#f8fafc` si se permite light en login).
  - Formulario con campos de borde `#e2e8f0`, focus ring `var(--primary)`.
  - Botón "Acceder al sistema": `background: var(--primary)`, hover `var(--primary-hover)`, border-radius 10px, sombra suave.
  - Separador "o continúe con" con línea sutil.
  - Botón Google: borde `#e2e8f0`, hover gris claro.
- **Responsive:** en mobile, ocultar panel izquierdo, centrar formulario.

---

## 7. Dashboard (Rediseño)

### Estado actual

- Welcome card + 5 KPI cards + tabla de bases + timeline.
- Estilos inline con CSS variables.

### Propuesta

- **Welcome card:**
  - Fondo `linear-gradient(90deg, var(--primary-subtle) 0%, transparent 100%)`.
  - Borde izquierdo `4px solid var(--primary)`.
  - Tipografía más airy: título 24px, descripción 14px muted.
- **KPI Cards:**
  - Fondo `var(--bg-card)`, border-radius 12px, padding 20px 24px.
  - Sombra: `0 1px 3px rgba(0,0,0,0.3)`.
  - Icono en círculo de 40px con fondo `var(--primary-subtle)` y color `var(--primary)`.
  - Valor en 28px, label en 13px uppercase muted.
  - Hover: sombra aumenta + translateY(-2px) + borde `1px solid var(--border)`.
  - **Mantener** la expansión de detalles on-hover.
- **Tabla de bases:**
  - Encapsulada en card con border-radius 12px.
  - Header de tabla con fondo `var(--bg-elevated)`, texto uppercase 11px, tracking 1px.
  - Filas con hover `var(--primary-subtle)`.
  - Totales con tipografía bold, borde superior `2px solid var(--border)`.
- **Timeline (actividad):**
  - Iconos más grandes (28px), border-radius 50%.
  - Línea con color `var(--border)`.
  - Cards de actividad con padding, border-radius 8px, hover sutil.

---

## 8. Tarjetas de Funcionalidades (Nuevo componente reutilizable)

Inspirado en la sección de features del diseño de referencia.

```tsx
// components/FeatureCard.jsx (nuevo)
<Box
  sx={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    p: 3,
    textAlign: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: 'var(--primary)',
      boxShadow: '0 8px 24px rgba(59,130,246,0.12)',
      transform: 'translateY(-4px)',
    },
  }}
>
  <Avatar sx={{ bgcolor: 'var(--primary-subtle)', color: 'var(--primary)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
    <Icon fontSize="large" />
  </Avatar>
  <Typography variant="h3" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', mb: 1 }}>
    Título
  </Typography>
  <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13 }}>
    Descripción breve
  </Typography>
</Box>
```

**Aplicación:**

- Usar en **páginas estáticas** (Acerca Datcorr, Acerca SiMCo) para describir módulos.
- Usar en **Dashboard** como acceso rápido a módulos frecuentes.
- No rompe ninguna página existente; es un componente nuevo.

---

## 9. Botones (Sistema unificado)

| Variante                  | Fondo              | Texto                | Borde                        | Border-radius | Uso                  |
| ------------------------- | ------------------ | -------------------- | ---------------------------- | ------------- | -------------------- |
| **Primary**         | `var(--primary)` | Blanco               | Ninguno                      | 10px          | CTAs principales     |
| **Primary-outline** | Transparente       | `var(--primary)`   | `1px solid var(--primary)` | 10px          | Acciones secundarias |
| **Ghost**           | Transparente       | `var(--text-main)` | Ninguno                      | 8px           | Nav items            |
| **Danger**          | `var(--danger)`  | Blanco               | Ninguno                      | 10px          | Eliminar             |
| **Success**         | `var(--success)` | Blanco               | Ninguno                      | 10px          | Aprobar              |

**Regla:** todos los botones usan `textTransform: 'none'`, fuente `Inter`, transiciones `0.15s`.

---

## 10. DataGrid / Tablas (Mejoras visuales)

- **Header:** fondo `#363652` (como ya está), pero con borde inferior `2px solid var(--border)`.
- **Filas:** hover con `rgba(59,130,246,0.06)` (más sutil).
- **Selección:** `rgba(59,130,246,0.14)`.
- **Paginación:** botones con border-radius 6px, hover `var(--bg-elevated)`.
- **Celdas de estado:** chips con border-radius 6px, padding 2px 10px, fuentes 12px.
- **Mantener** toda la lógica de servidor-side pagination, ordenamiento, filtrado.

---

## 11. Modales y Drawers

- **Fondo:** `var(--bg-card)` con border-radius 16px (Dialog) o 12px (Drawer).
- **Título:** 18px, weight 600, color `var(--text-main)`.
- **Acciones:** botones alineados a la derecha, con gap 8px.
- **Overlay:** `rgba(0,0,0,0.6)` con backdrop-filter blur 4px (si el navegador lo soporta).

---

## 12. Gráficos (Recharts)

### Estado actual

- Gráficos en Estadísticas con colores heredados del tema.

### Propuesta

- Usar paleta consistente:
  - Azul primario `#3b82f6`
  - Esmeralda `#10b981`
  - Ámbar `#f59e0b`
  - Rojo `#ef4444`
  - Violeta `#8b5cf6`
  - Cyan `#06b6d4`
- Tooltip con fondo `var(--bg-elevated)`, border-radius 8px, border `1px solid var(--border)`.
- Leyenda con tipografía 12px, color `var(--text-muted)`.

---

## 13. Notificaciones (Toast / Snackbar)

- Fondo `var(--bg-elevated)`, border-radius 10px.
- Icono + texto en `var(--text-main)`.
- Border izquierdo `4px solid` según tipo (success/warning/danger).
- Duración 4s por defecto.
- **Mantener** el `NotificationProvider` existente; solo cambiar el skin.

---

## 14. Spinners y Estados de carga

- **CircularProgress:** color `var(--primary)`.
- **Skeleton (si se adopta):** fondo `var(--bg-elevated)`, shimmer con `linear-gradient` de `transparent` a `rgba(255,255,255,0.04)`.
- **Empty states:** ícono grande muted, texto explicativo, botón de acción.

---

## 15. Responsividad

| Breakpoint   | Ajustes                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `< 1024px` | Sidebar colapsa a drawer overlay; TopBar mantiene nav horizontal scrollable.        |
| `< 768px`  | Sidebar oculta por defecto, toggle con hamburger. Dashboard KPIs pasan a 1 columna. |
| `< 480px`  | Cards apiladas, tablas con scroll horizontal, tipografía reducida 1px.             |

**Mantener** el comportamiento actual del `topbar-mobile-menu` y los media queries existentes.

---

## 16. Accesibilidad

- Todos los botones con `aria-label` descriptivo.
- Focus visible: outline `2px solid var(--primary)`, outline-offset 2px.
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- Skip link oculto, visible en focus: "Saltar al contenido principal".

---

## 17. Plan de Implementación (sin romper funcionalidad)

1. **Theme tokens:** actualizar `frontend/src/theme.js` con la nueva paleta.
2. **CSS variables:** actualizar `ThemeModeContext.jsx` para exponer los nuevos tokens.
3. **TopBar + Sidebar:** refactor de estilos inline a `sx` props o clases CSS. **No tocar lógica.**
4. **Login:** refactor de `Login.jsx` + `Login.css` con nuevo layout. Mantener OAuth y validaciones.
5. **Dashboard:** refactor de estilos en `Dashboard.jsx`. Mantener KPIs, tablas, timeline.
6. **FeatureCard:** componente nuevo, usar en páginas estáticas.
7. **DataGrid overrides:** ajustar en `theme.js`.
8. **Testing:** verificar que todas las rutas privadas cargan correctamente, que los permisos siguen funcionando, que la autenticación y refresh de token no se ven afectadas.

---

## 18. Inspiración Visual

El diseño se inspira en interfaces de software gubernamental moderno:

- **Paleta navy + white:** transmite seriedad institucional.
- **Cards con sombras suaves:** profundidad sin ruido visual.
- **Iconografía outline / filled consistente:** MUI Icons con tamaño 20–24px.
- **Espaciado generoso:** padding/margin basado en grilla de 8px.
- **Micro-interacciones:** transiciones de 150–200ms en hover, focus, expansión de KPIs.
