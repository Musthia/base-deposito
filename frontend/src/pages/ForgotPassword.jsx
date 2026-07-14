import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";
import "./Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch {
            setError("Error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="login-page">
                <div className="glass-card" style={{ textAlign: "center" }}>
                    <h2>Revisa tu correo</h2>
                    <p>Si el correo existe, recibirás instrucciones para restablecer tu contraseña.</p>
                    <Link to="/">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <form className="glass-card" onSubmit={handleSubmit}>
                <h2>Recuperar contraseña</h2>
                <label htmlFor="email-input">Correo electrónico</label>
                <input
                    id="email-input"
                    type="email"
                    placeholder="correo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && <div className="login-error">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? "Enviando…" : "Enviar"}
                </button>
                <div style={{ marginTop: 12 }}>
                    <Link to="/">Volver al inicio</Link>
                </div>
            </form>
        </div>
    );
}
