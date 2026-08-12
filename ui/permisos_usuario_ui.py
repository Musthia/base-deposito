# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'permisos_usuario.ui'
##
## Created by: Qt User Interface Compiler version 6.10.3
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QApplication, QDialog, QFrame, QGridLayout,
    QListView, QPushButton, QSizePolicy, QWidget)

class Ui_EditarUsuario(object):
    def setupUi(self, EditarUsuario):
        if not EditarUsuario.objectName():
            EditarUsuario.setObjectName(u"EditarUsuario")
        EditarUsuario.resize(389, 335)
        EditarUsuario.setStyleSheet(u"QDialog {\n"
"    background-color: #1e1e1e;\n"
"}\n"
"QLabel {\n"
"    color: #e0e0e0;\n"
"    font-size: 14px;\n"
"    font-family: \"Segoe UI\";\n"
"}\n"
"QListView {\n"
"    background-color: #2b2b2b;\n"
"    color: #e0e0e0;\n"
"    border: 1px solid #555555;\n"
"    font-size: 14px;\n"
"    font-family: \"Segoe UI\";\n"
"}\n"
"QPushButton {\n"
"    background-color: #3a6df0;\n"
"    color: #ffffff;\n"
"    border: 1px solid #1a252f;\n"
"    border-radius: 4px;\n"
"    padding: 8px 16px;\n"
"    font-size: 14px;\n"
"    font-family: \"Segoe UI\";\n"
"}\n"
"QPushButton:hover {\n"
"    background-color: #4d7bff;\n"
"}\n"
"QPushButton:pressed {\n"
"    background-color: #2f58cc;\n"
"}")
        self.gridLayout = QGridLayout(EditarUsuario)
        self.gridLayout.setObjectName(u"gridLayout")
        self.listView_permisos_disponibles = QListView(EditarUsuario)
        self.listView_permisos_disponibles.setObjectName(u"listView_permisos_disponibles")

        self.gridLayout.addWidget(self.listView_permisos_disponibles, 0, 0, 1, 2)

        self.pushButton_guardar = QPushButton(EditarUsuario)
        self.pushButton_guardar.setObjectName(u"pushButton_guardar")
        self.pushButton_guardar.setStyleSheet(u"background-color: #2e7d32;\n"
"color: #ffffff;\n"
"font: bold 12pt \"Segoe UI\";\n"
"padding: 8px 16px;")

        self.gridLayout.addWidget(self.pushButton_guardar, 2, 2, 1, 1)

        self.pushButton_asignar = QPushButton(EditarUsuario)
        self.pushButton_asignar.setObjectName(u"pushButton_asignar")
        self.pushButton_asignar.setStyleSheet(u"background-color: #2e7d32;\n"
"color: #ffffff;\n"
"border: 1px solid #1a252f;\n"
"border-radius: 4px;")

        self.gridLayout.addWidget(self.pushButton_asignar, 2, 0, 1, 1)

        self.listView_permisos_asignados = QListView(EditarUsuario)
        self.listView_permisos_asignados.setObjectName(u"listView_permisos_asignados")
        self.listView_permisos_asignados.setEnabled(True)

        self.gridLayout.addWidget(self.listView_permisos_asignados, 0, 2, 1, 2)

        self.pushButton_guardar_2 = QPushButton(EditarUsuario)
        self.pushButton_guardar_2.setObjectName(u"pushButton_guardar_2")
        self.pushButton_guardar_2.setStyleSheet(u"\n"
"font: bold 12pt \"Segoe UI\";\n"
"background-color: #c94f42;\n"
"color: #ffffff;\n"
"padding: 8px 16px;")

        self.gridLayout.addWidget(self.pushButton_guardar_2, 2, 3, 1, 1)

        self.pushButton_quitar = QPushButton(EditarUsuario)
        self.pushButton_quitar.setObjectName(u"pushButton_quitar")
        self.pushButton_quitar.setStyleSheet(u"background-color: #c9a227;\n"
"color: #ffffff;\n"
"border: 1px solid #1a252f;\n"
"border-radius: 4px;")

        self.gridLayout.addWidget(self.pushButton_quitar, 2, 1, 1, 1)

        self.line = QFrame(EditarUsuario)
        self.line.setObjectName(u"line")
        self.line.setLineWidth(0)
        self.line.setMidLineWidth(1000)
        self.line.setFrameShape(QFrame.Shape.HLine)
        self.line.setFrameShadow(QFrame.Shadow.Sunken)

        self.gridLayout.addWidget(self.line, 1, 0, 1, 4)


        self.retranslateUi(EditarUsuario)

        QMetaObject.connectSlotsByName(EditarUsuario)
    # setupUi

    def retranslateUi(self, EditarUsuario):
        EditarUsuario.setWindowTitle(QCoreApplication.translate("EditarUsuario", u"Editar Usuario", None))
        self.pushButton_guardar.setText(QCoreApplication.translate("EditarUsuario", u"ACEPTAR", None))
        self.pushButton_asignar.setText(QCoreApplication.translate("EditarUsuario", u"\u2795 Asignar", None))
        self.pushButton_guardar_2.setText(QCoreApplication.translate("EditarUsuario", u"CANCELAR", None))
        self.pushButton_quitar.setText(QCoreApplication.translate("EditarUsuario", u"\u2796 Quitar", None))
    # retranslateUi

