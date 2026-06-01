import { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import { UsuariosTable } from "../components/table/UsuariosTable";
import { UsuarioModal } from "../components/modals/UsuarioModal";

export const UsuariosPage = () => {

    const [filters, setFilters] = useState({});

    const { data, refresh } = useUsuarios(filters);

    const [modalOpen, setModalOpen] = useState(false);

    const [editUser, setEditUser] = useState(null);

    const handleSave = async (form) => {

        console.log("guardar:", form);

        setModalOpen(false);

        setEditUser(null);

        refresh();
    };

    return (
        <div>

            <h2>Gestión de Usuarios</h2>

            <button onClick={() => setModalOpen(true)}>
                Nuevo Usuario
            </button>

            <UsuariosTable
                data={data}
                onEdit={(u) => {
                    setEditUser(u);
                    setModalOpen(true);
                }}
                onDelete={(id) => {
                    console.log("delete", id);
                }}
            />

            <UsuarioModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditUser(null);
                }}
                onSave={handleSave}
                initialData={editUser}
            />

        </div>
    );
};