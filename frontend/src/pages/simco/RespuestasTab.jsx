import { useState, useEffect, useLayoutEffect } from "react";
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Snackbar, Alert,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { usePermissions } from "../../auth/usePermissions";
import { listarPendientes, responderSolicitud } from "../../services/simco/respuestasService";
import { useThemeMode } from "../../context/ThemeModeContext";

const ESTADOS_DOCUMENTO = [
    { value: "existe", label: "Existe" },
    { value: "no_existe", label: "No existe" },
    { value: "retirado", label: "Retirado" },
    { value: "no_localizado", label: "No localizado" },
];

export default function RespuestasTab({ highlightId: propHighlightId }) {
    const { colors } = useThemeMode();
    const perms = usePermissions();
    const [pendientes, setPendientes] = useState([]);
    const [highlightId, setHighlightId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openResponder, setOpenResponder] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ estado_documento: "", observacion: "" });
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });
    const [sending, setSending] = useState(false);

    const puedeResponder = perms.canViewReportes;

    useEffect(() => {
        let cancelled = false;
        const doCargar = async () => {
            try {
                setLoading(true);
                const data = await listarPendientes();
                const lista = data.solicitudes || data;
                lista.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
                if (!cancelled) setPendientes(lista);
            } catch {
                if (!cancelled) setPendientes([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        doCargar();
        return () => { cancelled = true; };
    }, []);

    useLayoutEffect(() => {
        if (propHighlightId) {
            (async () => {
                setHighlightId(propHighlightId);
            })();
            const timer = setTimeout(() => setHighlightId(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [propHighlightId]);

    const abrirResponder = (sol) => {
        setSelected(sol);
        setForm({ estado_documento: "", observacion: "" });
        setOpenResponder(true);
    };

    const handleResponder = async () => {
        if (!form.estado_documento) return;
        try {
            setSending(true);
            await responderSolicitud({
                solicitud_id: selected.id,
                estado_documento: form.estado_documento,
                observacion: form.observacion,
            });
            setSnack({ open: true, msg: "Respuesta registrada correctamente", severity: "success" });
            cargar();
        } catch {
            setSnack({ open: true, msg: "Error al registrar respuesta", severity: "error" });
        } finally {
            setOpenResponder(false);
            setSending(false);
        }
    };

    const cargar = async () => {
        try {
            setLoading(true);
            const data = await listarPendientes();
            const lista = data.solicitudes || data;
            lista.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
            setPendientes(lista);
        } catch {
            setPendientes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textMain, mb: 2 }}>
                Solicitudes Pendientes
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : pendientes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, border: `1px solid ${colors.border}` }}>
                    <Typography sx={{ color: colors.textMuted }}>No hay solicitudes pendientes</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${colors.border}` }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>CÓDIGO</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>TIPO DOC.</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>IDENTIFICADOR</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>DETALLE</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>SOLICITÓ</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>FECHA</TableCell>
                                {puedeResponder && <TableCell sx={{ width: 100 }} />}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendientes.map((sol) => (
                                    <TableRow key={sol.id} hover sx={{
                                        backgroundColor: highlightId === sol.id ? "#fef3c7" : undefined,
                                        transition: "background-color 0.3s",
                                        "&:hover": { backgroundColor: highlightId === sol.id ? "#fde68a" : "var(--bg-page)" },
                                    }}>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{sol.codigo}</TableCell>
                                    <TableCell sx={{ fontSize: 13 }}>{sol.tipo_documento}</TableCell>
                                    <TableCell sx={{ fontSize: 13 }}>{sol.identificador_documento}</TableCell>
                                    <TableCell sx={{ fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sol.detalle}</TableCell>
                                    <TableCell sx={{ fontSize: 13 }}>{sol.creado_por || "-"}</TableCell>
                                    <TableCell sx={{ fontSize: 13, color: colors.textMuted }}>
                                        {sol.fecha_creacion ? new Date(sol.fecha_creacion).toLocaleDateString("es-AR") : "-"}
                                    </TableCell>
                                    {puedeResponder && (
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<ReplyIcon />}
                                                onClick={() => abrirResponder(sol)}
                                                sx={{ fontSize: 12, textTransform: "none" }}
                                            >
                                                Responder
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openResponder} onClose={() => setOpenResponder(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Responder Solicitud
                    {selected && (
                        <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.5 }}>
                            {selected.codigo} — {selected.detalle}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            select
                            label="Estado del Documento"
                            value={form.estado_documento}
                            onChange={(e) => setForm({ ...form, estado_documento: e.target.value })}
                            fullWidth
                            required
                        >
                            {ESTADOS_DOCUMENTO.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Observación"
                            value={form.observacion}
                            onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResponder(false)} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleResponder} disabled={!form.estado_documento || sending}>
                        {sending ? "Guardando..." : "Confirmar Respuesta"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snack.severity} variant="filled" sx={{ width: "100%" }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
