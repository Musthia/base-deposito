import { useEffect, useState } from "react";
import api from "../api/axiosClient";

export function useUsuarios() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsuarios = async () => {

        try {
            setLoading(true);

            const res = await api.get("/usuarios", {
                params: {
                    page: 1,
                    limit: 20
                }
            });

            console.log("USUARIOS RAW:", res.data);

            const list =
                res.data?.items ||
                res.data?.data ||
                res.data ||
                [];

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
    }, []);

    return {
        data,
        loading,
        refresh: fetchUsuarios
    };
}