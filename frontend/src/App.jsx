import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppRouter from "./router/AppRouter";
import { theme } from "./theme";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppRouter />
        </ThemeProvider>
    );
}
