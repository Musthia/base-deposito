import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((s) => s.user);

    const menu = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Usuarios", path: "/usuarios" },
        { label: "Reportes", path: "/reportes" }
    ];

    return (
        <aside style={{
            width: "220px",
            height: "100vh",
            background: "#1e1e2f",
            color: "white",
            padding: "10px"
        }}>
            <h3>DATCORR ERP</h3>

            {menu.map(item => (
                <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                        padding: "10px",
                        cursor: "pointer",
                        background: location.pathname === item.path ? "#3f51b5" : "transparent"
                    }}
                >
                    {item.label}
                </div>
            ))}
        </aside>
    );
}