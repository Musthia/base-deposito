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

    if not validar_sesion():

        return False

    nivel_actual = (
        SessionManager.obtener_nivel_seguridad()
    )

    if nivel_actual < nivel_requerido:

        logging.warning(
            f"Nivel insuficiente: "
            f"{nivel_actual} < "
            f"{nivel_requerido}"
        )

        logging.debug(
            f"Validando nivel: "
            f"actual={nivel_actual} "
            f"requerido={nivel_requerido}"
        )

        return False

    return True