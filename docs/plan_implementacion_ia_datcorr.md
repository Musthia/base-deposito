# Plan de Implementación: Asistente IA en DATCORR

## Documento alineado al código actual del proyecto (FastAPI + React + PySide6 + PostgreSQL)
_Versión para revisión con el equipo — 2026-07-29_

---

## 1. Objetivo

Integrar un asistente conversacional local (Qwen) que responda preguntas sobre el funcionamiento de DATCORR y sus datos reales, sin modificar ni eliminar información, respetando permisos de usuario y sin exponer la base de datos.

La arquitectura del proyecto actual es:
- **Backend**: FastAPI (backend/main.py + routers/*)
- **Frontend web**: React + Vite (frontend/src/)
- **Desktop**: PySide6 (ventana_principal.py)
- **Base de datos**: PostgreSQL multi-schema (database/conexion.py, database/modelos.py)
- **Auth**: JWT con refresh token, middleware global (backend/middleware/jwt_middleware.py)
- **Permisos**: nivel_seguridad + sistema de permisos granulares (backend/core/permisos.py)

---

## 2. Arquitectura propuesta

### 2a. Para la app web (React)

```
Usuario
  │
  ▼
Frontend React (panel de chat + TopBar)
  │
  │ HTTP POST /ai/consultar
  ▼
Backend FastAPI (ai_router.py)
  │
  ├─► ai_service.py (lógica: contexto, tools, routing)
  │      │
  │      ├─► ai_context_datcorr.md (contexto de aplicación)
  │      │
  │      ├─► Herramientas seguras (solo lectura)
  │      │      ├─ buscar_expediente(numero, esquema, usuario)
  │      │      ├─ buscar_caja(numero, esquema, usuario)
  │      │      ├─ contar_registros(esquema, usuario)
  │      │      ├─ obtener_movimientos(caja_id, usuario)
  │      │      └─ buscar_documentacion(texto, esquema, usuario)
  │      │
  │      └─► Cliente HTTP a Qwen local (http://localhost:11434/api/generate)
  │
  ├─► PostgreSQL (Motor de datos reales)
  │
  ▼
Qwen local (Ollama / LM Studio / llama.cpp)
```

### 2b. Para la app desktop (PySide6)

```
Usuario
  │
  ▼
ventana_principal.py
  │
  │ Dentro de un QDockWidget o panel lateral
  │ HTTP POST http://localhost:8001/ai/consultar
  ▼
Backend FastAPI (mismo ai_router.py)
```

> **Decisión de arquitectura**: La lógica de IA vive **solo en el backend**. Tanto el frontend web como el desktop consumen el mismo endpoint `/ai/consultar`. No hay lógica de IA en el cliente.

---

## 3. Tres niveles de implementación (progresivos)

### Nivel 1 — Asistente informativo (2 semanas)
La IA responde preguntas sobre el funcionamiento de DATCORR **sin consultar la base de datos**.

Ejemplos:
- "¿Cómo registro una caja?"
- "¿Qué diferencia hay entre búsqueda simple y exhaustiva?"
- "¿Qué permisos tiene un usuario de consulta?"

**Archivos a crear:**
| Archivo | Descripción |
|---|---|
| `backend/schemas/ai_schema.py` | Pydantic models para request/response |
| `backend/services/ai_service.py` | Core: consultar(), class AIService |
| `backend/services/ai_context_datcorr.md` | Documento de conocimiento |
| `backend/routers/ai_router.py` | Endpoint `/ai/consultar` |
| `frontend/src/components/AiChat/AiChat.jsx` | Botón flotante + panel de chat |
| `frontend/src/services/aiService.js` | Cliente HTTP a backend |
| `frontend/src/pages/AiChatPage.jsx` | Página standalone opcional |

**Backend** (`ai_router.py`):
```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["IA"])

class ConsultaRequest(BaseModel):
    pregunta: str

class ConsultaResponse(BaseModel):
    respuesta: str
    nivel: str  # "informativo" | "datos" | "herramientas"

@router.post("/consultar", response_model=ConsultaResponse)
def consultar_ia(
    request: ConsultaRequest,
    usuario_actual = Depends(obtener_usuario_actual),
):
    respuesta = ai_service.consultar(request.pregunta, usuario_actual)
    return ConsultaResponse(respuesta=respuesta, nivel="informativo")
```

**Backend** (`ai_service.py`):
```python
class AIService:
    def __init__(self):
        self.endpoint = os.getenv("QWEN_ENDPOINT", "http://localhost:11434/api/generate")
        self.model = os.getenv("QWEN_MODEL", "qwen2.5:7b")
        self.contexto = self._cargar_contexto()

    def consultar(self, pregunta: str, usuario) -> str:
        prompt = self._build_prompt(pregunta, usuario)
        return self._llamar_qwen(prompt)
```

**Frontend** (`AiChat.jsx`):
- Botón flotante (FAB) en bottom-right con ícono de chat
- Panel expandible con historial de mensajes
- Input de texto + botón enviar
- Indicador de "escribiendo..." mientras espera respuesta
- Estilos dark consistentes con el TopBar existente
- Se monta en `MainLayout.jsx` (similar a como se monta el componente de mensajes)

**Criterios de aceptación Nivel 1:**
- [ ] `POST /ai/consultar` responde sobre funcionamiento de DATCORR
- [ ] Qwen responde desde el endpoint local
- [ ] Usuario CONSULTA puede preguntar sin error 403
- [ ] El panel de chat web se abre desde un botón flotante
- [ ] El chat se ve bien en mobile (responsive)

---

### Nivel 2 — Asistente conectado a datos (2 semanas)
La IA responde preguntas que requieren datos reales de PostgreSQL, usando funciones controladas.

Ejemplos:
- "¿Cuántas cajas hay en IPS?"
- "¿Dónde está el expediente 1548?"
- "Mostrame los documentos de la caja 32."

**Archivos a crear/modificar:**
| Archivo | Cambio |
|---|---|
| `backend/services/ai_service.py` | Agregar herramienta `ejecutar_tool(nombre, args, usuario)` |
| `backend/services/ai_tools.py` | Funciones seguras de lectura (nuevo archivo) |
| `backend/database/conexion.py` | Agregar motor de conexión exclusiva para IA (ver sección Seguridad) |
| `frontend/src/services/aiService.js` | Actualizaciones |

**Nuevo archivo** (`ai_tools.py`):
```python
from database.conexion import motor_ia  # solo SELECT
from backend.core.permisos import verificar_nivel

ESCOMETA_PERMITIDAS = {"ips", "pediatrico", "igpj", "maternidad", "escribania", "igpj_listado_nuevo", "igpj_txt_listado"}

def verificar_acceso_esquema(usuario, esquema: str) -> bool:
    if usuario.es_superusuario:
        return True
    if esquema not in ESQUEMAS_PERMITIDOS:
        return False
    if usuario.nivel_seguridad < 1:
        return False
    return True

def contar_registros(esquema: str, usuario) -> dict:
    if not verificar_acceso_esquema(usuario, esquema):
        raise PermissionError(f"Sin acceso a {esquema}")
    schema = MAPA_BASE_SCHEMA_INVERSO.get(esquema, esquema)
    with motor_ia.connect() as conn:
        total = conn.execute(text(f'SELECT COUNT(*) FROM "{schema}"."Datcorr_database"')).scalar()
    return {"esquema": esquema, "total": total}
```

**Routing de intención** (clasificador regex):
```python
INTENTS = [
    (r"(cuant[ao]s?|total|cantidad).*(registros|cajas|expedientes|documentos)", "contar_registros"),
    (r"(donde|ubicaci[oó]n|buscar).*(expediente|caja)", "buscar_por_numero"),
    (r"(movimientos?|historial|traslados?).*(caja|expediente)", "obtener_movimientos"),
    (r"(documentos?|documentaci[oó]n).*(caja|contiene)", "buscar_documentacion"),
]
```

**Criterios de aceptación Nivel 2:**
- [ ] `contar_registros("ips")` devuelve número real
- [ ] `buscar_por_numero("1254")` encuentra el expediente
- [ ] La IA no ejecuta SQL generado por el modelo
- [ ] Usuario CONSULTA no excede su nivel_seguridad
- [ ] Timeout de 30s para respuestas de Qwen
- [ ] El prompt enviado a Qwen no contiene más de 2000 caracteres de datos reales

---

### Nivel 3 — Herramientas inteligentes (2 semanas)
La IA decide automáticamente qué función llamar, encadenando hasta 3 consultas por pregunta.

Ejemplo:
> Usuario: "¿Dónde está el expediente 1254 y tuvo movimientos recientemente?"

Flujo:
1. `buscar_expediente(1254)` → caja_id=38, organismo=IPS
2. `obtener_movimientos(38)` → 3 movimientos, último 2026-07-20
3. Qwen redacta respuesta final

**Cambios en `ai_service.py`:**
- Agregar sistema de tool definitions que Qwen pueda parsear
- Loop de tool calling (máximo 3 iteraciones)
- Logging de cada tool call para auditoría
- Fallback a modo informativo si no detecta tool

**Criterios de aceptación Nivel 3:**
- [ ] La IA encadena 2 herramientas por consulta
- [ ] Timeout total de 60s
- [ ] Tool calls se registran en auditoria
- [ ] Si falla una herramienta, responde con modo informativo

---

## 4. Seguridad (obligatorio, antes de Nivel 2)

### 4a. Usuario PostgreSQL exclusivo para IA

```sql
CREATE USER datcorr_ia WITH PASSWORD '<PASSWORD_AQUI>';
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania, igpj_listado_nuevo, igpj_txt_listado TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania, igpj_listado_nuevo, igpj_txt_listado
  GRANT SELECT ON TABLES TO datcorr_ia;
-- IMPORTANTE: sin INSERT, UPDATE, DELETE, DROP, ALTER
```

Variables en `.env`:
```
IA_DB_USER=datcorr_ia
IA_DB_PASSWORD=<PASSWORD_AQUI>
```

En `database/conexion.py`:
```python
IA_DATABASE_URL = os.getenv("IA_DATABASE_URL", "")
if not IA_DATABASE_URL:
    IA_DATABASE_URL = (
        f"postgresql+psycopg2://"
        f"{IA_DB_USER}:{IA_DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
motor_ia = create_engine(IA_DATABASE_URL, pool_size=2, max_overflow=5, pool_pre_ping=True)
```

### 4b. La IA respeta los permisos del usuario

El flujo obligatorio es:
```
Usuario autenticado (JWT) → nivel_seguridad + permisos granulares
        │
        ▼
AIService.consultar(pregunta, usuario)
        │
        ▼
Si requiere datos: verificar_acceso_esquema(usuario, esquema)
        │
        ▼
Si nivel_seguridad < 1 → acceso denegado (igual que cualquier otra consulta)
```

### 4c.刚度 del prompt

- Nunca se envía password_hash, tokens, credenciales en el prompt
- Máximo 2000 caracteres de datos reales por consulta
- El contexto `ai_context_datcorr.md` vive en el servidor (no en el cliente)

---

## 5. Archivos a crear (resumen)

```
backend/
├── schemas/
│   └── ai_schema.py               # ConsultaRequest, ConsultaResponse
├── services/
│   ├── ai_service.py               # Clase AIService
│   ├── ai_tools.py                 # Funciones seguras (solo lectura)
│   └── ai_context_datcorr.md       # Conocimiento de la aplicación
└── routers/
    └── ai_router.py                # POST /ai/consultar

frontend/src/
├── components/
│   └── AiChat/
│       ├── AiChat.jsx              # Botón FAB + panel de chat
│       └── AiChat.css              # Estilos dark
├── services/
│   └── aiService.js                # POST /ai/consultar
└── layouts/
    └── MainLayout.jsx              # Montar <AiChat /> aquí
```

---

## 6. Archivos a modificar (mínimos, sin romper)

| Archivo | Cambio |
|---|---|
| `database/conexion.py` | Agregar `motor_ia` con usuario de solo lectura |
| `.env` | Agregar `IA_DB_USER`, `IA_DB_PASSWORD`, `QWEN_ENDPOINT`, `QWEN_MODEL` |
| `backend/main.py` | Agregar `app.include_router(ai_router)` |
| `frontend/src/layouts/MainLayout.jsx` | Montar componente `<AiChat />` |
| `docs/ai_context_datcorr.md` | Nuevo (documento de conocimiento) |
| `requirements.txt` | Agregar `httpx` si no está (cliente HTTP a Qwen) |

---

## 7. Timeline estimado

| Fase | Duración | Prerrequisitos |
|---|---|---|
| **Fase 1 — Asistente informativo** | 2 semanas | Qwen instalado + endpoint confirmado |
| **Fase 1.5 — Seguridad (antes de Nivel 2)** | 3 días | Usuario PostgreSQL IA creado |
| **Fase 2 — Conectado a datos** | 2 semanas | Fase 1 completa + Fase 1.5 |
| **Fase 3 — Herramientas inteligentes** | 2 semanas | Fase 2 completa |
| **Fase 4 — UI Desktop (PySide6)** | 1 semana | Backend funcionando |
| **Total** | **~7-8 semanas** | |

> **Nota**: La UI desktop (Fase 4) es independiente y puede comenzar en paralelo con Fase 2.

---

## 8. Puntos de discusión con el equipo

1. **¿Qué motor local usan para Qwen?** (Ollama, LM Studio, llama.cpp, GPT4All)
   - Necesitamos confirmar el endpoint `http://localhost:11434/api/generate` o equivalente
   - Necesitamos confirmar el modelo instalado (recomendado: `qwen2.5:7b` o `qwen2.5:14b`)

2. **¿Cuánta RAM/VRAM tienen disponible?**
   - 7B parametrizado: ~4-6 GB RAM
   - 14B parametrizado: ~8-12 GB RAM
   - Si usan GPU, ¿CUDA o ROCm?

3. **¿El chat debe estar disponible para todos los roles?**
   - Recomendación: solo roles `ADMIN` y `OFICINA` tienen el panel de chat por defecto
   - Rol `CONSULTA`: puede ver el panel pero con acceso restringido a sus propios esquemas

4. **¿Debemos priorizar la web o el desktop primero?**
   - Recomendación: web primero (React) porque el backend se prueba más rápido
   - Desktop después, reutilizando el mismo backend

5. **¿Queremos histórico de consultas?**
   - Si: agregar tabla `ai_consultas` con `usuario`, `pregunta`, `respuesta`, `fecha`, `tool_calls`
   - Si no: omitir

6. **¿Qué hacemos si Qwen no está disponible?**
   - Opción A: mostrar "Servicio IA no disponible" y seguir funcionando normal
   - Opción B: ocultar el botón de chat

7. **¿La IA puede buscar en TODOS los esquemas o solo los que el usuario puede ver?**
   - Recomendación: **solo los que el usuario puede ver** (respetar nivel_seguridad + permisos)

---

## 9. Lo que NO se debe hacer

- ❌ Qwen no ejecuta SQL directo (siempre funciones controladas)
- ❌ Qwen no tiene permisos de escritura (solo SELECT)
- ❌ No se almacenan datos sensibles en el prompt enviado a Qwen
- ❌ No se exponen credenciales en logs
- ❌ No se modifica la lógica de negocio existente
- ❌ No se inserta el chat en el flujo principal obligatorio (debe ser opt-in)

---

## 10. Checklist de validación antes de merge

- [ ] Fase 1 probada en entorno local
- [ ] Usuario PostgreSQL IA configurado
- [ ] Timeout de Qwen implementado (30s Nivel 1-2, 60s Nivel 3)
- [ ] Logs de auditoria para tool calls
- [ ] Tests unitarios de `ai_tools.py` (mocked DB)
- [ ] Lint y typecheck pasan
- [ ] Documentación del contexto actualizada

---

*Documento generado para revisión. Ajustar según feedback del equipo.*
