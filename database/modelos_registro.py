from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database.modelos import Base

class RegistroPendiente(Base):
    __tablename__ = "registros_pendientes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    telefono = Column(String(50), nullable=True)
    organizacion = Column(String(255), nullable=True)
    motivo = Column(Text, nullable=True)
    username_sugerido = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=True)
    estado = Column(String(20), nullable=False, default="pendiente")  # pendiente | aprobado | rechazado
    admin_id = Column(Integer, nullable=True)
    rol_asignado = Column(String(50), nullable=True)
    nivel_asignado = Column(Integer, nullable=True)
    rechazo_motivo = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
