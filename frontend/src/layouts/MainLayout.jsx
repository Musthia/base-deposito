import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import { TabProvider } from "../context/TabContext";
import { useIdleTimeout } from "../hooks/useIdleTimeout";
import NotificationProvider from "../context/NotificationProvider";

export default function MainLayout() {
    useIdleTimeout();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <TopBar />
            <main style={{
                flex: 1,
                padding: "24px",
                paddingTop: "80px",
                background: "#ffffff",
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