from database.session import SessionLocal

from database.conexion import SessionLocal

from database.modelos import Usuario

from database.crud.crud_usuarios import (
    generar_hash_password
)

import logging

from sqlalchemy.orm import Session

from database.conexion import SessionLocal

from database.modelos import Usuario

from utils.hash import hash_password

# -----------------------------------
# ACTUALIZAR USUARIO
# -----------------------------------

def actualizar_usuario(
    usuario_id,
    nombre,
    apellido,
    usuario,
    rol,
    nivel_seguridad,
    activo,
    password=None
):

    from database.conexion import SessionLocal
    from database.modelos import Usuario

    session = SessionLocal()

    try:

        usuario_db = (
            session.query(Usuario)
            .filter(
                Usuario.id == usuario_id
            )
            .first()
        )

        if not usuario_db:

            return {
                "success": False,
                "mensaje": "Usuario no encontrado."
            }

        usuario_db.nombre = nombre
        usuario_db.apellido = apellido
        usuario_db.usuario = usuario
        usuario_db.rol = rol
        usuario_db.nivel_seguridad = nivel_seguridad
        usuario_db.activo = activo

        if password:

            usuario_db.password_hash = (
                hash_password(password)
            )

        session.commit()

        logging.debug(
            f"Usuario actualizado: {usuario}"
        )

        return {
            "success": True,
            "mensaje": "Usuario actualizado."
        }

    except Exception as e:

        session.rollback()

        logging.exception(
            "Error actualizando usuario"
        )

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

        usuario = (
            session.query(Usuario)
            .filter(
                Usuario.id == usuario_id
            )
            .first()
        )

        if not usuario:

            return {
                "success": False,
                "mensaje": "Usuario no encontrado."
            }

        usuario.password_hash = (
            hash_password(
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

# -----------------------------------
# LISTAR USUARIOS
# -----------------------------------

def listar_usuarios():

    db = SessionLocal()

    try:

        usuarios = (
            db.query(Usuario)
            .order_by(
                Usuario.id.asc()
            )
            .all()
        )

        return usuarios

    finally:

        db.close()

# -----------------------------------
# OBTENER USUARIO POR ID
# -----------------------------------

def obtener_usuario_por_id(
    usuario_id
):

    db = SessionLocal()

    try:

        usuario = (
            db.query(Usuario)
            .filter(
                Usuario.id == usuario_id
            )
            .first()
        )

        return usuario

    finally:

        db.close()

# -----------------------------------
# LISTAR USUARIOS ACTIVOS
# -----------------------------------

def listar_usuarios_activos():

    db = SessionLocal()

    try:

        usuarios = (
            db.query(Usuario)
            .filter(
                Usuario.activo == True
            )
            .order_by(
                Usuario.id.asc()
            )
            .all()
        )

        return usuarios

    finally:

        db.close()

# -----------------------------------
# LISTAR USUARIOS INACTIVOS
# -----------------------------------

def listar_usuarios_inactivos():

    db = SessionLocal()

    try:

        usuarios = (
            db.query(Usuario)
            .filter(
                Usuario.activo == False
            )
            .order_by(
                Usuario.id.asc()
            )
            .all()
        )

        return usuarios

    finally:

        db.close()    

def desactivar_usuario(usuario_id):

    from database.conexion import SessionLocal
    #from models.usuario import Usuario

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

        usuario.activo = False

        session.commit()

        return {
            "success": True,
            "mensaje": "Usuario desactivado."
        }

    except Exception as e:

        session.rollback()

        return {
            "success": False,
            "mensaje": str(e)
        }

    finally:

        session.close()

def activar_usuario(usuario_id):

    from database.conexion import SessionLocal
    #from models.usuario import Usuario

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

        usuario.activo = True

        session.commit()

        return {
            "success": True,
            "mensaje": "Usuario activado."
        }

    except Exception as e:

        session.rollback()

        return {
            "success": False,
            "mensaje": str(e)
        }

    finally:

        session.close()