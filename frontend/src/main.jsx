import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

if (!GOOGLE_CLIENT_ID) {
  console.warn("VITE_GOOGLE_CLIENT_ID no configurado — Google OAuth deshabilitado");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
