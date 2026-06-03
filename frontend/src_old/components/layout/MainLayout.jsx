import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {

    return (
        <div style={{ display: "flex" }}>

            <Sidebar />

            <main style={{
                flex: 1,
                padding: "20px",
                background: "#f4f4f4",
                minHeight: "100vh"
            }}>

                <Outlet />

            </main>

        </div>
    );
}