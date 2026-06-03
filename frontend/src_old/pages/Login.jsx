import { useState } from "react";
import api from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../auth/authStore";

export default function Login() {

    const navigate = useNavigate();

    const setTokens = useAuthStore((s) => s.setTokens);

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", {
                usuario,
                password
            });

            const data = response.data;

            // -----------------------------
            // VALIDACIÓN REAL
            // -----------------------------
            if (!data.token) {
                throw new Error("Token inválido del backend");
            }
            
            // -----------------------------
            // ZUSTAND
            // -----------------------------
            setTokens(
                data.token,          // ✔ correcto
                data.refresh_token
            );

            setError("");


            // -----------------------------
            // REDIRECCIÓN SEGURA
            // -----------------------------
            navigate("/dashboard");

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                err.message ||
                "Error en login"
            );
        }
    };

    return (
        <div style={styles.container}>

            <form style={styles.form} onSubmit={handleLogin}>

                <h2>DatCorr Login</h2>

                <input
                    style={styles.input}
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) =>
                        setUsuario(e.target.value)
                    }
                />

                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                {error && (
                    <p style={styles.error}>
                        {error}
                    </p>
                )}

                <button style={styles.button}>
                    Iniciar sesión
                </button>

            </form>

        </div>
    );
}

const styles = {

    container: {
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#1e1e2f"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "30px",
        background: "#2a2a3d",
        borderRadius: "10px",
        width: "300px",
        color: "white"
    },

    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "none"
    },

    button: {
        padding: "10px",
        background: "#4f46e5",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    error: {
        color: "red",
        fontSize: "12px"
    }
};