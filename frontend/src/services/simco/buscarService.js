import api from "../../api/axiosClient";

export const buscarSimco = async (q) => {
    const res = await api.get("/api/simco/buscar", { params: { q } });
    return res.data;
};
