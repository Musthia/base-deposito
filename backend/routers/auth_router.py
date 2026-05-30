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
    LoginResponse,

    LogoutRequest,
    LogoutResponse
)

from backend.services.auth_service import (
    login_usuario,
    logout_usuario
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

from jose import jwt

from backend.services.blacklist_service import (
    blacklist_token
)

from backend.security.jwt_manager import (
    SECRET_KEY,
    ALGORITHM
)

from fastapi.security import (

    HTTPBearer,

    HTTPAuthorizationCredentials
)

security = HTTPBearer()

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

        token=resultado["token"],

        refresh_token=resultado[
            "refresh_token"
        ]
    )

# -----------------------------------
# LOGOUT
# -----------------------------------

@router.post(

    "/logout",

    response_model=LogoutResponse
)

def logout(

    datos: LogoutRequest,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db)
):
    print("PASO 1")

    resultado = logout_usuario(

        db=db,

        refresh_token=datos.refresh_token
    )

    # -----------------------------------
    # ERROR
    # -----------------------------------

    if not resultado["success"]:

        raise HTTPException(

            status_code=401,

            detail=resultado["mensaje"]
        )

    # -----------------------------------
    # ACCESS TOKEN
    # -----------------------------------

    access_token = credentials.credentials

    payload = jwt.decode(

        access_token,

        SECRET_KEY,

        algorithms=[ALGORITHM]
    )

    jti = payload.get("jti")

    usuario = payload.get("sub")

    # -----------------------------------
    # BLACKLIST ACCESS TOKEN
    # -----------------------------------

    if jti:

        blacklist_token(

            db=db,

            jti=jti,

            usuario=usuario,

            motivo="logout"
        )

    # -----------------------------------
    # OK
    # -----------------------------------

    return LogoutResponse(

        success=True,

        mensaje=resultado["mensaje"]
    )