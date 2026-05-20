import logging

from PySide6.QtWidgets import (
    QDialog,
    QMessageBox,
    QLineEdit
)

from ui.editar_usuario_ui import (
    Ui_EditarUsuario
)


class VentanaEditarUsuario(QDialog):

    def __init__(
        self,
        usuario,
        parent=None
    ):

        super().__init__(parent)

        self.ui = Ui_EditarUsuario()

        self.ui.setupUi(self)

        # -----------------------------------
        # USUARIO
        # -----------------------------------

        self.usuario = usuario

        # -----------------------------------
        # CONFIGURAR UI
        # -----------------------------------

        self.configurar_ui()

        # -----------------------------------
        # CARGAR DATOS
        # -----------------------------------

        self.cargar_datos_usuario()

        #self.cargar_datos()
        

        # -----------------------------------
        # CONEXIONES
        # -----------------------------------

        self.ui.pushButton_cancelar.clicked.connect(
            self.reject
        )

    # -----------------------------------
    # CONFIGURAR UI
    # -----------------------------------

    def configurar_ui(self):

        self.ui.lineEdit_password.setEchoMode(
            QLineEdit.Password
        )

        self.ui.comboBox_rol.addItems([
            "Administrador",
            "Supervisor",
            "Operador",
            "Consulta"
        ])

    # -----------------------------------
    # CARGAR DATOS
    # -----------------------------------

    def cargar_datos_usuario(self):

        logging.debug(
            f"Cargando usuario edición: "
            f"{self.usuario.usuario}"
        )

        self.ui.lineEdit_nombre.setText(
            self.usuario.nombre
        )

        self.ui.lineEdit_apellido.setText(
            self.usuario.apellido
        )

        self.ui.lineEdit_usuario.setText(
            self.usuario.usuario
        )

        self.ui.comboBox_rol.setCurrentText(
            self.usuario.rol
        )

        self.ui.spinBox_nivel.setValue(
            self.usuario.nivel_seguridad
        )

        self.ui.checkBox_activo.setChecked(
            self.usuario.activo
        )

        self.ui.lineEdit_password.clear()