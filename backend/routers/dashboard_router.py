import logging
from fastapi import APIRouter
from sqlalchemy import text

from database.conexion import engine as postgres_engine

router = APIRouter(tags=["dashboard"])

SCHEMAS = [
    "ips", "pediatrico", "igpj", "igpj_txt_listado",
    "igpj_listado_nuevo", "maternidad", "escribania",
]


@router.get("/dashboard/stats")
def dashboard_stats():
    with postgres_engine.connect() as conn:
        bases = []
        total = 0
        for s in SCHEMAS:
            result = conn.execute(
                text('SELECT COUNT(*) FROM "{0}"."Datcorr_database"'.format(s))
            )
            count = result.scalar()
            bases.append({"nombre": s, "registros": count})
            total += count

        user_count = conn.execute(
            text("SELECT COUNT(*) FROM public.usuarios WHERE activo = true")
        ).scalar()
        user_total = conn.execute(
            text("SELECT COUNT(*) FROM public.usuarios")
        ).scalar()

        auditoria = conn.execute(
            text("""
                SELECT fecha, usuario, accion, detalle
                FROM public.auditoria
                ORDER BY fecha DESC
                LIMIT 15
            """)
        )
        actividad = [
            {
                "fecha": row[0].isoformat() if hasattr(row[0], "isoformat") else str(row[0]),
                "usuario": row[1],
                "accion": row[2],
                "detalle": row[3],
            }
            for row in auditoria
        ]

    return {
        "bases": bases,
        "total_registros": total,
        "total_bases": len(SCHEMAS),
        "usuarios_activos": user_count or 0,
        "total_usuarios": user_total or 0,
        "actividad": actividad,
    }
