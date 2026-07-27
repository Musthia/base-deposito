# Guía Final de Rediseño del Dashboard — Estilo Gubernamental Simplificado

## 1. Objetivo

Transformar el dashboard actual (barra lateral izquierda + contenido a la derecha) a un diseño con **navegación superior (top bar)**, estilo gubernamental, sin recursos visuales innecesarios. El diseño debe ser funcional, accesible y fácil de recordar, preservando todas las funcionalidades existentes sin romperlas.

---

## 2. Principios de Diseño

| Principio | Descripción |
|---|---|
| **Funcionalidad sobre estética** | Sin gradientes, sombras, animaciones ni efectos visuales que consuman recursos. |
| **Estado gubernamental** | Colores institucionales neutros (azul marino, gris, blanco). Tipografía clara y legible. |
| **Accesibilidad** | Contraste adecuado, navegación por teclado, etiquetas ARIA, estructura semántica HTML. |
| **Memorabilidad** | Menú superior con rutas claras y nombres descriptivos. Sin iconos decorativos innecesarios. |
| **Rendimiento** | Cero dependencias de diseño animado. CSS mínimo. Sin SVGs decorativos ni efectos de fondo. |
| **Responsive desde el inicio** | El menú superior debe funcionar en todas las resoluciones, incluyendo mobile. |

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
│  - SiMCo                │                          │
│  - Mensajes             │                          │
│  - Acerca de Datcorr    │                          │
│  - Acerca de SiMCo      │                          │
│  - Mi cuenta            │                          │
│  - Modo oscuro/claro    │                          │
│  - User info / Logout   │                          │
└─────────────────────────────────────────────────────┘
```

### Propuesta
```
┌──────────────────────────────────────────────────────────────────────┐
│  Top Bar (nav superior, altura fija ~56px, fondo #1e293b)        │
│  [Logo] Panel | Usuarios | Bases | Carga | Audit | Reportes | Altas│
│  SiMCo | Mensajes | Acerca ▾ | [Nombre] [Cerrar sesión]            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Main Content (width: 100%, padding-top compensa top bar fija)    │
│  - Welcome Card (simplificado, sin sombra ni gradiente)              │
│  - KPI Metrics Row (estáticos, sin overlay animado)                  │
│  - Table (apilada verticalmente)                                     │
│  - Timeline (debajo de la tabla, apilada)                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Mapeo Completo de Funcionalidades

| # | Funcionalidad | Sidebar (actual) | Top Bar (propuesta) | Estado |
|---|---|---|---|---|
| 1 | Navegación a rutas principales | Menú lateral | Menú horizontal en top bar | ✅ Preservado |
| 2 | Navegación a SiMCo | Sección separada con divisor | Mismo ítem en top bar | ✅ Preservado |
| 3 | Navegación a Mensajes | Sección separada con divisor | Mismo ítem en top bar | ✅ Preservado |
| 4 | Acerca de Datcorr | Bottom section, solo no-consulta | Menú "Acerca" dropdown en top bar | ⚠️ Agregar |
| 5 | Acerca de SiMCo | Bottom section, todos los roles | Menú "Acerca" dropdown en top bar | ⚠️ Agregar |
| 6 | Mi cuenta | Botón de usuario en bottom section | Sección usuario (esquina derecha) | ⚠️ Agregar |
| 7 | Cerrar sesión | Bottom section | Esquina superior derecha | ✅ Preservado |
| 8 | Indicador de ruta activa | `background` condicional | Fondo `#334155` en ítem activo | ✅ Preservado |
| 9 | Filtro por permisos | `perms.canView*` condicionales | Misma lógica de permisos | ✅ Preservado |
| 10 | Información del usuario | Nombre, rol, nivel, avatar | Esquina derecha (simplificado) | ✅ Preservado |
| 11 | Toggle modo oscuro/claro | Botón en bottom section | Eliminado de UI (lógica interna se mantiene) | ⚠️ Decisión |
| 12 | KPI cards con hover overlay | Overlay con gradiente + animación | Eliminar overlay, mostrar detalles estáticamente | ✅ Simplificación |
| 13 | Timeline de actividad | Columna derecha del bottom | Apilado verticalmente en single column | ✅ Preservado |
| 14 | Tabla de registros por base | Columna izquierda del bottom | Apilado verticalmente | ✅ Preservado |
| 15 | Loading spinner | `@keyframes spin` con borde | MUI `CircularProgress` (ya disponible en el proyecto) | ✅ Preservado |
| 16 | Dark mode en MUI theme | `theme.js` con LIGHT/DARK | Se mantiene pero sin toggle visible | ✅ Preservado |

---

## 5. Paleta de Colores Gubernamental

| Variable | Valor | Uso |
|---|---|---|
| `--topbar-bg` | `#1e293b` | Fondo de la barra superior |
| `--topbar-text` | `#ffffff` | Texto en la top bar |
| `--topbar-active` | `#334155` | Elemento de menú activo |
| `--primary` | `#1e40af` | Enlaces, acentos institucionales |
| `--bg-page` | `#f8fafc` | Fondo de la página |
| `--bg-card` | `#ffffff` | Fondo de tarjetas |
| `--border` | `#e2e8f0` | Bordes sutiles |
| `--text-main` | `#1e293b` | Texto principal |
| `--text-muted` | `#64748b` | Texto secundario |
| `--danger` | `#dc2626` | Botones de acción destructiva |
| `--success` | `#16a34a` | Indicadores positivos |

---

## 6. Cambios Específicos por Archivo

### 6.1 `frontend/src/layouts/MainLayout.jsx`

**Cambio:** Reemplazar el layout de sidebar + main por un layout de top bar + main.

- Eliminar la importación y renderizado de `<Sidebar />`.
- Reemplazar el `display: "flex"` wrapper por un contenedor con `display: "flex"` y `flexDirection: "column"`.
- Agregar un `<TopBar />` fijo en la parte superior.
- El `<main>` ocupa todo el ancho restante (`width: 100%`) sin margen izquierdo.
- El contenido de `<Outlet />` se renderiza dentro de `<main>` con padding superior para compensar la barra fija.

**Estructura resultante:**
```jsx
<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
  <TopBar />
  <main style={{ flex: 1, padding: "24px", paddingTop: "72px", background: "#ffffff", overflow: "auto" }}>
    <NotificationProvider>
      <TabProvider>
        <Outlet />
      </TabProvider>
    </NotificationProvider>
  </main>
</div>
```

### 6.2 `frontend/src/layouts/Sidebar.jsx`

**Acción:** Este archivo **ya no se usa** en el layout principal. Se puede:
- Eliminar la importación de `Sidebar` en `MainLayout.jsx`.
- Mantener el archivo por si se necesita reutilizar en otra vista (no borrar aún).
- Opcionalmente, renombrarlo o moverlo a un directorio de archive.

### 6.3 Nuevo archivo: `frontend/src/layouts/TopBar.jsx`

**Crear** un componente de barra superior que reemplace la funcionalidad del sidebar.

**Contenido:**
- Barra fija en la parte superior (`position: "fixed"`, `top: 0`, `left: 0`, `right: 0`, `height: 56px`).
- Fondo: `#1e293b` (azul marino institucional).
- Texto blanco, sin efectos de hover con colores llamativos.
- Navegación como lista horizontal (`display: "flex"`, `flexDirection: "row"`, `gap: 2px`).
- Cada elemento del menú es un `<button>` o `<a>` con padding `10px 14px`, sin border-radius excesivo.
- Indicador de ruta activa: fondo `#334155` (slate 700) — sin transiciones animadas.
- Sección derecha: nombre de usuario + botón de cerrar sesión.
- Sin modo oscuro/claro toggle (simplificación gubernamental).
- Sin íconos decorativos en los elementos del menú (usar solo texto).

**Estructura del menú:**
```
Panel de Control | Usuarios | Consultar Bases | Carga de Datos | Auditoría | Reportes | Altas Pendientes | SiMCo | Mensajes | Acerca ▾
```

**Menú "Acerca" dropdown:**
- Acerca de Datcorr (`/acerca-datcorr`) — solo para rol no-consulta
- Acerca de SiMCo (`/acerca-simco`) — para todos

**Sección de usuario (esquina superior derecha):**
```
[Nombre] [Mi Cuenta] [Cerrar sesión]
```

**Responsive:** En pantallas ≤768px, el menú horizontal se convierte en un botón hamburguesa que despliega el menú verticalmente. Implementar con `overflow-x: auto` como fallback mínimo si no se implementa hamburger.

**Accesibilidad:**
```jsx
<header role="navigation" aria-label="Navegación principal">
  <nav>...</nav>
  <div> {/* sección usuario */} </div>
</header>
```

### 6.4 `frontend/src/pages/Dashboard.jsx`

**Cambios de estilo (inline styles):**

- **Welcome Card:** Eliminar `borderRadius: 12`, `boxShadow`, `border`. Usar fondo `#f8fafc`, borde inferior `2px solid #e2e8f0`, padding `20px 24px`.
- **KPI Row:** Mantener `grid` pero reducir `gap` a `16px`. Eliminar `boxShadow` y `border` de cada KPI card. Usar fondo `#ffffff` con borde `1px solid #e2e8f0`.
- **KPI hover overlay:** Eliminar la animación de overlay (`translateY`, `opacity`, `transition`). Mostrar los detalles directamente debajo del valor principal de forma estática, o usar un tooltip simple de MUI.
- **Bottom Section (Table + Timeline):** Cambiar `gridTemplateColumns: "1.6fr 1fr"` a una sola columna (`1fr`) para apilar verticalmente. Eliminar `boxShadow` y `border` de los cards.
- **Table:** Eliminar `borderRadius`. Usar borde `1px solid #e2e8f0` en el contenedor.
- **Eliminar:** Todas las animaciones de hover (`transform`, `transition`), gradientes, efectos de overlay en KPI cards.
- **Loading spinner:** Reemplazar el spinner CSS custom por MUI `CircularProgress` (ya está disponible en el proyecto como dependencia de MUI). Esto elimina la necesidad de `@keyframes spin` y mantiene la UX de carga.

**Cambios funcionales (NINGUNO):**
- Toda la lógica de datos, navegación, permisos y logout permanece idéntica.
- Los `onClick` en KPI cards, el `handleLogout`, y el filtrado por permisos no cambian.
- El timeline de actividad se mantiene tal cual.

### 6.5 `frontend/src/theme.js`

**Cambios menores:**
- Los colores `LIGHT` y `DARK` se mantienen pero se simplifican para uso en la top bar y los nuevos componentes.
- Se pueden agregar variables CSS adicionales si se necesitan:
  - `--topbar-height: 56px`
  - `--topbar-bg: #1e293b`
  - `--topbar-text: #ffffff`
  - `--topbar-active-bg: #334155`
  - `--border-subtle: #e2e8f0`

### 6.6 `frontend/src/context/ThemeModeContext.jsx`

**Simplificación:** El toggle de modo oscuro/claro se elimina de la UI (no se muestra en la top bar). La lógica de tema se mantiene en el provider para que las variables CSS sigan funcionando, pero el usuario no puede alternar entre modos (diseño gubernamental estándar, siempre claro).

### 6.7 `frontend/src/router/AppRouter.jsx`

**Sin cambios.** Las rutas permanecen iguales. Solo cambia cómo se renderizan (dentro del nuevo layout con top bar).

---

## 7. Reglas de Accesibilidad

1. **Navegación por teclado:** Todos los elementos del menú deben ser `<button>` o `<a>` con `tabIndex="0"`.
2. **ARIA labels:** La top bar debe tener `role="navigation"` y `aria-label="Navegación principal"`.
3. **Contraste:** Todo texto en la top bar (fondo oscuro) debe tener contraste mínimo 4.5:1 contra el fondo.
4. **Tamaño de fuente mínimo:** 14px para texto de menú, 16px para el título del dashboard.
5. **Enfoque visible:** Los elementos interactivos deben mostrar un `outline` visible al recibir foco.
6. **Sin dependencia de color solo:** El indicador de ruta activa debe usar tanto color como texto/pattern.
7. **HTML semántico:** Usar `<header>`, `<nav>`, `<main>`, `<section>` apropiadamente.

---

## 8. Checklist de Funcionalidades Preservadas

- [ ] Navegación a todas las rutas (`/dashboard`, `/usuarios`, `/database`, `/carga-datos`, `/auditoria`, `/reportes`, `/altas-pendientes`, `/simco`, `/mensajes`, `/acerca-datcorr`, `/acerca-simco`, `/mi-cuenta`)
- [ ] Cerrar sesión (logout) funciona desde la top bar
- [ ] Filtro de permisos: elementos de menú condicionales según `perms`
- [ ] Indicador de ruta activa en el menú
- [ ] KPI cards con datos dinámicos del `dashboardService`
- [ ] Detalles de KPI visibles estáticamente (sin hover overlay)
- [ ] Tabla de registros por base con totales
- [ ] Timeline de actividad reciente
- [ ] KPI "Altas pendientes" condicional (solo para no-consulta)
- [ ] KPI "Actividad reciente" con detalles visibles
- [ ] Loading state del dashboard con MUI CircularProgress
- [ ] Responsive: menú hamburguesa en pantallas ≤768px

---

## 9. Recursos Eliminados (Ahorro)

| Recurso | Ahorro |
|---|---|
| Animaciones CSS (`@keyframes`, `transition`, `transform`) | ~620 líneas en `Login.css` que no aplican al dashboard |
| SVG decorations (constelación, nodos flotantes) | ~100 líneas de SVG animado en el login |
| Gradientes de fondo | Eliminados en welcome card y KPI cards |
| Box shadows en cards | Eliminados en todos los cards del dashboard |
| Border-radius excesivo | Reducido a `4px` o eliminado |
| Hover effects en KPI cards (overlay) | Eliminado el `translateY` + `opacity` animation |
| Toggle de modo oscuro/claro | Eliminado de la UI (simplificación) |
| Sidebar component | Ya no se renderiza en el layout |
| Custom `@keyframes spin` | Reemplazado por MUI CircularProgress |

---

## 10. Dependencias Técnicas

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `frontend/src/layouts/MainLayout.jsx` | Reemplazar `<Sidebar />` por `<TopBar />`, cambiar `display: flex` a `flexDirection: column` |
| `frontend/src/layouts/Sidebar.jsx` | **No eliminar aún** — conservar como respaldo. Archivar después de pruebas. |
| `frontend/src/layouts/TopBar.jsx` | **NUEVO** — crear con toda la lógica de navegación del sidebar |
| `frontend/src/pages/Dashboard.jsx` | Simplificar estilos inline según guía |
| `frontend/src/theme.js` | Agregar variables CSS de la top bar (opcional) |
| `frontend/src/context/ThemeModeContext.jsx` | Opcional: deshabilitar toggle visual, forzar `light` |

### Archivos que NO cambian

- `frontend/src/router/AppRouter.jsx`
- `frontend/src/services/dashboardService.js`
- `frontend/src/auth/usePermissions.js`
- `frontend/src/auth/authStore.js`
- `frontend/src/api/axiosClient.js`
- Todas las páginas (excepto `Dashboard.jsx`)

---

## 11. Orden de Implementación Sugerido

1. **Paso 1:** Crear `TopBar.jsx` en `frontend/src/layouts/`.
2. **Paso 2:** Modificar `MainLayout.jsx` para usar `<TopBar />` en lugar de `<Sidebar />`.
3. **Paso 3:** Simplificar los estilos inline de `Dashboard.jsx` (eliminar sombras, gradientes, animaciones, overlay).
4. **Paso 4:** Reemplazar el loading spinner custom por MUI `CircularProgress`.
5. **Paso 5:** Actualizar `theme.js` con las variables CSS de la top bar.
6. **Paso 6:** Actualizar `ThemeModeContext.jsx` para simplificar (opcionalmente desactivar toggle visual).
7. **Paso 7:** Probar todas las rutas y funcionalidades.
8. **Paso 8:** Verificar accesibilidad (teclado, screen reader, contraste).
9. **Paso 9:** Verificar responsive en 1024px, 768px, 375px.
10. **Paso 10:** Opcionalmente archivar `Sidebar.jsx` (mover a `archive/` o eliminar).

---

## 12. Pruebas Post-Implementación

Checklist mínimo antes de hacer merge:

1. Navegar a cada ruta desde la top bar
2. Verificar que ítems ocultos por permisos NO aparecen (loguearse con nivel 1, 3, 5, 10+)
3. Cerrar sesión desde la top bar
4. Verificar que la ruta activa se resalta correctamente
5. Verificar que el dashboard carga datos correctamente
6. Verificar que los detalles de KPI son visibles sin hover
7. Verificar responsive en 1024px, 768px, 375px
8. Verificar contraste de color (top bar bg `#1e293b` + texto blanco cumple 4.5:1)
9. Tabular por la top bar (focus visible en cada ítem)
10. Verificar que el menú hamburguesa funciona en mobile (si se implementa)

---

## 13. Notas Finales

- **No se elimina ninguna funcionalidad.** Todos los enlaces, permisos, y flujos de navegación se mantienen.
- **El diseño es deliberadamente simple.** El gobierno no necesita efectos visuales; necesita claridad y velocidad.
- **Los recursos ahorrados** (animaciones, SVGs, gradientes) mejoran el tiempo de carga y la experiencia en dispositivos con recursos limitados.
- **La top bar es la solución estándar** para paneles de control gubernamentales y empresariales (ver referencias de GOV.UK, Material Design Admin, etc.).
- **El menú responsive (hamburguesa) no es opcional** — es necesario para que el dashboard funcione en dispositivos móviles y pantallas pequeñas. Implementarlo desde el inicio evita retrabajo posterior.
- **MUI `CircularProgress`** ya es una dependencia del proyecto y elimina la necesidad de `@keyframes` custom para el spinner de carga.