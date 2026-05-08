import os

from dotenv import load_dotenv

from sqlalchemy import create_engine

# -----------------------------------
# CARGAR VARIABLES ENTORNO
# -----------------------------------

load_dotenv()

# -----------------------------------
# VARIABLES POSTGRESQL
# -----------------------------------

USUARIO = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PUERTO = os.getenv("DB_PORT")
BASE_DATOS = os.getenv("DB_NAME")

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