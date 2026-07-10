# model/datcorr_dao_postgres.py

import logging
from datetime import datetime, timezone

from sqlalchemy import text
from db.router import DatabaseRouter
from db.registry import db_registry

logger = logging.getLogger(__name__)


class DatcorrDAOPostgres:

    def __init__(self, schema: str):
        self.schema = schema
        self.table = "Datcorr_database"
        self.id_field = "id_Datcorr_database"
        self.router = DatabaseRouter()

    def insertar(self, **kwargs) -> int | None:
        data = dict(kwargs)
        data["registro"] = datetime.now(timezone.utc).isoformat()

        engine = db_registry.get_engine()
        if not engine:
            raise RuntimeError("Engine no inicializado")

        columns = ",".join(f'"{k}"' for k in data.keys())
        values = ",".join(f":{k}" for k in data.keys())

        sql = text(f"""
            INSERT INTO "{self.schema}"."{self.table}"
            ({columns})
            VALUES ({values})
            RETURNING "{self.id_field}"
        """)

        with engine.begin() as conn:
            result = conn.execute(sql, data)
            row = result.fetchone()
            return row[0] if row else None

    def actualizar(self, id_registro: int, columna: str, valor: str):
        engine = db_registry.get_engine()
        if not engine:
            raise RuntimeError("Engine no inicializado")

        sql = text(f"""
            UPDATE "{self.schema}"."{self.table}"
            SET "{columna}" = :valor
            WHERE "{self.id_field}" = :id
        """)

        with engine.begin() as conn:
            conn.execute(sql, {"valor": valor, "id": id_registro})

    def eliminar(self, id_registro: int):
        engine = db_registry.get_engine()
        if not engine:
            raise RuntimeError("Engine no inicializado")

        sql = text(f"""
            DELETE FROM "{self.schema}"."{self.table}"
            WHERE "{self.id_field}" = :id
        """)

        with engine.begin() as conn:
            conn.execute(sql, {"id": id_registro})
