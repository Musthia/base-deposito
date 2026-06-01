import { create } from "zustand";

export const useAuthStore = create((set) => ({

    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
    user: null,

    setTokens: (access, refresh) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        set({
            accessToken: access,
            refreshToken: refresh
        });
    },

    setUser: (user) => set({ user }),

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