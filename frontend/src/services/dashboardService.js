import api from "../api/axiosClient";

export const getDashboardStats = async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
};
