# ui/tree_loader.py

from PySide6.QtWidgets import QTableWidgetItem


class TreeLoader:

    def __init__(self, router):
        """
        router: instancia de DatabaseRouter
        """
        self.router = router

    def load_table(self, tree, schema, table):

        # -----------------------------------
        # 1. OBTENER DATOS DESDE BD
        # -----------------------------------
        rows, columns = self.router.fetch_all(schema, table)

        # -----------------------------------
        # 2. LIMPIAR TREEVIEW
        # -----------------------------------
        tree.clear()
        tree.setRowCount(0)

        # -----------------------------------
        # 3. CONFIGURAR COLUMNAS DINÁMICAS
        # -----------------------------------
        tree.setColumnCount(len(columns))
        tree.setHorizontalHeaderLabels(columns)

        # -----------------------------------
        # 4. CARGAR FILAS
        # -----------------------------------
        for row in rows:
            row_index = tree.rowCount()
            tree.insertRow(row_index)

            for col_index, value in enumerate(row):
                tree.setItem(
                    row_index,
                    col_index,
                    QTableWidgetItem(str(value))
                )