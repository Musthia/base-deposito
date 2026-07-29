import { useState, useEffect, useRef, useCallback } from "react";
import {
    Box, Typography, Paper, ToggleButton, ToggleButtonGroup, Divider,
    CircularProgress, Alert, Button,
} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { getEstadisticasDatcorr, getEstadisticasSimco } from "../services/estadisticasService";

const COLORS = ["#0f172a", "#0284c7", "#16a34a", "#d97706", "#dc2626", "#8b5cf6"];

const PERIODOS = [
    { value: "semanal", label: "Semanal" },
    { value: "mensual", label: "Mensual" },
    { value: "anual", label: "Anual" },
];

export default function EstadisticasPage() {
    const [periodo, setPeriodo] = useState("mensual");
    const [datcorr, setDatcorr] = useState(null);
    const [simco, setSimco] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            getEstadisticasDatcorr(periodo),
            getEstadisticasSimco(periodo),
        ])
            .then(([d, s]) => {
                setDatcorr(d);
                setSimco(s);
            })
            .catch((err) => {
                setError(err.response?.data?.detail || "Error al cargar estadísticas");
            })
            .finally(() => setLoading(false));
    }, [periodo]);

    const exportarPDF = useCallback(async () => {
        if (!contentRef.current) return;
        setExportingPdf(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pw = pdf.internal.pageSize.getWidth();
            const ph = (canvas.height * pw) / canvas.width;
            let heightLeft = ph;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, pw, ph);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - ph;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pw, ph);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`estadisticas_${periodo}.pdf`);
        } catch (err) {
            console.error("Error al exportar PDF:", err);
        } finally {
            setExportingPdf(false);
        }
    }, [periodo]);

    const exportarExcel = useCallback(() => {
        if (!datcorr || !simco) return;
        setExportingExcel(true);
        try {
            const wb = XLSX.utils.book_new();

            const schemasRows = datcorr.schemas.map((s) => ({
                Base: s.nombre,
                Total: s.total,
                DatCorr: s.datcorr,
                Verificado: s.verificado,
            }));
            wb.SheetNames.push("DatCorr - Bases");
            wb.Sheets["DatCorr - Bases"] = XLSX.utils.json_to_sheet(schemasRows);

            const movRows = datcorr.movimientos.map((m) => ({
                Periodo: m.periodo,
                Total: m.total,
                Creaciones: m.creaciones,
                Actualizaciones: m.actualizaciones,
                Eliminaciones: m.eliminaciones,
                Consultas: m.consultas,
                Accesos: m.accesos,
            }));
            wb.SheetNames.push("DatCorr - Movimientos");
            wb.Sheets["DatCorr - Movimientos"] = XLSX.utils.json_to_sheet(movRows);

            const usrRows = datcorr.usuarios.map((u) => ({
                Periodo: u.periodo,
                Total: u.total,
            }));
            wb.SheetNames.push("DatCorr - Usuarios");
            wb.Sheets["DatCorr - Usuarios"] = XLSX.utils.json_to_sheet(usrRows);

            const solRows = simco.solicitudes.map((s) => ({
                Periodo: s.periodo,
                Total: s.total,
                Pendientes: s.pendientes,
                Respondidas: s.respondidas,
            }));
            wb.SheetNames.push("SiMCo - Solicitudes");
            wb.Sheets["SiMCo - Solicitudes"] = XLSX.utils.json_to_sheet(solRows);

            const respRows = simco.respuestas.map((r) => ({
                Periodo: r.periodo,
                Total: r.total,
            }));
            wb.SheetNames.push("SiMCo - Respuestas");
            wb.Sheets["SiMCo - Respuestas"] = XLSX.utils.json_to_sheet(respRows);

            const tipoRows = simco.tipos_documento.map((t) => ({
                Tipo: t.nombre,
                Total: t.total,
            }));
            wb.SheetNames.push("SiMCo - Tipos Documento");
            wb.Sheets["SiMCo - Tipos Documento"] = XLSX.utils.json_to_sheet(tipoRows);

            XLSX.writeFile(wb, `estadisticas_${periodo}.xlsx`);
        } catch (err) {
            console.error("Error al exportar Excel:", err);
        } finally {
            setExportingExcel(false);
        }
    }, [datcorr, simco, periodo]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-main)" }}>
                    Estadísticas
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={loading || exportingPdf}
                        onClick={exportarPDF}
                    >
                        {exportingPdf ? "Exportando..." : "PDF"}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={loading || exportingExcel}
                        onClick={exportarExcel}
                    >
                        {exportingExcel ? "Exportando..." : "Excel"}
                    </Button>
                </Box>
            </Box>

            <ToggleButtonGroup
                value={periodo}
                exclusive
                onChange={(_, v) => v && setPeriodo(v)}
                size="small"
                sx={{ mb: 3 }}
            >
                {PERIODOS.map((p) => (
                    <ToggleButton key={p.value} value={p.value} sx={{ textTransform: "none", color: "#ccc" }}>
                        {p.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {!loading && !error && datcorr && simco && (
                <Box ref={contentRef}>
                    {/* ─── DATCORR ─── */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text-main)", mb: 2 }}>
                        DatCorr
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                        {[
                            { label: "Bases", value: datcorr.schemas.length, color: "#94a3b8" },
                            { label: "Registros totales", value: datcorr.schemas.reduce((a, b) => a + b.total, 0), color: "#94a3b8" },
                            { label: "Estado DATCORR", value: datcorr.schemas.reduce((a, b) => a + b.datcorr, 0), color: "#0284c7" },
                            { label: "Estado VERIFICADO", value: datcorr.schemas.reduce((a, b) => a + b.verificado, 0), color: "#16a34a" },
                        ].map((kpi) => (
                            <Paper elevation={0} key={kpi.label} sx={{ p: 2, minWidth: 160, border: "1px solid #444", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 700 }}>{kpi.value.toLocaleString()}</Typography>
                                <Typography variant="body2" sx={{ color: "#aaa" }}>{kpi.label}</Typography>
                            </Paper>
                        ))}
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #444", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Composición por base de datos
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datcorr.schemas.map((s) => ({
                                nombre: s.nombre,
                                DatCorr: s.datcorr,
                                Verificado: s.verificado,
                                Otros: s.total - s.datcorr - s.verificado,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                                <Legend wrapperStyle={{ color: "#ccc" }} />
                                <Bar dataKey="DatCorr" stackId="a" fill="#0f172a" />
                                <Bar dataKey="Verificado" stackId="a" fill="#16a34a" />
                                <Bar dataKey="Otros" stackId="a" fill="var(--border)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #444", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Movimientos por período
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datcorr.movimientos}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                                <Legend wrapperStyle={{ color: "#ccc" }} />
                                <Bar dataKey="creaciones" name="Creaciones" fill="#16a34a" />
                                <Bar dataKey="actualizaciones" name="Actualizaciones" fill="#0284c7" />
                                <Bar dataKey="eliminaciones" name="Eliminaciones" fill="#dc2626" />
                                <Bar dataKey="consultas" name="Consultas" fill="#d97706" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, mb: 4, border: "1px solid #d1d5db", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Accesos por período
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={datcorr.movimientos}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                                <Legend wrapperStyle={{ color: "#ccc" }} />
                                <Line type="monotone" dataKey="accesos" name="Accesos" stroke="#0f172a" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Divider sx={{ my: 3 }} />

                    {/* ─── SIMCO ─── */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--text-main)", mb: 2 }}>
                        SiMCo
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                        {[
                            { label: "Solicitudes totales", value: simco.solicitudes.reduce((a, b) => a + b.total, 0), color: "#94a3b8" },
                            { label: "Pendientes", value: simco.solicitudes.reduce((a, b) => a + b.pendientes, 0), color: "#d97706" },
                            { label: "Respondidas", value: simco.solicitudes.reduce((a, b) => a + b.respondidas, 0), color: "#16a34a" },
                            { label: "Respuestas", value: simco.respuestas.reduce((a, b) => a + b.total, 0), color: "#0284c7" },
                        ].map((kpi) => (
                            <Paper elevation={0} key={kpi.label} sx={{ p: 2, minWidth: 160, border: "1px solid #444", borderRadius: 2 }}>
                                <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 700 }}>{kpi.value.toLocaleString()}</Typography>
                                <Typography variant="body2" sx={{ color: "#aaa" }}>{kpi.label}</Typography>
                            </Paper>
                        ))}
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #444", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Solicitudes por período
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={simco.solicitudes}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                                <Legend wrapperStyle={{ color: "#ccc" }} />
                                <Bar dataKey="pendientes" name="Pendientes" fill="#d97706" />
                                <Bar dataKey="respondidas" name="Respondidas" fill="#16a34a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #444", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Respuestas por período
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={simco.respuestas}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#ccc" }} />
                                <YAxis tick={{ fill: "#ccc" }} />
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                                <Legend wrapperStyle={{ color: "#ccc" }} />
                                <Line type="monotone" dataKey="total" name="Respuestas" stroke="#0284c7" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #444", borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-main)" }}>
                            Solicitudes por tipo de documento
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={simco.tipos_documento}
                                    dataKey="total"
                                    nameKey="nombre"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ nombre, percent }) => `${nombre} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {simco.tipos_documento.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#222", border: "1px solid #555", color: "#eee" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            )}
        </Box>
    );
}
