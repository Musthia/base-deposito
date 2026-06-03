import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./authStore";

export default function PrivateRoute() {

    const token = useAuthStore((s) => s.accessToken);

    console.log("TOKEN:", token);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}