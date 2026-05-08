from database.session import SessionLocal

from database.modelos import Usuario

from database.crud.crud_usuarios import (
    generar_hash_password
)

# -----------------------------------
# ACTUALIZAR USUARIO
# -----------------------------------

def actualizar_usuario(
    usuario_id,
    nombre=None,
    apellido=None,
    rol=None,
    nivel_seguridad=None
):

    session = SessionLocal()

    try:

        usuario = session.query(
            Usuario
        ).filter(
            Usuario.id == usuario_id
        ).first()

        if not usuario:

            return {
                "success": False,
                "mensaje": "Usuario no encontrado."
            }

        # -----------------------------------
        # ACTUALIZAR CAMPOS
        # -----------------------------------

        if nombre:
            usuario.nombre = nombre

        if apellido:
            usuario.apellido = apellido

        if rol:
            usuario.rol = rol

        if nivel_seguridad is not None:
            usuario.nivel_seguridad = nivel_seguridad

        # -----------------------------------
        # GUARDAR
        # -----------------------------------

        session.commit()

        return {
            "success": True,
            "mensaje": "Usuario actualizado."
        }

    except Exception as e:

        session.rollback()

        return {
            "success": False,
            "mensaje": str(e)
        }

    finally:

        session.close()


# -----------------------------------
# CAMBIAR PASSWORD
# -----------------------------------

def cambiar_password(
    usuario_id,
    nueva_password
):

    session = SessionLocal()

    try:

        usuario = session.query(
            Usuario
        ).filter(
            Usuario.id == usuario_id
        ).first()

        if not usuario:

            return {
                "success": False,
                "mensaje": "Usuario no encontrado."
            }

        # -----------------------------------
        # NUEVO HASH
        # -----------------------------------

        usuario.password_hash = (
            generar_hash_password(
                nueva_password
            )
        )

        session.commit()

        return {
            "success": True,
            "mensaje": "Password actualizada."
        }

    except Exception as e:

        session.rollback()

        return {
            "success": False,
            "mensaje": str(e)
        }

    finally:

        session.close()


# -----------------------------------
# ACTIVAR / DESACTIVAR
# -----------------------------------

def cambiar_estado_usuario(
    usuario_id,
    activo
):

    session = SessionLocal()

    try:

        usuario = session.query(
            Usuario
        ).filter(
            Usuario.id == usuario_id
        ).first()

        if not usuario:

            return {
                "success": False,
                "mensaje": "Usuario no encontrado."
            }

        usuario.activo = activo

        session.commit()

        estado = (
            "activado"
            if activo
            else "desactivado"
        )

        return {
            "success": True,
            "mensaje": f"Usuario {estado}."
        }

    except Exception as e:

        session.rollback()

        return {
            "success": False,
            "mensaje": str(e)
        }

    finally:

        session.close()