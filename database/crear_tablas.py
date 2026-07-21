from sqlalchemy import text
from database.conexion import engine
from database.modelos import Base

# -----------------------------------
# IMPORTAR MODELOS SIMCO
# -----------------------------------

import database.modelos_simco  # noqa
import database.modelos_notificaciones  # noqa

# -----------------------------------
# CREAR SCHEMAS
# -----------------------------------

print("\nCreando schemas...")

with engine.connect() as conn:
    conn.execute(text("CREATE SCHEMA IF NOT EXISTS simco"))
    conn.commit()

print("Schemas creados.")

# -----------------------------------
# CREAR TODAS LAS TABLAS
# -----------------------------------

print("Creando tablas PostgreSQL...\n")

Base.metadata.create_all(bind=engine)

print("Tablas creadas correctamente.")