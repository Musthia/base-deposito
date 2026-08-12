# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'inicio_sesion.ui'
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
from PySide6.QtWidgets import (QApplication, QLabel, QLineEdit, QMainWindow,
    QPushButton, QSizePolicy, QWidget)
import img.fondo_ini_ses_rc

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        if not MainWindow.objectName():
            MainWindow.setObjectName(u"MainWindow")
        MainWindow.setEnabled(True)
        MainWindow.resize(308, 230)
        MainWindow.setFocusPolicy(Qt.FocusPolicy.WheelFocus)
        self.centralwidget = QWidget(MainWindow)
        self.centralwidget.setObjectName(u"centralwidget")
        self.centralwidget.setEnabled(True)
        self.boton_iniciar_sesion = QPushButton(self.centralwidget)
        self.boton_iniciar_sesion.setObjectName(u"boton_iniciar_sesion")
        self.boton_iniciar_sesion.setGeometry(QRect(80, 120, 201, 51))
        palette = QPalette()
        brush = QBrush(QColor(0, 0, 0, 255))
        brush.setStyle(Qt.BrushStyle.SolidPattern)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.WindowText, brush)
        brush1 = QBrush(QColor(0, 127, 190, 255))
        brush1.setStyle(Qt.BrushStyle.SolidPattern)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.Button, brush1)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.Text, brush)
        brush2 = QBrush(QColor(255, 255, 255, 255))
        brush2.setStyle(Qt.BrushStyle.SolidPattern)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.ButtonText, brush2)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.Base, brush1)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.Window, brush1)
        brush3 = QBrush(QColor(96, 47, 255, 255))
        brush3.setStyle(Qt.BrushStyle.SolidPattern)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.Highlight, brush3)
        palette.setBrush(QPalette.ColorGroup.Active, QPalette.ColorRole.HighlightedText, brush)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.WindowText, brush)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Button, brush1)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Text, brush)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.ButtonText, brush2)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Base, brush1)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Window, brush1)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.Highlight, brush3)
        palette.setBrush(QPalette.ColorGroup.Inactive, QPalette.ColorRole.HighlightedText, brush)
        palette.setBrush(QPalette.ColorGroup.Disabled, QPalette.ColorRole.Button, brush1)
        palette.setBrush(QPalette.ColorGroup.Disabled, QPalette.ColorRole.Base, brush1)
        palette.setBrush(QPalette.ColorGroup.Disabled, QPalette.ColorRole.Window, brush1)
        palette.setBrush(QPalette.ColorGroup.Disabled, QPalette.ColorRole.Highlight, brush3)
        palette.setBrush(QPalette.ColorGroup.Disabled, QPalette.ColorRole.HighlightedText, brush)
        self.boton_iniciar_sesion.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self.boton_iniciar_sesion.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.boton_iniciar_sesion.setContextMenuPolicy(Qt.ContextMenuPolicy.ActionsContextMenu)
        self.boton_iniciar_sesion.setLayoutDirection(Qt.LayoutDirection.LeftToRight)
        self.boton_iniciar_sesion.setAutoFillBackground(False)
        self.boton_recuperar_contrasena = QPushButton(self.centralwidget)
        self.boton_recuperar_contrasena.setObjectName(u"boton_recuperar_contrasena")
        self.boton_recuperar_contrasena.setGeometry(QRect(80, 180, 201, 35))
        self.boton_recuperar_contrasena.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self.label_contrasena = QLabel(self.centralwidget)
        self.label_contrasena.setObjectName(u"label_contrasena")
        self.label_contrasena.setEnabled(True)
        self.label_contrasena.setGeometry(QRect(60, 60, 95, 24))
        self.label_contrasena.setCursor(QCursor(Qt.CursorShape.ArrowCursor))
        self.label_contrasena.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.label_contrasena.setIndent(0)
        self.entry_contrasena = QLineEdit(self.centralwidget)
        self.entry_contrasena.setObjectName(u"entry_contrasena")
        self.entry_contrasena.setGeometry(QRect(178, 60, 122, 26))
        self.entry_contrasena.setFocusPolicy(Qt.FocusPolicy.TabFocus)
        self.entry_contrasena.setEchoMode(QLineEdit.EchoMode.Password)
        self.label_usuario = QLabel(self.centralwidget)
        self.label_usuario.setObjectName(u"label_usuario")
        self.label_usuario.setEnabled(True)
        self.label_usuario.setGeometry(QRect(26, 20, 71, 24))
        self.label_usuario.setCursor(QCursor(Qt.CursorShape.ArrowCursor))
        self.label_usuario.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.entry_usuario = QLineEdit(self.centralwidget)
        self.entry_usuario.setObjectName(u"entry_usuario")
        self.entry_usuario.setGeometry(QRect(118, 20, 122, 26))
        self.entry_usuario.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        MainWindow.setCentralWidget(self.centralwidget)
        QWidget.setTabOrder(self.entry_usuario, self.entry_contrasena)
        QWidget.setTabOrder(self.entry_contrasena, self.boton_iniciar_sesion)
        QWidget.setTabOrder(self.boton_iniciar_sesion, self.boton_recuperar_contrasena)

        self.retranslateUi(MainWindow)
        self.entry_usuario.returnPressed.connect(self.entry_contrasena.selectAll)
        self.entry_contrasena.returnPressed.connect(self.boton_iniciar_sesion.click)

        self.boton_iniciar_sesion.setDefault(False)

        QMetaObject.connectSlotsByName(MainWindow)
    # setupUi

    def retranslateUi(self, MainWindow):
        MainWindow.setWindowTitle(QCoreApplication.translate("MainWindow", u"INICIO DE SESION", None))
        self.boton_iniciar_sesion.setText(QCoreApplication.translate("MainWindow", u"Iniciar Sesi\u00f3n: D A T C O R R ", None))
        self.boton_recuperar_contrasena.setText(QCoreApplication.translate("MainWindow", u"\u00bfOlvid\u00f3 su contrase\u00f1a?", None))
        self.label_contrasena.setText(QCoreApplication.translate("MainWindow", u"Contrase\u00f1a", None))
        self.entry_contrasena.setText("")
        self.label_usuario.setText(QCoreApplication.translate("MainWindow", u"Usuario", None))
    # retranslateUi

