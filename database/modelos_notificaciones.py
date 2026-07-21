from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import TIMESTAMP
from database.conexion import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"
    __table_args__ = {"schema": "simco"}

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    tipo = Column(String(50), nullable=False)
    solicitud_id = Column(Integer, nullable=True)
    mensaje = Column(Text, nullable=False)
    leida = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
