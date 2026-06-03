import axios from "axios";
import { useAuthStore } from "../auth/authStore";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

// ===================================
// INTERCEPTOR JWT AUTOMÁTICO
// ===================================

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;