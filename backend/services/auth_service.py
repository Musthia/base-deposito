from database.conexion import SessionLocal

from database.modelos import Usuario

from utils.hash import verificar_password

from backend.security.jwt_manager import (
    crear_token
)
from backend.security.jwt_manager import (
    crear_refresh_token
)

from database.modelos_refresh import (
    RefreshToken
)

from backend.security.jwt_manager import (
    verificar_refresh_token
)

from database.modelos import (
    Usuario,
    RefreshToken
)

from sqlalchemy.orm import Session

def login_usuario(
    usuario,
    password
):

    session = SessionLocal()

    try:

        usuario_db = (
            session.query(Usuario)
            .filter(
                Usuario.usuario == usuario
            )
            .first()
        )

        if not usuario_db:

            return {
                "success": False,
                "mensaje": "Usuario incorrecto."
            }

        if not usuario_db.activo:

            return {
                "success": False,
                "mensaje": "Usuario inactivo."
            }

        password_ok = verificar_password(
            password,
            usuario_db.password_hash
        )

        if not password_ok:

            return {
                "success": False,
                "mensaje": "Password incorrecta."
            }

        # -----------------------------------
        # ACCESS TOKEN
        # -----------------------------------

        resultado_token = crear_token({

            "sub": usuario_db.usuario,

            "nivel": (
                usuario_db.nivel_seguridad
            ),

            "superusuario": (
                usuario_db.es_superusuario
            )
        })

        # -----------------------------------
        # REFRESH TOKEN
        # -----------------------------------

        resultado_refresh = (
        
            crear_refresh_token({
            
                "sub": usuario_db.usuario
            })
        )

        # -----------------------------------
        # GUARDAR REFRESH TOKEN
        # -----------------------------------

        nuevo_refresh = RefreshToken(

            usuario_id=usuario_db.id,

            token_jti=resultado_refresh[
                "jti"
            ],

            refresh_token=resultado_refresh[
                "refresh_token"
            ],

            revoked=False,

            ip_address=None,

            user_agent=None,

            expires_at=resultado_refresh[
                "expires_at"
            ]
        )

        session.add(
            nuevo_refresh
        )

        session.commit()

        # -----------------------------------
        # RETURN
        # -----------------------------------

        return {
        
            "success": True,

            "mensaje": "Login correcto.",

            "usuario": usuario_db.usuario,

            "usuario_id": usuario_db.id,

            "nivel": usuario_db.nivel_seguridad,

            "superusuario": (
                usuario_db.es_superusuario
            ),

            "token": resultado_token[
                "access_token"
            ],

            "jti": resultado_token[
                "jti"
            ],

            "refresh_token": resultado_refresh[
                "refresh_token"
            ]
        }

    finally:

        session.close()

def refresh_access_token(

    db: Session,

    refresh_token: str
    ):

    try:

        # -----------------------------------
        # VALIDAR REFRESH TOKEN
        # -----------------------------------

        payload = verificar_refresh_token(
            refresh_token
        )

        if not payload:

            return {

                "success": False,

                "mensaje": (
                    "Refresh token inválido."
                )
            }
        # -----------------------------------
        # OBTENER USUARIO
        # -----------------------------------

        usuario = payload.get("sub")

        usuario_db = (

            db.query(Usuario)

            .filter(
                Usuario.usuario == usuario
            )

            .first()
        )

        if not usuario_db:

            return {

                "success": False,

                "mensaje": (
                    "Usuario inexistente."
                )
            }
        # -----------------------------------
        # REVOCAR TOKEN ANTERIOR
        # -----------------------------------

        token_db = (
        
            db.query(RefreshToken)

            .filter(
                RefreshToken.refresh_token
                == refresh_token
            )

            .first()
        )

        if token_db:
        
            token_db.revoked = True

        # -----------------------------------
        # NUEVO ACCESS TOKEN
        # -----------------------------------

        nuevo_access = crear_token({
        
            "sub": usuario_db.usuario,

            "nivel": (
                usuario_db.nivel_seguridad
            ),

            "superusuario": (
                usuario_db.es_superusuario
            )
        })

        # -----------------------------------
        # NUEVO REFRESH TOKEN
        # -----------------------------------

        nuevo_refresh = crear_refresh_token({
        
            "sub": usuario_db.usuario,

            "nivel": (
                usuario_db.nivel_seguridad
            ),

            "superusuario": (
                usuario_db.es_superusuario
            )
        })

        # -----------------------------------
        # GUARDAR NUEVO REFRESH
        # -----------------------------------

        refresh_db = RefreshToken(
        
            usuario_id=usuario_db.id,

            token_jti=nuevo_refresh[
                "jti"
            ],

            refresh_token=nuevo_refresh[
                "refresh_token"
            ],

            revoked=False,

            ip_address=None,

            user_agent=None,

            expires_at=nuevo_refresh[
                "expires_at"
            ]
        )

        db.add(refresh_db)

        db.commit()

        # -----------------------------------
        # RETURN
        # -----------------------------------

        return {
        
            "success": True,

            "access_token": nuevo_access[
                "access_token"
            ],

            "refresh_token": nuevo_refresh[
                "refresh_token"
            ]
        }

    except Exception as e:
        
        return {
            
            "success": False,

            "mensaje": str(e)
        }