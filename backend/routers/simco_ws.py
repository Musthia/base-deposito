import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError

from backend.security.jwt_manager import SECRET_KEY, ALGORITHM
from database.conexion import SessionLocal
from database.modelos import Usuario
from backend.ws.simco_manager import manager

logger = logging.getLogger("datcorr")

router = APIRouter(tags=["Simco WS"])


@router.websocket("/api/simco/ws")
async def simco_websocket(websocket: WebSocket, token: str = Query(...)):
    usuario_id = None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            await websocket.close(code=4001)
            return

        db = SessionLocal()
        try:
            usuario = db.query(Usuario).filter(Usuario.usuario == username).first()
            if not usuario or not usuario.activo:
                await websocket.close(code=4001)
                return
            usuario_id = usuario.id
        finally:
            db.close()

        await manager.connect(websocket, usuario_id)

        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        if usuario_id:
            manager.disconnect(websocket, usuario_id)
    except JWTError:
        await websocket.close(code=4001)
    except Exception as e:
        logger.error(f"WS error: {e}")
        if usuario_id:
            manager.disconnect(websocket, usuario_id)
