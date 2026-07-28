from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import TIMESTAMP
from database.conexion import Base


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True)
    remitente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    destinatario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    asunto = Column(String(200), nullable=True)
    cuerpo = Column(Text, nullable=False)
    leido = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
