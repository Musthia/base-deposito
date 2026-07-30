# Plan de Integración IA en DatCorr

Basado en `integrar_ia_a_datcorr.md` v1.0
Propósito: Implementar un asistente conversacional con Qwen local que responda preguntas sobre la aplicación y sus datos, sin comprometer seguridad ni romper funcionalidades existentes.

---

## Fase 0: Prerrequisitos y Confirmación Técnica (1 semana)

### 0.1 Confirmar entorno de ejecución de Qwen

| Pregunta | Acción |
|---|---|
| ¿Qué motor local? (Ollama, LM Studio, llama.cpp, GPT4All) | Revisar instalación actual |
| ¿Endpoint API disponible? (p.ej. `http://localhost:11434/api/generate`) | Confirmar URL y puerto |
| ¿Modelo instalado? (p.ej. `qwen2.5:7b`, `qwen2.5:14b`) | `ollama list` o equivalente |
| ¿RAM/VRAM disponible? | Mínimo 8GB RAM para 7B cuantizado |
| ¿CPU o GPU? | Verificar si usa CUDA/ROCm |

### 0.2 Configurar usuario PostgreSQL de solo lectura para IA

```sql
CREATE USER datcorr_ia WITH PASSWORD '...';
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania
  GRANT SELECT ON TABLES TO datcorr_ia;
```

### 0.3 Archivos a crear

```
backend/
  services/
    ai_service.py              ← Core del asistente
    ai_context_datcorr.md       ← Conocimiento de la aplicación
  routers/
    ai_router.py               ← Endpoints para consultas IA
core/
  api_ia_client.py             ← Cliente para desktop app (si aplica)
```

---

## Fase 1: Asistente Informativo (Nivel 1 — 2 semanas)

La IA responde preguntas sobre el funcionamiento de DatCorr **sin consultar la base de datos**.

### 1.1 Crear `ai_context_datcorr.md`

Documento de conocimiento que la IA recibe como contexto. Contenido:

```
# Sistema DATCORR

## Conceptos principales
- Caja: unidad física para almacenar documentación
- Expediente: documento identificado por número
- Organismo: institución propietaria
- Movimiento: traslado, préstamo, devolución de caja
- Usuario: persona autorizada

## Roles
- ADMIN: acceso completo
- OFICINA: gestión administrativa
- DEPÓSITO: operaciones con cajas y movimientos
- CONSULTA: solo lectura

## Bases disponibles
- ips, pediatrico, igpj, maternidad, escribania, igpj_listado_nuevo, igpj_txt_listado

## Reglas
- La IA solo consulta datos, nunca modifica
- La IA respeta permisos del usuario autenticado
- La IA indica cuando no encuentra información suficiente
```

### 1.2 Crear `ai_service.py` — estructura inicial

```python
class AIService:
    def __init__(self, model_endpoint: str):
        self.endpoint = model_endpoint  # ej: http://localhost:11434/api/generate
        self.contexto_app = self._cargar_contexto("ai_context_datcorr.md")
        self.db_conn = crear_conexion_ia()  # solo SELECT

    def consultar(self, pregunta: str, usuario_actual: Usuario) -> str:
        # 1. Validar permisos del usuario
        # 2. Detectar si necesita datos de DB (tool call)
        # 3. Construir prompt con contexto + pregunta
        # 4. Enviar a Qwen
        # 5. Devolver respuesta
        pass
```

### 1.3 Crear `ai_router.py` — endpoint REST

```python
@router.post("/ai/consultar")
def consultar_ia(pregunta: str, usuario_actual = Depends(obtener_usuario_actual)):
    respuesta = ai_service.consultar(pregunta, usuario_actual)
    return {"respuesta": respuesta}
```

### 1.4 Endpoints de la Fase 1

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/ai/consultar` | Enviar pregunta y recibir respuesta |
| `GET` | `/ai/status` | Verificar que Qwen responde |

### 1.5 Criterios de aceptación

- [ ] Qwen responde desde el endpoint local
- [ ] `POST /ai/consultar` devuelve respuestas sobre la app
- [ ] Usuario CONSULTA puede preguntar sobre conceptos
- [ ] Las respuestas son coherentes con `ai_context_datcorr.md`
- [ ] No se consulta PostgreSQL en esta fase

---

## Fase 2: Asistente Conectado a Datos (Nivel 2 — 2 semanas)

La IA responde preguntas que requieren datos **reales de PostgreSQL**, usando funciones controladas.

### 2.1 Funciones de consulta seguras

```python
# en ai_service.py — solo métodos de lectura

def buscar_expediente(self, numero: str) -> dict:
    """Busca expediente por número en todos los esquemas"""
    ...

def buscar_caja(self, numero: str) -> dict:
    """Devuelve datos de una caja"""
    ...

def contar_registros(self, esquema: str) -> int:
    """Cantidad de registros en un esquema"""
    ...

def obtener_movimientos(self, caja_id: int) -> list:
    """Historial de movimientos de una caja"""
    ...

def buscar_documentacion(self, texto: str) -> list:
    """Búsqueda textual en documentación"""
    ...
```

### 2.2 Flujo de una consulta con datos

```
Usuario: "¿Cuántas cajas hay en IPS?"
  ↓
ai_service.consultar("¿Cuántas cajas hay en IPS?")
  ↓
Detectar intención → {"tipo": "contar_registros", "esquema": "ips"}
  ↓
Ejecutar contar_registros("ips") → {"total": 22048}
  ↓
Prompt final:
  Contexto app: ...
  Dato real: La tabla ips contiene 22.048 registros.
  Pregunta: ¿Cuántas cajas hay en IPS?
  ↓
Qwen → "Actualmente, la base IPS contiene 22.048 registros."
```

### 2.3 Detección de intención (Routing)

Opción A — Qwen mismo parsea:
```
Delimitar: "FUNCIÓN: contar_registros | ARGUMENTOS: ips"
```

Opción B — Clasificador simple (recomendado inicialmente):
```python
INTENTS = {
    r"(cuantos|cuantas|total|cantidad).*(registros|cajas|expedientes)": "contar_registros",
    r"(donde|ubicación|buscar).*(expediente|caja)": "buscar_por_numero",
    r"(movimientos|historial|traslados).*(caja)": "obtener_movimientos",
}
```

### 2.4 Seguridad

- Conexión DB exclusiva con permisos **solo SELECT**
- Las funciones **nunca** ejecutan SQL generado por el modelo
- Los resultados se filtran según permisos del usuario
- Máximo 20 registros por respuesta (paginación implícita)

### 2.5 Criterios de aceptación

- [ ] `POST /ai/consultar` responde con datos reales de DB
- [ ] La IA no ejecuta SQL directo
- [ ] Usuario CONSULTA no accede a datos restringidos
- [ ] Las respuestas incluyen el dato concreto (no alucinado)
- [ ] Timeout de 30s para consultas a Qwen

---

## Fase 3: Herramientas Inteligentes (Nivel 3 — 2 semanas)

La IA decide qué función llamar automáticamente según la pregunta.

### 3.1 Sistema de herramientas (tool calling)

```python
HERRAMIENTAS = {
    "buscar_expediente": {
        "descripcion": "Busca expediente por número en todas las bases",
        "parametros": {"numero": "string"},
        "funcion": buscar_expediente,
    },
    "contar_registros": {
        "descripcion": "Cuenta registros de un esquema",
        "parametros": {"esquema": ["ips","pediatrico","igpj","maternidad","escribania"]},
        "funcion": contar_registros,
    },
    "obtener_movimientos": {
        "descripcion": "Obtiene movimientos de una caja",
        "parametros": {"caja_id": "integer"},
        "funcion": obtener_movimientos,
    },
}
```

### 3.2 Flujo tool calling

```
Usuario: "¿Dónde está el expediente 1254 y tuvo movimientos?"
  ↓
Qwen analiza y responde con JSON:
  {"tool": "buscar_expediente", "args": {"numero": "1254"}}
  ↓
Ejecutar → resultado: {caja_id: 38, organismo: "IPS"}
  ↓
Qwen recibe resultado y puede llamar:
  {"tool": "obtener_movimientos", "args": {"caja_id": 38}}
  ↓
Ejecutar → resultado: [3 movimientos, último: 2026-07-20]
  ↓
Qwen redacta respuesta final
```

### 3.3 Criterios de aceptación

- [ ] La IA encadena hasta 3 herramientas por consulta
- [ ] Timeout total de 60s por consulta
- [ ] Las herramientas se ejecutan con permisos del usuario
- [ ] Logging de cada tool call para auditoría
- [ ] Fallback: si no detecta herramienta, responde solo con contexto app

---

## Fase 4: Interfaz de Usuario (1-2 semanas)

### 4.1 Panel de chat en Desktop App (PySide6)

```
┌─────────────────────────────────────┐
│ Asistente DatCorr  [ − ] [ □ ] [ × ] │
├─────────────────────────────────────┤
│ ¿En qué caja está el exp 1254?      │
│                                     │
│ [ Preguntar ]                       │
├─────────────────────────────────────┤
│ El expediente 1254 está en caja 38  │
│ del organismo IPS.                  │
│                                     │
│ ¿Querés ver sus movimientos?        │
└─────────────────────────────────────┘
```

### 4.2 Panel de chat en Web App (React)

```jsx
// frontend/src/components/AiChat/AiChat.jsx
<Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
  <Fab color="primary" onClick={() => setOpen(true)}>
    <ChatIcon />
  </Fab>
  {open && (
    <Paper sx={{ width: 400, height: 500, p: 2 }}>
      {/* historial + input */}
    </Paper>
  )}
</Box>
```

### 4.3 Endpoints para UI

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/ai/consultar` | Consulta (ya existe) |
| `GET` | `/ai/historial` | Historial de consultas del usuario |
| `DELETE` | `/ai/historial` | Limpiar historial |

---

## Resumen de Archivos a Crear

```
backend/
  services/
    ai_service.py                  ← Core: contexto, tools, Qwen
    ai_context_datcorr.md           ← Conocimiento de la app
  routers/
    ai_router.py                   ← Endpoints REST
  schemas/
    ai_schema.py                   ← Request/Response models

core/
  api_ia_client.py                 ← Cliente desktop (httpx)

frontend/src/
  components/
    AiChat/
      AiChat.jsx                   ← Botón flotante + panel
      AiChat.css                   ← Estilos dark del chat
  services/
    aiService.js                   ← Llamadas a /ai/consultar
```

## Archivos a Modificar (sin romper)

| Archivo | Cambio |
|---|---|
| `database/conexion.py` | Agregar `crear_conexion_ia()` con user de solo lectura |
| `backend/main.py` | Registrar `ai_router` |
| `frontend/src/App.jsx` o `MainLayout` | Montar `AiChat` componente |
| `pyproject.toml` / `requirements.txt` | Sin cambios (httpx ya existe) |

## Lo que NO se debe hacer

- ❌ Qwen no ejecuta SQL directo
- ❌ Qwen no tiene permisos de escritura
- ❌ No se almacenan datos sensibles en el prompt
- ❌ No se exponen credenciales en logs
- ❌ No se modifica la lógica de negocio existente

## Timeline estimado

| Fase | Duración | Dependencias |
|---|---|---|
| Fase 0 — Prerrequisitos | 1 semana | Instalación Qwen confirmada |
| Fase 1 — Asistente informativo | 2 semanas | Fase 0 completa |
| Fase 2 — Conectado a datos | 2 semanas | Fase 1 completa |
| Fase 3 — Tool calling | 2 semanas | Fase 2 completa |
| Fase 4 — UI desktop + web | 2 semanas | Fase 3 completa |
| **Total** | **~9 semanas** | |

---

*Plan generado para revisión del equipo. Ajustar según disponibilidad de hardware (RAM/GPU), prioridades del negocio, y feedback del equipo de desarrollo.*
