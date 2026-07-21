import asyncio
import logging
from sqlalchemy.orm import Session
from datetime import datetime, date

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


def dashboard_hoy(db: Session):
    hoy = date.today()
    solicitudes_hoy = db.query(Solicitud).filter(
        Solicitud.fecha_creacion >= hoy
    ).order_by(Solicitud.fecha_creacion.desc()).all()

    respuestas_hoy = db.query(Respuesta).filter(
        Respuesta.fecha_respuesta >= hoy
    ).order_by(Respuesta.fecha_respuesta.desc()).all()

    solicitudes_data = []
    for s in solicitudes_hoy:
        r = db.query(Respuesta).filter(Respuesta.solicitud_id == s.id).first()
        solicitudes_data.append({
            "id": s.id, "codigo": s.codigo, "tipo_documento": s.tipo_documento,
            "identificador_documento": s.identificador_documento, "detalle": s.detalle,
            "estado": s.estado, "creado_por": s.creado_por,
            "fecha_creacion": s.fecha_creacion.isoformat() if s.fecha_creacion else None,
            "respuesta": {
                "id": r.id, "estado_documento": r.estado_documento,
                "usuario_responde": r.usuario_responde,
                "fecha_respuesta": r.fecha_respuesta.isoformat() if r.fecha_respuesta else None,
            } if r else None,
        })

    respuestas_data = []
    for r in respuestas_hoy:
        s = db.query(Solicitud).filter(Solicitud.id == r.solicitud_id).first()
        respuestas_data.append({
            "id": r.id, "solicitud_id": r.solicitud_id,
            "codigo": s.codigo if s else "—",
            "estado_documento": r.estado_documento,
            "observacion": r.observacion,
            "usuario_responde": r.usuario_responde,
            "fecha_respuesta": r.fecha_respuesta.isoformat() if r.fecha_respuesta else None,
        })

    return {
        "resumen": {
            "solicitudes_hoy": len(solicitudes_hoy),
            "respuestas_hoy": len(respuestas_hoy),
        },
        "actividad": {
            "solicitudes": solicitudes_data,
            "respuestas": respuestas_data,
        },
    }


def listar_pendientes(db: Session):
    return db.query(Solicitud).filter(
        Solicitud.estado == "pendiente"
    ).order_by(Solicitud.fecha_creacion.asc()).all()


def buscar(db: Session, q: str):
    term = "%{}%".format(q)
    solicitudes = db.query(Solicitud).filter(
        Solicitud.codigo.ilike(term) |
        Solicitud.tipo_documento.ilike(term) |
        Solicitud.identificador_documento.ilike(term) |
        Solicitud.detalle.ilike(term)
    ).order_by(Solicitud.fecha_creacion.desc()).all()

    respuestas = db.query(Respuesta).join(
        Solicitud, Respuesta.solicitud_id == Solicitud.id
    ).filter(
        Respuesta.observacion.ilike(term) |
        Respuesta.estado_documento.ilike(term)
    ).order_by(Respuesta.fecha_respuesta.desc()).all()

    sol_list = []
    for sol in solicitudes:
        resp = db.query(Respuesta).filter(Respuesta.solicitud_id == sol.id).first()
        sol_list.append({
            "id": sol.id,
            "codigo": sol.codigo,
            "tipo_documento": sol.tipo_documento,
            "identificador_documento": sol.identificador_documento,
            "detalle": sol.detalle,
            "estado": sol.estado,
            "creado_por": sol.creado_por,
            "fecha_creacion": sol.fecha_creacion.isoformat() if sol.fecha_creacion else None,
            "respuesta": {
                "id": resp.id,
                "estado_documento": resp.estado_documento,
                "observacion": resp.observacion,
                "usuario_responde": resp.usuario_responde,
                "fecha_respuesta": resp.fecha_respuesta.isoformat() if resp.fecha_respuesta else None,
            } if resp else None,
        })

    resp_list = []
    for r in respuestas:
        sol = db.query(Solicitud).filter(Solicitud.id == r.solicitud_id).first()
        resp_list.append({
            "id": r.id,
            "solicitud_id": r.solicitud_id,
            "codigo": sol.codigo if sol else "—",
            "tipo_documento": sol.tipo_documento if sol else "—",
            "identificador_documento": sol.identificador_documento if sol else "—",
            "estado_documento": r.estado_documento,
            "observacion": r.observacion,
            "usuario_responde": r.usuario_responde,
            "fecha_respuesta": r.fecha_respuesta.isoformat() if r.fecha_respuesta else None,
        })

    return {"solicitudes": sol_list, "respuestas": resp_list}


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
