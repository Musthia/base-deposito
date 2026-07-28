import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
} from "@mui/material";
import { useAuthStore } from "../auth/authStore";
import { usePermissions } from "../auth/usePermissions";
import api from "../api/axiosClient";
import { getUsuariosEnLinea } from "../services/estadisticasService";

const btnBase = {
    background: "transparent",
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 16,
    whiteSpace: "nowrap",
    borderRadius: "4px",
    transition: "background 0.15s",
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
    const [onlineCount, setOnlineCount] = useState(0);
    const [onlineUsuarios, setOnlineUsuarios] = useState([]);
    const [onlineOpen, setOnlineOpen] = useState(false);
    const onlineBtnRef = useRef(null);
    const [msgDialogOpen, setMsgDialogOpen] = useState(false);
    const [msgDestinatario, setMsgDestinatario] = useState(null);
    const [msgGeneral, setMsgGeneral] = useState(false);
    const [msgAsunto, setMsgAsunto] = useState("");
    const [msgCuerpo, setMsgCuerpo] = useState("");
    const [msgSending, setMsgSending] = useState(false);

    useEffect(() => {
        const fetch = () => {
            getUsuariosEnLinea()
                .then((d) => { setOnlineCount(d.cantidad); setOnlineUsuarios(d.usuarios); })
                .catch(() => {});
        };
        fetch();
        const id = setInterval(fetch, 30000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!onlineOpen) return;
        const handler = (e) => {
            if (onlineBtnRef.current && !onlineBtnRef.current.contains(e.target)) {
                setOnlineOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onlineOpen]);

    const datcorrMenu = useMemo(() => [
        { label: "Panel de Control", path: "/dashboard" },
        ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
        ...(perms.canViewDatabase ? [{ label: "Consultar Bases", path: "/database" }] : []),
        ...(perms.canViewCargaDatos ? [{ label: "Carga de Datos", path: "/carga-datos" }] : []),
        ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
        ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
        ...(perms.canViewReportes ? [{ label: "Estadísticas", path: "/estadisticas" }] : []),
        ...(perms.canViewAltasPendientes ? [{ label: "Altas Pendientes", path: "/altas-pendientes" }] : []),
        ...(perms.canViewSimco ? [{ label: "SiMCo", path: "/simco" }] : []),
        ...(perms.canViewMensajes ? [{ label: "Mensajes", path: "/mensajes" }] : []),
    ], [perms]);

    const acercaItems = useMemo(() => [
        ...(!perms.isConsulta ? [{ label: "Acerca de Datcorr", path: "/acerca-datcorr" }] : []),
        { label: "Acerca de SiMCo", path: "/acerca-simco" },
    ], [perms.isConsulta]);

    const handleLogout = useCallback(async () => {
        try { await api.post("/auth/logout"); } catch { /* ignore */ }
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

    const btnActive = useCallback((path) => ({
        ...btnBase,
        background: location.pathname === path ? "#424147" : "transparent",
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
            role="banner"
            aria-label="Barra de navegacion principal"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                background: "#646363",
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
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#373838",
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
                                onMouseEnter={(e) => { if (location.pathname !== item.path) e.currentTarget.style.background = "#424147"; }}
                                onMouseLeave={(e) => { if (location.pathname !== item.path) e.currentTarget.style.background = "transparent"; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div ref={onlineBtnRef} style={{ position: "relative", flexShrink: 0, marginRight: 4 }}>
                <button
                    onClick={() => setOnlineOpen((p) => !p)}
                    style={{
                        ...btnBase,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        padding: "6px 10px",
                    }}
                    title="Usuarios en línea"
                    aria-haspopup="true"
                    aria-expanded={onlineOpen}
                >
                    <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: onlineCount > 0 ? "#22c55e" : "#6b7280",
                        display: "inline-block", flexShrink: 0,
                    }} />
                    {onlineCount}
                </button>
                {onlineOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#373838",
                            border: "1px solid #334155",
                            borderRadius: 4,
                            minWidth: 200,
                            zIndex: 1001,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            padding: "8px 0",
                        }}
                    >
                        <div style={{ padding: "4px 16px 8px", fontSize: 11, color: "#94a3b8", borderBottom: "1px solid #334155", marginBottom: 4 }}>
                            Usuarios en línea
                        </div>
                        {onlineUsuarios.length === 0 ? (
                            <div style={{ padding: "8px 16px", fontSize: 13, color: "#94a3b8" }}>
                                Ninguno
                            </div>
                        ) : (
                            onlineUsuarios.map((u) => (
                                <div key={u} style={{
                                    padding: "6px 16px",
                                    fontSize: 13,
                                    color: "#e2e8f0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <span>{u}</span>
                                    <button
                                        onClick={() => {
                                            setMsgDestinatario(u);
                                            setMsgGeneral(false);
                                            setMsgAsunto("");
                                            setMsgCuerpo("");
                                            setMsgDialogOpen(true);
                                            setOnlineOpen(false);
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "1px solid #8b5cf6",
                                            color: "#8b5cf6",
                                            borderRadius: 4,
                                            padding: "2px 8px",
                                            fontSize: 11,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Mensaje
                                    </button>
                                </div>
                            ))
                        )}
                        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4 }}>
                            <button
                                onClick={() => {
                                    setMsgDestinatario(null);
                                    setMsgGeneral(true);
                                    setMsgAsunto("");
                                    setMsgCuerpo("");
                                    setMsgDialogOpen(true);
                                    setOnlineOpen(false);
                                }}
                                style={{
                                    ...btnBase,
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px 16px",
                                    fontSize: 12,
                                    color: "#8b5cf6",
                                }}
                            >
                                + Mensaje general a todos
                            </button>
                        </div>
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
                        borderRadius: 4,
                        transition: "background 0.15s",
                    }}
                    title="Mi cuenta"
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
                                ({[rol].filter(Boolean).join(" · ")})
                            </span>
                        )}
                    </span>
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "#dc2626",
                        cursor: "pointer",
                        padding: "6px 12px",
                        fontSize: 13,
                        borderRadius: 4,
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.12)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    aria-label="Cerrar sesion"
                >
                    Cerrar sesion
                </button>
            </div>

            <Dialog open={msgDialogOpen} onClose={() => setMsgDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: 15, fontWeight: 600 }}>
                    {msgGeneral ? "Mensaje general a todos los usuarios" : `Mensaje para ${msgDestinatario}`}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Asunto (opcional)"
                        fullWidth
                        size="small"
                        value={msgAsunto}
                        onChange={(e) => setMsgAsunto(e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        label="Mensaje"
                        fullWidth
                        multiline
                        rows={4}
                        value={msgCuerpo}
                        onChange={(e) => setMsgCuerpo(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMsgDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        disabled={!msgCuerpo.trim() || msgSending}
                        onClick={async () => {
                            setMsgSending(true);
                            try {
                                await api.post("/api/mensajes/enviar", {
                                    destinatario_usuario: msgGeneral ? null : msgDestinatario,
                                    es_general: msgGeneral,
                                    asunto: msgAsunto.trim() || null,
                                    cuerpo: msgCuerpo.trim(),
                                });
                                setMsgDialogOpen(false);
                            } catch {
                                // silent
                            } finally {
                                setMsgSending(false);
                            }
                        }}
                    >
                        {msgSending ? "Enviando..." : "Enviar"}
                    </Button>
                </DialogActions>
            </Dialog>

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
                    
                </div>
            )}
        </header>
    );
}

export default memo(TopBar);
