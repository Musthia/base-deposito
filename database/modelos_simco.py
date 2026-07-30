from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, text
)
from sqlalchemy.dialects.postgresql import TIMESTAMP
from database.conexion import Base

class Solicitud(Base):
    __tablename__ = "solicitudes"
    __table_args__ = {"schema": "simco"}

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True, nullable=False)
    tipo_documento = Column(String, nullable=False)
    identificador_documento = Column(String, nullable=False)
    detalle = Column(Text, nullable=True)
    estado = Column(String, default="pendiente")
    prioridad = Column(String, default="media")
    destacado = Column(Boolean, default=False)
    verificado = Column(Boolean, default=False)
    creado_por_usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    creado_por = Column(String, nullable=True)
    fecha_creacion = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    archivo_nombre = Column(String, nullable=True)


class Respuesta(Base):
    __tablename__ = "respuestas"
    __table_args__ = {"schema": "simco"}

    id = Column(Integer, primary_key=True, index=True)
    solicitud_id = Column(Integer, ForeignKey("simco.solicitudes.id"), nullable=False)
    usuario_responde_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    usuario_responde = Column(String, nullable=True)
    estado_documento = Column(String, nullable=False)
    observacion = Column(Text, nullable=True)
    fecha_respuesta = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    archivo_nombre = Column(String, nullable=True)
