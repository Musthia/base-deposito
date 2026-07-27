# Guía de Rediseño del Dashboard — Estilo Gubernamental Simplificado

## 1. Objetivo

Transformar el dashboard actual (barra lateral izquierda + contenido a la derecha) a un diseño con **navegación superior (top bar)**, estilo gubernamental, sin recursos visuales innecesarios. El diseño debe ser funcional, accesible y fácil de recordar, preservando todas las funcionalidades existentes sin romperlas.

---

## 2. Principios de Diseño

| Principio                               | Descripción                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Funcionalidad sobre estética** | Sin gradientes, sombras, animaciones ni efectos visuales que consuman recursos.              |
| **Estado gubernamental**          | Colores institucionales neutros (azul oscuro, gris, blanco). Tipografía clara y legible.    |
| **Accesibilidad**                 | Contraste adecuado, navegación por teclado, etiquetas ARIA, estructura semántica HTML.     |
| **Memorabilidad**                 | Menú superior con rutas claras y nombres descriptivos. Sin iconos decorativos innecesarios. |
| **Rendimiento**                   | Cero dependencias de diseño animado. CSS mínimo. Sin SVGs decorativos ni efectos de fondo. |

---

## 3. Arquitectura Actual vs. Propuesta

### Actual

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (220px, dark)  │  Main Content (flex:1)  │
│  - Panel de Control     │  - Welcome Card          │
│  - Usuarios             │  - KPI Metrics Row       │
│  - Consultar Bases      │  - Table + Timeline      │
│  - Carga de Datos       │                          │
│  - Auditoria            │                          │
│  - Reportes             │                          │
│  - Altas Pendientes     │                          │
│  - ...                  │                          │
│  - User info / Logout   │                          │
└─────────────────────────────────────────────────────┘
```

### Propuesta

```
┌─────────────────────────────────────────────────────┐
│  Top Bar (nav superior, altura fija ~56px)         │
│  [Logo] [Panel] [Usuarios] [Bases] [Carga] [Audit] │
│  [Reportes] [Altas] [Simco] [Mensajes] [Usuario ▼]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Main Content (width: 100%)                        │
│  - Welcome Card (simplificado)                     │
│  - KPI Metrics Row                                 │
│  - Table + Timeline (apilados verticalmente)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 4. Cambios Específicos por Archivo

### 4.1 `frontend/src/layouts/MainLayout.jsx`

**Cambio:** Reemplazar el layout de sidebar + main por un layout de top bar + main.

- Eliminar la importación y renderizado de `<Sidebar />`.
- Reemplazar el `display: "flex"` wrapper por un contenedor con `display: "flex"` y `flexDirection: "column"`.
- Agregar un `<header>` fijo en la parte superior con la navegación.
- El `<main>` ocupa todo el ancho restante (`width: 100%`) sin margen izquierdo.
- El contenido de `<Outlet />` se renderiza dentro de `<main>` con padding superior para compensar la barra fija.

**Estructura resultante:**

```jsx
<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
  <TopBar />
  <main style={{ flex: 1, padding: "24px", background: "#ffffff", overflow: "auto" }}>
    <NotificationProvider>
      <TabProvider>
        <Outlet />
      </TabProvider>
    </NotificationProvider>
  </main>
</div>
```

### 4.2 `frontend/src/layouts/Sidebar.jsx`

**Acción:** Este archivo **ya no se usa** en el layout principal. Se puede:

- Eliminar la importación de `Sidebar` en `MainLayout.jsx`.
- Mantener el archivo por si se necesita reutilizar en otra vista (no borrar aún).

### 4.3 Nuevo archivo: `frontend/src/layouts/TopBar.jsx`

**Crear** un componente de barra superior que reemplace la funcionalidad del sidebar.

**Contenido:**

- Barra fija en la parte superior (`position: "fixed"`, `top: 0`, `left: 0`, `right: 0`, `height: 56px`).
- Fondo: `#1e293b` (azul marino institucional).
- Texto blanco, sin efectos de hover con colores llamativos.
- Navegación como lista horizontal (`display: "flex"`, `flexDirection: "row"`, `gap: 4px`).
- Cada elemento del menú es un `<button>` o `<a>` con padding `10px 16px`, sin border-radius excesivo.
- Indicador de ruta activa: fondo `#334155` (slate 700) — sin transiciones animadas.
- Sección derecha: nombre de usuario + botón de cerrar sesión.
- Sin modo oscuro/claro toggle (simplificación gubernamental).
- Sin íconos decorativos en los elementos del menú (usar solo texto).

**Estructura del menú:**

```
Panel de Control | Usuarios | Consultar Bases | Carga de Datos | Auditoría | Reportes | Altas Pendientes | SiMCo | Mensajes
```

**Sección de usuario (esquina superior derecha):**

```
[Nombre] [Cerrar sesión]
```

### 4.4 `frontend/src/pages/Dashboard.jsx`

**Cambios de estilo (inline styles):**

- **Welcome Card:** Eliminar `borderRadius: 12`, `boxShadow`, `border`. Usar fondo `#f8fafc`, borde inferior `2px solid #e2e8f0`, padding `20px 24px`.
- **KPI Row:** Mantener `grid` pero reducir `gap` a `16px`. Eliminar `boxShadow` y `border` de cada KPI card. Usar fondo `#ffffff` con borde `1px solid #e2e8f0`.
- **Bottom Section (Table + Timeline):** Cambiar `gridTemplateColumns: "1.6fr 1fr"` a una sola columna (`1fr`) para apilar verticalmente en pantallas pequeñas. Eliminar `boxShadow` y `border` de los cards.
- **Table:** Eliminar `borderRadius`. Usar borde `1px solid #e2e8f0` en el contenedor.
- **Eliminar:** Todas las animaciones de hover (`transform`, `transition`), gradientes, efectos de overlay en KPI cards.
- **Loading spinner:** Mantener pero simplificar (sin animación de borde giratorio si se prefiere; un indicador de texto "Cargando..." es suficiente).

**Cambios funcionales (NINGUNO):**

- Toda la lógica de datos, navegación, permisos y logout permanece idéntica.
- Los `onClick` en KPI cards, el `handleLogout`, y el filtrado por permisos no cambian.
- El timeline de actividad se mantiene tal cual.

### 4.5 `frontend/src/theme.js`

**Cambios menores:**

- Los colores `LIGHT` y `DARK` se mantienen pero se simplifican para uso en la top bar y los nuevos componentes.
- Se pueden agregar variables CSS adicionales si se necesitan:
  - `--topbar-height: 56px`
  - `--topbar-bg: #1e293b`
  - `--topbar-text: #ffffff`
  - `--topbar-active-bg: #334155`
  - `--border-subtle: #e2e8f0`

### 4.6 `frontend/src/context/ThemeModeContext.jsx`

**Simplificación:** El toggle de modo oscuro/claro se elimina de la UI (no se muestra en la top bar). La lógica de tema se mantiene en el provider para que las variables CSS sigan funcionando, pero el usuario no puede alternar entre modos (diseño gubernamental estándar, siempre claro).

### 4.7 `frontend/src/router/AppRouter.jsx`

**Sin cambios.** Las rutas permanecen iguales. Solo cambia cómo se renderizan (dentro del nuevo layout con top bar).

---

## 5. Paleta de Colores Gubernamental

| Variable            | Valor       | Uso                              |
| ------------------- | ----------- | -------------------------------- |
| `--topbar-bg`     | `#1e293b` | Fondo de la barra superior       |
| `--topbar-text`   | `#ffffff` | Texto en la top bar              |
| `--topbar-active` | `#334155` | Elemento de menú activo         |
| `--primary`       | `#1e40af` | Enlaces, acentos institucionales |
| `--bg-page`       | `#f8fafc` | Fondo de la página              |
| `--bg-card`       | `#ffffff` | Fondo de tarjetas                |
| `--border`        | `#e2e8f0` | Bordes sutiles                   |
| `--text-main`     | `#1e293b` | Texto principal                  |
| `--text-muted`    | `#64748b` | Texto secundario                 |
| `--danger`        | `#dc2626` | Botones de acción destructiva   |
| `--success`       | `#16a34a` | Indicadores positivos            |

---

## 6. Reglas de Accesibilidad

1. **Navegación por teclado:** Todos los elementos del menú deben ser `<button>` o `<a>` con `tabIndex="0"`.
2. **ARIA labels:** La top bar debe tener `role="navigation"` y `aria-label="Navegación principal"`.
3. **Contraste:** Todo texto en la top bar (fondo oscuro) debe tener contraste mínimo 4.5:1 contra el fondo.
4. **Tamaño de fuente mínimo:** 14px para texto de menú, 16px para el título del dashboard.
5. **Enfoque visible:** Los elementos interactivos deben mostrar un `outline` visible al recibir foco.
6. **Sin dependencia de color solo:** El indicador de ruta activa debe usar tanto color como texto/pattern.
7. **HTML semántico:** Usar `<header>`, `<nav>`, `<main>`, `<section>` apropiadamente.

---

## 7. Checklist de Funcionalidades Preservadas

- [ ] Navegación a todas las rutas (`/dashboard`, `/usuarios`, `/database`, `/carga-datos`, `/auditoria`, `/reportes`, `/altas-pendientes`, `/simco`, `/mensajes`, `/acerca-datcorr`, `/acerca-simco`, `/mi-cuenta`)
- [ ] Cerrar sesión (logout) funciona desde la top bar
- [ ] Filtro de permisos: elementos de menú condicionales según `perms`
- [ ] Indicador de ruta activa en el menú
- [ ] KPI cards con datos dinámicos del `dashboardService`
- [ ] Tabla de registros por base con totales
- [ ] Timeline de actividad reciente
- [ ] KPI "Altas pendientes" condicional (solo para no-consulta)
- [ ] KPI "Actividad reciente" con detalles al hover (se puede eliminar el hover effect si se simplifica)
- [ ] Loading state del dashboard
- [ ] Responsive: en pantallas pequeñas, el menú superior puede colapsar a un hamburger menu (opcional, no obligatorio para esta guía)

---

## 8. Recursos Eliminados (Ahorro)

| Recurso                                                         | Ahorro                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| Animaciones CSS (`@keyframes`, `transition`, `transform`) | ~620 líneas en`Login.css` que no aplican al dashboard |
| SVG decorations (constelación, nodos flotantes)                | ~100 líneas de SVG animado en el login                  |
| Gradientes de fondo                                             | Eliminados en welcome card y KPI cards                   |
| Box shadows en cards                                            | Eliminados en todos los cards del dashboard              |
| Border-radius excesivo                                          | Reducido a`4px` o eliminado                            |
| Hover effects en KPI cards (overlay)                            | Eliminado el`translateY` + `opacity` animation       |
| Toggle de modo oscuro/claro                                     | Eliminado de la UI (simplificación)                     |
| Sidebar component                                               | Ya no se renderiza en el layout                          |

---

## 9. Orden de Implementación Sugerido

1. **Paso 1:** Crear `TopBar.jsx` en `frontend/src/layouts/`.
2. **Paso 2:** Modificar `MainLayout.jsx` para usar `<TopBar />` en lugar de `<Sidebar />`.
3. **Paso 3:** Simplificar los estilos inline de `Dashboard.jsx` (eliminar sombras, gradientes, animaciones).
4. **Paso 4:** Actualizar `theme.js` con las variables CSS de la top bar.
5. **Paso 5:** Actualizar `ThemeModeContext.jsx` para simplificar (opcionalmente desactivar toggle visual).
6. **Paso 6:** Probar todas las rutas y funcionalidades.
7. **Paso 7:** Verificar accesibilidad (teclado, screen reader, contraste).
8. **Paso 8:** Opcionalmente archivar `Sidebar.jsx` (mover a `archive/` o eliminar).

---

## 10. Notas Finales

- **No se elimina ninguna funcionalidad.** Todos los enlaces, permisos, y flujos de navegación se mantienen.
- **El diseño es deliberadamente simple.** El gobierno no necesita efectos visuales; necesita claridad y velocidad.
- **Los recursos ahorrados** (animaciones, SVGs, gradientes) mejoran el tiempo de carga y la experiencia en dispositivos con recursos limitados.
- **La top bar es la solución estándar** para paneles de control gubernamentales y empresariales (ver referencias de GOV.UK, Material Design Admin, etc.).
