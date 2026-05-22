import logging

from PySide6.QtWidgets import (
    QDialog,
    QMessageBox
)

from PySide6.QtCore import (
    QStringListModel
)

from ui.permiso_usuario_ui import (
    Ui_EditarUsuario
)

from services.permisos_service import (
    listar_permisos
)

from services.usuarios_permisos_service import (
    listar_permisos_usuario
)

from PySide6.QtGui import (
    QStringListModel
)

from services.permisos_service import (
    listar_permisos
)

from services.usuarios_permisos_service import (
    obtener_permisos_usuario
)

class VentanaPermisosUsuario(QDialog):

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
        # MODELOS
        # -----------------------------------

        self.model_disponibles = (
            QStringListModel()
        )

        self.model_asignados = (
            QStringListModel()
        )

        self.ui.listView_permisos_disponibles.setModel(
            self.model_disponibles
        )

        self.ui.listView_permisos_asignados.setModel(
            self.model_asignados
        )

        # -----------------------------------
        # CARGAR DATOS
        # -----------------------------------

        self.cargar_permisos()

    # -----------------------------------
    # CARGAR PERMISOS
    # -----------------------------------

    def cargar_permisos(self):

    logging.debug(
        f"Cargando permisos usuario: "
        f"{self.usuario.usuario}"
    )

    permisos_sistema = listar_permisos()

    permisos_usuario = (
        obtener_permisos_usuario(
            self.usuario.id
        )
    )

    codigos_usuario = [

        permiso.codigo
        for permiso
        in permisos_usuario
    ]

    permisos_asignados = []

    permisos_disponibles = []

    for permiso in permisos_sistema:

        if permiso.codigo in codigos_usuario:

            permisos_asignados.append(
                permiso.codigo
            )

        else:

            permisos_disponibles.append(
                permiso.codigo
            )

    self.model_disponibles = (
        QStringListModel()
    )

    self.model_disponibles.setStringList(
        permisos_disponibles
    )

    self.ui.listView_permisos_disponibles.setModel(
        self.model_disponibles
    )

    self.model_asignados = (
        QStringListModel()
    )

    self.model_asignados.setStringList(
        permisos_asignados
    )

    self.ui.listView_permisos_asignados.setModel(
        self.model_asignados
    )

    logging.debug(
        f"Disponibles: "
        f"{len(permisos_disponibles)} | "
        f"Asignados: "
        f"{len(permisos_asignados)}"
    )