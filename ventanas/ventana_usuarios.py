import logging

from PySide6.QtWidgets import (
    QDialog,
    QMessageBox
)

from PySide6.QtGui import QStandardItemModel, QStandardItem

from ui.ventana_usuario import Ui_VentanaUsuarios

from core.session_manager import SessionManager
from core.async_api import run_async

from ventanas.ventana_alta_usuario import VentanaAltaUsuario

from utils.user_helpers import get_usuario_attr

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
            f"{get_usuario_attr(self.usuario_seleccionado,'usuario')}"
        )

        from ventanas.ventana_editar_usuario import (
            VentanaEditarUsuario
        )
        
        dialogo = VentanaEditarUsuario(
            self.usuario_seleccionado,
            self
        )

        def _on_usuario_actualizado(datos_actualizados):
            usuario_id = get_usuario_attr(self.usuario_seleccionado, "id")
            self._actualizar_fila_usuario(usuario_id, datos_extra=datos_actualizados)

        dialogo.usuario_actualizado.connect(
            _on_usuario_actualizado
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
            f"{get_usuario_attr(self.usuario_seleccionado,'usuario')}"
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
            "Email",
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

        def _on_success(resultado):
            if not resultado.get("success"):
                QMessageBox.critical(
                    self,
                    "Error",
                    resultado.get("mensaje", "Error al listar usuarios")
                )
                return

            usuarios = resultado.get("usuarios", [])

            for usuario in usuarios:

                fila = [
                
                    QStandardItem(
                        str(get_usuario_attr(usuario, "id"))
                    ),

                    QStandardItem(
                        str(get_usuario_attr(usuario, "nombre", ""))
                    ),

                    QStandardItem(
                        str(get_usuario_attr(usuario, "apellido", ""))
                    ),

                    QStandardItem(
                        str(get_usuario_attr(usuario, "usuario", ""))
                    ),

                    QStandardItem(
                        str(get_usuario_attr(usuario, "email", ""))
                    ),

                    QStandardItem(
                        str(get_usuario_attr(usuario, "rol", ""))
                    ),

                    QStandardItem(
                        str(
                            get_usuario_attr(
                                usuario,
                                "nivel_seguridad",
                                0
                            )
                        )
                    ),

                    QStandardItem(
                        "Sí"
                        if get_usuario_attr(
                            usuario,
                            "activo",
                            False
                        )
                        else "No"
                    )
                ]

                self.model.appendRow(fila)

            logging.debug(
                f"Usuarios cargados: "
                f"{len(usuarios)}"
            )

        def _on_error(msg):
            logging.exception("Error cargando usuarios")
            QMessageBox.critical(
                self,
                "Error",
                "No se pudieron cargar usuarios."
            )

        client = SessionManager.get_usuarios_client()
        run_async(
            client.listar_usuarios,
            on_success=_on_success,
            on_error=_on_error,
            limit=500,
        )

    def seleccionar_usuario(self, index):

        fila = index.row()
    
        item_id = self.model.item(fila, 0)
    
        if not item_id:
        
            return
    
        self.usuario_seleccionado_id = int(
            item_id.text()
        )

        usuario = {
            "id": self.usuario_seleccionado_id,
            "nombre": (self.model.item(fila, 1).text() if self.model.item(fila, 1) else ""),
            "apellido": (self.model.item(fila, 2).text() if self.model.item(fila, 2) else ""),
            "usuario": (self.model.item(fila, 3).text() if self.model.item(fila, 3) else ""),
            "email": (self.model.item(fila, 4).text() if self.model.item(fila, 4) else ""),
            "rol": (self.model.item(fila, 5).text() if self.model.item(fila, 5) else ""),
            "nivel_seguridad": int(self.model.item(fila, 6).text() or 0),
            "activo": (self.model.item(fila, 7).text() == "Sí"),
        }
    
        self.usuario_seleccionado = usuario
    
        logging.debug(
            f"Usuario seleccionado: "
            f"{get_usuario_attr(self.usuario_seleccionado,'usuario')}"
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
            f"{get_usuario_attr(self.usuario_seleccionado,'usuario')}"
        )

        client = SessionManager.get_usuarios_client()
        usuario_id = get_usuario_attr(self.usuario_seleccionado, "id")

        def _on_success(resultado):
            if resultado["success"]:

                QMessageBox.information(
                    self,
                    "Usuario",
                    resultado["mensaje"]
                )

                self._actualizar_fila_usuario(usuario_id, activo=True)

            else:

                QMessageBox.critical(
                    self,
                    "Error",
                    resultado["mensaje"]
                )

        def _on_error(msg):
            QMessageBox.critical(
                self,
                "Error",
                msg
            )

        run_async(
            client.activar_usuario,
            usuario_id,
            on_success=_on_success,
            on_error=_on_error,
        )

    def _actualizar_fila_usuario(self, usuario_id, activo=None, datos_extra=None):

        mapa_columna = {
            "id": 0,
            "nombre": 1,
            "apellido": 2,
            "usuario": 3,
            "email": 4,
            "rol": 5,
            "nivel_seguridad": 6,
            "activo": 7,
        }

        for fila in range(self.model.rowCount()):

            item_id = self.model.item(fila, 0)

            if item_id and int(item_id.text()) == usuario_id:

                if activo is not None:
                    self.model.setItem(
                        fila, 7,
                        QStandardItem("Sí" if activo else "No")
                    )

                if datos_extra:
                    for campo, valor in datos_extra.items():
                        col = mapa_columna.get(campo)
                        if col is not None:
                            self.model.setItem(
                                fila, col,
                                QStandardItem(str(valor))
                            )

                break

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
            f"{get_usuario_attr(self.usuario_seleccionado,'usuario')}"
        )

        usuario_actual = SessionManager.obtener_usuario()

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
            get_usuario_attr(usuario_actual, "id")
            ==
            get_usuario_attr(
                self.usuario_seleccionado,
                "id"
            )
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

        client = SessionManager.get_usuarios_client()
        usuario_id = get_usuario_attr(self.usuario_seleccionado, "id")

        def _on_success(resultado):
            if resultado["success"]:

                QMessageBox.information(
                    self,
                    "Usuario",
                    resultado["mensaje"]
                )

                self._actualizar_fila_usuario(usuario_id, activo=False)

            else:

                QMessageBox.critical(
                    self,
                    "Error",
                    resultado["mensaje"]
                )

        def _on_error(msg):
            QMessageBox.critical(
                self,
                "Error",
                msg
            )

        run_async(
            client.desactivar_usuario,
            usuario_id,
            on_success=_on_success,
            on_error=_on_error,
        )
    
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

if __name__ == "__main__":

    import sys

    from PySide6.QtWidgets import QApplication

    from ui.styles import style_global_dark

    app = QApplication(sys.argv)
    app.setStyleSheet(style_global_dark())

    ventana = VentanaUsuarios()

    ventana.show()

    sys.exit(app.exec())            