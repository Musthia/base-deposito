import logging

from core.session_manager import (
    SessionManager
)

# -----------------------------------
# VALIDAR SESIÓN
# -----------------------------------

def validar_sesion():

    if not SessionManager.validar_sesion():

        logging.warning(
            "Acceso denegado: "
            "sesión inválida."
        )

        return False

    return True

# -----------------------------------
# VALIDAR NIVEL
# -----------------------------------

def validar_nivel(nivel_requerido):

    # -----------------------------------
    # VALIDAR SESIÓN
    # -----------------------------------

    if not validar_sesion():

        return False

    # -----------------------------------
    # SUPERUSUARIO
    # -----------------------------------

    usuario_actual = (
        SessionManager.obtener_usuario()
    )

    if (
        usuario_actual
        and
        usuario_actual.es_superusuario
    ):

        logging.debug(
            "SUPERUSUARIO: bypass niveles."
        )

        return True

    # -----------------------------------
    # VALIDAR NIVEL
    # -----------------------------------

    nivel_actual = (
        SessionManager.obtener_nivel_seguridad()
    )

    logging.debug(
        f"Validando nivel: "
        f"actual={nivel_actual} "
        f"requerido={nivel_requerido}"
    )

    if nivel_actual < nivel_requerido:

        logging.warning(
            f"Nivel insuficiente: "
            f"{nivel_actual} < "
            f"{nivel_requerido}"
        )

        return False

    # -----------------------------------
    # ACCESO AUTORIZADO
    # -----------------------------------

    logging.debug(
        "Acceso autorizado por nivel."
    )

    return True