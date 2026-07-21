import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, IconButton, Chip, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Collapse, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { usePermissions } from "../../auth/usePermissions";
import { listarSolicitudes, crearSolicitud } from "../../services/simco/solicitudesService";

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

const TIPOS_DOCUMENTO = [
    { value: "expediente", label: "Expediente" },
    { value: "legajo", label: "Legajo" },
    { value: "caja", label: "Caja" },
    { value: "paquete", label: "Paquete" },
];

const chipEstado = (estado) => {
    const map = {
        pendiente: { label: "Pendiente", color: PALETTE.warning },
        respondida: { label: "Respondido", color: PALETTE.success },
    };
    const cfg = map[estado] || { label: estado, color: PALETTE.textMuted };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ fontWeight: 600, fontSize: 12, backgroundColor: cfg.color, color: "#fff" }}
        />
    );
};

export default function SolicitudesTab({ highlightId: propHighlightId }) {
    const perms = usePermissions();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const [form, setForm] = useState({
        tipo_documento: "",
        identificador_documento: "",
        detalle: "",
    });

    useEffect(() => {
        if (propHighlightId) {
            setHighlightId(propHighlightId);
            const timer = setTimeout(() => setHighlightId(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [propHighlightId]);

    const cargar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listarSolicitudes();
            setSolicitudes(data.solicitudes || data);
        } catch (err) {
            console.error("Error al cargar solicitudes:", err);
            setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const handleCreate = async () => {
        try {
            await crearSolicitud(form);
            cargar();
        } catch (err) {
            console.error("Error al crear solicitud:", err);
        } finally {
            setOpenCreate(false);
            setForm({ tipo_documento: "", identificador_documento: "", detalle: "" });
        }
    };

    const puedeCrear = perms.canViewDatabase;

    const getRespuesta = (sol) => sol.respuesta || null;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: PALETTE.textMain }}>
                    Solicitudes
                </Typography>
                {puedeCrear && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
                        Nueva Solicitud
                    </Button>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : solicitudes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, border: `1px solid ${PALETTE.border}` }}>
                    <Typography sx={{ color: PALETTE.textMuted }}>No hay solicitudes registradas</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${PALETTE.border}` }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 40 }} />
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>CÓDIGO</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>TIPO DOC.</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>IDENTIFICADOR</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>DETALLE</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>ESTADO</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: PALETTE.textMain, letterSpacing: 0.5 }}>FECHA</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {solicitudes.map((sol) => {
                                const expanded = expandedId === sol.id;
                                const resp = getRespuesta(sol);
                                return (
                                    <Fragment key={sol.id}>
                                        <TableRow
                                            hover
                                            sx={{
                                                cursor: "pointer",
                                                backgroundColor: highlightId === sol.id ? "#fef3c7" : undefined,
                                                transition: "background-color 0.3s",
                                                "&:hover": { backgroundColor: highlightId === sol.id ? "#fde68a" : "#1e3a8a" },
                                            }}
                                            onClick={() => setExpandedId(expanded ? null : sol.id)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{sol.codigo}</TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{sol.tipo_documento}</TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{sol.identificador_documento}</TableCell>
                                            <TableCell sx={{ fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sol.detalle}</TableCell>
                                            <TableCell>{chipEstado(sol.estado)}</TableCell>
                                            <TableCell sx={{ fontSize: 13, color: PALETTE.textMuted }}>
                                                {sol.fecha_creacion ? new Date(sol.fecha_creacion).toLocaleDateString("es-AR") : "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={7} sx={{ py: 0, borderBottom: expanded ? undefined : "none" }}>
                                                <Collapse in={expanded} timeout={200}>
                                                    <Box sx={{ py: 2, px: 4 }}>
                                                        {resp ? (
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ color: PALETTE.success, mb: 1, fontWeight: 600 }}>
                                                                    Respuesta
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: PALETTE.textMuted, mb: 0.5 }}>
                                                                    <strong>Estado documento:</strong> {resp.estado_documento}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: PALETTE.textMuted, mb: 0.5 }}>
                                                                    <strong>Observación:</strong> {resp.observacion || "Sin observaciones"}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: PALETTE.textMuted }}>
                                                                    <strong>Respondido por:</strong> {resp.usuario_responde || "—"} &middot;{" "}
                                                                    {resp.fecha_respuesta ? new Date(resp.fecha_respuesta).toLocaleDateString("es-AR") : "—"}
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: PALETTE.textMuted, fontStyle: "italic" }}>
                                                                Sin responder
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                        </Fragment>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Nueva Solicitud</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            select
                            label="Tipo de Documento"
                            value={form.tipo_documento}
                            onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                            fullWidth
                        >
                            {TIPOS_DOCUMENTO.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Identificador del Documento"
                            value={form.identificador_documento}
                            onChange={(e) => setForm({ ...form, identificador_documento: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Detalle / Descripción"
                            value={form.detalle}
                            onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleCreate}>Crear Solicitud</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
