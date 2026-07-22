import { Box, Typography, Paper } from "@mui/material";
import { useThemeMode } from "../context/ThemeModeContext";

export default function MensajesPage() {
    const { colors } = useThemeMode();
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

            <Paper sx={{ p: 4, borderRadius: 2, border: `1px solid ${colors.border}`, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                <Typography sx={{ color: colors.textMuted }}>Sección en construcción</Typography>
            </Paper>
        </Box>
    );
}
