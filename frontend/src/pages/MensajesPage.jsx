import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    Box, Typography, Paper, Tabs, Tab, IconButton, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { useThemeMode } from "../context/ThemeModeContext";
import api from "../api/axiosClient";

export default function MensajesPage() {
    const { colors } = useThemeMode();
    const location = useLocation();
    const [tab, setTab] = useState(0);
    const [mensajes, setMensajes] = useState([]);
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyDest, setReplyDest] = useState("");
    const [replyAsunto, setReplyAsunto] = useState("");
    const [replyCuerpo, setReplyCuerpo] = useState("");
    const [replySending, setReplySending] = useState(false);

    const fetch = useCallback(async () => {
        try {
            const res = await api.get("/api/mensajes");
            setMensajes(res.data.mensajes || []);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    useEffect(() => {
        const state = location.state;
        if (state?.responderA) {
            setReplyDest(state.responderA);
            setReplyAsunto(state.responderAsunto ? `Re: ${state.responderAsunto}` : "");
            setReplyCuerpo("");
            setReplyOpen(true);
            window.history.replaceState({}, "");
        }
    }, [location.state]);

    const pendientes = mensajes.filter((m) => !m.leido);
    const listados = tab === 0 ? pendientes : mensajes;

    return (
        <Box sx={{ minHeight: "100vh", p: 3, backgroundColor: colors.bgPage }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${colors.border}` }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textMain, mb: 0.5 }}>
                    Mensajes
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textMuted }}>
                    Mensajería interna del sistema
                </Typography>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label={`Pendientes (${pendientes.length})`} />
                    <Tab label="Todos" />
                </Tabs>
            </Box>

            {listados.length === 0 && (
                <Paper sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.border}`, textAlign: "center" }}>
                    <Typography sx={{ color: colors.textMuted }}>No hay mensajes</Typography>
                </Paper>
            )}

            {listados.map((m) => (
                <Paper
                    key={m.id}
                    elevation={0}
                    sx={{
                        p: 2, mb: 1.5, borderRadius: 2,
                        border: `1px solid ${colors.border}`,
                        borderLeft: m.leido ? `4px solid ${colors.border}` : "4px solid #2563eb",
                        bgcolor: colors.bgCard,
                        display: "flex", alignItems: "flex-start", gap: 2,
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.textMain, mb: 0.3 }}>
                            {m.asunto || "Mensaje de " + m.remitente_usuario}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textMuted, whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 0.5 }}>
                            {m.cuerpo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>
                            De: {m.remitente_usuario} &middot; {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ReplyIcon />}
                                sx={{
                                    fontSize: 11, textTransform: "none",
                                    borderColor: colors.border, color: colors.textMuted,
                                }}
                                onClick={() => {
                                    setReplyDest(m.remitente_usuario);
                                    setReplyAsunto(m.asunto ? `Re: ${m.asunto}` : "");
                                    setReplyCuerpo("");
                                    setReplyOpen(true);
                                }}
                            >
                                Responder
                            </Button>
                        </Box>
                    </Box>
                    {!m.leido && (
                        <IconButton
                            size="small"
                            onClick={async () => {
                                try { await api.put(`/api/mensajes/${m.id}/leer`); fetch(); } catch {}
                            }}
                            sx={{ color: "#2563eb" }}
                            title="Marcar como leído"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Paper>
            ))}

            <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: 15, fontWeight: 600 }}>
                    Responder a {replyDest}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Asunto"
                        fullWidth
                        size="small"
                        value={replyAsunto}
                        onChange={(e) => setReplyAsunto(e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        label="Mensaje"
                        fullWidth
                        multiline
                        rows={4}
                        value={replyCuerpo}
                        onChange={(e) => setReplyCuerpo(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplyOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        disabled={!replyCuerpo.trim() || replySending}
                        onClick={async () => {
                            setReplySending(true);
                            try {
                                await api.post("/api/mensajes/enviar", {
                                    destinatario_usuario: replyDest,
                                    es_general: false,
                                    asunto: replyAsunto.trim() || null,
                                    cuerpo: replyCuerpo.trim(),
                                });
                                setReplyOpen(false);
                            } catch {
                                // silent
                            } finally {
                                setReplySending(false);
                            }
                        }}
                    >
                        {replySending ? "Enviando..." : "Enviar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
