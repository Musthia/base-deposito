import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import api from "../api/axiosClient";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const refreshToken = useAuthStore((s) => s.refreshToken);

    const menu = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Usuarios", path: "/usuarios" },
        { label: "Consultar Bases", path: "/database" },
        { label: "Carga de Datos", path: "/carga-datos" },
        { label: "Auditoria", path: "/auditoria" },
        { label: "Reportes", path: "/reportes" }
    ];

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await api.post("/auth/logout", { refresh_token: refreshToken });
            }
        } catch (err) {
            console.error("Logout error:", err);
        }
        logout();
        navigate("/");
    };

    return (
        <aside style={{
            width: "220px",
            height: "100vh",
            background: "#1e1e2f",
            color: "white",
            padding: "10px",
            display: "flex",
            flexDirection: "column"
        }}>
            <div>
                <h3>DATCORR ERP</h3>

                {user && (
                    <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
                        {user.nombre || user.usuario} — Nivel {user.nivel ?? "?"}
                    </p>
                )}

                {menu.map(item => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            marginBottom: "2px",
                            background: location.pathname === item.path ? "#3f51b5" : "transparent"
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "auto" }}>
                <div
                    onClick={handleLogout}
                    style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderRadius: "6px",
                        color: "#ff6b6b",
                        borderTop: "1px solid #333"
                    }}
                >
                    Cerrar sesión
                </div>
            </div>
        </aside>
    );
}