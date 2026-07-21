import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { TabProvider } from "../context/TabContext";
import { useIdleTimeout } from "../hooks/useIdleTimeout";
import NotificationProvider from "../context/NotificationProvider";

export default function MainLayout() {
    useIdleTimeout();

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />

            <main style={{
                flex: 1,
                minWidth: 0,
                padding: "20px",
                minHeight: "100vh",
                background: "#0f172a",
                overflow: "auto",
            }}>
                <NotificationProvider>
                    <TabProvider>
                        <Outlet />
                    </TabProvider>
                </NotificationProvider>
            </main>
        </div>
    );
}