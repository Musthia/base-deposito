import api from "../../api/axiosClient";

const BASE = "/api/simco/solicitudes";

export const listarSolicitudes = async () => {
    const res = await api.get(BASE);
    return res.data;
};

export const crearSolicitud = async (data) => {
    const res = await api.post(BASE, data);
    return res.data;
};

export const obtenerSolicitud = async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
};
