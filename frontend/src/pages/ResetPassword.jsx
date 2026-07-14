import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import "./Login.css";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, nueva_password: password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Token inválido o expirado.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="glass-card" style={{ textAlign: "center" }}>
                    <h2>Enlace inválido</h2>
                    <p>El enlace no contiene un token de recuperación.</p>
                    <Link to="/forgot-password">Solicitar nuevo</Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="login-page">
                <div className="glass-card" style={{ textAlign: "center" }}>
                    <h2>Contraseña actualizada</h2>
                    <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                    <Link to="/">Ir al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <form className="glass-card" onSubmit={handleSubmit}>
                <h2>Nueva contraseña</h2>
                <label htmlFor="pw-input">Nueva contraseña</label>
                <input
                    id="pw-input"
                    type="password"
                    placeholder="mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label htmlFor="confirm-input">Confirmar contraseña</label>
                <input
                    id="confirm-input"
                    type="password"
                    placeholder="repetir contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
                {error && <div className="login-error">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? "Actualizando…" : "Actualizar contraseña"}
                </button>
            </form>
        </div>
    );
}
