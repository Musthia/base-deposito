# db/session.py

from sqlalchemy.orm import sessionmaker
from db.registry import db_registry

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False
)

def get_session():
    """
    Siempre devuelve sesión sobre la base activa
    """
    engine = db_registry.get_engine()
    if engine is None:
        raise Exception("No database selected")

    SessionLocal.configure(bind=engine)
    return SessionLocal()
     