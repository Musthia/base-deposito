from fastapi import (

    APIRouter,
    Depends,
    HTTPException,
    Request
)

from sqlalchemy.orm import Session

from backend.database.conexion import (
    get_db
)

from backend.schemas.auth_schema import (

    LoginRequest,
    LoginResponse
)

from backend.services.auth_service import (
    login_usuario
)

from backend.services.auditoria_service import (
    registrar_auditoria
)

from backend.schemas.refresh_schema import (

    RefreshRequest,

    RefreshResponse
)

from backend.services.auth_service import (

    refresh_access_token
)

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

    request: Request,

    datos: LoginRequest,

    db: Session = Depends(get_db)
):

    # -----------------------------------
    # IP CLIENTE
    # -----------------------------------

    ip_address = request.client.host

    # -----------------------------------
    # USER AGENT
    # -----------------------------------

    user_agent = request.headers.get(
        "user-agent"
    )

    # -----------------------------------
    # LOGIN
    # -----------------------------------

    resultado = login_usuario(

        datos.usuario,

        datos.password
    )

    # -----------------------------------
    # LOGIN FALLIDO
    # -----------------------------------

    if not resultado["success"]:

        registrar_auditoria(

            db=db,

            usuario=datos.usuario,

            accion="LOGIN_FAILED",

            tabla="auth",

            registro_id=0,

            detalle=resultado["mensaje"],

            ip_address=ip_address,

            user_agent=user_agent
        )

        raise HTTPException(

            status_code=401,

            detail=resultado["mensaje"]
        )

    # -----------------------------------
    # TOKEN + JTI
    # -----------------------------------

    token = resultado["token"]

    jti = resultado.get("jti")

    # -----------------------------------
    # LOGIN EXITOSO
    # -----------------------------------

    registrar_auditoria(

        db=db,

        usuario=resultado["usuario"],

        accion="LOGIN_SUCCESS",

        tabla="auth",

        registro_id=resultado["usuario_id"],

        detalle="Login exitoso",

        ip_address=ip_address,

        user_agent=user_agent,

        token_jti=jti
    )

    # -----------------------------------
    # RESPONSE
    # -----------------------------------

    return LoginResponse(

        success=True,

        mensaje=resultado["mensaje"],

        usuario=resultado["usuario"],

        token=token
    )