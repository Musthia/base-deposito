import AppRouter from "./router/AppRouter";
import { ThemeModeProvider } from "./context/ThemeModeContext";

export default function App() {
    return (
        <ThemeModeProvider>
            <AppRouter />
        </ThemeModeProvider>
    );
}
