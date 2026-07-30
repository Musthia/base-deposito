# Plan de Implementación IA en DatCorr — v3.0

> Basado en la arquitectura actual del proyecto.
> Asistente conversacional con Qwen2.5 local + PostgreSQL solo lectura.

---

## 1. Arquitectura (adaptada al proyecto actual)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Desktop App  │────▶│  Backend FastAPI  │────▶│  PostgreSQL  │
│ (httpx)      │     │  /ai/* endpoints  │     │  (READ ONLY) │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                              │
┌──────────────┐              │        ┌──────────────────────┐
│ Web App      │◀─────────────┘        │  Ollama (Qwen2.5)    │
│ (React/AiChat)│                     │  localhost:11434      │
└──────────────┘                      └──────────────────────┘
```

**Backend** llama a Ollama vía HTTP (httpx). **No** se ejecuta Qwen dentro de Python.

---

## 2. Documento del equipo

| Aspecto                       | v2.2 original                               | v3.0 adaptado                                                 |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| **Permisos**            | Roles string (`ADMIN`, `OFICINA`, etc.) | Sistema actual`nivel` (0-10) + `requiere_permiso`         |
| **Conexión DB**        | `psycopg2.connect()` directo              | Usa`database/conexion.py` existente                         |
| **API Ollama**          | `/api/generate` con `messages`          | `/api/chat` (formato correcto Ollama)                       |
| **Auth**                | `get_current_user` ficticio               | `obtener_usuario_actual` + `requiere_nivel` existentes    |
| **Logging**             | `logging` genérico                       | `backend/core/logger.py` existente                          |
| **Ubicación archivos** | `services/`, `routers/` sueltos         | `backend/services/`, `backend/routers/` (estructura real) |

---

## 3. Archivos a crear

### 3.1 `backend/services/ai_context_datcorr.md`

Conocimiento de la aplicación que la IA recibe como contexto en cada consulta. Ver contenido detallado en `integracion_qewen_v2.2.md` sección 1.1.

**Ubicación:** `backend/services/ai_context_datcorr.md`

### 3.2 `backend/services/ai_service.py`

```python
# backend/services/ai_service.py
import httpx
from datetime import datetime
from backend.core.logger import logger

class AIService:
    def __init__(self, endpoint="http://localhost:11434", model="qwen2.5:7b", context_file=None):
        self.endpoint = endpoint
        self.model = model
        self.contexto_app = self._cargar_contexto(context_file) if context_file else ""

    def _cargar_contexto(self, path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def _sistema_prompt(self, pregunta):
        return f"""Eres un asistente experto de DatCorr, un sistema de gestión documental.

Contexto del sistema:
{self.contexto_app}

Reglas:
1. Responde SOLO con información del contexto o datos verificados.
2. Si no sabes, indica que no puedes responder.
3. No alucines números, fechas ni existencias.
4. No ejecutes ni sugieras SQL.
5. Respeta los permisos del usuario autenticado.

Pregunta del usuario: {pregunta}"""

    def preguntar(self, pregunta: str, timeout=60) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": self._sistema_prompt(pregunta)},
                {"role": "user", "content": pregunta}
            ],
            "stream": False,
            "temperature": 0.3,
            "max_tokens": 2000,
        }
        try:
            resp = httpx.post(
                f"{self.endpoint}/api/chat",
                json=payload,
                timeout=timeout
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]
        except httpx.TimeoutException:
            return "Lo siento, la consulta tardó demasiado. Intenta de nuevo."
        except Exception as e:
            logger.error(f"AI error: {e}")
            return "Ocurrió un error al procesar tu consulta."

    def status(self) -> bool:
        try:
            r = httpx.get(f"{self.endpoint}/api/tags", timeout=5)
            return r.status_code == 200
        except Exception:
            return False
```

### 3.3 `backend/routers/ai_router.py`

```python
# backend/routers/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.services.ai_service import AIService
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.dependencies import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/ai", tags=["Asistente IA"])

ai_service = AIService(
    endpoint="http://localhost:11434",
    model="qwen2.5:7b",
    context_file="backend/services/ai_context_datcorr.md"
)

@router.get("/status")
def status():
    return {"disponible": ai_service.status()}

@router.post("/consultar")
def consultar(
    pregunta: str = Query(..., min_length=1, max_length=500),
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    if not pregunta.strip():
        raise HTTPException(400, "La pregunta no puede estar vacía")
    respuesta = ai_service.preguntar(pregunta)
    return {
        "respuesta": respuesta,
        "timestamp": datetime.now().isoformat()
    }
```

### 3.4 `backend/schemas/ai_schema.py`

```python
from pydantic import BaseModel
from datetime import datetime

class AiConsultaRequest(BaseModel):
    pregunta: str

class AiConsultaResponse(BaseModel):
    respuesta: str
    timestamp: str
```

### 3.5 `frontend/src/components/AiChat/AiChat.jsx` (Web)

```jsx
import { useState, useRef } from "react";
import { Box, Paper, Fab, TextField, IconButton, Typography, CircularProgress } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import api from "../../api/axiosClient";

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const enviar = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setInput("");
    setMsgs((p) => [...p, { texto: q, rol: "user" }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/consultar", null, { params: { pregunta: q } });
      setMsgs((p) => [...p, { texto: res.data.respuesta, rol: "ai" }]);
    } catch {
      setMsgs((p) => [...p, { texto: "Error al conectar con el asistente.", rol: "ai" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
        onClick={() => setOpen((p) => !p)}>
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>
      {open && (
        <Paper sx={{
          position: "fixed", bottom: 88, right: 24, width: 380, height: 500,
          zIndex: 9998, display: "flex", flexDirection: "column",
          bgcolor: "#1a2040", border: "1px solid #2a3050", borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #2a3050", fontWeight: 700, fontSize: 15, color: "#f0f2f5" }}>
            Asistente DatCorr
          </Box>
          <Box sx={{ flex: 1, overflow: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {msgs.length === 0 && (
              <Typography variant="body2" sx={{ color: "#8896b8", textAlign: "center", mt: 4 }}>
                Preguntame sobre DatCorr, cajas, expedientes, movimientos...
              </Typography>
            )}
            {msgs.map((m, i) => (
              <Box key={i} sx={{
                alignSelf: m.rol === "user" ? "flex-end" : "flex-start",
                bgcolor: m.rol === "user" ? "#2563eb" : "#141a2e",
                color: "#f0f2f5", px: 1.5, py: 1, borderRadius: 2,
                maxWidth: "85%", fontSize: 14, lineHeight: 1.5,
              }}>
                {m.texto}
              </Box>
            ))}
            {loading && <CircularProgress size={20} sx={{ alignSelf: "center", color: "#2563eb" }} />}
            <div ref={endRef} />
          </Box>
          <Box sx={{ p: 1.5, borderTop: "1px solid #2a3050", display: "flex", gap: 1 }}>
            <TextField size="small" fullWidth placeholder="Escribe tu pregunta..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#141a2e", color: "#f0f2f5" } }}
            />
            <IconButton onClick={enviar} disabled={loading} sx={{ color: "#2563eb" }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
```

---

## 4. Archivos a modificar

| Archivo                                 | Cambio                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `backend/main.py`                     | Agregar`from backend.routers.ai_router import router as ai_router` y `app.include_router(ai_router)` |
| `frontend/src/layouts/MainLayout.jsx` | Importar y montar`<AiChat />` (o en App.jsx)                                                           |
| `frontend/src/api/axiosClient.js`     | Sin cambios (ya maneja JWT)                                                                              |
| `database/conexion.py`                | Opcional: agregar método`crear_conexion_ia()` con user `datcorr_ia`                                 |

---

## 5. Fases de implementación

### Fase 0 — Setup (días 1-3)

| #   | Tarea                                  | Criterio                                               |
| --- | -------------------------------------- | ------------------------------------------------------ |
| 0.1 | Instalar Ollama en servidor o dev      | `ollama list` responde                               |
| 0.2 | Descargar Qwen2.5:7b                   | `ollama run qwen2.5:7b` responde en terminal         |
| 0.3 | Verificar endpoint local               | `curl http://localhost:11434/api/tags` devuelve JSON |
| 0.4 | Crear usuario PostgreSQL`datcorr_ia` | Solo SELECT en esquemas necesarios                     |

### Fase 1 — Backend IA (días 4-7)

| #   | Tarea                          | Archivo                                    |
| --- | ------------------------------ | ------------------------------------------ |
| 1.1 | Crear`ai_context_datcorr.md` | `backend/services/ai_context_datcorr.md` |
| 1.2 | Crear`ai_service.py`         | `backend/services/ai_service.py`         |
| 1.3 | Crear`ai_router.py`          | `backend/routers/ai_router.py`           |
| 1.4 | Registrar router en`main.py` | `backend/main.py`                        |
| 1.5 | Probar`GET /ai/status`       | Devuelve`{"disponible": true}`           |
| 1.6 | Probar`POST /ai/consultar`   | Responde sobre conceptos de DatCorr        |

### Fase 2 — Chat Web (días 8-10)

| #   | Tarea                       | Archivo                                               |
| --- | --------------------------- | ----------------------------------------------------- |
| 2.1 | Crear`AiChat.jsx`         | `frontend/src/components/AiChat/AiChat.jsx`         |
| 2.2 | Montar en`MainLayout.jsx` | Importar y agregar`<AiChat />`                      |
| 2.3 | Probar flujo completo       | Login → Abrir chat → Preguntar → Recibir respuesta |

### Fase 3 — Conectado a datos (días 11-15)

| #   | Tarea                                                    | Detalle                                               |
| --- | -------------------------------------------------------- | ----------------------------------------------------- |
| 3.1 | Agregar funciones de consulta segura en`ai_service.py` | `buscar_expediente()`, `contar_registros()`, etc. |
| 3.2 | Conectar DB con user`datcorr_ia`                       | Solo SELECT, conexión separada                       |
| 3.3 | Tool calling con Qwen                                    | Qwen decide qué función llamar según la pregunta   |
| 3.4 | Logging de tool calls                                    | Registrar cada consulta a DB                          |

### Fase 4 — Desktop (días 16-20)

| #   | Tarea                                  | Detalle                        |
| --- | -------------------------------------- | ------------------------------ |
| 4.1 | Crear`api_ia_client.py` en `core/` | Cliente httpx para desktop     |
| 4.2 | Agregar panel de chat en PySide6       | Ventana flotante con historial |
| 4.3 | Integrar con auth del desktop          | Usa el mismo token JWT         |

---

## 6. Seguridad

| Riesgo                                   | Mitigación                                            |
| ---------------------------------------- | ------------------------------------------------------ |
| Qwen ejecute SQL                         | No genera SQL. Usa funciones Python predefinidas       |
| Usuario vea datos que no le corresponden | `ai_service` filtra por `nivel` del usuario actual |
| Inyección de prompt                     | Timeout 60s, max_length 500 en pregunta                |
| Conexión DB expuesta                    | Usuario`datcorr_ia` con solo SELECT                  |
| Alucinaciones                            | Contexto explícito, temperatura baja (0.3)            |

---

## 7. Checklist final por fase

### Fase 0

- [ ] Ollama instalado y Qwen responde
- [ ] `datcorr_ia` creado en PostgreSQL
- [ ] `.env` con `OLLAMA_ENDPOINT` y `DATABASE_URL_IA`

### Fase 1

- [ ] `ai_context_datcorr.md` creado
- [ ] `GET /ai/status` → OK
- [ ] `POST /ai/consultar` responde coherentemente
- [ ] Build frontend sin errores

### Fase 2

- [ ] Chat flotante visible en la web
- [ ] Envío y recepción de mensajes funcionan
- [ ] Estilo dark coherente con el resto del sistema
- [ ] Scroll automático a nuevo mensaje

### Fase 3

- [ ] Funciones de consulta implementadas
- [ ] Tool calling integrado con Qwen
- [ ] Tool calls logueados
- [ ] Fallback cuando no se necesita DB

### Fase 4

- [ ] Desktop app puede consultar IA
- [ ] Mismo flujo que web
- [ ] Panel no bloquea la interfaz principal

---

## 9. Lo que NO se hace

- ❌ Qwen no genera ni ejecuta SQL
- ❌ No se almacenan credenciales en logs
- ❌ No se modifican tablas, schemas ni datos
- ❌ No se expone el endpoint de IA sin autenticación
- ❌ No se reemplaza ninguna funcionalidad existente

---
