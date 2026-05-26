from fastapi import (
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from backend.security.jwt_manager import (
    verificar_token
)

security = HTTPBearer()

# -----------------------------------
# OBTENER USUARIO ACTUAL
# -----------------------------------

def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    token = credentials.credentials

    payload = verificar_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Token inválido."
        )

    return payload