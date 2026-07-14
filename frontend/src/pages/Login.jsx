import { useState } from "react";
import api from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();
    const setTokens = useAuthStore((s) => s.setTokens);

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { usuario, password });
            setTokens(res.data.token);
            navigate("/dashboard");
        } catch {
            setError("Usuario o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="slideshow-slide" />
            ))}

            <form className="glass-card" onSubmit={handleLogin}>
                <h2>DatCorr</h2>

                <label htmlFor="usuario-input">Usuario</label>
                <input
                    id="usuario-input"
                    name="usuario"
                    type="text"
                    placeholder="usuario"
                    autoComplete="username"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <label htmlFor="password-input">Contraseña</label>
                <input
                    id="password-input"
                    name="password"
                    type="password"
                    placeholder="contraseña"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <div className="login-error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Ingresando…" : "Ingresar"}
                </button>

                <div className="trust-footer">
                    <span>Conexión cifrada (TLS)</span>
                    <span>Datos protegidos</span>
                </div>
            </form>
        </div>
    );
}
