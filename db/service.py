# db/service.py

from db.router import DatabaseRouter


class DatabaseService:
    """
    PUENTE ENTRE TU UI Y EL ROUTER
    NO CONTIENE SQL
    SOLO DECIDE CÓMO LLAMAR AL ROUTER
    """

    def __init__(self):
        self.router = DatabaseRouter()

    # -----------------------------------
    # CONSULTA PRINCIPAL (TREEVIEW)
    # -----------------------------------
    def consultar(self, schema, table):

        rows, columns = self.router.fetch_all(schema, table)

        return rows, columns

    # -----------------------------------
    # LISTAR BASES DISPONIBLES
    # -----------------------------------
    def listar_bases(self):

        return self.router.list_bases()

    # -----------------------------------
    # BÚSQUEDA (ILIKE en todas las columnas)
    # -----------------------------------
    def buscar(self, schema, table, criterio):

        rows, columns = self.router.search(schema, table, criterio)

        return rows, columns

    # -----------------------------------
    # UPDATE (EDITAR REGISTRO)
    # -----------------------------------
    def actualizar(self, schema, table, id_field, id_value, data):

        self.router.update_by_id(
            schema,
            table,
            id_field,
            id_value,
            data
        )