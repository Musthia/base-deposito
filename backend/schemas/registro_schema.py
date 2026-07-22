from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class SolicitudRegistroRequest(BaseModel):
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    organizacion: Optional[str] = None
    motivo: Optional[str] = None
    username: str

class RegistroPendienteResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    organizacion: Optional[str] = None
    motivo: Optional[str] = None
    username_sugerido: str
    estado: str
    created_at: datetime

class AprobarRequest(BaseModel):
    rol: str
    nivel: int
    password: str

class RechazarRequest(BaseModel):
    motivo: str
