import { Box, Typography, Paper } from "@mui/material";

const PALETTE = {
    bgPage: "#0f172a",
    bgCard: "#042164",
    border: "#1e3a8a",
    textMain: "#f1f5f9",
    textMuted: "#94a3b8",
};

export default function MensajesPage() {
    return (
        <Box sx={{ minHeight: "100vh", p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${PALETTE.border}` }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: PALETTE.textMain, mb: 0.5 }}>
                    Mensajes
                </Typography>
                <Typography variant="body2" sx={{ color: PALETTE.textMuted }}>
                    Mensajería interna del sistema
                </Typography>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 2, border: `1px solid ${PALETTE.border}`, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                <Typography sx={{ color: PALETTE.textMuted }}>Sección en construcción</Typography>
            </Paper>
        </Box>
    );
}
