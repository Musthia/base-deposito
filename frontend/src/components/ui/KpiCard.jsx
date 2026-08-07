/**
 * KpiCard — métrica con prioridad visual (Documento Maestro 4.2 / 8.2)
 * - Detalles siempre visibles (fin del hover-only).
 * - tone="danger" para KPI crítico (borde + badge "Acción requerida").
 */
import React from "react";

const tones = {
    primary: { color: "var(--primary)", bg: "var(--primary-light)" },
    info: { color: "var(--info)", bg: "var(--info-light)" },
    success: { color: "var(--success)", bg: "var(--success-light)" },
    warning: { color: "var(--warning)", bg: "var(--warning-light)" },
    danger: { color: "var(--danger)", bg: "var(--danger-light)" },
};

export default function KpiCard({
    icon,
    iconBg,
    iconColor,
    label,
    value,
    sub,
    details = [],
    critical = false,
    badge = "",
    onClick,
}) {
    const accent = critical ? tones.danger : (iconColor && iconBg ? { color: iconColor, bg: iconBg } : tones.primary);

    return (
        <div
            className="dc-card"
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
            style={{
                margin: 0,
                padding: "var(--space-5)",
                cursor: onClick ? "pointer" : "default",
                ...(critical ? { border: "2px solid var(--danger)", position: "relative" } : {}),
                ...(onClick ? { transition: "box-shadow .15s, transform .15s" } : {}),
            }}
        >
            {critical && (
                <span className="dc-kpi-badge" style={{ position: "absolute", top: -1, right: 12, transform: "translateY(-50%)" }}>
                    <span className="dc-tone-danger" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--danger)", background: "var(--danger-light)", border: "1px solid var(--danger)" }}>
                        ⚠ Acción requerida
                    </span>
                </span>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <span style={{
                    width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "var(--radius-md)", background: accent.bg, color: accent.color, fontWeight: "bold", fontSize: 16,
                }}>
                    {icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{label}</div>
                    <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--text-main)", lineHeight: 1.2 }}>{value}</div>
                    {sub && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>{sub}</div>}
                </div>
            </div>

            {details.length > 0 && (
                <div style={{ marginTop: "var(--space-4)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-2)" }}>
                    {details.map((d, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-muted)", padding: "2px 0" }}>
                            <span>{d.label}</span>
                            <span className="num" style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-secondary)" }}>{d.value}</span>
                        </div>
                    ))}
                </div>
            )}
            {onClick && (
                <div style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: "var(--weight-semibold)" }}>Ver más →</div>
            )}
        </div>
    );
}