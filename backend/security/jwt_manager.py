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

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None

# -----------------------------------
# OBTENER USUARIO ACTUAL
# -----------------------------------

def obtener_usuario_actual(

    credenciales: (
        HTTPAuthorizationCredentials
    ) = Depends(security)
):

    token = credenciales.credentials

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
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