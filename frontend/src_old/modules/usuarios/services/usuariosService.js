import axios from "../../../api/axiosInstance";

export const getUsuarios = (params) => {
    return axios.get("/usuarios", { params });
};

export const createUsuario = (data) => {
    return axios.post("/usuarios", data);
};

export const updateUsuario = (id, data) => {
    return axios.put(`/usuarios/${id}`, data);
};

export const deleteUsuario = (id) => {
    return axios.delete(`/usuarios/${id}`);
};