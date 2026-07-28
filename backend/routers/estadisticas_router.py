import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text

from database.conexion import engine as postgres_engine
from backend.security.jwt_bearer import obtener_usuario_actual

logger = logging.getLogger("datcorr")

router = APIRouter(prefix="/api/estadisticas", tags=["Estadisticas"])

SCHEMAS_DATCORR = [
    "ips", "pediatrico", "igpj", "igpj_txt_listado",
    "igpj_listado_nuevo", "maternidad", "escribania",
]


def _periodo_sql(periodo: str, columna: str) -> str:
    if periodo == "semanal":
        return f"date_trunc('week', {columna})::date"
    elif periodo == "anual":
        return f"date_trunc('year', {columna})::date"
    return f"date_trunc('month', {columna})::date"


@router.get("/datcorr")
def estadisticas_datcorr(
    periodo: str = Query("mensual", pattern="^(semanal|mensual|anual)$"),
    usuario=Depends(obtener_usuario_actual),
):

    periodo_sql_aud = _periodo_sql(periodo, "a.fecha")
    periodo_sql_usr = _periodo_sql(periodo, "u.fecha_creacion")

    with postgres_engine.connect() as conn:
        schemas = []
        for s in SCHEMAS_DATCORR:
            result = conn.execute(
                text(
                    'SELECT COUNT(*), '
                    'SUM(CASE WHEN estado = \'DATCORR\' THEN 1 ELSE 0 END), '
                    'SUM(CASE WHEN estado = \'VERIFICADO\' THEN 1 ELSE 0 END) '
                    'FROM "{0}"."Datcorr_database"'.format(s)
                )
            )
            total, datcorr, verificado = result.fetchone()
            schemas.append({
                "nombre": s,
                "total": total or 0,
                "datcorr": datcorr or 0,
                "verificado": verificado or 0,
            })

        rows = conn.execute(
            text(f"""
                SELECT {periodo_sql_aud} AS periodo,
                       COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE a.accion = 'CREATE') AS creaciones,
                       COUNT(*) FILTER (WHERE a.accion = 'UPDATE') AS actualizaciones,
                       COUNT(*) FILTER (WHERE a.accion = 'DELETE') AS eliminaciones,
                       COUNT(*) FILTER (WHERE a.accion IN ('CONSULTA', 'BUSQUEDA')) AS consultas,
                       COUNT(*) FILTER (WHERE a.accion IN ('LOGIN', 'LOGOUT')) AS accesos
                FROM public.auditoria a
                GROUP BY periodo
                ORDER BY periodo
            """)
        )
        movimientos = [
            {
                "periodo": str(row[0]),
                "total": row[1],
                "creaciones": row[2],
                "actualizaciones": row[3],
                "eliminaciones": row[4],
                "consultas": row[5],
                "accesos": row[6],
            }
            for row in rows
        ]

        user_rows = conn.execute(
            text(f"""
                SELECT {periodo_sql_usr} AS periodo, COUNT(*) AS total
                FROM public.usuarios u
                GROUP BY periodo
                ORDER BY periodo
            """)
        )
        usuarios = [{"periodo": str(row[0]), "total": row[1]} for row in user_rows]

    return {
        "schemas": schemas,
        "movimientos": movimientos,
        "usuarios": usuarios,
    }


@router.get("/usuarios-en-linea")
def usuarios_en_linea(usuario=Depends(obtener_usuario_actual)):
    with postgres_engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT DISTINCT u.usuario
                FROM public.refresh_tokens rt
                JOIN public.usuarios u ON u.id = rt.usuario_id
                WHERE rt.revoked = false
                  AND rt.expires_at > NOW()
                  AND rt.last_activity > NOW() - INTERVAL '5 minutes'
                ORDER BY u.usuario
            """)
        )
        usuarios = [row[0] for row in rows]
    return {"cantidad": len(usuarios), "usuarios": usuarios}


@router.get("/simco")
def estadisticas_simco(
    periodo: str = Query("mensual", pattern="^(semanal|mensual|anual)$"),
    usuario=Depends(obtener_usuario_actual),
):
    periodo_sol = _periodo_sql(periodo, "s.fecha_creacion")
    periodo_resp = _periodo_sql(periodo, "r.fecha_respuesta")

    with postgres_engine.connect() as conn:
        solicitudes = conn.execute(
            text(f"""
                SELECT {periodo_sol} AS periodo,
                       COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE s.estado = 'pendiente') AS pendientes,
                       COUNT(*) FILTER (WHERE s.estado = 'respondida') AS respondidas
                FROM simco.solicitudes s
                GROUP BY periodo
                ORDER BY periodo
            """)
        )
        solicitudes_data = [
            {
                "periodo": str(row[0]),
                "total": row[1],
                "pendientes": row[2],
                "respondidas": row[3],
            }
            for row in solicitudes
        ]

        respuestas = conn.execute(
            text(f"""
                SELECT {periodo_resp} AS periodo, COUNT(*) AS total
                FROM simco.respuestas r
                GROUP BY periodo
                ORDER BY periodo
            """)
        )
        respuestas_data = [
            {"periodo": str(row[0]), "total": row[1]}
            for row in respuestas
        ]

        tipos = conn.execute(
            text("""
                SELECT s.tipo_documento, COUNT(*) AS total
                FROM simco.solicitudes s
                GROUP BY s.tipo_documento
                ORDER BY total DESC
            """)
        )
        tipos_data = [{"nombre": row[0], "total": row[1]} for row in tipos]

    return {
        "solicitudes": solicitudes_data,
        "respuestas": respuestas_data,
        "tipos_documento": tipos_data,
    }
