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
                <div className="glass-card">
                    <h2>Revisa tu correo</h2>
                    <p>Si el correo existe, recibirás instrucciones para restablecer tu contraseña.</p>
                    <Link to="/" className="form-link">Volver al inicio</Link>
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
            <div className="login-container" role="main" aria-label="Recuperación de contraseña">

                <section className="login-brand" aria-label="Información institucional">
                    <div className="brand-content">
                        <img src="/images/login/logo.webp" alt="" className="brand-logo-img" />
                        
                        <p className="brand-description">
                            Digitalización, archivo y custodia segura de documentos institucionales.
                        </p>
                        <div className="brand-footer">
                            <span className="status-dot" aria-hidden="true"></span>
                            <span className="status-text">Sistema operativo</span>
                        </div>
                    </div>
                </section>

                <section className="login-form-panel" aria-label="Formulario de recuperación">
                    <div className="form-wrapper">

                        <header className="form-header">
                            <h2 className="form-title">Recuperar contraseña</h2>
                            <p className="form-subtitle">Ingresá tu correo electrónico</p>
                        </header>

                        {error && (
                            <div className="form-error" role="alert" aria-live="polite">
                                <span className="form-error-icon" aria-hidden="true">&#9888;</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="email-input" className="form-label">Correo electrónico</label>
                                <input
                                    id="email-input"
                                    name="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="correo@empresa.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    aria-required="true"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading || !email.trim()}
                            >
                                {loading ? <span className="spinner" aria-hidden="true" /> : null}
                                {loading ? "Enviando\u2026" : "Enviar"}
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
