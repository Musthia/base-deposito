import os, sys
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres123")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "datcorr")

LOCAL_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
RAILWAY_URL = os.getenv("RAILWAY_DATABASE_URL")
if not RAILWAY_URL:
    print("ERROR: Set RAILWAY_DATABASE_URL en .env")
    print("Ej: RAILWAY_DATABASE_URL=postgresql+psycopg2://user:pass@host:port/db?sslmode=require")
    sys.exit(1)

local = create_engine(LOCAL_URL)
railway = create_engine(RAILWAY_URL)

SCHEMAS = [
    "escribania", "igpj", "igpj_listado_nuevo", "igpj_txt_listado",
    "ips", "maternidad", "pediatrico",
]

def migrate_schema(schema):
    print(f"=== {schema} ===", flush=True)
    full = f'"{schema}"."Datcorr_database"'

    with railway.connect() as c:
        c.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
        c.commit()

    with local.connect() as lc:
        cols = lc.execute(text(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = '{schema}' AND table_name = 'Datcorr_database'
            ORDER BY ordinal_position
        """)).all()

    col_defs = [f'    "{c[0]}" {"SERIAL" if c[0]=="id_Datcorr_database" and c[1]=="integer" else "TEXT"}' for c in cols]
    ddl = f'CREATE TABLE IF NOT EXISTS {full} (\n' + ",\n".join(col_defs) + "\n)"

    with railway.connect() as c:
        c.execute(text(f"DROP TABLE IF EXISTS {full}"))
        c.commit()
        c.execute(text(ddl))
        c.commit()
    print("  Tabla creada", flush=True)

    with local.connect() as lc:
        rows = lc.execute(text(f"SELECT * FROM {full}")).mappings().all()
    print(f"  {len(rows)} filas", flush=True)

    if not rows:
        return 0

    columns = list(rows[0].keys())
    qcols = ", ".join(f'"{c}"' for c in columns)

    with railway.connect() as rc:
        raw = rc.connection.driver_connection
        cur = raw.cursor()
        try:
            BATCH = 5000
            for i in range(0, len(rows), BATCH):
                batch = rows[i:i + BATCH]
                value_rows = []
                for r in batch:
                    vals = tuple(r[c] for c in columns)
                    ph = ",".join("%s" for _ in columns)
                    value_rows.append(f"({ph})")
                sql = f"INSERT INTO {full} ({qcols}) VALUES " + ",".join(value_rows)
                flat = []
                for r in batch:
                    flat.extend(r[c] for c in columns)
                cur.execute(sql, flat)
                raw.commit()
                print(f"    {min(i+BATCH, len(rows))}/{len(rows)}", flush=True)

            try:
                seq = f'"{schema}"."Datcorr_database_id_Datcorr_database_seq"'
                cur.execute(f"SELECT setval('{seq}', COALESCE((SELECT MAX(id_Datcorr_database) FROM {full}), 1))")
                raw.commit()
            except Exception:
                raw.rollback()
        finally:
            cur.close()

    print(f"  OK {len(rows)} migradas", flush=True)
    return len(rows)

total = 0
for s in SCHEMAS:
    total += migrate_schema(s)

print(f"\nTotal: {total} filas migradas", flush=True)
