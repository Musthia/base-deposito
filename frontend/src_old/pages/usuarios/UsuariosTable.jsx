export default function UsuarioTable({
    usuarios,
    onEditar,
    onEliminar
}) {

    return (
        <table>

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Nivel</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>

                {usuarios.map(usuario => (

                    <tr key={usuario.id}>

                        <td>{usuario.id}</td>

                        <td>{usuario.usuario}</td>

                        <td>{usuario.nombre}</td>

                        <td>{usuario.rol}</td>

                        <td>
                            {usuario.nivel_seguridad}
                        </td>

                        <td>

                            <button
                                onClick={() =>
                                    onEditar(usuario)
                                }
                            >
                                Editar
                            </button>

                            <button
                                onClick={() =>
                                    onEliminar(usuario.id)
                                }
                            >
                                Eliminar
                            </button>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>
    );
}