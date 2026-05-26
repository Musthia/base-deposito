from typing import Optional

from pydantic import BaseModel


# -----------------------------------
# REQUEST LOGIN
# -----------------------------------

class LoginRequest(BaseModel):

    usuario: str

    password: str


# -----------------------------------
# RESPONSE LOGIN
# -----------------------------------

class LoginResponse(BaseModel):

    success: bool

    usuario: Optional[str] = None

    mensaje: Optional[str] = None

    token: Optional[str] = None