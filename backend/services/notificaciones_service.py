from sqlalchemy.orm import Session
from database.modelos import Usuario
from database.modelos_notificaciones import Notificacion


def crear_notificaciones_nueva_solicitud(db: Session, solicitud, creador_id: int):
    """Crea notificaciones para todos los operadores (nivel <= 3) excepto el creador."""
    destinatarios = db.query(Usuario).filter(
        Usuario.activo == True,
        Usuario.nivel_seguridad <= 3,
        Usuario.id != creador_id,
    ).all()
    for user in destinatarios:
        db.add(Notificacion(
            usuario_id=user.id,
            tipo="nueva_solicitud",
            solicitud_id=solicitud.id,
            mensaje=f"Nueva solicitud {solicitud.codigo} - {solicitud.detalle or 'Sin detalle'}",
        ))
    db.commit()


def crear_notificaciones_respuesta(db: Session, solicitud):
    """Crea notificaciones para todos los supervisores (nivel >= 5)."""
    destinatarios = db.query(Usuario).filter(
        Usuario.activo == True,
        Usuario.nivel_seguridad >= 5,
    ).all()
    for user in destinatarios:
        db.add(Notificacion(
            usuario_id=user.id,
            tipo="solicitud_respondida",
            solicitud_id=solicitud.id,
            mensaje=f"Solicitud {solicitud.codigo} fue respondida",
        ))
    db.commit()


def listar_pendientes(db: Session, usuario_id: int):
    return db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id,
        Notificacion.leida == False,
    ).order_by(Notificacion.created_at.desc()).all()


def marcar_leida(db: Session, notificacion_id: int, usuario_id: int):
    n = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == usuario_id,
    ).first()
    if n:
        n.leida = True
        db.commit()
        db.refresh(n)
    return n
