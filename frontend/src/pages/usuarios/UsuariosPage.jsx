import { useEffect } from "react";
import { useState } from "react";

import UsuarioTable from "./UsuariosTable";

import {
    listarUsuarios,
    eliminarUsuario
}
from "../../services/usuariosService";

export default function UsuariosPage() {

    const [usuarios, setUsuarios] =
        useState([]);

    const cargarUsuarios = async () => {

        try {

            const data =
                await listarUsuarios();

            setUsuarios(
                data.items || []
            );

        } catch (error) {

            console.error(error);
        }
    };

    useEffect(() => {

        cargarUsuarios();

    }, []);

    const handleEliminar =
        async (id) => {

            if (
                !window.confirm(
                    "Eliminar usuario?"
                )
            )
                return;

            await eliminarUsuario(id);

            cargarUsuarios();
        };

    return (

        <div>

            <h1>
                Usuarios
            </h1>

            <UsuarioTable

                usuarios={usuarios}

                onEditar={(u) =>
                    console.log(u)
                }

                onEliminar={
                    handleEliminar
                }
            />

        </div>
    );
}