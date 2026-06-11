from sqlalchemy import text

from migration.type_mapper import sqlite_to_postgres


class PostgreSQLWriter:

    def __init__(self, session):
        self.session = session

    def create_table_if_not_exists(
        self,
        schema_name,
        table_name,
        columns
    ):

        fields = []

        for col in columns:

            cid, name, col_type, notnull, default, pk = col

            pg_type = sqlite_to_postgres(col_type)

            definition = f'"{name}" {pg_type}'

            if pk:
                definition += " PRIMARY KEY"

            fields.append(definition)

        sql = f"""
        CREATE TABLE IF NOT EXISTS
        "{schema_name}"."{table_name}"
        (
            {",".join(fields)}
        )
        """

        self.session.execute(text(sql))
        self.session.commit()
        
    def insert_rows(
        self,
        schema_name,
        table_name,
        columns,
        rows
    ):

        column_names = [
            c[1]
            for c in columns
        ]

        fields = ",".join(
            f'"{x}"'
            for x in column_names
        )

        placeholders = ",".join(
            f":{x}"
            for x in column_names
        )

        sql = text(f"""
            INSERT INTO "{schema_name}"."{table_name}"
            ({fields})
            VALUES
            ({placeholders})
        """)

        for row in rows:

            data = dict(
                zip(column_names, row)
            )

            self.session.execute(
                sql,
                data
            )

        self.session.commit()