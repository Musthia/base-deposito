from migration.sqlite_reader import SQLiteReader
from migration.postgres_writer import PostgreSQLWriter


class Migrator:

    def __init__(
        self,
        sqlite_db,
        postgres_session
    ):

        self.reader = SQLiteReader(sqlite_db)

        self.writer = PostgreSQLWriter(
            postgres_session
        )

    def migrate_table(
        self,
        schema_name,
        table_name
    ):

        columns = self.reader.get_columns(
            table_name
        )

        rows = self.reader.get_rows(
            table_name
        )

        self.writer.create_table_if_not_exists(
            schema_name,
            table_name,
            columns
        )

        self.writer.insert_rows(
            schema_name,
            table_name,
            columns,
            rows
        )

        print(
            f"{len(rows)} registros migrados"
        )