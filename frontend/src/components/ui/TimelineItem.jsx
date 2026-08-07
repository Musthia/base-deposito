/**
 * TimelineItem — ítem de actividad (Documento Maestro 4.4 / 8.3)
 * tone: danger | success | warning | info | neutral
 */
import React from "react";

const dotTones = {
    danger: "var(--danger)",
    success: "var(--success)",
    warning: "var(--warning)",
    info: "var(--info)",
    neutral: "var(--text-muted)",
};

export default function TimelineItem({ tone = "neutral", icon, label, meta, action, style = {} }) {
    return (
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", padding: "var(--space-2) 0", ...style }}>
            <span style={{
                width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "#fff", borderRadius: "50%", background: dotTones[tone] || dotTones.neutral,
            }}>
                {icon}
            </span>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-main)" }}>{label}</div>
                {meta && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{meta}</div>}
            </div>
            {action && <div style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{action}</div>}
        </div>
    );
}