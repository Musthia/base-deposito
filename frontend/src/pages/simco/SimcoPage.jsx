import { useState, useMemo, useCallback, useEffect } from "react";
import {
    Box, Typography, Paper, Tabs, Tab, Snackbar, Alert,
} from "@mui/material";
import { useAuthStore } from "../../auth/authStore";
import { useLocation } from "react-router-dom";
import SolicitudesTab from "./SolicitudesTab";
import RespuestasTab from "./RespuestasTab";
import useSimcoWS from "../../hooks/useSimcoWS";

const PALETTE = {
    bgPage: "#f8fafc",
    bgCard: "#ffffff",
    border: "#e2e8f0",
    textMain: "#0f172a",
    textMuted: "#64748b",
    primary: "#0284c7",
};

const TABS = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Solicitudes", key: "solicitudes" },
    { label: "Respuestas", key: "respuestas" },
];

export default function SimcoPage() {
    const user = useAuthStore((s) => s.user);
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

    const tabActual = tabsVisibles[tab];
    const contenido = () => {
        if (!tabActual) return null;
        switch (tabActual.key) {
            case "solicitudes": return <SolicitudesTab highlightId={highlightId} />;
            case "respuestas": return <RespuestasTab highlightId={highlightId} />;
            default: return (
                <Typography sx={{ color: PALETTE.textMuted, textAlign: "center", py: 6 }}>
                    Dashboard en construcción
                </Typography>
            );
        }
    };

    return (
        <Box sx={{ backgroundColor: PALETTE.bgPage, minHeight: "100vh", p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${PALETTE.border}` }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: PALETTE.textMain, mb: 0.5 }}>
                    SiMCo
                </Typography>
                <Typography variant="body2" sx={{ color: PALETTE.textMuted }}>
                    Sistema de Manejo de Consultas
                </Typography>
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
