from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SolicitudOut(BaseModel):
    id: int
    codigo: str
    tipo_documento: str
    identificador_documento: str
    detalle: Optional[str] = None
    estado: str
    prioridad: str
    destacado: bool
    verificado: bool
    creado_por: Optional[str] = None
    creado_por_usuario_id: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    respuesta: Optional["RespuestaOut"] = None

    class Config:
        from_attributes = True


class SolicitudCreate(BaseModel):
    tipo_documento: str
    identificador_documento: str
    detalle: Optional[str] = None


class RespuestaOut(BaseModel):
    id: int
    solicitud_id: int
    estado_documento: str
    observacion: Optional[str] = None
    usuario_responde: Optional[str] = None
    usuario_responde_id: Optional[int] = None
    fecha_respuesta: Optional[datetime] = None

    class Config:
        from_attributes = True


class RespuestaCreate(BaseModel):
    solicitud_id: int
    estado_documento: str
    observacion: Optional[str] = None
