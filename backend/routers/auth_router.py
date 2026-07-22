from fastapi import (

    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response
)

from sqlalchemy.orm import Session

from datetime import datetime, timezone
import os

from backend.database.conexion import (
    get_db
)

from backend.services.password_reset_service import (
    solicitar_reset,
    resetear_password,
    enviar_email_reset,
)

from utils.hash import verificar_password, hash_password

from backend.schemas.auth_schema import (

    LoginRequest,
    LoginResponse,

    LogoutRequest,
    LogoutResponse,
    MeResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    VincularGoogleRequest,
    GoogleLoginRequest,
)

from database.modelos import (
    Permiso,
    UsuarioPermiso,
    Usuario,
)

from database.modelos_refresh import RefreshToken

from backend.services.auth_service import (
    login_usuario,
    logout_usuario
)

from backend.services.auditoria_service import (
    registrar_auditoria
)

from backend.services.google_auth_service import verificar_token_google

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
    ALGORITHM,
    crear_token,
    crear_refresh_token,
)

from backend.security.jwt_bearer import (
    obtener_usuario_actual
)

from backend.security.jwt_manager import set_refresh_cookie, clear_refresh_cookie

from backend.schemas.usuario_schema import (
    UsuarioResponse
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

    response: Response,

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

    #print("LOGIN RESULTADO:")
    #print(resultado)

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
    
        usuario=resultado["usuario"]["usuario"],
    
        accion="LOGIN_SUCCESS",
    
        tabla="auth",
    
        registro_id=resultado["usuario"]["id"],
    
        detalle="Login exitoso",
    
        ip_address=ip_address,
    
        user_agent=user_agent,
    
        token_jti=jti
    )

    # -----------------------------------
    # RESPONSE
    # -----------------------------------

    set_refresh_cookie(response, resultado["refresh_token"])

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

    request: Request,

    response: Response,

    credentials: HTTPAuthorizationCredentials = Depends(security),

    datos: LogoutRequest = None,

    db: Session = Depends(get_db)
):
    refresh_token_str = request.cookies.get("refresh_token") or (datos.refresh_token if datos else None)

    if not refresh_token_str:
        raise HTTPException(status_code=401, detail="Refresh token requerido.")

    resultado = logout_usuario(

        db=db,

        refresh_token=refresh_token_str
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

    clear_refresh_cookie(response)

    return LogoutResponse(

        success=True,

        mensaje=resultado["mensaje"]
    )


# -----------------------------------
# GET /auth/me
# -----------------------------------

@router.get(
    "/me",
    response_model=MeResponse
)
def get_current_user(
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    permisos_db = (
        db.query(Permiso.codigo)
        .join(UsuarioPermiso, UsuarioPermiso.permiso_id == Permiso.id)
        .filter(UsuarioPermiso.usuario_id == usuario_actual.id)
        .all()
    )
    permisos = [p[0] for p in permisos_db]

    return MeResponse(
        id=usuario_actual.id,
        usuario=usuario_actual.usuario,
        nombre=usuario_actual.nombre,
        apellido=usuario_actual.apellido,
        email=usuario_actual.email,
        rol=usuario_actual.rol,
        nivel_seguridad=usuario_actual.nivel_seguridad,
        es_superusuario=usuario_actual.es_superusuario,
        permisos=permisos,
        google_id=usuario_actual.google_id,
        google_email=usuario_actual.google_email,
        auth_provider=usuario_actual.auth_provider,
    )


# -----------------------------------
# POST /auth/forgot-password
# -----------------------------------

@router.post("/forgot-password")
def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    import os
    token = solicitar_reset(db, body.email, ip)
    if token:
        frontend_url = os.getenv("FRONTEND_URL", str(request.base_url).rstrip("/"))
        enlace = f"{frontend_url}/reset-password?token={token}"
        try:
            enviar_email_reset(body.email, enlace)
        except Exception:
            pass
    return {"success": True, "mensaje": "Si el correo existe, recibirá instrucciones."}


# -----------------------------------
# POST /auth/reset-password
# -----------------------------------

@router.post("/reset-password")
def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    ok = resetear_password(db, body.token, body.nueva_password)
    if not ok:
        raise HTTPException(400, "Token inválido o expirado.")
    return {"success": True, "mensaje": "Contraseña actualizada correctamente."}


# -----------------------------------
# PATCH /auth/change-password
# -----------------------------------

@router.patch("/change-password")
def change_password(
    body: ChangePasswordRequest,
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    if not verificar_password(body.actual, usuario_actual.password_hash):
        raise HTTPException(400, "La contraseña actual no es correcta.")
    usuario_actual.password_hash = hash_password(body.nueva)
    usuario_actual.ultimo_cambio_password = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "mensaje": "Contraseña cambiada correctamente."}


# -----------------------------------
# POST /auth/google-login
# -----------------------------------

@router.post("/google-login")
def google_login(
    body: GoogleLoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    payload = verificar_token_google(body.id_token)

    if not payload:
        registrar_auditoria(
            db=db,
            usuario="desconocido",
            accion="GOOGLE_LOGIN_FAILED",
            tabla="auth",
            registro_id=0,
            detalle="Token Google invalido o email no verificado",
            ip_address=ip_address,
        )
        raise HTTPException(401, "Token de Google invalido o email no verificado.")

    email = payload["email"]
    google_id = payload["google_id"]

    usuario_db = db.query(Usuario).filter(
        Usuario.email.ilike(email)
    ).first()

    if not usuario_db:
        usuario_db = db.query(Usuario).filter(
            Usuario.google_id == google_id
        ).first()

    if usuario_db:
        if not usuario_db.activo:
            raise HTTPException(403, "Usuario inactivo.")

        usuario_db.ultimo_login = datetime.now(timezone.utc)
        usuario_db.google_id = google_id
        usuario_db.google_email = email
        usuario_db.auth_provider = "google"
        db.commit()

        resultado_token = crear_token({
            "sub": usuario_db.usuario,
            "nombre": usuario_db.nombre or "",
            "apellido": usuario_db.apellido or "",
            "rol": usuario_db.rol or "",
            "nivel": usuario_db.nivel_seguridad,
            "superusuario": usuario_db.es_superusuario,
        })

        resultado_refresh = crear_refresh_token({"sub": usuario_db.usuario})

        nuevo_refresh = RefreshToken(
            usuario_id=usuario_db.id,
            token_jti=resultado_refresh["jti"],
            refresh_token=resultado_refresh["refresh_token"],
            revoked=False,
            ip_address=None,
            user_agent=None,
            expires_at=resultado_refresh["expires_at"],
            access_jti=resultado_token["jti"],
            last_activity=datetime.now(),
        )
        db.add(nuevo_refresh)
        db.commit()

        registrar_auditoria(
            db=db,
            usuario=usuario_db.usuario,
            accion="GOOGLE_LOGIN_SUCCESS",
            tabla="auth",
            registro_id=usuario_db.id,
            detalle=f"Login Google: {email}",
            ip_address=ip_address,
            token_jti=resultado_token["jti"],
        )

        return {
            "success": True,
            "mensaje": "Login correcto.",
            "usuario": {
                "id": usuario_db.id,
                "usuario": usuario_db.usuario,
                "nombre": usuario_db.nombre,
                "apellido": usuario_db.apellido,
                "rol": usuario_db.rol,
                "nivel_seguridad": usuario_db.nivel_seguridad,
                "es_superusuario": usuario_db.es_superusuario,
            },
            "token": resultado_token["access_token"],
            "refresh_token": resultado_refresh["refresh_token"],
        }

    nuevo = Usuario(
        nombre=payload.get("nombre", ""),
        apellido=payload.get("apellido", ""),
        usuario=email.split("@")[0],
        email=email,
        password_hash=hash_password(os.urandom(24).hex()),
        rol="consulta",
        nivel_seguridad=1,
        activo=False,
        google_id=google_id,
        google_email=email,
        auth_provider="google",
    )
    db.add(nuevo)
    db.commit()

    registrar_auditoria(
        db=db,
        usuario=nuevo.usuario,
        accion="GOOGLE_LOGIN_SUCCESS",
        tabla="auth",
        registro_id=nuevo.id,
        detalle=f"Primer login Google (pendiente aprobacion): {email}",
        ip_address=ip_address,
    )

    return {
        "success": True,
        "mensaje": "Registro con Google exitoso. Un administrador debe aprobar su acceso.",
        "usuario": None,
        "token": None,
        "refresh_token": None,
        "pendiente_aprobacion": True,
    }


# -----------------------------------
# POST /auth/vincular-google
# -----------------------------------

@router.post("/vincular-google")
def vincular_google(
    body: VincularGoogleRequest,
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    if not body.google_id or not body.google_email:
        raise HTTPException(400, "google_id y google_email son requeridos.")

    existente = db.query(Usuario).filter(Usuario.google_id == body.google_id).first()
    if existente and existente.id != usuario_actual.id:
        raise HTTPException(400, "Esta cuenta de Google ya esta vinculada a otro usuario.")

    usuario_actual.google_id = body.google_id
    usuario_actual.google_email = body.google_email
    usuario_actual.auth_provider = "google"
    db.commit()

    registrar_auditoria(
        db=db,
        usuario=usuario_actual.usuario,
        accion="GOOGLE_LINK",
        tabla="usuarios",
        registro_id=usuario_actual.id,
        detalle=f"Cuenta Google vinculada: {body.google_email}",
    )

    return {"success": True, "mensaje": "Cuenta de Google vinculada correctamente."}


# -----------------------------------
# POST /auth/desvincular-google
# -----------------------------------

@router.post("/desvincular-google")
def desvincular_google(
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    if not usuario_actual.google_id:
        raise HTTPException(400, "No tiene una cuenta de Google vinculada.")

    usuario_actual.google_id = None
    usuario_actual.google_email = None
    usuario_actual.auth_provider = "local"
    db.commit()

    registrar_auditoria(
        db=db,
        usuario=usuario_actual.usuario,
        accion="GOOGLE_UNLINK",
        tabla="usuarios",
        registro_id=usuario_actual.id,
        detalle="Cuenta Google desvinculada",
    )

    return {"success": True, "mensaje": "Cuenta de Google desvinculada correctamente."}