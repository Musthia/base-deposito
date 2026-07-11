import { useState, useEffect, useCallback, useRef } from "react";
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
    Tabs,
    Tab,
    IconButton,
    Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { listarBases } from "../services/databaseService";
import api from "../api/axiosClient";

const STORAGE_KEY = "datcorr_carga_tabs";
const CAMPOS_EXCLUIDOS = new Set([
    "id_datcorr_database",
    "id_Datcorr_database",
    "registro",
]);

function loadTabs() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveTabs(tabs) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch { /* ignore */ }
}

export default function CargaDatosPage() {
    const [bases, setBases] = useState([]);
    const [tabs, setTabs] = useState(() => loadTabs());
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const nuevaBaseRef = useRef("");

    useEffect(() => {
        listarBases().then(setBases).catch(console.error);
    }, []);

    const actualizarTabs = useCallback((fn) => {
        setTabs((prev) => {
            const next = fn(prev);
            saveTabs(next);
            return next;
        });
    }, []);

    const abrirTab = useCallback(async (base) => {
        const existente = tabs.find((t) => t.base === base);
        if (existente) {
            setTabIndex(tabs.indexOf(existente));
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/databases/${encodeURIComponent(base)}/columns`);
            const cols = (res.data?.columnas || []).filter(
                (c) => !CAMPOS_EXCLUIDOS.has(c.nombre.toLowerCase())
            );
            const initial = {};
            cols.forEach((c) => { initial[c.nombre] = ""; });

            const tab = {
                clave: `carga_${base}_${Date.now()}`,
                base,
                columnas: cols,
                formValues: initial,
            };

            actualizarTabs((prev) => {
                const idx = prev.findIndex((t) => t.base === base);
                if (idx >= 0) {
                    setTabIndex(idx);
                    return prev;
                }
                setTabIndex(prev.length);
                return [...prev, tab];
            });
        } catch (err) {
            console.error("Error cargando columnas:", err);
        } finally {
            setLoading(false);
        }
    }, [tabs, actualizarTabs]);

    const cerrarTab = useCallback((idx) => {
        actualizarTabs((prev) => prev.filter((_, i) => i !== idx));
        setTabIndex((prev) => (prev >= idx && prev > 0 ? prev - 1 : prev));
    }, [actualizarTabs]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        actualizarTabs((prev) =>
            prev.map((t, i) => {
                if (i !== tabIndex) return t;
                return {
                    ...t,
                    formValues: { ...t.formValues, [name]: value },
                };
            })
        );
    }, [tabIndex, actualizarTabs]);

    const tabActual = tabs[tabIndex] || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tabActual) return;
        setSaving(true);
        try {
            const data = {};
            tabActual.columnas.forEach((c) => {
                data[c.nombre] = tabActual.formValues[c.nombre] || "";
            });
            await api.post(`/databases/${encodeURIComponent(tabActual.base)}/records`, { data });
            setSnackbar({ open: true, message: "Registro creado correctamente", severity: "success" });
            const initial = {};
            tabActual.columnas.forEach((c) => { initial[c.nombre] = ""; });
            actualizarTabs((prev) =>
                prev.map((t, i) => (i !== tabIndex ? t : { ...t, formValues: initial }))
            );
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

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                <FormControl sx={{ minWidth: 250 }} size="small">
                    <InputLabel>Base de datos</InputLabel>
                    <Select
                        value=""
                        label="Base de datos"
                        onChange={(e) => abrirTab(e.target.value)}
                    >
                        {bases.map((b) => (
                            <MenuItem key={`${b.nombre}_${b.tipo}`} value={b.nombre}>
                                {b.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {tabs.length > 0 && (
                <Tabs
                    value={Math.min(tabIndex, tabs.length - 1)}
                    onChange={(_, v) => setTabIndex(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2 }}
                >
                    {tabs.map((tab, i) => (
                        <Tab
                            key={tab.clave}
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Chip
                                        label="CARGA"
                                        size="small"
                                        color="success"
                                        sx={{ height: 20, fontSize: 11 }}
                                    />
                                    <span>{tab.base}</span>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cerrarTab(i);
                                        }}
                                        sx={{ ml: 0.5 }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && tabActual && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Nuevo registro en: <strong>{tabActual.base}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Complete los campos para agregar un nuevo registro
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {tabActual.columnas.map((col) => (
                                <Grid item xs={12} sm={6} md={4} key={col.nombre}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={col.nombre}
                                        name={col.nombre}
                                        value={tabActual.formValues[col.nombre] || ""}
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

            {!loading && !tabActual && tabs.length === 0 && (
                <Typography color="text.secondary">
                    Seleccione una base de datos del menú de arriba para comenzar
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
