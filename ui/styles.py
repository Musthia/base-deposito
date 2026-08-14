# =========================
# Paleta oscura central
# =========================

import os

try:
    from PIL import Image, ImageFilter
    _PIL_DISPONIBLE = True
except Exception:
    _PIL_DISPONIBLE = False

_FONDO_ORIGINAL = os.path.join(
    os.path.dirname(__file__),
    "..",
    "img",
    "fondo_institucional_datcorr.png"
).replace("\\", "/")

# ===================================================================
#  BLUR DEL FONDO DE TODA LA APP
# -------------------------------------------------------------------
#  AJUSTÁ ESTE VALOR según tu gusto:
#    BLUR_RADIO = 0   -> sin blur (imagen original)
#    BLUR_RADIO = 8   -> blur suave
#    BLUR_RADIO = 14  -> blur medio (valor actual)
#    BLUR_RADIO = 24  -> blur fuerte
#
#  SIN EDITAR CÓDIGO: también podés probar valores al vuelo con la
#  variable de entorno BLUR_RADIO antes de lanzar la app. Ejemplos:
#    PowerShell:
#      $env:BLUR_RADIO=20; python base_datcorr.py
#    CMD:
#      set BLUR_RADIO=20 && python base_datcorr.py
#
#  Al cambiar el valor se genera automáticamente una versión
#  difuminada cacheada en img/ (un archivo por valor).
# ===================================================================
BLUR_RADIO = int(os.environ.get("BLUR_RADIO", "14"))

_FONDO_BLUR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "img",
    f"fondo_institucional_datcorr_blur_{BLUR_RADIO}.png"
).replace("\\", "/")


def _generar_fondo_blur(radio=None):
    """Genera (una sola vez) la versión difuminada del fondo institucional."""
    radio = BLUR_RADIO if radio is None else max(0, int(radio))
    fondo_blur = os.path.join(
        os.path.dirname(__file__),
        "..",
        "img",
        f"fondo_institucional_datcorr_blur_{radio}.png"
    ).replace("\\", "/")

    if not _PIL_DISPONIBLE:
        return _FONDO_ORIGINAL
    if not os.path.exists(_FONDO_ORIGINAL):
        return _FONDO_ORIGINAL
    if os.path.exists(fondo_blur):
        return fondo_blur
    try:
        with Image.open(_FONDO_ORIGINAL) as im:
            im = im.convert("RGBA")
            base = Image.new("RGBA", im.size, (30, 30, 30, 255))
            base.paste(im, (0, 0), im)
            difuminada = base.convert("RGB").filter(
                ImageFilter.GaussianBlur(radio)
            )
            difuminada.save(fondo_blur)
        return fondo_blur
    except Exception:
        return _FONDO_ORIGINAL


FONDO_WINDOWS = _generar_fondo_blur()


def cambiar_blur(radio):
    """Regenera el fondo difuminado con un nuevo radio y actualiza la ruta global."""
    global BLUR_RADIO, FONDO_WINDOWS
    radio = max(0, int(radio))
    BLUR_RADIO = radio
    FONDO_WINDOWS = _generar_fondo_blur(radio)
    return FONDO_WINDOWS

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
# Resaltado de filas por estado (plantillas)
# =========================
# Fondo rojo (claro pero contrastante) para filas cuyo campo "Estado"
# contenga alguno de los patrones de ESTADOS_RESALTAR.
FILA_ESTADO_ROJO = "#a9554d"

# Patrones que activan el resaltado (se comparan en minúsculas, por
# coincidencia de texto dentro del valor del campo estado).
ESTADOS_RESALTAR = ["verificado"]

# =========================
# Tipografía legible (fuente única)
# =========================

FUENTE_FAMILIA      = '"Segoe UI Variable", "Segoe UI", "Helvetica Neue", Arial, sans-serif'
FUENTE_TAMANO_BASE  = "10pt"
FUENTE_TAMANO_INPUT = "10pt"
FUENTE_TAMANO_BOTON = "10pt"
FUENTE_TAMANO_TITULO = "12pt"
FUENTE_TAMANO_KPI   = "14pt"
FUENTE_PESO_NORMAL  = "400"
FUENTE_PESO_BOLD    = "600"


def style_global_dark():
    return f"""
    QMainWindow {{
        background-color: {BG_WINDOW};
        background-image: url("{FONDO_WINDOWS}");
        background-repeat: no-repeat;
        background-position: center;
        color: {TEXTO_ENFATICO};
    }}

    QDialog {{
        background-color: {BG_WINDOW};
        background-image: url("{FONDO_WINDOWS}");
        background-repeat: no-repeat;
        background-position: center;
        color: {TEXTO_ENFATICO};
    }}

    QWidget {{
        color: {TEXTO_ENFATICO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
        selection-background-color: {BORDE_FOCUS};
        selection-color: #ffffff;
    }}

    QLabel {{
        color: {TEXTO_ENFATICO};
        background-color: transparent;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
        padding: 4px 0;
    }}

    QLineEdit, QSpinBox, QDateEdit, QTextEdit, QPlainTextEdit {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 8px 10px;
        selection-background-color: {BORDE_FOCUS};
        selection-color: #ffffff;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        font-weight: {FUENTE_PESO_NORMAL};
        min-height: 22px;
    }}

    QLineEdit:focus, QSpinBox:focus, QDateEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
        border: 2px solid {BORDE_FOCUS};
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
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 6px;
        padding: 6px 12px;
        font-weight: {FUENTE_PESO_BOLD};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BOTON};
        min-height: 24px;
        text-align: center;
        outline: none;
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
        color: {TEXTO_SECUNDARIO};
        border: 1px solid {BORDE};
    }}

    QComboBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 8px 10px;
        padding-right: 28px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        font-weight: {FUENTE_PESO_NORMAL};
        min-height: 22px;
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
        width: 28px;
        border-left: 1px solid {BORDE};
        background-color: #2b2b2b;
    }}

    QComboBox QAbstractItemView {{
        background-color: #000000;
        color: #fbfdfd;
        selection-background-color: {SELECCION};
        selection-color: #6fcc7e;
        outline: 0;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
    }}

    QCheckBox {{
        color: {TEXTO_ENFATICO};
        spacing: 8px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QCheckBox::indicator {{
        width: 18px;
        height: 18px;
        border: 1px solid {BORDE};
        border-radius: 4px;
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
        color: {TEXTO_ENFATICO};
        font-weight: {FUENTE_PESO_BOLD};
        padding: 10px 18px;
        border: 1px solid {BORDE};
        border-bottom: none;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        min-height: 24px;
    }}

    QTabBar::tab:selected {{
        background-color: {BG_HOVER};
        color: #ffffff;
    }}

    QTabBar::tab:hover {{
        background-color: #2e2e2e;
    }}

    QTableView, QTreeView, QTableWidget, QListWidget, QListView {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        alternate-background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
        selection-background-color: {SELECCION};
        selection-color: #ffffff;
        gridline-color: #3a3a3a;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QHeaderView::section {{
        background-color: {BG_HOVER};
        color: {TEXTO_ENFATICO};
        padding: 8px;
        border: 1px solid #3a3a3a;
        font-weight: {FUENTE_PESO_BOLD};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        min-height: 24px;
    }}

    QHeaderView::section:hover {{
        background-color: #3e3e3e;
    }}

    QMenu, QMenuBar {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QMenu::item:selected {{
        background-color: {SELECCION};
    }}

    QMenuBar::item:selected {{
        background-color: {SELECCION};
    }}

    QStatusBar {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_ENFATICO};
    }}

    QToolBar {{
        background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
    }}

    QToolTip {{
        background-color: #333333;
        color: #ffffff;
        border: 1px solid {BORDE};
        padding: 8px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QGroupBox {{
        border: 1px solid {BORDE};
        border-radius: 6px;
        margin-top: 12px;
        padding-top: 12px;
        color: {TEXTO_ENFATICO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_BOLD};
    }}

    QGroupBox::title {{
        subcontrol-origin: margin;
        left: 12px;
        padding: 0 8px;
        font-weight: {FUENTE_PESO_BOLD};
    }}

    QFrame {{
        color: {TEXTO_ENFATICO};
    }}

    QMessageBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QMessageBox QLabel {{
        color: {TEXTO_ENFATICO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QMessageBox QPushButton {{
        min-width: 100px;
        min-height: 30px;
        padding: 10px 20px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BOTON};
        font-weight: {FUENTE_PESO_BOLD};
    }}

    QProgressBar {{
        background-color: {BG_INPUT};
        border: 1px solid {BORDE};
        border-radius: 6px;
        text-align: center;
        color: {TEXTO_ENFATICO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_BASE};
        min-height: 20px;
    }}

    QProgressBar::chunk {{
        background-color: {BTN_PRIMARIO};
    }}

    QSpinBox::up-button, QSpinBox::down-button, QDateEdit::up-button, QDateEdit::down-button {{
        width: 20px;
        height: 12px;
        border-radius: 3px;
        background-color: {BG_HOVER};
    }}

    QSpinBox::up-button:hover, QDateEdit::up-button:hover,
    QSpinBox::down-button:hover, QDateEdit::down-button:hover {{
        background-color: #444444;
    }}

    QScrollBar:vertical {{
        background-color: {BG_INPUT};
        width: 14px;
        margin: 0px;
    }}

    QScrollBar::handle:vertical {{
        background-color: {BORDE};
        border-radius: 7px;
        min-height: 30px;
    }}

    QScrollBar::handle:vertical:hover {{
        background-color: #777777;
    }}

    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
        height: 0px;
    }}

    QScrollBar:horizontal {{
        background-color: {BG_INPUT};
        height: 14px;
        margin: 0px;
    }}

    QScrollBar::handle:horizontal {{
        background-color: {BORDE};
        border-radius: 7px;
        min-width: 30px;
    }}

    QScrollBar::handle:horizontal:hover {{
        background-color: #777777;
    }}

    QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
        width: 0px;
    }}
    """


def style_combobox_dark():
    return f"""
    QComboBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 8px 10px;
        padding-right: 28px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        font-weight: {FUENTE_PESO_NORMAL};
        min-height: 22px;
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
        width: 28px;
        border-left: 1px solid {BORDE};
        background-color: #2b2b2b;
    }}

    QComboBox QAbstractItemView {{
        background-color: #000000;
        color: #fbfdfd;
        selection-background-color: {SELECCION};
        selection-color: #6fcc7e;
        outline: 0;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
    }}
    """

def style_pushbutton_dark():
    return f""" 
    QPushButton {{
        background-color: #455a50;
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 6px;
        padding: 12px 24px;
        min-height: 30px;
        font-weight: {FUENTE_PESO_BOLD};
        font-size: {FUENTE_TAMANO_BOTON};
        font-family: {FUENTE_FAMILIA};
        text-align: center;
        outline: none;
    }}
    QPushButton:hover {{
        background-color: #546e7a;
        border-color: #777777;
    }}
    QPushButton:pressed {{
        background-color: #2e4053;
        border: 2px solid #1a252f;
    }}
    QPushButton:disabled {{
        background-color: #a7b0b5;
        color: #dfe4e8;
        border: 1px solid #95a5a6;
    }} 
    """

def style_button_success():
    return f"""
    QPushButton {{
        background-color: #2e7d32;
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 6px;
        padding: 12px 24px;
        min-height: 30px;
        font-weight: {FUENTE_PESO_BOLD};
        font-size: {FUENTE_TAMANO_BOTON};
        font-family: {FUENTE_FAMILIA};
        text-align: center;
        outline: none;
    }}
    QPushButton:hover {{
        background-color: #388e3c;
        border-color: #777777;
    }}
    QPushButton:pressed {{
        background-color: #1b5e20;
        border-color: {BORDE_FOCUS};
    }}
    QPushButton:disabled {{
        background-color: #666666;
        color: {TEXTO_SECUNDARIO};
    }}
    """

def style_button_danger():
    return f"""
    QPushButton {{
        background-color: #c94f42;
        color: #ffffff;
        border: 1px solid #1a252f;
        border-radius: 6px;
        padding: 12px 24px;
        min-height: 30px;
        font-weight: {FUENTE_PESO_BOLD};
        font-size: {FUENTE_TAMANO_BOTON};
        font-family: {FUENTE_FAMILIA};
        text-align: center;
        outline: none;
    }}
    QPushButton:hover {{
        background-color: #e05a4b;
        border-color: #777777;
    }}
    QPushButton:pressed {{
        background-color: #a03c31;
        border-color: {BORDE_FOCUS};
    }}
    QPushButton:disabled {{
        background-color: #666666;
        color: {TEXTO_SECUNDARIO};
    }}
    """

def style_dialog_dark():
    return f"""
    QDialog {{
        background-color: {BG_WINDOW};
        background-image: url("{FONDO_WINDOWS}");
        background-repeat: no-repeat;
        background-position: center;
    }}

    QLabel {{
        color: {TEXTO_ENFATICO};
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        background-color: {BG_WINDOW};
        padding: 4px 0;
    }}

    QLineEdit {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 8px 10px;
        font-size: {FUENTE_TAMANO_INPUT};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        selection-background-color: {BORDE_FOCUS};
        min-height: 22px;
    }}

    QLineEdit:focus {{
        border: 2px solid {BORDE_FOCUS};
        background-color: #303030;
    }}

    QLineEdit:hover {{
        border: 1px solid #777;
    }}

    QComboBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 8px 10px;
        font-size: {FUENTE_TAMANO_INPUT};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        min-height: 22px;
    }}

    QCheckBox {{
        color: {TEXTO_ENFATICO};
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        spacing: 8px;
    }}

    QToolTip {{
        background-color: #333333;
        color: #ffffff;
        border: 1px solid {BORDE};
        padding: 8px;
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QPushButton {{
        background-color: #3a3a3a;
        color: #ffffff;
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 12px 24px;
        min-height: 30px;
        font-weight: {FUENTE_PESO_BOLD};
        font-size: {FUENTE_TAMANO_BOTON};
        font-family: {FUENTE_FAMILIA};
        text-align: center;
        outline: none;
    }}

    QPushButton:hover {{
        background-color: #444;
        border-color: #777;
    }}

    QPushButton:pressed {{
        background-color: #2f2f2f;
        border-color: {BORDE_FOCUS};
    }}
    """

def style_messagebox_dark():
    return f"""
    QMessageBox {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QMessageBox QLabel {{
        color: {TEXTO_ENFATICO};
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
    }}

    QMessageBox QPushButton {{
        background-color: #3a3a3a;
        color: #ffffff;
        border: 1px solid {BORDE};
        border-radius: 6px;
        padding: 10px 20px;
        min-width: 100px;
        min-height: 30px;
        font-size: {FUENTE_TAMANO_BOTON};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_BOLD};
    }}

    QMessageBox QPushButton:hover {{
        background-color: #444;
        border-color: #777;
    }}

    QMessageBox QPushButton:pressed {{
        background-color: #2f2f2f;
        border-color: {BORDE_FOCUS};
    }}
    """

def style_lineedit_error():
    return f"""
    QLineEdit {{
        border: 2px solid #d9534f;
        background-color: #3b1f1f;
        color: #ffffff;
        font-size: {FUENTE_TAMANO_INPUT};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        border-radius: 6px;
        padding: 8px 10px;
        min-height: 22px;
    }}
    """

def style_lineedit_validation():
    return f"""
    QLineEdit[error="true"] {{
        border: 2px solid #e53935;
        background-color: #3b1f1f;
        color: #ffffff;
        font-size: {FUENTE_TAMANO_INPUT};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
        border-radius: 6px;
        padding: 8px 10px;
        min-height: 22px;
    }}
    """

def style_tabbar_dark():
    return f"""
    QTabBar::tab {{
        background-color: {BG_ELEVADO};
        color: {TEXTO_ENFATICO};
        font-weight: {FUENTE_PESO_BOLD};
        padding: 10px 18px;
        border: 1px solid {BORDE};
        border-bottom: none;
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        min-height: 26px;
    }}
    QTabBar::tab:selected {{
        background-color: {BG_HOVER};
        color: #ffffff;
    }}
    QTabBar::tab:hover {{
        background-color: #2e2e2e;
    }}
    """

def style_treeview_dark():
    return f"""
    QTreeView {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        alternate-background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
        selection-background-color: {SELECCION};
        selection-color: #ffffff;
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        font-weight: {FUENTE_PESO_NORMAL};
    }}
    """

def style_header_dark():
    return f"""
    QHeaderView::section {{
        background-color: {BG_HOVER};
        color: {TEXTO_ENFATICO};
        padding: 8px;
        border: 1px solid #3a3a3a;
        font-weight: {FUENTE_PESO_BOLD};
        font-size: {FUENTE_TAMANO_BASE};
        font-family: {FUENTE_FAMILIA};
        min-height: 26px;
    }}
    QHeaderView::section:hover {{
        background-color: #3e3e3e;
    }}
    QHeaderView::section:checked {{
        background-color: {BTN_PRESSED};
    }}
    """