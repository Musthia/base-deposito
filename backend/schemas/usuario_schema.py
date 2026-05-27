from pydantic import BaseModel

from typing import (
    List,
    Optional
)

# -----------------------------------
# RESPONSE USUARIO
# -----------------------------------

class UsuarioResponse(BaseModel):

    id: int
    nombre: str
    apellido: str
    usuario: str
    rol: str
    nivel_seguridad: int
    activo: bool
    es_superusuario: bool


# -----------------------------------
# CREAR USUARIO
# -----------------------------------

class UsuarioCreate(BaseModel):

    nombre: str
    apellido: str
    usuario: str
    password: str
    rol: str
    nivel_seguridad: int
    activo: bool = True


# -----------------------------------
# RESPONSE CREAR
# -----------------------------------

class UsuarioCreateResponse(BaseModel):

    success: bool
    mensaje: str
    usuario_id: Optional[int] = None


# -----------------------------------
# RESPONSE LISTADO
# -----------------------------------

class UsuariosListadoResponse(BaseModel):

    success: bool
    total: int
    usuarios: List[UsuarioResponse]

# -----------------------------------
# UPDATE USUARIO
# -----------------------------------

class UsuarioUpdate(

    BaseModel
):

    nombre: Optional[str] = None

    apellido: Optional[str] = None

    usuario: Optional[str] = None

    password: Optional[str] = None

    rol: Optional[str] = None

    nivel_seguridad: Optional[int] = None

    activo: Optional[bool] = None

# -----------------------------------
# RESPONSE UPDATE
# -----------------------------------

class UsuarioUpdateResponse(
    BaseModel
):

    success: bool

    mensaje: str