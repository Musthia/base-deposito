import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Paper,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
} from "@mui/material";
import { listarBases } from "../services/databaseService";
import api from "../api/axiosClient";

const CAMPOS_EXCLUIDOS = new Set([
    "id_datcorr_database",
    "id_Datcorr_database",
    "registro",
]);

export default function CargaDatosPage() {
    const [bases, setBases] = useState([]);
    const [baseActual, setBaseActual] = useState("");
    const [columnas, setColumnas] = useState([]);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        listarBases().then(setBases).catch(console.error);
    }, []);

    useEffect(() => {
        if (!baseActual) {
            setColumnas([]);
            setForm({});
            return;
        }
        setLoading(true);
        api
            .get(`/databases/${encodeURIComponent(baseActual)}/columns`)
            .then((res) => {
                const cols = (res.data?.columnas || []).filter(
                    (c) => !CAMPOS_EXCLUIDOS.has(c.nombre.toLowerCase())
                );
                setColumnas(cols);
                const initial = {};
                cols.forEach((c) => {
                    initial[c.nombre] = "";
                });
                setForm(initial);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [baseActual]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!baseActual) return;
        setSaving(true);
        try {
            const data = {};
            columnas.forEach((c) => {
                data[c.nombre] = form[c.nombre];
            });
            await api.post(`/databases/${encodeURIComponent(baseActual)}/records`, { data });
            setSnackbar({ open: true, message: "Registro creado correctamente", severity: "success" });
            const initial = {};
            columnas.forEach((c) => {
                initial[c.nombre] = "";
            });
            setForm(initial);
        } catch (err) {
            console.error("Error creando registro:", err);
            setSnackbar({ open: true, message: "Error al crear registro", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Carga de Datos
            </Typography>

            <FormControl sx={{ minWidth: 300, mb: 3 }} size="small">
                <InputLabel>Base de datos</InputLabel>
                <Select
                    value={baseActual}
                    label="Base de datos"
                    onChange={(e) => setBaseActual(e.target.value)}
                >
                    {bases.map((b) => (
                        <MenuItem key={`${b.nombre}_${b.tipo}`} value={b.nombre}>
                            {b.nombre} ({b.tipo})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && baseActual && columnas.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Nuevo registro en: <strong>{baseActual}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Complete los campos para agregar un nuevo registro
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {columnas.map((col) => (
                                <Grid item xs={12} sm={6} md={4} key={col.nombre}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={col.nombre}
                                        name={col.nombre}
                                        value={form[col.nombre] || ""}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} /> : null}
                        >
                            {saving ? "Guardando..." : "Guardar registro"}
                        </Button>
                    </Box>
                </Paper>
            )}

            {!loading && !baseActual && (
                <Typography color="text.secondary">
                    Seleccione una base de datos para comenzar
                </Typography>
            )}

            {!loading && baseActual && columnas.length === 0 && (
                <Typography color="text.secondary">
                    No se encontraron columnas para esta base
                </Typography>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
