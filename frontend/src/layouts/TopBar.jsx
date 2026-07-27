import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { usePermissions } from "../auth/usePermissions";
import api from "../api/axiosClient";

const btnBase = {
    background: "transparent",
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
};

function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const perms = usePermissions();
    const [menuOpen, setMenuOpen] = useState(false);
    const [acercaOpen, setAcercaOpen] = useState(false);
    const acercaBtnRef = useRef(null);

    const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

    const datcorrMenu = useMemo(() => [
        { label: "Panel de Control", path: "/dashboard" },
        ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
        ...(perms.canViewDatabase ? [{ label: "Consultar Bases", path: "/database" }] : []),
        ...(perms.canViewCargaDatos ? [{ label: "Carga de Datos", path: "/carga-datos" }] : []),
        ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
        ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
        ...(perms.canViewAltasPendientes ? [{ label: "Altas Pendientes", path: "/altas-pendientes" }] : []),
        ...(perms.canViewSimco ? [{ label: "SiMCo", path: "/simco" }] : []),
        ...(perms.canViewMensajes ? [{ label: "Mensajes", path: "/mensajes" }] : []),
    ], [perms]);

    const acercaItems = useMemo(() => [
        ...(!perms.isConsulta ? [{ label: "Acerca de Datcorr", path: "/acerca-datcorr" }] : []),
        { label: "Acerca de SiMCo", path: "/acerca-simco" },
    ], [perms.isConsulta]);

    const handleLogout = useCallback(async () => {
        try { await api.post("/auth/logout"); } catch {}
        logout();
        navigate("/");
    }, [logout, navigate]);

    const nav = useCallback((path) => {
        navigate(path);
        setMenuOpen(false);
        setAcercaOpen(false);
    }, [navigate]);

    const nombre = user?.nombre || user?.usuario || "Usuario";
    const inicial = nombre.charAt(0).toUpperCase();
    const rol = user?.rol || "";
    const nivelInfo = user?.nivel !== null && user?.nivel !== undefined ? `Nivel ${user.nivel}` : "";

    const btnActive = useCallback((path) => ({
        ...btnBase,
        background: location.pathname === path ? "#334155" : "transparent",
    }), [location.pathname]);

    const handleAcercaToggle = useCallback(() => setAcercaOpen((p) => !p), []);

    useEffect(() => {
        if (!acercaOpen) return;
        const handler = (e) => {
            if (acercaBtnRef.current && !acercaBtnRef.current.contains(e.target)) {
                setAcercaOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [acercaOpen]);

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

            <nav
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
                        style={btnActive(item.path)}
                        aria-current={location.pathname === item.path ? "page" : undefined}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Acerca dropdown FUERA del nav, no lo corta el overflow */}
            <div ref={acercaBtnRef} style={{ position: "relative", flexShrink: 0 }}>
                <button
                    onClick={handleAcercaToggle}
                    style={btnBase}
                    aria-haspopup="true"
                    aria-expanded={acercaOpen}
                >
                    Acerca ▾
                </button>
                {acercaOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 56,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 4,
                            minWidth: 220,
                            zIndex: 1001,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                    >
                        {acercaItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => nav(item.path)}
                                style={{
                                    ...btnBase,
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "12px 16px",
                                    background: location.pathname === item.path ? "#334155" : "transparent",
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

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
                                ...btnBase,
                                textAlign: "left",
                                width: "100%",
                                padding: "12px 16px",
                                background: location.pathname === item.path ? "#334155" : "transparent",
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
                                ...btnBase,
                                textAlign: "left",
                                width: "100%",
                                padding: "12px 16px",
                                fontSize: 13,
                                opacity: 0.8,
                                background: location.pathname === item.path ? "#334155" : "transparent",
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid #334155", margin: "8px 0" }} />
                    <button
                        onClick={() => { navigate("/mi-cuenta"); setMenuOpen(false); }}
                        style={{ ...btnBase, textAlign: "left", width: "100%", padding: "12px 16px" }}
                    >
                        Mi cuenta
                    </button>
                    <button
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        style={{ ...btnBase, textAlign: "left", width: "100%", padding: "12px 16px", color: "#ff6b6b" }}
                    >
                        Cerrar sesion
                    </button>
                </div>
            )}
        </header>
    );
}

export default memo(TopBar);
