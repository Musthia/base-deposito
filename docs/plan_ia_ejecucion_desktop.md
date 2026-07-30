# Plan de Ejecución IA — Desktop App (versión real)

**Basado en:** `crear_ia.md` + comando real `llama-server.exe`
**Modelo:** Qwen3.5-4B-UD-Q4_K_XL via **llama.cpp** (NO Ollama)
**Alcance:** Solo desktop app (PySide6)
**Endpoint:** `http://localhost:8080/v1/chat/completions` (OpenAI-compatible)

---

## Estado Actual (ya funcionando)

El modelo ya está corriendo localmente con:

```bat
llama-server.exe ^
  -m "qwen 4.5-b"/Qwen3.5-4B-UD-Q4_K_XL.gguf ^
  -mm "qwen 4.5-b"/mmproj-BF16.gguf ^
  -ngl 999 ^
  -c 131072 ^
  --temp 0.6 ^
  --top-p 0.95 ^
  --top-k 20 ^
  --cache-type-k q8_0 ^
  --cache-type-v q8_0 ^
  ...
```

Esto expone un endpoint OpenAI-compatible en: **`http://localhost:8080/v1/chat/completions`**

---

## Fase 0: Conexión con llama.cpp (1 día)

No hay que instalar Ollama ni bajar modelos. El modelo ya está corriendo.

### Verificar que el endpoint responde:

```bash
curl http://localhost:8080/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -d "{\"model\": \"Qwen3.5-4B-UD-Q4_K_XL\", \"messages\": [{\"role\": \"user\", \"content\": \"Hola\"}], \"stream\": false}"
```

### Agregar al `.env` del backend:

```env
# IA — llama.cpp (ya corriendo)
LLAMA_ENDPOINT=http://localhost:8080/v1/chat/completions
LLAMA_MODEL=Qwen3.5-4B-UD-Q4_K_XL
AI_TIMEOUT=60
```

### Crear usuario DB de solo lectura:

```sql
-- scripts/crear_usuario_ia.sql
CREATE USER datcorr_ia WITH PASSWORD 'DatCorrIaSecure2026!';
\c datcorr;
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania
  GRANT SELECT ON TABLES TO datcorr_ia;
```

---

## Fase 1: Backend — Servicio IA (1 semana)

### 1.1 Crear `backend/services/ai_context_datcorr.md`

Contenido: descripción del sistema (cajas, expedientes, organismos, roles, bases, tablas, reglas de negocio). Copiar de `crear_ia.md` sección 1.1.

### 1.2 Crear `backend/services/ai_service.py`

Diferencia clave con planes anteriores: **usa endpoint de llama.cpp (OpenAI-compatible), no Ollama**.

```python
import httpx
import os
import json
import re
from datetime import datetime
from backend.core.logger import logger

LLAMA_ENDPOINT = os.getenv("LLAMA_ENDPOINT", "http://localhost:8080/v1/chat/completions")
LLAMA_MODEL = os.getenv("LLAMA_MODEL", "Qwen3.5-4B-UD-Q4_K_XL")
MAX_TOOL_CALLS = 3

class AIService:
    def __init__(self, context_file: str = None):
        self.endpoint = LLAMA_ENDPOINT
        self.model = LLAMA_MODEL
        self.contexto_app = ""
        self.db_conn = None
        if context_file:
            self.contexto_app = self._cargar_contexto(context_file)
        logger.info(f"AIService lista → {self.endpoint} modelo {self.model}")

    def _cargar_contexto(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def _system_prompt(self, pregunta: str) -> str:
        return f"""Eres un asistente experto de DATCORR, sistema de gestión documental.

Contexto del sistema:
{self.contexto_app}

Pregunta: {pregunta}

Reglas:
1. Responde SOLO con información del contexto o datos verificados.
2. Si no sabes, indica que no puedes responder.
3. No alucines números ni datos.
4. No ejecutes SQL. Usa las herramientas disponibles si necesitas datos.
5. Máximo 3 llamadas a herramientas por consulta."""

    def _detectar_intencion(self, pregunta: str) -> str | None:
        patrones = {
            "contar_registros": r"(cuantos|cuantas|total|cantidad).*?(registros|cajas|expedientes)",
            "buscar_expediente": r"(donde|ubicación|buscá).*?(expediente|caja)",
            "obtener_movimientos": r"(movimientos|historial|traslados).*?(caja|expediente)",
        }
        for nombre, pat in patrones.items():
            if re.search(pat, pregunta, re.IGNORECASE):
                return nombre
        return None

    def _llamar_a_llama(self, messages: list, herramientas: list = None) -> dict:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "temperature": 0.6,       # coincide con el .bat
            "top_p": 0.95,
            "top_k": 20,
            "max_tokens": 2000,
        }
        if herramientas:
            payload["tools"] = herramientas
            payload["tool_choice"] = "auto"

        resp = httpx.post(self.endpoint, json=payload, timeout=int(os.getenv("AI_TIMEOUT", "60")))
        resp.raise_for_status()
        data = resp.json()
        msg = data["choices"][0]["message"]
        return {
            "respuesta": msg.get("content", ""),
            "tool_calls": msg.get("tool_calls", []),
        }

    def consultar(self, pregunta: str, usuario_actual=None) -> dict:
        if not self.contexto_app:
            return {"error": "Contexto no cargado"}

        intencion = self._detectar_intencion(pregunta)
        herramientas = []

        if intencion == "contar_registros":
            herramientas = [{
                "type": "function",
                "function": {
                    "name": "contar_registros",
                    "description": "Cuenta registros de un esquema",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "esquema": {"type": "string", "enum": ["ips","pediatrico","igpj","maternidad","escribania"]}
                        },
                        "required": ["esquema"]
                    }
                }
            }]
        elif intencion == "buscar_expediente":
            herramientas = [{
                "type": "function",
                "function": {
                    "name": "buscar_expediente",
                    "description": "Busca expediente por número en todas las bases",
                    "parameters": {
                        "type": "object",
                        "properties": {"numero": {"type": "string"}},
                        "required": ["numero"]
                    }
                }
            }]
        elif intencion == "obtener_movimientos":
            herramientas = [{
                "type": "function",
                "function": {
                    "name": "obtener_movimientos",
                    "description": "Obtiene movimientos de una caja",
                    "parameters": {
                        "type": "object",
                        "properties": {"caja_id": {"type": "integer"}},
                        "required": ["caja_id"]
                    }
                }
            }]

        messages = [
            {"role": "system", "content": self._system_prompt(pregunta)},
            {"role": "user", "content": pregunta},
        ]

        resultado = self._llamar_a_llama(messages, herramientas)

        # Bucle de tool calling (máx 3 iteraciones)
        iteraciones = 0
        while resultado.get("tool_calls") and iteraciones < MAX_TOOL_CALLS:
            iteraciones += 1
            tool_call = resultado["tool_calls"][0]
            fn_name = tool_call["function"]["name"]
            fn_args = json.loads(tool_call["function"]["arguments"])

            logger.info(f"Tool call #{iteraciones}: {fn_name}({fn_args})")

            # Ejecutar (implementación real en Fase 2 con DB)
            resultado_ejec = self._ejecutar_tool(fn_name, fn_args)

            messages.append({"role": "assistant", "content": resultado["respuesta"]})
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call["id"],
                "content": json.dumps(resultado_ejec)
            })

            resultado = self._llamar_a_llama(messages, herramientas)
            # tool_calls del assistant actual
            if resultado.get("tool_calls"):
                resultado["tool_calls"] = resultado["tool_calls"]
            else:
                resultado["tool_calls"] = []

        return {
            "respuesta": resultado.get("respuesta", ""),
            "tool_calls": resultado.get("tool_calls", []),
            "timestamp": datetime.now().isoformat(),
        }

    def _ejecutar_tool(self, name: str, args: dict) -> dict:
        """Placeholder — se implementa en Fase 2 con DB real"""
        return {"resultado": f"Tool {name} ejecutado con args {args}", "tipo": "placeholder"}
```

### 1.3 Crear `backend/routers/ai_router.py`

```python
router = APIRouter(prefix="/ai", tags=["IA"])

@router.get("/status")
def status():
    try:
        httpx.get("http://localhost:8080/health", timeout=3)
        return {"disponible": True}
    except:
        return {"disponible": False}

@router.post("/consultar")
def consultar(
    pregunta: str = Query(..., min_length=1, max_length=500),
    usuario_actual=Depends(obtener_usuario_actual),
):
    if not usuario_actual:
        raise HTTPException(401, "No autenticado")
    respuesta = ai_service.consultar(pregunta, usuario_actual)
    if "error" in respuesta:
        raise HTTPException(500, respuesta["error"])
    return respuesta
```

### 1.4 Crear `backend/schemas/ai_schema.py`

```python
class AiConsultaRequest(BaseModel):
    pregunta: str
    timeout: int = 30

class AiConsultaResponse(BaseModel):
    respuesta: str
    timestamp: str
    tool_calls: list = []

class AiStatusResponse(BaseModel):
    disponible: bool
```

### 1.5 Registrar en `backend/main.py`

```python
from backend.routers.ai_router import router as ai_router
app.include_router(ai_router)
```

---

## Fase 2: Backend — Conexión a Datos Reales (1 semana)

### 2.1 Agregar funciones DB en `ai_service.py`

```python
import psycopg2

def _conectar_db_ia(self) -> bool:
    try:
        self.db_conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "5432")),
            user=os.getenv("DB_USER_IA", "datcorr_ia"),
            password=os.getenv("DB_PASSWORD_IA", ""),
            dbname=os.getenv("DB_NAME", "datcorr"),
            connect_timeout=10,
        )
        return True
    except Exception as e:
        logger.error(f"Error DB IA: {e}")
        return False
```

### 2.2 Reemplazar `_ejecutar_tool` con implementación real

```python
def _ejecutar_tool(self, name: str, args: dict) -> dict:
    if not self.db_conn and not self._conectar_db_ia():
        return {"error": "Base de datos no disponible"}

    with self.db_conn.cursor() as cur:
        if name == "contar_registros":
            esquema = args.get("esquema", "public")
            cur.execute(f"SELECT COUNT(*) FROM {esquema}.Datcorr_database")
            return {"total": cur.fetchone()[0], "esquema": esquema}

        elif name == "buscar_expediente":
            numero = args.get("numero", "")
            esquemas = ["ips", "pediatrico", "igpj", "maternidad", "escribania"]
            for esquema in esquemas:
                cur.execute(f"SELECT * FROM {esquema}.Datcorr_database WHERE registro = %s LIMIT 1", (numero,))
                row = cur.fetchone()
                if row:
                    return {"encontrado": True, "esquema": esquema, "datos": str(row)}
            return {"encontrado": False}

        elif name == "obtener_movimientos":
            caja_id = args.get("caja_id")
            # Buscar en qué esquema está la caja
            for esquema in ["ips", "pediatrico", "igpj", "maternidad", "escribania"]:
                cur.execute(f"SELECT * FROM {esquema}.movimientos WHERE caja_id = %s", (caja_id,))
                rows = cur.fetchall()
                if rows:
                    return {"esquema": esquema, "movimientos": [str(r) for r in rows[:10]]}
            return {"movimientos": []}

    return {"error": "Herramienta no encontrada"}
```

---

## Fase 3: Desktop — Widget de Chat (1 semana)

### 3.1 Crear `core/api_ia_client.py`

```python
class ApiIaClient:
    def __init__(self, client):
        self._client = client

    def consultar(self, pregunta: str) -> dict:
        return self._client.post("/ai/consultar", {"pregunta": pregunta})

    def status(self) -> dict:
        return self._client.get("/ai/status")

    def historial(self, limit=50) -> list:
        return self._client.get(f"/ai/historial?limit={limit}").get("historial", [])

    def limpiar_historial(self) -> dict:
        return self._client.delete("/ai/historial")
```

### 3.2 Crear `core/ai_chat_widget.py`

Widget PySide6 con:
- Título "Asistente DatCorr"
- Área de scroll con burbujas de mensajes
- Input de texto + botón "Enviar"
- Loading indicator
- Atajo Enter para enviar
- Botón de cerrar
- Compatible con el tema oscuro del proyecto (usa `#0f1425`, `#141a2e`, etc.)

```python
class AiChatWidget(QWidget):
    def __init__(self, api_client: ApiIaClient, parent=None):
        super().__init__(parent)
        self.api_client = api_client
        self.messages = []
        self.setup_ui()

    def setup_ui(self):
        layout = QVBoxLayout(self)
        # ... implementación completa del chat
```

### 3.3 Integrar en la ventana principal

En el mismo toolbar donde están los botones existentes, agregar:

```python
self.btn_ia = QPushButton("🤖 IA")
self.btn_ia.clicked.connect(self.abrir_chat_ia)
self.toolbar.addWidget(self.btn_ia)

def abrir_chat_ia(self):
    if not hasattr(self, "_ai_chat"):
        self._ai_chat = AiChatWidget(self.api_client)
    self._ai_chat.show()
    self._ai_chat.raise_()
    self._ai_chat.activateWindow()
```

---

## Archivos: Resumen

### Crear

| Archivo | Contenido |
|---|---|
| `scripts/crear_usuario_ia.sql` | Usuario PostgreSQL solo SELECT |
| `backend/services/ai_service.py` | Servicio IA (endpoint llama.cpp) |
| `backend/services/ai_context_datcorr.md` | Contexto del sistema |
| `backend/routers/ai_router.py` | Endpoints REST |
| `backend/schemas/ai_schema.py` | Models Pydantic |
| `core/api_ia_client.py` | Cliente httpx para desktop |
| `core/ai_chat_widget.py` | Widget de chat PySide6 |

### Modificar

| Archivo | Cambio |
|---|---|
| `.env` | Agregar `LLAMA_ENDPOINT`, `DB_USER_IA`, `DB_PASSWORD_IA` |
| `backend/main.py` | Agregar `app.include_router(ai_router)` |
| Desktop `main.py` | Agregar botón "🤖 IA" + abrir chat |

---

## Lo que NO se hace

- ❌ No instalar Ollama (el modelo ya corre con llama.cpp)
- ❌ No hay componente web de chat
- ❌ Qwen no ejecuta SQL directo
- ❌ No se cambia ninguna función existente de DatCorr

---

## Timeline

| Fase | Tareas | Duración |
|---|---|---|
| Fase 0 | Verificar endpoint llama.cpp, crear user DB, .env | 1 día |
| Fase 1 | ai_service.py + ai_router.py + schemas + contexto | 1 semana |
| Fase 2 | Conexión DB real + funciones tool calling | 1 semana |
| Fase 3 | api_ia_client.py + ai_chat_widget.py + botón toolbar | 1 semana |
| **Total** | **~3 semanas** | |
