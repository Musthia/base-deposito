# Análisis de Viabilidad — Rediseño del Dashboard (Top Bar)

## 1. Conclusión General

**VIABLE** — todas las funcionalidades existentes se pueden preservar. El cambio de sidebar a top bar no afecta rutas, permisos, lógica de datos ni flujos de navegación.

---

## 2. Mapeo de Funcionalidades: Sidebar Actual → Top Bar

| #  | Funcionalidad                   | Sidebar (actual)                                           | Top Bar (propuesta)                                                                   | Estado                    |
| -- | ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| 1  | Navegación a rutas principales | Panel, Usuarios, Bases, Carga, Auditoría, Reportes, Altas | Mismos ítems en top bar horizontal                                                   | ✅ Preservado             |
| 2  | Navegación a SiMCo             | Sección separada con divisor                              | Mismo ítem en top bar                                                                | ✅ Preservado             |
| 3  | Navegación a Mensajes          | Sección separada con divisor                              | Mismo ítem en top bar                                                                | ✅ Preservado             |
| 4  | Acerca de Datcorr               | Bottom section, solo no-consulta                           | **No listado en la guía** → hay que agregarlo                                 | ⚠️ Agregar              |
| 5  | Acerca de SiMCo                 | Bottom section, todos los roles                            | **No listado en la guía** → hay que agregarlo                                 | ⚠️ Agregar              |
| 6  | Mi cuenta                       | Botón de usuario en bottom section                        | **No listado en la guía** → debería ir en sección usuario (esquina derecha) | ⚠️ Agregar              |
| 7  | Cerrar sesión                  | Bottom section                                             | Esquina superior derecha                                                              | ✅ Guía lo contempla     |
| 8  | Indicador de ruta activa        | `background` condicional                                 | Fondo`#334155` en ítem activo                                                      | ✅ Preservado             |
| 9  | Filtro por permisos             | `perms.canView*` condicionales                           | Misma lógica de permisos                                                             | ✅ Preservado             |
| 10 | Información del usuario        | Nombre, rol, nivel, avatar círculo                        | Esquina derecha (simplificado)                                                        | ✅ Preservado             |
| 11 | Toggle modo oscuro/claro        | Botón en bottom section                                   | **Eliminado de UI** (lógica interna se mantiene)                               | ⚠️ Decisión de diseño |
| 12 | KPI cards con hover overlay     | Overlay con gradiente + animación                         | **Eliminar overlay**, mantener datos visibles                                   | ✅ Simplificación        |
| 13 | Timeline de actividad           | Columna derecha del bottom section                         | Apilado verticalmente en single column                                                | ✅ Preservado             |
| 14 | Tabla de registros por base     | Columna izquierda del bottom section                       | Apilado verticalmente                                                                 | ✅ Preservado             |
| 15 | Loading spinner animado         | `@keyframes spin` con borde                              | Texto "Cargando..." simplificado                                                      | ⚠️ UX más pobre        |
| 16 | Dark mode en MUI theme          | `theme.js` con colores LIGHT/DARK                        | Se mantiene pero sin toggle visible                                                   | ✅ Preservado             |

---

## 3. Puntos Críticos a Revisar con el Equipo

### 3.1 Rutas faltantes en la Top Bar de la guía

La guía propone este menú:

```
Panel de Control | Usuarios | Consultar Bases | Carga de Datos | Auditoría | Reportes | Altas Pendientes | SiMCo | Mensajes
```

Pero el sidebar actual también tiene:

- **Acerca de Datcorr** (`/acerca-datcorr`) — solo para rol no-consulta
- **Acerca de SiMCo** (`/acerca-simco`) — para todos
- **Mi cuenta** (`/mi-cuenta`) — acceso a perfil del usuario

**Sugerencia:** Poner "Acerca de" como un dropdown o agrupar bajo "?" y "Mi cuenta" en la sección de usuario (esquina derecha junto al nombre y cerrar sesión).

### 3.2 Dark mode: ¿eliminar toggle o mantenerlo oculto?

La guía propone eliminarlo de la UI pero conservar la lógica. Esto implica:

- El tema siempre arranca en `light`.
- El `localStorage` nunca se setea a `dark`.
- Las variables CSS para dark mode nunca se aplican.
- El theme de MUI siempre usa colores LIGHT.

**Riesgo:** Si algún componente interno depende de `mode` para algo (ej: estilos condicionales), puede comportarse inesperadamente. Verificar que `isConsulta` y otros flags no dependan de `mode`.

**Alternativa:** Dejar el toggle pero oculto por defecto (accesible mediante combinación de teclas o en página de configuración).

### 3.3 KPI hover overlay — pérdida de información

Actualmente los KPI cards tienen un overlay al hover que muestra detalles (top 3 bases, usuarios activos/inactivos, etc.). Si se elimina, esa información se pierde.

**Sugerencia:** En lugar de overlay animado, mostrar los detalles directamente debajo del valor principal (estático, sin hover), o en un tooltip simple.

### 3.4 Responsive: top bar se desborda en pantallas pequeñas

El menú horizontal propuesto (`display: flex` con `gap: 4px`) no es responsive. En pantallas <768px los ítems se van a superponer o desbordar.

**Sugerencia:** Implementar desde el inicio un menú hamburguesa para mobile, o al menos un `overflow-x: auto` con scroll horizontal. No dejar como "opcional".

### 3.5 Loading spinner → texto "Cargando..."

Reemplazar el spinner animado por texto plano degrada la experiencia de usuario. Un spinner es un estándar de UX que indica actividad.

**Sugerencia:** Mantener un spinner simple pero sin animación compleja. Un `CircularProgress` de MUI (que ya está en el proyecto) es suficiente y no requiere `@keyframes`.

---

## 4. Dependencias y Toques Técnicos

### Archivos a modificar

| Archivo                                       | Cambio                                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `frontend/src/layouts/MainLayout.jsx`       | Reemplazar`<Sidebar />` por `<TopBar />`, cambiar `display: flex` a `flexDirection: column` |
| `frontend/src/layouts/Sidebar.jsx`          | **No eliminar aún** — conservar como respaldo. Archivar después de pruebas.                |
| `frontend/src/layouts/TopBar.jsx`           | **NUEVO** — crear con toda la lógica de navegación del sidebar                             |
| `frontend/src/pages/Dashboard.jsx`          | Simplificar estilos inline según guía                                                             |
| `frontend/src/theme.js`                     | Agregar variables CSS de la top bar (opcional, ya se heredan de CSS vars)                           |
| `frontend/src/context/ThemeModeContext.jsx` | Opcional: deshabilitar toggle, forzar`light`                                                      |

### Archivos que NO cambian

- `frontend/src/router/AppRouter.jsx`
- `frontend/src/services/dashboardService.js`
- `frontend/src/auth/usePermissions.js`
- `frontend/src/auth/authStore.js`
- `frontend/src/api/axiosClient.js`
- Todas las páginas (excepto Dashboard.jsx)

### Dependencias actuales del sidebar que la Top Bar debe heredar

```jsx
// Permisos (se mantiene idéntico)
const perms = usePermissions();

// Navegación
const navigate = useNavigate();
const location = useLocation();

// Auth
const user = useAuthStore((s) => s.user);
const logout = useAuthStore((s) => s.logout);

// Datcorr menu — idéntico
const datcorrMenu = [
    { label: "Panel de Control", path: "/dashboard" },
    ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
    ...(perms.canViewDatabase ? [{ label: "Consultar Bases", path: "/database" }] : []),
    ...(perms.canViewCargaDatos ? [{ label: "Carga de Datos", path: "/carga-datos" }] : []),
    ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
    ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
    ...(perms.canViewAltasPendientes ? [{ label: "Altas Pendientes", path: "/altas-pendientes" }] : []),
];

// SiMCo menu
const simcoMenu = [
    ...(perms.canViewSimco ? [{ label: "Panel de Solicitudes", path: "/simco" }] : []),
];

// Mensajes
...(perms.canViewMensajes ? [{ label: "Mensajes", path: "/mensajes" }] : [])

// Logout
const handleLogout = async () => {
    await api.post("/auth/logout");
    logout();
    navigate("/");
};
```

---

## 5. Buenas Prácticas Recomendadas

### 5.1 Estructura del nuevo TopBar.jsx

```jsx
// 1. Importar dependencias (react-router, auth, api)
// 2. Obtener user, logout, perms
// 3. Definir menús (datcorrMenu, simcoMenu, otros) con permisos
// 4. Renderizar:
//    <header role="navigation" aria-label="Navegación principal">
//      <nav>...</nav>
//      <div> {/* sección usuario */} </div>
//    </header>
```

### 5.2 Estilos: usar CSS module o styled en lugar de inline styles masivos

El sidebar actual y el dashboard usan objetos `styles` en JS. Para la Top Bar, considerar:

- **Opción A:** CSS module (`TopBar.module.css`) — más mantenible
- **Opción B:** Mantener inline styles (consistente con el resto del proyecto)

**Recomendación:** Usar CSS module para la Top Bar, es más limpio y evita recrear objetos en cada render.

### 5.3 Props de accesibilidad obligatorios

```html
<header role="navigation" aria-label="Navegación principal">
<button aria-current="page"> (para ítem activo)
<button aria-label="Cerrar sesión">
```

### 5.4 No mezclar lógica de permisos con presentación

Extraer la lógica de construcción del menú a un hook o función separada:

```jsx
// hooks/useMenuItems.js
export function useMenuItems(perms) {
    return useMemo(() => [
        ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
        // ...
    ], [perms]);
}
```

### 5.5 Pruebas post-implementación

Checklist mínimo antes de hacer merge:

1. Navegar a cada ruta desde la top bar
2. Verificar que ítems ocultos por permisos NO aparecen (loguearse con nivel 1, 3, 5, 10+)
3. Cerrar sesión desde la top bar
4. Verificar que la ruta activa se resalta correctamente
5. Verificar que el dashboard carga datos correctamente
6. Verificar responsive en 1024px, 768px, 375px
7. Verificar contraste de color (top bar bg `#1e293b` + texto blanco cumple 4.5:1)
8. Tabular por la top bar (focus visible en cada ítem)

---

## 6. Referencias

- Paleta de colores institucional definida en la guía (sección 5)
- Las rutas no cambian — ver `AppRouter.jsx` líneas 42–53
- Las variables CSS `--bg-page`, `--bg-card`, `--border`, etc. ya existen y son aplicadas por `ThemeModeContext.jsx`
