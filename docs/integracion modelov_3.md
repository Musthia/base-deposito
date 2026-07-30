
Aquí tienes el **Plan de Ejecución Modificado**, ajustado específicamente para integrar el modelo Qwen 3.5b **únicamente en la aplicación de escritorio (PySide6)**, eliminando cualquier dependencia o desarrollo en la web (React).

---

# 🚀 Plan de Ejecución: Integración Qwen 3.5b en DatCorr (Enfoque Desktop)

**Objetivo:** Implementar un asistente IA local (Qwen 3.5b) integrado en la aplicación de escritorio DatCorr (PySide6), permitiendo consultas informativas y recuperación de datos en tiempo real (Tool Calling) a través del backend FastAPI existente.

**Alcance:**

* **✅ Desktop:** PySide6 (Interfaz principal).
* **✅ Backend:** FastAPI (Puente de comunicación).
* **✅ IA:** Qwen 3.5b (Ollama).
* **❌ Web:** React (Excluido de esta implementación).

---

## 📅 Cronograma de Ejecución (9 Semanas)

### FASE 0: Preparación del Entorno (Semana 1)

**Responsable:** DevOps / Backend

1. **Instalación del Motor IA:**

   * Instalar Ollama en el servidor/deploy.
   * Descargar modelo: `ollama pull qwen3.5`.
   * *Validación:* `ollama run qwen3.5` debe responder correctamente.
2. **Seguridad de Base de Datos (Crítico):**

   * Crear usuario `datcorr_ia` con permisos de **solo lectura**.

```sql
-- Ejecutar en PostgreSQL
CREATE USER datcorr_ia WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE datcorr TO datcorr_ia;
GRANT USAGE ON SCHEMA public, ips, pediatrico, igpj, maternidad, escribania TO datcorr_ia;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, ips, pediatrico, igpj, maternidad, escribania
  GRANT SELECT ON TABLES TO datcorr_ia;
```

3. **Configuración:**
   * Actualizar `.env` con `QWEN_ENDPOINT=http://localhost:11434/api/generate`.

---

### FASE 1: Núcleo del Asistente Informativo (Semanas 2-3)

**Responsable:** Backend
**Entregable:** Backend capaz de responder preguntas conceptuales sobre DatCorr.

1. **Contexto (`ai_context_datcorr.md`):**

   * Documento con definiciones de Caja, Expediente, Roles, etc.
2. **Servicio IA (`ai_service.py`):**

   * Clase `AIService` para conectar con Ollama.
   * Método `consultar(pregunta)` que devuelve respuestas basadas en el contexto.
3. **Router (`ai_router.py`):**

   * Endpoint `POST /ai/consultar`.
   * Endpoint `GET /ai/status`.

---

### FASE 2: Herramientas y Conexión a Datos (Semanas 4-5)

**Responsable:** Backend
**Entregable:** Backend capaz de consultar la base de datos de forma segura.

1. **Herramientas (`ai_tools.py`):**

   * Funciones Python seguras: `buscar_expediente()`, `contar_registros()`, `obtener_movimientos()`.
   * Validación estricta de permisos del usuario antes de ejecutar SQL.
2. **Integración:**

   * Actualizar prompt del sistema para incluir definiciones de herramientas JSON.

---

### FASE 3: Tool Calling Automático (Semanas 6-7)

**Responsable:** Backend
**Entregable:** Backend capaz de decidir y ejecutar herramientas automáticamente.

1. **Lógica de Tool Calling:**
   * Si Qwen detecta una necesidad de datos, devuelve un JSON de llamada a herramienta.
   * El Backend ejecuta la función Python correspondiente.
   * El resultado se devuelve a Qwen para generar la respuesta final.

---

### FASE 4: Integración UI Desktop (PySide6) (Semanas 8-9)

**Responsable:** Frontend / Desktop Dev
**Entregable:** Widget de chat funcional dentro de la app de escritorio.

1. **Desarrollo del Widget (`desktop/ai_chat_widget.py`):**

   * Crear un componente `QDockWidget` o `QMainWindow` independiente para el chat.
   * Interfaz con historial de mensajes (izquierda) y entrada de texto (abajo).
   * Indicador de "Escribiendo..." (spinner).
2. **Integración en `ventana_principal.py`:**

   * Agregar botón de acceso rápido (ej. ícono de chat en la barra de herramientas).
   * Al hacer clic, abrir el widget de chat.
3. **Comunicación:**

   * El widget envía `POST` al backend FastAPI (`http://localhost:8000/ai/consultar`).
   * Manejo de respuestas y errores (ej. "Servicio no disponible").

---

## 🛡️ Protocolo de Seguridad (Obligatorio)

1. **Usuario DB Aislado:** `datcorr_ia` sin permisos de escritura.
2. **No SQL Directo:** Qwen solo solicita herramientas; el Backend ejecuta.
3. **Validación de Roles:** El Backend verifica `nivel_seguridad` del usuario autenticado antes de pasar la consulta a las herramientas.
4. **Aislamiento:** La IA no tiene acceso a credenciales del sistema ni a la lógica interna de PySide6.

---

## 📂 Estructura de Archivos (Modificada)

| Carpeta            | Archivo                            | Acción             | Descripción                               |
| :----------------- | :--------------------------------- | :------------------ | :----------------------------------------- |
| **Backend**  | `services/ai_service.py`         | **Crear**     | Lógica de conexión con Qwen.             |
| **Backend**  | `services/ai_tools.py`           | **Crear**     | Funciones de consulta a DB.                |
| **Backend**  | `services/ai_context_datcorr.md` | **Crear**     | Base de conocimiento.                      |
| **Backend**  | `routers/ai_router.py`           | **Crear**     | Endpoints API (`/ai/consultar`).         |
| **Backend**  | `database/conexion.py`           | **Modificar** | Agregar conexión`datcorr_ia`.           |
| **Desktop**  | `ai_chat_widget.py`              | **Crear**     | **Nuevo:** Widget de chat (PySide6). |
| **Desktop**  | `ventana_principal.py`           | **Modificar** | Integrar botón y apertura del widget.     |
| **Frontend** | *(React)*                        | *(Ignorar)*       | Sin cambios en la web.                     |

---

## ✅ Checklist de Validación

- [ ] **Qwen responde:** El backend procesa preguntas de contexto.
- [ ] **Seguridad DB:** Las herramientas solo devuelven datos permitidos.
- [ ] **Tool Calling:** El backend ejecuta herramientas automáticamente.
- [ ] **UI Desktop:** El widget se abre/cierra correctamente en PySide6.
- [ ] **Comunicación:** Los mensajes fluyen desde PySide6 -> FastAPI -> Qwen -> PySide6.
- [ ] **Web:** La app web sigue funcionando sin la integración de IA (sin cambios).
