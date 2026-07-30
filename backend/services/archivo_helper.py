import os
import uuid
import logging
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("datcorr")

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


def _asegurar_directorio():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def guardar_archivo(archivo: UploadFile) -> str:
    _asegurar_directorio()
    ext = os.path.splitext(archivo.filename or "archivo")[1]
    nombre_unico = f"{uuid.uuid4()}::{archivo.filename}"
    ruta = os.path.join(UPLOAD_DIR, nombre_unico)
    try:
        contenido = archivo.file.read()
        with open(ruta, "wb") as f:
            f.write(contenido)
    except Exception as e:
        logger.error("Error al guardar archivo %s: %s", archivo.filename, e)
        raise HTTPException(500, "Error al guardar archivo")
    return nombre_unico


def obtener_ruta_archivo(nombre_archivo: str) -> str:
    ruta = os.path.join(UPLOAD_DIR, nombre_archivo)
    if not os.path.exists(ruta):
        raise HTTPException(404, "Archivo no encontrado")
    return ruta


def eliminar_archivo(nombre_archivo: str):
    if not nombre_archivo:
        return
    ruta = os.path.join(UPLOAD_DIR, nombre_archivo)
    if os.path.exists(ruta):
        try:
            os.remove(ruta)
        except Exception as e:
            logger.error("Error al eliminar archivo %s: %s", nombre_archivo, e)


def extraer_nombre_original(nombre_archivo: str) -> str:
    if "::" in nombre_archivo:
        return nombre_archivo.split("::", 1)[1]
    return nombre_archivo
