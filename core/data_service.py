from core.database_router import DatabaseRouter

class DataService:

    # -----------------------------------
    # CONSULTA GENÉRICA
    # -----------------------------------

    @staticmethod
    def fetch(query_postgres, query_sqlite=None):

        if DatabaseRouter.is_postgres():

            return DataService._fetch_postgres(query_postgres)

        return DataService._fetch_sqlite(query_sqlite or query_postgres)

    # -----------------------------------
    # POSTGRES
    # -----------------------------------

    @staticmethod
    def _fetch_postgres(query):

        # aquí irá SQLAlchemy después
        print("POSTGRES QUERY:", query)

        return []

    # -----------------------------------
    # SQLITE
    # -----------------------------------

    @staticmethod
    def _fetch_sqlite(query):

        import sqlite3

        print("SQLITE QUERY:", query)

        return []