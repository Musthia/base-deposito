import { useEffect, useState } from "react";
import { listarUsuarios } from "../api/usuarios.api";

export const useUsuarios = (filters) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);

            // ===================================
            // LLAMADA CORRECTA
            // ===================================
            const response = await listarUsuarios(
                1,
                20,
                filters
            );

            console.log("RAW RESPONSE:", response);

            // ===================================
            // NORMALIZACIÓN ERP SEGURA
            // ===================================
            const payload = response?.data;

            let list = [];

            if (Array.isArray(payload)) {
                list = payload;
            } else if (Array.isArray(payload?.items)) {
                list = payload.items;
            } else if (Array.isArray(payload?.data)) {
                list = payload.data;
            } else {
                list = [];
            }

            setData(list);

        } catch (err) {
            console.error("ERROR USUARIOS:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [JSON.stringify(filters)]);

    return {
        data,
        loading,
        refresh: fetchUsuarios
    };
};