# Plan de Rediseño de Estilo — Aplicación de Escritorio DatCorr (PySide6 / Qt Designer)

> **Versión:** 1.0
> **Estado:** Propuesta Definitiva
> **Alcance:** Aplicación de escritorio en `PySide6` + `Qt Designer` (archivos `.ui`)
> **Referencia:** `docs/Documento_Maestro_Dashboard_DatCorr (1).md`
> **Objetivo:** Unificar la app de escritorio bajo el **sistema de diseño institucional "navy"** del Documento Maestro, priorizando **legibilidad, jerarquía de datos, consistencia y accesibilidad (WCAG 2.1 AA)**.

---

## 1. Diagnóstico del estado actual (inconsistencias)

Se relevó el código actual y se encontraron **4 temas visuales distintos conviviendo**:

| Ventana / Componente        | Archivo                                    | Tema actual                                  | Problema                                                     |
| --------------------------- | ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| Login                       | `ui/inicio_sesion.ui`                    | Azul institucional`rgb(0,89,134)`          | No sigue tokens; botón azul plano sin estados               |
| Ventana principal           | `ui/AplicacionPrincipal.ui`              | Verde menta claro`rgb(226,255,244)`        | Fondo claro con texto blanco →**contraste inválido** |
| Diálogos (editar/usuarios) | `ui/styles.py`, `ventana_principal.py` | Gris oscuro`#1e1e1e`/`#2b2b2b`           | Tonos gris, no navy; botones`#455a50` verdosos             |
| Tabla de resultados         | `ventana_principal.py`                   | Celeste`#80ccff` + encabezados `#cfcfcf` | Fondo claro, colores hardcodeados                            |

**Problemas transversales:**

1. **Colores hardcodeados** en `.ui`, `styles.py` y `ventana_principal.py` (no existe un sistema de tokens).
2. **Paleta de `QPalette` fijada en los `.ui`** (colores claros) que entra en conflicto con el QSS.
3. **Contraste insuficiente** (texto blanco sobre verde menta).
4. **Tipografía sin escala** (11px sueltos, sin jerarquía).
5. **Estados de interacción** (focus, hover, disabled, error) definidos parcialmente y con colores ajenos al token.
6. **Accesibilidad**: sin foco visible claro, sin mínimo táctil, `QMessageBox` con texto `#110101` sobre fondo claro.

---

## 2. Estrategia técnica

### 2.1 Tokens en Python (Qt no soporta variables CSS)

QSS **no soporta variables**. Por lo tanto, se centraliza el sistema en un módulo Python:

```
ui/theme.py            ← NUEVO: tokens + generador de QSS global
ui/styles.py           ← REESCRIBIR: funciones que usan los tokens
```

`theme.py` expone:

- Constantes de color (`BG_PAGE`, `BG_CARD`, `PRIMARY`, ...).
- Constantes de tipografía (`FONT_FAMILY`, `FONT_XS`, ...).
- Constantes de espaciado y radio.
- `GLOBAL_QSS` : el stylesheet global completo.
- Helpers por componente (`qss_button(variant)`, `qss_input()`, ...).

### 2.2 Orden de aplicación de estilos en Qt

Qt aplica estilos por precedencia: **widget > parent chain > QApplication**.
Un `setStyleSheet` a nivel widget **pisa** el QSS global. Por eso el plan es doble:

1. **QSS global** en `QApplication` (base coherente).
2. **Neutralizar stylesheets inline** que hoy existen en `.ui`/código, para que no pis al token.

**Método recomendado (menos riesgo):** editar las propiedades `styleSheet` dentro de los archivos `.ui` fuente y regenerar los `_ui.py` con `pyside6-uic`. Alternativa no destructiva: al final de `setupUi`, aplicar `self.setStyleSheet("")` para heredar del global, o setear el QSS por objeto desde `theme.py`. **Se recomienda la edición de `.ui` + regeneración**, porque mantiene a Qt Designer como fuente de verdad.

### 2.3 Cómo regenerar los `_ui.py`

```powershell
# Desde la raíz del proyecto (activar venv)
.\.venv\Scripts\Activate.ps1

cd ui
pyside6-uic AplicacionPrincipal.ui  -o AplicacionPrincipal_ui.py
pyside6-uic inicio_sesion.ui        -o inicio_sesion_ui.py
pyside6-uic usuarios.ui             -o usuarios_ui.py
pyside6-uic alta_usuario.ui         -o alta_usuario_ui.py
pyside6-uic editar_usuario.ui       -o editar_usuario_ui.py
pyside6-uic permisos_usuario.ui     -o permisos_usuario_ui.py
pyside6-uic selector_bases.ui       -o selector_bases_ui.py
pyside6-uic ventana_usuario.ui      -o ventana_usuario_ui.py
# ... y los plantilla_*.ui según existan en la app
```

> Regla: **nunca editar `_ui.py` a mano** salvo parche temporal; siempre editar `.ui` y regenerar.

---

## 3. Sistema de Tokens (de diseño)

Paleta tomada literal del Documento Maestro (decisión final: **identidad navy institucional**, modo oscuro).

### 3.1 Paleta de colores

| Token              | Valor                      | Uso                                              |
| ------------------ | -------------------------- | ------------------------------------------------ |
| `BG_PAGE`        | `#0a0e1a`                | Fondo global de ventanas                         |
| `BG_CARD`        | `#141a2e`                | Fondo de tarjetas, paneles, diálogos            |
| `BG_MUTED`       | `#0f1425`                | Encabezados de tabla, zonas atenuadas, statusbar |
| `BORDER_MAIN`    | `#2a3050`                | Bordes fuertes / separadores                     |
| `BORDER_SUBTLE`  | `#1f2740`                | Divisores finos / filas                          |
| `TEXT_PRIMARY`   | `#f0f2f5`                | Texto principal                                  |
| `TEXT_SECONDARY` | `#aeb6cf`                | Etiquetas, subtítulos                           |
| `TEXT_MUTED`     | `#8896b8`                | Placeholder, datos de bajo contraste             |
| `PRIMARY`        | `#2563eb`                | Marca / acciones principales                     |
| `PRIMARY_HOVER`  | `#1d4ed8`                | Hover de botón primario                         |
| `PRIMARY_LIGHT`  | `rgba(37,99,235,0.15)`   | Fondo de acento informativo                      |
| `SUCCESS`        | `#34d399`                | Verificado / éxito                              |
| `SUCCESS_LIGHT`  | `rgba(52,211,153,0.15)`  | Fondo de éxito                                  |
| `WARNING`        | `#f59e0b`                | Pendiente / advertencia                          |
| `WARNING_LIGHT`  | `rgba(245,158,11,0.18)`  | Fondo de advertencia                             |
| `DANGER`         | `#f87171`                | Error / peligro / crítica                       |
| `DANGER_LIGHT`   | `rgba(248,113,113,0.18)` | Fondo de error                                   |
| `INFO`           | `#60a5fa`                | Informativo activo                               |

> **Regla semántica:** color = semántica, no decoración. Rojo solo peligro, verde solo éxito, amarillo solo advertencia.

**Mapa de prioridad (del Maestro):**

| Nivel    | Concepto              | Fondo             | Borde           | Texto            |
| -------- | --------------------- | ----------------- | --------------- | ---------------- |
| Crítico | Acción requerida     | `DANGER_LIGHT`  | `DANGER`      | `DANGER`       |
| Alta     | Pendiente             | `WARNING_LIGHT` | `WARNING`     | `WARNING`      |
| Media    | Informativo (DATCORR) | `INFO_LIGHT`    | `INFO`        | `INFO`         |
| Baja     | Positivo (VERIFICADO) | `SUCCESS_LIGHT` | `SUCCESS`     | `SUCCESS`      |
| Neutro   | Datos generales       | `BG_CARD`       | `BORDER_MAIN` | `TEXT_PRIMARY` |

### 3.2 Tipografía

| Token           | Valor                                              | Uso                            |
| --------------- | -------------------------------------------------- | ------------------------------ |
| `FONT_FAMILY` | `'Open Sans', 'Segoe UI', system-ui, sans-serif` | Global                         |
| `FONT_XS`     | 11px                                               | Caption / etiquetas            |
| `FONT_SM`     | 13px                                               | Subtítulos / auxiliares       |
| `FONT_BASE`   | 14px                                               | Cuerpo / datos de tabla        |
| `FONT_LG`     | 16px                                               | Subtítulos de sección        |
| `FONT_XL`     | 18px                                               | Título de sección            |
| `FONT_2XL`    | 22px                                               | Título de página / valor KPI |

Pesos: `400` regular, `500` medium, `600` semibold, `700` bold.
**Regla de legibilidad:** máx. 3 niveles tipográficos por vista; contraste ≥ 4.5:1; fuente mínima 13px.

### 3.3 Espaciado y radio (escala 8px)

| Token         | Valor |
| ------------- | ----- |
| `SPACE_1`   | 4px   |
| `SPACE_2`   | 8px   |
| `SPACE_3`   | 12px  |
| `SPACE_4`   | 16px  |
| `SPACE_5`   | 20px  |
| `SPACE_6`   | 24px  |
| `SPACE_8`   | 32px  |
| `RADIUS_SM` | 4px   |
| `RADIUS_MD` | 8px   |
| `RADIUS_LG` | 12px  |

---

## 4. Rediseño por componente (spec QSS)

### 4.1 Base global

```css
QMainWindow, QDialog, QWidget#central { background-color: BG_PAGE; color: TEXT_PRIMARY; }
QLabel { color: TEXT_PRIMARY; }
QLabel[muted="true"] { color: TEXT_MUTED; }
QLabel[secondary="true"] { color: TEXT_SECONDARY; }
```

### 4.2 Botones (con variantes por propiedad)

| Variante                             | Fondo        | Texto            | Borde              | Radio | Altura mín |
| ------------------------------------ | ------------ | ---------------- | ------------------ | ----- | ----------- |
| Primario (`variant="primary"`)     | `PRIMARY`  | `#ffffff`      | —                 | 8px   | 40px        |
| Secundario (`variant="secondary"`) | transparente | `TEXT_PRIMARY` | 1px`BORDER_MAIN` | 8px   | 40px        |
| Peligro (`variant="danger"`)       | `DANGER`   | `#ffffff`      | —                 | 8px   | 40px        |
| Ghost (`variant="ghost"`)          | transparente | `PRIMARY`      | sin borde          | 8px   | 40px        |

```css
QPushButton { padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 14px; }
QPushButton[variant="primary"] { background-color: PRIMARY; color: #fff; }
QPushButton[variant="primary"]:hover { background-color: PRIMARY_HOVER; }
QPushButton[variant="primary"]:pressed { background-color: PRIMARY_HOVER; border: 2px solid INFO; }
QPushButton[variant="primary"]:disabled { background-color: rgba(37,99,235,0.35); color: rgba(255,255,255,0.6); }
QPushButton[variant="secondary"] { background: transparent; color: TEXT_PRIMARY; border: 1px solid BORDER_MAIN; }
QPushButton[variant="danger"] { background-color: DANGER; color: #fff; }
QPushButton[variant="ghost"] { background: transparent; color: PRIMARY; }
```

> **Foco visible (accesibilidad):** `QPushButton:focus { border: 2px solid INFO; }` en todas las variantes.
> **Touch target:** altura mínima **40px** (desktop) / 44px si es táctil.

### 4.3 Campos de entrada (`QLineEdit`, `QComboBox`, `QSpinBox`, `QDateEdit`)

```css
QLineEdit, QComboBox, QSpinBox, QDateEdit {
    background-color: BG_CARD;
    color: TEXT_PRIMARY;
    border: 1px solid BORDER_MAIN;
    border-radius: 6px;
    padding: 6px 8px;
    min-height: 24px;
    selection-background-color: PRIMARY;
    selection-color: #fff;
}
QLineEdit:hover, QComboBox:hover { border: 1px solid INFO; }
QLineEdit:focus, QComboBox:focus, QComboBox:on { border: 2px solid PRIMARY; }
QLineEdit:disabled { color: TEXT_MUTED; background-color: BG_MUTED; }
/* placeholder */
QLineEdit[placeholderText=""] {} /* mantener color nativo */
```

**Estado error / validación** (reutilizar el patrón existente de `styles.py` pero con token):

```css
QLineEdit[error="true"] { border: 2px solid DANGER; background-color: rgba(248,113,113,0.08); }
```

`QComboBox` dropdown:

```css
QComboBox QAbstractItemView {
    background-color: BG_CARD; color: TEXT_PRIMARY;
    border: 1px solid BORDER_MAIN; selection-background-color: PRIMARY; selection-color: #fff;
}
QComboBox::drop-down { border-left: 1px solid BORDER_MAIN; width: 26px; }
```

### 4.4 Tablas / árboles de resultados (`QTableView`, `QTreeView`, `QTableWidget`)

```css
QTableView, QTreeView, QTableWidget {
    background-color: BG_CARD; color: TEXT_PRIMARY;
    border: 1px solid BORDER_MAIN; border-radius: 8px;
    gridline-color: BORDER_SUBTLE;
    alternate-background-color: BG_MUTED;
}
QHeaderView::section {
    background-color: BG_MUTED; color: TEXT_PRIMARY;
    font-weight: 700; font-size: 12px;
    padding: 8px 12px; border: none; border-bottom: 2px solid BORDER_MAIN;
}
QTableView::item, QTreeView::item { padding: 4px 8px; border-bottom: 1px solid BORDER_SUBTLE; }
QTableView::item:selected, QTreeView::item:selected { background-color: rgba(37,99,235,0.35); color: #fff; }
```

> Reemplaza el inline actual de `ventana_principal.py` (`#80ccff` / `#cfcfcf`). Números alineados a la derecha en columnas numéricas (vía `setAlignment`).

### 4.5 Pestañas (`QTabWidget` / `QTabBar`)

```css
QTabWidget::pane { border: 1px solid BORDER_MAIN; border-radius: 8px; background-color: BG_CARD; }
QTabBar::tab {
    background: transparent; color: TEXT_MUTED;
    padding: 8px 16px; margin-right: 4px;
    border-bottom: 2px solid transparent; font-weight: 600;
}
QTabBar::tab:selected { color: PRIMARY; border-bottom: 2px solid PRIMARY; }
QTabBar::tab:hover { color: TEXT_SECONDARY; }
```

### 4.6 Menús y diálogos

```css
QMenu { background-color: BG_CARD; color: TEXT_PRIMARY; border: 1px solid BORDER_MAIN; padding: 4px; }
QMenu::item { padding: 8px 20px; border-radius: 4px; }
QMenu::item:selected { background-color: PRIMARY; color: #fff; }

QDialog { background-color: BG_CARD; }
QMessageBox { background-color: BG_CARD; }
QMessageBox QLabel { color: TEXT_PRIMARY; }
```

### 4.7 Statusbar, toolbar, scrollbars

```css
QStatusBar { background-color: BG_MUTED; color: TEXT_SECONDARY; }
QToolBar { background-color: BG_MUTED; border-bottom: 1px solid BORDER_MAIN; }
QToolButton { color: TEXT_PRIMARY; border-radius: 4px; padding: 4px; }
QToolButton:hover { background-color: PRIMARY_LIGHT; }

QScrollBar:vertical { background: BG_MUTED; width: 10px; }
QScrollBar::handle:vertical { background: BORDER_MAIN; border-radius: 5px; min-height: 30px; }
QScrollBar::handle:vertical:hover { background: PRIMARY; }
QScrollBar::add-line, QScrollBar::sub-line { height: 0; }
```

### 4.8 Resaltado de búsqueda (delegate existente)

En `ResaltadoCoincidenciaDelegate` (`ventana_principal.py`), reemplazar el color por defecto `QColor(255,230,150,140)` y los colores de columna por tokens:

- default → `rgba(245,158,11,0.55)` (warning)
- columna documento → `SUCCESS_LIGHT`
- columna expediente / hh.cc → `INFO_LIGHT`
- mantener el color semántico por columna configurable desde `ui/theme.py`.

---

## 5. Rediseño específico por ventana

### 5.1 Login (`inicio_sesion.ui`)

- Fondo de ventana: `BG_PAGE`.
- **Panel central tipo card** (fondo `BG_CARD`, borde `BORDER_MAIN`, radio 12px, padding 24px) que contiene: logo, título "DatCorr", campos usuario/contraseña y botón "Iniciar sesión" (`variant="primary"`).
- Enlace "Recuperar contraseña": `variant="ghost"`.
- Cambiar el fondo azul pleno actual `rgb(0,89,134)` por el navy del token.

### 5.2 Ventana principal (`AplicacionPrincipal.ui`)

- Quitar el `styleSheet` `rgb(226,255,244)` y el `QPalette` claro de la ventana; dejar que herede del QSS global navy.
- Combo de bases: estilo `QComboBox` del token.
- Barra de búsqueda: `QLineEdit` del token, con botón de consulta `variant="primary"`.
- Tabs de resultados: estilo `QTabWidget` del token.
- Toolbar de Reportes: `QToolBar` del token.
- Statusbar: `BG_MUTED` + usuario en `TEXT_SECONDARY`.

### 5.3 Ventanas de usuarios (`usuarios.ui`, `alta_usuario.ui`, `editar_usuario.ui`, `permisos_usuario.ui`, `ventana_usuario.ui`, `selector_bases.ui`)

- Aplicar QSS global; cada `QDialog`/`QWidget` usa `BG_CARD`.
- Botones según variante (primario para "Guardar/Aceptar", secundario para "Cancelar", danger para "Eliminar").
- Mensajes de validación con `QLineEdit[error="true"]`.

### 5.4 Plantillas de carga (`plantilla_*.ui`)

- Los formularios de carga deben heredar el QSS global (quitar inline si lo tienen).
- Etiquetas de campo en `TEXT_SECONDARY`; inputs del token; botones de envío `variant="primary"`.

---

## 6. Accesibilidad (WCAG 2.1 AA)

| Criterio               | Acción                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Contraste ≥ 4.5:1     | Verificar los tokens propuestos con herramienta (los valores navy/`#f0f2f5` cumplen ~15:1)  |
| Foco visible           | `:focus` con borde `2px solid INFO` en botones e inputs                                   |
| Navegación teclado    | Tab order natural; no usar solo hover para información                                       |
| Touch targets          | Botones min 40px altura, 8px separación                                                      |
| Tamaño mínimo fuente | 13px                                                                                          |
| Uso del color          | Todo estado coloreado también se comunica con icono/texto (p.ej. chip "VERIFICADO" + ícono) |
| `QMessageBox`        | Texto`TEXT_PRIMARY`, botones del token (corrige el `#110101` actual)                      |

---

## 7. Plan de ejecución por fases

### Fase 1 — Infraestructura de tokens (esfuerzo: 1 sesión)

1. Crear `ui/theme.py` con tokens + `GLOBAL_QSS`.
2. Aplicar `app.setStyleSheet(GLOBAL_QSS)` en el punto de entrada (`base_datcorr.py` y `ventana_principal.py` `__main__`).
3. Reescribir `ui/styles.py` para que sus funciones devuelvan QSS derivado de `theme.py` (mantener las mismas firmas: `style_dialog_dark()`, `style_pushbutton_dark()`, `style_combobox_dark()`, `style_lineedit_error()`, `style_lineedit_validation()`).

### Fase 2 — Ventana principal y resultados (esfuerzo: 1–2 sesiones)

4. Editar `AplicacionPrincipal.ui`: quitar `styleSheet` y `QPalette` claros; regenerar `AplicacionPrincipal_ui.py`.
5. Limpiar `ventana_principal.py`: quitar el inline `#80ccff`/`#cfcfcf`; parametrizar colores de columnas desde `theme.py`; ajustar `ResaltadoCoincidenciaDelegate`.

### Fase 3 — Login (esfuerzo: 1 sesión)

6. Rediseñar `inicio_sesion.ui` como card sobre navy; regenerar `inicio_sesion_ui.py`; ajustar `base_datcorr.py` si aplica estilos.

### Fase 4 — Diálogos y formularios (esfuerzo: 1–2 sesiones)

7. Revisar `usuarios.ui`, `alta_usuario.ui`, `editar_usuario.ui`, `permisos_usuario.ui`, `ventana_usuario.ui`, `selector_bases.ui`: quitar inline, usar variantes de botón; regenerar `_ui.py`.
8. Revisar `ventanas/ventana_*.py` y `ui/dynamic_form.py` para quitar colores hardcodeados.
9. Plantillas `plantilla_*.ui`: heredar QSS global.

### Fase 5 — Validación y pulido (esfuerzo: 1 sesión)

10. Verificar contrastes de todos los tokens.
11. Probar foco visible, teclado, estados hover/pressed/disabled/error.
12. QA visual en las 8 ventanas + login + plantillas.

---

## 8. Checklist de validación

- [ ] `theme.py` es la **única** fuente de colores (0 hex hardcodeados en `styles.py`, `ventana_principal.py`, `_ui.py`).
- [ ] `GLOBAL_QSS` aplicado en el arranque.
- [ ] Login en navy con panel card.
- [ ] Ventana principal sin fondo verde menta.
- [ ] Tabla de resultados navy, con alternancia de filas y encabezados `BG_MUTED`.
- [ ] Botones por variante (primary/secondary/danger/ghost).
- [ ] Foco visible en todos los controles interactivos.
- [ ] Contraste ≥ 4.5:1 verificado.
- [ ] Fuente mínima 13px.
- [ ] Navegación completa por teclado.
- [ ] `QMessageBox` con tokens (no `#110101`).
- [ ] Regeneración de `_ui.py` sin warnings.
- [ ] La app arranca y funciona igual que antes (sin pérdida de funcionalidad).
