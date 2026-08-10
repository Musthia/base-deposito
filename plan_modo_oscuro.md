# Plan: Modo Oscuro — App de Escritorio (PySide6)

## 1. Objetivo

Convertir toda la app de escritorio (PySide6) de fondo claro a **modo oscuro**, garantizando:

- Fondo oscuro/negro en todas las ventanas, diálogos, pestañas y tablas.
- Texto legible con contraste alto (≥4.5:1) sobre fondo oscuro.
- Botones e iconos contrastantes y distinguibles en estado normal, hover, pressed y disabled.

Flujo de la app: `base_datcorr.py` (login) → `ventana_principal.py` (principal + edición de registro) → `ventanas/` (diálogos de usuarios) → `ui/plantilla_*.py` (formularios de carga por organismo, cargados con QUiLoader) → `ui/reportes_viewer.py` → `controller/selector_bases.py`.

## 2. Estado actual (inventario de colores claros)

| Archivo | Elemento | Color claro actual |
|---|---|---|
| `ui/inicio_sesion.ui` / `_ui.py` | Login | Fondo azul `rgb(0,89,134)`; inputs blancos `rgb(255,255,255)` |
| `ui/AplicacionPrincipal.ui` / `_ui.py` | Principal | Fondo `rgb(226,255,244)`; tabs `#dfe6cf`; QLineEdit `#cfd8dc`; frame `rgb(255,170,127)` |
| `ventana_principal.py` | Contenedor pestañas | `#80ccff` |
| `ventana_principal.py` | Headers treeview | `#cfcfcf`, texto `#000020`, hover `#debef1` |
| `ui/plantilla_{...}.ui` / `py` | Formularios carga | Fondo `rgb(246,255,255)`; headers `#cfd8dc`, texto `#000012`; botones `#2e7d32` |
| `ui/permisos_usuario.ui` | Botones permisos | Verde `rgb(0,170,0)`, naranja `rgb(170,170,0)` |
| `ui/reportes_viewer.py` | KPIs | Texto azul `#1976d2` |
| `ui/usuarios_ui.py` | Imagen header | `..img/autenticacion_de_usuario.png` (fondo claro) |
| `ventanas/*.ui` y `_ui.py` | Diálogos usuario | Paletas claras por defecto |

Ya existen estilos dark parciales en `ui/styles.py`: `style_combobox_dark`, `style_pushbutton_dark`, `style_dialog_dark`, `style_messagebox_dark`, `style_lineedit_error/validation`. Se deben unificar y ampliar.

## 3. Paleta oscura propuesta (tokens centrales en `ui/styles.py`)

```
Fondo principal (window)    #1e1e1e
Fondo elevado (card/tab)    #252526
Fondo input                 #2b2b2b
Fondo hover                 #333333
Texto principal             #e0e0e0
Texto secundario            #b0b0b0
Placeholder                 #7a7a7a
Borde                       #555555
Borde focus                 #3daee9
Botón primario              #3a6df0
Botón hover                 #4d7bff
Botón pressed               #2f58cc
Botón danger                #c94f42
Botón success               #2e7d32
Selección                   #263238
Disabled                    #666666
Resaltado búsqueda          rgba(255,230,150,60)
```

Regla: texto sobre `#1e1e1e`/`#2b2b2b` siempre `#e0e0e0`/`#ffffff` (WCAG AA 4.5:1).

## 4. Estrategia general

1. Centralizar los estilos en `ui/styles.py` (fuente única de verdad).
2. Aplicar QSS global a nivel `QApplication` en `base_datcorr.py` y en `ventana_principal.py` (main), para que diálogos nativos (`QMessageBox`, `QInputDialog`) hereden el tema.
3. Neutralizar colores hardcodeados en los `.ui` editándolos directamente y **regenerar** los `_ui.py` con `pyside6-uic` (o editar ambos en paralelo).
4. Reemplazar `setStyleSheet` inline (ventana_principal.py, reportes_viewer.py, selector_bases.py, plantilla_*.py) por funciones de `ui/styles.py`.
5. Revisar iconos/imágenes con fondo claro y reemplazar por versiones con transparencia o SVG claro.

## 5. Cambios por archivo

### 5.1 `ui/styles.py`
- Agregar constantes de paleta (tabla del punto 3).
- Crear `style_global_dark()`: QSS global para `QWidget`, `QMainWindow`, `QDialog`, `QLabel`, `QLineEdit`, `QPushButton`, `QComboBox`, `QTabWidget`, `QTableView`, `QTreeView`, `QHeaderView`, `QMenu`, `QMessageBox`, `QStatusBar`, `QToolBar`, `QToolTip`, `QListWidget`, `QCheckBox`, `QSpinBox`.
- Ampliar `style_pushbutton_dark` con `:hover`, `:pressed`, `:disabled`, `:focus`.
- Agregar `style_button_danger`, `style_button_success`, `style_kpi`, `style_tabbar_dark`, `style_treeview_dark`, `style_header_dark`.
- Corregir `style_messagebox_dark`: fondo `#ffffff` → `#2b2b2b`.

### 5.2 Login — `ui/inicio_sesion.ui` (+ regenerar `inicio_sesion_ui.py`)
- Fondo `rgb(0,89,134)` → `#1e1e1e`.
- Inputs blancos → `#2b2b2b` con texto `#e0e0e0`.
- Botón iniciar sesión → `style_pushbutton_dark` (fondo primario con contraste).
- Labels `Usuario`/`Contraseña` → `#e0e0e0`, tamaño legible.
- "¿Olvidó su contraseña?" → texto claro `#a8cfff` (transparente).

### 5.3 Fondo del login
- Verificar si `fondo_login.png` (`img/fondo_ini_ses.qrc`) se usa como fondo; si es claro, reemplazar por fondo oscuro institucional o eliminar dejando el QSS global.

### 5.4 Ventana principal — `ui/AplicacionPrincipal.ui` (+ `_ui.py`)
- Fondo `rgb(226,255,244)` → `#1e1e1e`.
- `QTabBar::tab` `#dfe6cf`/`#605b78` → fondo `#252526`, seleccionado `#333333`, texto `#e0e0e0`.
- `entry_consultar` (`#cfd8dc`) → `#2b2b2b`, texto `#e0e0e0`.
- `frame` `rgb(255,170,127)` → tono semántico oscuro conservando diferenciación por estado.
- Botones (`pushButton_consulta_bases`, `carga_datos`, `boton_cerrar_sesion`, `boton_adm_usuar`) → `style_pushbutton_dark` con tono por función.
- `mi_data_cons` (borde `#b0bec5`) → borde `#3a3a3a`.

### 5.5 `ventana_principal.py`
- Contenedor pestañas `#80ccff` → `#252526`.
- Header treeview `#cfcfcf`/`#000020` → `#333333`/`#e0e0e0`; hover `#debef1` → `#3a3a3a`.
- `ResaltadoCoincidenciaDelegate`: colores pastel → versiones con alpha sobre oscuro (`QColor(0,230,150,70)`, etc.) para mantener contraste de texto.
- `VentanaEdicionRegistro` ya usa `style_dialog_dark`; ajustar `QLineEdit` readonly (`#2e2e2e`/`#9e9e9e`) ok.
- Pasar `setStyleSheet` inline a funciones de `ui/styles.py`.

### 5.6 Formularios de carga — `ui/plantilla_{escribania,igpj,igpj_listado_nuevo,ips,maternidad,pediatrico}.ui` + `py`
- Fondo `rgb(246,255,255)` → `#1e1e1e`.
- Headers `#cfd8dc` + `#000012` → `#333333` + `#e0e0e0`.
- Botones verdes `#2e7d32` → `style_button_success` (verde con borde/hover oscuros).
- `style_lineedit_validation` y `style_messagebox_dark` ya existen (corregir fondo del messagebox).
- Se cargan con QUiLoader desde el `.ui`: regenerar el `.ui` y opcionalmente el `.py`.

### 5.7 Diálogos de usuarios — `ventanas/*.py` + `ui/{alta_usuario,editar_usuario,permisos_usuario,usuarios,ventana_usuario}.ui`
- Aplicar `style_dialog_dark()` o QSS global (los `.ui` usan paletas claras por defecto).
- Tabla de usuarios (`QTableView`): header oscuro, filas `#2b2b2b` texto `#e0e0e0`, filas alternadas `#252526`.
- `permisos_usuario.ui`: botones verdes/naranjas → `style_button_success`/`style_button_danger`.
- `usuarios_ui.py` imagen `autenticacion_de_usuario.png` → reemplazar por icono con transparencia.

### 5.8 Consultas / reportes
- `controller/selector_bases.py`: ya usa estilos dark; heredar QSS global en el QDialog.
- `ui/reportes_viewer.py`: aplicar QSS global; KPIs `#1976d2` → `#8ab4f8` (legible sobre oscuro); `QTableWidget`, `QGroupBox`, `QDateEdit` heredan del QSS global.
- `ui/dynamic_form.py`: aplicar `style_dialog_dark()` y `style_pushbutton_dark()`.

## 6. Iconos y botones contrastantes

- Inventario: `img/*.ico`, `img/left_panel_close_24dp_E3E3E3*.svg` (blanco, apto), `labels_png_rc.py`, `fondo_*.png`.
- Preferir iconos con alpha/transparencia; descartar PNG sobre fondo claro.
- Toolbar "Reportes" y `menu_ayuda` (`ventana_principal.py` usa `img/datcorr.ico`): usar versiones claras o SVG blanco.
- Convertir PNG claros a SVG monocromo claro o recortar con transparencia.

## 7. Orden de implementación sugerido

1. Base: tokens + `style_global_dark()` en `ui/styles.py` y QSS global en `base_datcorr.py` y `ventana_principal.py`.
2. Login (`inicio_sesion.ui` + `_ui.py`).
3. Ventana principal (`AplicacionPrincipal.ui`/`_ui.py` + `ventana_principal.py` + delegate).
4. Diálogos de usuarios (`ventanas/*.ui` + `.py`).
5. Formularios de carga (`plantilla_*.ui` + `.py`).
6. Reportes y selector de bases.
7. Iconos e imágenes.
8. Pruebas de contraste y regresión funcional.

## 8. Pruebas post-implementación

- Login, navegación completa, búsqueda/edición de registros en una base.
- ABM de usuarios (alta, edición, permisos, activar/desactivar).
- Carga de datos y reportes (CSV/XLSX/PDF).
- Contraste en estado hover/pressed/disabled/focus de todos los controles.
- Verificar que `QMessageBox` y `QInputDialog` se ven oscuros.