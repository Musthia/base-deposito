from datetime import (
    datetime,
    timedelta
)

from jose import jwt

from jose import JWTError


SECRET_KEY = (
    "DATCORR_SECRET_KEY"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -----------------------------------
# CREAR TOKEN
# -----------------------------------

def crear_token(data):

    to_encode = data.copy()

    expire = (
        datetime.utcnow()
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

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