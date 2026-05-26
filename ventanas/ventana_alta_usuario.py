import logging

from PySide6.QtWidgets import (
    QDialog,
    QMessageBox,
    QLineEdit
)

from PySide6.QtCore import Signal

from ui.alta_usuario_ui import (
    Ui_Dialog
)

from services.usuario_service import (
    crear_usuario
)


class VentanaAltaUsuario(QDialog):

    usuario_creado = Signal()

    def __init__(
        self,
        parent=None
    ):

        super().__init__(parent)

        self.ui = Ui_Dialog()

        self.ui.setupUi(self)

        # -----------------------------------
        # CONFIGURAR UI
        # -----------------------------------

        self.configurar_ui()

        # -----------------------------------
        # CONEXIONES
        # -----------------------------------

        self.ui.pushButton_guardar.clicked.connect(
            self.guardar_usuario
        )

        self.ui.pushButton_cancelar.clicked.connect(
            self.reject
        )

    # -----------------------------------
    # CONFIGURAR UI
    # -----------------------------------

    def configurar_ui(self):

        self.ui.lineEdit_pass_alta.setEchoMode(
            QLineEdit.Password
        )

        self.ui.comboBox_rol_alta.addItems([
            "Administrador",
            "Supervisor",
            "Operador",
            "Consulta"
        ])

        self.ui.checkBox_activo_alta.setChecked(
            True
        )

    # -----------------------------------
    # GUARDAR USUARIO
    # -----------------------------------

    def guardar_usuario(self):

        nombre = (
            self.ui.lineEdit_nombre_alta
            .text()
            .strip()
        )

        apellido = (
            self.ui.lineEdit_apellido_alta
            .text()
            .strip()
        )

        usuario = (
            self.ui.lineEdit_usuario_alta
            .text()
            .strip()
        )

        password = (
            self.ui.lineEdit_pass_alta
            .text()
            .strip()
        )

        rol = (
            self.ui.comboBox_rol_alta
            .currentText()
        )

        nivel = (
            self.ui.spinBox_nivel_alta
            .value()
        )

        activo = (
            self.ui.checkBox_activo_alta
            .isChecked()
        )

        # -----------------------------------
        # VALIDACIONES
        # -----------------------------------

        if not nombre:

            QMessageBox.warning(
                self,
                "Validación",
                "Ingrese nombre."
            )

            return

        if not usuario:

            QMessageBox.warning(
                self,
                "Validación",
                "Ingrese usuario."
            )

            return

        if not password:

            QMessageBox.warning(
                self,
                "Validación",
                "Ingrese password."
            )

            return

        # -----------------------------------
        # CREAR
        # -----------------------------------

        resultado = crear_usuario(

            nombre=nombre,

            apellido=apellido,

            usuario=usuario,

            password=password,

            rol=rol,

            nivel_seguridad=nivel,

            activo=activo
        )

        # -----------------------------------
        # RESPUESTA
        # -----------------------------------

        if resultado["success"]:

            logging.debug(
                f"Usuario creado: "
                f"{usuario}"
            )

            QMessageBox.information(
                self,
                "Usuario",
                resultado["mensaje"]
            )

            self.usuario_creado.emit()

            self.accept()

        else:

            QMessageBox.critical(
                self,
                "Error",
                resultado["mensaje"]
            )