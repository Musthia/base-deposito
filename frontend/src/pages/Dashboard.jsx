import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePermissions } from "../auth/usePermissions";
import { getDashboardStats } from "../services/dashboardService";
import CircularProgress from "@mui/material/CircularProgress";

export default function Dashboard() {
    const navigate = useNavigate();
    
    const perms = usePermissions();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch((err) => setError(err?.message || "Error al cargar el panel"));
    }, []);

    if (error) {
        return (
            <div style={errorStyles.container}>
                <div style={errorStyles.card}>
                    <span style={{ fontSize: 32 }}>⚠</span>
                    <h2 style={errorStyles.title}>Error al cargar el panel</h2>
                    <p style={errorStyles.desc}>{error}</p>
                    <button
                        onClick={() => { setError(null); setStats(null); getDashboardStats().then(setStats).catch((err) => setError(err?.message || "Error")); }}
                        style={errorStyles.button}
                    >Reintentar</button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={loadingStyles.container}>
                <CircularProgress size={32} />
                <p style={loadingStyles.text}>Cargando panel...</p>
            </div>
        );
    }

    return (
        <div style={dashboardStyles.wrapper}>
            {/* ── Welcome Card ── */}
            <div style={welcomeStyles.card}>
                <div style={welcomeStyles.content}>
                    <h1 style={welcomeStyles.title}>Panel de control</h1>
                    <p style={welcomeStyles.desc}>
                        Gestione y supervise las bases de datos documentales del sistema DatCorr.
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={welcomeStyles.badge}>
                        <span style={welcomeStyles.badgeText}>v7.0</span>
                    </div>
                </div>
            </div>

            {/* ── KPI Metrics ── */}
            <div style={kpiStyles.row}>
                <KpiCard
                    icon="B"
                    iconBg="#eff6ff"
                    iconColor="#0284c7"
                    label="Bases activas"
                    value={stats.total_bases}
                    sub="Total de Organismos"
                    details={stats.bases?.slice(0, 3).map((b) => ({
                        label: b.nombre.replace(/_/g, " "),
                        value: b.registros.toLocaleString(),
                    }))}
                />
                <KpiCard
                    icon="R"
                    iconBg="#f0fdf4"
                    iconColor="#16a34a"
                    label="Registros totales"
                    value={stats.total_registros.toLocaleString()}
                    sub="Suma de todas las bases"
                    details={[
                        { label: "DATCORR", value: (stats.total_datcorr || 0).toLocaleString() },
                        { label: "VERIFICADO", value: (stats.total_verificado || 0).toLocaleString() },
                        { label: "Bases activas", value: stats.total_bases },
                    ]}
                />
                <KpiCard
                    icon="U"
                    iconBg="#faf5ff"
                    iconColor="#9333ea"
                    label="Usuarios activos"
                    value={stats.usuarios_activos}
                    sub={`De ${stats.total_usuarios} registrados`}
                    details={[
                        { label: "Registrados", value: stats.total_usuarios },
                        { label: "Activos", value: stats.usuarios_activos },
                        { label: "Inactivos", value: (stats.total_usuarios - stats.usuarios_activos) },
                    ]}
                />
                {!perms.isConsulta && <KpiCard
                    icon="+"
                    iconBg="#fef2f2"
                    iconColor="#dc2626"
                    label="Altas pendientes"
                    value={stats.altas_pendientes}
                    sub="Solicitudes de registro"
                    details={[
                        { label: "Pendientes", value: stats.altas_pendientes },
                    ]}
                    onClick={() => navigate("/altas-pendientes")}
                />}
                <KpiCard
                    icon="A"
                    iconBg="#fff7ed"
                    iconColor="#ea580c"
                    label="Actividad reciente"
                    value={stats.actividad.length}
                    sub="Últimas acciones"
                    details={stats.actividad.slice(0, 3).map((a) => ({
                        label: formatAction(a),
                        value: formatDate(a.fecha),
                    }))}
                />
            </div>

            {/* ── Bottom: Bases table + Timeline ── */}
            <div style={bottomStyles.row}>
                <div style={bottomStyles.left}>
                    <div style={cardStyles.card}>
                        <h2 style={sectionTitle}>Registros por base</h2>
                        <div style={tableStyles.container}>
                            <table style={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={thStyles}>Base</th>
                                        <th style={tableStyles.thRight}>Registros</th>
                                        <th style={tableStyles.thRight}>DATCORR</th>
                                        <th style={tableStyles.thRight}>VERIFICADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.bases.map((b) => (
                                        <tr key={b.nombre} style={tableStyles.tr}>
                                            <td style={tdStyles}>{b.nombre.replace(/_/g, " ")}</td>
                                            <td style={tableStyles.tdValue}>
                                                {b.registros.toLocaleString()}
                                            </td>
                                            <td style={tableStyles.tdDatcorr}>
                                                {(b.datcorr || 0).toLocaleString()}
                                            </td>
                                            <td style={tableStyles.tdVerificado}>
                                                {(b.verificado || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={tableStyles.tfootTr}>
                                        <td style={tableStyles.tfootTdLabel}>TOTAL</td>
                                        <td style={tableStyles.tfootTdValue}>
                                            {stats.total_registros.toLocaleString()}
                                        </td>
                                        <td style={tableStyles.tfootTdDatcorr}>
                                            {(stats.total_datcorr || 0).toLocaleString()}
                                        </td>
                                        <td style={tableStyles.tfootTdVerificado}>
                                            {(stats.total_verificado || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {!perms.isConsulta && <div style={bottomStyles.right}>
                    <div style={cardStyles.card}>
                        <h2 style={sectionTitle}>Actividad reciente</h2>
                        <div style={{ marginTop: 8 }}>
                            {stats.actividad.length === 0 && (
                                <p style={{ fontSize: 13, color: "#6b7280" }}>Sin actividad registrada</p>
                            )}
                            {stats.actividad.map((item, i) => (
                                <div key={i} style={tlStyles.row}>
                                    <div style={tlStyles.iconCol}>
                                        <div style={{
                                            ...tlStyles.icon,
                                            background: actionColor(item.accion),
                                        }}>
                                            {actionIcon(item.accion)}
                                        </div>
                                        {i < stats.actividad.length - 1 && <div style={tlStyles.line} />}
                                    </div>
                                    <div style={tlStyles.textCol}>
                                        <div style={tlStyles.label}>{formatAction(item)}</div>
                                        <div style={tlStyles.time}>
                                            {item.usuario} &middot; {formatDate(item.fecha)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    );
}

/* ── Helpers ── */

function actionColor(accion) {
    const map = {
        LOGIN_SUCCESS: "#16a34a",
        LOGIN_FAILED: "#dc2626",
        LOGOUT_SUCCESS: "#64748b",
        LOGOUT_FAILED: "#dc2626",
        CREATE: "#0284c7",
        UPDATE: "#ea580c",
        DELETE_LOGICO: "#dc2626",
        TOKEN_REUSE_DETECTED: "#9333ea",
        TOKEN_REVOKED_GLOBAL: "#9333ea",
    };
    return map[accion] || "#64748b";
}

function actionIcon(accion) {
    const map = {
        LOGIN_SUCCESS: "✓",
        LOGIN_FAILED: "✗",
        LOGOUT_SUCCESS: "◀",
        CREATE: "+",
        UPDATE: "~",
        DELETE_LOGICO: "×",
    };
    return map[accion] || "●";
}

function formatAction(item) {
    const labels = {
        LOGIN_SUCCESS: "Inicio de sesion",
        LOGIN_FAILED: "Inicio fallido",
        LOGOUT_SUCCESS: "Cierre de sesion",
        LOGOUT_FAILED: "Cierre fallido",
        CREATE: "Creacion",
        UPDATE: "Actualizacion",
        DELETE_LOGICO: "Eliminacion logica",
        TOKEN_REUSE_DETECTED: "Reuso de token detectado",
        TOKEN_REVOKED_GLOBAL: "Token revocado globalmente",
    };
    const label = labels[item.accion] || item.accion;
    return item.detalle || label;
}

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Hace ${diffHr} h`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

/* ── KPI Card ── */

function KpiCard({ icon, iconBg, iconColor, label, value, sub, details, onClick }) {
    const [showDetails, setShowDetails] = useState(false);
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                ...kpiStyles.card,
                ...(onClick ? kpiStyles.cardClickable : {}),
                ...(hovered && onClick ? kpiStyles.cardHovered : {}),
            }}
            onMouseEnter={() => { setShowDetails(true); setHovered(true); }}
            onMouseLeave={() => { setShowDetails(false); setHovered(false); }}
            onClick={onClick}
        >
            <div style={{ ...kpiStyles.iconWrap, background: iconBg }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: iconColor }}>{icon}</span>
            </div>
            <div style={{ flex: 1 }}>
                <div style={kpiStyles.label}>{label}</div>
                <div style={kpiStyles.value}>{value}</div>
                <div style={kpiStyles.sub}>{sub}</div>
                {showDetails && details && (
                    <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 6 }}>
                        {details.map((d, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 12,
                                color: "#64748b",
                                padding: "2px 0",
                            }}>
                                <span>{d.label}</span>
                                <span style={{ fontWeight: 600 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Definición Unificada de Estilos ──
const dashboardStyles = {
    wrapper: {
        fontFamily: "'Open Sans', system-ui, sans-serif",
        boxSizing: "border-box"
    }
};

const welcomeStyles = {
    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#ffffff",
        borderRadius: "8px",
        padding: "20px 24px",
        marginBottom: "24px",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    title: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    },
    desc: {
        fontSize: "14px",
        color: "#6b7280",
        margin: "4px 0 0 0",
    },
    badge: {
        background: "#e2e8f0",
        padding: "4px 10px",
        borderRadius: "4px",
    },
    badgeText: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748b",
    }
};

const kpiStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
    },
    card: {
        background: "#ffffff",
        borderRadius: "8px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        position: "relative",
        transition: "box-shadow 0.15s, transform 0.15s",
    },
    cardClickable: {
        cursor: "pointer",
    },
    cardHovered: {
        boxShadow: "0 4px 12px rgba(15,23,42,0.1)",
        transform: "translateY(-1px)",
    },
    iconWrap: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "8px",
    },
    label: { fontSize: "13px", color: "#6b7280", fontWeight: "500" },
    value: { fontSize: "24px", fontWeight: "700", color: "#111827", lineHeight: 1.2 },
    sub: { fontSize: "12px", color: "#6b7280", marginTop: "2px" }
};

const bottomStyles = {
    row: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    left: { minWidth: 0 },
    right: { minWidth: 0 }
};

const cardStyles = {
    card: {
        background: "#ffffff",
        borderRadius: "8px",
        padding: "20px 24px",
    }
};

const sectionTitle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px 0",
};

const thStyles = {
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left"
};
const tdStyles = {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#111827",
    borderBottom: "1px solid #e2e8f0"
};
const tableStyles = {
    container: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    tr: {},
    thRight: { ...thStyles, textAlign: "right" },
    tdValue: { ...tdStyles, textAlign: "right", fontWeight: "600" },
    tdDatcorr: { ...tdStyles, textAlign: "right", color: "#0284c7", fontWeight: "500" },
    tdVerificado: { ...tdStyles, textAlign: "right", color: "#16a34a", fontWeight: "500" },
    tfootTr: { background: "#f8fafc" },
    tfootTdLabel: { ...tdStyles, fontWeight: "700", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdValue: { ...tdStyles, fontWeight: "700", textAlign: "right", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdDatcorr: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "#0284c7", borderTop: "2px solid #e2e8f0", borderBottom: "none" },
    tfootTdVerificado: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "#16a34a", borderTop: "2px solid #e2e8f0", borderBottom: "none" }
};
const tlStyles = {
    row: { display: "flex", gap: "12px" },
    iconCol: { display: "flex", flexDirection: "column", alignItems: "center" },
    icon: { width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#ffffff", fontWeight: "bold", borderRadius: "50%" },
    line: { width: "1px", background: "#e2e8f0", flexGrow: 1, margin: "2px 0" },
    textCol: { paddingBottom: "16px" },
    label: { fontSize: "13px", fontWeight: "500", color: "#111827" },
    time: { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
};
const loadingStyles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f4f6" },
    text: { marginTop: 12, color: "#6b7280", fontSize: 14 },
};

const errorStyles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f4f6", padding: "24px" },
    card: { background: "#ffffff", borderRadius: "16px", padding: "32px", textAlign: "center", maxWidth: "400px" },
    title: { fontSize: "18px", fontWeight: "600", color: "#111827", margin: "16px 0 8px 0" },
    desc: { fontSize: "14px", color: "#6b7280", margin: "0 0 24px 0" },
    button: { background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
};
