import { Box, Typography, Divider } from "@mui/material";

export default function AcercaDatcorrPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 720 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "var(--text-main)" }}>
                Acerca de
            </Typography>
            <Box sx={{ background: "var(--bg-card)", borderRadius: "8px", p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: "var(--text-main)" }}>
                    DATCORR S.A.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic", color: "var(--text-muted)" }}>
                    — DATCORR S.A. es una empresa de servicios de informática y tecnología
                    con sede en la ciudad de Corrientes. Fundada en 2012, su actividad principal
                    abarca el desarrollo de software, la gestión informática y la tecnología aplicada. —
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, color: "var(--text-muted)" }}>
                    DatCorr es su plataforma institucional de gestión de registros documentales,
                    que permite la administración, consulta y custodia de bases de datos con control
                    de acceso por permisos y auditoría de actividades.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 2 }}>
                    {[
                        ["Razón Social", "Datcorr"],
                        ["Dirección", "San Martín 1270, Corrientes (3400)"],
                        ["Teléfono", "(+54-379) 499-6116"],
                        ["Correo", "fabioeduardo304@hotmail.com"],
                    ].map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ color: "var(--text-main)" }}>
                            <strong>{label}:</strong> {value}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
