import { Box, Typography, Paper } from "@mui/material";

const PALETTE = {
    bgPage: "#f8fafc",
    bgCard: "#ffffff",
    border: "#e2e8f0",
    textMain: "#0f172a",
    textMuted: "#64748b",
};

export default function MensajesPage() {
    return (
        <Box sx={{ backgroundColor: PALETTE.bgPage, minHeight: "100vh", p: 3 }}>
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
