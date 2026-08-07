/**
 * SectionTitle — título de sección uniforme (Documento Maestro 7.1)
 * Opcional: action (link "Ver más →") alineado a la derecha.
 */
import React from "react";

export default function SectionTitle({ children, action, style = {} }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)", ...style }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-main)" }}>
                {children}
            </h2>
            {action && <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{action}</div>}
        </div>
    );
}