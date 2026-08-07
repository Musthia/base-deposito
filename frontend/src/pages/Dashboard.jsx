import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePermissions } from "../auth/usePermissions";
import { getDashboardStats } from "../services/dashboardService";

import { Card, SectionTitle, KpiCard, TimelineItem, ProgressBar, LoadingState, ErrorState } from "../components/ui";

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

    const reload = () => { setError(null); setStats(null); getDashboardStats().then(setStats).catch((err) => setError(err?.message || "Error")); };

    if (error) {
        return <ErrorState title="Error al cargar el panel" description={error} onRetry={reload} />;
    }

    if (!stats) {
        return <LoadingState text="Cargando panel..." />;
    }

    return (
        <div style={{ fontFamily: "var(--font-family)", boxSizing: "border-box" }}>
            {/* ── Welcome / Header de página ── */}
            <Card style={{ margin: "0 0 var(--space-6)", padding: "var(--space-5) var(--space-6)", borderBottom: "2px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--text-main)" }}>Centro de Gestión</h1>
                        <p style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                            Gestione y supervise las bases de datos documentales del sistema DatCorr.
                        </p>
                    </div>
                    <span style={{ background: "var(--bg-muted)", padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>v8.1</span>
                </div>
            </Card>

            {/* ── KPI Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", margin: "0 0 var(--space-6)" }}>
                {!perms.isConsulta && (
                    <KpiCard
                        icon="⚠"
                        iconColor="var(--danger)"
                        iconBg="var(--danger-light)"
                        label="Altas pendientes"
                        value={stats.altas_pendientes}
                        sub="Solicitudes de registro"
                        details={[{ label: "Pendientes", value: stats.altas_pendientes }]}
                        critical={stats.altas_pendientes > 0}
                        onClick={() => navigate("/altas-pendientes")}
                    />
                )}

                <KpiCard
                    icon="R"
                    iconColor="var(--info)"
                    iconBg="var(--info-light)"
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
                    iconColor="var(--warning)"
                    iconBg="var(--warning-light)"
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
                    icon="B"
                    iconColor="var(--success)"
                    iconBg="var(--success-light)"
                    label="Bases activas"
                    value={stats.total_bases}
                    sub="Total de Organismos"
                    details={stats.bases?.slice(0, 3).map((b) => ({
                        label: b.nombre.replace(/_/g, " "),
                        value: b.registros.toLocaleString(),
                    }))}
                />

                <KpiCard
                    icon="A"
                    iconColor="var(--primary)"
                    iconBg="var(--primary-light)"
                    label="Actividad reciente"
                    value={stats.actividad.length}
                    sub="Últimas acciones"
                    details={stats.actividad.slice(0, 3).map((a) => ({
                        label: formatAction(a),
                        value: formatDate(a.fecha),
                    }))}
                />
            </div>

            {/* ── Bottom: Tabla + Timeline ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <Card style={{ overflow: "hidden" }}>
                    <SectionTitle
                        action={<span style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs)" }}>Ver más →</span>}
                    >
                        Registros por base
                    </SectionTitle>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", captionSide: "top" }}>
                            <caption style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "left", padding: "0 0 var(--space-2)" }}>
                                Registros por cada base y su progreso de verificación.
                            </caption>
                            <thead>
                                <tr style={{ background: "var(--bg-muted)" }}>
                                    <th style={thLeft}>Base</th>
                                    <th style={thRight}>Registros</th>
                                    <th style={thRight}>DATCORR</th>
                                    <th style={thRight}>VERIFICADO</th>
                                    <th style={{ ...thRight, minWidth: 140 }}>% Progreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.bases.map((b) => (
                                    <tr key={b.nombre} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td style={td}>{b.nombre.replace(/_/g, " ")}</td>
                                        <td className="num" style={{ ...td, textAlign: "right", fontWeight: "var(--weight-semibold)" }}>
                                            {b.registros.toLocaleString()}
                                        </td>
                                        <td style={{ ...td, textAlign: "right", color: "var(--accent-datcorr)" }}>
                                            {(b.datcorr || 0).toLocaleString()}
                                        </td>
                                        <td style={{ ...td, textAlign: "right", color: "var(--accent-verificado)" }}>
                                            {(b.verificado || 0).toLocaleString()}
                                        </td>
                                        <td style={{ ...td, background: "var(--success-light)" }}>
                                            <ProgressBar value={b.verificado || 0} max={b.registros || 1} tone="success" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "var(--bg-muted)", borderTop: "2px solid var(--border)" }}>
                                    <td style={{ ...td, fontWeight: "var(--weight-bold)" }}>TOTAL</td>
                                    <td style={{ ...td, textAlign: "right", fontWeight: "var(--weight-bold)" }}>{stats.total_registros.toLocaleString()}</td>
                                    <td className="num" style={{ ...td, textAlign: "right", fontWeight: "var(--weight-bold)", color: "var(--accent-datcorr)" }}>{(stats.total_datcorr || 0).toLocaleString()}</td>
                                    <td className="num" style={{ ...td, textAlign: "right", fontWeight: "var(--weight-bold)", color: "var(--accent-verificado)" }}>{(stats.total_verificado || 0).toLocaleString()}</td>
                                    <td style={td}><ProgressBar value={stats.total_verificado || 0} max={stats.total_registros || 1} tone="success" /></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>

                {!perms.isConsulta && (
                    <Card>
                        <SectionTitle
                            action={<span style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-xs)" }}>Ver todo →</span>}
                        >
                            Actividad reciente
                        </SectionTitle>
                        <div>
                            {stats.actividad.length === 0 && (
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Sin actividad registrada</p>
                            )}
                            {stats.actividad.slice(0, 8).map((item, i) => (
                                <TimelineItem
                                    key={i}
                                    tone={actionTone(item.accion)}
                                    icon={actionIcon(item.accion)}
                                    label={formatAction(item)}
                                    meta={`${item.usuario} · ${formatDate(item.fecha)}`}
                                    style={{ borderBottom: i < Math.min(stats.actividad.length, 8) - 1 ? "1px solid var(--border-subtle)" : "none" }}
                                />
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

/* ── Helpers ── */

function actionTone(accion) {
    const map = {
        LOGIN_SUCCESS: "success",
        LOGIN_FAILED: "danger",
        LOGOUT_SUCCESS: "neutral",
        LOGOUT_FAILED: "danger",
        CREATE: "info",
        UPDATE: "warning",
        DELETE_LOGICO: "danger",
        TOKEN_REUSE_DETECTED: "warning",
        TOKEN_REVOKED_GLOBAL: "warning",
    };
    return map[accion] || "neutral";
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
        LOGIN_SUCCESS: "Inicio de sesión",
        LOGIN_FAILED: "Inicio fallido",
        LOGOUT_SUCCESS: "Cierre de sesión",
        LOGOUT_FAILED: "Cierre fallido",
        CREATE: "Creación",
        UPDATE: "Actualización",
        DELETE_LOGICO: "Eliminación lógica",
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
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Hace ${diffHr} h`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

/* ── Estilos de tabla ── */
const thLeft = {
    padding: "var(--space-3) var(--space-4)",
    fontSize: "var(--text-xs)",
    fontWeight: "var(--weight-semibold)",
    color: "var(--text-muted)",
    textAlign: "left",
    borderBottom: "2px solid var(--border)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};
const thRight = {
    ...thLeft,
    textAlign: "right",
};
const td = {
    padding: "var(--space-3) var(--space-4)",
    fontSize: "var(--text-base)",
    color: "var(--text-main)",
    borderBottom: "1px solid var(--border-subtle)",
    minWidth: 60,
};