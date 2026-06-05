import logging

from core.session_manager import (
    SessionManager
)

print(SessionManager)
print(dir(SessionManager))

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
    # USUARIO ACTUAL (DICT)
    # -----------------------------------

    usuario_actual = SessionManager.obtener_usuario()

    # -----------------------------------
    # SUPERUSUARIO (FIX API)
    # -----------------------------------

    if usuario_actual and usuario_actual.get("es_superusuario", False):

        logging.debug("SUPERUSUARIO: bypass niveles.")

        return True

    # -----------------------------------
    # VALIDAR NIVEL
    # -----------------------------------

    nivel_actual = SessionManager.obtener_nivel_seguridad()

    logging.debug(
        f"Validando nivel: actual={nivel_actual} requerido={nivel_requerido}"
    )

    if nivel_actual < nivel_requerido:

        logging.warning(
            f"Nivel insuficiente: {nivel_actual} < {nivel_requerido}"
        )

        return False

    # -----------------------------------
    # ACCESO AUTORIZADO
    # -----------------------------------

    logging.debug("Acceso autorizado por nivel.")

    return True