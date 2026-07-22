import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { usePermissions } from "../auth/usePermissions";
import api from "../api/axiosClient";
import { getDashboardStats } from "../services/dashboardService";

export default function Dashboard() {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const perms = usePermissions();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(console.error);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        }
        logout();
        navigate("/");
    };

    if (!stats) {
        return (
            <div style={loadingStyles.container}>
                <div style={loadingStyles.spinner} />
                <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Cargando panel...</p>
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
                        <span style={welcomeStyles.badgeText}>v5.1.1</span>
                    </div>
                    <button onClick={handleLogout} style={logoutBtnStyles}>
                        Cerrar sesion
                    </button>
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
                                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sin actividad registrada</p>
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

function KpiCard({ icon, iconBg, iconColor, label, value, sub, details }) {
    const [over, setOver] = useState(false);
    return (
        <div
            style={kpiStyles.card}
            onMouseEnter={() => setOver(true)}
            onMouseLeave={() => setOver(false)}
        >
            <div style={{ ...kpiStyles.iconWrap, background: iconBg }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: iconColor }}>{icon}</span>
            </div>
            <div>
                <div style={kpiStyles.label}>{label}</div>
                <div style={kpiStyles.value}>{value}</div>
                <div style={kpiStyles.sub}>{sub}</div>
            </div>
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(37,99,235,0.92) 0%, rgba(37,99,235,0.97) 100%)",
                color: "#000000",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "6px",
                transform: over ? "translateY(0)" : "translateY(101%)",
                opacity: over ? 1 : 0,
                transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
                pointerEvents: over ? "auto" : "none",
            }}>
                {details?.map((d, i) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                        lineHeight: 1.4,
                        borderBottom: i < details.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                        paddingBottom: i < details.length - 1 ? "6px" : 0,
                    }}>
                        <span style={{ opacity: 0.9 }}>{d.label}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Definición Unificada de Estilos ──
const dashboardStyles = {
    wrapper: {
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "Inter, system-ui, sans-serif",
        boxSizing: "border-box"
    }
};

const welcomeStyles = {
    card: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "var(--bg-card)",
        padding: "24px 32px",
        borderRadius: "12px",
        border: `1px solid ${"var(--border)"}`,
        marginBottom: "24px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    title: {
        fontSize: "26px",
        fontWeight: "700",
        color: "var(--text-main)",
        margin: 0,
        letterSpacing: "-0.02em"
    },
    desc: {
        fontSize: "14px",
        color: "var(--text-muted)",
        margin: 0
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    badge: {
        backgroundColor: "#f1f5f9",
        padding: "6px 12px",
        borderRadius: "6px",
        border: `1px solid ${"var(--border)"}`
    },
    badgeText: {
        fontSize: "12px",
        fontWeight: "600",
        color: "var(--text-muted)",
        fontFamily: "monospace"
    }
};

const logoutBtnStyles = {
    backgroundColor: "var(--danger)",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background-color 0.15s ease"
};

const kpiStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
    },
    card: {
        backgroundColor: "var(--bg-card)",
        borderRadius: "12px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        border: `1px solid ${"var(--border)"}`,
        position: "relative",
        overflow: "hidden",
    },
    iconWrap: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },
    label: { fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" },
    value: { fontSize: "26px", fontWeight: "700", color: "var(--text-main)", lineHeight: 1.2 },
    sub: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }
};

const bottomStyles = {
    row: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: "24px",
        alignItems: "start"
    },
    left: { minWidth: 0 },
    right: { minWidth: 0 }
};

const cardStyles = {
    card: {
        backgroundColor: "var(--bg-card)",
        padding: "28px",
        borderRadius: "12px",
        border: `1px solid ${"var(--border)"}`,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
    }
};

const sectionTitle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-main)",
    margin: "0 0 20px 0",
    letterSpacing: "-0.01em"
};

const thStyles = {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: `1px solid ${"var(--border)"}`,
    textAlign: "left"
};
const tdStyles = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "var(--text-main)",
    borderBottom: `1px solid ${"var(--border)"}`
};
const tableStyles = {
    container: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    tr: { transition: "background-color 0.15s ease" },
    thRight: { ...thStyles, textAlign: "right" },
    tdValue: { ...tdStyles, textAlign: "right", fontWeight: "600" },
    tdDatcorr: { ...tdStyles, textAlign: "right", color: "var(--primary)", fontWeight: "500" },
    tdVerificado: { ...tdStyles, textAlign: "right", color: "var(--success)", fontWeight: "500" },
    tfootTr: { backgroundColor: "#fafafa" },
    tfootTdLabel: { ...tdStyles, fontWeight: "700", borderTop: `2px solid ${"var(--border)"}`, borderBottom: "none" },
    tfootTdValue: { ...tdStyles, fontWeight: "700", textAlign: "right", borderTop: `2px solid ${"var(--border)"}`, borderBottom: "none" },
    tfootTdDatcorr: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "var(--primary)", borderTop: `2px solid ${"var(--border)"}`, borderBottom: "none" },
    tfootTdVerificado: { ...tdStyles, fontWeight: "700", textAlign: "right", color: "var(--success)", borderTop: `2px solid ${"var(--border)"}`, borderBottom: "none" }
};
const tlStyles = {
    container: { marginTop: "12px", display: "flex", flexDirection: "column" },
    emptyText: { fontSize: "13px", color: "var(--text-muted)", margin: 0 },
    row: { display: "flex", gap: "16px" },
    iconCol: { display: "flex", flexDirection: "column", alignItems: "center" },
    icon: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#ffffff", fontWeight: "bold", zIndex: 2 },
    line: { width: "2px", backgroundColor: "var(--border)", flexGrow: 1, marginTop: "4px", marginBottom: "4px" },
    textCol: { paddingBottom: "20px", display: "flex", flexDirection: "column", gap: "4px" },
    label: { fontSize: "14px", fontWeight: "500", color: "var(--text-main)" },
    time: { fontSize: "12px", color: "var(--text-muted)" }
};
const loadingStyles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-page)" },
    spinner: { width: "32px", height: "32px", border: `3px solid ${"var(--border)"}`, borderTop: `3px solid ${"var(--primary)"}`, borderRadius: "50%", animation: "spin 1s linear infinite" },
    text: { marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }
};
