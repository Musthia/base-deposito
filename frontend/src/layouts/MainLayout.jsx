import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { TabProvider } from "../context/TabContext";

export default function MainLayout() {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />

            <main style={{
                flex: 1,
                minWidth: 0,
                padding: "20px",
                minHeight: "100vh",
                background: "#f4f4f4",
                overflow: "hidden",
            }}>
                <TabProvider>
                    <Outlet />
                </TabProvider>
            </main>
        </div>
    );
}