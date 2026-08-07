/**
 * ProgressBar — barra de progreso % (Documento Maestro 4.3)
 * Para la columna "% Progreso" (verificado / total).
 */
import React from "react";

export default function ProgressBar({ value = 0, max = 1, tone = "success", height = 8, showLabel = true, style = {} }) {
    const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    const color = tone === "danger" ? "var(--danger)"
        : tone === "warning" ? "var(--warning)"
        : tone === "info" ? "var(--info)"
        : "var(--success)";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", justifyContent: "flex-end", ...style }}>
            <div style={{ flex: 1, minWidth: 60, height, borderRadius: 4, background: "var(--bg-muted)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width .3s ease" }} />
            </div>
            {showLabel && <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: color }}>{pct.toFixed(0)}%</span>}
        </div>
    );
}