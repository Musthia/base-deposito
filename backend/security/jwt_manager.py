from datetime import (
    datetime,
    timedelta
)

from jose import jwt

from jose import JWTError

from fastapi import (
    HTTPException,
    Depends
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import (
    jwt,
    JWTError
)

import uuid

#from database.database import SessionLocal
from backend.database.conexion import (
    SessionLocal
)

from database.modelos_blacklist import (
    TokenBlacklist
)

from backend.services.blacklist_service import (
    token_esta_revocado
)

from sqlalchemy.orm import Session

from backend.database.conexion import get_db

from database.modelos_blacklist import (
    TokenBlacklist
)

from database.modelos import Usuario

security = HTTPBearer()

SECRET_KEY = (
    "DATCORR_SECRET_KEY"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

REFRESH_TOKEN_EXPIRE_DAYS = 7

# -----------------------------------
# CREAR TOKEN
# -----------------------------------

def crear_token(data):

    to_encode = data.copy()

    # -----------------------------------
    # EXPIRACION
    # -----------------------------------

    expire = (

        datetime.utcnow()

        +

        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    # -----------------------------------
    # JWT ID (JTI)
    # -----------------------------------

    jti = str(uuid.uuid4())

    # -----------------------------------
    # PAYLOAD
    # -----------------------------------

    to_encode.update({

        "exp": expire,

        "jti": jti
    })

    # -----------------------------------
    # GENERAR TOKEN
    # -----------------------------------

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    # -----------------------------------
    # RETORNO ENTERPRISE
    # -----------------------------------

    return {

        "access_token": encoded_jwt,
        "jti": jti,
        "expires_at": expire
    }
# -----------------------------------
# VERIFICAR TOKEN
# -----------------------------------

def verificar_token(token):

    db: Session = SessionLocal()

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        # -----------------------------------
        # OBTENER JTI
        # -----------------------------------

        jti = payload.get("jti")

        usuario = payload.get("sub")

        usuario_db = (
        
            db.query(Usuario)

            .filter(
                Usuario.usuario == usuario
            )

            .first()
        )

        if not usuario_db:

            registrar_auditoria(
            
                db=db,
        
                usuario=usuario,
        
                accion="USER_NOT_FOUND",
        
                tabla="auth",
        
                detalle="JWT válido pero usuario inexistente"
            )
        
            raise HTTPException(
            
                status_code=401,
        
                detail="Usuario inexistente."
            )

        # -----------------------------------
        # TOKEN EN BLACKLIST
        # -----------------------------------

        if jti and token_esta_revocado(

            db=db,

            jti=jti
        ):

            return None

        return payload

        usuario = payload.get("sub")

        usuario_db = (
        
            db.query(Usuario)

            .filter(
                Usuario.usuario == usuario
            )

            .first()
        )

        if not usuario_db:
        
            raise HTTPException(
            
                status_code=401,

                detail="Usuario inexistente."
            )

    except JWTError:

        return None

    finally:

        db.close()

# -----------------------------------
# OBTENER USUARIO ACTUAL
# -----------------------------------

def obtener_usuario_actual(

    credenciales:
    HTTPAuthorizationCredentials
    = Depends(security),

    db: Session = Depends(get_db)
):

    token = credenciales.credentials

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        jti = payload.get("jti")

        token_revocado = (

            db.query(TokenBlacklist)

            .filter(
                TokenBlacklist.token_jti == jti
            )

            .first()
        )

        if token_revocado:

            registrar_auditoria(
            
                db=db,
        
                usuario=payload.get("sub"),
        
                accion="TOKEN_REVOKED",
        
                tabla="auth",
        
                detalle="Intento acceso con token blacklisteado",
        
                token_jti=jti
            )
        
            raise HTTPException(
            
                status_code=401,
        
                detail="Token revocado."
            )

        return {

            "usuario": payload.get("sub"),

            "nivel": payload.get("nivel"),

            "superusuario": payload.get(
                "superusuario",
                False
            )
        }

    except JWTError:

        try:

            registrar_auditoria(

                db=db,

                usuario="desconocido",

                accion="TOKEN_INVALID",

                tabla="auth",

                detalle="Intento acceso con JWT inválido"
            )

        except Exception:
            pass

        raise HTTPException(

            status_code=401,

            detail="Token inválido."
        )

def crear_refresh_token(data):

    to_encode = data.copy()

    expire = (

        datetime.utcnow()

        +

        timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    jti = str(uuid.uuid4())

    to_encode.update({

        "exp": expire,

        "jti": jti,

        "type": "refresh"
    })

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return {

        "refresh_token": encoded_jwt,

        "jti": jti,

        "expires_at": expire
    }

def verificar_refresh_token(token):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("DEBUG PAYLOAD:", payload)

        if payload.get("type") != "refresh":
            print("TOKEN NO ES REFRESH")
            return None

        return payload

    except JWTError as e:
        print("JWT ERROR:", str(e))
        return None