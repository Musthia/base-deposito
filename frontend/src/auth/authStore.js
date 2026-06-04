import { create } from "zustand";
import { decodeToken } from "./jwt";

const access = localStorage.getItem("access_token");

export const useAuthStore = create((set) => ({

    accessToken: access,
    refreshToken: localStorage.getItem("refresh_token"),

    // 👇 RECONSTRUIR USER AUTOMÁTICAMENTE
    user: decodeToken(access),

    setTokens: (access, refresh) => {

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        set({
            accessToken: access,
            refreshToken: refresh,
            user: decodeToken(access) // 🔥 CLAVE
        });
    },

    logout: () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        set({
            accessToken: null,
            refreshToken: null,
            user: null
        });
    }
}));