import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../api/axiosClient";
import { useAuthStore } from "../auth/authStore";
import { useThemeMode } from "./ThemeModeContext";

const POLL_INTERVAL = 15000;

export default function NotificationProvider({ children }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { colors } = useThemeMode();
    const [notificaciones, setNotificaciones] = useState([]);
    const seenIds = useRef(new Set());

    const fetchPendientes = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get("/api/notificaciones/pendientes");
            const items = res.data.notificaciones || [];
            const nuevos = items.filter((n) => !seenIds.current.has(n.id));
            if (nuevos.length > 0) {
                setNotificaciones((prev) => [...prev, ...nuevos]);
                nuevos.forEach((n) => seenIds.current.add(n.id));
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

    const handleClick = async (n) => {
        setNotificaciones((prev) => prev.filter((x) => x.id !== n.id));
        try {
            await api.put(`/api/notificaciones/${n.id}/leer`);
        } catch {
            // silent
        }
        const tab = n.tipo === "nueva_solicitud" ? "solicitudes" : "respuestas";
        navigate("/simco", { state: { highlightTab: tab, highlightId: n.solicitud_id } });
    };

    const handleDismiss = (e, n) => {
        e.stopPropagation();
        setNotificaciones((prev) => prev.filter((x) => x.id !== n.id));
        api.put(`/api/notificaciones/${n.id}/leer`).catch(() => {});
    };

    return (
        <>
            {children}
            <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
                {notificaciones.map((n) => (
                    <Paper
                        key={n.id}
                        elevation={8}
                        onClick={() => handleClick(n)}
                        sx={{
                            p: 2,
                            cursor: "pointer",
                            borderRadius: 2,
                            borderLeft: "4px solid",
                            borderColor: n.tipo === "nueva_solicitud" ? "#f59e0b" : "#16a34a",
                            bgcolor: colors.bgCard,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
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
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1, fontSize: 11, textTransform: "none", borderColor: colors.primary, color: colors.primary }}
                                onClick={(e) => { e.stopPropagation(); handleClick(n); }}
                            >
                                Ver solicitud
                            </Button>
                        </Box>
                        <IconButton size="small" onClick={(e) => handleDismiss(e, n)} sx={{ mt: -0.5, mr: -0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Paper>
                ))}
            </Box>
        </>
    );
}
