from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.conexion import get_db
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.schemas.simco_schema import SolicitudCreate, RespuestaCreate
from backend.services.simco_service import (
    listar_solicitudes,
    crear_solicitud,
    listar_pendientes,
    responder_solicitud,
    dashboard_hoy,
    buscar,
)
from backend.services.auditoria_service import registrar_auditoria

router = APIRouter(
    prefix="/api/simco",
    tags=["Simco"],
)


@router.get("/dashboard")
def api_dashboard(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    return dashboard_hoy(db)


@router.get("/solicitudes")
def api_listar_solicitudes(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    solicitudes = listar_solicitudes(db)
    registrar_auditoria(
        db=db, usuario=usuario.usuario, accion="CONSULTA",
        tabla="simco.solicitudes",
        detalle="Listó {} solicitudes".format(len(solicitudes)),
    )
    return {"solicitudes": solicitudes}


@router.post("/solicitudes")
def api_crear_solicitud(
    data: SolicitudCreate,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    if usuario.nivel_seguridad < 3:
        raise HTTPException(403, "No tienes permiso para crear solicitudes")
    sol = crear_solicitud(db, data, usuario)
    return {
        "mensaje": "Solicitud creada",
        "solicitud": {
            "id": sol.id,
            "codigo": sol.codigo,
            "tipo_documento": sol.tipo_documento,
            "identificador_documento": sol.identificador_documento,
            "detalle": sol.detalle,
            "estado": sol.estado,
            "fecha_creacion": sol.fecha_creacion.isoformat() if sol.fecha_creacion else None,
        },
    }


@router.get("/respuestas/pendientes")
def api_listar_pendientes(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    solicitudes = listar_pendientes(db)
    registrar_auditoria(
        db=db, usuario=usuario.usuario, accion="CONSULTA",
        tabla="simco.respuestas",
        detalle="Consultó {} solicitudes pendientes".format(len(solicitudes)),
    )
    return {"solicitudes": [
        {
            "id": s.id,
            "codigo": s.codigo,
            "tipo_documento": s.tipo_documento,
            "identificador_documento": s.identificador_documento,
            "detalle": s.detalle,
            "creado_por": s.creado_por,
            "fecha_creacion": s.fecha_creacion.isoformat() if s.fecha_creacion else None,
        }
        for s in solicitudes
    ]}


@router.get("/buscar")
def api_buscar(
    q: str,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    if not q.strip():
        return {"solicitudes": [], "respuestas": []}
    resultados = buscar(db, q.strip())
    registrar_auditoria(
        db=db, usuario=usuario.usuario, accion="BUSCAR",
        tabla="simco",
        detalle="Búsqueda: '{}' - {} solicitudes, {} respuestas".format(
            q.strip(), len(resultados["solicitudes"]), len(resultados["respuestas"])
        ),
    )
    return resultados


@router.post("/respuestas")
def api_responder_solicitud(
    data: RespuestaCreate,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    if usuario.nivel_seguridad < 5:
        raise HTTPException(403, "No tienes permiso para responder solicitudes")
    try:
        resp = responder_solicitud(db, data, usuario)
        return {
            "mensaje": "Respuesta registrada",
            "respuesta": {
                "id": resp.id,
                "solicitud_id": resp.solicitud_id,
                "estado_documento": resp.estado_documento,
                "observacion": resp.observacion,
                "fecha_respuesta": resp.fecha_respuesta.isoformat() if resp.fecha_respuesta else None,
            },
        }
    except ValueError as e:
        raise HTTPException(400, str(e))
