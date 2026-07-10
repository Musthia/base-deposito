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
    # LISTAR BASES (schemas con Datcorr_database)
    # -----------------------------
    def list_bases(self):

        engine = db_registry.get_engine()

        with engine.connect() as conn:

            sql = text(
                "SELECT schema_name FROM information_schema.schemata "
                "WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast')"
            )
            result = conn.execute(sql)
            schemas = [row[0] for row in result]

            bases = []
            for schema in schemas:
                tbl_sql = text(
                    "SELECT 1 FROM information_schema.tables "
                    "WHERE table_schema = :schema AND table_name = 'Datcorr_database'"
                )
                tbl_result = conn.execute(tbl_sql, {"schema": schema})
                if tbl_result.fetchone():
                    bases.append(schema)

            return bases

    # -----------------------------
    # SEARCH (ILIKE en todas las columnas)
    # -----------------------------
    def search(self, schema, table, criterio):

        engine = db_registry.get_engine()

        with engine.connect() as conn:

            col_sql = text(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_schema = :schema AND table_name = :table"
            )
            col_result = conn.execute(col_sql, {"schema": schema, "table": table})
            columnas_info = col_result.fetchall()

            columnas = [
                row[0] for row in columnas_info
                if not row[0].lower().startswith("id_datcorr")
            ]

            if not columnas:
                return [], []

            where_clause = " OR ".join(
                'CAST("{}" AS TEXT) ILIKE :patron'.format(c) for c in columnas
            )

            id_col = next(
                (row[0] for row in columnas_info if row[0].lower().startswith("id_datcorr")),
                "id_Datcorr_database"
            )

            cols_select = ", ".join('"{}"'.format(c) for c in columnas)

            sql = text(
                'SELECT "{}", {} FROM "{}"."{}" WHERE {}'.format(
                    id_col, cols_select, schema, table, where_clause
                )
            )

            result = conn.execute(sql, {"patron": f"%{criterio}%"})
            return result.fetchall(), result.keys()

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