import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme, LIGHT, DARK } from "../theme";

const ThemeModeContext = createContext();

const STORAGE_KEY = "app-theme-mode";

function getInitialMode() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light") return stored;
    } catch { }
    return "light";
}

function applyCSSVars(colors) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, val]) => {
        const name = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(`--${name}`, val);
    });
}

// Apply immediately so first render uses correct vars
applyCSSVars(getInitialMode() === "dark" ? DARK : LIGHT);

export function ThemeModeProvider({ children }) {
    const [mode, setMode] = useState(getInitialMode);

    const toggleMode = useCallback(() => {
        setMode((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            try { localStorage.setItem(STORAGE_KEY, next); } catch { }
            return next;
        });
    }, []);

    const colors = useMemo(() => (mode === "dark" ? DARK : LIGHT), [mode]);
    const theme = useMemo(() => getTheme(mode), [mode]);

    useEffect(() => { applyCSSVars(colors); }, [colors]);

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode, colors }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
}

export function useThemeMode() {
    const ctx = useContext(ThemeModeContext);
    if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
    return ctx;
}
