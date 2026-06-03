import { useEffect, useState } from "react";
import api from "../../api/axiosClient";

export default function UsuariosPage() {

    const [usuarios, setUsuarios] = useState([]);

    const cargar = async () => {
        try {

            const res = await api.get("/usuarios?page=1&limit=20");

            const data = res.data;

            console.log("RAW RESPONSE:", data);

            // 🔥 AQUÍ ESTÁ LA CLAVE
            const lista = Array.isArray(data.usuarios)
                ? data.usuarios
                : [];

            setUsuarios(lista);

        } catch (err) {
            console.error("ERROR USUARIOS:", err);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    return (
        <div>
            <h2>Usuarios ERP</h2>

            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Nivel</th>
                    </tr>
                </thead>

                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nombre}</td>
                            <td>{u.usuario}</td>
                            <td>{u.rol}</td>
                            <td>{u.nivel_seguridad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}