import { DataGrid } from "@mui/x-data-grid";
import { useUsuariosGrid } from "../../hooks/useUsuariosGrid";

import UsuarioModal from "../../components/modals/UsuarioModal";
import { useState } from "react";

import {
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Snackbar,
    Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { usePermissions } from "../../auth/usePermissions";
import { eliminarUsuario } from "../../services/usuariosService";



export default function UsuariosPage() {

    const permissions = usePermissions();

    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    const {
        rows,
        loading,
        pagination,
        fetchData
    } = useUsuariosGrid();

    const columns = [
        {
            field: "acciones",
            headerName: "",
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(params.row);
                            setOpenModal(true);
                        }}
                        title="Editar"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ open: true, user: params.row });
                        }}
                        title="Eliminar"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
        { field: "id", headerName: "ID", width: 80 },
        { field: "usuario", headerName: "Usuario", flex: 1 },
        { field: "nombre", headerName: "Nombre", flex: 1 },
        { field: "apellido", headerName: "Apellido", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },

        ...(permissions.showRolColumn
            ? [{ field: "rol", headerName: "Rol", width: 150 }]
            : []),

        ...(permissions.showNivelColumn
            ? [{ field: "nivel_seguridad", headerName: "Nivel", width: 120 }]
            : [])
    ];

    const handleGuardar = async () => {
        await fetchData(pagination.page, pagination.pageSize);
    };

    const handleEliminar = async () => {
        try {
            await eliminarUsuario(deleteDialog.user.id);
            setDeleteDialog({ open: false, user: null });
            setSnack({ open: true, msg: "Usuario eliminado correctamente", severity: "success" });
            await fetchData(pagination.page, pagination.pageSize);
        } catch (err) {
            setSnack({ open: true, msg: "Error al eliminar usuario", severity: "error" });
        }
    };

    if (!permissions.canViewUsers) {
        return <Box sx={{ p: 3 }}><Typography sx={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sin permisos para ver usuarios</Typography></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "var(--text-main)" }}>Usuarios</Typography>

            {permissions.canCreateUser && (
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedUser(null);
                        setOpenModal(true);
                    }}
                    sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}
                >
                    Nuevo Usuario
                </Button>
            )}

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 20, 50]}
                paginationModel={{
                    page: pagination.page,
                    pageSize: pagination.pageSize
                }}
                rowCount={pagination.total}
                paginationMode="server"
                onPaginationModelChange={(model) => {
                    fetchData(model.page, model.pageSize);
                }}
                disableRowSelectionOnClick
                slots={{
                    noRowsOverlay: () => (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <Typography variant="body2" color="text.secondary">Sin usuarios</Typography>
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
                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                    mt: 1,
                }}
            />

            <UsuarioModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedUser(null);
                }}
                usuario={selectedUser}
                onSave={handleGuardar}
            />

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
                maxWidth="xs"
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Eliminar al usuario <strong>{deleteDialog.user?.usuario}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="error" onClick={handleEliminar}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}