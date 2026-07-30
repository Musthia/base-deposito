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

export const subirArchivoRespuesta = async (respuestaId, archivo) => {
    const form = new FormData();
    form.append("archivo", archivo);
    const res = await api.post(`${BASE}/${respuestaId}/archivo`, form);
    return res.data;
};

export const descargarArchivoRespuesta = async (respuestaId) => {
    const res = await api.get(`${BASE}/${respuestaId}/archivo`, { responseType: "blob" });
    return res;
};

export const eliminarArchivoRespuesta = async (respuestaId) => {
    const res = await api.delete(`${BASE}/${respuestaId}/archivo`);
    return res.data;
};

export const getArchivoUrlRespuesta = (respuestaId) => {
    return `${api.defaults.baseURL || ""}/api/simco/respuestas/${respuestaId}/archivo`;
};
