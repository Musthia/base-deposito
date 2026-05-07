# inicio_sesion.py

from PySide6.QtWidgets import QMainWindow, QMessageBox, QApplication
from PySide6.QtGui import QIcon
import sqlite3
import os
import sys
import logging

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

def iniciar_aplicacion_principal():
    ventana = VentanaPrincipal()
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
       # self.ui.imagen_fondo.setPixmap(QPixmap("img/fondo_login.png"))
        #self.ui.imagen_fondo.setScaledContents(True)

        # Conectar botón de login
        self.ui.boton_iniciar_sesion.clicked.connect(self.validar_login)        

    def validar_login(self):
        self.ui.entry_usuario.setFocus()
        usuario = self.ui.entry_usuario.text()
        contrasena = self.ui.entry_contrasena.text()
    
        usuario_maestro = "base"
        contrasena_maestra = "base"
    
        conn = sqlite3.connect("database/User_data.db")
        cursor = conn.cursor()
    
        if usuario == usuario_maestro and contrasena == contrasena_maestra:
            self.hide()  # Oculta el login
            self.ventana_principal = iniciar_aplicacion_principal()
            return
    
        cursor.execute(
            "SELECT nombre, rol, nivel_de_seguridad FROM Usuarios_database WHERE usuario = ? AND contrasena = ?",
            (usuario, contrasena)
        )
        resultado = cursor.fetchone()
    
        if resultado:
            nombre_usuario, rol, nivel_de_seguridad = resultado
            QMessageBox.information(
                self,
                "Inicio de Sesión",
                f"Inicio de sesión exitoso. Rol: {rol}, Nivel de Seguridad: {nivel_de_seguridad}"
            )
            self.hide()  # Oculta el login
            # Guardar referencia para que la ventana no se cierre
            self.ventana_principal = iniciar_aplicacion_principal(nivel_de_seguridad, nombre_usuario, rol)
        else:
            QMessageBox.critical(self, "Error", "Credenciales incorrectas.")
    
        conn.close()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    ventana = InicioSesion()
    ventana.show()
    sys.exit(app.exec())
