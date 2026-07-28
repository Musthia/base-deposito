import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import { TabProvider } from "../context/TabContext";
import { useIdleTimeout } from "../hooks/useIdleTimeout";
import NotificationProvider from "../context/NotificationProvider";

export default function MainLayout() {
    useIdleTimeout();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <TopBar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: "24px",
                    pt: "80px",
                    backgroundColor: "var(--bg-page)",
                    overflow: "auto",
                }}
            >
                <NotificationProvider>
                    <TabProvider>
                        <Outlet />
                    </TabProvider>
                </NotificationProvider>
            </Box>
        </Box>
    );
}