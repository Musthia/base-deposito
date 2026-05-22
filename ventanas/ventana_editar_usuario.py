import logging

from PySide6.QtWidgets import (
    QDialog,
    QMessageBox,
    QLineEdit
)

from ui.editar_usuario_ui import (
    Ui_EditarUsuario
)

from PySide6.QtCore import Signal

from services.usuario_service import (
    actualizar_usuario
)

class VentanaEditarUsuario(QDialog):

    usuario_actualizado = Signal()
    
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

        usuario_actualizado = Signal()
        

        # -----------------------------------
        # CONEXIONES
        # -----------------------------------

        self.ui.pushButton_cancelar.clicked.connect(
            self.reject
        )

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

        self.ui.lineEdit_password.setEchoMode(
            QLineEdit.Password
        )

        self.ui.comboBox_rol.addItems([
            "Administrador",
            "Supervisor",
            "Operador",
            "Consulta"
        ])

    def guardar_usuario(self):

        nombre = (
            self.ui.lineEdit_nombre.text()
        )

        apellido = (
            self.ui.lineEdit_apellido.text()
        )

        usuario = (
            self.ui.lineEdit_usuario.text()
        )

        rol = (
            self.ui.comboBox_rol.currentText()
        )

        nivel = (
            self.ui.spinBox_nivel.value()
        )

        activo = (
            self.ui.checkBox_activo.isChecked()
        )

        password = (
            self.ui.lineEdit_password.text()
        )

        # -----------------------------------
        # VALIDACIONES
        # -----------------------------------

        if not nombre.strip():

            QMessageBox.warning(
                self,
                "Validación",
                "Ingrese nombre."
            )

            return

        if not usuario.strip():

            QMessageBox.warning(
                self,
                "Validación",
                "Ingrese usuario."
            )

            return

        # -----------------------------------
        # ACTUALIZAR
        # -----------------------------------

        resultado = actualizar_usuario(
            usuario_id=self.usuario.id,
        
            nombre=self.ui.lineEdit_nombre.text(),
        
            apellido=self.ui.lineEdit_apellido.text(),
        
            usuario=self.ui.lineEdit_usuario.text(),
        
            rol=self.ui.comboBox_rol.currentText(),
        
            nivel_seguridad=self.ui.spinBox_nivel.value(),
        
            activo=self.ui.checkBox_activo.isChecked(),
        
            password=self.ui.lineEdit_password.text()
        )

        # -----------------------------------
        # RESPUESTA
        # -----------------------------------

        if resultado["success"]:

            logging.debug(
                f"Usuario actualizado: "
                f"{usuario}"
            )

            QMessageBox.information(
                self,
                "Usuario",
                resultado["mensaje"]
            )

            self.usuario_actualizado.emit()

            self.accept()

        else:

            QMessageBox.critical(
                self,
                "Error",
                resultado["mensaje"]
            )

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