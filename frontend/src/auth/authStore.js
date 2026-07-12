import { create } from "zustand";
import { decodeToken } from "./jwt";
import { parseJwt } from "./jwtUtils";

const access = sessionStorage.getItem("access_token");

export const useAuthStore = create((set) => ({

    accessToken: access,
    refreshToken: sessionStorage.getItem("refresh_token"),

    // 👇 RECONSTRUIR USER AUTOMÁTICAMENTE
    user: decodeToken(access),

    setTokens: (access, refresh) => {

        sessionStorage.setItem("access_token", access);
        sessionStorage.setItem("refresh_token", refresh);

        set({
            accessToken: access,
            refreshToken: refresh,
            user: decodeToken(access) // 🔥 CLAVE
        });
    },

    logout: () => {

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");

        set({
            accessToken: null,
            refreshToken: null,
            user: null
        });
    }
}));