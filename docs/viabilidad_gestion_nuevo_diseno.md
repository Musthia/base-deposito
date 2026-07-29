# Conclusión de Viabilidad — Gestión de Nuevo Diseño v2.0.5

**Archivo de análisis:** `docs/gestion_nuevo_diseno.md`
**Fecha de evaluación:** 2026-07-28
**Proyecto actual:** DatCorr — Plataforma gubernamental de gestión de registros (React + MUI + Zustand)

---

## 1. Veredicto General de Viabilidad

**VIABLE con precauciones moderadas.** El documento `gestion_nuevo_diseno.md` es arquitectónicamente coherente con la stack tecnológica actual (React + MUI + Zustand) y sus propuestas son en su mayoría aditivas (nuevos componentes, hooks y stores). Sin embargo, la adopción completa requiere una migración de tema de claro a oscuro que afecta a todos los componentes existentes, y existe un conflicto de diseño con la especificación actual (`DESIGN.md`) que establece un modo claro exclusivo para el contexto gubernamental.

---

## 2. Análisis de Coherencia con el Estilo Super Dark

### 2.1. Alineación con el estilo oscuro propuesto

El documento propone una paleta "Navy Profundo" que es inherentemente super dark:

| Token | Propuesto | Estado actual (DARK en theme.js) | Diferencia |
|-------|-----------|----------------------------------|------------|
| bgPage | `#0a0e1a` | `#1e1e2e` | Más oscuro — coherente con super dark |
| bgCard | `#141a2e` | `#2a2a3e` | Más oscuro — coherente |
| primary | `#2563eb` (cobalto) | `#60a5fa` (azul claro) | Más saturado y corporativo |
| TopBar bg | `#0f1425` | `#1e293b` | Más oscuro — coherente |
| Sidebar bg | `#0a0e1a` | `#222433` | Más oscuro — coherente |
| Texto | `#f0f2f5` | `#e4e4ec` | Más claro — mejor legibilidad |

La paleta propuesta es **más coherente y unificada** que la actual. Los colores actuales del tema oscuro son inconsistentes (el sidebar `#222433` es más claro que el bgPage `#1e1e2e`, creando una jerarquía invertida). La propuesta del documento establece una progresión clara de oscuridad: `#0a0e1a` → `#141a2e` → `#1a2245` → `#1e2440`, que es un sistema de elevación visual bien pensado.

### 2.2. Tipografía

El documento propone **Inter** (800/700/600) con fallback sans-serif y **JetBrains Mono** para datos técnicos. El proyecto actual usa **Open Sans** (según `DESIGN.md`). Inter es una mejora moderna para interfaces de datos densos, pero el cambio de tipografía es un esfuerzo adicional que afecta a todos los componentes de texto.

### 2.3. Coherencia visual del GlobalBanner

Los temas del banner (info, warning, maintenance, success) están diseñados con gradientes oscuros que respetan la paleta propuesta. Los colores de borde y acento (`#2563eb`, `#f59e0b`, `#ef4444`, `#34d399`) son consistentes con los tokens del sistema de diseño. El banner no rompe la jerarquía visual oscura.

---

## 3. Análisis de No-Romper Funcionalidad

### 3.1. Componentes Aditivos (Sin riesgo de rotura)

Los siguientes elementos del documento son puramente aditivos y no rompen ninguna funcionalidad existente:

- **GlobalBanner component** (`frontend/src/components/GlobalBanner/GlobalBanner.jsx`) — Nuevo directorio y archivo.
- **bannerStore.js** (`frontend/src/stores/bannerStore.js`) — Nuevo store Zustand. No existe actualmente, pero el proyecto ya usa Zustand en otras partes (el `authStore` existe).
- **useBannerMargin hook** (`frontend/src/hooks/useBannerMargin.js`) — Nuevo hook. No interactúa con lógica existente.
- **CSS variables para banner** (`--banner-bg`, `--banner-text`, etc.) — Nuevas variables CSS que se suman a las existentes.

### 3.2. Modificaciones Existentes (Riesgo medio)

| Archivo | Cambio propuesto | Riesgo | Mitigación |
|---------|-----------------|--------|------------|
| `theme.js` | Actualizar colores DARK a la nueva paleta | **Alto** — Afecta a todos los componentes que usan `colors.bgCard`, `colors.textMain`, `colors.primary`, `colors.border` | Migrar gradualmente; mantener backward compatibility con nombres de tokens |
| `ThemeModeContext.jsx` | Cambiar modo por defecto a "dark" | **Alto** — Deshabilita el modo claro actual. El `DESIGN.md` actual dice "light mode only" | Confirmar con el equipo que el contexto gubernamental permite dark mode; actualizar `DESIGN.md` |
| `MainLayout.jsx` | Insertar GlobalBanner antes de TopBar | **Bajo** — Es una inserción aditiva en el DOM. El `pt: "80px"` del main ya existe para compensar el TopBar | El banner necesita su propio espacio; ajustar el `pt` del main si el banner es visible |
| `NotificationProvider.jsx` | Coexistencia con GlobalBanner | **Medio** — Ambos sistemas de notificación podrían solaparse | Definir claramente la separación de responsabilidades: NotificationProvider para alertas de SIMCO, GlobalBanner para avisos del sistema |

### 3.3. Conflictos Identificados

1. **Modo claro vs. modo oscuro por defecto:** El `ThemeModeContext.jsx` actual tiene `toggleMode` deshabilitado y fuerza modo "light". El documento propone dark mode por defecto. Esto es un cambio de comportamiento que afecta a todos los usuarios actuales.

2. **Diseño gubernamental light-only:** `DESIGN.md` (línea 285) establece explícitamente: *"Don't enable dark mode — the government context requires light-only presentation."* La propuesta v2.0 contradice esta regla. Se requiere una actualización de `DESIGN.md` o una justificación de cambio de requisito.

3. **Notificaciones duplicadas:** El proyecto ya tiene `NotificationProvider` (toasts en bottom-right). El `GlobalBanner` es un banner superior para avisos críticos del sistema. Sin una separación clara de casos de uso, ambos podrían confundirse o solaparse visualmente.

4. **Migración de tipografía:** Cambiar de Open Sans a Inter requiere actualizar todas las referencias de fuente en el proyecto y en `DESIGN.md`.

5. **CSS Variables existentes:** El `ThemeModeContext.jsx` aplica CSS custom properties (`--bg-page`, `--bg-card`, etc.) desde el objeto `colors`. La propuesta del documento usa `var(--bg-gradient)` en `MainLayout.jsx` que **no existe actualmente** en el contexto CSS. Esto causaría un fallback a `transparent` si no se define.

### 3.4. Verificación de Integridad Funcional

| Funcionalidad existente | ¿Se ve afectada? | Comentario |
|------------------------|-------------------|------------|
| Login / Registro | Sí (visual) | Los auth surfaces usan gradientes claros; cambiar a dark requiere rediseño |
| Dashboard | Sí (visual) | Cards, tablas y KPIs usan colores de tema que cambiarían |
| TopBar | Sí (visual) | Fondo `#1e293b` → `#0f1425`; texto blanco se mantiene |
| Sidebar | Sí (visual) | Fondo `#222433` → `#0a0e1a`; active item green `#4db53f3b` se mantiene |
| DataGrid | Sí (visual) | Headers `#363652` → nuevo color; hover tints cambiarían |
| NotificationProvider | No funcional | Usa `colors.bgCard` y `colors.textMain` que se actualizan automáticamente |
| Formularios (inputs, tabs) | Sí (visual) | Colores de border, focus y label cambiarían |
| Modales | Sí (visual) | `MuiDialog` paper usa `colors.bgCard` |
| useIdleTimeout | No | Lógica pura, sin dependencia de colores |
| useSimcoWS | No | Lógica de WebSocket, sin dependencia de UI |
| useUsuarios / useUsuariosGrid | No | Lógica de datos, sin dependencia de UI |

---

## 4. Recomendaciones de Implementación

### Fase 1 — Preparación (Sin riesgo)
1. Crear `frontend/src/stores/bannerStore.js`
2. Crear `frontend/src/hooks/useBannerMargin.js`
3. Crear `frontend/src/components/GlobalBanner/GlobalBanner.jsx` y `GlobalBanner.css`
4. Actualizar `DESIGN.md` para reflejar el cambio a dark mode por defecto

### Fase 2 — Migración de Tema (Riesgo medio)
1. Actualizar los colores DARK en `theme.js` con la nueva paleta
2. Agregar `--bg-gradient` como variable CSS en `ThemeModeContext.jsx`
3. Cambiar el modo por defecto en `ThemeModeContext.jsx` a `"dark"`
4. Actualizar `MainLayout.jsx` para insertar `GlobalBanner` antes de `TopBar`
5. Verificar que `--bg-gradient` esté definida y que el `pt: "80px"` del main acomode el banner

### Fase 3 — Migración de Tipografía (Riesgo bajo)
1. Importar Inter y JetBrains Mono en `index.html` o `main.jsx`
2. Actualizar `theme.js` para usar Inter como fontFamily por defecto
3. Actualizar `DESIGN.md` con la nueva tipografía

### Fase 4 — Validación
1. Probar que `NotificationProvider` y `GlobalBanner` no compiten por el mismo espacio visual
2. Verificar legibilidad de todos los componentes con la nueva paleta
3. Probar en móvil (el banner debe ajustarse a altura reducida)
4. Validar que no se rompa el flujo de auth (login/registro)

---

## 5. Conclusión Final

El documento `gestion_nuevo_diseno.md` (v2.0.5) es **técnicamente viable** y su arquitectura es sólida. La propuesta de un estilo super dark con paleta Navy Profundo es coherente y bien pensada. Los componentes aditivos (GlobalBanner, bannerStore, useBannerMargin) no rompen ninguna funcionalidad existente.

Sin embargo, la adopción completa requiere resolver tres conflictos críticos:

1. **El cambio de modo claro a oscuro por defecto** contradice `DESIGN.md` actual y afecta la experiencia de todos los usuarios actuales.
2. **La migración de colores del tema** requiere una revisión visual exhaustiva de cada componente para garantizar que no se pierda legibilidad ni jerarquía visual.
3. **La coexistencia de dos sistemas de notificación** (`NotificationProvider` y `GlobalBanner`) necesita una definición clara de responsabilidades para evitar confusión visual.

Si se ejecuta en las fases propuestas y se actualiza `DESIGN.md` para reflejar el nuevo requisito de dark mode, la implementación puede completarse **sin romper ninguna funcionalidad técnica**, solo con cambios visuales controlados y reversibles.

---

*Análisis basado en el estado del proyecto a fecha de 2026-07-28.*