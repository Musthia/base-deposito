# Plan de Rediseño — App de Escritorio DatCorr (PySide6 + Qt Designer)

> **Objetivo:** Unificar estilo, legibilidad, color y tema completo de la aplicación de escritorio imitando la metodología y tokens del `Documento_Maestro_Dashboard_DatCorr (1)`, adaptada al stack PySide6/Qt Designer/QSS.
> **Alcance:** Login, ventana principal, diálogos, plantillas de carga de datos y sistema de estilos global.
> **Estado:** Plan listo para ejecución.

---

## 1. Diagnóstico del Estado Actual

| Archivo / Módulo | Problemas detectados |
|---|---|
| `ui/AplicacionPrincipal.ui` | +10 colores hardcodeados (`#e2fff4`, `#9b759e`, `#455a50`, `#ffaa7f`, etc.), paleta inconsistente, bordes con relieve simulado, fuentes mezcladas (Tahoma, Calibri), sin spacing system, sin jerarquía visual. |
| `ui/inicio_sesion.ui` | Fondo azul oscuro (`#005986`), colores hardcodeados en paleta, sin tokens, fuente Franklin Gothic. |
| `ui/ventana_usuario.ui` | Sin estilos, widgets default de Qt, sin padding ni radius consistentes. |
| `ui/selector_bases.ui` | Sin estilos, paleta default. |
| `ui/plantilla_*.ui` | Fondo `#f6ffffff`, paletas XML gigantes inline, bordes grises por defecto, sin diseño institucional. |
| `ui/styles.py` | Estilos fragmentados (`style_dialog_dark`, `style_pushbutton_dark`, etc.), colores hardcodeados repetidos, sin sistema centralizado. |
| `ventana_principal.py` | Stylesheets inline en `crear_o_actualizar_pestana()` (`background-color: #80ccff`, headers con `#cfcfcf`), sin abstracción. |

**Resumen:** La app actual es un collage de colores y estilos por archivo. No existe un tema unificado, ni tokens, ni reglas de spacing/typography consistentes.

---

## 2. Principios Rectores (adaptados de Documento_Maestro)

| Principio | Regla operativa para PySide6 |
|---|---|
| **Institucionalidad** | Mantener identidad visual seria, limpia, gubernamental. Sin efectos decorativos innecesarios. |
| **Legibilidad** | Contraste mínimo 4.5:1, tipografía mínima 13px en interfaz, 14px en datos tabulares. |
| **Jerarquía** | 3 niveles tipográficos máx por vista: Título, cuerpo, auxiliar. Dato crítico siempre visible. |
| **Consistencia** | Un solo archivo de tema (`ui/theme.py`) con tokens QSS. 0 colores hardcodeados fuera de él. |
| **Accesibilidad** | Focus visible customizado, navegación por teclado, mínimo touch target 44x44px, sin dependencia de hover. |
| **Tokenización** | Todos los colores, espaciados y radios salen de variables Python, no de strings mágicos en .ui o .py. |

---

## 3. Sistema de Diseño (Tokens para QSS)

Qt Style Sheets no soporta CSS custom properties nativas. Por tanto, el sistema de tokens se implementa como **variables Python centralizadas** que se interpolan en strings QSS.

### 3.1 Archivo central: `ui/theme.py`

```python
# ui/theme.py
from PySide6.QtGui import QColor
from PySide6.QtCore import Qt

# ==========================================
# PALETA INSTITUCIONAL (modo oscuro navy)
# ==========================================

class Palette:
    # Fondos
    BG_PAGE = "#0a0e1a"          # Fondo global
    BG_CARD = "#141a2e"          # Fondo de tarjetas/paneles
    BG_MUTED = "#0f1425"         # Encabezados, zonas atenuadas
    BG_INPUT = "#1a2038"         # Campos de texto
    BG_HOVER = "#1e2545"         # Hover states

    # Textos
    TEXT_PRIMARY = "#f0f2f5"     # Texto principal
    TEXT_SECONDARY = "#aeb6cf"   # Texto secundario
    TEXT_MUTED = "#8896b8"       # Placeholder / bajo contraste
    TEXT_ON_PRIMARY = "#ffffff"  # Texto sobre botón primario

    # Acentos institucionales
    PRIMARY = "#2563eb"          # Acción principal / marca
    PRIMARY_HOVER = "#1d4ed8"
    PRIMARY_LIGHT = "rgba(37,99,235,0.15)"

    # Semánticos
    SUCCESS = "#34d399"
    SUCCESS_LIGHT = "rgba(52,211,153,0.15)"
    WARNING = "#f59e0b"
    WARNING_LIGHT = "rgba(245,158,11,0.18)"
    DANGER = "#f87171"
    DANGER_LIGHT = "rgba(248,113,113,0.18)"
    INFO = "#60a5fa"
    INFO_LIGHT = "rgba(96,165,250,0.15)"

    # Bordes
    BORDER_MAIN = "#2a3050"
    BORDER_SUBTLE = "#1f2740"

# ==========================================
# ESPACIADO (escala 8px)
# ==========================================

class Spacing:
    XS = "4px"
    SM = "8px"
    MD = "16px"
    LG = "24px"
    XL = "32px"

# ==========================================
# TIPOGRAFÍA
# ==========================================

class TypeScale:
    FAMILY = "'Segoe UI', 'Open Sans', system-ui, sans-serif"
    XS = "11px"      # Caption / etiquetas
    SM = "13px"      # Subtítulos / auxiliares
    BASE = "14px"    # Cuerpo / datos
    LG = "16px"      # Subtítulo sección
    XL = "18px"      # Título sección
    XXL = "22px"     # Título página / KPI valor

    WEIGHT_REGULAR = "400"
    WEIGHT_MEDIUM = "500"
    WEIGHT_SEMIBOLD = "600"
    WEIGHT_BOLD = "700"

# ==========================================
# BORDES Y RADIOS
# ==========================================

class Radius:
    SM = "4px"
    MD = "8px"
    LG = "12px"
    FULL = "50%"

# ==========================================
# HELPERS QSS
# ==========================================

def qss_color(hex_color: str) -> str:
    """Valida y retorna color hex para QSS."""
    return hex_color

def qss_rgba(r: int, g: int, b: int, a: float = 1.0) -> str:
    """Genera color rgba para QSS."""
    return f"rgba({r},{g},{b},{a})"
```

### 3.2 Tokens de color (resumen)

| Token | Hex / RGBA | Uso |
|---|---|---|
| `BG_PAGE` | `#0a0e1a` | Fondo global de la app |
| `BG_CARD` | `#141a2e` | Tarjetas, paneles, contenedores |
| `BG_MUTED` | `#0f1425` | Encabezados de tabla, zonas atenuadas |
| `BG_INPUT` | `#1a2038` | Campos de entrada |
| `TEXT_PRIMARY` | `#f0f2f5` | Títulos, valores KPI, celdas |
| `TEXT_SECONDARY` | `#aeb6cf` | Etiquetas, subtítulos |
| `TEXT_MUTED` | `#8896b8` | Placeholder |
| `PRIMARY` | `#2563eb` | Botones primarios, acentos |
| `SUCCESS` | `#34d399` | Estados positivos |
| `WARNING` | `#f59e0b` | Advertencias / pendientes |
| `DANGER` | `#f87171` | Errores, acciones críticas |
| `INFO` | `#60a5fa` | Informativo |
| `BORDER_MAIN` | `#2a3050` | Bordes principales |
| `BORDER_SUBTLE` | `#1f2740` | Divisores finos |

---

## 4. Tipografía y Escala

| Uso | Tamaño | Peso | Line-height |
|---|---|---|---|
| Título página | 22px | 700 | 1.2 |
| Título sección | 18px | 600 | 1.3 |
| Subtítulo sección | 16px | 500 | 1.4 |
| Texto cuerpo | 14px | 400 | 1.5 |
| Texto auxiliar | 13px | 400 | 1.5 |
| Caption / Etiqueta | 11px | 500 | 1.4 |
| Dato numérico KPI | 22px | 700 | 1.2 |
| Dato tabular | 14px | 400/600 | 1.4 |

**Reglas:**
- Fuente base: `Segoe UI` (Windows nativo) → `Open Sans` → `system-ui`.
- Alineación: izquierda en textos multilínea.
- Números: usar `font-family: "Segoe UI"; font-weight: 600;` en columnas numéricas.
- Máximo 3 niveles jerárquicos por vista.

---

## 5. Sistema de Espaciado

| Token | Valor | Uso |
|---|---|---|
| `XS` | 4px | Entre label y valor dentro de un card |
| `SM` | 8px | Separación mínima entre botones |
| `MD` | 16px | Gap entre cards KPI, padding interno estándar |
| `LG` | 24px | Separación entre secciones (KPI row → Tabla) |
| `XL` | 32px | Padding exterior de contenedores principales |

**Reglas:**
- Padding mínimo de cualquier card: `MD` (16px).
- Separación entre botones relacionados: mínimo `SM` (8px).
- Altura mínima de touch target: 44px.

---

## 6. Arquitectura de Estilos

### 6.1 Estructura de archivos

```
ui/
├── theme.py              # Tokens de diseño (colores, spacing, tipografía)
├── theme_qss.py          # Factory de stylesheets QSS completos
├── styles.py             # Estilos específicos legacy (se migran gradualmente)
├── components.py         # Wrappers Python de componentes visuales
├── AplicacionPrincipal.ui
├── AplicacionPrincipal.qss   # Stylesheet específico de la ventana principal
├── inicio_sesion.ui
├── inicio_sesion.qss
├── ventana_usuario.ui
├── ventana_usuario.qss
├── ...
```

### 6.2 Flujo de aplicación de tema

```python
# En cada ventana/diálogo, después de setupUi():
from ui.theme_qss import apply_theme

apply_theme(self)  # Aplica el tema completo a la ventana y todos sus hijos
```

`apply_theme()` funciona así:
1. Carga el QSS base (`Palette`, `TypeScale`, etc.).
2. Aplica `setStyleSheet()` a la ventana raíz.
3. Registra widgets que necesitan estilos específicos (botones especiales, tablas).
4. Aplica estilos específicos del archivo `.qss` asociado si existe.

---

## 7. Rediseño por Componente

### 7.1 Botones (QSS)

```css
/* ui/buttons.qss (conceptual) */

QPushButton {
    background-color: __BG_CARD__;
    color: __TEXT_PRIMARY__;
    border: 1px solid __BORDER_MAIN__;
    border-radius: __RADIUS_MD__;
    padding: 8px 16px;
    font-family: __FONT_FAMILY__;
    font-size: __TEXT_BASE__;
    font-weight: __WEIGHT_MEDIUM__;
    min-height: 40px;
}

QPushButton:hover {
    background-color: __BG_HOVER__;
    border-color: __PRIMARY__;
}

QPushButton:pressed {
    background-color: __PRIMARY__;
    color: __TEXT_ON_PRIMARY__;
}

QPushButton:primary {
    background-color: __PRIMARY__;
    color: __TEXT_ON_PRIMARY__;
    border: 1px solid __PRIMARY__;
}

QPushButton:primary:hover {
    background-color: __PRIMARY_HOVER__;
}

QPushButton:danger {
    background-color: __DANGER__;
    color: white;
    border: 1px solid __DANGER__;
}

QPushButton:focus {
    outline: 2px solid __PRIMARY__;
    outline-offset: 2px;
}
```

**Reglas:**
- Un botón primario por área visual.
- Mínimo 40px altura, 8px separación.
- Focus visible obligatorio.

### 7.2 Inputs / QLineEdit / QComboBox

```css
QLineEdit, QComboBox {
    background-color: __BG_INPUT__;
    color: __TEXT_PRIMARY__;
    border: 1px solid __BORDER_MAIN__;
    border-radius: __RADIUS_SM__;
    padding: 8px 12px;
    font-family: __FONT_FAMILY__;
    font-size: __TEXT_BASE__;
    min-height: 40px;
}

QLineEdit:focus, QComboBox:focus {
    border: 2px solid __PRIMARY__;
    background-color: __BG_CARD__;
}

QComboBox::drop-down {
    border: none;
    width: 24px;
}

QComboBox::down-arrow {
    image: none;
    border-left: 5px solid none;
    border-right: 5px solid none;
    border-top: 5px solid __TEXT_SECONDARY__;
    margin-right: 8px;
}
```

### 7.3 Tablas / QTableView / QTreeView

```css
QTableView, QTreeView {
    background-color: __BG_CARD__;
    alternate-background-color: __BG_MUTED__;
    color: __TEXT_PRIMARY__;
    gridline-color: __BORDER_SUBTLE__;
    border: 1px solid __BORDER_MAIN__;
    border-radius: __RADIUS_MD__;
    selection-background-color: __PRIMARY_LIGHT__;
    selection-color: __PRIMARY__;
    font-family: __FONT_FAMILY__;
    font-size: __TEXT_BASE__;
}

QHeaderView::section {
    background-color: __BG_MUTED__;
    color: __TEXT_SECONDARY__;
    padding: 8px 12px;
    border: none;
    border-bottom: 1px solid __BORDER_MAIN__;
    font-weight: __WEIGHT_SEMIBOLD__;
    font-size: __TEXT_SM__;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

QTableView::item, QTreeView::item {
    padding: 10px 12px;
    border-bottom: 1px solid __BORDER_SUBTLE__;
    min-height: 40px;
}
```

### 7.4 Tarjetas / Paneles (QFrame)

```css
QFrame[card="true"] {
    background-color: __BG_CARD__;
    border: 1px solid __BORDER_MAIN__;
    border-radius: __RADIUS_MD__;
    padding: __SPACING_MD__;
}

QFrame[card="true"]:hover {
    border-color: __PRIMARY__;
}
```

**Uso en código:**
```python
card = QFrame()
card.setProperty("card", "true")
```

### 7.5 Pestañas / QTabWidget

```css
QTabWidget::pane {
    border: 1px solid __BORDER_MAIN__;
    border-radius: __RADIUS_MD__;
    background-color: __BG_CARD__;
    top: -1px;
}

QTabBar::tab {
    background-color: __BG_MUTED__;
    color: __TEXT_SECONDARY__;
    border: 1px solid __BORDER_MAIN__;
    border-bottom: none;
    border-top-left-radius: __RADIUS_MD__;
    border-top-right-radius: __RADIUS_MD__;
    padding: 8px 16px;
    margin-right: 4px;
    font-family: __FONT_FAMILY__;
    font-size: __TEXT_SM__;
    font-weight: __WEIGHT_MEDIUM__;
    min-width: 80px;
}

QTabBar::tab:selected {
    background-color: __BG_CARD__;
    color: __TEXT_PRIMARY__;
    border-bottom: 2px solid __PRIMARY__;
}

QTabBar::tab:hover:!selected {
    background-color: __BG_HOVER__;
}
```

### 7.6 Scrollbars

```css
QScrollBar:vertical {
    background: __BG_PAGE__;
    width: 10px;
    margin: 0px 0px 0px 0px;
}

QScrollBar::handle:vertical {
    background: __BORDER_MAIN__;
    border-radius: 5px;
    min-height: 30px;
}

QScrollBar::handle:vertical:hover {
    background: __PRIMARY__;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}
```

### 7.7 Diálogos y Mensajes

```css
QDialog {
    background-color: __BG_PAGE__;
}

QMessageBox {
    background-color: __BG_CARD__;
}

QMessageBox QLabel {
    color: __TEXT_PRIMARY__;
    font-size: __TEXT_BASE__;
}
```

---

## 8. Rediseño por Ventana

### 8.1 Ventana Principal (`AplicacionPrincipal.ui`)

**Estado actual:** Layout en `QGridLayout` con mezcla de widgets alineados por geometría absoluta, colores inconsistentes, frame naranja con relieve, botones con estilos inline diferentes.

**Propuesta de layout:**

```
┌──────────────────────────────────────────────────────────┐
│ TOPBAR (56px, BG_MUTED, borde inferior BORDER_MAIN)       │
│ [Logo Datcorr] [Base de Datos] [Carga de Datos]  [Usuario]│
├──────────────────────────────────────────────────────────┤
│ CONTENIDO PRINCIPAL (BG_PAGE)                             │
│                                                          │
│  ┌── PANEL DE CONTROL ──────────────────────────────┐    │
│  │ "Panel de control"                    [vX.X]     │    │
│  │ Gestione y supervise las bases de datos...       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [Selector Base ▼]  [🔍 Consultar...]  [Consultar]       │
│                                                          │
│  ┌── RESULTADOS ───────────────────────────────────┐    │
│  │ [TabWidget con pestañas de resultados]            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Cambios específicos en Qt Designer:**

1. **TopBar:** Reemplazar el `QFrame` naranja por un `QWidget` con `QHBoxLayout`.
   - Logo (QLabel con icono) a la izquierda.
   - Botones de navegación agrupados (Base de Datos, Carga de Datos) con estilo primario.
   - Botón Administración Usuarios a la derecha.
   - Botón Cerrar Sesión con estilo `danger`.
   - Altura fija 56px, fondo `BG_MUTED`.

2. **Eliminar estilos inline:**
   - Quitar el `QFrame` con `background-color: rgb(255, 170, 127)`.
   - Quitar el `QLineEdit` con relieve simulado.
   - Quitar los `QPushButton` con estilos inline inconsistentes.

3. **Selector y búsqueda:**
   - Usar `QHBoxLayout` con `QComboBox` (placeholder "Seleccione una base") + `QLineEdit` (placeholder "Consultar...") + `QPushButton` (primario, texto "Consultar").
   - Aplicar estilos desde `theme_qss.py`.

4. **Área de resultados:**
   - `QTabWidget` con pestañas closeable.
   - Dentro de cada pestaña: `QTreeView` o `QTableView`.
   - Estilos de tabla según sección 7.3.

### 8.2 Login (`inicio_sesion.ui`)

**Estado actual:** Fondo azul sólido `#005986`, botón azul oscuro, inputs blancos.

**Propuesta:**

```
┌─────────────────────────────────┐
│                                 │
│         [Logo Datcorr]          │
│                                 │
│    ┌─────────────────────┐      │
│    │ Usuario             │      │
│    └─────────────────────┘      │
│    ┌─────────────────────┐      │
│    │ Contraseña          │      │
│    └─────────────────────┘      │
│                                 │
│    [   Iniciar Sesión   ]       │
│    ¿Olvidó su contraseña?       │
│                                 │
└─────────────────────────────────┘
```

**Cambios:**
- Fondo: `BG_PAGE` con un `QFrame` central tipo card (`BG_CARD`, radius 12px).
- Labels: `TEXT_SECONDARY`, peso 500, alineados arriba-izquierda (no center).
- Inputs: según sección 7.2.
- Botón primario: ancho completo, estilo primario.
- Link "Recuperar": estilo ghost, color `PRIMARY`.
- Sin paleta XML gigante (se limpia en Designer).

### 8.3 Ventana Usuarios (`ventana_usuario.ui`)

**Cambios:**
- Fondo `BG_PAGE`.
- Tabla `QTableView` con estilos de tabla institucional.
- Botones en `QHBoxLayout` al pie:
  - `Nuevo` (primario)
  - `Editar` (secundario)
  - `Activar` (success)
  - `Desactivar` (warning)
  - `Permisos` (secundario)
- Padding `MD` en el layout principal.

### 8.4 Selector de Bases (`selector_bases.ui`)

**Cambios:**
- Fondo `BG_PAGE`.
- `QComboBox` con estilo de input institucional.
- Botones `OK` (primario) y `Cancel` (secundario) en `QDialogButtonBox` con estilos custom.

### 8.5 Plantillas (`plantilla_*.ui`)

**Cambios generales:**
- Limpiar paleta XML inline (dejar en `widget` level o limpiarla).
- Fondo `BG_PAGE` o `BG_CARD` según corresponda.
- Labels: `TEXT_SECONDARY`, peso 500, alineación izquierda.
- Inputs/QLineEdit: estilo institucional.
- Botones: agrupados en layout con espaciado `SM` entre ellos.
- Secciones con `QFrame[card="true"]` para agrupar campos relacionados.

---

## 9. Sistema de Tema y Aplicación Global

### 9.1 Factory de QSS (`ui/theme_qss.py`)

```python
# ui/theme_qss.py
from .theme import *

THEME_TEMPLATE = f"""
/* =========================================
   DATCORR — Tema Institucional v2.0
   ========================================= */

QWidget {{
    background-color: {BG_PAGE};
    color: {TEXT_PRIMARY};
    font-family: {TypeScale.FAMILY};
    font-size: {TypeScale.BASE};
    selection-background-color: {PRIMARY_LIGHT};
    selection-color: {PRIMARY};
}}

/* --- Botones --- */
QPushButton {{
    background-color: {BG_CARD};
    color: {TEXT_PRIMARY};
    border: 1px solid {BORDER_MAIN};
    border-radius: {Radius.MD};
    padding: 8px 16px;
    font-weight: {TypeScale.WEIGHT_MEDIUM};
    min-height: 40px;
}}

QPushButton:hover {{
    background-color: {BG_HOVER};
    border-color: {PRIMARY};
}}

QPushButton:pressed {{
    background-color: {PRIMARY};
    color: {TEXT_ON_PRIMARY};
}}

QPushButton:primary, QPushButton[primary="true"] {{
    background-color: {PRIMARY};
    color: {TEXT_ON_PRIMARY};
    border: 1px solid {PRIMARY};
}}

QPushButton:primary:hover, QPushButton[primary="true"]:hover {{
    background-color: {PRIMARY_HOVER};
}}

QPushButton:danger, QPushButton[danger="true"] {{
    background-color: {DANGER};
    color: #ffffff;
    border: 1px solid {DANGER};
}}

QPushButton:focus {{
    outline: 2px solid {PRIMARY};
    outline-offset: 2px;
}}

/* --- Inputs --- */
QLineEdit, QComboBox, QSpinBox, QDoubleSpinBox, QDateEdit {{
    background-color: {BG_INPUT};
    color: {TEXT_PRIMARY};
    border: 1px solid {BORDER_MAIN};
    border-radius: {Radius.SM};
    padding: 8px 12px;
    min-height: 40px;
}}

QLineEdit:focus, QComboBox:focus, QSpinBox:focus, QDoubleSpinBox:focus, QDateEdit:focus {{
    border: 2px solid {PRIMARY};
    background-color: {BG_CARD};
}}

QComboBox::drop-down {{
    border: none;
    width: 24px;
}}

QComboBox::down-arrow {{
    image: none;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid {TEXT_SECONDARY};
    margin-right: 8px;
}}

QComboBox QAbstractItemView {{
    background-color: {BG_CARD};
    color: {TEXT_PRIMARY};
    selection-background-color: {PRIMARY_LIGHT};
    selection-color: {PRIMARY};
    border: 1px solid {BORDER_MAIN};
    outline: none;
}}

/* --- Tablas --- */
QTableView, QTreeView {{
    background-color: {BG_CARD};
    alternate-background-color: {BG_MUTED};
    color: {TEXT_PRIMARY};
    gridline-color: {BORDER_SUBTLE};
    border: 1px solid {BORDER_MAIN};
    border-radius: {Radius.MD};
    selection-background-color: {PRIMARY_LIGHT};
    selection-color: {PRIMARY};
}}

QHeaderView::section {{
    background-color: {BG_MUTED};
    color: {TEXT_SECONDARY};
    padding: 8px 12px;
    border: none;
    border-bottom: 1px solid {BORDER_MAIN};
    font-weight: {TypeScale.WEIGHT_SEMIBOLD};
    font-size: {TypeScale.SM};
    text-transform: uppercase;
    letter-spacing: 0.05em;
}}

QTableView::item, QTreeView::item {{
    padding: 10px 12px;
    border-bottom: 1px solid {BORDER_SUBTLE};
    min-height: 40px;
}}

/* --- Pestañas --- */
QTabWidget::pane {{
    border: 1px solid {BORDER_MAIN};
    border-radius: {Radius.MD};
    background-color: {BG_CARD};
    top: -1px;
}}

QTabBar::tab {{
    background-color: {BG_MUTED};
    color: {TEXT_SECONDARY};
    border: 1px solid {BORDER_MAIN};
    border-bottom: none;
    border-top-left-radius: {Radius.MD};
    border-top-right-radius: {Radius.MD};
    padding: 8px 16px;
    margin-right: 4px;
    font-weight: {TypeScale.WEIGHT_MEDIUM};
    font-size: {TypeScale.SM};
    min-width: 80px;
}}

QTabBar::tab:selected {{
    background-color: {BG_CARD};
    color: {TEXT_PRIMARY};
    border-bottom: 2px solid {PRIMARY};
}}

QTabBar::tab:hover:!selected {{
    background-color: {BG_HOVER};
}}

/* --- Cards --- */
QFrame[card="true"] {{
    background-color: {BG_CARD};
    border: 1px solid {BORDER_MAIN};
    border-radius: {Radius.MD};
    padding: {Spacing.MD};
}}

QFrame[card="true"]:hover {{
    border-color: {PRIMARY};
}}

/* --- Labels --- */
QLabel {{
    color: {TEXT_PRIMARY};
    background-color: transparent;
}}

QLabel[secondary="true"] {{
    color: {TEXT_SECONDARY};
}}

QLabel[muted="true"] {{
    color: {TEXT_MUTED};
}}

QLabel[heading="true"] {{
    font-size: {TypeScale.XL};
    font-weight: {TypeScale.WEIGHT_SEMIBOLD};
    color: {TEXT_PRIMARY};
}}

/* --- Scrollbars --- */
QScrollBar:vertical {{
    background: {BG_PAGE};
    width: 10px;
    margin: 0px 0px 0px 0px;
}}

QScrollBar::handle:vertical {{
    background: {BORDER_MAIN};
    border-radius: 5px;
    min-height: 30px;
}}

QScrollBar::handle:vertical:hover {{
    background: {PRIMARY};
}}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
    height: 0px;
}}

QScrollBar:horizontal {{
    background: {BG_PAGE};
    height: 10px;
    margin: 0px 0px 0px 0px;
}}

QScrollBar::handle:horizontal {{
    background: {BORDER_MAIN};
    border-radius: 5px;
    min-width: 30px;
}}

QScrollBar::handle:horizontal:hover {{
    background: {PRIMARY};
}}

QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
    width: 0px;
}}

/* --- Dialogs --- */
QDialog {{
    background-color: {BG_PAGE};
}}

QMessageBox {{
    background-color: {BG_CARD};
}}

QMessageBox QLabel {{
    color: {TEXT_PRIMARY};
    font-size: {TypeScale.BASE};
}}
"""

def get_theme_qss() -> str:
    """Retorna el stylesheet completo del tema institucional."""
    return THEME_TEMPLATE


def apply_theme(widget):
    """Aplica el tema completo a un widget y todos sus hijos."""
    widget.setStyleSheet(get_theme_qss())


def apply_button_style(button, variant: str = "default"):
    """Aplica variante de estilo a un botón específico."""
    if variant == "primary":
        button.setProperty("primary", True)
    elif variant == "danger":
        button.setProperty("danger", True)
    # Forzar refresh de estilo
    button.style().unpolish(button)
    button.style().polish(button)
```

### 9.2 Aplicación en `ventana_principal.py`

```python
# Al final de __init__ de VentanaPrincipal:
from ui.theme_qss import apply_theme
apply_theme(self)

# Para botones específicos:
from ui.theme_qss import apply_button_style
apply_button_style(self.ui.pushButton_consulta_bases, "primary")
apply_button_style(self.ui.boton_cerrar_sesion, "danger")
```

---

## 10. Migración de Componentes Python

Además de los archivos `.ui` y QSS, se deben migrar componentes lógicos que generan estilos inline.

### 10.1 `ventana_principal.py` — líneas 758-762 y 800-816

**Actual:**
```python
contenedor.setStyleSheet("""
    QWidget {
        background-color: #80ccff;
    }
""")
```

```python
tree.setStyleSheet("""
    QHeaderView::section {
        background-color: #cfcfcf;
        color: #000020;
        ...
    }
""")
```

**Nuevo:**
```python
from ui.theme_qss import apply_theme
apply_theme(contenedor)  # El QSS base ya incluye estilos de tabla
# Para headers específicos si needed, extender en un archivo aparte
```

### 10.2 `ui/styles.py`

Migrar gradualmente a `theme_qss.py`. Mantener `styles.py` solo como compatibilidad temporal.

---

## 11. Accesibilidad

| Checklist | Estado | Acción |
|---|---|---|
| Focus visible | ❌ | Implementado en QSS (`outline: 2px solid PRIMARY`). |
| Touch target ≥44px | ⚠ | Revisar todos los botones y campos. Ajustar `min-height`. |
| Navegación por teclado | ⚠ | Asegurar `tabOrder` en Designer. Verificar tab stops. |
| Contraste | ⚠ | Verificar combinaciones `TEXT_PRIMARY`/`BG_CARD` (4.5:1+). |
| Tooltips informativos | ⚠ | Reemplazar HTML tooltips por texto plano o QSS tooltip. |
| ARIA / Accesible names | N/A | Qt no soporta ARIA, pero se pueden usar `accessibleName` y `accessibleDescription`. |

**Reglas específicas:**
- Todo `QPushButton` debe tener `setMinimumSize(ancho, 44)` o `setFixedHeight(44)`.
- `QLineEdit` mínimo altura 40px.
- Labels asociados a inputs: usar `label.setBuddy(entry)`.
- Orden de tabulación: definir en Designer (`Tab Order` → `Customize`).

---

## 12. Plan de Ejecución por Fases

### Fase 1: Infraestructura de Tema (Semana 1)

**Objetivo:** Crear el sistema de tokens y aplicarlo globalmente.

Pasos:
1. Crear `ui/theme.py` con tokens de diseño.
2. Crear `ui/theme_qss.py` con factory de QSS completo.
3. Crear `apply_theme()` y aplicar en `ventana_principal.py` y `base_datcorr.py` (login).
4. Verificar que todos los widgets hijos hereden el tema.
5. Limpiar estilos inline obsoletos que entren en conflicto.

**Entregable:** App con tema oscuro institucional aplicado globalmente, sin estilos inline conflictivos.

### Fase 2: Rediseño de Ventanas Principales (Semana 1-2)

**Objetivo:** Rediseñar las 4 ventanas principales en Qt Designer.

Pasos:
1. **Login (`inicio_sesion.ui`):**
   - Abrir en Qt Designer.
   - Limpiar paleta XML.
   - Aplicar fondo `BG_PAGE`.
   - Crear layout vertical con card central.
   - Aplicar estilos de botón primario y link.
   - Probar visualmente.

2. **Ventana Principal (`AplicacionPrincipal.ui`):**
   - Rediseñar topbar con `QHBoxLayout`.
   - Eliminar frame naranja y estilos inline.
   - Reemplazar botones por variantes estilizadas.
   - Limpiar QLineEdit de consulta (quitar relieve simulado).
   - Aplicar estilos de pestañas.
   - Probar visualmente.

3. **Ventana Usuarios (`ventana_usuario.ui`):**
   - Agregar layout estructurado.
   - Estilizar tabla y botones.

4. **Selector Bases (`selector_bases.ui`):**
   - Aplicar estilos de input y botones.

**Entregable:** 4 ventanas principales con diseño institucional unificado.

### Fase 3: Rediseño de Plantillas (Semana 2)

**Objetivo:** Aplicar tema a las 6 plantillas de carga de datos.

Pasos:
1. Abrir cada `plantilla_*.ui` en Qt Designer.
2. Limpiar paletas XML inline.
3. Aplicar fondo `BG_PAGE` o `BG_CARD`.
4. Estilizar labels, inputs y botones.
5. Agrupar campos relacionados en `QFrame[card="true"]`.
6. Probar cada plantilla cargándola desde la ventana principal.

**Entregable:** 6 plantillas con diseño consistente.

### Fase 4: Pulido y Accesibilidad (Semana 3)

**Objetivo:** Detalles finales, accesibilidad y validación.

Pasos:
1. Revisar contraste de todos los textos (herramienta: Qt Contrast Checker o plugin de Designer).
2. Asegurar `min-height: 40px` en todos los inputs y botones.
3. Verificar orden de tabulación en cada ventana.
4. Agregar `accessibleName` y `accessibleDescription` donde falte.
5. Probar en Windows con tema oscuro del sistema (coherencia).
6. Limpiar código muerto y estilos inline legacy.
7. Documentar guía de estilo para desarrolladores.

**Entregable:** App lista para producción con tema unificado, accesible y mantenible.

---

## 13. Checklist de Validación

### Diseño
- [ ] 0 colores hardcodeados fuera de `theme.py`.
- [ ] 0 estilos inline en `.ui` o `.py`.
- [ ] Border radius consistente (`Radius.MD` = 8px).
- [ ] Tipografía con máximo 3 niveles jerárquicos por vista.
- [ ] Padding mínimo 16px en cards.

### Legibilidad
- [ ] Contraste verificado ≥ 4.5:1 en textos normales.
- [ ] Tamaño mínimo de fuente: 13px en interfaz, 14px en datos.
- [ ] Todos los botones tienen `min-height: 40px`.

### Accesibilidad
- [ ] Navegación completa por teclado (Tab order lógico).
- [ ] Focus visible en todos los elementos interactivos.
- [ ] Touch targets ≥ 44px.
- [ ] `accessibleName` en widgets clave.

### Funcional
- [ ] Login funciona visual y funcionalmente.
- [ ] Ventana principal carga, consulta bases y resultados.
- [ ] Administración de usuarios abre y muestra tabla.
- [ ] Plantillas cargan correctamente.
- [ ] No hay regresiones visuales (comparar con estado anterior).

---

## 14. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| Qt Designer no soporta variables CSS | Usar factory Python (`theme_qss.py`) que genera QSS completo con interpolación. |
| Estilos inline existentes entran en conflicto | Fase 1: aplicar tema base y eliminar gradualmente estilos inline. |
| Plantillas gigantes con paletas XML | Limpiar en Designer (cambiar a `Inherited` o eliminar paleta inline). |
| Dependencia de relieve simulado en botones | Migrar a diseño plano con bordes sutiles según Documento_Maestro. |
| Regresión de funcionalidad | Probar cada ventana después de rediseño, mantener lógica intacta. |

---

## 15. Comandos de Ejecución

```bash
# 1. Abrir proyecto en Qt Designer (modificar .ui)
designer ui/AplicacionPrincipal.ui
designer ui/inicio_sesion.ui
designer ui/ventana_usuario.ui
designer ui/selector_bases.ui
designer ui/plantilla_pediatrico.ui
designer ui/plantilla_maternidad.ui
designer ui/plantilla_ips.ui
designer ui/plantilla_igpj.ui
designer ui/plantilla_igpj_listado_nuevo.ui
designer ui/plantilla_escribania.ui

# 2. Ejecutar app para probar cambios
python base_datcorr.py

# 3. Verificar estilos aplicados (debug)
# En ventana_principal.py, agregar temporalmente:
# print(self.ui.centralwidget().styleSheet())
```

---

## 16. Referencias

- `docs/Documento_Maestro_Dashboard_DatCorr (1).md` — Fuente de diseño y tokens.
- `ui/styles.py` — Estilos legacy a migrar.
- `ui/AplicacionPrincipal.ui` — Ventana principal actual.
- Qt Style Sheets Reference: https://doc.qt.io/qtforpython-6/overviews/stylesheet-reference.html
