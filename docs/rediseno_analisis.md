# Análisis de Rediseño — Inspirado en DATCORR

> Basado en la descripción de una landing page profesional corporativa con palette azul marino profundo, blanco y gris claro.
> El proyecto actual conserva su estilo oscuro predominante y todas las funcionalidades existentes.

---

## 1. Paleta de Color Propuesta (Dark Mode + Acentos Azul Marino)

| Rol                       | Color Actual                      | Color Propuesto                            | Hex                        |
| ------------------------- | --------------------------------- | ------------------------------------------ | -------------------------- |
| Fondo página             | Negro puro / gradiente casi negro | Azul marino muy oscuro con gradiente sutil | `#0a0e1a` → `#050810` |
| Fondo tarjetas            | `#111111`                       | Azul marino oscuro elevado                 | `#141a2e`                |
| Bordes                    | `#333333`                       | Azul grisáceo oscuro                      | `#2a3050`                |
| Texto principal           | `#e5e5e5`                       | Blanco hueso                               | `#f0f2f5`                |
| Texto secundario          | `#9ca3af`                       | Gris azulado claro                         | `#8896b8`                |
| **Acento primario** | `#60a5fa` (azul cielo)          | **Azul cobalto vibrante**            | **`#2563eb`**      |
| Acento hover              | —                                | Azul más brillante                        | `#3b82f6`                |
| Éxito                    | `#34d399`                       | Verde esmeralda (se mantiene)              | `#34d399`                |
| Alerta                    | `#fbbf24`                       | Ámbar (se mantiene)                       | `#fbbf24`                |
| Peligro                   | `#f87171`                       | Rojo (se mantiene)                         | `#f87171`                |

### Efecto visual

El azul marino de fondo reemplaza el negro puro, dando una sensación más corporativa y profesional sin perder la oscuridad. Los cards con `#141a2e` se elevan ligeramente del fondo.

---

## 2. Tipografía

| Propiedad                 | Actual          | Propuesto                                          |
| ------------------------- | --------------- | -------------------------------------------------- |
| Fuente                    | Open Sans       | **Inter** (mantener Open Sans como fallback) |
| Pesos                     | 300-700         | Agregar**weight 800** para títulos hero     |
| Tamaño títulos sección | `h5` / `h6` | Usar`h4` (28px) en secciones principales         |
| Tracking (letter-spacing) | normal          | `-0.02em` en títulos grandes                    |
| Altura de línea          | normal          | `1.3` en títulos, `1.6` en cuerpo             |

---

## 3. TopBar (Header)

### Cambios inspirados en DATCORR

- **Fondo**: Cambiar de `#1e293b` a `#0f1425` con borde inferior sutil `1px solid #1e2440`
- **Logo**: Permitir que el logo tenga un glow sutil al hover (box-shadow con el color primario)
- **Nav links**: Agregar indicador activo tipo "underline" animado en vez de cambio de background
- **Altura**: Mantener 56px

---

## 4. Tarjetas (Cards / Papers)

### Inspirado en las 3 cards de DATCORR

- **Sombra**: Pasar de `elevation={0}` con borde a sombra suave: `boxShadow: "0 4px 20px rgba(0,0,0,0.3)"`
- **Border radius**: Unificar en `12px` en todas las tarjetas del sistema
- **Borde**: `1px solid #1e2440` (sutil, apenas perceptible)
- **Hover**: Elevación leve: `transform: translateY(-2px); transition: 0.2s`
- **Iconos**: Usar iconos de MUI con color `#2563eb` en vez de texto plano para encabezados de sección

---

## 5. Botones

### Inspirado en "Comenzar Ahora" (CTA azul brillante)

- **Primario**: Fondo `#2563eb`, texto blanco, `borderRadius: 8px`, `fontWeight: 600`, `padding: 10px 24px`
- **Hover primario**: Fondo `#1d4ed8`
- **Secundario/Outline**: Borde `#2a3050`, texto `#8896b8`, hover con borde `#2563eb`
- **En tablas (acciones)**: Íconos pequeños con tooltip, fondo transparente, color `#8896b8` hover `#2563eb`

---

## 6. Tablas y Grillas (DataGrid)

### Actual vs Propuesto

- **Cabeceras**: Fondo `#1a2040` (reemplaza `#363652`), texto `#f0f2f5`, peso 600
- **Filas**: Fondo `#141a2e` con hover `#1a2245`
- **Borde inferior**: `1px solid #1e2440`
- **Paginación**: Mismo fondo que cabeceras

---

## 7. Gráficos (Recharts)

### Inspirado en los charts del mockup de laptop

- **Grid**: Trazo `#1e2440` en dash (`"3 3"`)
- **Ejes**: Texto `#8896b8`
- **Tooltip**: Fondo `#0f1425`, borde `#1e2440`, texto `#f0f2f5`
- **Paleta de colores para charts**:
  - Azul corporativo: `#2563eb`
  - Verde éxito: `#34d399`
  - Ámbar: `#f59e0b`
  - Rojo: `#ef4444`
  - Púrpura: `#8b5cf6`

---

## 8. Sidebar (si aplica)

- **Fondo**: `#0a0e1a`
- **Item activo**: Fondo `#1a2040` con borde izquierdo `2px solid #2563eb`
- **Item hover**: Fondo `#141a2e`
- **Texto inactivo**: `#8896b8`
- **Texto activo**: `#f0f2f5`

---

## 9. Login / Registro

- **Fondo**: Mismo gradiente oscuro del sistema (unificado)
- **Card del login**: Fondo `#141a2e` con sombra pronunciada
- **Inputs**: Borde `#2a3050`, foco `#2563eb`
- **Botón submit**: Fondo `#2563eb`, hover `#1d4ed8`
- **Google OAuth**: Botón con borde `#2a3050` e icono de Google

---

## 10. Dashboard (KPIs)

### Inspirado en las cards de "Confianza y Eficiencia"

- **Cards KPI**: Distribución en grid responsivo (2x2 o 4 columnas)
- **Valor numérico**: Fuente `Inter`, weight 800, tamaño `32px`, color `#f0f2f5`
- **Label**: Weight 500, tamaño `13px`, color `#8896b8`
- **Icono decorativo**: Pequeño icono circular con fondo semitransparente del color del KPI

---

## 11. Tabla de Movimientos Recientes (Dashboard)

| Elemento              | Propuesta                       |
| --------------------- | ------------------------------- |
| Fondo fila            | `#141a2e` con alternado sutil |
| Acción (CREAR, etc.) | Badge con color semántico      |
| Usuario               | Texto`#f0f2f5`                |
| Tabla/Fecha           | Texto`#8896b8`                |
| Hover                 | `#1a2245`                     |

---

## 12. Micro-interacciones

- **Transiciones**: `150ms` en hovers, `300ms` en modales/drawers
- **Loading**: Spinner con color `#2563eb`
- **Skeleton**: Fondo `#1a2040` con shimmer animation
- **Scrollbar**: Personalizada oscura (track `#0a0e1a`, thumb `#2a3050`)

---

## 13. Scrollbar Personalizada (CSS Global)

```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #0a0e1a; }
::-webkit-scrollbar-thumb { background: #2a3050; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #3b4a70; }
```

---

## 14. Resumen de Archivos a Modificar

| Archivo                                     | Cambio                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| `frontend/src/theme.js`                   | Actualizar paleta LIGHT con azul marino oscuro, ajustar DARK |
| `frontend/index.html`                     | Actualizar`--bg-gradient` con degradado azul marino        |
| `frontend/src/layouts/MainLayout.jsx`     | Verificar que use el nuevo gradiente                         |
| `frontend/src/layouts/TopBar.jsx`         | Fondo`#0f1425`, borde inferior, active indicator           |
| `frontend/src/layouts/Sidebar.jsx`        | Fondo`#0a0e1a`, borde izquierdo activo azul                |
| `frontend/src/pages/Dashboard.jsx`        | Cards KPI con nuevo estilo, iconos decorativos               |
| `frontend/src/pages/Login.css`            | Unificar con paleta del theme                                |
| `frontend/src/pages/EstadisticasPage.jsx` | Paleta de charts, tooltips, ejes                             |
| `frontend/src/pages/*.jsx`                | Tarjetas, bordes, sombras                                    |

---

## 15. No Romper

Para asegurar que ninguna funcionalidad se rompe:

- No cambiar nombres de variables CSS existentes (`--bg-page`, `--bg-card`, etc.) — solo sus valores
- No eliminar imports ni componentes
- No cambiar la estructura del DOM (selectores, aria-labels, roles)
- No modificar lógica de negocio ni llamadas API
- Probar build después de cada grupo de cambios
