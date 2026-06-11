# db/router.py

from sqlalchemy import text
from db.registry import db_registry
from db.session import get_session


class DatabaseRouter:

    def __init__(self):
        pass

    # -----------------------------
    # SELECT DINÁMICO
    # -----------------------------
    def fetch_all(self, schema, table):

        engine = db_registry.get_engine()

        sql = f'SELECT * FROM "{schema}"."{table}"'

        with engine.connect() as conn:
            result = conn.execute(text(sql))
            return result.fetchall(), result.keys()

    # -----------------------------
    # INSERT DINÁMICO
    # -----------------------------
    def insert(self, schema, table, data: dict):

        engine = db_registry.get_engine()

        columns = ",".join(f'"{k}"' for k in data.keys())
        values = ",".join(f":{k}" for k in data.keys())

        sql = text(f"""
            INSERT INTO "{schema}"."{table}"
            ({columns})
            VALUES ({values})
        """)

        with engine.begin() as conn:
            conn.execute(sql, data)

    # -----------------------------
    # UPDATE DINÁMICO (por ID)
    # -----------------------------
    def update_by_id(self, schema, table, id_field, id_value, data: dict):

        engine = db_registry.get_engine()

        set_clause = ",".join(
            f'"{k}" = :{k}' for k in data.keys()
        )

        sql = text(f"""
            UPDATE "{schema}"."{table}"
            SET {set_clause}
            WHERE "{id_field}" = :id_value
        """)

        params = dict(data)
        params["id_value"] = id_value

        with engine.begin() as conn:
            conn.execute(sql, params)

    # -----------------------------
    # DELETE
    # -----------------------------
    def delete_by_id(self, schema, table, id_field, id_value):

        engine = db_registry.get_engine()

        sql = text(f"""
            DELETE FROM "{schema}"."{table}"
            WHERE "{id_field}" = :id
        """)

        with engine.begin() as conn:
            conn.execute(sql, {"id": id_value})