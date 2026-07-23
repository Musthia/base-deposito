from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker

from dotenv import load_dotenv

import os

from sqlalchemy.orm import declarative_base

# -----------------------------------
# CARGAR VARIABLES ENTORNO
# -----------------------------------

load_dotenv()

# -----------------------------------
# VARIABLES POSTGRESQL
# -----------------------------------

DB_USER = os.getenv("DB_USER")

DB_PASSWORD = os.getenv("DB_PASSWORD")

DB_HOST = os.getenv("DB_HOST")

DB_PORT = os.getenv("DB_PORT")

DB_NAME = os.getenv("DB_NAME")

# -----------------------------------
# URL DATABASE
# -----------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = (
        f"postgresql+psycopg2://"
        f"{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
elif "sslmode" not in DATABASE_URL:
    DATABASE_URL += "?sslmode=require"

# -----------------------------------
# ENGINE
# -----------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

# -----------------------------------
# SESSION ORM
# -----------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -----------------------------------
# BASE ORM
# -----------------------------------

Base = declarative_base()