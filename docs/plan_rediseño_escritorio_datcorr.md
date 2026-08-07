
# Plan de Rediseño para PyQt5/PySide2: Dashboard DatCorr

Este plan traduce las especificaciones del **Documento Maestro** (CSS/UX Web) a la arquitectura de **Qt Designer** y **PySide2**. El objetivo es replicar la "Experiencia de Usuario Institucional" en un entorno de escritorio nativo.

---

## 1. Definición del Sistema de Diseño (Design System en Qt)

En lugar de tokens CSS, utilizaremos **`QPalette`** y **`QStyle`** para estandarizar la apariencia.

### 1.1 Paleta de Colores (QPalette)

Basado en la sección "Decisión de diseño" (Tema Mariño/Institucional).

| Token CSS                  | Valor Hex (Referencia) | Implementación Qt (`QPalette` / `QSS`)                           |
| :------------------------- | :--------------------- | :-------------------------------------------------------------------- |
| **Fondo Global**     | `#0a0e1a`            | `QPalette.Window`, `QPalette.Base` (Fondo de la ventana)          |
| **Fondo Card**       | `#141a2e`            | `QPalette.Window`, `QPalette.AlternativeBase` (Fondo de tarjetas) |
| **Borde Suave**      | `#1f2740`            | `QPalette.Base` (Bordes de widgets)                                 |
| **Borde Crítico**   | `#f87171` (Rojo)     | `QPalette.Highlight` (Borde de KPIs críticos)                      |
| **Texto Principal**  | `#f0f2f5`            | `QPalette.Text` (Títulos, datos)                                   |
| **Texto Secundario** | `#aeb6cf`            | `QPalette.Text` (Etiquetas, fechas)                                 |
| **Acento Primario**  | `#2563eb`            | `QPalette.Highlight`, `QPalette.Highlight`                        |
| **Éxito (Verde)**   | `#34d399`            | `QPalette.Highlight` (Logos de éxito)                              |

### 1.2 Tipografía (QFont)

Definir una fuente única (Inter o Roboto) en el archivo `.ui` principal.

* **Fuente Base:** `Inter` o `Roboto`.
* **Tamaños:**
  * `--text-2xl` (22px): KPIs grandes.
  * `--text-xl` (18px): Títulos de secciones.
  * `--text-base` (14px): Cuerpo de tabla y timeline.
  * `--text-sm` (13px): Etiquetas y bordes de tabla.
* **Pesos:**
  * `700` (Bold): KPIs, Títulos.
  * `400` (Regular): Cuerpo.

### 1.3 Espaciado y Bordes (QSS)

Definir una hoja de estilos `.qss` global para evitar hardcodear `px` en el código Python.

```css
/* Archivo: styles/dashboard_global.qss */
/* --- Bordes y Radios --- */
QWidget { border: 1px solid #1f2740; border-radius: 8px; background-color: #141a2e; }

/* --- Espaciado --- */
QWidget { padding: 16px; }

/* --- KPIs Críticos (Reglas específicas) --- */
#kpi-alerta { border: 2px solid #f87171; padding: 16px; }

/* --- Tabla --- */
QTableWidget { background-color: #141a2e; border: none; }
QHeaderView::section { background-color: #0f1425; color: #f0f2f5; padding: 8px; }
QHeaderView::section:section { border: none; } /* Sin bordes entre encabezados */
```

---

## 2. Arquitectura de la Interfaz (Qt Designer)

El diseño debe seguir la jerarquía visual del documento (F invertida).

### 2.1 Estructura del Archivo .ui

No diseñar todo en un solo archivo gigante. Usar una estructura jerárquica.

1. **Widget Principal (`DashboardWindow`):**
   * `QVBoxLayout` (Contenedor principal).
   * **Header:** `QLabel` (Título) + `QLabel` (Versión) + `QStackedWidget` (Botones perfil).
   * **KPI Row:** `QHBoxLayout` (Grid de widgets).
   * **Bottom Section:** `QVBoxLayout` (Tabla + Timeline).

### 2.2 Componentes Clave en Qt Designer

#### A. KPI Cards (Tarjetas de Métricas)

* **Diseño:** `QFrame` con `QGridLayout`.
* **Contenido:**
  * Icono (QLabel/QIcon) + Texto (QLabel).
  * Valor (QLabel grande).
  * Detalles (QLabel pequeño, siempre visible).
* **Regla de Accesibilidad:** No usar `QAbstractItemView::hover` para ocultar el texto. El texto debe estar visible al cargar.
* **Diferenciación:**
  * *Crítico:* Aplicar clase CSS `.alert` (borde rojo).
  * *Estándar:* Borde suave (`#1f2740`).

#### B. Tabla de Registros (DataTable)

* **Widget:** `QTableWidget`.
* **Columnas:** Base, Registros, DATCORR, VERIFICADO, Progreso.
* **Estilos en QSS:**
  * *Header:* Fondo oscuro (`#0f1425`), texto bold.
  * *Celdas:* Fondo `#141a2e`.
  * *Progreso:* Usar `QProgressBar` dentro de la celda o un `QLabel` con fondo coloreado (ej. `background-color: #34d399` para VERIFICADO).

#### C. Timeline (Actividad)

* **Widget:** `QVBoxLayout` dentro de un `QFrame`.
* **Items:** `QLabel` o `QLabel` + `QLabel` (icono).
* **Iconos:** Círculos de 20px (`QFrame` con `QLabel` de icono).
  * Rojo para errores.
  * Verde para éxito.
  * Gris para info.

---

## 3. Plan de Implementación Técnica (Paso a Paso)

### Paso 1: Configuración del Tema (Python)

Crear un script inicial para definir los colores y fuentes globales.

```python
# main_application.py
from PySide6.QtWidgets import QApplication, QStyleFactory
from PySide6.QtGui import QFont

# 1. Definir fuentes
font_base = QFont("Inter", 14, QFont.Weight.Normal)
font_bold = QFont("Inter", 22, QFont.Weight.Bold)

# 2. Definir colores (Variables globales para evitar hardcode)
# Usar QPalette para asegurar consistencia
app = QApplication([])
palette = app.palette()
palette.setColor(QPalette.Window, "#0a0e1a")      # Fondo
palette.setColor(QPalette.WindowText, "#f0f2f5")  # Texto
palette.setColor(QPalette.Highlight, "#2563eb")   # Acento
palette.setColor(QPalette.HighlightedText, "#ffffff") # Texto acento

app.setPalette(palette)
```

### Paso 2: Migración de UI (Qt Designer)

1. **Abre el archivo `.ui` actual.**
2. **Reemplaza widgets:**
   * Reemplazar `QLabel` genéricos por `QFrame` para tarjetas.
   * Asegurar que el `KPI Alerta` tenga un borde rojo (`border: 2px solid #f87171`).
3. **Aplicar Estilos (QSS):**
   * En el menú de Qt Designer: **Edit Styles** (botón con paleta).
   * Copiar los estilos del archivo `styles/dashboard_global.qss` creado en la sección 1.3.
   * **Importante:** Deshabilitar `QAbstractItemView::hover` en las tablas para cumplir la regla de "sin dependencias de hover".

### Paso 3: Lógica de Datos y Renderizado

En el código Python (`.py`), al cargar datos:

1. **KPIs:**

   ```python
   # Ejemplo: Cargar KPIs
   def load_kpis(data):
       kpi_widget = get_kpi_widget() # Clase reutilizable
       kpi_widget.set_value("Altas Pendientes", data['pendientes'])
       kpi_widget.set_type('alert') # Marca visualmente el borde rojo
       layout.addWidget(kpi_widget)
   ```
2. **Tabla:**

   ```python
   # Ejemplo: Cargar Tabla
   def load_table(data):
       table = QTableWidget()
       table.setColumnCount(5)
       # ... configurar columnas ...
       # Agregar barra de progreso
       for item in data:
           row = QTableWidgetItem(item['total'])
           # Lógica de color de fondo
           if item['verificado'] > item['total'] / 2:
               row.setBackgroundRole(QPalette.ColorRole.Light) # Verde
           table.insertRow(table.rowCount() - 1)
   ```

### Paso 4: Accesibilidad y Validación

1. **Prueba Táctil:**
   * Asegurar que los botones tengan al menos `44x44px` (Usar `QSizePolicy` `Fixed` o `Preferred`).
   * Verificar que no se pierda el foco (`QFocusProxy`).
2. **Contraste:**
   * Usar una herramienta como "Color Contrast Analyzer" para asegurar que el texto blanco sobre fondo azul (`#f0f2f5` sobre `#141a2e`) cumpla con WCAG AA.

---

## 4. Checklist de Validación Final

| Criterio              | Estado Esperado                                                                                                  |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Colores**     | 0 Hex hardcodeados. Uso exclusivo de variables/paleta.                                                           |
| **Jerarquía**  | "Altas Pendientes" tiene borde rojo y es visible sin interacción.                                               |
| **Tabla**       | Columna "DATCORR" y "VERIFICADO" tiene fondo coloreado, no solo texto.                                           |
| **Responsive**  | Layout flexible (`QGridLayout` o `QLayout`) que se adapta a pantallas pequeñas (apilar KPIs verticalmente). |
| **Tipografía** | Escala legible (mínimo 13px para datos, 22px para KPIs).                                                        |
| **Iconos**      | Círculos de 20px sin líneas conectoras verticales (estilo minimalista).                                        |

## 5. Recursos Adicionales

* **Qt Creator:** Usar el plugin de **Design System** si está instalado para gestionar las variables de QSS.
* **SVG:** Para los iconos institucionales, usar SVGs embebidos en el `.ui` para que se vean nítidos en cualquier resolución.

---

*Nota: Este plan asume que el backend de datos (Python) ya entrega la estructura JSON. Si es necesario, se recomienda refactorizar la carga de datos para que sea "Atomic" (una lista de KPIs, una lista de Tabla, etc.) para facilitar la renderización.*
