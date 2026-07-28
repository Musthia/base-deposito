import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import api from "../api/axiosClient";
import { useAuthStore } from "../auth/authStore";
import { useThemeMode } from "./ThemeModeContext";

const POLL_INTERVAL = 15000;

export default function NotificationProvider({ children }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { colors } = useThemeMode();
    const [notificaciones, setNotificaciones] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const seenNotifIds = useRef(new Set());
    const seenMsgIds = useRef(new Set());

    const fetchPendientes = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get("/api/notificaciones/pendientes");
            const items = res.data.notificaciones || [];
            const nuevos = items.filter((n) => !seenNotifIds.current.has(n.id));
            if (nuevos.length > 0) {
                setNotificaciones((prev) => [...prev, ...nuevos]);
                nuevos.forEach((n) => seenNotifIds.current.add(n.id));
            }
        } catch {
            // silent
        }
        try {
            const res = await api.get("/api/mensajes/pendientes");
            const items = res.data.mensajes || [];
            const nuevos = items.filter((n) => !seenMsgIds.current.has(n.id));
            if (nuevos.length > 0) {
                setMensajes((prev) => [...prev, ...nuevos]);
                nuevos.forEach((n) => seenMsgIds.current.add(n.id));
            }
        } catch {
            // silent
        }
    }, [user]);

    useEffect(() => {
        fetchPendientes();
        const interval = setInterval(fetchPendientes, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchPendientes]);

    const handleClickNotif = async (n) => {
        setNotificaciones((prev) => prev.filter((x) => x.id !== n.id));
        try {
            await api.put(`/api/notificaciones/${n.id}/leer`);
        } catch {
            // silent
        }
        const tab = n.tipo === "nueva_solicitud" ? "solicitudes" : "respuestas";
        navigate("/simco", { state: { highlightTab: tab, highlightId: n.solicitud_id } });
    };

    const handleClickMensaje = async (m) => {
        setMensajes((prev) => prev.filter((x) => x.id !== m.id));
        try {
            await api.put(`/api/mensajes/${m.id}/leer`);
        } catch {
            // silent
        }
        navigate("/mensajes", { state: { responderA: m.remitente_usuario, responderAsunto: m.asunto } });
    };

    const handleDismissNotif = (e, n) => {
        e.stopPropagation();
        setNotificaciones((prev) => prev.filter((x) => x.id !== n.id));
        api.put(`/api/notificaciones/${n.id}/leer`).catch(() => {});
    };

    const handleDismissMensaje = (e, m) => {
        e.stopPropagation();
        setMensajes((prev) => prev.filter((x) => x.id !== m.id));
        api.put(`/api/mensajes/${m.id}/leer`).catch(() => {});
    };

    const allAlerts = [
        ...notificaciones.map((n) => ({ ...n, _tipo: "notificacion" })),
        ...mensajes.map((m) => ({ ...m, _tipo: "mensaje" })),
    ];

    return (
        <>
            {children}
            <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
                {allAlerts.map((item) => {
                    if (item._tipo === "notificacion") {
                        const n = item;
                        return (
                            <Paper
                                key={`n-${n.id}`}
                                elevation={8}
                                onClick={() => handleClickNotif(n)}
                                sx={{
                                    p: 2, cursor: "pointer", borderRadius: 2,
                                    borderLeft: "4px solid",
                                    borderColor: n.tipo === "nueva_solicitud" ? "#f59e0b" : "#16a34a",
                                    bgcolor: colors.bgCard, display: "flex", alignItems: "flex-start", gap: 1.5,
                                    transition: "transform 0.15s",
                                    "&:hover": { transform: "translateX(-4px)" },
                                }}
                            >
                                <NotificationsIcon sx={{ color: n.tipo === "nueva_solicitud" ? colors.warning : colors.success, mt: 0.3 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, color: colors.textMain }}>
                                        {n.tipo === "nueva_solicitud" ? "Nueva Solicitud" : "Solicitud Respondida"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: 12, color: colors.textMuted, wordBreak: "break-word" }}>
                                        {n.mensaje}
                                    </Typography>
                                    <Button size="small" variant="outlined"
                                        sx={{ mt: 1, fontSize: 11, textTransform: "none", borderColor: colors.primary, color: colors.primary }}
                                        onClick={(e) => { e.stopPropagation(); handleClickNotif(n); }}
                                    >
                                        Ver solicitud
                                    </Button>
                                </Box>
                                <IconButton size="small" onClick={(e) => handleDismissNotif(e, n)} sx={{ mt: -0.5, mr: -0.5 }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        );
                    }
                    const m = item;
                    return (
                        <Paper
                            key={`m-${m.id}`}
                            elevation={8}
                            onClick={() => handleClickMensaje(m)}
                            sx={{
                                p: 2, cursor: "pointer", borderRadius: 2,
                                borderLeft: "4px solid #8b5cf6",
                                bgcolor: colors.bgCard, display: "flex", alignItems: "flex-start", gap: 1.5,
                                transition: "transform 0.15s",
                                "&:hover": { transform: "translateX(-4px)" },
                            }}
                        >
                            <MailIcon sx={{ color: "#8b5cf6", mt: 0.3 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, color: colors.textMain }}>
                                    {m.asunto || "Mensaje de " + m.remitente_usuario}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 12, color: colors.textMuted, wordBreak: "break-word" }}>
                                    {m.cuerpo}
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: 10, color: colors.textMuted, mt: 0.5, display: "block" }}>
                                    De: {m.remitente_usuario}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={(e) => handleDismissMensaje(e, m)} sx={{ mt: -0.5, mr: -0.5 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    );
                })}
            </Box>
        </>
    );
}
