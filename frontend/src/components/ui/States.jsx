/**
 * LoadingState / ErrorState — estados dentro del contenido (Documento Maestro 8.7)
 * No ocupan pantalla completa (100vh); se centran en su contenedor.
 */
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "./Button";

export function LoadingState({ text = "Cargando..." }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", minHeight: 200 }}>
            <CircularProgress size={40} style={{ color: "var(--primary)" }} />
            <p style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>{text}</p>
        </div>
    );
}

export function ErrorState({ title = "Error al cargar", description = "", onRetry }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
            <div style={{ maxWidth: 400, width: "100%", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--danger)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", boxShadow: "var(--shadow-card)" }}>
                <div style={{ fontSize: 32 }}>⚠</div>
                <h3 style={{ margin: "var(--space-3) 0 var(--space-2)", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--text-main)" }}>{title}</h3>
                {description && <p style={{ margin: "0 0 var(--space-6)", fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>{description}</p>}
                {onRetry && <Button variant="primary" onClick={onRetry}>Reintentar</Button>}
            </div>
        </div>
    );
}