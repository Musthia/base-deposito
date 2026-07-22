from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend.database.conexion import get_db
from backend.schemas.registro_schema import (
    SolicitudRegistroRequest,
    AprobarRequest,
    RechazarRequest,
)
from backend.services.registro_service import (
    solicitar_registro,
    listar_pendientes,
    listar_aprobados_rechazados,
    aprobar_registro,
    rechazar_registro,
)
from backend.core.exceptions import DatcorrException
from backend.security.jwt_bearer import obtener_usuario_actual
from database.modelos import Usuario

router = APIRouter(prefix="/registro", tags=["Registro"])

@router.post("/solicitar", summary="Solicitar registro de nuevo usuario")
def registrar(datos: SolicitudRegistroRequest, db: Session = Depends(get_db)):
    try:
        solicitar_registro(db, datos.model_dump())
        return {"success": True, "mensaje": "Solicitud enviada. Recibira un email cuando sea aprobada."}
    except Exception as e:
        raise DatcorrException(f"Error al procesar solicitud: {str(e)}", 500)

@router.get("/pendientes", summary="Listar solicitudes pendientes (solo admin nivel 10)")
def pendientes(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(obtener_usuario_actual),
):
    if not (admin.es_superusuario or admin.nivel_seguridad >= 10):
        raise DatcorrException("No tiene permisos para ver solicitudes pendientes", 403)
    return {"pendientes": listar_pendientes(db)}

@router.get("/historial", summary="Listar solicitudes aprobadas/rechazadas (solo admin nivel 10)")
def historial(
    db: Session = Depends(get_db),
    admin: Usuario = Depends(obtener_usuario_actual),
):
    if not (admin.es_superusuario or admin.nivel_seguridad >= 10):
        raise DatcorrException("No tiene permisos para ver el historial", 403)
    return {"historial": listar_aprobados_rechazados(db)}

@router.post("/{id}/aprobar", summary="Aprobar solicitud y crear usuario")
def aprobar(
    id: int,
    body: AprobarRequest,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(obtener_usuario_actual),
):
    if not (admin.es_superusuario or admin.nivel_seguridad >= 10):
        raise DatcorrException("No tiene permisos para aprobar solicitudes", 403)
    if aprobar_registro(db, id, admin, body.rol, body.nivel, body.password):
        return {"success": True, "mensaje": "Usuario creado correctamente. Se enviaron las credenciales por email."}
    raise DatcorrException("Solicitud no encontrada o ya procesada", 404)

@router.post("/{id}/rechazar", summary="Rechazar solicitud de registro")
def rechazar(
    id: int,
    body: RechazarRequest,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(obtener_usuario_actual),
):
    if not (admin.es_superusuario or admin.nivel_seguridad >= 10):
        raise DatcorrException("No tiene permisos para rechazar solicitudes", 403)
    if rechazar_registro(db, id, admin, body.motivo):
        return {"success": True, "mensaje": "Solicitud rechazada correctamente."}
    raise DatcorrException("Solicitud no encontrada o ya procesada", 404)
