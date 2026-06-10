# db/registry.py

class DBRegistry:
    """
    Mantiene la base activa en runtime (SQLite o PostgreSQL)
    """

    def __init__(self):
        self.engine = None
        self.db_type = None
        self.current_source = None

    def set_sqlite(self, db_path: str):
        from db.engines import get_sqlite_engine

        self.engine = get_sqlite_engine(db_path)
        self.db_type = "sqlite"
        self.current_source = db_path

    def set_postgres(self):
        from db.engines import postgres_engine

        self.engine = postgres_engine
        self.db_type = "postgres"
        self.current_source = "postgresql"

    def get_engine(self):
        return self.engine


# instancia global (tipo singleton)
db_registry = DBRegistry()