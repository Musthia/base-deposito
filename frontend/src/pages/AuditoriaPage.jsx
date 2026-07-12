import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAuditoria } from "../services/dashboardService";

const actionColor = (accion) => {
    const map = {
        LOGIN_SUCCESS: "#16a34a",
        LOGIN_FAILED: "#dc2626",
        LOGOUT_SUCCESS: "#64748b",
        CREATE: "#0284c7",
        UPDATE: "#ea580c",
        DELETE_LOGICO: "#dc2626",
    };
    return map[accion] || "#64748b";
};

export default function AuditoriaPage() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

    useEffect(() => {
        setLoading(true);
        getAuditoria(paginationModel.page + 1, paginationModel.pageSize)
            .then((data) => {
                const mapped = (data.registros || []).map((r) => ({
                    id: r.id,
                    fecha: r.fecha ? new Date(r.fecha).toLocaleString("es-AR") : "",
                    usuario: r.usuario,
                    accion: (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: actionColor(r.accion),
                                    flexShrink: 0,
                                }}
                            />
                            {r.accion}
                        </Box>
                    ),
                    accionRaw: r.accion,
                    tabla: r.tabla || "-",
                    detalle: r.detalle || "-",
                    ip: r.ip || r.ip_address || "-",
                }));
                setRows(mapped);
                setTotal(data.total || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [paginationModel]);

    const columns = [
        { field: "fecha", headerName: "Fecha", width: 170 },
        { field: "usuario", headerName: "Usuario", width: 120 },
        { field: "accion", headerName: "Accion", width: 180, sortable: false },
        { field: "tabla", headerName: "Tabla", width: 120 },
        { field: "detalle", headerName: "Detalle", flex: 1, minWidth: 200 },
        { field: "ip", headerName: "IP", width: 140 },
    ];

    return (
        <Box sx={{ p: 3, overflow: "hidden", maxWidth: "100%" }}>
            <Typography variant="h5" gutterBottom>
                Auditoria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Registro de actividad del sistema ({total} eventos)
            </Typography>

            <Box sx={{ height: 600, width: "100%", overflow: "hidden", maxWidth: "100%" }}>
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
