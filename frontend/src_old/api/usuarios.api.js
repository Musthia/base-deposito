import api from "./axiosClient";

// ===================================
// USUARIOS API (ERP CLEAN)
// ===================================

export const listarUsuarios = (params) => {
    return api.get("/usuarios", { params });
};

export const crearUsuario = (data) => {
    return api.post("/usuarios", data);
};

export const actualizarUsuario = (id, data) => {
    return api.put(`/usuarios/${id}`, data);
};

export const eliminarUsuario = (id) => {
    return api.delete(`/usuarios/${id}`);
};