from sqlalchemy.orm import Session
from database.modelos import Usuario
from database.modelos_mensajes import Mensaje


def enviar_mensaje(db: Session, remitente_id: int, destinatario_id: int | None,
                   asunto: str | None, cuerpo: str):
    msg = Mensaje(
        remitente_id=remitente_id,
        destinatario_id=destinatario_id,
        asunto=asunto,
        cuerpo=cuerpo,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def enviar_mensaje_general(db: Session, remitente_id: int, asunto: str | None, cuerpo: str):
    activos = db.query(Usuario).filter(Usuario.activo == True).all()
    for user in activos:
        db.add(Mensaje(
            remitente_id=remitente_id,
            destinatario_id=user.id,
            asunto=asunto,
            cuerpo=cuerpo,
        ))
    db.commit()


def listar_mensajes(db: Session, usuario_id: int):
    return db.query(Mensaje).filter(
        Mensaje.destinatario_id == usuario_id,
    ).order_by(Mensaje.created_at.desc()).all()


def listar_pendientes(db: Session, usuario_id: int):
    return db.query(Mensaje).filter(
        Mensaje.destinatario_id == usuario_id,
        Mensaje.leido == False,
    ).order_by(Mensaje.created_at.desc()).all()


def marcar_leido(db: Session, mensaje_id: int, usuario_id: int):
    msg = db.query(Mensaje).filter(
        Mensaje.id == mensaje_id,
        Mensaje.destinatario_id == usuario_id,
    ).first()
    if msg:
        msg.leido = True
        db.commit()
        db.refresh(msg)
    return msg
