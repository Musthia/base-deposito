import os
import logging
from google.oauth2 import id_token
from google.auth.transport import requests

logger = logging.getLogger("datcorr")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def verificar_token_google(token: str) -> dict | None:
    if not GOOGLE_CLIENT_ID:
        logger.error("GOOGLE_CLIENT_ID no configurado")
        return None
    try:
        info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        if not info.get("email_verified"):
            logger.warning(f"Email no verificado: {info.get('email')}")
            return None
        return {
            "google_id": info["sub"],
            "email": info["email"],
            "nombre": info.get("given_name", ""),
            "apellido": info.get("family_name", ""),
        }
    except ValueError as e:
        logger.warning(f"Token Google invalido: {e}")
        return None
