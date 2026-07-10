import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UsuariosPage from "../pages/usuarios/UsuariosPage";
import DatabasePage from "../pages/DatabasePage";
import CargaDatosPage from "../pages/CargaDatosPage";

import PrivateRoute from "../auth/PrivateRoute";
import MainLayout from "../layouts/MainLayout";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLICO */}
                <Route path="/" element={<Login />} />

                {/* PRIVADO + LAYOUT ERP */}  
                <Route
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="/reportes" element={<div>Reportes en construcción</div>} />
                    <Route path="/database" element={<DatabasePage />} />
                    <Route path="/carga-datos" element={<CargaDatosPage />} />

                {/* fallback */}
                <Route path="*" element={<Login />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}