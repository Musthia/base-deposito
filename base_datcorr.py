# inicio_sesion.py

from PySide6.QtWidgets import QMainWindow, QMessageBox, QApplication
from PySide6.QtGui import QIcon
import sqlite3
import os
import sys
import logging
from services.auth_service import (
    autenticar_usuario
)

from services.permisos_service import (
    obtener_descripcion_nivel
)

# UI
from ui.inicio_sesion_ui import Ui_MainWindow

# Ventana principal
from ventana_principal import VentanaPrincipal

def configurar_logging():
    nivel = logging.DEBUG  # en producción podés cambiar a INFO

    logging.basicConfig(
        level=nivel,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )

    logging.debug("Logging inicializado")

configurar_logging()

def iniciar_aplicacion_principal(
    nivel_seguridad=None,
    nombre_usuario=None,
    rol=None
):

    ventana = VentanaPrincipal(
        nivel_seguridad,
        nombre_usuario,
        rol
    )

    ventana.show()

    return ventana

class InicioSesion(QMainWindow):
    def __init__(self):
        super().__init__()
        self.ui = Ui_MainWindow()
        self.ui.setupUi(self)
        self.ventana_principal = None  # ← Referencia guardada

        # Configurar icono y fondo
        self.setWindowIcon(QIcon("img/Datcorr.ico"))
       
        # Conectar botón de login
        self.ui.boton_iniciar_sesion.clicked.connect(self.validar_login)        

    def validar_login(self):

        self.ui.entry_usuario.setFocus()

        usuario_input = (
            self.ui.entry_usuario.text().strip()
        )

        password_input = (
            self.ui.entry_contrasena.text()
        )

        # -----------------------------------
        # LOGIN MAESTRO TEMPORAL
        # -----------------------------------

        if (
            usuario_input == "base"
            and password_input == "base"
        ):

            self.hide()

            self.ventana_principal = (
                iniciar_aplicacion_principal()
            )

            return

        # -----------------------------------
        # AUTENTICAR POSTGRESQL
        # -----------------------------------

        resultado = autenticar_usuario(
            usuario_input,
            password_input
        )

        # -----------------------------------
        # LOGIN INCORRECTO
        # -----------------------------------

        if not resultado["success"]:

            QMessageBox.critical(
                self,
                "Error Login",
                resultado["mensaje"]
            )

            return

        # -----------------------------------
        # USUARIO AUTENTICADO
        # -----------------------------------

        usuario = resultado["usuario"]

        nombre_usuario = (
            f"{usuario.nombre} "
            f"{usuario.apellido}"
        )

        rol = usuario.rol

        nivel_seguridad = (
            usuario.nivel_seguridad
        )

        descripcion_nivel = (
            obtener_descripcion_nivel(
                nivel_seguridad
            )
        )

        QMessageBox.information(
            self,
            "Inicio de Sesión",
            (
                f"Bienvenido {nombre_usuario}\n\n"
                f"Rol: {rol}\n"
                f"Nivel: {descripcion_nivel}"
            )
        )

        # -----------------------------------
        # ABRIR SISTEMA
        # -----------------------------------

        self.hide()

        self.ventana_principal = (
            iniciar_aplicacion_principal(
                nivel_seguridad,
                nombre_usuario,
                rol
            )
        )

if __name__ == "__main__":
    app = QApplication(sys.argv)
    ventana = InicioSesion()
    ventana.show()
    sys.exit(app.exec())
