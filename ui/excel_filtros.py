# ui/excel_filtros.py
#
# Filtros estilo Excel para los listados (QTreeView) de la app.
# - Fila de filtros: un QLineEdit por columna (placeholder = nombre de columna).
# - Orden ascendente/descendente al hacer click en el encabezado.
# - Filtro por columna (sin distinguir mayúsculas) + orden numérico inteligente.
# - Resaltado de filas según el campo "Estado" (verificado, retirado, etc.).
# - Paginación: máximo 25 filas visibles por página, con barra de navegación.

from PySide6.QtCore import (
    Qt,
    QSortFilterProxyModel,
    QModelIndex,
    QTimer,
)
from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QGridLayout,
    QLineEdit,
    QPushButton,
    QToolButton,
    QStyledItemDelegate,
    QStyle,
    QSpinBox,
    QLabel,
)
from PySide6.QtGui import (
    QColor,
    QBrush,
)

from ui.styles import (
    BG_INPUT,
    BG_ELEVADO,
    BG_HOVER,
    BORDE,
    BORDE_FOCUS,
    TEXTO_ENFATICO,
    TEXTO_SECUNDARIO,
    FUENTE_FAMILIA,
    FUENTE_TAMANO_INPUT,
    FILA_ESTADO_ROJO,
    ESTADOS_RESALTAR,
)


class FiltroExcelProxy(QSortFilterProxyModel):
    """Proxy que filtra por columna y ordena de forma numérica-inteligente."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._filtros = {}
        self.setFilterCaseSensitivity(Qt.CaseInsensitive)
        self.setSortCaseSensitivity(Qt.CaseInsensitive)
        self.setSortRole(Qt.DisplayRole)
        self.setDynamicSortFilter(True)

    # ---------- API de filtros ----------

    def set_filtro(self, columna, texto):
        texto = (texto or "").strip()
        if texto:
            self._filtros[int(columna)] = texto.lower()
        else:
            self._filtros.pop(int(columna), None)
        self.invalidate()

    def limpiar_filtros(self):
        self._filtros.clear()
        self.invalidate()

    # ---------- Filtrado ----------

    def filterAcceptsRow(self, source_row, source_parent):
        modelo = self.sourceModel()
        if modelo is None:
            return True

        for col, texto in self._filtros.items():
            idx = modelo.index(source_row, col, source_parent)
            if not idx.isValid():
                return False
            valor = str(idx.data(Qt.DisplayRole) or "").lower()
            if texto not in valor:
                return False
        return True

    # ---------- Ordenamiento ----------

    def lessThan(self, left, right):
        v1 = left.data(Qt.DisplayRole)
        v2 = right.data(Qt.DisplayRole)

        # Numérico
        try:
            return float(v1) < float(v2)
        except (TypeError, ValueError):
            pass

        return str(v1 or "").lower() < str(v2 or "").lower()


# =========================================================================
# Paginación
# =========================================================================

FILAS_POR_PAGINA = 25


class PaginacionProxy(QSortFilterProxyModel):
    """
    Proxy que muestra únicamente una 'página' del modelo fuente
    (otro proxy filtrado/ordenado). Expone la API de navegación:
    página actual, total de páginas, ir a primera/anterior/siguiente/última.
    """

    def __init__(self, limite=FILAS_POR_PAGINA, parent=None):
        super().__init__(parent)
        self._limite = int(limite)
        self._offset = 0
        self.setDynamicSortFilter(False)
        self._timer_invalida = QTimer(self)
        self._timer_invalida.setSingleShot(True)
        self._timer_invalida.timeout.connect(self.invalidate)

    # ---------- API de paginación ----------

    def set_limite(self, limite):
        self._limite = max(1, int(limite))
        self._reclamp()
        self.invalidate()

    def limite(self):
        return self._limite

    def _total_filas(self):
        src = self.sourceModel()
        return src.rowCount() if src is not None else 0

    def total_paginas(self):
        total = self._total_filas()
        if total <= 0:
            return 1
        return (total + self._limite - 1) // self._limite

    def pagina_actual(self):
        if self._limite <= 0:
            return 1
        return self._offset // self._limite + 1

    def ir_pagina(self, n):
        n = max(1, min(int(n), self.total_paginas()))
        nuevo_offset = (n - 1) * self._limite
        if nuevo_offset != self._offset:
            self._offset = nuevo_offset
            self.invalidate()
        return n

    def ir_primera(self):
        self.ir_pagina(1)

    def ir_anterior(self):
        self.ir_pagina(self.pagina_actual() - 1)

    def ir_siguiente(self):
        self.ir_pagina(self.pagina_actual() + 1)

    def ir_ultima(self):
        self.ir_pagina(self.total_paginas())

    def _reclamp(self):
        if self.pagina_actual() > self.total_paginas():
            self._offset = (self.total_paginas() - 1) * self._limite

    # ---------- Filtrado ----------

    def filterAcceptsRow(self, source_row, source_parent):
        return self._offset <= source_row < self._offset + self._limite

    # ---------- Ordenamiento (reenviar al proxy de filtros) ----------

    def sort(self, column, order=Qt.AscendingOrder):
        src = self.sourceModel()
        if isinstance(src, QSortFilterProxyModel):
            src.sort(column, order)
        self._reclamp()
        self.invalidate()

    # ---------- Mapeo de índices ----------

    def map_to_fuente(self, index):
        """Mapa un índice del treeview (paginación) al índice del modelo real."""
        idx = self.mapToSource(index)
        src = self.sourceModel()
        if isinstance(src, QSortFilterProxyModel):
            idx = src.mapToSource(idx)
        return idx

    # ---------- Sincronización con la fuente ----------

    def setSourceModel(self, model):
        if self.sourceModel() is not None:
            src = self.sourceModel()
            for sig in ("modelReset", "layoutChanged", "rowsInserted", "rowsRemoved"):
                try:
                    getattr(src, sig).disconnect(self._on_fuente_invalida)
                except (RuntimeError, TypeError):
                    pass
                try:
                    getattr(src, sig).disconnect(self._on_fuente_insertada)
                except (RuntimeError, TypeError):
                    pass
        super().setSourceModel(model)
        if model is not None:
            model.modelReset.connect(self._on_fuente_invalida)
            model.layoutChanged.connect(self._on_fuente_invalida)
            model.rowsRemoved.connect(self._on_fuente_invalida)
            model.rowsInserted.connect(self._on_fuente_insertada)
        self._reclamp()

    def _on_fuente_invalida(self, *args, **kwargs):
        self._reclamp()
        self.invalidate()

    def _on_fuente_insertada(self, *args, **kwargs):
        # Al insertar filas la ventana sigue siendo válida pero el proxy
        # necesita re-evaluar; se agrupa con un timer para no degradar en
        # cargas masivas (un solo invalidateFilter al final del ciclo).
        self._reclamp()
        self._timer_invalida.start(0)


def _estilo_barra():
    return f"""
    QWidget#barra_filtros {{
        background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
        border-bottom: none;
        border-radius: 0px;
    }}

    QLineEdit {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 4px;
        padding: 3px 8px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        min-height: 18px;
        selection-background-color: {BORDE_FOCUS};
        selection-color: #ffffff;
    }}

    QLineEdit:focus {{
        border: 2px solid {BORDE_FOCUS};
        background-color: {BG_HOVER};
    }}

    QLineEdit::placeholder {{
        color: {TEXTO_SECUNDARIO};
    }}

    QToolButton#boton_limpiar_filtros {{
        background-color: transparent;
        color: {TEXTO_SECUNDARIO};
        border: 1px solid {BORDE};
        border-radius: 4px;
        min-width: 22px;
        min-height: 18px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        font-weight: 600;
    }}

    QToolButton#boton_limpiar_filtros:hover {{
        color: #ffffff;
        border-color: #777777;
    }}
    """


def _estilo_barra_paginacion():
    return f"""
    QWidget#barra_paginacion {{
        background-color: {BG_ELEVADO};
        border: 1px solid {BORDE};
        border-top: none;
        border-radius: 0px;
    }}

    QToolButton#btn_pag_inicio, QToolButton#btn_pag_atras,
    QToolButton#btn_pag_adelante, QToolButton#btn_pag_fin {{
        background-color: transparent;
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 4px;
        min-width: 26px;
        min-height: 20px;
        font-family: {FUENTE_FAMILIA};
        font-size: 13px;
        font-weight: 600;
    }}

    QToolButton#btn_pag_inicio:hover, QToolButton#btn_pag_atras:hover,
    QToolButton#btn_pag_adelante:hover, QToolButton#btn_pag_fin:hover {{
        background-color: {BG_HOVER};
        color: #ffffff;
        border-color: {BORDE_FOCUS};
    }}

    QToolButton#btn_pag_inicio:disabled, QToolButton#btn_pag_atras:disabled,
    QToolButton#btn_pag_adelante:disabled, QToolButton#btn_pag_fin:disabled {{
        color: {TEXTO_SECUNDARIO};
        border-color: {BORDE};
    }}

    QSpinBox#spin_pagina {{
        background-color: {BG_INPUT};
        color: {TEXTO_ENFATICO};
        border: 1px solid {BORDE};
        border-radius: 4px;
        padding: 2px 4px;
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        min-width: 44px;
        min-height: 18px;
    }}

    QSpinBox#spin_pagina:focus {{
        border: 2px solid {BORDE_FOCUS};
        background-color: {BG_HOVER};
    }}

    QLabel#label_pagina_info {{
        color: {TEXTO_SECUNDARIO};
        font-family: {FUENTE_FAMILIA};
        font-size: {FUENTE_TAMANO_INPUT};
        padding: 0 4px;
    }}
    """


def _crear_barra(columnas, proxy):
    """Construye la fila de filtros (un QLineEdit por columna)."""
    barra = QWidget()
    barra.setObjectName("barra_filtros")
    barra.setStyleSheet(_estilo_barra())

    lay = QHBoxLayout(barra)
    lay.setContentsMargins(6, 4, 6, 4)
    lay.setSpacing(4)

    edits = []
    for i, nombre in enumerate(columnas):
        le = QLineEdit(barra)
        le.setPlaceholderText(nombre or f"Columna {i + 1}")
        le.setToolTip(f"Filtrar por {nombre or i + 1}")
        le.setObjectName(f"filtro_col_{i}")
        le.setClearButtonEnabled(True)
        le.textChanged.connect(lambda t, c=i: proxy.set_filtro(c, t))
        edits.append(le)
        lay.addWidget(le)

    btn = QToolButton(barra)
    btn.setObjectName("boton_limpiar_filtros")
    btn.setText("\u2715")
    btn.setToolTip("Limpiar todos los filtros")
    btn.setFixedSize(24, 22)
    btn.clicked.connect(lambda: _limpiar_edits(edits, proxy))
    lay.addWidget(btn)

    barra._edits = edits
    barra._proxy = proxy
    return barra, edits


def actualizar_columnas_barra(barra, columnas):
    """Actualiza placeholders/tooltips de la barra (pestañas con columnas dinámicas)."""
    if barra is None:
        return
    edits = getattr(barra, "_edits", [])
    n = len(columnas)

    if len(edits) != n:
        proxy = getattr(barra, "_proxy", None)
        _reconstruir_barra(barra, columnas, proxy)
        return

    for le, nombre in zip(edits, columnas):
        le.setPlaceholderText(nombre or "…")
        le.setToolTip(f"Filtrar por {nombre or '…'}")


def _reconstruir_barra(barra, columnas, proxy):
    """Reemplaza los QLineEdit de una barra existente (cambio de columnas)."""
    lay = barra.layout()
    if lay is None:
        return

    if proxy is not None:
        proxy.limpiar_filtros()

    # quitar los QLineEdit viejos (el botón limpiar se conserva)
    viejos = [le for le in getattr(barra, "_edits", []) if le.parent() is barra]
    for le in viejos:
        lay.removeWidget(le)
        le.deleteLater()

    btn = None
    for i in range(lay.count()):
        w = lay.itemAt(i).widget()
        if isinstance(w, QToolButton):
            btn = w
            break

    edits = []
    for i, nombre in enumerate(columnas):
        le = QLineEdit(barra)
        le.setPlaceholderText(nombre or f"Columna {i + 1}")
        le.setToolTip(f"Filtrar por {nombre or i + 1}")
        le.setObjectName(f"filtro_col_{i}")
        le.setClearButtonEnabled(True)
        le.textChanged.connect(lambda t, c=i: proxy.set_filtro(c, t))
        edits.append(le)
        if btn is not None:
            lay.insertWidget(lay.indexOf(btn), le)
        else:
            lay.addWidget(le)

    barra._edits = edits
    barra._proxy = proxy


def _limpiar_edits(edits, proxy):
    for le in edits:
        le.blockSignals(True)
        le.clear()
        le.blockSignals(False)
    proxy.limpiar_filtros()


def _reemplazar_en_grid(treeview, nuevo_widget):
    """Reemplaza el treeview en su layout por un contenedor con la barra + el treeview."""
    padre = treeview.parentWidget()
    if padre is None:
        return
    layout = padre.layout()
    if layout is None:
        return

    # Grid: conservar la celda del treeview
    if isinstance(layout, QGridLayout):
        pos = None
        for i in range(layout.count()):
            if layout.itemAt(i).widget() is treeview:
                pos = layout.getItemPosition(i)
                break

        if pos is not None:
            contenedor = QWidget(padre)
            contenedor.setObjectName("contenedor_filtros")
            v = QVBoxLayout(contenedor)
            v.setContentsMargins(0, 0, 0, 0)
            v.setSpacing(2)
            v.addWidget(nuevo_widget)
            v.addWidget(treeview)

            layout.removeWidget(treeview)
            layout.addWidget(contenedor, pos[0], pos[1], pos[2], pos[3])
            return

    # VBox u otros: insertar la barra arriba del treeview
    if isinstance(layout, QVBoxLayout):
        index = layout.indexOf(treeview)
        if index != -1:
            layout.insertWidget(index, nuevo_widget)
            return

    # Sin layout compatible: añadir la barra como hijo directo
    nuevo_widget.setParent(padre)
    nuevo_widget.show()


def instalar_filtros_excel(treeview, columnas=None, proxy=None):
    """
    Instala filtros estilo Excel + ordenamiento en un QTreeView.

    Parámetros:
        treeview  : QTreeView con un modelo ya seteado.
        columnas  : (opcional) lista de nombres de columna. Si es None se
                    toman de los encabezados horizontales del modelo.
        proxy     : (opcional) FiltroExcelProxy ya existente. Si no se pasa
                    se crea uno envolviendo el modelo actual del treeview.

    Retorna:
        (proxy, barra) -> (FiltroExcelProxy, QWidget de la fila de filtros)
    """
    modelo = treeview.model()

    if proxy is None:
        proxy = FiltroExcelProxy(treeview)
        proxy.setSourceModel(modelo)

    if columnas is None:
        columnas = []
        for i in range(proxy.columnCount()):
            item = modelo.horizontalHeaderItem(i) if modelo is not None else None
            columnas.append(item.text() if item else f"Columna {i + 1}")

    treeview.setModel(proxy)
    treeview.setSortingEnabled(True)
    treeview.header().setSortIndicatorShown(True)
    treeview.header().setSectionsClickable(True)
    treeview.sortByColumn(0, Qt.AscendingOrder)

    barra, edits = _crear_barra(columnas, proxy)
    _reemplazar_en_grid(treeview, barra)

    return proxy, barra


# =========================================================================
# Barra de paginación
# =========================================================================

def _crear_barra_paginacion(proxy):
    """Construye la barra de paginación asociada a un PaginacionProxy."""
    barra = QWidget()
    barra.setObjectName("barra_paginacion")
    barra.setStyleSheet(_estilo_barra_paginacion())

    lay = QHBoxLayout(barra)
    lay.setContentsMargins(6, 3, 6, 3)
    lay.setSpacing(4)

    def _boton(obj, texto, tip, accion):
        b = QToolButton(barra)
        b.setObjectName(obj)
        b.setText(texto)
        b.setToolTip(tip)
        b.setFixedSize(28, 22)
        b.clicked.connect(accion)
        lay.addWidget(b)
        return b

    btn_inicio = _boton("btn_pag_inicio", "\u23ee", "Primera página", proxy.ir_primera)
    btn_atras = _boton("btn_pag_atras", "\u25c0", "Página anterior", proxy.ir_anterior)

    spin = QSpinBox(barra)
    spin.setObjectName("spin_pagina")
    spin.setRange(1, 1)
    spin.setMinimumWidth(48)
    spin.setAlignment(Qt.AlignCenter)
    spin.valueChanged.connect(proxy.ir_pagina)
    lay.addWidget(spin)

    info = QLabel("Página 1 de 1", barra)
    info.setObjectName("label_pagina_info")
    lay.addWidget(info)

    btn_adelante = _boton("btn_pag_adelante", "\u25b6", "Página siguiente", proxy.ir_siguiente)
    btn_fin = _boton("btn_pag_fin", "\u23ed", "Última página", proxy.ir_ultima)

    lay.addStretch(1)

    contador = QLabel("", barra)
    contador.setObjectName("label_pagina_info")
    lay.addWidget(contador)

    def _actualizar_ui():
        total_pag = proxy.total_paginas()
        actual = proxy.pagina_actual()
        total_filas = proxy._total_filas()

        spin.blockSignals(True)
        spin.setRange(1, total_pag)
        spin.setValue(actual)
        spin.blockSignals(False)

        info.setText(f"Página {actual} de {total_pag}")
        contador.setText(f"{total_filas} registros")

        btn_inicio.setEnabled(actual > 1)
        btn_atras.setEnabled(actual > 1)
        btn_adelante.setEnabled(actual < total_pag)
        btn_fin.setEnabled(actual < total_pag)

    proxy.modelReset.connect(_actualizar_ui)
    proxy.layoutChanged.connect(_actualizar_ui)
    proxy.rowsInserted.connect(_actualizar_ui)
    proxy.rowsRemoved.connect(_actualizar_ui)

    _actualizar_ui()

    barra._proxy = proxy
    barra._actualizar_ui = _actualizar_ui
    return barra


def _insertar_paginacion(treeview, barra):
    """Inserta la barra de paginación DEBAJO del treeview en su layout."""
    padre = treeview.parentWidget()
    if padre is None:
        barra.setParent(treeview)
        barra.show()
        return

    layout = padre.layout()
    if layout is None:
        barra.setParent(padre)
        barra.show()
        return

    if isinstance(layout, QGridLayout):
        pos = None
        for i in range(layout.count()):
            if layout.itemAt(i).widget() is treeview:
                pos = layout.getItemPosition(i)
                break
        if pos is not None:
            layout.addWidget(barra, pos[0] + pos[2], pos[1], 1, pos[3])
            return

    if isinstance(layout, QVBoxLayout):
        index = layout.indexOf(treeview)
        if index != -1:
            layout.insertWidget(index + 1, barra)
            return

    barra.setParent(padre)
    barra.show()


def instalar_paginacion(treeview, proxy, limite=None):
    """
    Instala paginación sobre un proxy ya existente (FiltroExcelProxy).

    Envuelve 'proxy' en un PaginacionProxy y lo asigna como modelo del
    treeview, además de insertar la barra de paginación debajo.

    Parámetros:
        treeview : QTreeView con un modelo (puede ser un FiltroExcelProxy).
        proxy    : proxy fuente (filtros/orden) sobre el que paginar.
        limite   : filas por página (default FILAS_POR_PAGINA).

    Retorna:
        (paginacion, barra) -> (PaginacionProxy, QWidget de la barra)
    """
    paginacion = PaginacionProxy(limite=limite or FILAS_POR_PAGINA, parent=treeview)
    paginacion.setSourceModel(proxy)
    treeview.setModel(paginacion)

    # Conservar el orden actual del proxy de filtros
    try:
        col = proxy.sortColumn()
        order = proxy.sortOrder()
        if col >= 0:
            treeview.sortByColumn(col, order)
    except Exception:
        pass

    barra = _crear_barra_paginacion(paginacion)
    _insertar_paginacion(treeview, barra)

    return paginacion, barra


def instalar_filtros_paginacion(
    treeview,
    columnas=None,
    proxy=None,
    limite=None,
    columna_estado=None,
    patrones=None,
    color=None,
    color_texto=None,
):
    """
    Atajo: filtros Excel + paginación + resaltado por "Estado" en un solo paso.
    Retorna (proxy, barra, paginacion, barra_paginacion, delegate).
    """
    proxy, barra = instalar_filtros_excel(treeview, columnas=columnas, proxy=proxy)
    paginacion, barra_paginacion = instalar_paginacion(
        treeview, proxy, limite=limite
    )
    delegate = instalar_resaltado_estado(
        treeview,
        columna_estado=columna_estado,
        patrones=patrones,
        color=color,
        color_texto=color_texto,
    )
    return proxy, barra, paginacion, barra_paginacion, delegate


# =========================================================================
# Resaltado de filas según el campo "Estado"
# =========================================================================

class ResaltadoEstadoDelegate(QStyledItemDelegate):
    """
    Pinta de color claro (rojo suave) el fondo de TODAS las celdas de las
    filas cuyo campo "Estado" contenga alguno de los patrones configurados
    (verificado, retirado verificado, etc.). El color y los patrones se
    definen en ui/styles.py: FILA_ESTADO_ROJO y ESTADOS_RESALTAR.
    """

    def __init__(self, columna_estado, patrones=None, color=None, color_texto=None, parent=None):
        super().__init__(parent)
        self.columna_estado = columna_estado
        self.patrones = [
            (p or "").strip().lower() for p in (patrones or ESTADOS_RESALTAR)
        ]
        self.color_fondo = QColor(color or FILA_ESTADO_ROJO)
        # El tema pinta el texto de los listados con TEXTO_ENFATICO (blanco);
        # fijarlo aquí garantiza contraste sobre el fondo rojo.
        self.color_texto = QColor(color_texto or TEXTO_ENFATICO)

    def _estado_fila(self, index):
        if self.columna_estado < 0:
            return ""
        idx = index.sibling(index.row(), self.columna_estado)
        if not idx.isValid():
            return ""
        return str(idx.data(Qt.DisplayRole) or "").lower()

    def _debe_resaltar(self, index):
        if not self.patrones:
            return False
        estado = self._estado_fila(index)
        return any(p in estado for p in self.patrones)

    def paint(self, painter, option, index):
        if not self._debe_resaltar(index):
            super().paint(painter, option, index)
            return

        painter.save()

        # Fondo base rojo suave para toda la celda
        color_fondo = QColor(self.color_fondo)

        # Si está seleccionado, oscurecer el rojo para que la selección
        # siga siendo visible sobre el resaltado.
        if option.state & QStyle.State_Selected:
            color_fondo = color_fondo.darker(140)
        elif option.state & QStyle.State_MouseOver:
            color_fondo = color_fondo.lighter(115)

        painter.fillRect(option.rect, color_fondo)

        # Texto (color del tema, blanco, para contraste sobre el rojo)
        opt = self.option_from_widget(option, index)
        text = opt.text
        align = opt.displayAlignment

        painter.setPen(QColor(self.color_texto))
        painter.setFont(opt.font)
        rect = option.rect.adjusted(4, 0, -4, 0)
        painter.drawText(rect, align, text)

        painter.restore()

    def option_from_widget(self, option, index):
        from PySide6.QtWidgets import QStyleOptionViewItem
        opt = QStyleOptionViewItem(option)
        self.initStyleOption(opt, index)
        return opt


def instalar_resaltado_estado(treeview, columna_estado=None, patrones=None, color=None, color_texto=None):
    """
    Instala el resaltado de filas por estado en un QTreeView.

    Parámetros:
        treeview        : QTreeView (ya configurado con modelo/proxy).
        columna_estado  : índice de la columna "Estado". Si es None se
                          busca automáticamente una columna llamada "Estado".
        patrones        : lista de textos (minúsculas) a buscar en el estado.
        color           : color de fondo (QColor o str hex).
        color_texto     : color del texto de las filas resaltadas.

    Retorna:
        ResaltadoEstadoDelegate creado.
    """
    modelo = treeview.model()
    if modelo is None:
        return None

    if columna_estado is None:
        columna_estado = _indice_columna(modelo, "Estado")

    if columna_estado is None:
        return None

    delegate = ResaltadoEstadoDelegate(
        columna_estado,
        patrones=patrones,
        color=color,
        color_texto=color_texto,
        parent=treeview
    )
    treeview.setItemDelegate(delegate)
    return delegate


def instalar_filtros_excel_con_estado(
    treeview,
    columnas=None,
    proxy=None,
    columna_estado=None,
    patrones=None,
    color=None,
    color_texto=None,
):
    """
    Atajo: instala filtros Excel + resaltado de filas por "Estado" en un QTreeView.
    Retorna (proxy, barra, delegate).
    """
    proxy, barra = instalar_filtros_excel(
        treeview,
        columnas=columnas,
        proxy=proxy,
    )
    delegate = instalar_resaltado_estado(
        treeview,
        columna_estado=columna_estado,
        patrones=patrones,
        color=color,
        color_texto=color_texto,
    )
    return proxy, barra, delegate


def _indice_columna(modelo, nombre):
    """Devuelve el índice de la primera columna cuyo encabezado coincide con 'nombre'."""
    if modelo is None:
        return None
    for col in range(modelo.columnCount()):
        texto = modelo.headerData(col, Qt.Horizontal, Qt.DisplayRole)
        if texto is not None and str(texto).strip().lower() == nombre.lower():
            return col
    return None
