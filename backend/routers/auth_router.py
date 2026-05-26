from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from backend.dependencies import (
    get_db
)

from backend.schemas.auth_schema import (
    LoginRequest,
    LoginResponse
)

from database.modelos import Usuario

from utils.hash import verificar_password

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# -----------------------------------
# LOGIN
# -----------------------------------

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):

    usuario_db = (
        db.query(Usuario)
        .filter(
            Usuario.usuario ==
            datos.usuario
        )
        .first()
    )

    # -----------------------------------
    # USUARIO
    # -----------------------------------

    if not usuario_db:

        raise HTTPException(
            status_code=401,
            detail="Usuario incorrecto."
        )

    # -----------------------------------
    # PASSWORD
    # -----------------------------------

    password_ok = verificar_password(
        datos.password,
        usuario_db.password_hash
    )

    if not password_ok:

        raise HTTPException(
            status_code=401,
            detail="Password incorrecta."
        )

    # -----------------------------------
    # ACTIVO
    # -----------------------------------

    if not usuario_db.activo:

        raise HTTPException(
            status_code=403,
            detail="Usuario inactivo."
        )

    # -----------------------------------
    # LOGIN OK
    # -----------------------------------

    return LoginResponse(
        success=True,
        mensaje="Login correcto.",
        usuario=usuario_db.usuario,
        token="TEMP_TOKEN"
    )