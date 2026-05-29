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