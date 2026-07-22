import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuthStore } from "../auth/authStore";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();
    const setTokens = useAuthStore((s) => s.setTokens);

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (useAuthStore.getState().accessToken) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { usuario, password });
            setTokens(res.data.token);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const mensaje = err.response?.data?.detail
                || err.response?.data?.mensaje
                || "Usuario o contraseña incorrectos.";
            setError(mensaje);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="login-page" role="main" aria-label="Página de acceso al sistema">
        
        {/* FONDO: Red tecnológica fluida de 4 esquinas */}
        <div className="background-metrics-container" aria-hidden="true">
            
            <svg className="constellation-svg" xmlns="http://w3.org">
                {/* Conexión 1 a 2 */}
                <line x1="15%" y1="22%" x2="18%" y2="88%" className="constellation-base-line" />
                <line x1="15%" y1="22%" x2="18%" y2="88%" className="data-pulse pulse-fast-a" />
                <line x1="15%" y1="22%" x2="18%" y2="88%" className="data-pulse pulse-fast-b" />
            
                {/* Conexión 1 a 3 */}
                <line x1="15%" y1="22%" x2="85%" y2="71%" className="constellation-base-line" />
                <line x1="15%" y1="22%" x2="85%" y2="71%" className="data-pulse pulse-slow-a" />
                <line x1="15%" y1="22%" x2="85%" y2="71%" className="data-pulse pulse-slow-b" />
            
                {/* Conexión 1 a 4 */}
                <line x1="15%" y1="22%" x2="85%" y2="32%" className="constellation-base-line" />
                <line x1="15%" y1="22%" x2="85%" y2="32%" className="data-pulse pulse-medium-a" />
                <line x1="15%" y1="22%" x2="85%" y2="32%" className="data-pulse pulse-medium-b" />
            
                {/* Conexión 4 a 2 */}
                <line x1="85%" y1="32%" x2="18%" y2="88%" className="constellation-base-line" />
                <line x1="85%" y1="32%" x2="18%" y2="88%" className="data-pulse pulse-medium-a" />
                <line x1="85%" y1="32%" x2="18%" y2="88%" className="data-pulse pulse-medium-b" />
                
                {/* Conexión 4 a 3 */}
                <line x1="85%" y1="32%" x2="85%" y2="71%" className="constellation-base-line" />
                <line x1="85%" y1="32%" x2="85%" y2="71%" className="data-pulse pulse-fast-a" />
                <line x1="85%" y1="32%" x2="85%" y2="71%" className="data-pulse pulse-fast-b" />
            
                {/* Conexión 2 a 3 */}
                <line x1="18%" y1="88%" x2="85%" y2="71%" className="constellation-base-line" />
                <line x1="18%" y1="88%" x2="85%" y2="71%" className="data-pulse pulse-fast-a" />
                <line x1="18%" y1="88%" x2="85%" y2="71%" className="data-pulse pulse-fast-b" />
            </svg>

    {/* Nodo 1: Superior Izquierda */}
    <div className="bg-metric-node node-1">
        <span className="node-icon">💽</span>
        <div className="node-info">
            <span className="node-value">1</span>
            <span className="node-label">Auditorías periódicas de seguridad</span>
        </div>
    </div>

    {/* Nodo 2: Inferior Izquierda */}
    <div className="bg-metric-node node-2">
        <span className="node-icon">👤</span>
        <div className="node-info">
            <span className="node-value">2</span>
            <span className="node-label">Atención de datos especializada</span>
        </div>
    </div>

    {/* Nodo 3: Inferior Derecha (Corregido orden visual) */}
    <div className="bg-metric-node node-3">
        <span className="node-icon">🔒</span>
        <div className="node-info">
            <span className="node-value">3</span>
            <span className="node-label">Gestión documental confiable</span>
        </div>
    </div>

    {/* Nodo 4: Superior Derecha (Corregido orden visual) */}
    <div className="bg-metric-node node-4">
        <span className="node-icon">🌐</span> {/* Cambiado a icono de red/estructura */}
        <div className="node-info">
            <span className="node-value">4</span>
            <span className="node-label">Estructura expandible de archivo</span>
        </div>
    </div>
</div>


        {/* CONTENEDOR PRINCIPAL DE LOGIN */}
        <div className="login-container">
            <section className="login-brand" aria-label="Información institucional">
                <div className="brand-content">
                    <img src="/images/login/logo.webp" alt="" className="brand-logo-img" />
                    <p className="brand-description">
                        Digitalización, archivo y custodia segura de documentos institucionales.
                    </p>
                    <div className="brand-footer">
                        <span className="status-dot"></span>
                        <span className="status-text">Sistema en línea</span>
                    </div>
                </div>
            </section>

            <section className="login-form-panel" aria-label="Formulario de inicio de sesión">
                <div className="form-wrapper">
                    <header className="form-header">
                        <h2 className="form-title">Iniciar sesión</h2>
                        <p className="form-subtitle">Ingrese sus credenciales de acceso</p>
                    </header>

                    {error && (
                        <div className="form-error" role="alert" aria-live="polite">
                            <span className="form-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} noValidate>
                        <div className="form-group">
                            <label htmlFor="usuario-input" className="form-label">Usuario</label>
                            <input
                                id="usuario-input"
                                type="text"
                                className="form-input"
                                placeholder="Ingrese su usuario"
                                autoComplete="username"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password-input" className="form-label">Contraseña</label>
                            <div className="password-wrapper">
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Ingrese su contraseña"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? "👁" : "👁‍🗨"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || !usuario.trim() || !password.trim()}
                        >
                            {loading ? <span className="spinner" /> : null}
                            {loading ? "Ingresando…" : "Acceder al sistema"}
                        </button>
                    </form>

                    <div className="form-links">
                        <Link to="/forgot-password" className="form-link">¿Olvidó su contraseña?</Link>
                        <span className="form-link-sep">|</span>
                        <Link to="/registro" className="form-link">Registrarse</Link>
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
)
}