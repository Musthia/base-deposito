# Plan de Integración IA — Solo Desktop App

Basado en Analisis del equipo.
**Aclaración fundamental:** La integración IA es **exclusivamente para la aplicación de escritorio (PySide6)**. No hay componente web.

---

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│                  Desktop App                      │
│  ┌────────────────────────────────────────────┐  │
│  │  Ventana Principal (PySide6)               │  │
│  │                                            │  │
│  │  ┌──────────────────┐  ┌────────────────┐ │  │
│  │  │ Panel principal  │  │ Chat IA        │ │  │
│  │  │ (gestión normal) │  │ (flotante)     │ │  │
│  │  └──────────────────┘  └────────────────┘ │  │
│  └──────────────────┬─────────────────────────┘  │
│                     │                             │
│  ┌──────────────────▼─────────────────────────┐  │
│  │  ApiCliente (httpx) — llama a FastAPI      │  │
│  └──────────────────┬─────────────────────────┘  │
└─────────────────────┼────────────────────────────┘
                      │ HTTP
┌─────────────────────▼────────────────────────────┐
│              Backend FastAPI                      │
│  ┌────────────────────────────────────────────┐  │
│  │  ai_router.py  ←  /ai/consultar           │  │
│  │  ai_service.py  ←  servicio IA            │  │
│  └──────────────────┬─────────────────────────┘  │
│                     │                             │
│  ┌──────────────────▼─────────────────────────┐  │
│  │  Qwen2.5:7b (Ollama local)                │  │
│  │  http://localhost:11434/api/generate       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  PostgreSQL (usuario datcorr_ia, solo lec) │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

La desktop app se comunica con el backend FastAPI existente vía httpx (mismo `ApiCliente` que ya usa). El backend habla con Qwen (Ollama) y PostgreSQL (solo SELECT). No se crea UI web para el chat.

---

## Fase 0: Prerrequisitos (1 semana)

| Tarea                                              | Archivos                                                                          | Criterio                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| Instalar Ollama en servidor local                  | —                                                                                | `ollama list` funciona               |
| Descargar Qwen2.5:7b                               | —                                                                                | `ollama run qwen2.5:7b` responde     |
| Crear usuario PostgreSQL`datcorr_ia` solo SELECT | `scripts/crear_usuario_ia.sql`                                                  | `\du datcorr_ia` muestra solo SELECT |
| Agregar vars de entorno al`.env` del backend     | `.env`: `OLLAMA_ENDPOINT`, `QWEN_MODEL`, `DB_USER_IA`, `DB_PASSWORD_IA` | Backend las lee sin error              |

### Archivos a crear

| Archivo                          | Contenido                                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/crear_usuario_ia.sql` | `CREATE USER datcorr_ia WITH PASSWORD '...'; GRANT CONNECT ON DATABASE datcorr TO datcorr_ia; GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia; ALTER DEFAULT PRIVILEGES... GRANT SELECT ON TABLES TO datcorr_ia;` |

### Archivos a modificar

| Archivo  | Cambio                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env` | Agregar`OLLAMA_ENDPOINT=http://localhost:11434/api/generate`, `QWEN_MODEL=qwen2.5:7b`, `DB_USER_IA=datcorr_ia`, `DB_PASSWORD_IA=...` |

---

## Fase 1: Backend IA — Asistente Informativo (2 semanas)

Solo responde preguntas sobre el funcionamiento de DatCorr. **No consulta base de datos.**

### 1.1 Crear `backend/services/ai_context_datcorr.md`

Contenido: descripción del sistema (cajas, expedientes, organismos, roles, bases disponibles, reglas de negocio). Copiado de `integracion_qewen_v2.2.md` sección 1.1.

### 1.2 Crear `backend/services/ai_service.py`

```python
class AIService:
    def __init__(self, model_endpoint, context_file):
        self.endpoint = model_endpoint
        self.contexto_app = self._cargar_contexto(context_file)

    def consultar(self, pregunta: str, usuario_actual) -> dict:
        # 1. Validar que el usuario tiene permiso para usar IA
        # 2. Construir prompt: contexto app + pregunta
        # 3. Llamar a Qwen (POST a Ollama)
        # 4. Devolver {"respuesta": ..., "tiempo": ...}
```

Métodos internos:

- `_cargar_contexto(path)` → lee el .md
- `_llamar_a_qwen(prompt)` → httpx.post al endpoint de Ollama con payload `{"model": "qwen2.5:7b", "messages": [...], "temperature": 0.3, "max_tokens": 2000}`
- `_validar_permiso_ia(usuario)` → True si el usuario tiene nivel >= 1 (todos los usuarios autenticados pueden usar IA en Fase 1)

### 1.3 Crear `backend/routers/ai_router.py`

Endpoints:

| Método    | Ruta              | Auth                 | Descripción                       |
| ---------- | ----------------- | -------------------- | ---------------------------------- |
| `POST`   | `/ai/consultar` | JWT (usuario actual) | Envía pregunta, recibe respuesta  |
| `GET`    | `/ai/status`    | No                   | Verifica que Qwen responde         |
| `GET`    | `/ai/historial` | JWT                  | Historial de consultas del usuario |
| `DELETE` | `/ai/historial` | JWT                  | Limpiar historial                  |

Modelo de request:

```json
{
  "pregunta": "¿Qué es una caja?",
  "timeout": 30
}
```

Modelo de response:

```json
{
  "respuesta": "Una caja es una unidad física para almacenar documentación...",
  "tiempo": 2.34,
  "timestamp": "2026-07-29T12:00:00"
}
```

### 1.4 Registrar router en `backend/main.py`

```python
from backend.routers.ai_router import router as ai_router
app.include_router(ai_router)
```

### 1.5 Archivos a crear (Fase 1)

| Archivo                                    | Descripción                                          |
| ------------------------------------------ | ----------------------------------------------------- |
| `backend/services/ai_service.py`         | Servicio IA (Qwen + contexto)                         |
| `backend/services/ai_context_datcorr.md` | Conocimiento de la aplicación                        |
| `backend/routers/ai_router.py`           | Endpoints REST                                        |
| `backend/schemas/ai_schema.py`           | Pydantic models (ConsultarRequest, ConsultarResponse) |

### 1.6 Criterios de aceptación

- [ ] `GET /ai/status` devuelve `{"status": "OK"}`
- [ ] `POST /ai/consultar` con pregunta sobre la app responde coherentemente
- [ ] Sin token JWT → 401
- [ ] Timeout configurable (default 30s, máx 60s)
- [ ] Todas las respuestas se loguean

---

## Fase 2: Backend IA — Conectado a Datos (2 semanas)

La IA responde con datos reales de PostgreSQL, usando funciones controladas.

### 2.1 Conexión DB de solo lectura

En `ai_service.py`, agregar:

```python
def _conectar_db_ia(self):
    """Conexión PostgreSQL con usuario datcorr_ia (solo SELECT)"""
    import psycopg2
    self.db_conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER_IA"),
        password=os.getenv("DB_PASSWORD_IA"),
        dbname=os.getenv("DB_NAME", "datcorr"),
        connect_timeout=10
    )
```

### 2.2 Funciones de consulta seguras

```python
def contar_registros(self, esquema: str) -> int:
    query = f"SELECT COUNT(*) FROM {esquema}.Datcorr_database"
    with self.db_conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchone()[0]

def buscar_expediente(self, numero: str) -> list:
    # Buscar en todos los esquemas permitidos
    ...

def obtener_movimientos(self, caja_id: int) -> list:
    # Consultar tabla de movimientos
    ...
```

**Regla de seguridad:** Estas funciones NO reciben SQL generado por el modelo. Son funciones Python fijas que construyen SQL internamente.

### 2.3 Detección de intención

En `consultar()`, antes de llamar a Qwen:

```python
intent = self._detectar_intencion(pregunta)
if intent == "contar_registros":
    resultado = self.contar_registros(esquema)
    # Inyectar resultado en el prompt a Qwen
    datos_contexto = f"Dato real: {resultado} registros."
elif intent == "buscar_expediente":
    ...
```

Patrones de detección (regex):

- `contar_registros`: `r"(cuantos|cuantas|total|cantidad).*(registros|cajas|expedientes)"`
- `buscar_expediente`: `r"(donde|ubicación|buscar).*(expediente|caja)"`
- `obtener_movimientos`: `r"(movimientos|historial|traslados).*(caja)"`

Si no hay match, responde solo con contexto app (Fase 1).

### 2.4 Archivos a modificar (Fase 2)

| Archivo                            | Cambio                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `backend/services/ai_service.py` | Agregar`_conectar_db_ia()`, funciones de consulta, `_detectar_intencion()` |

### 2.5 Criterios de aceptación

- [ ] `"¿Cuántos registros hay en IPS?"` → responde con número real
- [ ] `"Buscá el expediente 1245"` → responde con datos reales
- [ ] No se ejecuta SQL generado por el modelo
- [ ] Timeout de DB: 10s
- [ ] Si la DB no responde, fallback a "No pude consultar la base de datos"

---

## Fase 3: Desktop App — Chat IA (2 semanas)

### 3.1 Crear `core/api_ia_client.py`

Cliente httpx para el desktop. Similar a `api_usuarios_client.py` pero para IA:

```python
class ApiIaClient:
    def __init__(self, client: ApiClient):
        self._client = client

    def consultar(self, pregunta: str, timeout: int = 30) -> dict:
        return self._client.post("/ai/consultar", {
            "pregunta": pregunta,
            "timeout": timeout
        })

    def status(self) -> dict:
        return self._client.get("/ai/status")

    def historial(self, limit: int = 50) -> list:
        return self._client.get(f"/ai/historial?limit={limit}")

    def limpiar_historial(self) -> dict:
        return self._client.delete("/ai/historial")
```

### 3.2 Crear `core/ai_chat_widget.py`

Widget PySide6 flotante para el chat:

```
┌──────────────────────────────────────┐
│  Asistente DatCorr            [×]    │
├──────────────────────────────────────┤
│                                      │
│  🤖 Hola, soy el asistente de       │
│     DatCorr. ¿En qué puedo           │
│     ayudarte?                        │
│                                      │
│  ¿Cuántas cajas hay en IPS?          │
│                                      │
│  🤖 Actualmente la base IPS          │
│     contiene 22.048 registros.       │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────┐ [Enviar] │
│  │ Escribí tu pregunta... │          │
│  └────────────────────────┘          │
└──────────────────────────────────────┘
```

Características:

- Se abre desde un botón 🤖 en la barra de herramientas
- Historial de mensajes en la sesión actual
- Scroll automático al último mensaje
- Loading indicator mientras Qwen responde
- Atajo Enter para enviar
- Botón para limpiar la conversación

### 3.3 Integrar en `main.py` de la desktop app

```python
from core.ai_chat_widget import AiChatWidget

class VentanaPrincipal(QMainWindow):
    def __init__(self):
        ...
        self.ai_chat = AiChatWidget(api_client)
        # Botón en la barra de herramientas
        self.btn_ia = QPushButton("🤖 Asistente IA")
        self.btn_ia.clicked.connect(self.mostrar_chat_ia)
        self.toolbar.addWidget(self.btn_ia)

    def mostrar_chat_ia(self):
        self.ai_chat.show()
        self.ai_chat.raise_()
```

### 3.4 Archivos a crear (Fase 3)

| Archivo                    | Descripción                    |
| -------------------------- | ------------------------------- |
| `core/api_ia_client.py`  | Cliente httpx para endpoints IA |
| `core/ai_chat_widget.py` | Widget PySide6 de chat          |
| `core/ai_chat_widget.ui` | Layout del widget (Qt Designer) |

### 3.5 Criterios de aceptación

- [ ] Botón "Asistente IA" visible en la barra de herramientas
- [ ] Ventana de chat se abre como flotante
- [ ] Los mensajes se muestran en burbujas diferenciadas (usuario vs IA)
- [ ] Loading spinner mientras procesa
- [ ] Enter envía el mensaje
- [ ] El chat usa el mismo token JWT de la sesión actual

---

## Fase 4: Tool Calling Automático (2 semanas)

La IA decide qué función llamar según la pregunta (Qwen tool calling nativo de Ollama).

### 4.1 Sistema de herramientas en Ollama

Qwen2.5 soporta tool calling. Se definen las herramientas en el payload:

```python
payload = {
    "model": "qwen2.5:7b",
    "messages": [...],
    "tools": [
        {
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
        },
        {
            "type": "function",
            "function": {
                "name": "buscar_expediente",
                "description": "Busca expediente por número en todas las bases",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "numero": {"type": "string"}
                    },
                    "required": ["numero"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "obtener_movimientos",
                "description": "Obtiene movimientos de una caja",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "caja_id": {"type": "integer"}
                    },
                    "required": ["caja_id"]
                }
            }
        }
    ],
    "tool_choice": "auto"
}
```

### 4.2 Bucle de ejecución

```
1. Qwen recibe pregunta + herramientas
2. Qwen responde con tool_call: {"name": "contar_registros", "args": {"esquema": "ips"}}
3. ai_service ejecuta la función real → resultado
4. Enviar resultado de vuelta a Qwen como mensaje "tool"
5. Qwen redacta respuesta final en lenguaje natural
```

Máximo 3 iteraciones (tools calls) por consulta para evitar loops infinitos.

### 4.3 Logging y auditoría

Cada tool call se loguea:

```
[AI] Usuario: admin (ID 1) preguntó: "¿Dónde está el exp 1254?"
[AI] Tool call: buscar_expediente(numero="1254") → {caja_id: 38, organismo: "IPS"}
[AI] Tiempo total: 4.23s
```

### 4.4 Archivos a modificar (Fase 4)

| Archivo                            | Cambio                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `backend/services/ai_service.py` | Agregar`_llamar_a_qwen_con_tools()`, `_ejecutar_tool_call()`, sistema de herramientas |

---

## Archivos: Resumen Completo

### Crear

| Archivo                                    | Fase   |
| ------------------------------------------ | ------ |
| `scripts/crear_usuario_ia.sql`           | Fase 0 |
| `backend/services/ai_service.py`         | Fase 1 |
| `backend/services/ai_context_datcorr.md` | Fase 1 |
| `backend/routers/ai_router.py`           | Fase 1 |
| `backend/schemas/ai_schema.py`           | Fase 1 |
| `core/api_ia_client.py`                  | Fase 3 |
| `core/ai_chat_widget.py`                 | Fase 3 |

### Modificar

| Archivo                               | Cambio                            | Fase   |
| ------------------------------------- | --------------------------------- | ------ |
| `.env`                              | Agregar vars Ollama + DB_IA       | Fase 0 |
| `backend/main.py`                   | Registrar`ai_router`            | Fase 1 |
| `backend/services/ai_service.py`    | Agregar funciones DB + detección | Fase 2 |
| `backend/services/ai_service.py`    | Agregar tool calling              | Fase 4 |
| Desktop`main.py` (VentanaPrincipal) | Agregar botón + abrir chat       | Fase 3 |

---

## Lo que NO se hace

- ❌ No hay componente web de chat (React/AiChat)
- ❌ Qwen no ejecuta SQL directo
- ❌ Qwen no tiene permisos de escritura en DB
- ❌ No se exponen credenciales en logs
- ❌ No se modifica ninguna funcionalidad existente de DatCorr

---

## Timeline

| Fase                          | Duración            | Entrega                    |
| ----------------------------- | -------------------- | -------------------------- |
| Fase 0 — Prerrequisitos      | 1 semana             | Ollama + usuario DB listos |
| Fase 1 — Backend informativo | 2 semanas            | `/ai/consultar` responde |
| Fase 2 — Backend conectado   | 2 semanas            | Consultas con datos reales |
| Fase 3 — Desktop chat        | 2 semanas            | Widget de chat funcionando |
| Fase 4 — Tool calling        | 2 semanas            | IA encadena herramientas   |
| **Total**               | **~9 semanas** |                            |

---
