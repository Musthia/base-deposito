import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";

import UsuariosPage from "../pages/usuarios/UsuariosPage";

import PrivateRoute from "../auth/PrivateRoute";

import MainLayout from "../components/layout/MainLayout";

export default function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>

                            <MainLayout>

                                <Dashboard />

                            </MainLayout>

                        </PrivateRoute>
                    }
                />

                <Route
                    path="/usuarios"
                    element={
                        <PrivateRoute>

                            <MainLayout>

                                <Usuarios />

                            </MainLayout>

                        </PrivateRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}