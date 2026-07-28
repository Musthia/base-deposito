import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Paper, Tabs, Tab, Button, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert,
} from "@mui/material";
import api from "../api/axiosClient";
import { useThemeMode } from "../context/ThemeModeContext";

const ROLES = [
    { value: "admin", label: "Administrador" },
    { value: "consulta", label: "Consulta" },
    { value: "operador", label: "Operador" },
    { value: "supervisor", label: "Supervisor" },
];

export default function AltasPendientesPage() {
    const { colors } = useThemeMode();
    const [tab, setTab] = useState(0);
    const [pendientes, setPendientes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aprobando, setAprobando] = useState(null);
    const [rechazando, setRechazando] = useState(null);
    const [rechazoMotivo, setRechazoMotivo] = useState("");
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });


    const fetchPendientes = useCallback(async () => {
        try {
            const res = await api.get("/registro/pendientes");
            setPendientes(res.data.pendientes || []);
        } catch { }
    }, []);

    const fetchHistorial = useCallback(async () => {
        try {
            const res = await api.get("/registro/historial");
            setHistorial(res.data.historial || []);
        } catch { }
    }, []);

    useEffect(() => {
        Promise.all([fetchPendientes(), fetchHistorial()]).finally(() => setLoading(false));
    }, [fetchPendientes, fetchHistorial]);

    const handleAprobar = async () => {
        try {
            await api.post(`/registro/${aprobando.id}/aprobar`, {
                rol: aprobando.rol,
                nivel: aprobando.nivel,
            });
            setSnack({ open: true, msg: `Usuario ${aprobando.username_sugerido} creado correctamente`, severity: "success" });
            setAprobando(null);
            fetchPendientes();
            fetchHistorial();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.detail || "Error al aprobar", severity: "error" });
        }
    };

    const handleRechazar = async () => {
        if (!rechazoMotivo.trim()) return;
        try {
            await api.post(`/registro/${rechazando.id}/rechazar`, { motivo: rechazoMotivo });
            setSnack({ open: true, msg: "Solicitud rechazada", severity: "success" });
            setRechazando(null);
            setRechazoMotivo("");
            fetchPendientes();
            fetchHistorial();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.detail || "Error al rechazar", severity: "error" });
        }
    };

    const renderPendiente = (r) => (
        <Paper key={r.id} elevation={0} sx={{ p: 3, mb: 2, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Typography sx={{ fontWeight: 700 }}>{r.nombre} {r.apellido}</Typography>
                    <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.5 }}>
                        @{r.username_sugerido} &middot; {r.email}
                    </Typography>
                    {r.telefono && <Typography variant="body2" sx={{ color: colors.textMuted }}>Tel: {r.telefono}</Typography>}
                    {r.organizacion && <Typography variant="body2" sx={{ color: colors.textMuted }}>Org: {r.organizacion}</Typography>}
                    {r.motivo && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic", color: colors.textMuted }}>
                            "{r.motivo}"
                        </Typography>
                    )}
                </Box>
                <Chip label="Pendiente" color="warning" size="small" />
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button variant="contained" color="success" size="small" onClick={() => setAprobando({ ...r, rol: "consulta", nivel: 1 })}>
                    Aprobar
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => { setRechazando(r); setRechazoMotivo(""); }}>
                    Rechazar
                </Button>
            </Box>
        </Paper>
    );

    const renderHistorialItem = (r) => {
        const esAprobado = r.estado === "aprobado";
        return (
            <Paper key={r.id} elevation={0} sx={{ p: 2, mb: 1, border: `1px solid ${colors.border}`, borderRadius: 1, opacity: 0.8 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{r.nombre} {r.apellido}</Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>{r.email}</Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                        <Chip label={esAprobado ? "Aprobado" : "Rechazado"} color={esAprobado ? "success" : "error"} size="small" />
                        {esAprobado && r.rol_asignado && (
                            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: colors.textMuted }}>
                                {r.rol_asignado} (nivel {r.nivel_asignado})
                            </Typography>
                        )}
                        {!esAprobado && r.rechazo_motivo && (
                            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: colors.textMuted }}>
                                {r.rechazo_motivo}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return <Box sx={{ p: 3 }}><Typography sx={{ color: colors.textMuted }}>Cargando...</Typography></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#111827", mb: 3 }}>Altas de usuarios pendientes</Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Pendientes (${pendientes.length})`} />
                <Tab label={`Historial (${historial.length})`} />
            </Tabs>

            {tab === 0 && (
                pendientes.length === 0
                    ? <Typography sx={{ color: colors.textMuted, fontStyle: "italic" }}>No hay solicitudes pendientes</Typography>
                    : pendientes.map(renderPendiente)
            )}

            {tab === 1 && (
                historial.length === 0
                    ? <Typography sx={{ color: colors.textMuted, fontStyle: "italic" }}>Sin historial</Typography>
                    : historial.map(renderHistorialItem)
            )}

            {/* Dialog Aprobar */}
            <Dialog open={!!aprobando} onClose={() => setAprobando(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Aprobar registro</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Asignar rol, nivel y contraseña a <strong>{aprobando?.nombre} {aprobando?.apellido}</strong>
                    </Typography>
                    <TextField
                        select label="Rol" fullWidth size="small" sx={{ mb: 2 }}
                        value={aprobando?.rol || "consulta"}
                        onChange={(e) => setAprobando((prev) => prev ? { ...prev, rol: e.target.value } : null)}
                    >
                        {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                    </TextField>
                    <TextField
                        label="Nivel de seguridad" type="number" fullWidth size="small" sx={{ mb: 2 }}
                        value={aprobando?.nivel || 1}
                        onChange={(e) => setAprobando((prev) => prev ? { ...prev, nivel: parseInt(e.target.value) || 1 } : null)}
                        inputProps={{ min: 1, max: 10 }}
                    />
                    <Typography variant="body2" sx={{ color: colors.textMuted, mt: 1 }}>
                        La contraseña fue establecida por el solicitante durante el registro.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAprobando(null)}>Cancelar</Button>
                    <Button variant="contained" color="success" onClick={handleAprobar}>
                        Crear usuario
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Rechazar */}
            <Dialog open={!!rechazando} onClose={() => setRechazando(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Rechazar solicitud</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Motivo del rechazo" multiline rows={3} fullWidth size="small"
                        value={rechazoMotivo} onChange={(e) => setRechazoMotivo(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRechazando(null)}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={handleRechazar} disabled={!rechazoMotivo.trim()}>Rechazar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
