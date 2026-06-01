import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore";



export default function PrivateRoute({ children }) {

    console.log("USER AUTH:", user);

    const token = useAuthStore((s) => s.accessToken);

    if (!token) {
        return <Navigate to="/" />;
    }

    return children;

    
}

