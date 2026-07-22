from typing import List, Optional

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

    refresh_token: Optional[str] = None

# -----------------------------------
# LOGOUT
# -----------------------------------

class LogoutRequest(BaseModel):

    refresh_token: Optional[str] = None


class LogoutResponse(BaseModel):

    success: bool

    mensaje: str


class MeResponse(BaseModel):

    id: int
    usuario: str
    nombre: str
    apellido: str
    email: Optional[str] = None
    rol: str
    nivel_seguridad: int
    es_superusuario: bool
    permisos: List[str]
    google_id: Optional[str] = None
    google_email: Optional[str] = None
    auth_provider: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str


class ChangePasswordRequest(BaseModel):
    actual: str
    nueva: str

class VincularGoogleRequest(BaseModel):
    google_id: str
    google_email: str

class GoogleLoginRequest(BaseModel):
    id_token: str