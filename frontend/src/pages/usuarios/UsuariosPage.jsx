import { DataGrid } from "@mui/x-data-grid";
import { useUsuariosGrid } from "../../hooks/useUsuariosGrid";

import UsuarioModal from "../../components/modals/UsuarioModal";
import { useState } from "react";

import { Button } from "@mui/material";

export default function UsuariosPage() {

    
    const {
            rows,
            loading,
            pagination,
            fetchData
        } = useUsuariosGrid();

        const [openModal, setOpenModal] = useState(false);
        

    
        const columns = [
            { field: "id", headerName: "ID", width: 80 },
            { field: "usuario", headerName: "Usuario", flex: 1 },
            { field: "nombre", headerName: "Nombre", flex: 1 },
            { field: "apellido", headerName: "Apellido", flex: 1 },
            { field: "rol", headerName: "Rol", width: 150 },
            { field: "nivel_seguridad", headerName: "Nivel", width: 120 }
        ];

        const handleGuardar = async () => {
           await fetchData(pagination.page, pagination.pageSize);

        };
        
    return (
        <div style={{ padding: 20 }}>

            <h2>ERP Usuarios</h2>

            <Button
                variant="contained"
                onClick={() => setOpenModal(true)}
            >
                Nuevo Usuario
            </Button>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
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
                onClose={() => setOpenModal(false)}
                onSave={handleGuardar}
            />

           

        </div>
    );
}