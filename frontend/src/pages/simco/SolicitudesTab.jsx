import { useState, useEffect, Fragment } from "react";
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, IconButton, Chip, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Collapse, CircularProgress, Snackbar, Alert, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { usePermissions } from "../../auth/usePermissions";
import { listarSolicitudes, crearSolicitud, subirArchivoSolicitud, eliminarArchivoSolicitud, getArchivoUrlSolicitud } from "../../services/simco/solicitudesService";
import { useThemeMode } from "../../context/ThemeModeContext";

const TIPOS_DOCUMENTO = [
    { value: "expediente", label: "Expediente" },
    { value: "legajo", label: "Legajo" },
    { value: "caja", label: "Caja" },
    { value: "paquete", label: "Paquete" },
];

const chipEstado = (estado, colors) => {
    const map = {
        pendiente: { label: "Pendiente", color: colors.warning },
        respondida: { label: "Respondido", color: colors.success },
    };
    const cfg = map[estado] || { label: estado, color: colors.textMuted };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ fontWeight: 600, fontSize: 12, backgroundColor: cfg.color, color: "#fff" }}
        />
    );
};

const AttachmentDisplay = ({ archivoNombre, onDownload, onDelete, url }) => {
    const { colors } = useThemeMode();
    if (!archivoNombre) return null;
    const nombreOriginal = archivoNombre.includes("::") ? archivoNombre.split("::")[1] : archivoNombre;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, p: 1, bgcolor: "var(--bg-page)", borderRadius: 1 }}>
            <AttachFileIcon sx={{ color: colors.primary, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: colors.textMain, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {nombreOriginal}
            </Typography>
            <Tooltip title="Descargar">
                <IconButton size="small" onClick={onDownload} sx={{ color: colors.primary }}>
                    <DownloadIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Abrir">
                <IconButton size="small" component="a" href={url} target="_blank" rel="noopener" sx={{ color: colors.textMuted }}>
                    <OpenInNewIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
                <IconButton size="small" onClick={onDelete} sx={{ color: "#ef4444" }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default function SolicitudesTab({ highlightId: propHighlightId }) {
    const { colors } = useThemeMode();
    const perms = usePermissions();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const [archivo, setArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });
    const [form, setForm] = useState({
        tipo_documento: "",
        identificador_documento: "",
        detalle: "",
    });

    useEffect(() => {
        if (propHighlightId) {
            (async () => {
                setHighlightId(propHighlightId);
            })();
            const timer = setTimeout(() => setHighlightId(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [propHighlightId]);

    useEffect(() => {
        let cancelled = false;
        const doCargar = async () => {
            try {
                setLoading(true);
                const data = await listarSolicitudes();
                const lista = data.solicitudes || data;
                if (!cancelled) setSolicitudes(lista);
            } catch (err) {
                if (!cancelled) {
                    console.error("Error al cargar solicitudes:", err);
                    setSolicitudes([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        doCargar();
        return () => { cancelled = true; };
    }, []);

    const cargar = async () => {
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
    };

    const handleCreate = async () => {
        try {
            setSubiendo(true);
            const result = await crearSolicitud(form);
            const nuevaSol = result.solicitud;
            if (archivo) {
                await subirArchivoSolicitud(nuevaSol.id, archivo);
            }
            setSnack({ open: true, msg: "Solicitud creada correctamente", severity: "success" });
            cargar();
        } catch (err) {
            console.error("Error al crear solicitud:", err);
            setSnack({ open: true, msg: "Error al crear solicitud", severity: "error" });
        } finally {
            setSubiendo(false);
            setOpenCreate(false);
            setArchivo(null);
            setForm({ tipo_documento: "", identificador_documento: "", detalle: "" });
        }
    };

    const handleEliminarArchivo = async (solId) => {
        try {
            await eliminarArchivoSolicitud(solId);
            setSnack({ open: true, msg: "Archivo eliminado", severity: "success" });
            cargar();
        } catch {
            setSnack({ open: true, msg: "Error al eliminar archivo", severity: "error" });
        }
    };

    const handleDescargar = (sol) => {
        const url = getArchivoUrlSolicitud(sol.id);
        window.open(url, "_blank");
    };

    const puedeCrear = perms.canViewDatabase;

    const getRespuesta = (sol) => sol.respuesta || null;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textMain }}>
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
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, border: `1px solid ${colors.border}` }}>
                    <Typography sx={{ color: colors.textMuted }}>No hay solicitudes registradas</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${colors.border}` }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 40 }} />
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>CÓDIGO</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>TIPO DOC.</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>IDENTIFICADOR</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>DETALLE</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>ESTADO</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: colors.textMain, letterSpacing: 0.5 }}>FECHA</TableCell>
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
                                                "&:hover": { backgroundColor: highlightId === sol.id ? "#fde68a" : "var(--bg-page)" },
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
                                            <TableCell>{chipEstado(sol.estado, colors)}</TableCell>
                                            <TableCell sx={{ fontSize: 13, color: colors.textMuted }}>
                                                {sol.fecha_creacion ? new Date(sol.fecha_creacion).toLocaleDateString("es-AR") : "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={7} sx={{ py: 0, borderBottom: expanded ? undefined : "none" }}>
                                                <Collapse in={expanded} timeout={200}>
                                                    <Box sx={{ py: 2, px: 4 }}>
                                                        {resp ? (
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ color: colors.success, mb: 1, fontWeight: 600 }}>
                                                                    Respuesta
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: colors.textMuted, mb: 0.5 }}>
                                                                    <strong>Estado documento:</strong> {resp.estado_documento}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: colors.textMuted, mb: 0.5 }}>
                                                                    <strong>Observación:</strong> {resp.observacion || "Sin observaciones"}
                                                                </Typography>
                                                                {resp.archivo_nombre && (
                                                                    <AttachmentDisplay
                                                                        archivoNombre={resp.archivo_nombre}
                                                                        url={getArchivoUrlSolicitud(sol.id)}
                                                                        onDownload={() => handleDescargar(sol)}
                                                                        onDelete={() => {}}
                                                                    />
                                                                )}
                                                                <Typography variant="body2" sx={{ color: colors.textMuted, mt: 1 }}>
                                                                    <strong>Respondido por:</strong> {resp.usuario_responde || "—"} &middot;{" "}
                                                                    {resp.fecha_respuesta ? new Date(resp.fecha_respuesta).toLocaleDateString("es-AR") : "—"}
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: colors.textMuted, fontStyle: "italic" }}>
                                                                Sin responder
                                                            </Typography>
                                                        )}
                                                        {sol.archivo_nombre && !resp && (
                                                            <AttachmentDisplay
                                                                archivoNombre={sol.archivo_nombre}
                                                                url={getArchivoUrlSolicitud(sol.id)}
                                                                onDownload={() => handleDescargar(sol)}
                                                                onDelete={() => handleEliminarArchivo(sol.id)}
                                                            />
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

            <Dialog open={openCreate} onClose={() => { setOpenCreate(false); setArchivo(null); }} maxWidth="sm" fullWidth>
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
                        <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} sx={{ alignSelf: "flex-start" }}>
                            {archivo ? archivo.name : "Adjuntar archivo"}
                            <input type="file" hidden onChange={(e) => setArchivo(e.target.files[0] || null)} />
                        </Button>
                        {archivo && (
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>
                                {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenCreate(false); setArchivo(null); }} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={subiendo}>
                        {subiendo ? "Creando..." : "Crear Solicitud"}
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
