import asyncio
import logging
from sqlalchemy.orm import Session
from datetime import datetime

from database.modelos_simco import Solicitud, Respuesta
from backend.schemas.simco_schema import SolicitudCreate, RespuestaCreate
from backend.ws.simco_manager import manager
from backend.services.notificaciones_service import (
    crear_notificaciones_nueva_solicitud,
    crear_notificaciones_respuesta,
)

logger = logging.getLogger("datcorr")


def _safe_create_task(coro):
    """Crea una tarea asyncio si hay un event loop corriendo, o la ignora."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)
    except RuntimeError:
        logger.warning("No hay event loop, omitiendo notificación WebSocket")


def generar_codigo(db: Session) -> str:
    ultimo = db.query(Solicitud).order_by(Solicitud.id.desc()).first()
    nro = (ultimo.id + 1) if ultimo else 1
    return f"SOL-{datetime.now().strftime('%Y%m%d')}-{nro:04d}"


def listar_solicitudes(db: Session):
    solicitudes = db.query(Solicitud).order_by(Solicitud.fecha_creacion.desc()).all()
    resultado = []
    for sol in solicitudes:
        resp = db.query(Respuesta).filter(Respuesta.solicitud_id == sol.id).first()
        sol_dict = {
            "id": sol.id,
            "codigo": sol.codigo,
            "tipo_documento": sol.tipo_documento,
            "identificador_documento": sol.identificador_documento,
            "detalle": sol.detalle,
            "estado": sol.estado,
            "prioridad": sol.prioridad,
            "destacado": sol.destacado,
            "verificado": sol.verificado,
            "creado_por": sol.creado_por,
            "creado_por_usuario_id": sol.creado_por_usuario_id,
            "fecha_creacion": sol.fecha_creacion,
            "respuesta": {
                "id": resp.id,
                "solicitud_id": resp.solicitud_id,
                "estado_documento": resp.estado_documento,
                "observacion": resp.observacion,
                "usuario_responde": resp.usuario_responde,
                "usuario_responde_id": resp.usuario_responde_id,
                "fecha_respuesta": resp.fecha_respuesta,
            } if resp else None,
        }
        resultado.append(sol_dict)
    return resultado


def crear_solicitud(db: Session, data: SolicitudCreate, usuario):
    codigo = generar_codigo(db)
    sol = Solicitud(
        codigo=codigo,
        tipo_documento=data.tipo_documento,
        identificador_documento=data.identificador_documento,
        detalle=data.detalle,
        estado="pendiente",
        creado_por_usuario_id=usuario.id,
        creado_por=usuario.usuario,
    )
    db.add(sol)
    db.commit()
    db.refresh(sol)
    crear_notificaciones_nueva_solicitud(db, sol, usuario.id)
    _safe_create_task(manager.notify_nueva_solicitud(sol.codigo, sol.creado_por or "—"))
    return sol


def listar_pendientes(db: Session):
    return db.query(Solicitud).filter(
        Solicitud.estado == "pendiente"
    ).order_by(Solicitud.fecha_creacion.asc()).all()


def responder_solicitud(db: Session, data: RespuestaCreate, usuario):
    sol = db.query(Solicitud).filter(Solicitud.id == data.solicitud_id).first()
    if not sol:
        raise ValueError("Solicitud no encontrada")
    if sol.estado != "pendiente":
        raise ValueError("La solicitud ya fue respondida")

    resp = Respuesta(
        solicitud_id=data.solicitud_id,
        estado_documento=data.estado_documento,
        observacion=data.observacion,
        usuario_responde_id=usuario.id,
        usuario_responde=usuario.usuario,
    )
    sol.estado = "respondida"
    db.add(resp)
    db.commit()
    db.refresh(resp)
    crear_notificaciones_respuesta(db, sol)
    _safe_create_task(manager.notify_solicitud_respondida(sol.codigo))
    return resp
