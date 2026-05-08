from sqlalchemy import create_engine

# -----------------------------------
# CONFIGURACIÓN POSTGRESQL
# -----------------------------------

USUARIO = "postgres"
PASSWORD = "postgres123"
HOST = "localhost"
PUERTO = "5432"
BASE_DATOS = "datcorr"

# -----------------------------------
# URL DATABASE
# -----------------------------------

DATABASE_URL = (
    f"postgresql+psycopg2://{USUARIO}:{PASSWORD}"
    f"@{HOST}:{PUERTO}/{BASE_DATOS}"
)

# -----------------------------------
# ENGINE GLOBAL
# -----------------------------------

engine = create_engine(
    DATABASE_URL,
    echo=False
)