from backend.database.conexion import (
    SessionLocal
)

# -----------------------------------
# DB SESSION
# -----------------------------------

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()