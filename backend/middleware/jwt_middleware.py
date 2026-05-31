from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

from jose import jwt, JWTError

from backend.database.conexion import SessionLocal
from backend.security.jwt_manager import SECRET_KEY, ALGORITHM

from backend.services.blacklist_service import token_esta_revocado
from backend.services.auditoria_service import registrar_auditoria
from backend.core.logger import logger


class JWTMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        # -----------------------------------
        # RUTAS PÚBLICAS
        # -----------------------------------

        public_paths = [
            "/docs",
            "/openapi.json",
            "/auth/login",
            #"/auth/refresh",
            "/usuarios/refresh",
        ]

        if request.url.path in public_paths:
            return await call_next(request)

        # -----------------------------------
        # EXTRAER TOKEN
        # -----------------------------------

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            logger.warning("JWT AUSENTE")

            return JSONResponse(
                status_code=401,
                content={"detail": "Token requerido"}
            )

        try:
            scheme, token = auth_header.split()

            if scheme.lower() != "bearer":
                raise JWTError("Esquema inválido")

            # -----------------------------------
            # DECODIFICAR JWT
            # -----------------------------------

            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            jti = payload.get("jti")
            usuario = payload.get("sub")

            # -----------------------------------
            # CONEXIÓN DB (IMPORTANTE)
            # -----------------------------------

            db = SessionLocal()

            try:

                # -----------------------------------
                # BLACKLIST GLOBAL CHECK
                # -----------------------------------

                if jti and token_esta_revocado(db, jti):

                    logger.critical(
                        f"JWT BLOQUEADO GLOBAL | usuario={usuario} | jti={jti}"
                    )

                    registrar_auditoria(
                        db=db,
                        usuario=usuario,
                        accion="TOKEN_REVOKED_GLOBAL",
                        tabla="auth",
                        detalle="Acceso con token revocado (middleware)"
                    )

                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Token revocado globalmente"}
                    )

                # -----------------------------------
                # INYECTAR USUARIO EN REQUEST
                # -----------------------------------

                request.state.user = {
                    "usuario": usuario,
                    "nivel": payload.get("nivel"),
                    "superusuario": payload.get("superusuario", False),
                    "jti": jti
                }

            finally:
                db.close()

        except JWTError:

            logger.warning("JWT MALFORMADO")

            return JSONResponse(
                status_code=401,
                content={"detail": "Token inválido"}
            )

        except Exception as e:

            logger.error(f"ERROR MIDDLEWARE JWT: {e}")

            return JSONResponse(
                status_code=500,
                content={"detail": "Error interno de seguridad"}
            )

        # -----------------------------------
        # CONTINUAR REQUEST
        # -----------------------------------

        response = await call_next(request)
        return response