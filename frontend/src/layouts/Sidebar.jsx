import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { usePermissions } from "../auth/usePermissions";
import api from "../api/axiosClient";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const perms = usePermissions();

    const datcorrMenu = [
        { label: "Panel de Control", path: "/dashboard" },
        ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
        ...(perms.canViewDatabase ? [{ label: "Consultar Bases", path: "/database" }] : []),
        ...(perms.canViewCargaDatos ? [{ label: "Carga de Datos", path: "/carga-datos" }] : []),
        ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
        ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
    ];

    const simcoMenu = [
        ...(perms.canViewSimco ? [{ label: "Panel de Solicitudes", path: "/simco" }] : []),
    ];

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        }
        logout();
        navigate("/");
    };

    const nombre = user?.nombre || user?.usuario || "Usuario";
    const inicial = nombre.charAt(0).toUpperCase();
    const rol = user?.rol || "";
    const nivel = user?.nivel !== null && user?.nivel !== undefined ? `Nivel ${user.nivel}` : "";

    const activeStyle = (path) => ({
        padding: "10px 12px",
        cursor: "pointer",
        borderRadius: "6px",
        marginBottom: "2px",
        fontSize: 14,
        background: location.pathname === path ? "#3f51b53b" : "transparent",
        transition: "background 0.15s",
    });

    const styles = {
        menuIcon: {
            fontSize: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            // Opcional: puedes forzar el color aquí si no quieres que herede el del padre
            // color: "#94a3b8", 
        }
    };

    return (
        <aside style={{
            width: "220px",
            height: "100vh",
            background: "#4e4e4e",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        }}>
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 10px 0 10px",
            }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: 16, letterSpacing: "0.5px" }}>DATCORR</h3>

                {datcorrMenu.map(item => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={activeStyle(item.path)}
                    >
                        {item.label}
                    </div>
                ))}

                {perms.canViewSimco && <>
                    <div style={{ height: 1, background: "#333", margin: "12px 0" }} />
                    <h4 style={{ margin: "0 0 10px 0", fontSize: 12, letterSpacing: "1px", color: "#94a3b8", textTransform: "uppercase" }}>SiMCo</h4>

                    {simcoMenu.map(item => (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={activeStyle(item.path)}
                        >
                            {item.label}
                        </div>
                    ))}
                </>}

                {perms.canViewMensajes && <>
                    <div style={{ height: 1, background: "#333", margin: "12px 0" }} />
                    <div
                        onClick={() => navigate("/mensajes")}
                        style={activeStyle("/mensajes")}
                    >
                        Mensajes
                    </div>
                </>}
            </div>

            <div style={{
                flexShrink: 0,
                padding: "0 10px 10px 10px",
                borderTop: "1px solid #333",
            }}>
                <div style={{ padding: "6px 0" }}>
                    {!perms.isConsulta && (
                        <div
                        onClick={() => navigate("/acerca-datcorr")}
                        style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            fontSize: 13,
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a3d"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        {/* Nuevo ícono basado en SPAN */}
                        <span style={styles.menuIcon}>ℹ</span>

                        Acerca de Datcorr
                    </div>
                    )}
                    <div
                        onClick={() => navigate("/acerca-simco")}
                        style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            fontSize: 13,
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a3d"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        {/* Nuevo ícono basado en SPAN */}
                        <span style={styles.menuIcon}>ℹ</span>

                        Acerca de SiMCo
                    </div>
                </div>
                <div style={{
                    padding: "12px",
                    background: "#2a2a3d",
                    borderRadius: 8,
                    marginTop: 4,
                    marginBottom: 8,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#3f51b5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {inicial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                                {nombre}
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                                {[rol, nivel].filter(Boolean).join(" · ") || "Usuario"}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    onClick={handleLogout}
                    style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderRadius: "6px",
                        color: "#ff6b6b",
                        fontSize: 14,
                        transition: "background 0.15s",
                    }}
                >
                    Cerrar sesion
                </div>
            </div>
        </aside>
    );
}
