# Ejecución: Rediseño del Dashboard a Top Bar

> Documento de consulta final con todos los cambios a realizar, archivo por archivo.
> Una vez aprobado por el equipo, se ejecuta en orden secuencial.

---

## Orden de Ejecución

| Paso | Archivo | Acción |
|------|---------|--------|
| 1 | `TopBar.jsx` | **CREAR** nuevo componente de barra superior |
| 2 | `MainLayout.jsx` | **MODIFICAR** reemplazar Sidebar por TopBar |
| 3 | `Dashboard.jsx` | **MODIFICAR** simplificar estilos inline |
| 4 | `theme.js` | **MODIFICAR** agregar variables de top bar |
| 5 | `ThemeModeContext.jsx` | **MODIFICAR** forzar modo light (opcional) |

---

## PASO 1 — Crear `frontend/src/layouts/TopBar.jsx`

Extraer toda la lógica de navegación del `Sidebar.jsx` actual y adaptarla a top bar.

```jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { usePermissions } from "../auth/usePermissions";
import api from "../api/axiosClient";

export default function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const perms = usePermissions();
    const [menuOpen, setMenuOpen] = useState(false);
    const [acercaOpen, setAcercaOpen] = useState(false);
    const menuRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    const datcorrMenu = [
        { label: "Panel de Control", path: "/dashboard" },
        ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
        ...(perms.canViewDatabase ? [{ label: "Consultar Bases", path: "/database" }] : []),
        ...(perms.canViewCargaDatos ? [{ label: "Carga de Datos", path: "/carga-datos" }] : []),
        ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
        ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
        ...(perms.canViewAltasPendientes ? [{ label: "Altas Pendientes", path: "/altas-pendientes" }] : []),
        ...(perms.canViewSimco ? [{ label: "SiMCo", path: "/simco" }] : []),
        ...(perms.canViewMensajes ? [{ label: "Mensajes", path: "/mensajes" }] : []),
    ];

    const acercaItems = [
        ...(!perms.isConsulta ? [{ label: "Acerca de Datcorr", path: "/acerca-datcorr" }] : []),
        { label: "Acerca de SiMCo", path: "/acerca-simco" },
    ];

    const handleLogout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        logout();
        navigate("/");
    };

    const nav = (path) => {
        navigate(path);
        setMenuOpen(false);
        setAcercaOpen(false);
    };

    const nombre = user?.nombre || user?.usuario || "Usuario";
    const inicial = nombre.charAt(0).toUpperCase();
    const rol = user?.rol || "";
    const nivelInfo = user?.nivel !== null && user?.nivel !== undefined ? `Nivel ${user.nivel}` : "";

    const btnStyle = (active) => ({
        background: active ? "#334155" : "transparent",
        color: "#ffffff",
        border: "none",
        padding: "10px 14px",
        cursor: "pointer",
        fontSize: 14,
        whiteSpace: "nowrap",
    });

    return (
        <header
            role="navigation"
            aria-label="Navegacion principal"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                background: "#1e293b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 1000,
                padding: "0 12px",
            }}
        >
            {/* Hamburguesa (solo visible en mobile) */}
            <button
                onClick={() => setMenuOpen((p) => !p)}
                style={{
                    display: "none",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: 24,
                    cursor: "pointer",
                    padding: "4px 8px",
                }}
                className="topbar-hamburger"
                aria-label="Abrir menu de navegacion"
            >
                {menuOpen ? "\u2715" : "\u2630"}
            </button>

            {/* Menu horizontal */}
            <nav
                ref={menuRef}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    overflowX: "auto",
                    flex: 1,
                }}
                className="topbar-nav"
            >
                {datcorrMenu.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => nav(item.path)}
                        style={btnStyle(isActive(item.path))}
                        aria-current={isActive(item.path) ? "page" : undefined}
                    >
                        {item.label}
                    </button>
                ))}

                {/* Acerca dropdown */}
                {acercaItems.length > 0 && (
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setAcercaOpen((p) => !p)}
                            style={btnStyle(false)}
                            aria-haspopup="true"
                            aria-expanded={acercaOpen}
                        >
                            Acerca ▾
                        </button>
                        {acercaOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    minWidth: 180,
                                    zIndex: 1001,
                                }}
                            >
                                {acercaItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => nav(item.path)}
                                        style={{
                                            ...btnStyle(isActive(item.path)),
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "10px 14px",
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Seccion usuario */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={() => navigate("/mi-cuenta")}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        fontSize: 13,
                    }}
                    title="Mi cuenta"
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#3f51b5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {inicial}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
                        {nombre}
                        {rol && (
                            <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>
                                ({[rol, nivelInfo].filter(Boolean).join(" · ")})
                            </span>
                        )}
                    </span>
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "#ff6b6b",
                        cursor: "pointer",
                        padding: "6px 12px",
                        fontSize: 13,
                        borderRadius: 4,
                    }}
                    aria-label="Cerrar sesion"
                >
                    Cerrar sesion
                </button>
            </div>

            {/* Menu mobile (toggle) */}
            {menuOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 56,
                        left: 0,
                        right: 0,
                        background: "#1e293b",
                        borderTop: "1px solid #334155",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 999,
                        padding: "8px 0",
                    }}
                    className="topbar-mobile-menu"
                >
                    {datcorrMenu.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => nav(item.path)}
                            style={{
                                ...btnStyle(isActive(item.path)),
                                textAlign: "left",
                                width: "100%",
                                padding: "12px 16px",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                    {acercaItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => nav(item.path)}
                            style={{
                                ...btnStyle(isActive(item.path)),
                                textAlign: "left",
                                width: "100%",
                                padding: "12px 16px",
                                fontSize: 13,
                                opacity: 0.8,
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid #334155", margin: "8px 0" }} />
                    <button
                        onClick={() => { navigate("/mi-cuenta"); setMenuOpen(false); }}
                        style={{ ...btnStyle(false), textAlign: "left", width: "100%", padding: "12px 16px" }}
                    >
                        Mi cuenta
                    </button>
                    <button
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        style={{ ...btnStyle(false), textAlign: "left", width: "100%", padding: "12px 16px", color: "#ff6b6b" }}
                    >
                        Cerrar sesion
                    </button>
                </div>
            )}
        </header>
    );
}
```

Luego, en el mismo archivo o en `index.css` global, agregar el media query para mostrar la hamburguesa en mobile:

```css
@media (max-width: 768px) {
    .topbar-hamburger {
        display: block !important;
    }
    .topbar-nav {
        display: none !important;
    }
}
```

---

## PASO 2 — Modificar `frontend/src/layouts/MainLayout.jsx`

```jsx
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import { TabProvider } from "../context/TabContext";
import { useIdleTimeout } from "../hooks/useIdleTimeout";
import NotificationProvider from "../context/NotificationProvider";

export default function MainLayout() {
    useIdleTimeout();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <TopBar />
            <main style={{
                flex: 1,
                padding: "24px",
                paddingTop: "80px",
                background: "#ffffff",
                overflow: "auto",
            }}>
                <NotificationProvider>
                    <TabProvider>
                        <Outlet />
                    </TabProvider>
                </NotificationProvider>
            </main>
        </div>
    );
}
```

---

## PASO 3 — Modificar `frontend/src/pages/Dashboard.jsx`

### 3.1 Reemplazar loading spinner

**ANTES:**
```jsx
if (!stats) {
    return (
        <div style={loadingStyles.container}>
            <div style={loadingStyles.spinner} />
            <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Cargando panel...</p>
        </div>
    );
}
```

**DESPUÉS:**
```jsx
import CircularProgress from "@mui/material/CircularProgress";

if (!stats) {
    return (
        <div style={loadingStyles.container}>
            <CircularProgress size={32} />
            <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Cargando panel...</p>
        </div>
    );
}
```

### 3.2 Simplificar Welcome Card

**ANTES:**
```js
const welcomeStyles = {
    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "var(--bg-card)",
        padding: "24px 32px",
        borderRadius: "12px",
        border: `1px solid ${"var(--border)"}`,
        marginBottom: "24px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    title: {
        fontSize: "26px",
        fontWeight: "700",
        color: "var(--text-main)",
        margin: 0,
        letterSpacing: "-0.02em"
    },
    // ...
};
```

**DESPUÉS:**
```js
const welcomeStyles = {
    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#f8fafc",
        borderBottom: "2px solid #e2e8f0",
        padding: "20px 24px",
        marginBottom: "24px",
    },
    title: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#1e293b",
        margin: 0,
    },
    desc: {
        fontSize: "14px",
        color: "#64748b",
        margin: "4px 0 0 0",
    },
    badge: {
        background: "#e2e8f0",
        padding: "4px 10px",
    },
    badgeText: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748b",
    },
};
```

### 3.3 Simplificar KPI Cards

**ANTES (kpiStyles):**
```js
const kpiStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
    },
    card: {
        backgroundColor: "var(--bg-card)",
        borderRadius: "12px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        border: `1px solid ${"var(--border)"}`,
        position: "relative",
        overflow: "hidden",
    },
    iconWrap: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },
    label: { fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" },
    value: { fontSize: "26px", fontWeight: "700", color: "var(--text-main)", lineHeight: 1.2 },
    sub: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }
};
```

**DESPUÉS:**
```js
const kpiStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
    },
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        position: "relative",
    },
    iconWrap: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "4px",
    },
    label: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
    value: { fontSize: "24px", fontWeight: "700", color: "#1e293b", lineHeight: 1.2 },
    sub: { fontSize: "12px", color: "#64748b", marginTop: "2px" }
};
```

### 3.4 Eliminar overlay hover del KPI Card

**Reemplazar todo el componente `KpiCard`:**
```jsx
function KpiCard({ icon, iconBg, iconColor, label, value, sub, details, onClick }) {
    const [showDetails, setShowDetails] = useState(false);
    return (
        <div
            style={{ ...kpiStyles.card, cursor: onClick ? "pointer" : "default" }}
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
            onClick={onClick}
        >
            <div style={{ ...kpiStyles.iconWrap, background: iconBg }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: iconColor }}>{icon}</span>
            </div>
            <div style={{ flex: 1 }}>
                <div style={kpiStyles.label}>{label}</div>
                <div style={kpiStyles.value}>{value}</div>
                <div style={kpiStyles.sub}>{sub}</div>
                {/* Detalles visibles sin animacion */}
                {showDetails && details && (
                    <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 6 }}>
                        {details.map((d, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 12,
                                color: "#64748b",
                                padding: "2px 0",
                            }}>
                                <span>{d.label}</span>
                                <span style={{ fontWeight: 600 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
```

### 3.5 Simplificar bottom section (Table + Timeline)

**ANTES:**
```js
const bottomStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: "24px",
        alignItems: "start"
    },
    // ...
};
```

**DESPUÉS:**
```js
const bottomStyles = {
    row: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
    },
};
```

También actualizar `cardStyles`:
```js
const cardStyles = {
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
    }
};
```

### 3.6 Simplificar tabla

**ANTES:**
```js
const thStyles = {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: `1px solid ${"var(--border)"}`,
    textAlign: "left"
};
// ...
const tableStyles = {
    container: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    tr: { transition: "background-color 0.15s ease" },
    // ...
};
```

**DESPUÉS:**
```js
const thStyles = {
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left"
};
const tdStyles = {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#1e293b",
    borderBottom: "1px solid #e2e8f0"
};
const tableStyles = {
    container: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    thRight: { ...thStyles, textAlign: "right" },
    tdValue: { ...tdStyles, textAlign: "right", fontWeight: "600" },
    tdDatcorr: { ...tdStyles, textAlign: "right", color: "#0284c7", fontWeight: "500" },
    tdVerificado: { ...tdStyles, textAlign: "right", color: "#16a34a", fontWeight: "500" },
    tfootTr: { background: "#f8fafc" },
    tfootTdLabel: { ...tdStyles, fontWeight: "700", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdValue: { ...tdStyles, fontWeight: "700", textAlign: "right", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdDatcorr: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "#0284c7", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdVerificado: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "#16a34a", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
};
```

### 3.7 Simplificar timeline

**ANTES:**
```js
const tlStyles = {
    icon: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#ffffff", fontWeight: "bold", zIndex: 2 },
    line: { width: "2px", backgroundColor: "var(--border)", flexGrow: 1, marginTop: "4px", marginBottom: "4px" },
    // ...
};
```

**DESPUÉS:**
```js
const tlStyles = {
    row: { display: "flex", gap: "12px" },
    iconCol: { display: "flex", flexDirection: "column", alignItems: "center" },
    icon: { width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#ffffff", fontWeight: "bold" },
    line: { width: "1px", background: "#e2e8f0", flexGrow: 1, margin: "2px 0" },
    textCol: { paddingBottom: "16px" },
    label: { fontSize: "13px", fontWeight: "500", color: "#1e293b" },
    time: { fontSize: "12px", color: "#64748b", marginTop: "2px" },
};
```

### 3.8 Simplificar loading styles

**ANTES:**
```js
const loadingStyles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-page)" },
    spinner: { width: "32px", height: "32px", border: `3px solid ${"var(--border)"}`, borderTop: `3px solid ${"var(--primary)"}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    text: { marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }
};
```

**DESPUÉS:**
```js
const loadingStyles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" },
};
```

(Eliminar el objeto `spinner` — ya no se usa, se reemplaza por `<CircularProgress />`)

---

## PASO 4 — Modificar `frontend/src/theme.js`

Agregar variables al inicio del archivo:

```js
export const TOPBAR = {
    bg: "#1e293b",
    text: "#ffffff",
    activeBg: "#334155",
    height: "56px",
};

export const BORDER_SUBTLE = "#e2e8f0";
```

(Opcionalmente, agregar al objeto `LIGHT` si se usan en el theme de MUI)

---

## PASO 5 — Modificar `frontend/src/context/ThemeModeContext.jsx`

Forzar modo light eliminando la UI del toggle. La lógica interna se mantiene por compatibilidad:

```jsx
// Al inicio del provider, forzar siempre "light"
const [mode, setMode] = useState("light");

// toggleMode se mantiene pero no se expone en UI
const toggleMode = useCallback(() => {
    // No-op: el modo siempre es light
}, []);
```

---

## Post-Ejecución: Verificación

Ejecutar estos checks después de implementar todos los cambios:

```bash
# 1. Arrancar el frontend
cd frontend
npm run dev

# 2. Rutas a probar manualmente:
#    /dashboard, /usuarios, /database, /carga-datos, /auditoria,
#    /reportes, /altas-pendientes, /simco, /mensajes,
#    /acerca-datcorr, /acerca-simco, /mi-cuenta

# 3. Verificar que el logout funciona

# 4. Verificar que los permisos ocultan items correctamente
#    (loguearse con nivel 1, 3, 5, 10+)

# 5. Verificar responsive: redimensionar a 768px y 375px

# 6. Verificar que no hay errores en consola del navegador
```

---

## Rollback (si algo falla)

Si algún cambio rompe funcionalidad, revertir archivos individuales:

```bash
git checkout -- frontend/src/layouts/MainLayout.jsx
git checkout -- frontend/src/pages/Dashboard.jsx
git checkout -- frontend/src/context/ThemeModeContext.jsx
git checkout -- frontend/src/theme.js
git checkout -- frontend/src/layouts/TopBar.jsx   # eliminar archivo nuevo
```

O revertir todo:
```bash
git checkout -- frontend/src/
```
