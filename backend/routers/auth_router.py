from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from backend.schemas.auth_schema import (
    LoginRequest,
    LoginResponse
)

from backend.services.auth_service import (
    login_usuario
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post(
    "/login",
    response_model=LoginResponse
)

def login(datos: LoginRequest):

    resultado = login_usuario(
        datos.usuario,
        datos.password
    )

    if not resultado["success"]:

        raise HTTPException(
            status_code=401,
            detail=resultado["mensaje"]
        )

    return LoginResponse(
        success=True,
        mensaje=resultado["mensaje"],
        usuario=resultado["usuario"],
        token=resultado["token"]
    )