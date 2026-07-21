import { Box, Paper, Typography, Divider} from "@mui/material";

export default function AcercaSimcoPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 720 }}>
            <Typography variant="h5" gutterBottom>
                Acerca de
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    SiMCo
                </Typography>
                <Typography variant="body2" sx={{ color: "text.white" }}>
                    — SiMCo (Sistema de Manejo de Consultas)  
                      auditoría de actividades y
                    un sistema de búsqueda avanzada. —
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                    {[
                        ["Usuarios", "Permite la creación de usuarios con roles diferenciados y control de acceso"], 
                        ["Trazabilidad", "Para dar seguimiento al estado de las solicitudes y consultas"],                        
                        ["Adjuntos", "Permite adjuntar archivos a las solicitudes y consultas"],
                        ["Respuestas", "Permite dar respuestas a las solicitudes y consultas de manera organizada"],
                        ["Notificaciones", "Permite enviar notificaciones a los usuarios sobre el estado de sus solicitudes y consultas"],
                        ["Auditoría", "Permite registrar y consultar actividades realizadas en el sistema"],
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
