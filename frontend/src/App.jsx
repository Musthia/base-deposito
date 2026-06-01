import AppRouter from "./routes/AppRouter";

import { AuthProvider } from "./auth/useAuth";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { UsuariosPage } from "./pages/UsuariosPage";


export default function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route element={<MainLayout />}>

                    <Route path="/" element={<Dashboard />} />

                    <Route path="/usuarios" element={<UsuariosPage />} />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}