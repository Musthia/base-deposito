import { Box, Paper, Typography, Divider } from "@mui/material";

export default function AcercaDatcorrPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 720 }}>
            <Typography variant="h5" gutterBottom>
                Acerca de
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    DATCORR S.A.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic", color: "white" }}>
                    — DATCORR S.A. es una empresa de servicios de informática y tecnología
                    con sede en la ciudad de Corrientes. Fundada en 2012, su actividad principal
                    abarca el desarrollo de software, la gestión informática y la tecnología aplicada. —
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
                    {[
                        ["Razón Social", "Datcorr"],
                        ["Dirección", "San Martín 1270, Corrientes (3400)"],
                        ["Teléfono", "(+54-379) 499-6116"],
                        ["Correo", "fabioeduardo304@hotmail.com"],
                    ].map(([label, value]) => (
                        <Typography key={label} variant="body2">
                            <strong>{label}:</strong> {value}
                        </Typography>
                    ))}
                </Box>

                <Divider sx={{ my: 2 }} />

            </Paper>
        </Box>
    );
}
