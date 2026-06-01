import { useEffect, useState } from "react";
import { getUsuarios } from "../api/usuarios.api";
import { useAuth } from "../auth/useAuth";

export const useUsuarios = (filters) => {

    const { user } = useAuth();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsuarios = async () => {

        try {

            setLoading(true);

            const res = await getUsuarios(
                user?.access_token,
                filters
            );

            setData(res.data);

        } catch (err) {

            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [filters]);

    return {
        data,
        loading,
        refresh: fetchUsuarios
    };
};