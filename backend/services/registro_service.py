import logging
import os
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from database.modelos import Usuario
from database.modelos_registro import RegistroPendiente
from backend.services.auditoria_service import registrar_auditoria
from utils.hash import hash_password

logger = logging.getLogger("datcorr")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def solicitar_registro(db: Session, datos: dict) -> RegistroPendiente:
    registro = RegistroPendiente(
        nombre=datos["nombre"],
        apellido=datos["apellido"],
        email=datos["email"],
        telefono=datos.get("telefono"),
        organizacion=datos.get("organizacion"),
        motivo=datos.get("motivo"),
        username_sugerido=datos["username"],
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)

    registrar_auditoria(
        usuario=datos["username"],
        accion="SOLICITUD_REGISTRO",
        tabla="registros_pendientes",
        registro_id=registro.id,
        detalle=f"Solicitud de registro: {datos['nombre']} {datos['apellido']} ({datos['email']})",
        db=db,
    )

    _notificar_admin(db, registro)

    return registro

def listar_pendientes(db: Session):
    return db.query(RegistroPendiente).filter(
        RegistroPendiente.estado == "pendiente"
    ).order_by(RegistroPendiente.created_at.desc()).all()

def listar_aprobados_rechazados(db: Session):
    return db.query(RegistroPendiente).filter(
        RegistroPendiente.estado.in_(["aprobado", "rechazado"])
    ).order_by(RegistroPendiente.updated_at.desc()).all()

def aprobar_registro(db: Session, registro_id: int, admin: Usuario, rol: str, nivel: int, password: str) -> bool:
    registro = db.query(RegistroPendiente).filter(RegistroPendiente.id == registro_id).first()
    if not registro or registro.estado != "pendiente":
        return False

    usuario = Usuario(
        nombre=registro.nombre,
        apellido=registro.apellido,
        usuario=registro.username_sugerido,
        email=registro.email,
        password_hash=hash_password(password),
        rol=rol,
        nivel_seguridad=nivel,
        activo=True,
    )
    db.add(usuario)
    db.flush()

    registro.estado = "aprobado"
    registro.admin_id = admin.id
    registro.rol_asignado = rol
    registro.nivel_asignado = nivel
    registro.updated_at = datetime.now(timezone.utc)
    db.commit()

    _enviar_email_aprobado(registro.email, registro.username_sugerido)

    registrar_auditoria(
        usuario=admin.usuario,
        accion="ALTA_USUARIO",
        tabla="registros_pendientes",
        registro_id=registro.id,
        detalle=f"Aprobado registro de {registro.nombre} {registro.apellido} como {rol} (nivel {nivel})",
        db=db,
    )
    return True

def rechazar_registro(db: Session, registro_id: int, admin: Usuario, motivo: str) -> bool:
    registro = db.query(RegistroPendiente).filter(RegistroPendiente.id == registro_id).first()
    if not registro or registro.estado != "pendiente":
        return False

    registro.estado = "rechazado"
    registro.admin_id = admin.id
    registro.rechazo_motivo = motivo
    registro.updated_at = datetime.now(timezone.utc)
    db.commit()

    _enviar_email_rechazado(registro.email, motivo)

    registrar_auditoria(
        usuario=admin.usuario,
        accion="RECHAZO_USUARIO",
        tabla="registros_pendientes",
        registro_id=registro.id,
        detalle=f"Rechazado registro de {registro.nombre} {registro.apellido}: {motivo}",
        db=db,
    )
    return True

def _notificar_admin(db: Session, registro: RegistroPendiente):
    admins = db.query(Usuario).filter(
        Usuario.nivel_seguridad >= 10,
        Usuario.email.isnot(None),
        Usuario.email != "",
    ).all()

    emails_admin = [a.email for a in admins if a.email]
    if not emails_admin:
        logger.info(f"Nuevo registro pendiente (ID {registro.id}): {registro.nombre} {registro.apellido}. Sin admins con email para notificar.")
        return

    enlace = f"{FRONTEND_URL}/altas-pendientes"
    msg = MIMEText(
        f"Nueva solicitud de registro en DATCORR\n\n"
        f"Nombre: {registro.nombre} {registro.apellido}\n"
        f"Email: {registro.email}\n"
        f"Usuario sugerido: {registro.username_sugerido}\n"
        f"Organización: {registro.organizacion or '—'}\n"
        f"Motivo: {registro.motivo or '—'}\n\n"
        f"Ingrese al sistema para aprobar o rechazar:\n{enlace}"
    )
    msg["Subject"] = f"Nueva solicitud de registro - {registro.nombre} {registro.apellido}"
    _enviar_email(emails_admin, msg)

def _enviar_email_aprobado(destinatario: str, username: str):
    enlace = FRONTEND_URL
    msg = MIMEText(
        f"Su solicitud de registro en DATCORR ha sido APROBADA.\n\n"
        f"Su usuario de acceso: {username}\n\n"
        f"La contraseña fue establecida por el administrador.\n\n"
        f"Ingrese al sistema:\n{enlace}"
    )
    msg["Subject"] = "Registro aprobado - DATCORR"
    _enviar_email([destinatario], msg)
    logger.info(f"Notificacion de aprobacion enviada a {destinatario} para usuario {username}")

def _enviar_email_rechazado(destinatario: str, motivo: str):
    msg = MIMEText(
        f"Su solicitud de registro en DATCORR ha sido RECHAZADA.\n\n"
        f"Motivo: {motivo}\n\n"
        f"Si considera que esto es un error, contacte al administrador del sistema."
    )
    msg["Subject"] = "Registro rechazado - DATCORR"
    _enviar_email([destinatario], msg)

def _enviar_email(destinatarios: list, msg: MIMEText):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    if not smtp_host or not smtp_user:
        logger.warning(f"SMTP no configurado. No se envio email a {destinatarios}")
        return

    msg["From"] = smtp_user
    msg["To"] = ", ".join(destinatarios)

    try:
        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logger.info(f"Email enviado a {destinatarios}")
    except Exception as e:
        logger.error(f"Error enviando email a {destinatarios}: {e}")
