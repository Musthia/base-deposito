import { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Button, Divider, Snackbar, Alert, CircularProgress,
} from "@mui/material";
import api from "../api/axiosClient";
import { useThemeMode } from "../context/ThemeModeContext";
import { Google as GoogleIcon } from "@mui/icons-material";

export default function MiCuentaPage() {
    const { colors } = useThemeMode();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vinculando, setVinculando] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    useEffect(() => {
        api.get("/auth/me").then((res) => {
            setUser(res.data);
        }).catch(() => {
            setSnack({ open: true, msg: "Error al cargar datos del usuario", severity: "error" });
        }).finally(() => setLoading(false));
    }, []);

    const handleVincular = async () => {
        setVinculando(true);
        try {
            const res = await api.post("/auth/vincular-google", {
                google_id: "temp_google_id_" + Date.now(),
                google_email: user.email || "usuario@ejemplo.com",
            });
            setSnack({ open: true, msg: res.data.mensaje, severity: "success" });
            setUser((prev) => prev ? { ...prev, google_id: "temp", google_email: user.email } : null);
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.detail || "Error al vincular", severity: "error" });
        } finally {
            setVinculando(false);
        }
    };

    const handleDesvincular = async () => {
        try {
            const res = await api.post("/auth/desvincular-google");
            setSnack({ open: true, msg: res.data.mensaje, severity: "success" });
            setUser((prev) => prev ? { ...prev, google_id: null, google_email: null } : null);
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.detail || "Error al desvincular", severity: "error" });
        }
    };

    if (loading) {
        return <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>;
    }

    const tieneGoogle = !!user?.google_id;

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Mi cuenta</Typography>

            <Paper sx={{ p: 3, mb: 3, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Datos personales</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 1.5, fontSize: 14 }}>
                    <Typography sx={{ color: colors.textMuted }}>Usuario:</Typography>
                    <Typography>{user?.usuario}</Typography>
                    <Typography sx={{ color: colors.textMuted }}>Nombre:</Typography>
                    <Typography>{user?.nombre} {user?.apellido}</Typography>
                    <Typography sx={{ color: colors.textMuted }}>Email:</Typography>
                    <Typography>{user?.email || "—"}</Typography>
                    <Typography sx={{ color: colors.textMuted }}>Rol:</Typography>
                    <Typography>{user?.rol} (nivel {user?.nivel_seguridad})</Typography>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Cuenta de Google</Typography>
                {tieneGoogle ? (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: colors.textMuted }}>
                            Vinculada a: <strong>{user.google_email}</strong>
                        </Typography>
                        <Button variant="outlined" color="error" onClick={handleDesvincular}>
                            Desvincular cuenta de Google
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2, color: colors.textMuted }}>
                            No tiene una cuenta de Google vinculada.
                        </Typography>
                        <Button variant="contained" onClick={handleVincular} disabled={vinculando} startIcon={vinculando ? <CircularProgress size={18} /> : <GoogleIcon />}>
                            {vinculando ? "Vinculando..." : "Vincular cuenta de Google"}
                        </Button>
                    </Box>
                )}
            </Paper>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}