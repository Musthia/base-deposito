from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    TIMESTAMP,
    text,
    ForeignKey
)

from sqlalchemy.orm import (
    declarative_base,
    relationship
)

from sqlalchemy.orm import declarative_base

# -----------------------------------
# BASE ORM
# -----------------------------------

Base = declarative_base()

# -----------------------------------
# TABLA USUARIOS
# -----------------------------------

class Usuario(Base):

    __tablename__ = "usuarios"

    # -----------------------------------
    # CAMPOS
    # -----------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    apellido = Column(
        String(100),
        nullable=False
    )

    usuario = Column(
        String(50),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    rol = Column(
        String(50),
        nullable=False
    )

    nivel_seguridad = Column(
        Integer,
        default=1
    )

    activo = Column(
        Boolean,
        default=True
    )

    fecha_creacion = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    fecha_actualizacion = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )

# -----------------------------------
# TABLA PERMISOS
# -----------------------------------

class Permiso(Base):

    __tablename__ = "permisos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    codigo = Column(
        String(100),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=False
    )

# -----------------------------------
# TABLA RELACIÓN
# USUARIOS ↔ PERMISOS
# -----------------------------------

class UsuarioPermiso(Base):

    __tablename__ = "usuarios_permisos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    permiso_id = Column(
        Integer,
        ForeignKey("permisos.id"),
        nullable=False
    )

    # -----------------------------------
    # RELACIONES ORM
    # -----------------------------------

    usuario = relationship(
        "Usuario"
    )

    permiso = relationship(
        "Permiso"
    )