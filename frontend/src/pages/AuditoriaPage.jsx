import { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAuditoria } from "../services/dashboardService";
import { usePermissions } from "../auth/usePermissions";

const actionColor = (accion) => {
    const map = {
        LOGIN_SUCCESS: "#16a34a",
        LOGIN_FAILED: "#dc2626",
        LOGOUT_SUCCESS: "#64748b",
        CREATE: "#0284c7",
        UPDATE: "#ea580c",
        DELETE: "#dc2626",
        DELETE_LOGICO: "#dc2626",
        DELETE_LOGICO_ERROR: "#dc2626",
        CONSULTA: "#8b5cf6",
        BUSQUEDA: "#f59e0b",
        SOLICITUD_REGISTRO: "#3b82f6",
        ALTA_USUARIO: "#16a34a",
        RECHAZO_USUARIO: "#ef4444",
        GOOGLE_LOGIN_SUCCESS: "#4285F4",
        GOOGLE_LOGIN_FAILED: "#ea4335",
        GOOGLE_LINK: "#34a853",
        GOOGLE_UNLINK: "#fbbc04",
    };
    return map[accion] || "#64748b";
};

const actionLabel = (accion, tabla) => {
    const map = {
        CREATE: tabla?.includes("usuarios") ? "Creacion de usuario" : "Creacion de registro",
        UPDATE: "Edicion de datos",
        DELETE: "Eliminacion de registro",
        DELETE_LOGICO: "Desactivacion de usuario",
        DELETE_LOGICO_ERROR: "Error al desactivar usuario",
        LOGIN_SUCCESS: "Inicio de sesion",
        LOGIN_FAILED: "Error de inicio de sesion",
        LOGOUT_SUCCESS: "Cierre de sesion",
        CONSULTA: "Consulta de datos",
        BUSQUEDA: "Busqueda de datos",
        SOLICITUD_REGISTRO: "Solicitud de registro",
        ALTA_USUARIO: "Alta de usuario aprobada",
        RECHAZO_USUARIO: "Rechazo de registro",
        GOOGLE_LOGIN_SUCCESS: "Login con Google",
        GOOGLE_LOGIN_FAILED: "Error login Google",
        GOOGLE_LINK: "Vinculacion Google",
        GOOGLE_UNLINK: "Desvinculacion Google",
    };
    return map[accion] || accion;
};

export default function AuditoriaPage() {
    const permissions = usePermissions();

    if (!permissions.canViewAuditoria) {
        return (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                <Typography color="text.secondary">Sin permisos para acceder a esta seccion</Typography>
            </Box>
        );
    }

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

    const loadData = useCallback((page, pageSize) => {
        setLoading(true);
        setError(null);
        getAuditoria(page + 1, pageSize)
            .then((data) => {
                const mapped = (data.registros || []).map((r) => ({
                    id: r.id,
                    fecha: r.fecha ? new Date(r.fecha).toLocaleString("es-AR") : "",
                    usuario: r.usuario,
                    accion: r.accion,
                    tabla: r.tabla || "-",
                    detalle: r.detalle || "-",
                    ip: r.ip || r.ip_address || "-",
                }));
                setRows(mapped);
                setTotal(data.total || 0);
            })
            .catch((err) => setError(err?.message || "Error al cargar auditoria"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadData(paginationModel.page, paginationModel.pageSize);
    }, [loadData, paginationModel]);

    const columns = [
        { field: "fecha", headerName: "Fecha", width: 170 },
        { field: "usuario", headerName: "Usuario", width: 120 },
        {
            field: "accion",
            headerName: "Accion",
            width: 220,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: actionColor(params.value),
                            flexShrink: 0,
                        }}
                    />
                    {actionLabel(params.value, params.row.tabla)}
                </Box>
            ),
        },
        { field: "tabla", headerName: "Tabla", width: 120 },
        { field: "detalle", headerName: "Detalle", flex: 1, minWidth: 200 },
        { field: "ip", headerName: "IP", width: 140 },
    ];

    if (error) {
        return (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <Box sx={{ background: "#ffffff", borderRadius: "8px", padding: "32px", textAlign: "center", maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Error al cargar auditoria</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
                    <button
                        onClick={() => loadData(paginationModel.page, paginationModel.pageSize)}
                        style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 24px",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >Reintentar</button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, overflow: "hidden", maxWidth: "100%" }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#111827" }}>
                Auditoria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Registro de actividad del sistema ({total} eventos)
            </Typography>

            <Box sx={{ background: "#ffffff", borderRadius: "8px", height: 600, width: "100%", overflow: "hidden", maxWidth: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    rowCount={total}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    disableExtendRowFullWidth
                    slots={{
                        noRowsOverlay: () => (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <Typography variant="body2" color="text.secondary">Sin registros de auditoria</Typography>
                            </Box>
                        ),
                    }}
                    slotProps={{
                        basePagination: {
                            showFirstButton: true,
                            showLastButton: true,
                        },
                    }}
                    sx={{
                        maxWidth: "100%",
                        overflow: "hidden",
                        "& .MuiDataGrid-main": { overflow: "hidden" },
                        "& .MuiDataGrid-virtualScroller": { overflow: "auto" },
                        "& .MuiDataGrid-cell:focus": { outline: "none" },
                    }}
                />
            </Box>
        </Box>
    );
}
