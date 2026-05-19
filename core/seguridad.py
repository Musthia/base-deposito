from PySide6.QtWidgets import (
    QMessageBox
)

from core.session_manager import (
    SessionManager
)

import logging


# -----------------------------------
# VALIDAR PERMISO
# -----------------------------------

def validar_permiso(
    parent,
    permiso,
    mensaje=None
):

    logging.debug(
        f"Validando permiso: "
        f"{permiso}"
    )

    # -----------------------------------
    # VALIDAR SESIÓN
    # -----------------------------------

    if not SessionManager.validar_sesion():

        logging.warning(
            "Sesión inválida."
        )

        QMessageBox.critical(
            parent,
            "Sesión",
            (
                "Debe iniciar sesión "
                "para continuar."
            )
        )

        return False

    # -----------------------------------
    # VALIDAR PERMISO
    # -----------------------------------

    if not SessionManager.tiene_permiso(
        permiso
    ):

        logging.warning(
            f"Permiso denegado: "
            f"{permiso}"
        )

        QMessageBox.warning(
            parent,
            "Permiso denegado",
            mensaje
            or
            (
                "No posee permisos "
                f"para: {permiso}"
            )
        )

        return False

    # -----------------------------------
    # ACCESO AUTORIZADO
    # -----------------------------------

    logging.debug(
        f"Permiso autorizado: "
        f"{permiso}"
    )

    return True