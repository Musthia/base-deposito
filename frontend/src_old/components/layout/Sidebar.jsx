import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = useAuthStore((s) => s.user);

    const isActive = (path) => location.pathname === path;

    const menu = [
        {
            label: "Dashboard",
            path: "/dashboard",
            roles: [9999, 1, 2]
        },
        {
            label: "Usuarios",
            path: "/usuarios",
            roles: [9999]
        },
        {
            label: "Reportes",
            path: "/reportes",
            roles: [9999, 1]
        }
    ];

    const canAccess = (item) => true;

    return (
        <aside style={{
            width: "220px",
            height: "100vh",
            background: "#1e1e2f",
            color: "white",
            padding: "10px"
        }}>

            <h3 style={{ padding: "10px" }}>
                DATCORR ERP
            </h3>

            {menu.map((item) => {

                if (!canAccess(item)) return null;

                return (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: "10px",
                            margin: "5px 0",
                            cursor: "pointer",
                            background: isActive(item.path)
                                ? "#3f51b5"
                                : "transparent",
                            borderRadius: "5px"
                        }}
                    >
                        {item.label}
                    </div>
                );
            })}

        </aside>
    );
}