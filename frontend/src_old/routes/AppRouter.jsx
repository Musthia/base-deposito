import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UsuariosPage from "../modules/usuarios/pages/UsuariosPage";
import PrivateRoute from "../auth/PrivateRoute";
import MainLayout from "../components/layout/MainLayout";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLICO */}
                <Route path="/" element={<Login />} />

                {/* PRIVADO CON LAYOUT */}
                <Route element={<PrivateRoute />}>
                    
                    <Route element={<MainLayout />}>
                        
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/usuarios" element={<UsuariosPage />} />
                        <Route path="/reportes" element={<div>Reportes en construcción</div>} />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}