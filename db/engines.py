# db/engines.py

from sqlalchemy import create_engine
import os

# =========================
# POSTGRESQL (central)
# =========================
POSTGRESQL_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://user:password@localhost:5432/datcorr"
)

postgres_engine = create_engine(
    POSTGRESQL_URL,
    pool_pre_ping=True,
    echo=False
)

# =========================
# FACTORY SQLITE DINÁMICO
# =========================
def get_sqlite_engine(db_path: str):
    """
    Crea un engine SQLite dinámico según organismo seleccionado
    """
    return create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        echo=False
    )