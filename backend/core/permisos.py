from fastapi import HTTPException
from database.conexion import SessionLocal
from database.modelos_auditoria import Auditoria
import logging

logger = logging.getLogger("datcorr")

def _registrar_acceso_denegado(usuario: str, detalle: str, accion: str = "ACCESO_DENEGADO"):
    try:
        db = SessionLocal()
        auditoria = Auditoria(
            usuario=usuario,
            accion=accion,
            tabla="permisos",
            detalle=detalle,
        )
        db.add(auditoria)
        db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Error al registrar acceso denegado en auditoria: {e}")

def verificar_permiso(usuario, nivel_minimo: int = None, permiso_codigo: str = None, accion: str = "ACCION_NO_AUTORIZADA", db=None):
    usuario_str = usuario.usuario if hasattr(usuario, "usuario") else str(usuario)
    nivel = usuario.nivel_seguridad if hasattr(usuario, "nivel_seguridad") else 0
    es_super = usuario.es_superusuario if hasattr(usuario, "es_superusuario") else False

    if es_super:
        return True

    if nivel_minimo is not None and nivel >= nivel_minimo:
        return True

    if permiso_codigo is not None:
        from backend.services.usuarios_permisos_service import usuario_tiene_permiso
        if usuario_tiene_permiso(usuario.id, permiso_codigo):
            return True

    detalle = f"Acceso denegado a '{usuario_str}': nivel {nivel}"
    if nivel_minimo is not None:
        detalle += f" < minimo {nivel_minimo}"
    if permiso_codigo:
        detalle += f", permiso '{permiso_codigo}' requerido"
    detalle += f" - {accion}"

    _registrar_acceso_denegado(usuario_str, detalle)
    raise HTTPException(status_code=403, detail="No tiene permisos para realizar esta accion.")

def verificar_nivel(usuario, nivel_minimo: int, accion: str = "ACCION_NO_AUTORIZADA"):
    usuario_str = usuario.usuario if hasattr(usuario, "usuario") else str(usuario)
    nivel = usuario.nivel_seguridad if hasattr(usuario, "nivel_seguridad") else 0
    es_super = usuario.es_superusuario if hasattr(usuario, "es_superusuario") else False

    if es_super or nivel >= nivel_minimo:
        return True

    detalle = f"Acceso denegado a '{usuario_str}': nivel {nivel} < minimo {nivel_minimo} - {accion}"
    _registrar_acceso_denegado(usuario_str, detalle)
    raise HTTPException(status_code=403, detail="No tiene permisos para realizar esta accion.")
