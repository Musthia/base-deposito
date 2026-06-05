from typing import Optional

from pydantic import BaseModel

# -----------------------------------
# REQUEST LOGIN
# -----------------------------------

class LoginRequest(BaseModel):

    usuario: str

    password: str

# -----------------------------------
# USUARIO LOGIN RESPONSE
# -----------------------------------

class UsuarioLoginResponse(BaseModel):

    id: int

    usuario: str

    nombre: str

    apellido: str

    rol: str

    nivel_seguridad: int

    es_superusuario: bool

# -----------------------------------
# RESPONSE LOGIN
# -----------------------------------

class LoginResponse(BaseModel):

    success: bool

    usuario: Optional[UsuarioLoginResponse] = None

    mensaje: Optional[str] = None

    token: Optional[str] = None

    refresh_token: Optional[str] = None
# -----------------------------------
# REFRESH RESPONSE
# -----------------------------------

class RefreshResponse(BaseModel):

    success: bool

    access_token: str

    refresh_token: str

    token_type: str = "bearer"

# -----------------------------------
# REFRESH REQUEST
# -----------------------------------

class RefreshRequest(BaseModel):

    refresh_token: str

# -----------------------------------
# LOGOUT
# -----------------------------------

class LogoutRequest(BaseModel):

    refresh_token: str


class LogoutResponse(BaseModel):

    success: bool

    mensaje: str