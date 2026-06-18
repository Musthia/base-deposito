import api from "./axiosClient";

export const consultarRegistros = async (payload) => {
    const res = await api.post("/consultas/ejecutar", payload);
    return res.data;
};