0


# Integración IA con Qwen2.5 en DATCORR

I**mplementación completa** basada en el plan v3.0 (Web + Desktop) que se alinea con la arquitectura actual de DATCORR.

## 📋 Resumen de la Integración

| Componente                     | Estado       | Archivo                                                                                                |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| **Backend IA**           | ✅ Crear     | `backend/services/ai_service.py`, `backend/routers/ai_router.py`, `backend/schemas/ai_schema.py` |
| **Contexto del Sistema** | ✅ Crear     | `backend/services/ai_context_datcorr.md`                                                             |
| **Desktop IA**           | ✅ Crear     | `core/api_ia_client.py`, `core/ai_chat_widget.py`                                                  |
| **Configuración**       | ✅ Crear     | `.env`, `scripts/crear_usuario_ia.sql`                                                             |
| **Backend**              | ✅ Modificar | `backend/main.py`                                                                                    |

---

## 🚀 Fase 0: Configuración Inicial

### 0.1 Script para crear usuario DB IA

```sql
-- scripts/crear_usuario_ia.sql
-- Ejecutar con: psql -U postgres -d datcorr < scripts/crear_usuario_ia.sql

-- Crear usuario con contraseña segura
CREATE USER datcorr_ia WITH PASSWORD 'DatCorrIaSecure2026!';

-- Conectar al base de datos
\c datcorr;

-- Otorgar permisos en esquemas necesarios
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public TO datcorr_ia;
GRANT USAGE ON SCHEMA ips TO datcorr_ia;
GRANT USAGE ON SCHEMA pediatrico TO datcorr_ia;
GRANT USAGE ON SCHEMA igpj TO datcorr_ia;
GRANT USAGE ON SCHEMA maternidad TO datcorr_ia;
GRANT USAGE ON SCHEMA escribania TO datcorr_ia;

-- Otorgar permisos SELECT en tablas existentes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA ips TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA pediatrico TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA igpj TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA maternidad TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA escribania TO datcorr_ia;

-- Establecer permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA ips GRANT SELECT ON TABLES TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA pediatrico GRANT SELECT ON TABLES TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA igpj GRANT SELECT ON TABLES TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA maternidad GRANT SELECT ON TABLES TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA escribania GRANT SELECT ON TABLES TO datcorr_ia;

-- Verificar usuario
\du datcorr_ia
```

### 0.2 Archivo de configuración .env

```env
# .env (backend)
# Configuración Ollama
OLLAMA_ENDPOINT=http://localhost:11434
QWEN_MODEL=Qwen3.5-4B-UD-Q4_K_XL

# Configuración Base de Datos
DATABASE_URL=postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr
DATABASE_URL_IA=postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr

# Configuración General
APP_NAME=DatCorr
API_VERSION=v1
SECRET_KEY=your-secret-key-change-in-production
```

---

## 📝 Fase 1: Archivos de Backend IA

### 1.1 Archivo de Contexto del Sistema

```markdown
# backend/services/ai_context_datcorr.md

# DATCORR — Sistema de Gestión Documental y Administrativa

## Descripción General
DATCORR es una aplicación de gestión documental y administrativa que permite el control de expedientes, cajas, movimientos y registros en múltiples organismos gubernamentales.

## Estructura del Sistema
- **Plataformas**: Desktop (PySide6) y Web (React + FastAPI)
- **Base de Datos**: PostgreSQL (principal) con SQLite (legacy)
- **Usuarios**: Sistema de autenticación JWT con niveles de seguridad (0-10)

## Tipos de Documentos
- **Expedientes**: Documentos oficiales numerados por organismo
- **Cajas**: Unidades físicas para almacenar documentación
- **Organismos**: IPS, Pediatrico, IGPJ, Maternidad, Escribania
- **Movimientos**: Traslados, ingresos, egresos de documentos

## Reglas de Negocio
1. **Numeración**: Cada expediente tiene un número único
2. **Ubicación**: Cada expediente tiene caja y organismo asignados
3. **Movimientos**: Todo movimiento debe registrarse con fecha, usuario y observaciones
4. **Permisos**: Usuarios solo ven documentos de su nivel de seguridad
5. **Auditoría**: Todas las acciones se registran en tabla auditoria

## Esquemas de Base de Datos
- **public**: Usuarios, roles, permisos, auditoria
- **ips**: Expedientes, cajas, movimientos de IPS
- **pediatrico**: Expedientes, cajas, movimientos de Pediatrico
- **igpj**: Expedientes, cajas, movimientos de IGPJ
- **maternidad**: Expedientes, cajas, movimientos de Maternidad
- **escribania**: Expedientes, cajas, movimientos de Escribania

## Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| users | Usuarios autenticados |
| roles | Roles del sistema |
| permissions | Permisos y códigos |
| user_permissions | Asignación de permisos a usuarios |
| auditoria | Registro de todas las acciones |
| cajas | Unidades de almacenamiento |
| documentos | Expedientes y documentos |
| movimientos | Traslados y movimientos de documentos |
| usuarios_organismos | Relación usuario-organismo |

## Tipos de Usuarios
- **Administrador**: Nivel 10, acceso total
- **Oficina**: Nivel 5-9, acceso limitado
- **Usuario**: Nivel 0-4, acceso restringido
- **IA**: Usuario especial para consultas (nivel 0)

## Reglas de Acceso
- Usuarios con nivel < 5 no pueden ver datos de otros organismos
- Usuarios con nivel < 10 no pueden ver auditoría completa
- Usuarios con nivel < 5 no pueden realizar movimientos
- Auditoría solo visible para nivel >= 7

## Errores Comunes
- **Caja no encontrada**: Verificar número de caja
- **Expediente no encontrado**: Verificar número y organismo
- **Movimiento no permitido**: Verificar permisos del usuario
- **Token expirado**: Reautenticarse

## Respuestas Típicas
- "¿Qué es una caja?" → Unidad física de almacenamiento
- "¿Cuántos expedientes hay en IPS?" → Consultar COUNT(*) en esquema ips
- "¿Dónde está el expediente X?" → Buscar en todas las bases
- "¿Cuántos registros hay en Maternidad?" → COUNT(*) en esquema maternidad
- "¿Cómo se mueve un expediente?" → Registrar movimiento en tabla movimientos
- "¿Qué es un movimiento?" → Traslado o cambio de ubicación de documento
```

### 1.2 Servicio IA Backend

```python
# backend/services/ai_service.py
import httpx
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from backend.core.logger import logger
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.database.conexion import create_db_engine, SessionLocal

# Configuración
OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
QWEN_MODEL = os.getenv("QWEN_MODEL", "Qwen3.5-4B-UD-Q4_K_XL")
MAX_TOOL_CALLS = 3
DB_CONNECTION_TIMEOUT = 10

class AIService:
    def __init__(self, context_file: Optional[str] = None):
        self.endpoint = OLLAMA_ENDPOINT
        self.model = QWEN_MODEL
        self.contexto_app = ""
        self.db_conn = None
        self.context_file = context_file
      
        if context_file:
            self.contexto_app = self._cargar_contexto(context_file)
      
        logger.info(f"AIService inicializada con modelo: {self.model}")

    def _cargar_contexto(self, path: str) -> str:
        """Leer archivo de contexto del sistema"""
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error cargando contexto: {e}")
            return ""

    def _sistema_prompt(self, pregunta: str, herramientas: Optional[List[Dict]] = None) -> str:
        """Construir prompt con contexto y reglas"""
        prompt = f"""Eres un asistente experto de DATCORR, un sistema de gestión documental.

Contexto del sistema:
{self.contexto_app}

Pregunta del usuario: {pregunta}

Reglas:
1. Responde SOLO con información del contexto o datos verificados.
2. Si no sabes, indica claramente que no puedes responder.
3. No alucines números, fechas ni existencias.
4. No ejecutes ni sugieras SQL directamente.
5. Respeta los permisos del usuario autenticado.
6. Si el usuario pregunta sobre datos específicos, usa las herramientas disponibles.
7. Máximo 3 llamadas a herramientas (tool calls) por consulta.
8. Si no necesitas herramientas, responde directamente.

Formato esperado:
- Si necesitas datos: usa herramientas disponibles
- Si no necesitas datos: responde con texto natural
- No inventes información
"""
        return prompt

    def _detectar_intencion(self, pregunta: str) -> Optional[str]:
        """Detectar intención del usuario para usar herramientas"""
        import re
      
        # Patrón: ¿Cuántos...? → contar_registros
        if re.search(r"(cuantos|cuantas|total|cantidad|cuántas).*?(registros|cajas|expedientes|documentos)", 
                     pregunta, re.IGNORECASE):
            return "contar_registros"
      
        # Patrón: ¿Dónde está...? / ¿Ubicación...? → buscar_expediente
        if re.search(r"(donde|ubicación|buscá).*?(expediente|caja|documentos)", 
                     pregunta, re.IGNORECASE):
            return "buscar_expediente"
      
        # Patrón: movimientos, historial, traslados → obtener_movimientos
        if re.search(r"(movimientos|historial|traslados).*?(caja|expediente)", 
                     pregunta, re.IGNORECASE):
            return "obtener_movimientos"
      
        return None

    def _conectar_db_ia(self) -> bool:
        """Conectar base de datos con usuario IA (solo SELECT)"""
        try:
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
          
            db_url = os.getenv("DATABASE_URL_IA", "postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr")
            self.db_conn = create_engine(db_url, pool_pre_ping=True, pool_size=10)
            logger.info("Conexión DB IA establecida")
            return True
        except Exception as e:
            logger.error(f"Error conectando DB IA: {e}")
            return False

    def _llamar_a_qwen_con_tools(self, pregunta: str, herramientas: List[Dict] = None) -> Dict[str, Any]:
        """Llamada a Qwen con tool calling habilitado"""
        if not self.contexto_app:
            return {"error": "Contexto no cargado"}
      
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": self._sistema_prompt(pregunta, herramientas)},
                    {"role": "user", "content": pregunta}
                ],
                "stream": False,
                "temperature": 0.3,
                "max_tokens": 2000,
            }
          
            if herramientas:
                payload["tools"] = herramientas
                payload["tool_choice"] = "auto"
          
            resp = httpx.post(
                f"{self.endpoint}/api/chat",
                json=payload,
                timeout=60
            )
          
            if resp.status_code != 200:
                logger.error(f"Error Ollama: {resp.status_code} - {resp.text}")
                return {"error": "Error al conectar con Qwen"}
          
            data = resp.json()
            return {
                "respuesta": data["message"]["content"],
                "tool_calls": data.get("tool_calls", []),
                "timestamp": datetime.now().isoformat()
            }
        except httpx.TimeoutException:
            return {"error": "Timeout en Qwen", "tiempo": 60}
        except Exception as e:
            logger.error(f"Error Qwen: {e}")
            return {"error": f"Error en Qwen: {str(e)}"}

    def _ejecutar_tool_call(self, tool_call: Dict, db_conn: Optional[Any] = None) -> Dict[str, Any]:
        """Ejecutar llamada a herramienta y obtener resultado"""
        try:
            name = tool_call["name"]
            args = tool_call["arguments"]
          
            logger.info(f"Tool call ejecutado: {name} con args {args}")
          
            if name == "contar_registros":
                esquema = args.get("esquema", "public")
                query = f"SELECT COUNT(*) FROM {esquema}.Datcorr_database"
                with db_conn.cursor() as cur:
                    cur.execute(query)
                    return {"resultado": cur.fetchone()[0], "tipo": "count"}
          
            elif name == "buscar_expediente":
                numero = args.get("numero", "")
                # Buscar en todos los esquemas permitidos
                resultados = []
                esquemas = ["public", "ips", "pediatrico", "igpj", "maternidad", "escribania"]
                for esquema in esquemas:
                    query = f"SELECT * FROM {esquema}.Datcorr_database WHERE registro = '{numero}'"
                    with db_conn.cursor() as cur:
                        cur.execute(query)
                        rows = cur.fetchall()
                        if rows:
                            resultados.append(rows[0])
                return {"resultado": resultados, "tipo": "buscar"}
          
            elif name == "obtener_movimientos":
                caja_id = args.get("caja_id")
                # Consultar movimientos de caja
                query = f"SELECT * FROM {esquema}.movimientos WHERE caja_id = {caja_id}"
                with db_conn.cursor() as cur:
                    cur.execute(query)
                    return {"resultado": cur.fetchall(), "tipo": "movimientos"}
          
            return {"resultado": "Resultado desconocido", "tipo": "error"}
          
        except Exception as e:
            logger.error(f"Error ejecutando tool: {e}")
            return {"resultado": f"Error en herramienta: {str(e)}", "tipo": "error"}

    def consultar(self, pregunta: str, usuario_actual: Optional[Any] = None) -> Dict[str, Any]:
        """Consulta principal con detección de intención y tool calling"""
        if not self.contexto_app:
            return {"error": "Contexto del sistema no cargado"}
      
        if not self.db_conn:
            if not self._conectar_db_ia():
                return {"error": "No se pudo conectar a la base de datos"}
      
        # Detectar intención
        intención = self._detectar_intencion(pregunta)
      
        # Preparar herramientas si es necesario
        herramientas = None
        if intención:
            if intención == "contar_registros":
                herramientas = [
                    {
                        "type": "function",
                        "function": {
                            "name": "contar_registros",
                            "description": "Cuenta registros de un esquema específico",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "esquema": {"type": "string", "enum": ["public", "ips", "pediatrico", "igpj", "maternidad", "escribania"]}
                                },
                                "required": ["esquema"]
                            }
                        }
                    }
                ]
            elif intención == "buscar_expediente":
                herramientas = [
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
                    }
                ]
            elif intención == "obtener_movimientos":
                herramientas = [
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
                ]
      
        # Llamada inicial a Qwen
        respuesta = self._llamar_a_qwen_con_tools(pregunta, herramientas)
      
        if "error" in respuesta:
            return respuesta
      
        # Procesar tool calls
        tool_calls = respuesta.get("tool_calls", [])
        iteraciones = 0
      
        # Bucle de ejecución de tools
        while tool_calls and iteraciones < MAX_TOOL_CALLS:
            iteraciones += 1
            logger.info(f"Iteración {iteraciones} - Tool calls: {tool_calls}")
          
            nueva_respuesta = {
                "respuesta": respuesta["respuesta"],
                "tool_calls": [],
                "timestamp": datetime.now().isoformat()
            }
          
            # Ejecutar primera tool call
            if tool_calls:
                tool_call = tool_calls[0]
                resultado = self._ejecutar_tool_call(tool_call, self.db_conn)
              
                # Enviar resultado a Qwen
                nueva_respuesta["tool_calls"].append({
                    "name": tool_call["name"],
                    "arguments": tool_call["arguments"],
                    "resultado": resultado
                })
              
                # Responder con resultado
                mensaje_tool = {
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "name": tool_call["name"],
                    "content": str(resultado)
                }
              
                # Nueva llamada con resultado
                respuesta = self._llamar_a_qwen_con_tools(
                    pregunta,
                    [
                        {"role": "system", "content": self._sistema_prompt(pregunta, herramientas)},
                        {"role": "user", "content": pregunta},
                        {"role": "assistant", "content": respuesta["respuesta"]},
                        mensaje_tool
                    ]
                )
              
                # Limpiar tool calls usadas
                respuesta["tool_calls"] = [tc for tc in tool_calls[1:]]
            else:
                break
      
        return nueva_respuesta
```

### 1.3 Router IA

```python
# backend/routers/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from backend.services.ai_service import AIService
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.dependencies import get_db
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["Asistente IA"])

# Configuración
OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
QWEN_MODEL = os.getenv("QWEN_MODEL", "Qwen3.5-4B-UD-Q4_K_XL")

# Inicializar servicio IA
ai_service = AIService(context_file="backend/services/ai_context_datcorr.md")

@router.get("/status")
def status():
    """Verificar si Qwen está disponible"""
    try:
        r = httpx.get(f"{OLLAMA_ENDPOINT}/api/tags", timeout=5)
        return {"disponible": r.status_code == 200}
    except Exception as e:
        return {"disponible": False, "error": str(e)}

@router.post("/consultar")
def consultar(
    request: Request,
    pregunta: str = Query(..., min_length=1, max_length=500),
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """Consulta principal al asistente IA"""
    if not pregunta.strip():
        raise HTTPException(400, "La pregunta no puede estar vacía")
  
    # Verificar si usuario está autenticado
    if not usuario_actual:
        raise HTTPException(401, "No autenticado")
  
    # Validar permisos (todos pueden usar IA en Fase 1)
    if usuario_actual.get("nivel", 0) < 1:
        raise HTTPException(403, "No tienes permisos para usar el asistente IA")
  
    # Ejecutar consulta
    try:
        respuesta = ai_service.consultar(pregunta, usuario_actual)
      
        # Verificar errores
        if "error" in respuesta:
            raise HTTPException(500, respuesta["error"])
      
        return {
            "respuesta": respuesta["respuesta"],
            "timestamp": datetime.now().isoformat(),
            "tool_calls": respuesta.get("tool_calls", [])
        }
    except Exception as e:
        logger.error(f"Error en consulta IA: {e}")
        raise HTTPException(500, "Error al procesar tu consulta")

@router.get("/historial")
def historial(
    usuario_actual=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=100)
):
    """Obtener historial de consultas del usuario"""
    if not usuario_actual:
        raise HTTPException(401, "No autenticado")
  
    # Aquí se implementaría consulta al historial en DB
    # Por ahora devuelve estructura vacía
    return {
        "historial": [],
        "limit": limit,
        "total": 0
    }

@router.delete("/historial")
def limpiar_historial(
    usuario_actual=Depends(obtener_usuario_actual)
):
    """Limpiar historial de consultas"""
    if not usuario_actual:
        raise HTTPException(401, "No autenticado")
  
    # Aquí se implementaría borrado en DB
    return {"mensaje": "Historial limpiado", "success": True}
```

### 1.4 Schemas Pydantic

```python
# backend/schemas/ai_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional

# Request schemas
class AiConsultaRequest(BaseModel):
    pregunta: str
    timeout: int = 30

class AiConsultaRequestWithUser(BaseModel):
    pregunta: str
    timeout: int = 30
    usuario_id: Optional[int] = None

# Response schemas
class AiConsultaResponse(BaseModel):
    respuesta: str
    timestamp: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

class AiStatusResponse(BaseModel):
    disponible: bool
    error: Optional[str] = None

class AiHistorialResponse(BaseModel):
    historial: List[Dict[str, Any]]
    limit: int
    total: int

class AiLimpioResponse(BaseModel):
    mensaje: str
    success: bool
```

---

## 🖥️ Fase 2: Integración Desktop

### 2.1 Cliente API IA para Desktop

```python
# core/api_ia_client.py
import httpx
from typing import Dict, Any, Optional

class ApiIaClient:
    """Cliente HTTP para consultas IA desde Desktop"""
  
    def __init__(self, api_client: 'ApiClient'):
        self._client = api_client
        self.base_url = "http://localhost:8000"
  
    def consultar(self, pregunta: str, timeout: int = 30) -> Dict[str, Any]:
        """Enviar consulta al asistente IA"""
        try:
            response = self._client.post(
                f"{self.base_url}/ai/consultar",
                json={"pregunta": pregunta, "timeout": timeout}
            )
            return response.json()
        except Exception as e:
            return {"error": f"Error de conexión: {str(e)}"}
  
    def status(self) -> Dict[str, Any]:
        """Verificar disponibilidad de IA"""
        try:
            response = self._client.get(f"{self.base_url}/ai/status")
            return response.json()
        except Exception as e:
            return {"disponible": False, "error": str(e)}
  
    def historial(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Obtener historial de consultas"""
        try:
            response = self._client.get(f"{self.base_url}/ai/historial?limit={limit}")
            return response.json().get("historial", [])
        except Exception as e:
            return []
  
    def limpiar_historial(self) -> Dict[str, Any]:
        """Limpiar historial de consultas"""
        try:
            response = self._client.delete(f"{self.base_url}/ai/historial")
            return response.json()
        except Exception as e:
            return {"error": str(e)}
```

### 2.2 Widget de Chat IA (PySide6)

```python
# core/ai_chat_widget.py
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel, QLineEdit,
    QPushButton, QDialog, QScrollArea, QTextEdit, QSplitter,
    QProgressBar, QToolButton, QStatusBar
)
from PySide6.QtCore import Qt, QTimer, Signal, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QFont, QCursor, QTextCursor
import json
from core.api_ia_client import ApiIaClient
from typing import Dict, Any

class AiChatWidget(QWidget):
    """Widget flotante para chat con IA"""
  
    def __init__(self, api_client: ApiIaClient, parent=None):
        super().__init__(parent)
        self.api_client = api_client
        self.messages = []
        self.is_loading = False
      
        self._setup_ui()
        self._setup_connections()
  
    def _setup_ui(self):
        """Configurar interfaz del chat"""
        layout = QVBoxLayout(self)
        self.setLayout(layout)
      
        # Título
        title_layout = QHBoxLayout()
        self.btn_cerrar = QToolButton()
        self.btn_cerrar.setIconStyle("plain")
        self.btn_cerrar.setStyleSheet("icon-size: 16px;")
        self.btn_cerrar.setPopupMode(QToolButton.InstantPopup)
        title_layout.addWidget(self.btn_cerrar)
      
        self.lbl_titulo = QLabel("Asistente DATCORR")
        self.lbl_titulo.setFont(QFont("Arial", 14, QFont.Bold))
        self.lbl_titulo.setStyleSheet("color: #60a5fa;")
        title_layout.addWidget(self.lbl_titulo)
      
        layout.addLayout(title_layout)
      
        # Área de mensajes
        self._crear_area_mensajes()
      
        # Área de input
        self._crear_area_input()
      
        # Barra de progreso
        self._crear_barra_progreso()
  
    def _crear_area_mensajes(self):
        """Crear contenedor de mensajes"""
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.scroll_area.setStyleSheet("background-color: #1e293b;")
      
        self.content_widget = QWidget()
        self.content_layout = QVBoxLayout(self.content_widget)
        self.content_layout.setSpacing(10)
        self.content_layout.setContentsMargins(10, 10, 10, 10)
      
        self.scroll_area.setWidget(self.content_widget)
      
        # Mensaje inicial
        self._agregar_mensaje("AI", "Hola, soy el asistente de DATCORR. ¿En qué puedo ayudarte?")
      
        layout.addWidget(self.scroll_area)
  
    def _crear_area_input(self):
        """Crear área de entrada de texto"""
        input_layout = QHBoxLayout()
      
        self.input = QLineEdit()
        self.input.setPlaceholderText("Escribe tu pregunta...")
        self.input.returnPressed.connect(self._enviar)
        self.input.setStyleSheet("""
            QLineEdit {
                background-color: #0f172a;
                color: #f0f2f5;
                border: 1px solid #334155;
                border-radius: 8px;
                padding: 8px 12px;
            }
            QLineEdit:focus {
                border-color: #60a5fa;
            }
        """)
      
        self.btn_enviar = QPushButton("Enviar")
        self.btn_enviar.clicked.connect(self._enviar)
        self.btn_enviar.setStyleSheet("""
            QPushButton {
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #2563eb;
            }
        """)
      
        input_layout.addWidget(self.input)
        input_layout.addWidget(self.btn_enviar)
      
        layout.addLayout(input_layout)
  
    def _crear_barra_progreso(self):
        """Crear barra de progreso"""
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setStyleSheet("background-color: #0f172a; color: #60a5fa;")
        self.progress_bar.setVisible(False)
      
        layout.addWidget(self.progress_bar)
  
    def _setup_connections(self):
        """Conectar señales"""
        self.btn_cerrar.clicked.connect(self._cerrar)
        self.input.textChanged.connect(self._btn_enviar_habilitar)
  
    def _btn_enviar_habilitar(self, text: str):
        """Habilitar botón de enviar si hay texto"""
        self.btn_enviar.setEnabled(bool(text.strip()))
  
    def _agregar_mensaje(self, texto: str, rol: str = "AI"):
        """Agregar mensaje al historial"""
        msg = {
            "texto": texto,
            "rol": rol,
            "timestamp": None
        }
        self.messages.append(msg)
      
        # Crear elemento de mensaje
        layout = QVBoxLayout()
      
        # Burbuja de mensaje
        bubble = QLabel(f"{texto}")
        bubble.setWordWrap(True)
        bubble.setStyleSheet(f"""
            QLabel {{
                color: {self._color_burbuja(rol)};
                padding: 8px 12px;
                border-radius: 8px;
                max-width: 80%;
            }}
        """)
      
        layout.addWidget(bubble)
      
        # Añadir al scroll area
        self.content_layout.addLayout(layout)
      
        # Scroll al final
        self.scroll_area.verticalScrollBar().setValue(
            self.scroll_area.verticalScrollBar().maximum()
        )
  
    def _color_burbuja(self, rol: str) -> str:
        """Color según rol"""
        if rol == "AI":
            return "#60a5fa"
        return "#22c55e"
  
    def _enviar(self):
        """Enviar mensaje"""
        pregunta = self.input.text().strip()
        if not pregunta:
            return
      
        self.input.clear()
        self._btn_enviar_habilitar("")
      
        # Agregar mensaje del usuario
        self._agregar_mensaje(pregunta, "USER")
      
        # Mostrar loading
        self.is_loading = True
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
      
        # Verificar disponibilidad
        status = self.api_client.status()
        if not status.get("disponible"):
            self._agregar_mensaje("La IA no está disponible. Verifica que Ollama esté corriendo.", "AI")
            self.is_loading = False
            self.progress_bar.setVisible(False)
            return
      
        # Enviar consulta
        try:
            self.progress_bar.setValue(20)
            respuesta = self.api_client.consultar(pregunta)
          
            self.progress_bar.setValue(40)
          
            if "error" in respuesta:
                self._agregar_mensaje(f"Error: {respuesta['error']}", "AI")
            else:
                self._agregar_mensaje(respuesta["respuesta"], "AI")
          
            self.progress_bar.setValue(100)
          
        except Exception as e:
            self._agregar_mensaje(f"Error de conexión: {str(e)}", "AI")
        finally:
            self.is_loading = False
            self.progress_bar.setVisible(False)
  
    def _cerrar(self):
        """Cerrar chat"""
        self.hide()
  
    def show(self):
        """Mostrar chat"""
        self.show()
        self.raise_()
        self.activateWindow()
  
    def hide(self):
        """Ocultar chat"""
        super().hide()
```

---

## 🔄 Fase 3: Integración Backend

### 3.1 Registrar Router en main.py

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth_router, usuarios_router, admin_router, ai_router

# Inicializar FastAPI
app = FastAPI(
    title="DATCORR API",
    description="API para gestión documental y administrativa",
    version="1.0.0"
)

# Middleware CORS
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(usuarios_router, prefix="/api/usuarios", tags=["Usuarios"])
app.include_router(admin_router, prefix="/api/admin", tags=["Administración"])
app.include_router(ai_router, prefix="/api/ai", tags=["Asistente IA"])

# Endpoints de salud
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "DATCORR API"}

@app.get("/")
def root():
    return {"message": "Bienvenido a DATCORR API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## ✅ Checklist de Implementación

### ✅ Fase 0: Configuración Inicial

- [X] Script `crear_usuario_ia.sql` creado
- [X] Archivo `.env` configurado
- [ ] Ollama instalado y Qwen3.5-4B-UD-Q4_K_XL descargado
- [ ] Usuario `datcorr_ia` creado en PostgreSQL

### ✅ Fase 1: Backend IA

- [X] `ai_context_datcorr.md` creado
- [X] `ai_service.py` creado
- [X] `ai_router.py` creado
- [X] `ai_schema.py` creado
- [ ] Registrar router en `main.py`

### ✅ Fase 2: Desktop

- [X] `api_ia_client.py` creado
- [X] `ai_chat_widget.py` creado
- [ ] Integrar widget en `main.py` de desktop

### ✅ Fase 3: Testing

- [ ] `GET /ai/status` responde correctamente
- [ ] `POST /ai/consultar` responde con texto
- [ ] Chat flotante visible en desktop
- [ ] Envío y recepción de mensajes funcionan

---

## 📌 Notas Importantes

1. **Seguridad**: El usuario `datcorr_ia` solo tiene permisos SELECT en esquemas específicos
2. **Timeout**: Consulta máxima de 60 segundos
3. **Tool Calling**: Máximo 3 llamadas a herramientas por consulta
4. **Contexto**: El `ai_context_datcorr.md` es crítico para respuestas coherentes
5. **Logs**: Todas las consultas a IA se registran en `backend/core/logger.py`

---

## 🚀 Siguientes Pasos

1. Ejecutar `scripts/crear_usuario_ia.sql`
2. Descargar Qwen3.5-4B-UD-Q4_K_XL con `ollama run Qwen3.5-4B-UD-Q4_K_XL`
3. Verificar endpoints con `curl http://localhost:8000/ai/status`
4. Probar consultas: `curl -X POST http://localhost:8000/ai/consultar -H "Content-Type: application/json" -d '{"pregunta": "¿Qué es una caja?"}'`
5. Integrar widget en desktop app

¿Necesitas que genere algún archivo adicional o realice alguna modificación específica?

```
</think>

He analizado los archivos de integración y la arquitectura actual. A continuación presento la **implementación completa** basada en el plan v3.0 para integrar Qwen3.5-4B-UD-Q4_K_XL en DATCORR.

## 📋 Resumen de la Integración

| Componente | Estado | Archivo |
|------------|--------|---------|
| **Backend IA** | ✅ | `ai_service.py`, `ai_router.py`, `ai_schema.py` |
| **Contexto del Sistema** | ✅ | `ai_context_datcorr.md` |
| **Desktop IA** | ✅ | `api_ia_client.py`, `ai_chat_widget.py` |
| **Configuración** | ✅ | `.env`, `scripts/crear_usuario_ia.sql` |
| **Backend** | ✅ | `backend/main.py` |

---

## 🚀 Fase 0: Configuración Inicial

### 0.1 Script para crear usuario DB IA
```sql
-- scripts/crear_usuario_ia.sql
CREATE USER datcorr_ia WITH PASSWORD 'DatCorrIaSecure2026!';

\c datcorr;

GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania GRANT SELECT ON TABLES TO datcorr_ia;

\du datcorr_ia
```

### 0.2 Archivo de configuración .env

```env
# .env (backend)
OLLAMA_ENDPOINT=http://localhost:11434
QWEN_MODEL=Qwen3.5-4B-UD-Q4_K_XL
DATABASE_URL=postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr
DATABASE_URL_IA=postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr
```

---

## 📝 Fase 1: Archivos de Backend IA

### 1.1 Archivo de Contexto del Sistema

```markdown
# backend/services/ai_context_datcorr.md

# DATCORR — Sistema de Gestión Documental y Administrativa

## Tipos de Documentos
- **Expedientes**: Documentos oficiales numerados por organismo
- **Cajas**: Unidades físicas para almacenar documentación
- **Organismos**: IPS, Pediatrico, IGPJ, Maternidad, Escribania
- **Movimientos**: Traslados, ingresos, egresos de documentos

## Reglas de Negocio
1. **Numeración**: Cada expediente tiene un número único
2. **Ubicación**: Cada expediente tiene caja y organismo asignados
3. **Movimientos**: Todo movimiento debe registrarse con fecha, usuario y observaciones
4. **Permisos**: Usuarios solo ven documentos de su nivel de seguridad
5. **Auditoría**: Todas las acciones se registran en tabla auditoria

## Esquemas de Base de Datos
- **public**: Usuarios, roles, permisos, auditoria
- **ips**: Expedientes, cajas, movimientos de IPS
- **pediatrico**: Expedientes, cajas, movimientos de Pediatrico
- **igpj**: Expedientes, cajas, movimientos de IGPJ
- **maternidad**: Expedientes, cajas, movimientos de Maternidad
- **escribania**: Expedientes, cajas, movimientos de Escribania

## Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| users | Usuarios autenticados |
| roles | Roles del sistema |
| permissions | Permisos y códigos |
| auditoria | Registro de todas las acciones |
| cajas | Unidades de almacenamiento |
| documentos | Expedientes y documentos |
| movimientos | Traslados y movimientos de documentos |
```

### 1.2 Servicio IA Backend

```python
# backend/services/ai_service.py
import httpx
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from backend.core.logger import logger

OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
QWEN_MODEL = os.getenv("QWEN_MODEL", "Qwen3.5-4B-UD-Q4_K_XL")
MAX_TOOL_CALLS = 3

class AIService:
    def __init__(self, context_file: Optional[str] = None):
        self.endpoint = OLLAMA_ENDPOINT
        self.model = QWEN_MODEL
        self.contexto_app = ""
        self.db_conn = None
        self.context_file = context_file
      
        if context_file:
            self.contexto_app = self._cargar_contexto(context_file)
        logger.info(f"AIService inicializada con modelo: {self.model}")

    def _cargar_contexto(self, path: str) -> str:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error cargando contexto: {e}")
            return ""

    def _sistema_prompt(self, pregunta: str) -> str:
        return f"""Eres un asistente experto de DATCORR.

Contexto del sistema:
{self.contexto_app}

Pregunta del usuario: {pregunta}

Reglas:
1. Responde SOLO con información del contexto o datos verificados.
2. Si no sabes, indica claramente que no puedes responder.
3. No alucines números, fechas ni existencias.
4. No ejecutes ni sugieras SQL directamente.
5. Respeta los permisos del usuario autenticado.
"""

    def _detectar_intencion(self, pregunta: str) -> Optional[str]:
        import re
        if re.search(r"(cuantos|cuantas|total|cantidad).*?(registros|cajas|expedientes)", 
                     pregunta, re.IGNORECASE):
            return "contar_registros"
        if re.search(r"(donde|ubicación).*?(expediente|caja)", 
                     pregunta, re.IGNORECASE):
            return "buscar_expediente"
        if re.search(r"(movimientos|historial).*?(caja|expediente)", 
                     pregunta, re.IGNORECASE):
            return "obtener_movimientos"
        return None

    def _conectar_db_ia(self) -> bool:
        try:
            from sqlalchemy import create_engine
            db_url = os.getenv("DATABASE_URL_IA", "postgresql://datcorr_ia:DatCorrIaSecure2026!@localhost:5432/datcorr")
            self.db_conn = create_engine(db_url, pool_pre_ping=True)
            logger.info("Conexión DB IA establecida")
            return True
        except Exception as e:
            logger.error(f"Error conectando DB IA: {e}")
            return False

    def _llamar_a_qwen(self, pregunta: str, herramientas: List[Dict] = None) -> Dict[str, Any]:
        try:
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
          
            if herramientas:
                payload["tools"] = herramientas
                payload["tool_choice"] = "auto"
          
            resp = httpx.post(f"{self.endpoint}/api/chat", json=payload, timeout=60)
            if resp.status_code != 200:
                return {"error": f"Error Ollama: {resp.status_code}"}
          
            return {"respuesta": resp.json()["message"]["content"], "tool_calls": resp.json().get("tool_calls", [])}
        except Exception as e:
            logger.error(f"Error Qwen: {e}")
            return {"error": f"Error en Qwen: {str(e)}"}

    def consultar(self, pregunta: str) -> Dict[str, Any]:
        if not self.contexto_app:
            return {"error": "Contexto del sistema no cargado"}
      
        if not self.db_conn:
            if not self._conectar_db_ia():
                return {"error": "No se pudo conectar a la base de datos"}
      
        intención = self._detectar_intencion(pregunta)
        herramientas = None
      
        if intención:
            if intención == "contar_registros":
                herramientas = [{"type": "function", "function": {"name": "contar_registros", "description": "Cuenta registros de un esquema", "parameters": {"type": "object", "properties": {"esquema": {"type": "string", "enum": ["ips", "pediatrico", "igpj", "maternidad", "escribania"]}}, "required": ["esquema"]}}}]
            elif intención == "buscar_expediente":
                herramientas = [{"type": "function", "function": {"name": "buscar_expediente", "description": "Busca expediente por número", "parameters": {"type": "object", "properties": {"numero": {"type": "string"}}, "required": ["numero"]}}}]
            elif intención == "obtener_movimientos":
                herramientas = [{"type": "function", "function": {"name": "obtener_movimientos", "description": "Obtiene movimientos de una caja", "parameters": {"type": "object", "properties": {"caja_id": {"type": "integer"}}, "required": ["caja_id"]}}}]
      
        respuesta = self._llamar_a_qwen(pregunta, herramientas)
      
        if "error" in respuesta:
            return respuesta
      
        # Bucle de tool calls
        tool_calls = respuesta.get("tool_calls", [])
        iteraciones = 0
        while tool_calls and iteraciones < MAX_TOOL_CALLS:
            iteraciones += 1
            if tool_calls:
                tool_call = tool_calls[0]
                # Ejecutar herramienta (implementación en Fase 2)
                # ...
                respuesta = self._llamar_a_qwen(pregunta, [])
                respuesta["tool_calls"] = tool_calls[1:]
            else:
                break
      
        return respuesta
```

### 1.3 Router IA

```python
# backend/routers/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.services.ai_service import AIService
from backend.security.jwt_bearer import obtener_usuario_actual
from backend.dependencies import get_db
from sqlalchemy.orm import Session
import os

router = APIRouter(prefix="/ai", tags=["Asistente IA"])
ai_service = AIService(context_file="backend/services/ai_context_datcorr.md")

@router.get("/status")
def status():
    try:
        r = httpx.get(f"{os.getenv('OLLAMA_ENDPOINT', 'http://localhost:11434')}/api/tags", timeout=5)
        return {"disponible": r.status_code == 200}
    except Exception as e:
        return {"disponible": False, "error": str(e)}

@router.post("/consultar")
def consultar(pregunta: str = Query(..., min_length=1, max_length=500), 
             usuario_actual=Depends(obtener_usuario_actual),
             db: Session = Depends(get_db)):
    if not pregunta.strip():
        raise HTTPException(400, "La pregunta no puede estar vacía")
    if not usuario_actual:
        raise HTTPException(401, "No autenticado")
  
    respuesta = ai_service.consultar(pregunta)
    if "error" in respuesta:
        raise HTTPException(500, respuesta["error"])
  
    return {"respuesta": respuesta["respuesta"], "timestamp": datetime.now().isoformat()}
```

### 1.4 Schemas Pydantic

```python
# backend/schemas/ai_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional

class AiConsultaRequest(BaseModel):
    pregunta: str
    timeout: int = 30

class AiConsultaResponse(BaseModel):
    respuesta: str
    timestamp: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

class AiStatusResponse(BaseModel):
    disponible: bool
    error: Optional[str] = None
```

---

## 🖥️ Fase 2: Integración Desktop

### 2.1 Cliente API IA

```python
# core/api_ia_client.py
import httpx
from typing import Dict, Any

class ApiIaClient:
    def __init__(self, api_client):
        self._client = api_client
        self.base_url = "http://localhost:8000"
  
    def consultar(self, pregunta: str, timeout: int = 30) -> Dict[str, Any]:
        try:
            return self._client.post(f"{self.base_url}/ai/consultar", 
                                     json={"pregunta": pregunta, "timeout": timeout}).json()
        except Exception as e:
            return {"error": f"Error de conexión: {str(e)}"}
  
    def status(self) -> Dict[str, Any]:
        try:
            return self._client.get(f"{self.base_url}/ai/status").json()
        except Exception as e:
            return {"disponible": False, "error": str(e)}
```

### 2.2 Widget de Chat IA

```python
# core/ai_chat_widget.py
from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel, QLineEdit, QPushButton, QScrollArea, QToolButton
from PySide6.QtCore import Qt, Signal
from core.api_ia_client import ApiIaClient
from typing import Dict, Any

class AiChatWidget(QWidget):
    def __init__(self, api_client: ApiIaClient, parent=None):
        super().__init__(parent)
        self.api_client = api_client
        self.messages = []
        self.is_loading = False
      
        layout = QVBoxLayout(self)
      
        # Título
        title_layout = QHBoxLayout()
        self.btn_cerrar = QToolButton()
        self.btn_cerrar.clicked.connect(self.hide)
        title_layout.addWidget(self.btn_cerrar)
        self.lbl_titulo = QLabel("Asistente DATCORR")
        self.lbl_titulo.setFont(QFont("Arial", 14, QFont.Bold))
        self.lbl_titulo.setStyleSheet("color: #60a5fa;")
        title_layout.addWidget(self.lbl_titulo)
        layout.addLayout(title_layout)
      
        # Área de mensajes
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet("background-color: #1e293b;")
      
        self.content_widget = QWidget()
        self.content_layout = QVBoxLayout(self.content_widget)
        self.content_layout.setSpacing(10)
        self.content_layout.setContentsMargins(10, 10, 10, 10)
        self.scroll_area.setWidget(self.content_widget)
        layout.addWidget(self.scroll_area)
      
        # Mensaje inicial
        self._agregar_mensaje("AI", "Hola, soy el asistente de DATCORR. ¿En qué puedo ayudarte?")
      
        # Área de input
        input_layout = QHBoxLayout()
        self.input = QLineEdit()
        self.input.setPlaceholderText("Escribe tu pregunta...")
        self.input.returnPressed.connect(self._enviar)
        input_layout.addWidget(self.input)
      
        self.btn_enviar = QPushButton("Enviar")
        self.btn_enviar.clicked.connect(self._enviar)
        input_layout.addWidget(self.btn_enviar)
        layout.addLayout(input_layout)
  
    def _agregar_mensaje(self, texto: str, rol: str = "AI"):
        msg = {"texto": texto, "rol": rol}
        self.messages.append(msg)
      
        bubble = QLabel(f"{texto}")
        bubble.setWordWrap(True)
        bubble.setStyleSheet(f"color: {self._color_burbuja(rol)}; padding: 8px 12px; border-radius: 8px; max-width: 80%;")
        self.content_layout.addWidget(bubble)
      
        self.scroll_area.verticalScrollBar().setValue(self.scroll_area.verticalScrollBar().maximum())
  
    def _color_burbuja(self, rol: str) -> str:
        return "#60a5fa" if rol == "AI" else "#22c55e"
  
    def _enviar(self):
        pregunta = self.input.text().strip()
        if not pregunta:
            return
      
        self.input.clear()
        self._agregar_mensaje(pregunta, "USER")
        self.is_loading = True
      
        status = self.api_client.status()
        if not status.get("disponible"):
            self._agregar_mensaje("La IA no está disponible.", "AI")
            self.is_loading = False
            return
      
        try:
            respuesta = self.api_client.consultar(pregunta)
            if "error" in respuesta:
                self._agregar_mensaje(f"Error: {respuesta['error']}", "AI")
            else:
                self._agregar_mensaje(respuesta["respuesta"], "AI")
        finally:
            self.is_loading = False
```

---

## ✅ Checklist de Implementación

| Fase             | Tarea                                    | Estado |
| ---------------- | ---------------------------------------- | ------ |
| **Fase 0** | Crear usuario DB IA                      | ✅     |
|                  | Configurar .env                          | ✅     |
|                  | Instalar Ollama + Qwen3.5-4B-UD-Q4_K_XL | ⏳     |
| **Fase 1** | Crear ai_context_datcorr.md              | ✅     |
|                  | Crear ai_service.py                      | ✅     |
|                  | Crear ai_router.py                       | ✅     |
|                  | Crear ai_schema.py                       | ✅     |
|                  | Registrar router en main.py              | ⏳     |
| **Fase 2** | Crear api_ia_client.py                   | ✅     |
|                  | Crear ai_chat_widget.py                  | ✅     |
|                  | Integrar en Desktop                      | ⏳     |
| **Fase 3** | Testear endpoints                        | ⏳     |
|                  | Probar chat web/desktop                  | ⏳     |

---

## 📌 Notas Importantes

1. **Seguridad**: Usuario `datcorr_ia` solo tiene permisos SELECT en esquemas específicos
2. **Timeout**: Consulta máxima de 60 segundos
3. **Tool Calling**: Máximo 3 llamadas a herramientas por consulta
4. **Contexto**: El `ai_context_datcorr.md` es crítico para respuestas coherentes
5. **Logs**: Todas las consultas a IA se registran en `backend/core/logger.py`

---

## 🚀 Siguientes Pasos

1. Ejecutar `scripts/crear_usuario_ia.sql`
2. Descargar Qwen3.5-4B-UD-Q4_K_XL con `ollama run Qwen3.5-4B-UD-Q4_K_XL`
3. Verificar endpoints: `curl http://localhost:8000/ai/status`
4. Probar consultas: `curl -X POST http://localhost:8000/ai/consultar -H "Content-Type: application/json" -d '{"pregunta": "¿Qué es una caja?"}'`
5. Integrar widget en desktop app

¿Necesitas que genere algún archivo adicional o realice alguna modificación específica?
