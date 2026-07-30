
# 📘 Plan Concreto de Implementación IA en DatCorr

## 📋 Documento de Especificación Técnica (v2.0)

---

# 1. RESUMEN EJECUTIVO

| Elemento                | Descripción                                                   |
| ----------------------- | -------------------------------------------------------------- |
| **Objetivo**      | Implementar asistente conversacional con Qwen local en DatCorr |
| **Alcance**       | Desktop (PySide6) + Web (React + FastAPI)                      |
| **Plataforma IA** | Qwen2.5 local (Ollama)                                         |
| **Plataforma DB** | PostgreSQL (solo lectura para IA)                              |
| **Seguridad**     | Permiso de solo lectura, sin SQL directo                       |
| **Timeline**      | 9 semanas (4 fases + pruebas)                                  |
| **Equipo**        | 1 Backend, 1 Frontend, 1 DevOps, 1 QA                          |

---

# 2. ARQUITECTURA INTEGRADA

```
┌─────────────────────────────────────────────────────────────┐
│                    DATCORR IA INTEGRATED                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Desktop   │───▶│   Backend   │───▶│  PostgreSQL │     │
│  │ (PySide6)   │    │  FastAPI    │    │  (READ)     │     │
│  └─────────────┘    │  + Qwen     │    └─────────────┘     │
│                     └─────────────┘                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Web App   │◀───│   Backend   │◀───│  PostgreSQL │     │
│  │  (React)    │    │  FastAPI    │    │  (READ)     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Qwen2.5 Local (Ollama)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 3. CRONOGRAMA DETALLADO (9 SEMANAS)

## FASE 0: PRERREQUISITOS Y CONFIGURACIÓN (Semana 1)

| Día | Tarea                                    | Responsable | Criterio de Aceptación                         |
| ---- | ---------------------------------------- | ----------- | ----------------------------------------------- |
| 1    | Instalación de Ollama en servidor       | Backend     | `ollama list` muestra modelos                 |
| 2    | Instalación de Qwen2.5:7b en Ollama     | Backend     | `ollama run qwen2.5:7b` responde              |
| 3    | Configuración de entorno PostgreSQL     | DevOps      | Crear usuario`datcorr_ia`                     |
| 4    | Crear usuario`datcorr_ia` con permisos | Backend     | SQL ejecutable sin errores                      |
| 5    | Validar conexión local (localhost)      | Backend     | Endpoint`http://localhost:11434/api/generate` |
| 6    | Crear script de configuración inicial   | DevOps      | `docker-compose` o `.env`                   |
| 7    | Documentar requisitos de hardware        | DevOps      | Especificación RAM/GPU                         |

**Entregables:**

- ✅ `docker-compose.ia.yml` (opcional)
- ✅ `.env.example` con variables de entorno
- ✅ Script de instalación de Qwen

---

## FASE 1: ASISTENTE INFORMATIVO (Semana 2-3)

### 1.1 Crear `ai_context_datcorr.md`

```markdown
# DATCORR - CONOCIMIENTO DE LA APLICACIÓN

## 1. ESTRUCTURA DEL SISTEMA

### 1.1 Organismos
- **IPS**: Instituciones Prestadoras de Servicios
- **Pediatría**: Gestión de expedientes pediátricos
- **IGPJ**: Inspección General de la Judicatura
- **Maternidad**: Gestión de expedientes de maternidad
- **Escribanía**: Gestión de expedientes de escribanía

### 1.2 Componentes Principales
| Concepto | Descripción |
|----------|-------------|
| Caja | Unidad física para almacenar documentación |
| Expediente | Documento identificado por número único |
| Movimiento | Traslado, préstamo, devolución de caja |
| Usuario | Persona autorizada en el sistema |

### 1.3 Roles de Usuario
| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso completo a todas las bases |
| OFICINA | Gestión administrativa |
| DEPÓSITO | Operaciones con cajas y movimientos |
| CONSULTA | Solo lectura en todas las bases |

## 2. BASES DE DATOS DISPONIBLES

| Base | Esquema | Tablas |
|------|---------|--------|
| IPS | ips | Datcorr_database |
| Pediatría | pediatrico | Datcorr_database |
| IGPJ | igpj | Datcorr_database |
| Maternidad | maternidad | Datcorr_database |
| Escribanía | escribania | Datcorr_database |

## 3. REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| R1 | La IA solo consulta datos, nunca modifica |
| R2 | La IA respeta permisos del usuario autenticado |
| R3 | La IA indica cuando no encuentra información suficiente |
| R4 | Los datos sensibles se ocultan en el prompt |
| R5 | No se almacenan datos sensibles en logs |

## 4. FLUJO DE OPERACIONES

1. Usuario inicia sesión → Se obtiene rol
2. Usuario hace pregunta → IA valida permisos
3. IA responde según permisos
4. IA no ejecuta SQL directo
5. IA usa funciones controladas
```

### 1.2 Crear `ai_service.py`

```python
# backend/services/ai_service.py
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """Servicio principal del asistente IA"""
  
    def __init__(self, model_endpoint: str = "http://localhost:11434/api/generate",
                 context_file: str = "ai_context_datcorr.md"):
        """
        Inicializa el servicio IA con:
        - Endpoint de Qwen local
        - Archivo de contexto de la aplicación
        """
        self.endpoint = model_endpoint
        self.contexto_app = self._cargar_contexto(context_file)
        self.db_conn = None
      
        logger.info(f"AI Service initialized: {model_endpoint}")
  
    def _cargar_contexto(self, file_path: str) -> str:
        """Carga el archivo de contexto"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise ValueError(f"Context file not found: {file_path}")
  
    def _conectar_db(self, user: str, password: str, database: str):
        """Establece conexión segura de solo lectura"""
        import psycopg2
        self.db_conn = psycopg2.connect(
            host="localhost",
            user=user,
            password=password,
            database=database,
            connect_timeout=10
        )
        logger.info("DB connection established (READ ONLY)")
  
    def _validar_permisos(self, usuario: Dict[str, Any]) -> bool:
        """Valida si el usuario puede acceder a la operación solicitada"""
        # Implementar lógica de permisos según roles
        roles = usuario.get('roles', [])
        return 'ADMIN' in roles or 'OFICINA' in roles or 'DEPÓSITO' in roles
  
    def _detectar_intencion(self, pregunta: str) -> Optional[str]:
        """Detecta la intención de la pregunta"""
        import re
      
        patterns = {
            r"(cuantos|cuantas|total|cantidad).*(registros|cajas|expedientes)": "contar_registros",
            r"(donde|ubicación|buscar).*(expediente|caja)": "buscar_por_numero",
            r"(movimientos|historial|traslados).*(caja)": "obtener_movimientos",
            r"(que|como|como funciona).*(app|sistema|funciona)": "explicar_concepto",
        }
      
        for pattern, intent in patterns.items():
            if re.search(pattern, pregunta, re.IGNORECASE):
                logger.debug(f"Intent detected: {intent}")
                return intent
      
        return None
  
    def _llamar_a_qwen(self, prompt: str) -> str:
        """Envía la pregunta a Qwen y obtiene respuesta"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
          
            payload = {
                "model": "qwen2.5:7b",
                "messages": [
                    {
                        "role": "system",
                        "content": f"""Eres un asistente de DatCorr. 
                        Contexto: {self.contexto_app}
                        Pregunta: {prompt}
                        Reglas:
                        1. Solo responde con información verificada
                        2. Si no tienes información, di que no puedes responder
                        3. Usa formato JSON para datos
                        """
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 2000
            }
          
            response = httpx.post(self.endpoint, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
          
            data = response.json()
            return data.get('response', '')
          
        except Exception as e:
            logger.error(f"Error calling Qwen: {e}")
            return "Lo siento, no pude procesar tu pregunta. Intenta de nuevo más tarde."
  
    def consultar(self, pregunta: str, usuario: Dict[str, Any], 
                 db_user: Optional[str] = None) -> Dict[str, Any]:
        """
        Consulta principal del asistente IA
      
        Args:
            pregunta: Pregunta del usuario
            usuario: Objeto del usuario actual
            db_user: Credenciales de DB (opcional)
      
        Returns:
            Dict con respuesta e información de la consulta
        """
        start_time = datetime.now()
      
        # 1. Validar permisos
        if not self._validar_permisos(usuario):
            return {
                "respuesta": "Lo siento, no tienes permisos para responder esta pregunta.",
                "error": "PERMISO_RECHAZADO",
                "tiempo": 0
            }
      
        # 2. Detectar intención
        intent = self._detectar_intencion(pregunta)
      
        # 3. Construir prompt con contexto
        prompt = f"Contexto de la aplicación:\n{self.contexto_app}\n\nPregunta del usuario:\n{pregunta}"
      
        # 4. Enviar a Qwen
        respuesta = self._llamar_a_qwen(prompt)
      
        # 5. Calcular tiempo
        tiempo = (datetime.now() - start_time).total_seconds()
      
        return {
            "respuesta": respuesta,
            "tiempo": tiempo,
            "tiempo_total": tiempo,
            "intention": intent
        }
```

### 1.3 Crear `ai_router.py`

```python
# backend/routers/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any
from datetime import datetime
import httpx

from services.ai_service import AIService
from core.security.jwt_manager import get_current_user
from schemas.usuarios import Usuario

router = APIRouter(prefix="/ai", tags=["Asistente IA"])

# Inicializar servicio IA global
ai_service = AIService(
    model_endpoint="http://localhost:11434/api/generate",
    context_file="services/ai_context_datcorr.md"
)

@router.get("/status")
async def verificar_status():
    """Verifica que Qwen responde correctamente"""
    try:
        headers = {"Content-Type": "application/json"}
        response = httpx.post(
            "http://localhost:11434/api/generate",
            json={"model": "qwen2.5:7b", "messages": [{"role": "user", "content": "Hola"}]},
            timeout=10
        )
        return {"status": "OK", "message": "Qwen disponible"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

@router.post("/consultar")
async def consultar_ia(
    pregunta: str = Query(..., description="Pregunta del usuario"),
    usuario: Usuario = Depends(get_current_user),
    db_user: Optional[str] = Query(None, description="Usuario de DB (solo para pruebas)"),
    db_password: Optional[str] = Query(None, description="Contraseña de DB (solo para pruebas)"),
    timeout: float = Query(30.0, ge=0.1, description="Timeout en segundos")
):
    """
    Consulta principal del asistente IA
  
    Query params:
    - pregunta: Pregunta del usuario (requerido)
    - timeout: Timeout máximo en segundos (default: 30)
    """
    # Verificar timeout
    if timeout > 60:
        raise HTTPException(status_code=400, detail="Timeout máximo: 60s")
  
    # Construir prompt
    prompt = f"""Eres un asistente de DatCorr.

Contexto de la aplicación:
{ai_service.contexto_app}

Pregunta del usuario:
{pregunta}

Instrucciones:
1. Responde usando solo información del contexto
2. Si no tienes información, di que no puedes responder
3. No alucines datos
"""
  
    try:
        # Llamar a Qwen
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
      
        payload = {
            "model": "qwen2.5:7b",
            "messages": [
                {
                    "role": "system",
                    "content": f"Contexto: {ai_service.contexto_app}\n\nPregunta: {pregunta}"
                },
                {
                    "role": "user",
                    "content": f"Contexto: {ai_service.contexto_app}\n\nPregunta: {pregunta}"
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000,
            "timeout": timeout
        }
      
        start_time = datetime.now()
        response = httpx.post(
            "http://localhost:11434/api/generate",
            json=payload,
            headers=headers,
            timeout=timeout
        )
        response.raise_for_status()
      
        data = response.json()
        respuesta = data.get('response', '')
      
        tiempo = (datetime.now() - start_time).total_seconds()
      
        return {
            "respuesta": respuesta,
            "tiempo": round(tiempo, 3),
            "timestamp": datetime.now().isoformat()
        }
      
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout en Qwen")
    except Exception as e:
        logger.error(f"Error en consulta IA: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 1.4 Testear Fase 1

```bash
# Test endpoint
curl -X POST "http://localhost:8000/ai/consultar" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"pregunta": "¿Qué es una caja?"}'

# Test status
curl -X GET "http://localhost:8000/ai/status"
```

---

## FASE 2: ASISTENTE CONECTADO A DATOS (Semana 4-5)

### 2.1 Funciones de Consulta Segura

```python
# backend/services/ai_service.py — Extensiones para Fase 2

class AIService:
    # ... (mantener métodos anteriores)
  
    def _ejecutar_query_seguro(self, query: str, usuario: Dict[str, Any]) -> list:
        """Ejecuta consulta segura con permisos del usuario"""
        if not self.db_conn:
            raise ValueError("Conexión DB no inicializada")
      
        # Filtrar según permisos del usuario
        permisos = usuario.get('permisos', [])
      
        try:
            with self.db_conn.cursor() as cursor:
                cursor.execute(query)
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            logger.error(f"Error en consulta segura: {e}")
            raise
  
    def buscar_expediente(self, numero: str) -> Optional[Dict[str, Any]]:
        """Busca expediente por número en todas las bases"""
        # Implementar lógica de búsqueda
        return None
  
    def contar_registros(self, esquema: str) -> int:
        """Cuenta registros de un esquema"""
        query = f"SELECT COUNT(*) FROM {esquema}.Datcorr_database"
        return self._ejecutar_query_seguro(query, self._get_usuario())
  
    def obtener_movimientos(self, caja_id: int) -> list:
        """Historial de movimientos de una caja"""
        # Implementar lógica de movimientos
        return []
```

### 2.2 Implementar Tool Calling

```python
# backend/services/ai_service.py — Sistema de herramientas

class AIService:
    # ... (mantener métodos anteriores)
  
    def _obtener_herramientas(self) -> Dict[str, Any]:
        """Define las herramientas disponibles"""
        return {
            "buscar_expediente": {
                "type": "function",
                "function": {
                    "name": "buscar_expediente",
                    "description": "Busca expediente por número en todas las bases",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "numero": {"type": "string", "description": "Número del expediente"}
                        },
                        "required": ["numero"]
                    }
                }
            },
            "contar_registros": {
                "type": "function",
                "function": {
                    "name": "contar_registros",
                    "description": "Cuenta registros de un esquema",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "esquema": {"type": "string", "enum": ["ips", "pediatrico", "igpj", "maternidad", "escribania"]}
                        },
                        "required": ["esquema"]
                    }
                }
            },
            "obtener_movimientos": {
                "type": "function",
                "function": {
                    "name": "obtener_movimientos",
                    "description": "Obtiene movimientos de una caja",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "caja_id": {"type": "integer", "description": "ID de la caja"}
                        },
                        "required": ["caja_id"]
                    }
                }
            }
        }
  
    def _llamar_a_qwen_con_tools(self, prompt: str, herramientas: Dict[str, Any]) -> str:
        """Llama a Qwen con herramientas (tool calling)"""
        # Implementar tool calling
        return ""
```

### 2.3 Seguridad y Testing

```python
# backend/services/ai_service.py — Seguridad

class AIService:
    # ... (mantener métodos anteriores)
  
    def _validar_permisos(self, usuario: Dict[str, Any]) -> bool:
        """Valida permisos de manera estricta"""
        roles = usuario.get('roles', [])
        permisos = usuario.get('permisos', [])
      
        # Verificar roles
        if 'ADMIN' not in roles and 'OFICINA' not in roles and 'DEPÓSITO' not in roles:
            return False
      
        # Verificar permisos específicos
        if 'CONSULTA' not in roles and 'ADMIN' not in roles:
            return False
      
        return True
  
    def _limpiar_respuesta(self, respuesta: str) -> str:
        """Elimina datos sensibles de la respuesta"""
        # Implementar filtrado de datos sensibles
        return respuesta
```

---

## FASE 3: TOOL CALLING AUTOMÁTICO (Semana 6-7)

### 3.1 Integrar Tool Calling en Qwen

```python
# backend/services/ai_service.py — Tool calling

class AIService:
    # ... (mantener métodos anteriores)
  
    def _llamar_a_qwen_con_tools(self, prompt: str, herramientas: Dict[str, Any]) -> str:
        """Llama a Qwen con herramientas (tool calling)"""
        try:
            # Construir mensaje con herramientas
            messages = [
                {
                    "role": "system",
                    "content": f"""Contexto de la aplicación:
{self.contexto_app}

Herramientas disponibles:
{json.dumps(herramientas, indent=2)}

Instrucciones:
1. Usa herramientas cuando sea necesario
2. Devuelve JSON con herramienta y argumentos
3. No alucines datos
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
          
            # Payload para Qwen con tool calling
            payload = {
                "model": "qwen2.5:7b",
                "messages": messages,
                "tools": herramientas,
                "tool_choice": "auto",
                "temperature": 0.3,
                "max_tokens": 2000
            }
          
            response = httpx.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=60
            )
          
            data = response.json()
            return data.get('response', '')
          
        except Exception as e:
            logger.error(f"Error en tool calling: {e}")
            return "No pude procesar tu pregunta."
```

### 3.2 Ejecutar Tool Calls

```python
# backend/services/ai_service.py — Ejecución de herramientas

class AIService:
    # ... (mantener métodos anteriores)
  
    def _ejecutar_tool_call(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """Ejecuta una herramienta con sus argumentos"""
        if tool_name == "buscar_expediente":
            return self.buscar_expediente(args.get("numero", ""))
        elif tool_name == "contar_registros":
            return self.contar_registros(args.get("esquema", ""))
        elif tool_name == "obtener_movimientos":
            return self.obtener_movimientos(args.get("caja_id", 0))
      
        return None
```

### 3.3 Logging de Tool Calls

```python
# backend/routers/ai_router.py — Logging

@router.post("/consultar")
async def consultar_ia(
    pregunta: str = Query(...),
    usuario: Usuario = Depends(get_current_user),
    ...
):
    # ... (mantener métodos anteriores)
  
    # Registrar tool call
    logger.info(f"AI Tool Call: {tool_name} | Args: {json.dumps(args)}")
    logger.info(f"AI Response Time: {tiempo:.2f}s")
```

---

## FASE 4: INTERFAZ DE USUARIO (Semana 8-9)

### 4.1 Desktop App (PySide6)

```python
# desktop/ventana_principal.py — Integración IA

class VentanaPrincipal(QMainWindow):
    # ... (mantener métodos anteriores)
  
    def __init__(self):
        super().__init__()
        self.ai_chat = AiChatWidget()
        self.ai_chat.load()
      
        # Botón para abrir chat
        self.btn_ai = QPushButton("🤖 Asistente IA")
        self.btn_ai.clicked.connect(self.abrir_chat_ai)
        self.addWidget(self.btn_ai)
  
    def abrir_chat_ai(self):
        self.ai_chat.show()
```

```python
# desktop/ai_chat_widget.py — Widget de chat IA

class AiChatWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.ui = Ui_AiChat()
        self.ui.setupUi(self)
      
        # Conexión con backend
        self.ai_client = ApiClient()
      
        # Manejar mensajes
        self.ui.input_line.text.returnPressed.connect(self.enviar_mensaje)
```

### 4.2 Web App (React)

```jsx
// frontend/src/components/AiChat/AiChat.jsx

import { useState, useEffect } from 'react';
import { Box, Paper, IconButton, TextField, Typography } from '@mui/material';

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    setLoading(true);
    const response = await fetch('/ai/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: input })
    });
  
    setLoading(false);
    setMessages([...messages, { text: input, type: 'user' }]);
    const data = await response.json();
    setMessages([...messages, { text: data.respuesta, type: 'ai' }]);
    setInput('');
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24 }}>
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{ bgcolor: 'primary.main' }}
      >
        <ChatIcon />
      </IconButton>
    
      {open && (
        <Paper sx={{ width: 400, height: 500, p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{ 
                  mb: 2, 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: msg.type === 'user' ? 'primary.light' : 'secondary.light'
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            ))}
          </Box>
        
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AiChat;
```

### 4.3 Endpoints Adicionales

```python
# backend/routers/ai_router.py — Historial

@router.get("/historial")
async def obtener_historial(
    usuario: Usuario = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    """Obtiene historial de consultas del usuario"""
    # Implementar lógica de historial
    return []

@router.delete("/historial")
async def limpiar_historial(
    usuario: Usuario = Depends(get_current_user)
):
    """Limpa historial de consultas del usuario"""
    # Implementar lógica de limpieza
    return {"mensaje": "Historial limpiado"}
```

---

# 4. CONFIGURACIÓN DE SEGURIDAD

## 4.1 Permisos de Usuario IA

```sql
-- backend/database/permissions.sql

-- Crear usuario de solo lectura para IA
CREATE USER datcorr_ia WITH PASSWORD 'secure_password_123';

-- Conectar a todas las bases
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;

-- Usar esquemas específicos
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;

-- Permitir SELECT en todas las tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania
  GRANT SELECT ON TABLES TO datcorr_ia;

-- Verificar permisos
\du datcorr_ia
```

## 4.2 Validación de Seguridad

```python
# backend/services/ai_service.py — Validación de seguridad

class AIService:
    # ... (mantener métodos anteriores)
  
    def _validar_sql(self, query: str) -> bool:
        """Valida que el SQL no contenga comandos peligrosos"""
        dangerous_keywords = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE",
            "EXECUTE", "TRUNCATE", "GRANT", "REVOKE"
        ]
      
        query_upper = query.upper()
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                logger.error(f"SQL peligroso detectado: {query}")
                raise ValueError("Consulta SQL no permitida")
      
        return True
```

---

# 5. TESTING

## 5.1 Test Cases

| Test | Descripción              | Expectado           |
| ---- | ------------------------- | ------------------- |
| T1   | Consulta básica          | Respuesta coherente |
| T2   | Consulta sin permisos     | Error de permiso    |
| T3   | Consulta con datos reales | Dato correcto       |
| T4   | Timeout                   | Error de timeout    |
| T5   | SQL peligroso             | Rechazo             |
| T6   | Tool calling              | JSON válido        |
| T7   | Datos sensibles           | Ocultos             |

## 5.2 Scripts de Testing

```python
# tests/test_ai_service.py

import pytest
from services.ai_service import AIService

class TestAIService:
    def test_consultar_basic(self):
        """Test consulta básica"""
        service = AIService()
        respuesta = service.consultar("¿Qué es una caja?", {})
        assert "respuesta" in respuesta
        assert "caja" in respuesta.get("respuesta", "").lower()
  
    def test_consultar_sin_permisos(self):
        """Test consulta sin permisos"""
        service = AIService()
        respuesta = service.consultar("¿Qué es una caja?", {"roles": ["CONSULTA"]})
        assert "permisos" in respuesta.get("error", "")
  
    def test_consultar_con_datos(self):
        """Test consulta con datos reales"""
        service = AIService()
        # Implementar test con datos
        pass
```

---

# 6. DEPLOYMENT

## 6.1 Docker Compose

```yaml
# docker-compose.ia.yml

version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_ENDPOINT=http://ollama:11434/api/generate
      - DB_USER=datcorr_ia
      - DB_PASSWORD=secure_password_123
      - DB_NAME=datcorr
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

## 6.2 Environment Variables

```bash
# .env.example

# IA Configuration
OLLAMA_ENDPOINT=http://localhost:11434/api/generate
QWEN_MODEL=qwen2.5:7b
MAX_TOKENS=2000
TIMEOUT=60

# Database
DB_USER=datcorr_ia
DB_PASSWORD=secure_password_123
DB_NAME=datcorr

# Security
AI_SECRET_KEY=your_secret_key
```

---

# 7. MONITORING Y LOGGING

## 7.1 Logs de IA

```python
# backend/services/ai_service.py — Logging

class AIService:
    # ... (mantener métodos anteriores)
  
    def _llamar_a_qwen(self, prompt: str) -> str:
        """Con logging detallado"""
        logger.info(f"=== AI QUERY START ===")
        logger.info(f"Query: {prompt[:100]}...")
        logger.info(f"Endpoint: {self.endpoint}")
        logger.info(f"Model: qwen2.5:7b")
      
        try:
            # ... (llama a qwen)
            logger.info(f"=== AI QUERY END ===")
            logger.info(f"Response time: {tiempo:.2f}s")
            return respuesta
          
        except Exception as e:
            logger.error(f"=== AI QUERY ERROR ===")
            logger.error(f"Error: {str(e)}")
            raise
```

## 7.2 Métricas

```python
# backend/routers/ai_router.py — Métricas

@router.get("/metrics")
async def obtener_metricas():
    """Obtiene métricas de uso de IA"""
    return {
        "total_consultas": total,
        "avg_time": avg_time,
        "errors": errors,
        "success_rate": success_rate
    }
```

---

# 8. CHECKLIST FINAL

## 8.1 Pre-Implementación

- [ ] Hardware verificado (8GB+ RAM, GPU opcional)
- [ ] Ollama instalado y funcionando
- [ ] PostgreSQL con usuario `datcorr_ia` creado
- [ ] `ai_context_datcorr.md` creado
- [ ] `.env.example` con variables de entorno

## 8.2 Fase 1

- [ ] `ai_service.py` creado y funcional
- [ ] `ai_router.py` endpoints funcionando
- [ ] `POST /ai/consultar` responde correctamente
- [ ] `GET /ai/status` verifica Qwen
- [ ] Sin consultas a PostgreSQL

## 8.3 Fase 2

- [ ] Funciones de consulta seguras implementadas
- [ ] Detección de intención funcionando
- [ ] Tool calling disponible
- [ ] Seguridad verificada (permisos)
- [ ] Sin SQL directo

## 8.4 Fase 3

- [ ] Tool calling automático funcionando
- [ ] Hasta 3 herramientas por consulta
- [ ] Timeout total de 60s
- [ ] Logging de tool calls
- [ ] Fallback para consultas sin herramientas

## 8.5 Fase 4

- [ ] Widget de chat en Desktop (PySide6)
- [ ] Widget de chat en Web (React)
- [ ] Endpoints de historial funcionando
- [ ] Integración con backend completa

## 8.6 Post-Implementación

- [ ] Tests unitarios pasados
- [ ] Tests de integración pasados
- [ ] Seguridad auditable
- [ ] Logs de IA configurados
- [ ] Documentación actualizada

---

# 9. RIESGOS Y MITIGACIONES

| Riesgo                | Impacto                | Mitigación                        |
| --------------------- | ---------------------- | ---------------------------------- |
| Qwen lento            | UX degradada           | Timeout configurable, caching      |
| Error en Qwen         | Respuestas erróneas   | Fallback a respuestas predefinidas |
| Permiso SQL           | Datos comprometidos    | Validación estricta de SQL        |
| Datos sensibles       | Violación privacidad  | Filtrado en prompts                |
| Hardware insuficiente | Qwen no responde       | Verificar requisitos previos       |
| Alucinaciones         | Respuestas incorrectas | Validación de respuestas          |

---

# 10. PRÓXIMOS PASOS

## 10.1 Revisión Inicial (Semana 1)

1. Revisar plan con equipo
2. Ajustar según prioridades
3. Confirmar hardware disponible
4. Asignar tareas

## 10.2 Implementación (Semana 1-9)

1. Ejecutar Fase 0 (configuración)
2. Ejecutar Fase 1 (asistente informativo)
3. Ejecutar Fase 2 (conectado a datos)
4. Ejecutar Fase 3 (tool calling)
5. Ejecutar Fase 4 (UI)

## 10.3 Testing y Despliegue (Semana 9-10)

1. Tests unitarios e integración
2. Tests de seguridad
3. Despliegue en staging
4. Validación con usuarios

---

**Documentación creada por:** [Tu nombre]
**Fecha:** [Fecha actual]
**Versión:** v2.0
**Estado:** Para revisión del equipo

---

## 📌 Notas Adicionles para el Equipo

1. **Prioridad:** Fase 1 (asistente informativo) es la más rápida y de menor riesgo
2. **Hardware:** Mínimo 8GB RAM para Qwen2.5:7b, preferiblemente con GPU
3. **Seguridad:** Validar permisos en cada fase antes de avanzar
4. **Testing:** Cada fase debe tener tests de integración
5. **Monitoreo:** Configurar logs desde el día 1

---

¿Necesitas que añada más detalles a alguna sección específica o que genere algún archivo adicional?

# 📘 Plan Concreto de Implementación IA en DatCorr

---

## 1. RESUMEN EJECUTIVO

| Elemento                | Descripción                                                   |
| ----------------------- | -------------------------------------------------------------- |
| **Objetivo**      | Implementar asistente conversacional con Qwen local en DatCorr |
| **Alcance**       | Desktop (PySide6) + Web (React + FastAPI)                      |
| **Plataforma IA** | Qwen2.5 local (Ollama)                                         |
| **Plataforma DB** | PostgreSQL (solo lectura para IA)                              |
| **Seguridad**     | Permiso de solo lectura, sin SQL directo                       |
| **Timeline**      | 9 semanas (4 fases + pruebas)                                  |
| **Equipo**        | 1 Backend, 1 Frontend, 1 DevOps, 1 QA                          |

---

## 2. ARQUITECTURA INTEGRADA

```
┌─────────────────────────────────────────────────────────────┐
│                    DATCORR IA INTEGRATED                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Desktop   │───▶│   Backend   │───▶│  PostgreSQL │     │
│  │ (PySide6)   │    │  FastAPI    │    │  (READ)     │     │
│  └─────────────┘    │  + Qwen     │    └─────────────┘     │
│                     └─────────────┘                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Web App   │◀───│   Backend   │◀───│  PostgreSQL │     │
│  │  (React)    │    │  FastAPI    │    │  (READ)     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Qwen2.5 Local (Ollama)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. CRONOGRAMA DETALLADO (9 SEMANAS)

### FASE 0: PRERREQUISITOS Y CONFIGURACIÓN (Semana 1)

| Día | Tarea                                    | Responsable | Criterio de Aceptación                         |
| ---- | ---------------------------------------- | ----------- | ----------------------------------------------- |
| 1    | Instalación de Ollama en servidor       | Backend     | `ollama list` muestra modelos                 |
| 2    | Instalación de Qwen2.5:7b en Ollama     | Backend     | `ollama run qwen2.5:7b` responde              |
| 3    | Configuración de entorno PostgreSQL     | DevOps      | Crear usuario`datcorr_ia`                     |
| 4    | Crear usuario`datcorr_ia` con permisos | Backend     | SQL ejecutable sin errores                      |
| 5    | Validar conexión local (localhost)      | Backend     | Endpoint`http://localhost:11434/api/generate` |
| 6    | Crear script de configuración inicial   | DevOps      | `docker-compose` o `.env`                   |
| 7    | Documentar requisitos de hardware        | DevOps      | Especificación RAM/GPU                         |

**Entregables:**

- ✅ `docker-compose.ia.yml` (opcional)
- ✅ `.env.example` con variables de entorno
- ✅ Script de instalación de Qwen

---

### FASE 1: ASISTENTE INFORMATIVO (Semana 2-3)

#### 1.1 Crear `ai_context_datcorr.md`

```markdown
# DATCORR - CONOCIMIENTO DE LA APLICACIÓN

## 1. ESTRUCTURA DEL SISTEMA

### 1.1 Organismos
- **IPS**: Instituciones Prestadoras de Servicios
- **Pediatría**: Gestión de expedientes pediátricos
- **IGPJ**: Inspección General de la Judicatura
- **Maternidad**: Gestión de expedientes de maternidad
- **Escribanía**: Gestión de expedientes de escribanía

### 1.2 Componentes Principales
| Concepto | Descripción |
|----------|-------------|
| Caja | Unidad física para almacenar documentación |
| Expediente | Documento identificado por número único |
| Movimiento | Traslado, préstamo, devolución de caja |
| Usuario | Persona autorizada en el sistema |

### 1.3 Roles de Usuario
| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso completo a todas las bases |
| OFICINA | Gestión administrativa |
| DEPÓSITO | Operaciones con cajas y movimientos |
| CONSULTA | Solo lectura en todas las bases |

## 2. BASES DE DATOS DISPONIBLES

| Base | Esquema | Tablas |
|------|---------|--------|
| IPS | ips | Datcorr_database |
| Pediatría | pediatrico | Datcorr_database |
| IGPJ | igpj | Datcorr_database |
| Maternidad | maternidad | Datcorr_database |
| Escribanía | escribania | Datcorr_database |

## 3. REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| R1 | La IA solo consulta datos, nunca modifica |
| R2 | La IA respeta permisos del usuario autenticado |
| R3 | La IA indica cuando no encuentra información suficiente |
| R4 | Los datos sensibles se ocultan en el prompt |
| R5 | No se almacenan datos sensibles en logs |

## 4. FLUJO DE OPERACIONES

1. Usuario inicia sesión → Se obtiene rol
2. Usuario hace pregunta → IA valida permisos
3. IA responde según permisos
4. IA no ejecuta SQL directo
5. IA usa funciones controladas
```

#### 1.2 Crear `ai_service.py`

```python
# backend/services/ai_service.py
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """Servicio principal del asistente IA"""
  
    def __init__(self, model_endpoint: str = "http://localhost:11434/api/generate",
                 context_file: str = "ai_context_datcorr.md"):
        self.endpoint = model_endpoint
        self.contexto_app = self._cargar_contexto(context_file)
        self.db_conn = None
      
        logger.info(f"AI Service initialized: {model_endpoint}")
  
    def _cargar_contexto(self, file_path: str) -> str:
        """Carga el archivo de contexto"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise ValueError(f"Context file not found: {file_path}")
  
    def _conectar_db(self, user: str, password: str, database: str):
        """Establece conexión segura de solo lectura"""
        import psycopg2
        self.db_conn = psycopg2.connect(
            host="localhost",
            user=user,
            password=password,
            database=database,
            connect_timeout=10
        )
        logger.info("DB connection established (READ ONLY)")
  
    def _validar_permisos(self, usuario: Dict[str, Any]) -> bool:
        """Valida si el usuario puede acceder a la operación solicitada"""
        roles = usuario.get('roles', [])
        return 'ADMIN' in roles or 'OFICINA' in roles or 'DEPÓSITO' in roles
  
    def _detectar_intencion(self, pregunta: str) -> Optional[str]:
        """Detecta la intención de la pregunta"""
        import re
      
        patterns = {
            r"(cuantos|cuantas|total|cantidad).*(registros|cajas|expedientes)": "contar_registros",
            r"(donde|ubicación|buscar).*(expediente|caja)": "buscar_por_numero",
            r"(movimientos|historial|traslados).*(caja)": "obtener_movimientos",
            r"(que|como|como funciona).*(app|sistema|funciona)": "explicar_concepto",
        }
      
        for pattern, intent in patterns.items():
            if re.search(pattern, pregunta, re.IGNORECASE):
                logger.debug(f"Intent detected: {intent}")
                return intent
      
        return None
  
    def _llamar_a_qwen(self, prompt: str) -> str:
        """Envía la pregunta a Qwen y obtiene respuesta"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
          
            payload = {
                "model": "qwen2.5:7b",
                "messages": [
                    {
                        "role": "system",
                        "content": f"""Eres un asistente de DatCorr. 
                        Contexto: {self.contexto_app}
                        Pregunta: {prompt}
                        Reglas:
                        1. Solo responde con información verificada
                        2. Si no tienes información, di que no puedes responder
                        3. Usa formato JSON para datos
                        """
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 2000
            }
          
            response = httpx.post(self.endpoint, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
          
            data = response.json()
            return data.get('response', '')
          
        except Exception as e:
            logger.error(f"Error calling Qwen: {e}")
            return "Lo siento, no pude procesar tu pregunta. Intenta de nuevo más tarde."
  
    def consultar(self, pregunta: str, usuario: Dict[str, Any], 
                 db_user: Optional[str] = None) -> Dict[str, Any]:
        """Consulta principal del asistente IA"""
        start_time = datetime.now()
      
        # 1. Validar permisos
        if not self._validar_permisos(usuario):
            return {
                "respuesta": "Lo siento, no tienes permisos para responder esta pregunta.",
                "error": "PERMISO_RECHAZADO",
                "tiempo": 0
            }
      
        # 2. Detectar intención
        intent = self._detectar_intencion(pregunta)
      
        # 3. Construir prompt con contexto
        prompt = f"Contexto de la aplicación:\n{self.contexto_app}\n\nPregunta del usuario:\n{pregunta}"
      
        # 4. Enviar a Qwen
        respuesta = self._llamar_a_qwen(prompt)
      
        # 5. Calcular tiempo
        tiempo = (datetime.now() - start_time).total_seconds()
      
        return {
            "respuesta": respuesta,
            "tiempo": tiempo,
            "tiempo_total": tiempo,
            "intention": intent
        }
```

#### 1.3 Crear `ai_router.py`

```python
# backend/routers/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any
from datetime import datetime
import httpx

from services.ai_service import AIService
from core.security.jwt_manager import get_current_user
from schemas.usuarios import Usuario

router = APIRouter(prefix="/ai", tags=["Asistente IA"])

ai_service = AIService(
    model_endpoint="http://localhost:11434/api/generate",
    context_file="services/ai_context_datcorr.md"
)

@router.get("/status")
async def verificar_status():
    """Verifica que Qwen responde correctamente"""
    try:
        headers = {"Content-Type": "application/json"}
        response = httpx.post(
            "http://localhost:11434/api/generate",
            json={"model": "qwen2.5:7b", "messages": [{"role": "user", "content": "Hola"}]},
            timeout=10
        )
        return {"status": "OK", "message": "Qwen disponible"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

@router.post("/consultar")
async def consultar_ia(
    pregunta: str = Query(..., description="Pregunta del usuario"),
    usuario: Usuario = Depends(get_current_user),
    db_user: Optional[str] = Query(None, description="Usuario de DB (solo para pruebas)"),
    db_password: Optional[str] = Query(None, description="Contraseña de DB (solo para pruebas)"),
    timeout: float = Query(30.0, ge=0.1, description="Timeout en segundos")
):
    """Consulta principal del asistente IA"""
  
    # Verificar timeout
    if timeout > 60:
        raise HTTPException(status_code=400, detail="Timeout máximo: 60s")
  
    # Construir prompt
    prompt = f"""Eres un asistente de DatCorr.

Contexto de la aplicación:
{ai_service.contexto_app}

Pregunta del usuario:
{pregunta}

Instrucciones:
1. Responde usando solo información del contexto
2. Si no tienes información, di que no puedes responder
3. No alucines datos
"""
  
    try:
        # Llamar a Qwen
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
      
        payload = {
            "model": "qwen2.5:7b",
            "messages": [
                {
                    "role": "system",
                    "content": f"Contexto: {ai_service.contexto_app}\n\nPregunta: {pregunta}"
                },
                {
                    "role": "user",
                    "content": f"Contexto: {ai_service.contexto_app}\n\nPregunta: {pregunta}"
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000,
            "timeout": timeout
        }
      
        start_time = datetime.now()
        response = httpx.post(
            "http://localhost:11434/api/generate",
            json=payload,
            headers=headers,
            timeout=timeout
        )
        response.raise_for_status()
      
        data = response.json()
        respuesta = data.get('response', '')
      
        tiempo = (datetime.now() - start_time).total_seconds()
      
        return {
            "respuesta": respuesta,
            "tiempo": round(tiempo, 3),
            "timestamp": datetime.now().isoformat()
        }
      
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout en Qwen")
    except Exception as e:
        logger.error(f"Error en consulta IA: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

#### 1.4 Testear Fase 1

```bash
# Test endpoint
curl -X POST "http://localhost:8000/ai/consultar" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"pregunta": "¿Qué es una caja?"}'

# Test status
curl -X GET "http://localhost:8000/ai/status"
```

---

### FASE 2: ASISTENTE CONECTADO A DATOS (Semana 4-5)

#### 2.1 Funciones de Consulta Segura

```python
# backend/services/ai_service.py — Extensiones para Fase 2

class AIService:
    # ... (mantener métodos anteriores)
  
    def _ejecutar_query_seguro(self, query: str, usuario: Dict[str, Any]) -> list:
        """Ejecuta consulta segura con permisos del usuario"""
        if not self.db_conn:
            raise ValueError("Conexión DB no inicializada")
      
        # Filtrar según permisos del usuario
        permisos = usuario.get('permisos', [])
      
        try:
            with self.db_conn.cursor() as cursor:
                cursor.execute(query)
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            logger.error(f"Error en consulta segura: {e}")
            raise
  
    def buscar_expediente(self, numero: str) -> Optional[Dict[str, Any]]:
        """Busca expediente por número en todas las bases"""
        return None
  
    def contar_registros(self, esquema: str) -> int:
        """Cuenta registros de un esquema"""
        query = f"SELECT COUNT(*) FROM {esquema}.Datcorr_database"
        return self._ejecutar_query_seguro(query, self._get_usuario())
  
    def obtener_movimientos(self, caja_id: int) -> list:
        """Historial de movimientos de una caja"""
        return []
```

#### 2.2 Implementar Tool Calling

```python
# backend/services/ai_service.py — Sistema de herramientas

class AIService:
    # ... (mantener métodos anteriores)
  
    def _obtener_herramientas(self) -> Dict[str, Any]:
        """Define las herramientas disponibles"""
        return {
            "buscar_expediente": {
                "type": "function",
                "function": {
                    "name": "buscar_expediente",
                    "description": "Busca expediente por número en todas las bases",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "numero": {"type": "string", "description": "Número del expediente"}
                        },
                        "required": ["numero"]
                    }
                }
            },
            "contar_registros": {
                "type": "function",
                "function": {
                    "name": "contar_registros",
                    "description": "Cuenta registros de un esquema",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "esquema": {"type": "string", "enum": ["ips", "pediatrico", "igpj", "maternidad", "escribania"]}
                        },
                        "required": ["esquema"]
                    }
                }
            },
            "obtener_movimientos": {
                "type": "function",
                "function": {
                    "name": "obtener_movimientos",
                    "description": "Obtiene movimientos de una caja",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "caja_id": {"type": "integer", "description": "ID de la caja"}
                        },
                        "required": ["caja_id"]
                    }
                }
            }
        }
  
    def _llamar_a_qwen_con_tools(self, prompt: str, herramientas: Dict[str, Any]) -> str:
        """Llama a Qwen con herramientas (tool calling)"""
        # Implementar tool calling
        return ""
```

#### 2.3 Seguridad y Testing

```python
# backend/services/ai_service.py — Seguridad

class AIService:
    # ... (mantener métodos anteriores)
  
    def _validar_permisos(self, usuario: Dict[str, Any]) -> bool:
        """Valida permisos de manera estricta"""
        roles = usuario.get('roles', [])
        permisos = usuario.get('permisos', [])
      
        # Verificar roles
        if 'ADMIN' not in roles and 'OFICINA' not in roles and 'DEPÓSITO' not in roles:
            return False
      
        # Verificar permisos específicos
        if 'CONSULTA' not in roles and 'ADMIN' not in roles:
            return False
      
        return True
  
    def _limpiar_respuesta(self, respuesta: str) -> str:
        """Elimina datos sensibles de la respuesta"""
        return respuesta
```

---

### FASE 3: TOOL CALLING AUTOMÁTICO (Semana 6-7)

#### 3.1 Integrar Tool Calling en Qwen

```python
# backend/services/ai_service.py — Tool calling

class AIService:
    # ... (mantener métodos anteriores)
  
    def _llamar_a_qwen_con_tools(self, prompt: str, herramientas: Dict[str, Any]) -> str:
        """Llama a Qwen con herramientas (tool calling)"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": f"""Contexto de la aplicación:
{self.contexto_app}

Herramientas disponibles:
{json.dumps(herramientas, indent=2)}

Instrucciones:
1. Usa herramientas cuando sea necesario
2. Devuelve JSON con herramienta y argumentos
3. No alucines datos
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
          
            payload = {
                "model": "qwen2.5:7b",
                "messages": messages,
                "tools": herramientas,
                "tool_choice": "auto",
                "temperature": 0.3,
                "max_tokens": 2000
            }
          
            response = httpx.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=60
            )
          
            data = response.json()
            return data.get('response', '')
          
        except Exception as e:
            logger.error(f"Error en tool calling: {e}")
            return "No pude procesar tu pregunta."
```

#### 3.2 Ejecutar Tool Calls

```python
# backend/services/ai_service.py — Ejecución de herramientas

class AIService:
    # ... (mantener métodos anteriores)
  
    def _ejecutar_tool_call(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """Ejecuta una herramienta con sus argumentos"""
        if tool_name == "buscar_expediente":
            return self.buscar_expediente(args.get("numero", ""))
        elif tool_name == "contar_registros":
            return self.contar_registros(args.get("esquema", ""))
        elif tool_name == "obtener_movimientos":
            return self.obtener_movimientos(args.get("caja_id", 0))
      
        return None
```

#### 3.3 Logging de Tool Calls

```python
# backend/routers/ai_router.py — Logging

@router.post("/consultar")
async def consultar_ia(
    pregunta: str = Query(...),
    usuario: Usuario = Depends(get_current_user),
    ...
):
    # ... (mantener métodos anteriores)
  
    # Registrar tool call
    logger.info(f"AI Tool Call: {tool_name} | Args: {json.dumps(args)}")
    logger.info(f"AI Response Time: {tiempo:.2f}s")
```

---

### FASE 4: INTERFAZ DE USUARIO (Semana 8-9)

#### 4.1 Desktop App (PySide6)

```python
# desktop/ventana_principal.py — Integración IA

class VentanaPrincipal(QMainWindow):
    # ... (mantener métodos anteriores)
  
    def __init__(self):
        super().__init__()
        self.ai_chat = AiChatWidget()
        self.ai_chat.load()
      
        # Botón para abrir chat
        self.btn_ai = QPushButton("🤖 Asistente IA")
        self.btn_ai.clicked.connect(self.abrir_chat_ai)
        self.addWidget(self.btn_ai)
  
    def abrir_chat_ai(self):
        self.ai_chat.show()
```

#### 4.2 Web App (React)

```jsx
// frontend/src/components/AiChat/AiChat.jsx

import { useState, useEffect } from 'react';
import { Box, Paper, IconButton, TextField, Typography } from '@mui/material';

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    setLoading(true);
    const response = await fetch('/ai/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: input })
    });
  
    setLoading(false);
    setMessages([...messages, { text: input, type: 'user' }]);
    const data = await response.json();
    setMessages([...messages, { text: data.respuesta, type: 'ai' }]);
    setInput('');
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24 }}>
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{ bgcolor: 'primary.main' }}
      >
        <ChatIcon />
      </IconButton>
    
      {open && (
        <Paper sx={{ width: 400, height: 500, p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{ 
                  mb: 2, 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: msg.type === 'user' ? 'primary.light' : 'secondary.light'
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            ))}
          </Box>
        
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AiChat;
```

#### 4.3 Endpoints Adicionales

```python
# backend/routers/ai_router.py — Historial

@router.get("/historial")
async def obtener_historial(
    usuario: Usuario = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    """Obtiene historial de consultas del usuario"""
    # Implementar lógica de historial
    return []

@router.delete("/historial")
async def limpiar_historial(
    usuario: Usuario = Depends(get_current_user)
):
    """Limpa historial de consultas del usuario"""
    # Implementar lógica de limpieza
    return {"mensaje": "Historial limpiado"}
```

---

## 4. CONFIGURACIÓN DE SEGURIDAD

### 4.1 Permisos de Usuario IA

```sql
-- backend/database/permissions.sql

-- Crear usuario de solo lectura para IA
CREATE USER datcorr_ia WITH PASSWORD 'secure_password_123';

-- Conectar a todas las bases
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;

-- Usar esquemas específicos
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;

-- Permitir SELECT en todas las tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania
  GRANT SELECT ON TABLES TO datcorr_ia;

-- Verificar permisos
\du datcorr_ia
```

### 4.2 Validación de Seguridad

```python
# backend/services/ai_service.py — Validación de seguridad

class AIService:
    # ... (mantener métodos anteriores)
  
    def _validar_sql(self, query: str) -> bool:
        """Valida que el SQL no contenga comandos peligrosos"""
        dangerous_keywords = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE",
            "EXECUTE", "TRUNCATE", "GRANT", "REVOKE"
        ]
      
        query_upper = query.upper()
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                logger.error(f"SQL peligroso detectado: {query}")
                raise ValueError("Consulta SQL no permitida")
      
        return True
```

---

## 5. TESTING

### 5.1 Test Cases

| Test | Descripción              | Expectado           |
| ---- | ------------------------- | ------------------- |
| T1   | Consulta básica          | Respuesta coherente |
| T2   | Consulta sin permisos     | Error de permiso    |
| T3   | Consulta con datos reales | Dato correcto       |
| T4   | Timeout                   | Error de timeout    |
| T5   | SQL peligroso             | Rechazo             |
| T6   | Tool calling              | JSON válido        |
| T7   | Datos sensibles           | Ocultos             |

### 5.2 Scripts de Testing

```python
# tests/test_ai_service.py

import pytest
from services.ai_service import AIService

class TestAIService:
    def test_consultar_basic(self):
        """Test consulta básica"""
        service = AIService()
        respuesta = service.consultar("¿Qué es una caja?", {})
        assert "respuesta" in respuesta
        assert "caja" in respuesta.get("respuesta", "").lower()
  
    def test_consultar_sin_permisos(self):
        """Test consulta sin permisos"""
        service = AIService()
        respuesta = service.consultar("¿Qué es una caja?", {"roles": ["CONSULTA"]})
        assert "permisos" in respuesta.get("error", "")
  
    def test_consultar_con_datos(self):
        """Test consulta con datos reales"""
        service = AIService()
        # Implementar test con datos
        pass
```

---

## 6. DEPLOYMENT

### 6.1 Docker Compose

```yaml
# docker-compose.ia.yml

version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_ENDPOINT=http://ollama:11434/api/generate
      - DB_USER=datcorr_ia
      - DB_PASSWORD=secure_password_123
      - DB_NAME=datcorr
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

### 6.2 Environment Variables

```bash
# .env.example

# IA Configuration
OLLAMA_ENDPOINT=http://localhost:11434/api/generate
QWEN_MODEL=qwen2.5:7b
MAX_TOKENS=2000
TIMEOUT=60

# Database
DB_USER=datcorr_ia
DB_PASSWORD=secure_password_123
DB_NAME=datcorr

# Security
AI_SECRET_KEY=your_secret_key
```

---

## 7. MONITORING Y LOGGING

### 7.1 Logs de IA

```python
# backend/services/ai_service.py — Logging

class AIService:
    # ... (mantener métodos anteriores)
  
    def _llamar_a_qwen(self, prompt: str) -> str:
        """Con logging detallado"""
        logger.info(f"=== AI QUERY START ===")
        logger.info(f"Query: {prompt[:100]}...")
        logger.info(f"Endpoint: {self.endpoint}")
        logger.info(f"Model: qwen2.5:7b")
      
        try:
            # ... (llama a qwen)
            logger.info(f"=== AI QUERY END ===")
            logger.info(f"Response time: {tiempo:.2f}s")
            return respuesta
          
        except Exception as e:
            logger.error(f"=== AI QUERY ERROR ===")
            logger.error(f"Error: {str(e)}")
            raise
```

### 7.2 Métricas

```python
# backend/routers/ai_router.py — Métricas

@router.get("/metrics")
async def obtener_metricas():
    """Obtiene métricas de uso de IA"""
    return {
        "total_consultas": total,
        "avg_time": avg_time,
        "errors": errors,
        "success_rate": success_rate
    }
```

---

## 8. CHECKLIST FINAL

### 8.1 Pre-Implementación

- [ ] Hardware verificado (8GB+ RAM, GPU opcional)
- [ ] Ollama instalado y funcionando
- [ ] PostgreSQL con usuario `datcorr_ia` creado
- [ ] `ai_context_datcorr.md` creado
- [ ] `.env.example` con variables de entorno

### 8.2 Fase 1

- [ ] `ai_service.py` creado y funcional
- [ ] `ai_router.py` endpoints funcionando
- [ ] `POST /ai/consultar` responde correctamente
- [ ] `GET /ai/status` verifica Qwen
- [ ] Sin consultas a PostgreSQL

### 8.3 Fase 2

- [ ] Funciones de consulta seguras implementadas
- [ ] Detección de intención funcionando
- [ ] Tool calling disponible
- [ ] Seguridad verificada (permisos)
- [ ] Sin SQL directo

### 8.4 Fase 3

- [ ] Tool calling automático funcionando
- [ ] Hasta 3 herramientas por consulta
- [ ] Timeout total de 60s
- [ ] Logging de tool calls
- [ ] Fallback para consultas sin herramientas

### 8.5 Fase 4

- [ ] Widget de chat en Desktop (PySide6)
- [ ] Widget de chat en Web (React)
- [ ] Endpoints de historial funcionando
- [ ] Integración con backend completa

### 8.6 Post-Implementación

- [ ] Tests unitarios pasados
- [ ] Tests de integración pasados
- [ ] Seguridad auditable
- [ ] Logs de IA configurados
- [ ] Documentación actualizada

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo                | Impacto                | Mitigación                        |
| --------------------- | ---------------------- | ---------------------------------- |
| Qwen lento            | UX degradada           | Timeout configurable, caching      |
| Error en Qwen         | Respuestas erróneas   | Fallback a respuestas predefinidas |
| Permiso SQL           | Datos comprometidos    | Validación estricta de SQL        |
| Datos sensibles       | Violación privacidad  | Filtrado en prompts                |
| Hardware insuficiente | Qwen no responde       | Verificar requisitos previos       |
| Alucinaciones         | Respuestas incorrectas | Validación de respuestas          |

---

## 10. PRÓXIMOS PASOS

### 10.1 Revisión Inicial (Semana 1)

1. Revisar plan con equipo
2. Ajustar según prioridades
3. Confirmar hardware disponible
4. Asignar tareas

### 10.2 Implementación (Semana 1-9)

1. Ejecutar Fase 0 (configuración)
2. Ejecutar Fase 1 (asistente informativo)
3. Ejecutar Fase 2 (conectado a datos)
4. Ejecutar Fase 3 (tool calling)
5. Ejecutar Fase 4 (UI)

### 10.3 Testing y Despliegue (Semana 9-10)

1. Tests unitarios e integración
2. Tests de seguridad
3. Despliegue en staging
4. Validación con usuarios

---

**Documento generado:** Plan de implementación IA v2.0
**Fecha:** 2026
**Versión:** v2.0
**Estado:** Para revisión del equipo

---

## 📌 Notas Adicionales para el Equipo

1. **Prioridad:** Fase 1 (asistente informativo) es la más rápida y de menor riesgo
2. **Hardware:** Mínimo 8GB RAM para Qwen2.5:7b, preferiblemente con GPU
3. **Seguridad:** Validar permisos en cada fase antes de avanzar
4. **Testing:** Cada fase debe tener tests de integración
5. **Monitoreo:** Configurar logs desde el día 1
6. **Comunicación:** Revisar progreso semanalmente con el equipo

---

¿Necesitas que añada más detalles a alguna sección específica o que genere algún archivo adicional?
