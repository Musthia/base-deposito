import { DataGrid } from "@mui/x-data-grid";
import { useUsuariosGrid } from "../../hooks/useUsuariosGrid";

import UsuarioModal from "../../components/modals/UsuarioModal";
import { useState } from "react";

import { Button } from "@mui/material";

import { usePermissions } from "../../auth/usePermissions";

export default function UsuariosPage() {

    const permissions = usePermissions();


    if (!permissions.canViewUsers) {
        return <div>Sin permisos</div>;
    }

    
    const {
            rows,
            loading,
            pagination,
            fetchData
        } = useUsuariosGrid();

        const [openModal, setOpenModal] = useState(false);

        const [selectedUser, setSelectedUser] = useState(null);      

    
        const columns = [
            { field: "id", headerName: "ID", width: 80 },
            { field: "usuario", headerName: "Usuario", flex: 1 },
            { field: "nombre", headerName: "Nombre", flex: 1 },
            { field: "apellido", headerName: "Apellido", flex: 1 },

            ...(permissions.showRolColumn
                ? [{ field: "rol", headerName: "Rol", width: 150 }]
                : []),

            ...(permissions.showNivelColumn
                ? [{ field: "nivel_seguridad", headerName: "Nivel", width: 120 }]
                : [])
        ];

        const handleGuardar = async () => {
           await fetchData(
            pagination.page, 
            pagination.pageSize);

        };
        
    return (
        <div style={{ padding: 20 }}>

            <h2>ERP Usuarios</h2>

            {permissions.canCreateUser && (
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedUser(null);   // 👈 IMPORTANTE
                        setOpenModal(true);
                    }}    
                >
                    Nuevo Usuario
                </Button>
            )}

            

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                onRowClick={(params) => {
                    setSelectedUser(params.row);
                    setOpenModal(true);
                }}
                pagination
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
            />
            

            <UsuarioModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedUser(null);
                }}
                usuario={selectedUser}   // 👈 CRÍTICO
                onSave={handleGuardar}
            />
            
           

        </div>
    );
}