from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.conexion import get_db
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.services.notificaciones_service import (
    listar_pendientes,
    marcar_leida,
)

router = APIRouter(
    prefix="/api/notificaciones",
    tags=["Notificaciones"],
)


@router.get("/pendientes")
def api_pendientes(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    notificaciones = listar_pendientes(db, usuario.id)
    return {"notificaciones": [
        {
            "id": n.id,
            "tipo": n.tipo,
            "solicitud_id": n.solicitud_id,
            "mensaje": n.mensaje,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notificaciones
    ]}


@router.put("/{notificacion_id}/leer")
def api_marcar_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    n = marcar_leida(db, notificacion_id, usuario.id)
    if not n:
        raise HTTPException(404, "Notificación no encontrada")
    return {"mensaje": "Notificación marcada como leída"}
