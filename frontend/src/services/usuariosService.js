import api from "./api";

export const listarUsuarios = async (
    page = 1,
    limit = 20,
    filtros = {}
) => {

    const params = {
        page,
        limit,
        ...filtros
    };

    const response = await api.get(
        "/usuarios",
        { params }
    );

    return response.data;
};

export const crearUsuario = async (data) => {

    const response = await api.post(
        "/usuarios",
        data
    );

    return response.data;
};

export const actualizarUsuario = async (
    id,
    data
) => {

    const response = await api.put(
        `/usuarios/${id}`,
        data
    );

    return response.data;
};

export const eliminarUsuario = async (
    id
) => {

    const response = await api.delete(
        `/usuarios/${id}`
    );

    return response.data;
};