import json
import logging
from fastapi import WebSocket

logger = logging.getLogger("datcorr")


class SimcoConnectionManager:
    def __init__(self):
        self._connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, usuario_id: int):
        await websocket.accept()
        if usuario_id not in self._connections:
            self._connections[usuario_id] = []
        self._connections[usuario_id].append(websocket)
        logger.debug(f"WS conectado: usuario_id={usuario_id}")

    def disconnect(self, websocket: WebSocket, usuario_id: int):
        conns = self._connections.get(usuario_id, [])
        if websocket in conns:
            conns.remove(websocket)
            if not conns:
                del self._connections[usuario_id]
        logger.debug(f"WS desconectado: usuario_id={usuario_id}")

    async def broadcast_event(self, event: dict, roles: list[str] | None = None):
        """Envía un evento a todos los conectados, opcionalmente filtrado por roles."""
        disconnected = []
        for uid, conns in list(self._connections.items()):
            for ws in conns:
                try:
                    await ws.send_json(event)
                except Exception:
                    disconnected.append((uid, ws))
        for uid, ws in disconnected:
            self.disconnect(ws, uid)

    async def notify_nueva_solicitud(self, codigo: str, creado_por: str):
        """Notifica a supervisores (nivel >= 5) que hay una nueva solicitud."""
        await self.broadcast_event({
            "tipo": "nueva_solicitud",
            "codigo": codigo,
            "creado_por": creado_por,
            "mensaje": f"Nueva solicitud {codigo} creada por {creado_por}",
        })

    async def notify_solicitud_respondida(self, codigo: str):
        """Notifica a operadores (nivel >= 3) que una solicitud fue respondida."""
        await self.broadcast_event({
            "tipo": "solicitud_respondida",
            "codigo": codigo,
            "mensaje": f"Solicitud {codigo} fue respondida",
        })


manager = SimcoConnectionManager()
