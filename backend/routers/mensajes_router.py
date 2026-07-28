from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.conexion import get_db
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.services.mensajes_service import (
    enviar_mensaje,
    enviar_mensaje_general,
    listar_mensajes,
    listar_pendientes,
    marcar_leido,
)
from database.modelos import Usuario

router = APIRouter(
    prefix="/api/mensajes",
    tags=["Mensajes"],
)


class EnviarMensajeRequest(BaseModel):
    destinatario_usuario: str | None = None
    es_general: bool = False
    asunto: str | None = None
    cuerpo: str


@router.post("/enviar")
def api_enviar(
    body: EnviarMensajeRequest,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    if body.es_general:
        enviar_mensaje_general(db, usuario.id, body.asunto, body.cuerpo)
        return {"mensaje": "Mensaje general enviado a todos los usuarios"}

    if not body.destinatario_usuario:
        raise HTTPException(400, "Debe especificar destinatario_usuario o es_general=true")
    dest = db.query(Usuario).filter(Usuario.usuario == body.destinatario_usuario).first()
    if not dest:
        raise HTTPException(404, "Usuario destinatario no encontrado")
    enviar_mensaje(db, usuario.id, dest.id, body.asunto, body.cuerpo)
    return {"mensaje": f"Mensaje enviado a {dest.usuario}"}


@router.get("")
def api_listar(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    msgs = listar_mensajes(db, usuario.id)
    return {"mensajes": [
        {
            "id": m.id,
            "remitente_usuario": db.query(Usuario).filter(Usuario.id == m.remitente_id).with_entities(Usuario.usuario).scalar(),
            "asunto": m.asunto,
            "cuerpo": m.cuerpo,
            "leido": m.leido,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in msgs
    ]}


@router.get("/pendientes")
def api_pendientes(
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    msgs = listar_pendientes(db, usuario.id)
    return {"mensajes": [
        {
            "id": m.id,
            "remitente_usuario": db.query(Usuario).filter(Usuario.id == m.remitente_id).with_entities(Usuario.usuario).scalar(),
            "asunto": m.asunto,
            "cuerpo": m.cuerpo,
            "leido": m.leido,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in msgs
    ]}


@router.put("/{mensaje_id}/leer")
def api_marcar_leido(
    mensaje_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obtener_usuario_actual),
):
    msg = marcar_leido(db, mensaje_id, usuario.id)
    if not msg:
        raise HTTPException(404, "Mensaje no encontrado")
    return {"mensaje": "Mensaje marcado como leído"}
