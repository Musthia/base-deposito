import { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Button, Select, MenuItem, FormControl, InputLabel,
    TextField, Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getConsultas, ejecutarConsulta, exportarConsulta, getKpis } from "../services/reportesService";

export default function ReportesPage() {

    const [consultas, setConsultas] = useState([]);
    const [consultaId, setConsultaId] = useState("");
    const [consultaMeta, setConsultaMeta] = useState(null);
    const [filtros, setFiltros] = useState({});
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

    useEffect(() => {
        getConsultas()
            .then(setConsultas)
            .catch(() => setSnack({ open: true, msg: "Error al cargar consultas", severity: "error" }));
        getKpis()
            .then(setKpis)
            .catch(() => setSnack({ open: true, msg: "Error al cargar indicadores", severity: "error" }));
    }, []);

    const moduloActual = consultas.find((c) => c.id === consultaId);

    const handleSelectChange = (id) => {
        setConsultaId(id);
        setConsultaMeta(consultas.find((c) => c.id === id) || null);
        setRows([]);
        setColumns([]);
        setGenerated(false);
        setFiltros({});
    };

    const handleFiltroChange = (key, value) => {
        setFiltros((prev) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = useCallback(async () => {
        if (!consultaId) return;
        setLoading(true);
        setReportError(null);
        try {
            const result = await ejecutarConsulta(consultaId, filtros);
            setConsultaMeta({ nombre: result.nombre, descripcion: result.descripcion });
            const cols = (result.columnas || []).map((c) => ({
                field: c,
                headerName: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " "),
                flex: 1,
                minWidth: 120,
            }));
            setColumns(cols);
            const dataRows = (result.datos || []).map((r, i) => ({ id: i, ...r }));
            setRows(dataRows);
            setGenerated(true);
        } catch {
            setReportError("Error al generar reporte");
            setSnack({ open: true, msg: "Error al generar reporte", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [consultaId, filtros]);

    const handleExport = useCallback(async (formato) => {
        if (!consultaId || rows.length === 0) return;
        try {
            const res = await exportarConsulta(consultaId, formato, filtros);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte_${consultaId}.${formato}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setSnack({ open: true, msg: `Exportado como ${formato.toUpperCase()}`, severity: "success" });
        } catch {
            setSnack({ open: true, msg: "Error al exportar", severity: "error" });
        }
    }, [consultaId, filtros, rows]);

    const renderFiltro = (f) => {
        if (f.tipo === "date") {
            return (
                <TextField
                    key={f.key}
                    label={f.label}
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={filtros[f.key] || ""}
                    onChange={(e) => handleFiltroChange(f.key, e.target.value)}
                    sx={{ minWidth: 180 }}
                />
            );
        }
        if (f.tipo === "select") {
            return (
                <FormControl key={f.key} size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>{f.label}</InputLabel>
                    <Select
                        value={filtros[f.key] || f.default || ""}
                        label={f.label}
                        onChange={(e) => handleFiltroChange(f.key, e.target.value)}
                    >
                        {(f.opciones || []).map((o) => (
                            <MenuItem key={o.valor} value={o.valor}>{o.texto}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }
        if (f.tipo === "text") {
            return (
                <TextField
                    key={f.key}
                    label={f.label}
                    size="small"
                    value={filtros[f.key] || ""}
                    onChange={(e) => handleFiltroChange(f.key, e.target.value)}
                    sx={{ minWidth: 180 }}
                />
            );
        }
        return null;
    };

    return (
        <Box sx={{ p: 3, maxWidth: "100%" }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "var(--text-main)" }}>Reportes</Typography>

            {/* KPIs */}
            {kpis && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { label: "Total Registros", value: kpis.total_registros?.toLocaleString(), color: "var(--text-main)" },
                        { label: "Usuarios Activos", value: kpis.usuarios_activos, color: "var(--text-main)" },
                        { label: "Total Usuarios", value: kpis.total_usuarios, color: "var(--text-main)" },
                        { label: "Alertas Pendientes", value: kpis.alertas_pendientes, color: kpis.alertas_pendientes > 0 ? "#dc2626" : "var(--text-main)" },
                    ].map((kpi) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={kpi.label}>
                            <Card sx={{ borderRadius: "8px", boxShadow: "none", border: "none" }}>
                                <CardContent sx={{ textAlign: "center", py: 2 }}>
                                    <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 700 }}>
                                        {kpi.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {kpi.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Selector de reporte */}
            <FormControl size="small" sx={{ minWidth: 280, mb: 2 }}>
                <InputLabel>Seleccionar Reporte</InputLabel>
                <Select
                    value={consultaId}
                    label="Seleccionar Reporte"
                    onChange={(e) => handleSelectChange(e.target.value)}
                >
                    {consultas.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.nombre} — {c.descripcion}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {!consultaId && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                    Seleccione un reporte para comenzar
                </Typography>
            )}

            {moduloActual && moduloActual.filtros && moduloActual.filtros.length > 0 && (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                    {moduloActual.filtros.map(renderFiltro)}
                </Box>
            )}

            {/* Botones */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={!consultaId || loading}
                    sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" }, textTransform: "none" }}
                >
                    {loading ? <CircularProgress size={20} sx={{ mr: 1, color: "var(--text-main)" }} /> : null}
                    Generar
                </Button>
                {generated && rows.length > 0 && (
                    <>
                        <Button variant="outlined" onClick={() => handleExport("csv")} sx={{ borderColor: "var(--border)", color: "var(--text-main)", textTransform: "none", "&:hover": { borderColor: "#0284c7", color: "#0284c7" } }}>CSV</Button>
                        <Button variant="outlined" onClick={() => handleExport("xlsx")} sx={{ borderColor: "var(--border)", color: "var(--text-main)", textTransform: "none", "&:hover": { borderColor: "#0284c7", color: "#0284c7" } }}>XLSX</Button>
                        <Button variant="outlined" onClick={() => handleExport("pdf")} sx={{ borderColor: "var(--border)", color: "var(--text-main)", textTransform: "none", "&:hover": { borderColor: "#0284c7", color: "#0284c7" } }}>PDF</Button>
                    </>
                )}
            </Box>

            {/* Preview */}
            {generated && !reportError && (
                <Box sx={{ background: "var(--bg-card)", borderRadius: "8px", height: "calc(100vh - 350px)", width: "100%", minHeight: 400 }}>
                    <Box sx={{ px: 2, pt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {consultaMeta?.nombre} — {rows.length} registros
                        </Typography>
                    </Box>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        disableRowSelectionOnClick
                        disableExtendRowFullWidth
                        pageSizeOptions={[25, 50, 100]}
                        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
                        slots={{
                            noRowsOverlay: () => (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                    <Typography variant="body2" color="text.secondary">Sin resultados</Typography>
                                </Box>
                            ),
                        }}
                        slotProps={{
                            basePagination: { showFirstButton: true, showLastButton: true },
                        }}
                        sx={{
                            "& .MuiDataGrid-virtualScroller": { overflow: "auto" },
                            "& .MuiDataGrid-cell:focus": { outline: "none" },
                        }}
                    />
                </Box>
            )}

            {reportError && (
                <Box sx={{ background: "var(--bg-card)", borderRadius: "8px", p: 4, textAlign: "center" }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>{reportError}</Typography>
                    <Button
                        variant="contained"
                        onClick={handleGenerate}
                        sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" }, textTransform: "none" }}
                    >Reintentar</Button>
                </Box>
            )}

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
