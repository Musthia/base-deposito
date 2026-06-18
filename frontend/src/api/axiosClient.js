import axios from "axios";
import { useAuthStore } from "../auth/authStore";

const api = axios.create({
    baseURL: "http://localhost:8000"
});

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;