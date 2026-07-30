import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
    Box, Typography, Paper, Tabs, Tab, Snackbar, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, IconButton, CircularProgress, FormControlLabel, Checkbox,
    Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useAuthStore } from "../../auth/authStore";
import { useLocation } from "react-router-dom";
import SolicitudesTab from "./SolicitudesTab";
import RespuestasTab from "./RespuestasTab";
import useSimcoWS from "../../hooks/useSimcoWS";
import api from "../../api/axiosClient";
import { buscarSimco } from "../../services/simco/buscarService";
import { useThemeMode } from "../../context/ThemeModeContext";
import { getArchivoUrlSolicitud } from "../../services/simco/solicitudesService";
import { getArchivoUrlRespuesta } from "../../services/simco/respuestasService";

const TABS = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Solicitudes", key: "solicitudes" },
    { label: "Respuestas", key: "respuestas" },
];

const AttachmentLink = ({ archivoNombre, url }) => {
    const { colors } = useThemeMode();
    if (!archivoNombre) return null;
    const nombreOriginal = archivoNombre.includes("::") ? archivoNombre.split("::")[1] : archivoNombre;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <AttachFileIcon sx={{ color: colors.primary, fontSize: 14 }} />
            <Tooltip title={nombreOriginal}>
                <Typography variant="caption" sx={{ color: colors.primary, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                    {nombreOriginal}
                </Typography>
            </Tooltip>
            <IconButton size="small" component="a" href={url} target="_blank" rel="noopener" sx={{ color: colors.textMuted, p: 0.3 }}>
                <OpenInNewIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton size="small" href={url} download sx={{ color: colors.textMuted, p: 0.3 }}>
                <DownloadIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

export default function SimcoPage() {
    const { colors } = useThemeMode();
    const user = useAuthStore((s) => s.user);

    const chipEstado = (estado) => {
        const map = {
            pendiente: { label: "Pendiente", color: colors.warning },
            respondida: { label: "Respondido", color: colors.success },
        };
        const cfg = map[estado] || { label: estado, color: colors.textMuted };
        return <Chip label={cfg.label} size="small" sx={{ fontWeight: 600, fontSize: 11, backgroundColor: cfg.color, color: "#fff" }} />;
    };

    const ResultTables = ({ results }) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textMain, mb: 2 }}>
                    Solicitudes ({results.solicitudes.length})
                </Typography>
                {results.solicitudes.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${colors.border}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>TIPO DOC.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>IDENTIFICADOR</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>DETALLE</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CREADOR</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>FECHA</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ARCHIVO</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.solicitudes.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{s.codigo}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{s.tipo_documento}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{s.identificador_documento}</TableCell>
                                        <TableCell sx={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.detalle}</TableCell>
                                        <TableCell>{chipEstado(s.estado)}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{s.creado_por || "—"}</TableCell>
                                        <TableCell sx={{ fontSize: 12, color: colors.textMuted }}>
                                            {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString("es-AR") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <AttachmentLink archivoNombre={s.archivo_nombre} url={getArchivoUrlSolicitud(s.id)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body2" sx={{ color: colors.textMuted, fontStyle: "italic" }}>Sin resultados en solicitudes</Typography>
                )}
            </Box>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textMain, mb: 2 }}>
                    Respuestas ({results.respuestas.length})
                </Typography>
                {results.respuestas.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${colors.border}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>TIPO DOC.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>IDENTIFICADOR</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO DOC.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>OBSERVACIÓN</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>RESPONDIÓ</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>FECHA</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ARCHIVO</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.respuestas.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{r.codigo}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{r.tipo_documento}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{r.identificador_documento}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{r.estado_documento}</TableCell>
                                        <TableCell sx={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.observacion || "—"}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{r.usuario_responde || "—"}</TableCell>
                                        <TableCell sx={{ fontSize: 12, color: colors.textMuted }}>
                                            {r.fecha_respuesta ? new Date(r.fecha_respuesta).toLocaleDateString("es-AR") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <AttachmentLink archivoNombre={r.archivo_nombre} url={getArchivoUrlRespuesta(r.id)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body2" sx={{ color: colors.textMuted, fontStyle: "italic" }}>Sin resultados en respuestas</Typography>
                )}
            </Box>
        </Box>
    );

    const [dashboardData, setDashboardData] = useState(null);
    const nivel = user?.nivel ?? 0;
    const esSuper = user?.superusuario ?? false;
    const esAdmin = esSuper || nivel >= 10;

    const [notif, setNotif] = useState({ open: false, msg: "", severity: "info" });
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const [keepNewTab, setKeepNewTab] = useState(false);
    const [searchTabs, setSearchTabs] = useState([]);
    const nextTabId = useRef(1);
    const keepNewTabRef = useRef(keepNewTab);
    useEffect(() => { keepNewTabRef.current = keepNewTab; }, [keepNewTab]);

    useEffect(() => {
        let cleanup = undefined;
        if (!searchInput.trim()) {
            (async () => {
                setSearchResults(null);
            })();
        } else {
            const timer = setTimeout(async () => {
                setSearching(true);
                try {
                    const data = await buscarSimco(searchInput.trim());
                    setSearchResults(data);
                } catch {
                    setSearchResults({ solicitudes: [], respuestas: [] });
                } finally {
                    setSearching(false);
                }
            }, 400);
            cleanup = () => clearTimeout(timer);
        }
        return cleanup;
    }, [searchInput]);

    const commitSearch = useCallback(() => {
        const q = searchInput.trim();
        if (!q || !searchResults) return;
        setSearchTabs((prev) => {
            if (keepNewTabRef.current) {
                const id = nextTabId.current;
                nextTabId.current += 1;
                return [...prev, { id, query: q, results: searchResults }];
            }
            if (prev.length === 0) {
                return [{ id: 0, query: q, results: searchResults }];
            }
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], query: q, results: searchResults };
            return updated;
        });
    }, [searchInput, searchResults]);

    const location = useLocation();
    const [tab, setTab] = useState(0);
    const [highlightId, setHighlightId] = useState(null);

    const tabsVisibles = useMemo(() => {
        const base = TABS.filter((t) => {
            if (t.key === "dashboard") return true;
            if (t.key === "solicitudes") return nivel <= 3 || esAdmin;
            if (t.key === "respuestas") return nivel >= 5;
            return true;
        });
        return [
            ...base,
            ...searchTabs.map((st) => ({
                label: st.query,
                key: `search-${st.id}`,
                searchId: st.id,
            })),
        ];
    }, [nivel, esAdmin, searchTabs]);

    useLayoutEffect(() => {
        if (searchTabs.length > 0) {
            (async () => {
                const baseCount = tabsVisibles.length - searchTabs.length;
                setTab(baseCount + searchTabs.length - 1);
            })();
        }
    }, [searchTabs.length, tabsVisibles.length]);

    useLayoutEffect(() => {
        if (tab >= tabsVisibles.length) {
            (async () => {
                setTab(Math.max(0, tabsVisibles.length - 1));
            })();
        }
    }, [tab, tabsVisibles.length]);

    const removeSearchTab = useCallback((tabId) => {
        setSearchTabs((prev) => prev.filter((t) => t.id !== tabId));
    }, []);

    const onWSEvent = useCallback((data) => {
        setNotif({ open: true, msg: data.mensaje, severity: "info" });
    }, []);

    useSimcoWS(onWSEvent);

    useLayoutEffect(() => {
        const state = location.state;
        if (state?.highlightTab && state?.highlightId) {
            (async () => {
                const idx = tabsVisibles.findIndex((t) => t.key === state.highlightTab);
                if (idx >= 0) setTab(idx);
                setHighlightId(state.highlightId);
                window.history.replaceState({}, document.title);
            })();
        }
    }, [location.state, tabsVisibles]);

    useEffect(() => {
        api.get("/api/simco/dashboard").then((res) => setDashboardData(res.data)).catch(() => {});
    }, []);

    const tabActual = tabsVisibles[tab];

    const handleTabChange = (_, v) => setTab(v);

    const contenido = () => {
        if (tabActual?.searchId != null) {
            const st = searchTabs.find((t) => t.id === tabActual.searchId);
            if (st) return <ResultTables results={st.results} />;
            return null;
        }
        if (!tabActual) return null;
        switch (tabActual.key) {
            case "solicitudes": return <SolicitudesTab highlightId={highlightId} />;
            case "respuestas": return <RespuestasTab highlightId={highlightId} />;
            default: {
                const act = dashboardData?.actividad;
                return (
                    <Box sx={{ display: "flex", gap: 3 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textMain, mb: 2 }}>
                                Solicitudes de Hoy ({act?.solicitudes?.length || 0})
                            </Typography>
                            {act?.solicitudes?.length ? (
                                <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${colors.border}` }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>TIPO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CREADOR</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {act.solicitudes.map((s) => (
                                                <TableRow key={s.id} hover>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.codigo}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.tipo_documento}</TableCell>
                                                    <TableCell>{chipEstado(s.estado)}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{s.creado_por || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" sx={{ color: colors.textMuted, fontStyle: "italic" }}>Sin solicitudes hoy</Typography>
                            )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textMain, mb: 2 }}>
                                Respuestas de Hoy ({act?.respuestas?.length || 0})
                            </Typography>
                            {act?.respuestas?.length ? (
                                <TableContainer component={Paper} sx={{ borderRadius: 1, border: `1px solid ${colors.border}` }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>CÓDIGO</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>ESTADO DOC.</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>RESPONDIÓ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {act.respuestas.map((r) => (
                                                <TableRow key={r.id} hover>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.codigo}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.estado_documento}</TableCell>
                                                    <TableCell sx={{ fontSize: 12 }}>{r.usuario_responde || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" sx={{ color: colors.textMuted, fontStyle: "italic" }}>Sin respuestas hoy</Typography>
                            )}
                        </Box>
                    </Box>
                );
            }
        }
    };

    const resumen = dashboardData?.resumen;
    const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <Box sx={{ minHeight: "100vh", p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${colors.border}` }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textMain, mb: 0.5 }}>
                            SiMCo
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textMuted }}>
                            {hoy}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 3 }}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>{resumen?.solicitudes_hoy ?? "—"}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>Solicitudes hoy</Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success }}>{resumen?.respuestas_hoy ?? "—"}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>Respuestas hoy</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar en solicitudes y respuestas..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitSearch(); }}
                        sx={{
                            "& .MuiInputBase-root": { backgroundColor: "var(--bg-card)", borderRadius: 1 },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {searching ? <CircularProgress size={18} /> : <SearchIcon sx={{ color: colors.textMuted }} />}
                                </InputAdornment>
                            ),
                            endAdornment: searchInput ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setSearchInput(""); setSearchResults(null); }}>
                                        <ClearIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />
                    <IconButton onClick={commitSearch} disabled={!searchInput.trim() || !searchResults} sx={{ color: colors.primary }}>
                        <SearchIcon />
                    </IconButton>
                </Box>
                <FormControlLabel
                    control={<Checkbox size="small" checked={keepNewTab} onChange={(e) => setKeepNewTab(e.target.checked)} sx={{ color: colors.textMuted, "&.Mui-checked": { color: colors.primary } }} />}
                    label={<Typography variant="caption" sx={{ color: colors.textMuted }}>Nueva pestaña por búsqueda</Typography>}
                    sx={{ mt: 1 }}
                />
            </Paper>

            <Paper sx={{ borderRadius: 2, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                <Tabs value={Math.min(tab, tabsVisibles.length - 1)} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                    {tabsVisibles.map((t) => (
                        <Tab
                            key={t.key}
                            label={
                                t.searchId != null ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <span>{t.label}</span>
                                        <Box
                                            component="span"
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeSearchTab(t.searchId); }}
                                            sx={{
                                                ml: 0.5,
                                                color: colors.textMuted,
                                                cursor: "pointer",
                                                fontSize: 16,
                                                lineHeight: 1,
                                                "&:hover": { color: "#ef4444" },
                                            }}
                                        >
                                            ×
                                        </Box>
                                    </Box>
                                ) : t.label
                            }
                            sx={{ fontSize: 13 }}
                        />
                    ))}
                </Tabs>

                <Box sx={{ p: 3, minHeight: 300 }}>
                    {contenido()}
                </Box>
            </Paper>
            <Snackbar open={notif.open} autoHideDuration={5000} onClose={() => setNotif({ ...notif, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={notif.severity} variant="filled" sx={{ width: "100%" }}>
                    {notif.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
