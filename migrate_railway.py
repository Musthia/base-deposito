import os, sys
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

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

local_engine = create_engine(LOCAL_URL)
railway_engine = create_engine(RAILWAY_URL)

LocalSession = sessionmaker(bind=local_engine)
RailwaySession = sessionmaker(bind=railway_engine)

TABLES = [
    ("roles", None, "id"),
    ("usuarios", None, "id"),
    ("permisos", None, "id"),
    ("usuarios_roles", None, "id"),
    ("usuarios_permisos", None, "id"),
    ("refresh_tokens", None, "id"),
    ("password_reset_tokens", None, "id"),
    ("token_blacklist", None, "id"),
    ("auditoria", None, "id"),
    ("registros_pendientes", None, "id"),
    ("solicitudes", "simco", "id"),
    ("respuestas", "simco", "id"),
    ("notificaciones", "simco", "id"),
]

def migrate_table(local, railway, table, schema, pk_col):
    full = f"{schema}.{table}" if schema else table
    print(f"  {full}...", end=" ")

    rows = local.execute(text(f"SELECT * FROM {full}")).mappings().all()
    if not rows:
        print("sin datos")
        return 0

    existing = railway.execute(text(f"SELECT COUNT(*) FROM {full}")).scalar()
    if existing > 0:
        print(f"ya tiene {existing} registros, saltando")
        return 0

    columns = list(rows[0].keys())
    cols = ", ".join(f'"{c}"' for c in columns)
    vals = ", ".join(f":{c}" for c in columns)

    railway.execute(text(f"INSERT INTO {full} ({cols}) VALUES ({vals})"), [dict(r) for r in rows])
    railway.commit()

    if pk_col:
        try:
            seq = f"{table}_{pk_col}_seq"
            if schema:
                seq = f"{schema}.{seq}"
            railway.execute(text(f"SELECT setval('{seq}', COALESCE((SELECT MAX({pk_col}) FROM {full}), 1))"))
            railway.commit()
        except Exception:
            railway.rollback()

    print(f"{len(rows)} migrados")
    return len(rows)

local = LocalSession()
railway = RailwaySession()

try:
    total = 0
    for table, schema, pk in TABLES:
        total += migrate_table(local, railway, table, schema, pk)
    print(f"\nMigracion completada: {total} registros")
except Exception as e:
    railway.rollback()
    print(f"\nERROR: {e}")
    raise
finally:
    local.close()
    railway.close()
