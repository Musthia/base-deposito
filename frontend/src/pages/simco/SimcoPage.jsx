import { useState, useMemo, useCallback, useEffect } from "react";
import {
    Box, Typography, Paper, Tabs, Tab, Snackbar, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { useAuthStore } from "../../auth/authStore";
import { useLocation } from "react-router-dom";
import SolicitudesTab from "./SolicitudesTab";
import RespuestasTab from "./RespuestasTab";
import useSimcoWS from "../../hooks/useSimcoWS";
import api from "../../api/axiosClient";

const PALETTE = {
    bgPage: "#0f172a",
    bgCard: "#042164",
    border: "#1e3a8a",
    textMain: "#f1f5f9",
    textMuted: "#94a3b8",
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
};

const chipEstado = (estado) => {
    const map = {
        pendiente: { label: "Pendiente", color: PALETTE.warning },
        respondida: { label: "Respondido", color: PALETTE.success },
    };
    const cfg = map[estado] || { label: estado, color: PALETTE.textMuted };
    return <Chip label={cfg.label} size="small" sx={{ fontWeight: 600, fontSize: 11, backgroundColor: cfg.color, color: "#fff" }} />;
};

const TABS = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Solicitudes", key: "solicitudes" },
    { label: "Respuestas", key: "respuestas" },
];

export default function SimcoPage() {
    const user = useAuthStore((s) => s.user);
    const [dashboardData, setDashboardData] = useState(null);
    const nivel = user?.nivel ?? 0;
    const esSuper = user?.superusuario ?? false;
    const esAdmin = esSuper || nivel >= 10;

    const [notif, setNotif] = useState({ open: false, msg: "", severity: "info" });

    const onWSEvent = useCallback((data) => {
        setNotif({ open: true, msg: data.mensaje, severity: "info" });
    }, []);

    useSimcoWS(onWSEvent);

    const tabsVisibles = useMemo(() => {
        return TABS.filter((t) => {
            if (t.key === "dashboard") return true;
            if (t.key === "solicitudes") return nivel <= 3 || esAdmin;
            if (t.key === "respuestas") return nivel >= 5;
            return true;
        });
    }, [nivel, esAdmin]);

    const location = useLocation();
    const [tab, setTab] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    useEffect(() => {
        const state = location.state;
        if (state?.highlightTab && state?.highlightId) {
            const idx = tabsVisibles.findIndex((t) => t.key === state.highlightTab);
            if (idx >= 0) setTab(idx);
            setHighlightId(state.highlightId);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, tabsVisibles]);

    useEffect(() => {
        api.get("/api/simco/dashboard").then((res) => setDashboardData(res.data)).catch(() => {});
    }, []);

    const tabActual = tabsVisibles[tab];
    const contenido = () => {
        if (!tabActual) return null;
        switch (tabActual.key) {
            case "solicitudes": return <SolicitudesTab highlightId={highlightId} />;
            case "respuestas": return <RespuestasTab highlightId={highlightId} />;
            default: {
                const act = dashboardData?.actividad;
                return (
                    <Box sx={{ display: "flex", gap: 3 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PALETTE.textMain, mb: 2 }}>
                                Solicitudes de Hoy ({act?.solicitudes?.length || 0})
                            </Typography>
                            {act?.solicitudes?.length ? (
                                <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${PALETTE.border}` }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>TIPO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CREADOR</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {act.solicitudes.map((s) => (
                                                <TableRow key={s.id} hover>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.codigo}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.tipo_documento}</TableCell>
                                                    <TableCell>{chipEstado(s.estado)}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.creado_por || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" sx={{ color: PALETTE.textMuted, fontStyle: "italic" }}>Sin solicitudes hoy</Typography>
                            )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PALETTE.textMain, mb: 2 }}>
                                Respuestas de Hoy ({act?.respuestas?.length || 0})
                            </Typography>
                            {act?.respuestas?.length ? (
                                <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${PALETTE.border}` }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO DOC.</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>RESPONDIÓ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {act.respuestas.map((r) => (
                                                <TableRow key={r.id} hover>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.codigo}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.estado_documento}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.usuario_responde || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" sx={{ color: PALETTE.textMuted, fontStyle: "italic" }}>Sin respuestas hoy</Typography>
                            )}
                        </Box>
                    </Box>
                );
            }
        }
    };

    const resumen = dashboardData?.resumen;
    const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <Box sx={{ minHeight: "100vh", p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: PALETTE.textMain, mb: 0.5 }}>
                        SiMCo
                    </Typography>
                    <Typography variant="body2" sx={{ color: PALETTE.textMuted }}>
                        {hoy}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: PALETTE.primary }}>{resumen?.solicitudes_hoy ?? "—"}</Typography>
                        <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>Solicitudes hoy</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: PALETTE.success }}>{resumen?.respuestas_hoy ?? "—"}</Typography>
                        <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>Respuestas hoy</Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ borderRadius: 2, border: `1px solid ${PALETTE.border}`, overflow: "hidden" }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                    {tabsVisibles.map((t) => (
                        <Tab key={t.key} label={t.label} />
                    ))}
                </Tabs>

                <Box sx={{ p: 3, minHeight: 300 }}>
                    {contenido()}
                </Box>
            </Paper>
            <Snackbar open={notif.open} autoHideDuration={5000} onClose={() => setNotif({ ...notif, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={notif.severity} variant="filled" sx={{ width: "100%" }}>
                    {notif.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
