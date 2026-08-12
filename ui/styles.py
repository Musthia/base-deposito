# =========================
# Paleta oscura central
# =========================

BG_WINDOW      = "#1e1e1e"
BG_ELEVADO     = "#252526"
BG_INPUT       = "#2b2b2b"
BG_HOVER       = "#333333"
TEXTO_PRINCIPAL = "#e0e0e0"
TEXTO_SECUNDARIO = "#b0b0b0"
TEXTO_PLACEHOLDER = "#7a7a7a"
TEXTO_ENFATICO = "#ffffff"
BORDE          = "#555555"
BORDE_FOCUS    = "#3daee9"
BTN_PRIMARIO   = "#3a6df0"
BTN_HOVER      = "#4d7bff"
BTN_PRESSED    = "#2f58cc"
BTN_DANGER     = "#c94f42"
BTN_SUCCESS    = "#2e7d32"
SELECCION      = "#263238"
DISABLED       = "#666666"

# =========================
# Tipografía legible (fuente única)
# =========================

FUENTE_FAMILIA      = "Segoe UI"
FUENTE_TAMANO_BASE  = "14px"
FUENTE_TAMANO_INPUT = "14px"
FUENTE_TAMANO_BOTON = "14px"
FUENTE_TAMANO_TITULO = "16px"
FUENTE_KPI          = "18px"


def style_global_dark():
    return f"""
    QMainWindow {{
        background-color: {BG_WINDOW};
        color: {TEXTO_PRINCIPAL};
    }}

    QDialog {{
        background-color: {BG_WINDOW};
        color: {TEXTO_PRINCIPAL};
    }}

    QWidget {{
        color: {TEXTO_PRINCIPAL};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QLabel {{
        color: {TEXTO_PRINCIPAL};
        background-color: transparent;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QLineEdit, QSpinBox, QDateEdit, QTextEdit, QPlainTextEdit {{
        background-color: {BG_INPUT};
        color: {TEXTO_PRINCIPAL};
        border: 1px solid {BORDE};
        border-radius: 4px;
        padding: 6px;
        selection-background-color: {BORDE_FOCUS};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_INPUT};
    }}

    QLineEdit:focus, QSpinBox:focus, QDateEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
        border: 1px solid {BORDE_FOCUS};
        background-color: #303030;
    }}

    QLineEdit:hover, QSpinBox:hover, QDateEdit:hover, QTextEdit:hover, QPlainTextEdit:hover {{
        border: 1px solid #777777;
    }}

    QLineEdit:disabled, QSpinBox:disabled, QDateEdit:disabled {{
        background-color: #2e2e2e;
        color: {TEXTO_SECUNDARIO};
    }}

    QPushButton {{
        background-color: {BTN_PRIMARIO};
        color: {TEXTO_ENFATICO};
        border: 1px solid #1a252f;
        border-radius: 4px;
        padding: 10px 16px;
        font-weight: bold;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BOTON};
        min-height: 18px;
    }}

    QPushButton:hover {{
        background-color: {BTN_HOVER};
        border-color: #777777;
    }}

    QPushButton:pressed {{
        background-color: {BTN_PRESSED};
        border-color: {BORDE_FOCUS};
    }}

    QPushButton:focus {{
        border: 2px solid {BORDE_FOCUS};
    }}

    QPushButton:disabled {{
        background-color: {DISABLED};
        color: #b0b0b0;
        border: 1px solid #555555;
    }}

    QComboBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_PRINCIPAL};
        border: 1px solid {BORDE};
        border-radius: 4px;
        padding: 6px;
        padding-right: 28px;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_INPUT};
    }}

    QComboBox:hover {{
        border: 1px solid #777777;
    }}

    QComboBox:focus {{
        border: 1px solid {BORDE_FOCUS};
    }}

    QComboBox::drop-down {{
        subcontrol-origin: padding;
        subcontrol-position: top right;
        width: 26px;
        border-left: 1px solid {BORDE};
        background-color: #2b2b2b;
    }}

    QComboBox QAbstractItemView {{
        background-color: #000000;
        color: #fbfdfd;
        selection-background-color: {SELECCION};
        selection-color: #6fcc7e;
        outline: 0;
    }}

    QCheckBox {{
        color: {TEXTO_PRINCIPAL};
        spacing: 6px;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QCheckBox::indicator {{
        width: 16px;
        height: 16px;
        border: 1px solid {BORDE};
        border-radius: 3px;
        background-color: {BG_INPUT};
    }}

    QCheckBox::indicator:checked {{
        background-color: {BTN_PRIMARIO};
        border-color: {BTN_PRIMARIO};
    }}

    QTabWidget::pane {{
        border: 1px solid {BORDE};
        top: -1px;
        background-color: {BG_WINDOW};
    }}

    QTabBar::tab {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_PRINCIPAL};
        font-weight: bold;
        padding: 9px 16px;
        border: 1px solid {BORDE};
        border-bottom: none;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QTabBar::tab:selected {{
        background-color: {BG_HOVER};
        color: {TEXTO_ENFATICO};
    }}

    QTabBar::tab:hover {{
        background-color: #2e2e2e;
    }}

    QTableView, QTreeView, QTableWidget, QListWidget {{
        background-color: {BG_INPUT};
        color: {TEXTO_PRINCIPAL};
        alternate-background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
        selection-background-color: {SELECCION};
        selection-color: {TEXTO_ENFATICO};
        gridline-color: #3a3a3a;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QHeaderView::section {{
        background-color: {BG_HOVER};
        color: {TEXTO_PRINCIPAL};
        padding: 6px;
        border: 1px solid #3a3a3a;
        font-weight: bold;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QHeaderView::section:hover {{
        background-color: #3e3e3e;
    }}

    QMenu, QMenuBar {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_PRINCIPAL};
        border: 1px solid {BORDE};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QMenu::item:selected {{
        background-color: {SELECCION};
    }}

    QMenuBar::item:selected {{
        background-color: {SELECCION};
    }}

    QStatusBar {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_PRINCIPAL};
    }}

    QToolBar {{
        background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
    }}

    QToolTip {{
        background-color: #333333;
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        padding: 6px;
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QGroupBox {{
        border: 1px solid {BORDE};
        border-radius: 4px;
        margin-top: 10px;
        padding-top: 10px;
        color: {TEXTO_PRINCIPAL};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QGroupBox::title {{
        subcontrol-origin: margin;
        left: 10px;
        padding: 0 4px;
        font-weight: bold;
    }}

    QFrame {{
        color: {TEXTO_PRINCIPAL};
    }}

    QMessageBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_PRINCIPAL};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QMessageBox QLabel {{
        color: {TEXTO_PRINCIPAL};
        font-family: "{FUENTE_FAMILIA}";
        font-size: {FUENTE_TAMANO_BASE};
    }}

    QMessageBox QPushButton {{
        min-width: 90px;
    }}

    QProgressBar {{
        background-color: {BG_INPUT};
        border: 1px solid {BORDE};
        border-radius: 4px;
        text-align: center;
    }}

    QProgressBar::chunk {{
        background-color: {BTN_PRIMARIO};
    }}
    """


def style_combobox_dark():
    return """
    QComboBox {
        background-color: #567bf3;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 6px;
        padding-right: 28px; /* espacio para flecha nativa */
        font-family: "Segoe UI";
        font-size: 14px;
    }

    QComboBox:hover {
        border: 1px solid #777;
    }

    QComboBox:focus {
        border: 1px solid #3daee9;
    }

    QComboBox::drop-down {
        subcontrol-origin: padding;
        subcontrol-position: top right;
        width: 26px;
        border-left: 1px solid #555;
        background-color: #2b2b2b;
    }

    QComboBox QAbstractItemView {
        background-color: #000000;
        color: #fbfdfd;
        selection-color: #6fcc7e;
        outline: 0;
        font-family: "Segoe UI";
        font-size: 14px;
    }
    """

def style_pushbutton_dark():
    return """ 
    QPushButton {
    background-color: #455a50;
    color: #f9fbfb;
    border: 1px solid #1a252f;
    padding: 10px 18px;
    min-height: 18px;
    font-weight: bold;
    font-size: 14px;
    font-family: "Segoe UI";
    }
    QPushButton:hover {
        background-color: #546e7a;     /* tono más claro al pasar el mouse */
    }
    QPushButton:pressed {
        background-color: #2e4053;     /* más oscuro al presionar */
        border: 2px solid #1a252f;
    }
    QPushButton:disabled {
        background-color: #a7b0b5;
        color: #dfe4e8;
        border: 1px solid #95a5a6;
    } 
    """

def style_button_success():
    return """
    QPushButton {
        background-color: #2e7d32;
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 4px;
        padding: 10px 18px;
        min-height: 18px;
        font-weight: bold;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    QPushButton:hover {
        background-color: #388e3c;
        border-color: #777777;
    }
    QPushButton:pressed {
        background-color: #1b5e20;
        border-color: #3daee9;
    }
    QPushButton:disabled {
        background-color: #666666;
        color: #b0b0b0;
    }
    """

def style_button_danger():
    return """
    QPushButton {
        background-color: #c94f42;
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 4px;
        padding: 10px 18px;
        min-height: 18px;
        font-weight: bold;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    QPushButton:hover {
        background-color: #e05a4b;
        border-color: #777777;
    }
    QPushButton:pressed {
        background-color: #a03c31;
        border-color: #3daee9;
    }
    QPushButton:disabled {
        background-color: #666666;
        color: #b0b0b0;
    }
    """

def style_dialog_dark():
    return """
    QDialog {
        background-color: #1e1e1e;
    }

    QLabel {
        color: #e0e0e0;
        font-size: 14px;
        font-family: "Segoe UI";
        background-color: #1e1e1e;
    }

    QLineEdit {
        background-color: #2b2b2b;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 6px;
        font-size: 14px;
        font-family: "Segoe UI";
        selection-background-color: #3daee9;
    }

    QLineEdit:focus {
        border: 1px solid #3daee9;
        background-color: #303030;
    }

    QLineEdit:hover {
        border: 1px solid #777;
    }

    QComboBox {
        background-color: #2b2b2b;
        color: #f0f0f0;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 6px;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QCheckBox {
        color: #e0e0e0;
        font-size: 14px;
        font-family: "Segoe UI";
        spacing: 6px;
    }

    QToolTip {
        background-color: #333333;
        color: #ffffff;
        border: 1px solid #555;
        padding: 6px;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QPushButton {
        background-color: #3a3a3a;
        color: #ffffff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 10px 18px;
        min-height: 18px;
        font-weight: bold;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QPushButton:hover {
        background-color: #444;
        border-color: #777;
    }

    QPushButton:pressed {
        background-color: #2f2f2f;
        border-color: #3daee9;
    }
    """

def style_messagebox_dark():
    return """
    QMessageBox {
        background-color: #2b2b2b;
        color: #e0e0e0;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QMessageBox QLabel {
        color: #e0e0e0;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QMessageBox QPushButton {
        background-color: #3a3a3a;
        color: #ffffff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 8px 16px;
        min-width: 90px;
        font-size: 14px;
        font-family: "Segoe UI";
    }

    QMessageBox QPushButton:hover {
        background-color: #444;
        border-color: #777;
    }

    QMessageBox QPushButton:pressed {
        background-color: #2f2f2f;
        border-color: #3daee9;
    }
    """

def style_lineedit_error():
    return """
    QLineEdit {
        border: 2px solid #d9534f;
        background-color: #2b2b2b;
        color: #ffffff;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    """

def style_lineedit_validation():
    return """
    QLineEdit[error="true"] {
        border: 1px solid #e53935;
        background-color: #3b1f1f;
        color: #ffffff;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    """

def style_tabbar_dark():
    return """
    QTabBar::tab {
        background-color: #252526;
        color: #e0e0e0;
        font-weight: bold;
        padding: 9px 16px;
        border: 1px solid #555;
        border-bottom: none;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    QTabBar::tab:selected {
        background-color: #333333;
        color: #ffffff;
    }
    QTabBar::tab:hover {
        background-color: #2e2e2e;
    }
    """

def style_treeview_dark():
    return """
    QTreeView {
        background-color: #2b2b2b;
        color: #e0e0e0;
        alternate-background-color: #252526;
        border: 1px solid #555;
        selection-background-color: #263238;
        selection-color: #ffffff;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    """

def style_header_dark():
    return """
    QHeaderView::section {
        background-color: #333333;
        color: #e0e0e0;
        padding: 6px;
        border: 1px solid #3a3a3a;
        font-weight: bold;
        font-size: 14px;
        font-family: "Segoe UI";
    }
    QHeaderView::section:hover {
        background-color: #3e3e3e;
    }
    QHeaderView::section:checked {
        background-color: #2f58cc;
    }
    """