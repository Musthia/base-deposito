import api from "../api/axiosClient";

export const loginRequest = async (usuario, password) => {

    const res = await api.post("/auth/login", {
        usuario,
        password
    });

    return res.data;
};

export const logoutRequest = async (refresh_token) => {

    const res = await api.post("/auth/logout", {
        refresh_token
    });

    return res.data;
};