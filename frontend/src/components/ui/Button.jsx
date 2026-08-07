/**
 * Button — jerarquía de botones uniforme (Documento Maestro 8.5)
 * Variantes: primary | secondary | outline | danger | ghost
 * Targets ≥ 40px, separación ≥ 8px, focus visible.
 */
import React from "react";

const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    minHeight: 40,
    padding: "var(--space-2) var(--space-5)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-base)",
    fontWeight: "var(--weight-semibold)",
    fontFamily: "var(--font-family)",
    cursor: "pointer",
    border: "1px solid transparent",
    textDecoration: "none",
    transition: "background .15s ease, border-color .15s ease, color .15s ease",
    whiteSpace: "nowrap",
};

const variants = {
    primary: {
        background: "var(--primary)",
        color: "#ffffff",
        border: "1px solid var(--primary)",
    },
    secondary: {
        background: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--border)",
    },
    outline: {
        background: "transparent",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
    },
    danger: {
        background: "var(--danger)",
        color: "#ffffff",
        border: "1px solid var(--danger)",
    },
    ghost: {
        background: "transparent",
        color: "var(--primary)",
        border: "1px solid transparent",
        padding: "var(--space-1) var(--space-2)",
    },
};

export default function Button({
    variant = "primary",
    style = {},
    children,
    disabled,
    onClick,
    type = "button",
    ...rest
}) {
    const hover = disabled ? {} : {
        filter: "brightness(0.92)",
    };
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            style={{ ...base, ...(variants[variant] || variants.primary), ...(disabled ? { opacity: 0.5, cursor: "not-allowed", filter: "none" } : hover), ...style }}
            {...rest}
        >
            {children}
        </button>
    );
}