import { can } from "../../utils/permissions";
import { useAuth } from "../../auth/useAuth";

export const UsuariosTable = ({
    data,
    onEdit,
    onDelete
}) => {

    const { user } = useAuth();

    return (
        <table>

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>

                {data.map(u => (
                    <tr key={u.id}>

                        <td>{u.id}</td>
                        <td>{u.usuario}</td>
                        <td>{u.rol}</td>

                        <td>

                            {can(user, "EDIT_USER") && (
                                <button onClick={() => onEdit(u)}>
                                    Editar
                                </button>
                            )}

                            {can(user, "DELETE_USER") && (
                                <button onClick={() => onDelete(u.id)}>
                                    Eliminar
                                </button>
                            )}

                        </td>

                    </tr>
                ))}

            </tbody>

        </table>
    );
};