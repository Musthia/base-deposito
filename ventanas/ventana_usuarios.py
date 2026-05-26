from PySide6.QtWidgets import (
    QWidget,
    QMessageBox
)

from PySide6.QtGui import (
    QStandardItemModel,
    QStandardItem
)

from ui.ventana_usuario import (
    Ui_VentanaUsuarios
)

from services.usuario_service import (
    listar_usuarios
)

from services.usuario_service import (
    listar_usuarios,
    obtener_usuario_por_id,
    activar_usuario,
    desactivar_usuario
)

import logging

from PySide6.QtWidgets import QDialog

from ventanas.ventana_alta_usuario import (
    VentanaAltaUsuario
)

class VentanaUsuarios(QDialog):

    def __init__(self, parent=None):

        super().__init__(parent)

        self.ui = Ui_VentanaUsuarios()

        self.ui.setupUi(self)

        self.configurar_tabla()

        self.cargar_usuarios()

        self.usuario_seleccionado_id = None

        self.usuario_seleccionado = None

        self.ui.pushButton_actualizar_usuarios.clicked.connect(
            self.cargar_usuarios
        )

        self.ui.tableViewlistar_usuarios.clicked.connect(
            self.seleccionar_usuario
        )     

        self.ui.pushButton_activar_usuario.clicked.connect(
            self.activar_usuario_seleccionado
        )

        self.ui.pushButton_desactivar_usuario.clicked.connect(
            self.desactivar_usuario_seleccionado
        )   

        self.ui.pushButton_editar_usuario.clicked.connect(
            self.editar_usuario_seleccionado
        )

        self.ui.pushButton_permiso_usuario.clicked.connect(
            self.abrir_permisos_usuario
        )

        self.ui.pushButton_nuevo_usuario.clicked.connect(
            self.abrir_alta_usuario
        )

    def abrir_alta_usuario(self):

        logging.debug(
            "Abriendo alta usuario..."
        )
    
        dialogo = VentanaAltaUsuario(
            parent=self
        )
    
        # -----------------------------------
        # REFRESCAR TABLA
        # -----------------------------------
    
        dialogo.usuario_creado.connect(
            self.cargar_usuarios
        )
    
        dialogo.exec()

    def editar_usuario_seleccionado(self):

        if not self.usuario_seleccionado:

            QMessageBox.warning(
                self,
                "Selección",
                "Seleccione un usuario."
            )

            return

        logging.debug(
            f"Editar usuario: "
            f"{self.usuario_seleccionado.usuario}"
        )

        from ventanas.ventana_editar_usuario import (
            VentanaEditarUsuario
        )
        
        dialogo = VentanaEditarUsuario(
            self.usuario_seleccionado,
            self
        )

        dialogo.usuario_actualizado.connect(
            self.cargar_usuarios
        )
        
        dialogo.exec()

    def abrir_permisos_usuario(self):

        if not self.usuario_seleccionado:

            QMessageBox.warning(
                self,
                "Selección",
                "Seleccione un usuario."
            )

            return

        logging.debug(
            f"Administrar permisos: "
            f"{self.usuario_seleccionado.usuario}"
        )

        from ventanas.ventana_permisos_usuario import (
            VentanaPermisosUsuario
        )

        dialogo = VentanaPermisosUsuario(
            self.usuario_seleccionado
        )

        dialogo.exec()
    
    def configurar_tabla(self):

        self.model = QStandardItemModel()

        self.ui.tableViewlistar_usuarios.setModel(
            self.model
        )

        headers = [
            "ID",
            "Nombre",
            "Apellido",
            "Usuario",
            "Rol",
            "Nivel",
            "Activo"
        ]

        self.model.setHorizontalHeaderLabels(
            headers
        )

    def cargar_usuarios(self):

        logging.debug(
            "Cargando usuarios..."
        )

        self.model.removeRows(
            0,
            self.model.rowCount()
        )

        try:

            usuarios = listar_usuarios()

            for usuario in usuarios:

                fila = [

                    QStandardItem(
                        str(usuario.id)
                    ),

                    QStandardItem(
                        usuario.nombre
                    ),

                    QStandardItem(
                        usuario.apellido
                    ),

                    QStandardItem(
                        usuario.usuario
                    ),

                    QStandardItem(
                        usuario.rol
                    ),

                    QStandardItem(
                        str(
                            usuario.nivel_seguridad
                        )
                    ),

                    QStandardItem(
                        "Sí"
                        if usuario.activo
                        else "No"
                    )
                ]

                self.model.appendRow(fila)

            logging.debug(
                f"Usuarios cargados: "
                f"{len(usuarios)}"
            )

        except Exception:

            logging.exception(
                "Error cargando usuarios"
            )

            QMessageBox.critical(
                self,
                "Error",
                "No se pudieron cargar usuarios."
            )

    def seleccionar_usuario(self, index):

        fila = index.row()
    
        item_id = self.model.item(fila, 0)
    
        if not item_id:
        
            return
    
        self.usuario_seleccionado_id = int(
            item_id.text()
        )
    
        self.usuario_seleccionado = (
            obtener_usuario_por_id(
                self.usuario_seleccionado_id
            )
        )
    
        if not self.usuario_seleccionado:
        
            logging.warning(
                "Usuario no encontrado."
            )
    
            return
    
        logging.debug(
            f"Usuario seleccionado: "
            f"{self.usuario_seleccionado.usuario}"
        )

    def activar_usuario_seleccionado(self):

        if not self.usuario_seleccionado:

            QMessageBox.warning(
                self,
                "Selección",
                "Seleccione un usuario."
            )

            return

        logging.debug(
            f"Activando usuario: "
            f"{self.usuario_seleccionado.usuario}"
        )

        resultado = activar_usuario(
            self.usuario_seleccionado.id
        )

        if resultado["success"]:

            QMessageBox.information(
                self,
                "Usuario",
                resultado["mensaje"]
            )

            self.cargar_usuarios()

        else:

            QMessageBox.critical(
                self,
                "Error",
                resultado["mensaje"]
            )

    def desactivar_usuario_seleccionado(self):

        if not self.usuario_seleccionado:

            QMessageBox.warning(
                self,
                "Selección",
                "Seleccione un usuario."
            )

            return

        logging.debug(
            f"Desactivando usuario: "
            f"{self.usuario_seleccionado.usuario}"
        )

        from core.session_manager import SessionManager

        usuario_actual = (
            SessionManager.obtener_usuario()
        )

        logging.debug(
            f"usuario_actual={usuario_actual}"
        )

        if not usuario_actual:

            logging.warning(
                "No existe sesión activa."
            )
        
            QMessageBox.critical(
                self,
                "Sesión",
                "No existe sesión activa."
            )
        
            return
        
        if (
            usuario_actual.id
            ==
            self.usuario_seleccionado.id
        ):
        
            QMessageBox.warning(
                self,
                "Protección",
                (
                    "No puede "
                    "desactivar "
                    "su propio usuario."
                )
            )

            return

        resultado = desactivar_usuario(
            self.usuario_seleccionado.id
        )

        if resultado["success"]:

            QMessageBox.information(
                self,
                "Usuario",
                resultado["mensaje"]
            )

            self.cargar_usuarios()

        else:

            QMessageBox.critical(
                self,
                "Error",
                resultado["mensaje"]
            )
    
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

if __name__ == "__main__":

    import sys

    from PySide6.QtWidgets import QApplication

    app = QApplication(sys.argv)

    ventana = VentanaUsuarios()

    ventana.show()

    sys.exit(app.exec())            