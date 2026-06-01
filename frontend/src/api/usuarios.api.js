import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getUsuarios = async (token, params) => {

    return await axios.get(`${API}/usuarios`, {

        headers: {
            Authorization: `Bearer ${token}`
        },

        params
    });
};

export const createUsuario = async (token, data) => {

    return await axios.post(`${API}/usuarios`, data, {

        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateUsuario = async (token, id, data) => {

    return await axios.put(`${API}/usuarios/${id}`, data, {

        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const deleteUsuario = async (token, id) => {

    return await axios.delete(`${API}/usuarios/${id}`, {

        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};