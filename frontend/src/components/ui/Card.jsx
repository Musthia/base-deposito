/**
 * Card — contenedor base reutilizable (Documento Maestro 8.4)
 */
import React from "react";

export default function Card({ className = "", style = {}, children, ...rest }) {
    return (
        <div className={`dc-card ${className}`} style={style} {...rest}>
            {children}
        </div>
    );
}