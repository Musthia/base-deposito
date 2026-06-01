import axios from "axios";
import { useAuthStore } from "../auth/authStore";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

// -----------------------------------
// REQUEST INTERCEPTOR
// -----------------------------------

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// -----------------------------------
// RESPONSE INTERCEPTOR (AUTO REFRESH)
// -----------------------------------

api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // Si token expiró
        if (error.response?.status === 401 &&
            !originalRequest._retry) {

            originalRequest._retry = true;

            try {

                const refresh = useAuthStore.getState().refreshToken;

                const res = await axios.post(
                    "http://127.0.0.1:8000/usuarios/refresh",
                    {
                        refresh_token: refresh
                    }
                );

                const newAccess = res.data.access_token;
                const newRefresh = res.data.refresh_token;

                useAuthStore.getState().setTokens(
                    newAccess,
                    newRefresh
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccess}`;

                return api(originalRequest);

            } catch (err) {

                useAuthStore.getState().logout();

                window.location.href = "/";

            }
        }

        return Promise.reject(error);
    }
);

export default api;