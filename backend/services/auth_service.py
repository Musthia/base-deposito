from database.conexion import SessionLocal

from database.modelos import Usuario

from utils.hash import verificar_password

from backend.security.jwt_manager import (
    crear_token
)


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
        # GENERAR TOKEN
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
            ]
        }
    finally:

        session.close()