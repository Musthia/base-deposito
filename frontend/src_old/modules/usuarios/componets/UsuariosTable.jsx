import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getUsuarios } from "../services/usuariosService";

export default function UsuariosTable() {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const cargar = async () => {

        setLoading(true);

        try {

            const res = await getUsuarios({
                page: 1,
                limit: 20
            });

            setRows(res.data.data || res.data);

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    useEffect(() => {
        cargar();
    }, []);

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "nombre", headerName: "Nombre", flex: 1 },
        { field: "apellido", headerName: "Apellido", flex: 1 },
        { field: "rol", headerName: "Rol", width: 120 }
    ];

    return (
        <div style={{ height: 500, width: "100%" }}>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 20, 50]}
            />

        </div>
    );
}