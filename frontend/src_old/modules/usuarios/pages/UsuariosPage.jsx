import { useState } from "react";
import { useUsuarios } from "../../../hooks/useUsuarios";

export default function UsuariosPage() {

    const { data, loading } = useUsuarios();
    const list = Array.isArray(data) ? data : [];

    return (
        <div>

            <h2>Usuarios ERP</h2>

            {loading && <p>Cargando...</p>}

            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Nivel</th>
                    </tr>
                </thead>

                <tbody>
                    {list.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.usuario}</td>
                            <td>{u.rol}</td>
                            <td>{u.nivel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}