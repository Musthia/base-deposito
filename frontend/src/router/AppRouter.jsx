import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import RegistroPage from "../pages/RegistroPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import UsuariosPage from "../pages/usuarios/UsuariosPage";
import DatabasePage from "../pages/DatabasePage";
import CargaDatosPage from "../pages/CargaDatosPage";
import AuditoriaPage from "../pages/AuditoriaPage";
import ReportesPage from "../pages/ReportesPage";
import SimcoPage from "../pages/simco/SimcoPage";
import MensajesPage from "../pages/MensajesPage";
import AcercaDatcorrPage from "../pages/AcercaDatcorrPage";
import AcercaSimcoPage from "../pages/AcercaSimcoPage";
import AltasPendientesPage from "../pages/AltasPendientesPage";
import MiCuentaPage from "../pages/MiCuentaPage";

import PrivateRoute from "../auth/PrivateRoute";
import MainLayout from "../layouts/MainLayout";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                {/* PUBLICO */}
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

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
                    <Route path="/reportes" element={<ReportesPage />} />
                    <Route path="/database" element={<DatabasePage />} />
                    <Route path="/carga-datos" element={<CargaDatosPage />} />
                    <Route path="/auditoria" element={<AuditoriaPage />} />
                    <Route path="/simco" element={<SimcoPage />} />
                    <Route path="/mensajes" element={<MensajesPage />} />
                    <Route path="/acerca-datcorr" element={<AcercaDatcorrPage />} />
                    <Route path="/acerca-simco" element={<AcercaSimcoPage />} />
                    <Route path="/altas-pendientes" element={<AltasPendientesPage />} />
                    <Route path="/mi-cuenta" element={<MiCuentaPage />} />

                {/* fallback */}
                <Route path="*" element={<Login />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}