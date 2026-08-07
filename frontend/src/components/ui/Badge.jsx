/**
 * Badge — etiqueta de estado (Documento Maestro 4.2)
 * tone: danger | warning | success | info | neutral (default)
 */
import React from "react";

const tones = {
    danger: { bg: "var(--dangerLight, var(--danger-light))", color: "var(--danger)", border: "1px solid var(--danger)" },
    warning: { bg: "var(--warning-light)", color: "var(--warning)", border: "1px solid var(--warning)" },
    success: { bg: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)" },
    info: { bg: "var(--info-light)", color: "var(--info)", border: "1px solid var(--info)" },
    neutral: { bg: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--border)" },
};

export default function Badge({ tone = "neutral", children, style = {} }) {
    const t = tones[tone] || tones.neutral;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--space-1) var(--space-2)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--weight-semibold)",
                ...t,
                ...style,
            }}
        >
            {children}
        </span>
    );
}