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

        if engine is None:
            raise Exception(
                f"Engine no inicializado para {schema}.{table}. "
                "Debes seleccionar una base antes de editar."
            )
        
        print("ENGINE:", db_registry.get_engine())
        
        print("SCHEMA:", schema)
        print("TABLE:", table)
        print("ID_FIELD:", id_field)
        print("ID_VALUE:", id_value)
        print("DATA:", data)

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
            
            result = conn.execute(sql, params)

            print("FILAS AFECTADAS:", result.rowcount)

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