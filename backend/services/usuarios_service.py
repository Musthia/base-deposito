from sqlalchemy.orm import Session

from sqlalchemy.exc import (
    IntegrityError
)

from database.modelos import Usuario

from utils.hash import hash_password

from backend.core.logger import logger

# -----------------------------------
# LISTAR USUARIOS
# -----------------------------------

def listar_usuarios_web(
    db: Session
):

    logger.info(
        "LISTANDO USUARIOS WEB"
    )

    return (
        db.query(Usuario)
        .all()
    )

# -----------------------------------
# CREAR USUARIO
# -----------------------------------

def crear_usuario_web(
    db: Session,
    datos
):

    try:

        logger.info(
            f"Creando usuario: "
            f"{datos.usuario}"
        )

        # -------------------------
        # VALIDAR PASSWORD
        # -------------------------

        if len(datos.password) < 4:

            logger.warning(
                "Password demasiado corta"
            )

            return {

                "success": False,

                "mensaje": (
                    "Password demasiado corta."
                )
            }

        # -------------------------
        # USUARIO EXISTENTE
        # -------------------------

        usuario_existente = (

            db.query(Usuario)

            .filter(
                Usuario.usuario ==
                datos.usuario
            )

            .first()
        )

        if usuario_existente:

            logger.warning(
                f"Usuario duplicado: "
                f"{datos.usuario}"
            )

            return {

                "success": False,

                "mensaje": (
                    "Usuario ya existe."
                )
            }

        # -------------------------
        # CREAR USUARIO
        # -------------------------

        nuevo_usuario = Usuario(

            nombre=datos.nombre,

            apellido=datos.apellido,

            usuario=datos.usuario,

            password_hash=hash_password(
                datos.password
            ),

            rol=datos.rol,

            nivel_seguridad=(
                datos.nivel_seguridad
            ),

            activo=datos.activo
        )

        db.add(nuevo_usuario)

        db.commit()

        db.refresh(nuevo_usuario)

        logger.info(
            f"Usuario creado ID="
            f"{nuevo_usuario.id}"
        )

        return {

            "success": True,

            "mensaje": (
                "Usuario creado."
            ),

            "usuario_id": (
                nuevo_usuario.id
            )
        }

    # ---------------------------------
    # INTEGRITY ERROR
    # ---------------------------------

    except IntegrityError as e:

        db.rollback()

        logger.error(
            f"IntegrityError: {str(e)}"
        )

        return {

            "success": False,

            "mensaje": (
                "Error integridad DB."
            )
        }

    # ---------------------------------
    # ERROR GENERAL
    # ---------------------------------

    except Exception as e:

        db.rollback()

        logger.error(
            f"Error creando usuario: "
            f"{str(e)}"
        )

        return {

            "success": False,

            "mensaje": (
                "Error interno."
            )
        }

# -----------------------------------
# ACTUALIZAR USUARIO
# -----------------------------------

def actualizar_usuario_web(

    db: Session,

    usuario_id: int,

    datos
):

    try:

        logger.info(
            f"Actualizando usuario ID="
            f"{usuario_id}"
        )

        # -------------------------
        # BUSCAR USUARIO
        # -------------------------

        usuario_db = (

            db.query(Usuario)

            .filter(
                Usuario.id == usuario_id
            )

            .first()
        )

        # -------------------------
        # NO EXISTE
        # -------------------------

        if not usuario_db:

            logger.warning(
                f"Usuario inexistente "
                f"ID={usuario_id}"
            )

            return {

                "success": False,

                "mensaje": (
                    "Usuario no encontrado."
                )
            }

        # -------------------------
        # VALIDAR DUPLICADO
        # -------------------------

        if datos.usuario:

            usuario_existente = (

                db.query(Usuario)

                .filter(
                    Usuario.usuario ==
                    datos.usuario,

                    Usuario.id != usuario_id
                )

                .first()
            )

            if usuario_existente:

                logger.warning(
                    f"Usuario duplicado: "
                    f"{datos.usuario}"
                )

                return {

                    "success": False,

                    "mensaje": (
                        "Nombre usuario "
                        "ya existe."
                    )
                }

        # -------------------------
        # ACTUALIZAR CAMPOS
        # -------------------------

        if datos.nombre is not None:

            usuario_db.nombre = (
                datos.nombre
            )

        if datos.apellido is not None:

            usuario_db.apellido = (
                datos.apellido
            )

        if datos.usuario is not None:

            usuario_db.usuario = (
                datos.usuario
            )

        if datos.rol is not None:

            usuario_db.rol = (
                datos.rol
            )

        if (
            datos.nivel_seguridad
            is not None
        ):

            usuario_db.nivel_seguridad = (
                datos.nivel_seguridad
            )

        if datos.activo is not None:

            usuario_db.activo = (
                datos.activo
            )

        # -------------------------
        # PASSWORD OPCIONAL
        # -------------------------

        if datos.password:

            if len(datos.password) < 4:

                return {

                    "success": False,

                    "mensaje": (
                        "Password demasiado corta."
                    )
                }

            usuario_db.password_hash = (

                hash_password(
                    datos.password
                )
            )

        # -------------------------
        # COMMIT
        # -------------------------

        db.commit()

        logger.info(
            f"Usuario actualizado "
            f"ID={usuario_id}"
        )

        return {

            "success": True,

            "mensaje": (
                "Usuario actualizado."
            )
        }

    # ---------------------------------
    # INTEGRITY ERROR
    # ---------------------------------

    except IntegrityError as e:

        db.rollback()

        logger.error(
            f"IntegrityError UPDATE: "
            f"{str(e)}"
        )

        return {

            "success": False,

            "mensaje": (
                "Error integridad DB."
            )
        }

    # ---------------------------------
    # ERROR GENERAL
    # ---------------------------------

    except Exception as e:

        db.rollback()

        logger.error(
            f"Error UPDATE usuario: "
            f"{str(e)}"
        )

        return {

            "success": False,

            "mensaje": (
                "Error interno."
            )
        }