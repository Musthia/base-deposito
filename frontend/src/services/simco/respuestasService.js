import api from "../../api/axiosClient";

const BASE = "/api/simco/respuestas";

export const listarPendientes = async () => {
    const res = await api.get(`${BASE}/pendientes`);
    return res.data;
};

export const responderSolicitud = async (data) => {
    const res = await api.post(BASE, data);
    return res.data;
};
