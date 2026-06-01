export default function TablaUsuarios({
    usuarios,
    loading
}) {

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <table border="1" width="100%">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Nivel</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>

                {usuarios.map((u) => (
                    <tr key={u.id}>

                        <td>{u.id}</td>
                        <td>{u.usuario}</td>
                        <td>{u.rol}</td>
                        <td>{u.nivel_seguridad}</td>

                        <td>
                            <button>Editar</button>
                            <button>Eliminar</button>
                        </td>

                    </tr>
                ))}

            </tbody>

        </table>
    );
}