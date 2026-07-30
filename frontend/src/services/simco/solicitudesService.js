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

export const subirArchivoSolicitud = async (solicitudId, archivo) => {
    const form = new FormData();
    form.append("archivo", archivo);
    const res = await api.post(`${BASE}/${solicitudId}/archivo`, form);
    return res.data;
};

export const descargarArchivoSolicitud = async (solicitudId) => {
    const res = await api.get(`${BASE}/${solicitudId}/archivo`, { responseType: "blob" });
    return res;
};

export const eliminarArchivoSolicitud = async (solicitudId) => {
    const res = await api.delete(`${BASE}/${solicitudId}/archivo`);
    return res.data;
};

export const getArchivoUrlSolicitud = (solicitudId) => {
    return `${api.defaults.baseURL || ""}/api/simco/solicitudes/${solicitudId}/archivo`;
};
