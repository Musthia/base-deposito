import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axiosClient";
import "./Login.css";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
                <div className="glass-card">
                    <h2>Enlace inválido</h2>
                    <p>El enlace no contiene un token de recuperación.</p>
                    <Link to="/forgot-password" className="form-link">Solicitar nuevo</Link>
                    <div className="trust-footer">
                        <span>Conexión cifrada (TLS)</span>
                        <span>&bull;</span>
                        <span>Datos protegidos</span>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="login-page">
                <div className="glass-card">
                    <h2>Contraseña actualizada</h2>
                    <p>Ya podés iniciar sesión con tu nueva contraseña.</p>
                    <Link to="/" className="form-link">Ir al inicio</Link>
                    <div className="trust-footer">
                        <span>Conexión cifrada (TLS)</span>
                        <span>&bull;</span>
                        <span>Datos protegidos</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container" role="main" aria-label="Nueva contraseña">

                <section className="login-brand" aria-label="Información institucional">
                    <div className="brand-content">
                        <div className="brand-logo" aria-hidden="true">D</div>
                        <h1 className="brand-title">DatCorr</h1>
                        <p className="brand-description">
                            Digitalización, archivo y custodia segura de documentos institucionales.
                        </p>
                        <div className="brand-footer">
                            <span className="status-dot" aria-hidden="true"></span>
                            <span className="status-text">Sistema operativo</span>
                        </div>
                    </div>
                </section>

                <section className="login-form-panel" aria-label="Formulario de nueva contraseña">
                    <div className="form-wrapper">

                        <header className="form-header">
                            <h2 className="form-title">Nueva contraseña</h2>
                            <p className="form-subtitle">Ingresá tu nueva contraseña</p>
                        </header>

                        {error && (
                            <div className="form-error" role="alert" aria-live="polite">
                                <span className="form-error-icon" aria-hidden="true">&#9888;</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="form-group">
                                <label htmlFor="pw-input" className="form-label">Nueva contraseña</label>
                                <div className="password-wrapper">
                                    <input
                                        id="pw-input"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="form-input"
                                        placeholder="mín. 6 caracteres"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        aria-required="true"
                                        aria-invalid={!!error}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? "\u{1F441}" : "\u{1F441}\u200D\u{1F5E8}\uFE0F"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm-input" className="form-label">Confirmar contraseña</label>
                                <div className="password-wrapper">
                                    <input
                                        id="confirm-input"
                                        name="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        className="form-input"
                                        placeholder="repetir contraseña"
                                        autoComplete="new-password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        aria-required="true"
                                        aria-invalid={!!error}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showConfirm ? "\u{1F441}" : "\u{1F441}\u200D\u{1F5E8}\uFE0F"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading || !password.trim() || !confirm.trim()}
                            >
                                {loading ? <span className="spinner" aria-hidden="true" /> : null}
                                {loading ? "Actualizando\u2026" : "Actualizar contraseña"}
                            </button>
                        </form>

                        <div className="form-links">
                            <Link to="/" className="form-link">Volver al inicio</Link>
                        </div>

                        <footer className="trust-footer">
                            <span>Conexión cifrada (TLS)</span>
                            <span>&bull;</span>
                            <span>Datos protegidos</span>
                        </footer>

                    </div>
                </section>

            </div>
        </div>
    );
}
