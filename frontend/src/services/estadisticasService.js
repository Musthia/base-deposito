import api from "../api/axiosClient";

export async function getEstadisticasDatcorr(periodo) {
    const res = await api.get(`/api/estadisticas/datcorr?periodo=${periodo}`);
    return res.data;
}

export async function getEstadisticasSimco(periodo) {
    const res = await api.get(`/api/estadisticas/simco?periodo=${periodo}`);
    return res.data;
}

export async function getUsuariosEnLinea() {
    const res = await api.get("/api/estadisticas/usuarios-en-linea");
    return res.data;
}
