from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database.conexion import get_db
from backend.core.permisos import verificar_nivel
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.schemas.simco_schema import SolicitudCreate, RespuestaCreate
from backend.services.simco_service import (
    listar_solicitudes,
    crear_solicitud,
    listar_pendientes,
    responder_solicitud,
    dashboard_hoy,
    buscar,
    agregar_archivo_solicitud,
    agregar_archivo_respuesta,
    eliminar_archivo_solicitud,
    eliminar_archivo_respuesta,
)
from backend.services.auditoria_service import registrar_auditoria
from backend.services.archivo_helper import obtener_ruta_archivo, extraer_nombre_original

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
    verificar_nivel(usuario, 3, accion="CREAR_SOLICITUD_SIMCO")
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
    verificar_nivel(usuario, 5, accion="RESPONDER_SOLICITUD_SIMCO")
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


@router.post("/solicitudes/{solicitud_id}/archivo")
def api_subir_archivo_solicitud(
    solicitud_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    try:
        sol = agregar_archivo_solicitud(db, solicitud_id, archivo)
        registrar_auditoria(
            db=db, usuario=usuario.usuario, accion="SUBIR_ARCHIVO",
            tabla="simco.solicitudes", registro_id=solicitud_id,
            detalle="Subió archivo a solicitud {}".format(sol.codigo),
        )
        return {"mensaje": "Archivo subido", "archivo_nombre": sol.archivo_nombre}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/solicitudes/{solicitud_id}/archivo")
def api_descargar_archivo_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    from database.modelos_simco import Solicitud
    sol = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not sol or not sol.archivo_nombre:
        raise HTTPException(404, "Archivo no encontrado")
    ruta = obtener_ruta_archivo(sol.archivo_nombre)
    nombre_original = extraer_nombre_original(sol.archivo_nombre)
    return FileResponse(ruta, filename=nombre_original)


@router.delete("/solicitudes/{solicitud_id}/archivo")
def api_eliminar_archivo_solicitud(
    solicitud_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    try:
        eliminar_archivo_solicitud(db, solicitud_id)
        registrar_auditoria(
            db=db, usuario=usuario.usuario, accion="ELIMINAR_ARCHIVO",
            tabla="simco.solicitudes", registro_id=solicitud_id,
            detalle="Eliminó archivo de solicitud",
        )
        return {"mensaje": "Archivo eliminado"}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/respuestas/{respuesta_id}/archivo")
def api_subir_archivo_respuesta(
    respuesta_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    try:
        resp = agregar_archivo_respuesta(db, respuesta_id, archivo)
        registrar_auditoria(
            db=db, usuario=usuario.usuario, accion="SUBIR_ARCHIVO",
            tabla="simco.respuestas", registro_id=respuesta_id,
            detalle="Subió archivo a respuesta",
        )
        return {"mensaje": "Archivo subido", "archivo_nombre": resp.archivo_nombre}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/respuestas/{respuesta_id}/archivo")
def api_descargar_archivo_respuesta(
    respuesta_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    from database.modelos_simco import Respuesta
    resp = db.query(Respuesta).filter(Respuesta.id == respuesta_id).first()
    if not resp or not resp.archivo_nombre:
        raise HTTPException(404, "Archivo no encontrado")
    ruta = obtener_ruta_archivo(resp.archivo_nombre)
    nombre_original = extraer_nombre_original(resp.archivo_nombre)
    return FileResponse(ruta, filename=nombre_original)


@router.delete("/respuestas/{respuesta_id}/archivo")
def api_eliminar_archivo_respuesta(
    respuesta_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    try:
        eliminar_archivo_respuesta(db, respuesta_id)
        registrar_auditoria(
            db=db, usuario=usuario.usuario, accion="ELIMINAR_ARCHIVO",
            tabla="simco.respuestas", registro_id=respuesta_id,
            detalle="Eliminó archivo de respuesta",
        )
        return {"mensaje": "Archivo eliminado"}
    except ValueError as e:
        raise HTTPException(400, str(e))
