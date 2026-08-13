# -*- coding: utf-8 -*-

from PySide6.QtCore import QCoreApplication, QMetaObject, QSize
from PySide6.QtWidgets import (QCheckBox, QComboBox, QDialog,
    QGridLayout, QLabel, QLineEdit,
    QPushButton, QSpinBox)


class Ui_EditarUsuario(object):
    def setupUi(self, EditarUsuario):
        if not EditarUsuario.objectName():
            EditarUsuario.setObjectName(u"EditarUsuario")
        EditarUsuario.resize(520, 420)
        EditarUsuario.setMinimumSize(QSize(480, 380))
        self.gridLayout = QGridLayout(EditarUsuario)
        self.gridLayout.setObjectName(u"gridLayout")
        self.gridLayout.setVerticalSpacing(10)
        self.gridLayout.setHorizontalSpacing(10)
        self.gridLayout.setContentsMargins(20, 20, 20, 20)
        self.gridLayout.setColumnStretch(0, 0)
        self.gridLayout.setColumnStretch(1, 1)
        self.gridLayout.setColumnStretch(2, 0)
        self.gridLayout.setColumnStretch(3, 1)
        self.gridLayout.setRowStretch(0, 0)
        self.gridLayout.setRowStretch(1, 0)
        self.gridLayout.setRowStretch(2, 0)
        self.gridLayout.setRowStretch(3, 0)
        self.gridLayout.setRowStretch(4, 1)

        self.label = QLabel(EditarUsuario)
        self.label.setObjectName(u"label")
        self.gridLayout.addWidget(self.label, 0, 0, 1, 1)

        self.lineEdit_nombre = QLineEdit(EditarUsuario)
        self.lineEdit_nombre.setObjectName(u"lineEdit_nombre")
        self.gridLayout.addWidget(self.lineEdit_nombre, 0, 1, 1, 1)

        self.label_2 = QLabel(EditarUsuario)
        self.label_2.setObjectName(u"label_2")
        self.gridLayout.addWidget(self.label_2, 0, 2, 1, 1)

        self.lineEdit_apellido = QLineEdit(EditarUsuario)
        self.lineEdit_apellido.setObjectName(u"lineEdit_apellido")
        self.gridLayout.addWidget(self.lineEdit_apellido, 0, 3, 1, 1)

        self.label_email_t = QLabel(EditarUsuario)
        self.label_email_t.setObjectName(u"label_email_t")
        self.gridLayout.addWidget(self.label_email_t, 1, 0, 1, 1)

        self.lineEdit_email = QLineEdit(EditarUsuario)
        self.lineEdit_email.setObjectName(u"lineEdit_email")
        self.gridLayout.addWidget(self.lineEdit_email, 1, 1, 1, 1)

        self.label_3 = QLabel(EditarUsuario)
        self.label_3.setObjectName(u"label_3")
        self.gridLayout.addWidget(self.label_3, 1, 2, 1, 1)

        self.lineEdit_usuario = QLineEdit(EditarUsuario)
        self.lineEdit_usuario.setObjectName(u"lineEdit_usuario")
        self.gridLayout.addWidget(self.lineEdit_usuario, 1, 3, 1, 1)

        self.label_4 = QLabel(EditarUsuario)
        self.label_4.setObjectName(u"label_4")
        self.gridLayout.addWidget(self.label_4, 2, 0, 1, 1)

        self.comboBox_rol = QComboBox(EditarUsuario)
        self.comboBox_rol.setObjectName(u"comboBox_rol")
        self.gridLayout.addWidget(self.comboBox_rol, 2, 1, 1, 1)

        self.label_5 = QLabel(EditarUsuario)
        self.label_5.setObjectName(u"label_5")
        self.gridLayout.addWidget(self.label_5, 2, 2, 1, 1)

        self.spinBox_nivel = QSpinBox(EditarUsuario)
        self.spinBox_nivel.setObjectName(u"spinBox_nivel")
        self.spinBox_nivel.setMinimum(1)
        self.spinBox_nivel.setMaximum(10)
        self.gridLayout.addWidget(self.spinBox_nivel, 2, 3, 1, 1)

        self.label_7 = QLabel(EditarUsuario)
        self.label_7.setObjectName(u"label_7")
        self.gridLayout.addWidget(self.label_7, 3, 0, 1, 1)

        self.lineEdit_password = QLineEdit(EditarUsuario)
        self.lineEdit_password.setObjectName(u"lineEdit_password")
        self.lineEdit_password.setEchoMode(QLineEdit.EchoMode.Password)
        self.gridLayout.addWidget(self.lineEdit_password, 3, 1, 1, 1)

        self.label_6 = QLabel(EditarUsuario)
        self.label_6.setObjectName(u"label_6")
        self.gridLayout.addWidget(self.label_6, 3, 2, 1, 1)

        self.checkBox_activo = QCheckBox(EditarUsuario)
        self.checkBox_activo.setObjectName(u"checkBox_activo")
        self.gridLayout.addWidget(self.checkBox_activo, 3, 3, 1, 1)

        self.pushButton_guardar = QPushButton(EditarUsuario)
        self.pushButton_guardar.setObjectName(u"pushButton_guardar")
        self.gridLayout.addWidget(self.pushButton_guardar, 4, 1, 1, 1)

        self.pushButton_cancelar = QPushButton(EditarUsuario)
        self.pushButton_cancelar.setObjectName(u"pushButton_cancelar")
        self.gridLayout.addWidget(self.pushButton_cancelar, 4, 2, 1, 1)

        self.pushButton_reset_pass = QPushButton(EditarUsuario)
        self.pushButton_reset_pass.setObjectName(u"pushButton_reset_pass")
        self.gridLayout.addWidget(self.pushButton_reset_pass, 4, 3, 1, 1)

        self.retranslateUi(EditarUsuario)
        QMetaObject.connectSlotsByName(EditarUsuario)

    def retranslateUi(self, EditarUsuario):
        EditarUsuario.setWindowTitle(QCoreApplication.translate("EditarUsuario", u"Editar Usuario", None))
        self.label_7.setText(QCoreApplication.translate("EditarUsuario", u"Password", None))
        self.label_5.setText(QCoreApplication.translate("EditarUsuario", u"Nivel de Seguridad", None))
        self.pushButton_cancelar.setText(QCoreApplication.translate("EditarUsuario", u"CANCELAR", None))
        self.label.setText(QCoreApplication.translate("EditarUsuario", u"Nombre", None))
        self.label_3.setText(QCoreApplication.translate("EditarUsuario", u"Usuario", None))
        self.label_4.setText(QCoreApplication.translate("EditarUsuario", u"Rol", None))
        self.pushButton_reset_pass.setText(QCoreApplication.translate("EditarUsuario", u"Reset Password", None))
        self.pushButton_guardar.setText(QCoreApplication.translate("EditarUsuario", u"GUARDAR", None))
        self.checkBox_activo.setText(QCoreApplication.translate("EditarUsuario", u"Usuario Activo", None))
        self.label_2.setText(QCoreApplication.translate("EditarUsuario", u"Apellido", None))
        self.label_6.setText(QCoreApplication.translate("EditarUsuario", u"Activo", None))
        self.label_email_t.setText(QCoreApplication.translate("EditarUsuario", u"Email", None))
