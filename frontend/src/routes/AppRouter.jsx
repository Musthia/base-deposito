import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import PrivateRoute from "../auth/PrivateRoute";

function Dashboard() {
    return <h1>Dashboard DatCorr</h1>;
}

export default function AppRouter() {

    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />

            </Routes>

        </BrowserRouter>
    );
}