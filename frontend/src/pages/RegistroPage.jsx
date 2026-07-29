import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from "@mui/material";
import api from "../api/axiosClient";

export default function RegistroPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        organizacion: "",
        username: "",
        password: "",
        confirmPassword: "",
        motivo: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        setLoading(true);
        try {
            const payload = { ...form };
            delete payload.confirmPassword;
            await api.post("/registro/solicitar", payload);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Error al enviar solicitud");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-gradient, var(--bg-page))" }}>
                <Paper elevation={0} sx={{ p: 6, maxWidth: 500, textAlign: "center", borderRadius: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "var(--text-main)" }}>Solicitud enviada</Typography>
                    <Typography sx={{ mb: 3, color: "var(--text-muted)" }}>
                        Su solicitud de registro fue enviada correctamente. Recibirá un email cuando un administrador la apruebe.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/")} sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>Volver al inicio</Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-gradient, var(--bg-page))", p: 2 }}>
            <Paper elevation={0} sx={{ p: 4, maxWidth: 520, width: "100%", borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--text-main)", mb: 1 }}>Solicitar registro</Typography>
                <Typography variant="body2" sx={{ color: "var(--text-muted)", mb: 3 }}>
                    Complete todos los campos obligatorios. Un administrador revisará su solicitud.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Nombre *" fullWidth required value={form.nombre} onChange={handleChange("nombre")} disabled={loading} />
                        <TextField label="Apellido *" fullWidth required value={form.apellido} onChange={handleChange("apellido")} disabled={loading} />
                    </Box>
                    <TextField label="Email *" type="email" fullWidth required value={form.email} onChange={handleChange("email")} disabled={loading} />
                    <TextField label="Nombre de usuario *" fullWidth required value={form.username} onChange={handleChange("username")} disabled={loading} />
                    <TextField label="Contraseña *" type="password" fullWidth required value={form.password} onChange={handleChange("password")} disabled={loading} />
                    <TextField label="Repetir contraseña *" type="password" fullWidth required value={form.confirmPassword} onChange={handleChange("confirmPassword")} disabled={loading} />
                    <TextField label="Teléfono" fullWidth value={form.telefono} onChange={handleChange("telefono")} disabled={loading} />
                    <TextField label="Organización" fullWidth value={form.organizacion} onChange={handleChange("organizacion")} disabled={loading} />
                    <TextField label="Motivo de la solicitud" multiline rows={3} fullWidth value={form.motivo} onChange={handleChange("motivo")} disabled={loading} />

                    <Button type="submit" variant="contained" size="large" disabled={loading || !form.nombre || !form.apellido || !form.email || !form.username || !form.password || !form.confirmPassword} sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
                        {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        {loading ? "Enviando..." : "Enviar solicitud"}
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Link to="/" style={{ color: "#0284c7", fontSize: 14 }}>Volver al inicio de sesión</Link>
                </Box>
            </Paper>
        </Box>
    );
}
