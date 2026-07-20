# Análisis y Plan de Integración: SIMCO → DatCorr

> **Fecha:** 20/07/2026
> **Autor:** Kilo (análisis automatizado)
> **Propósito:** Documento técnico para revisión con colaboradores. Contiene el análisis real de ambos proyectos y el plan de anexión de SIMCO como módulo/página independiente dentro de DatCorr, sin duplicar frontend ni backend.

---

## 1. Resumen Ejecutivo

SIMCO (Sistema de Manejo de Consultas) es una aplicación FastAPI + React TypeScript independiente, ubicada en `C:\data_datcorr\simco`. DatCorr es el sistema principal (ERP) en `C:\data_datcorr`.

El objetivo es anexar SIMCO a DatCorr para que:

- **Usuarios `consulta` (nivel 1)** accedan **solo a SIMCO**.
- **Usuarios con nivel ≥ 3** accedan a **DatCorr y SIMCO** con las restricciones predefinidas por cada rol.
- Se comparta **una sola instancia de backend, base de datos y autenticación**.
- No se duplique lógica: cada sistema mantiene sus fuentes, pero se eliminan las partes redundantes (auth, users, sesiones).

---

## 2. Análisis Real del Proyecto DatCorr

### 2.1 Stack Tecnológico

| Aspecto                      | Detalle                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **Backend**            | FastAPI (Python), servido en`backend/main.py`                                                |
| **Frontend**           | React 19 + JavaScript (no TypeScript), Vite, MUI v9, Zustand                                   |
| **Router**             | `react-router-dom` v7                                                                        |
| **Base de Datos**      | PostgreSQL (schema`public`), SQLAlchemy 2.0                                                  |
| **Auth**               | JWT (`sub`=username) + refresh token en cookie HttpOnly + blacklist + control de inactividad |
| **Autorización**      | `nivel_seguridad` (int) + `es_superusuario` + permisos granulares (`usuarios_permisos`)  |
| **Estructura Backend** | `routers/`, `services/`, `security/`, `middleware/`, `schemas/`, `database/`       |
| **Puerto dev**         | 5173 (Vite)                                                                                    |

### 2.2 Modelo de Usuario DatCorr

Archivo: `database/modelos.py`

```python
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100))
    apellido = Column(String(100))
    usuario = Column(String(50), unique=True)          # username
    password_hash = Column(String(255))
    rol = Column(String(50))
    nivel_seguridad = Column(Integer, default=1)       # 1=consulta, 3=oficina, 5=deposito, 10=admin
    activo = Column(Boolean, default=True)
    es_superusuario = Column(Boolean, default=False)
    email = Column(String(255), unique=True)
```

### 2.3 Sistema de Permisos Frontend

Archivo: `frontend/src/auth/usePermissions.js`

```javascript
const isAdmin = isSuper || nivel >= 10;
return {
    canViewUsers: isAdmin,
    canViewAuditoria: isAdmin,
    canViewReportes: true,       # visible para todos los logueados
    canCreateUser: isAdmin,
    canEditUser: isAdmin,
    canDeleteUser: isSuper,
    showNivelColumn: isSuper || nivel >= 5,
};
```

### 2.4 Rutas Backend

| Prefijo          | Router                  | Función                                                       |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| `/auth/*`      | `auth_router.py`      | Login, logout, refresh, forgot/reset password, change password |
| `/usuarios/*`  | `usuarios_router.py`  | CRUD usuarios                                                  |
| `/database/*`  | `database_router.py`  | Consulta de bases                                              |
| `/reportes/*`  | `reportes_router.py`  | Reportes y exportación                                        |
| `/dashboard/*` | `dashboard_router.py` | Dashboard ERP                                                  |
| `/roles/*`     | `roles_router.py`     | Listado de roles                                               |
| `/permisos/*`  | `permisos_router.py`  | Permisos granulares                                            |
| `/admin/*`     | `admin_router.py`     | Acciones administrativas                                       |

### 2.5 Rutas Frontend

| Ruta                 | Página        | Acceso   |
| -------------------- | -------------- | -------- |
| `/`                | Login          | Público |
| `/forgot-password` | ForgotPassword | Público |
| `/reset-password`  | ResetPassword  | Público |
| `/dashboard`       | Dashboard      | Privado  |
| `/usuarios`        | UsuariosPage   | Admin    |
| `/reportes`        | ReportesPage   | Todos    |
| `/database`        | DatabasePage   | Todos    |
| `/carga-datos`     | CargaDatosPage | Todos    |
| `/auditoria`       | AuditoriaPage  | Admin    |

### 2.6 Observaciones Clave DatCorr

1. **Middleware JWT global**: `JWTMiddleware` inyecta `request.state.user` en cada request.
2. **Dependencia de BD**: `get_db` en `backend/dependencies.py` entrega sesión SQLAlchemy.
3. **Usuarios activos**: El sistema valida `activo=True` en `jwt_bearer.py`.
4. **Cookie refresh**: Se maneja con `set_refresh_cookie` / `clear_refresh_cookie` en `jwt_manager.py`.
5. **Frontend store**: Zustand en `authStore.js` guarda `access_token` en `sessionStorage["access_token"]`.

---

## 3. Análisis Real del Proyecto SIMCO

### 3.1 Stack Tecnológico

| Aspecto                      | Detalle                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| **Backend**            | FastAPI (Python), servido en`simco/backend/app/main.py`                                     |
| **Frontend**           | React 19 + TypeScript, Vite 5, CSS personalizado (sin MUI), React Context                     |
| **Router**             | `react-router-dom` v7                                                                       |
| **Base de Datos**      | ~~SQLite~~ **PostgreSQL únicamente** (se elimina por completo SQLite), SQLAlchemy 2.0 |
| **Auth**               | JWT propio (`sub`=user_id, `role`, `username`) + refresh en body                        |
| **Autorización**      | `role` string: `admin`, `oficina`, `deposito`, `consulta`                           |
| **Estructura Backend** | `app/api/routes/`, `app/services/`, `app/core/`, `app/db/`, `app/models/`           |
| **Puerto dev**         | 5173 (Vite) —**conflicto con DatCorr**                                                 |
| **WebSocket**          | Sí (`app/api/routes/ws.py`) para notificaciones                                            |

### 3.2 Modelo de Usuario SIMCO (a eliminar)

Archivo: `simco/backend/app/models/user.py`

```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String)        # admin / oficina / deposito / consulta
    is_active = Column(Boolean, default=True)
```

**Este modelo DEBE ELIMINARSE** porque SIMCO usará `database.modelos.Usuario` de DatCorr.

### 3.3 Modelos de Negocio SIMCO

Archivo: `simco/backend/app/models/solicitud.py`

```python
class Solicitud(Base):
    __tablename__ = "solicitudes"
    id = Column(Integer, primary_key=True)
    codigo = Column(String, unique=True)
    tipo_documento = Column(String)
    identificador_documento = Column(String)
    detalle = Column(String)
    estado = Column(String, default="pendiente")    # pendiente / en_proceso / respondida / cancelada
    prioridad = Column(String, default="media")
    destacado = Column(Boolean, default=False)
    verificado = Column(Boolean, default=False)
    archivo_nombre = Column(String, nullable=True)
    creado_por_usuario_id = Column(Integer, ForeignKey("users.id"))  # <-- CAMBIAR a usuarios.id
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
```

Otros modelos:

- `Respuesta` → `respuestas` (ForeignKey a `solicitudes.id` y `users.id`)
- `AuditLog` → `audit_logs` (sin FK a users)
- `Message` → `messages` (ForeignKey a `users.id`)

### 3.4 Servicios SIMCO

| Archivo                  | Función                           | Dependencia        |
| ------------------------ | ---------------------------------- | ------------------ |
| `auth_service.py`      | Login, generate_tokens             | **ELIMINAR** |
| `solicitud_service.py` | Crear solicitud + auditoría       | `user.id`        |
| `respuesta_service.py` | Responder solicitud + auditoría   | `user.id`        |
| `buscar_archivos.py`   | Búsqueda en contenido de archivos | —                 |

### 3.5 Rutas Backend SIMCO

| Prefijo               | Router                | Función                               |
| --------------------- | --------------------- | -------------------------------------- |
| `/auth/*`           | `auth.py`           | Login, refresh                         |
| `/users/*`          | `users.py`          | CRUD usuarios                          |
| `/solicitudes/*`    | `solicitudes.py`    | CRUD solicitudes, archivos, auditoría |
| `/respuestas/*`     | `respuestas.py`     | CRUD respuestas                        |
| `/dashboard/*`      | `dashboard.py`      | Actividad hoy, actividad sistema       |
| `/buscar/*`         | `buscar.py`         | Búsqueda en archivos                  |
| `/notificaciones/*` | `notificaciones.py` | Notificaciones                         |
| `/messages/*`       | `messages.py`       | Mensajería interna                    |
| `/ws/*`             | `ws.py`             | WebSocket notificaciones               |

### 3.6 Frontend SIMCO

Archivo: `simco/frontend/src/routes/AppRouter.tsx`

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route element={<TabProvider><MainLayout /></TabProvider>}>
      <Route path="/dashboard" element={null} />
      <Route path="/solicitudes" element={null} />
      <Route path="/respuestas" element={null} />
      <Route path="/usuarios" element={null} />
      <Route path="/auditoria" element={null} />
    </Route>
  </Routes>
</BrowserRouter>
```

**Problema**: Las rutas empiezan en `/`. Si se sirve bajo `/simco/`, necesitan `basename="/simco"` o redirección.

### 3.7 Sistema de Tokens SIMCO

Archivo: `simco/frontend/src/auth/token.ts`

```typescript
const ACCESS_KEY = "sige_access";
const REFRESH_KEY = "sige_refresh";
```

**Problema**: Claves distintas a DatCorr (`access_token`, `refresh_token`). Deben unificarse.

### 3.8 Sistema de Roles/Menú SIMCO

Archivo: `simco/frontend/src/auth/menu.ts`

```typescript
export type Role = "admin" | "oficina" | "deposito" | "consulta";

export const menuItems: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "oficina", "deposito", "consulta"] },
    { label: "Mensajes", path: "/mensajes", roles: ["admin", "oficina", "deposito"] },
    { label: "Solicitudes", path: "/solicitudes", roles: ["admin", "oficina", "deposito"] },
    { label: "Respuestas", path: "/respuestas", roles: ["admin", "oficina", "deposito"] },
    { label: "Usuarios", path: "/usuarios", roles: ["admin"] },
    { label: "Auditoría", path: "/auditoria", roles: ["admin"] },
];
```

**Observación**: El `consulta` puede ver Dashboard pero no crear solicitudes (restringido en backend).

---

## 4. Arquitectura Propuesta

### 4.1 Diagrama

```
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI (puerto único DatCorr)                  │
│                                                                  │
│  datcorr/backend/main.py                                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Rutas DatCorr                                            │   │
│  │  /auth/*, /usuarios/*, /database/*, /reportes/*, etc.   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Rutas SIMCO (montadas bajo /api/simco)                    │   │
│  │  /api/simco/solicitudes/*                                 │   │
│  │  /api/simco/respuestas/*                                  │   │
│  │  /api/simco/dashboard/*                                   │   │
│  │  /api/simco/buscar/*                                      │   │
│  │  /api/simco/notificaciones/*                              │   │
│  │  /api/simco/messages/*                                    │   │
│  │  /api/simco/ws/*                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Middleware JWT compartido                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Frontends servidos estáticamente (mismo origen)           │   │
│  │  /            → DatCorr SPA (React JS + MUI)              │   │
│  │  /simco/*     → SIMCO SPA (React TS + CSS custom)         │   │
│  │  /api/simco/* → API SIMCO                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐      ┌──────────────────────┐
│  PostgreSQL       │      │  Archivos estáticos  │
│  Schema public    │      │  (uploads SIMCO)     │
│  ├─ usuarios      │      └──────────────────────┘
│  ├─ permisos      │
│  ├─ roles         │
│  ├─ auditoria     │
│  ├─ refresh_tokens│
│  └─ ...           │
│                   │
│  Schema simco     │
│  ├─ solicitudes   │
│  ├─ respuestas    │
│  ├─ audit_logs    │
│  └─ messages      │
└──────────────────┘
```

### 4.2 Estrategia: Multi-SPA Mismo Origen

Se mantienen **dos frontends independientes** servidos desde el mismo servidor FastAPI:

1. **SPA DatCorr** en `/` — React JS + MUI
2. **SPA SIMCO** en `/simco/` — React TS + CSS custom

**Ventajas:**

- Sin conflictos de dependencias (MUI vs CSS puro)
- Sin conflictos de tipado (JS vs TS)
- Evolución independiente de cada frontend
- Un solo servidor, un solo puerto

**Desventajas:**

- Dos builds de Vite
- Necesita sincronización de tokens entre SPAs

### 4.3 Flujo de Autenticación Unificado

```
Login (DatCorr /auth/login)
    │
    ▼
┌─────────────────────────────────────┐
│  Backend valida credenciales        │
│  Usa database.modelos.Usuario       │
│  Genera JWT con claims:             │
│   - sub: username                   │
│   - nivel: nivel_seguridad          │
│   - superusuario: bool              │
│   - jti: token identifier           │
└─────────────────────────────────────┘
    │
    ▼
Access Token → response body + sessionStorage["access_token"]
Refresh Token → HttpOnly cookie (refresh_token)
    │
    ▼
Ambos SPAs leen sessionStorage["access_token"]
SIMCO ya NO genera sus propios tokens
```

---

## 5. Plan de Implementación Detallado

### Fase 1: Backend — Preparar SIMCO para compartir BD

#### 1.1 Crear schema `simco` en PostgreSQL

```sql
CREATE SCHEMA IF NOT EXISTS simco;
```

#### 1.2 Modificar modelos SIMCO para usar schema `simco`

Archivos a modificar:

- `simco/backend/app/models/solicitud.py`
- `simco/backend/app/models/respuesta.py`
- `simco/backend/app/models/audit.py`
- `simco/backend/app/models/message.py`

Cambio en cada modelo:

```python
class Solicitud(Base):
    __tablename__ = "solicitudes"
    __table_args__ = {"schema": "simco"}
    # ... columnas sin cambios
```

#### 1.3 Eliminar modelo `User` de SIMCO

- **Eliminar** `simco/backend/app/models/user.py`
- **Eliminar** importaciones de `app.models.user` en todos los archivos SIMCO

#### 1.4 Adaptar ForeignKeys a `usuarios.id`

En `solicitud.py`, `respuesta.py`, `message.py`:

```python
# Antes:
creado_por_usuario_id = Column(Integer, ForeignKey("users.id"))

# Después:
creado_por_usuario_id = Column(Integer, ForeignKey("usuarios.id"))
```

#### 1.5 Eliminar SQLite por completo — solo PostgreSQL

SIMCO actualmente tiene un `db/session.py` que decide entre SQLite y PostgreSQL según la variable `DB_ENGINE`. Esto se elimina:

```python
# ANTES (simco/backend/app/db/session.py) — ELIMINAR
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite")
if DB_ENGINE == "postgres":
    DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    engine = create_engine(DATABASE_URL)
else:
    DATABASE_URL = "sqlite:///./sige.db"             # ← ELIMINAR
    engine = create_engine(DATABASE_URL, ...)         # ← ELIMINAR
```

**DESPUÉS** — SIMCO apunta al mismo `engine` de DatCorr, **sin alternativa SQLite**:

```python
# simco/backend/app/db/session.py
from database.conexion import engine, SessionLocal
```

**Además:**

- Eliminar archivo `sige.db` (y `sige_orig.db` si existe) del repositorio
- Eliminar variable `DB_ENGINE` de cualquier `.env` de SIMCO
- Eliminar la dependencia de SQLite (`aiosqlite`) de `requirements.txt` de SIMCO si existe
- Verificar que ningún modelo o script importe `sige.db` como fallback

#### 1.6 Eliminar auth y users routers de SIMCO

- **Eliminar** `simco/backend/app/api/routes/auth.py`
- **Eliminar** `simco/backend/app/api/routes/users.py`
- **Eliminar** `simco/backend/app/services/auth_service.py`
- **Eliminar** `simco/backend/app/services/user_service.py` (si existe)

#### 1.7 Adaptar `core/deps.py` para usar `obtener_usuario_actual` de DatCorr

```python
# simco/backend/app/core/deps.py
from backend.security.jwt_bearer import obtener_usuario_actual as datcorr_get_current_user

def get_current_user(credentials=Depends(HTTPBearer()), db=Depends(get_db)):
    usuario = datcorr_get_current_user(credentials)
    return usuario
```

**Nota**: `obtener_usuario_actual` ya abre/cierra su propia sesión, pero para operaciones de escritura en SIMCO necesitamos que la sesión sea la misma. Alternativa: crear un adaptador que retorne el usuario sin sesión, y que cada router obtenga su propia sesión.

#### 1.8 Adaptar RBAC de SIMCO a `nivel_seguridad`

Archivo: `simco/backend/app/core/rbac.py`

```python
from fastapi import HTTPException

# Mapeo SIMCO → DatCorr
SIMCO_ROLES = {
    "consulta": 1,
    "oficina": 3,
    "deposito": 5,
    "admin": 10,
}

def require_simco_roles(*allowed_roles):
    min_nivel = min(SIMCO_ROLES[r] for r in allowed_roles)
  
    def wrapper(user):
        if user.es_superusuario:
            return user
        if user.nivel_seguridad < min_nivel:
            raise HTTPException(403, "No tienes permisos para esta acción")
        return user
    return wrapper
```

#### 1.9 Actualizar todas las referencias a `user.role` en SIMCO

En `solicitudes.py`, `respuestas.py`, `dashboard.py`, etc.:

```python
# Antes:
if user.role == "consulta":

# Después:
if user.nivel_seguridad == 1:
```

O mejor, usar el mapeo:

```python
from app.core.rbac import SIMCO_ROLES

def get_nivel(user):
    if user.es_superusuario:
        return 10
    return user.nivel_seguridad
```

### Fase 2: Backend — Montar SIMCO en DatCorr

#### 2.1 Modificar `datcorr/backend/main.py`

```python
from simco.backend.app.api.routes.solicitudes import router as simco_solicitudes_router
from simco.backend.app.api.routes.respuestas import router as simco_respuestas_router
from simco.backend.app.api.routes.dashboard import router as simco_dashboard_router
from simco.backend.app.api.routes.buscar import router as simco_buscar_router
from simco.backend.app.api.routes.notificaciones import router as simco_notificaciones_router
from simco.backend.app.api.routes.messages import router as simco_messages_router

app.include_router(simco_solicitudes_router, prefix="/api/simco")
app.include_router(simco_respuestas_router, prefix="/api/simco")
app.include_router(simco_dashboard_router, prefix="/api/simco")
app.include_router(simco_buscar_router, prefix="/api/simco")
app.include_router(simco_notificaciones_router, prefix="/api/simco")
app.include_router(simco_messages_router, prefix="/api/simco")
```

#### 2.2 Servir frontend SIMCO estático

En `datcorr/backend/main.py`, después de incluir routers:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

simco_dist = os.path.join("simco", "frontend", "dist")
if os.path.isdir(simco_dist):
    app.mount("/simco/assets", StaticFiles(directory=os.path.join(simco_dist, "assets")), name="simco_assets")

    @app.get("/simco/{full_path:path}")
    async def serve_simco(request: Request, full_path: str):
        file_path = os.path.join(simco_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(simco_dist, "index.html"))
```

#### 2.3 Adaptar WebSocket de SIMCO

El WebSocket de SIMCO usa `get_current_user` propio. Debe adaptarse para usar el JWT de DatCorr y validar `nivel_seguridad`.

### Fase 3: Frontend — Unificar Experiencia

#### 3.1 Modificar `simco/frontend/src/auth/token.ts`

```typescript
// Antes:
const ACCESS_KEY = "sige_access";
const REFRESH_KEY = "sige_refresh";

// Después:
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
```

#### 3.2 Modificar API client de SIMCO

Crear/modificar `simco/frontend/src/api/client.ts`:

```typescript
import axios from "axios";

export const api = axios.create({
    baseURL: "/api/simco",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

#### 3.3 Adaptar `AppRouter.tsx` de SIMCO

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore"; // o getUser de SIMCO

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = sessionStorage.getItem("access_token");
    if (!token) return <Navigate to="/simco/" replace />;
    return <>{children}</>;
}

export default function AppRouter() {
    return (
        <BrowserRouter basename="/simco">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
          
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={null} />
                    <Route path="/solicitudes" element={null} />
                    <Route path="/respuestas" element={null} />
                    <Route path="/usuarios" element={null} />
                    <Route path="/auditoria" element={null} />
                    <Route path="/mensajes" element={null} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
```

#### 3.4 Adaptar menú de SIMCO a `nivel_seguridad`

En `simco/frontend/src/auth/menu.ts`:

```typescript
import { getUser } from "./user";

export type Role = "admin" | "oficina" | "deposito" | "consulta";

export interface MenuItem {
    label: string;
    path: string;
    roles: Role[];
}

export const menuItems: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "oficina", "deposito", "consulta"] },
    { label: "Mensajes", path: "/mensajes", roles: ["admin", "oficina", "deposito"] },
    { label: "Solicitudes", path: "/solicitudes", roles: ["admin", "oficina", "deposito"] },
    { label: "Respuestas", path: "/respuestas", roles: ["admin", "oficina", "deposito"] },
    { label: "Usuarios", path: "/usuarios", roles: ["admin"] },
    { label: "Auditoría", path: "/auditoria", roles: ["admin"] },
];

export const getFilteredMenu = (): MenuItem[] => {
    const user = getUser();
    if (!user) return [];
  
    // Decodificar nivel desde el JWT de DatCorr
    const payload = JSON.parse(atob(user.token.split(".")[1]));
    const nivel = payload.nivel || 1;
    const esSuper = payload.superusuario || false;
  
    // Mapeo de nivel a rol SIMCO
    let role: Role = "consulta";
    if (esSuper || nivel >= 10) role = "admin";
    else if (nivel >= 5) role = "deposito";
    else if (nivel >= 3) role = "oficina";
  
    return menuItems.filter(item => item.roles.includes(role));
};
```

#### 3.5 Modificar Sidebar de SIMCO

```tsx
import { getFilteredMenu } from "../auth/menu";

export default function Sidebar() {
    const menu = getFilteredMenu();
    // ... renderizar menu filtrado
}
```

#### 3.6 Agregar enlace a SIMCO en Sidebar de DatCorr

En `datcorr/frontend/src/layouts/Sidebar.jsx`:

```javascript
const menu = [
    { label: "Dashboard", path: "/dashboard" },
    ...(perms.canViewUsers ? [{ label: "Usuarios", path: "/usuarios" }] : []),
    { label: "Consultar Bases", path: "/database" },
    { label: "Carga de Datos", path: "/carga-datos" },
    ...(perms.canViewAuditoria ? [{ label: "Auditoria", path: "/auditoria" }] : []),
    ...(perms.canViewReportes ? [{ label: "Reportes", path: "/reportes" }] : []),
    // Siempre visible SIMCO si tiene nivel >= 1
    { label: "SIMCO", path: "/simco/dashboard" },
];
```

#### 3.7 Actualizar `usePermissions.js` de DatCorr

```javascript
export const usePermissions = () => {
    const user = useAuthStore((s) => s.user);
    if (!user) {
        return {
            canViewUsers: false,
            canViewAuditoria: false,
            canViewReportes: false,
            canViewDatcorr: false,
            canViewSimco: false,
        };
    }

    const nivel = user.nivel ?? 0;
    const isSuper = user.superusuario ?? false;
    const isAdmin = isSuper || nivel >= 10;

    return {
        canViewUsers: isAdmin,
        canViewAuditoria: isAdmin,
        canViewReportes: true,
        canViewDatcorr: nivel >= 3,
        canViewSimco: nivel >= 1,
        canCreateUser: isAdmin,
        canEditUser: isAdmin,
        canDeleteUser: isSuper,
        showNivelColumn: isSuper || nivel >= 5,
        showRolColumn: true,
    };
};
```

#### 3.8 Redirección automática en MainLayout de DatCorr

Si usuario no tiene acceso a DatCorr, redirigir a SIMCO:

```javascript
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePermissions } from "../auth/usePermissions";

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const perms = usePermissions();
  
    useEffect(() => {
        if (!perms.canViewDatcorr && !location.pathname.startsWith("/simco")) {
            navigate("/simco/dashboard", { replace: true });
        }
    }, [perms.canViewDatcorr, location.pathname]);
  
    useIdleTimeout();
    // ...
}
```

### Fase 4: Build y Despliegue

#### 4.1 Scripts de build unificados

En `C:\data_datcorr\package.json`:

```json
{
  "scripts": {
    "build:simco": "cd simco/frontend && npm ci && npm run build",
    "build:datcorr": "cd frontend && npm ci && npm run build",
    "build:all": "npm run build:simco && npm run build:datcorr",
    "dev:simco": "cd simco/frontend && npm run dev -- --port 5174",
    "dev:datcorr": "cd frontend && npm run dev",
    "dev:backend": "cd backend && python main.py"
  }
}
```

#### 4.2 Migración de base de datos

```sql
-- 1. Crear schema
CREATE SCHEMA IF NOT EXISTS simco;

-- 2. Migrar tablas SIMCO (después de modificar modelos con schema="simco")
-- Las tablas se crean automáticamente con SQLAlchemy create_all

-- 3. Migrar datos existentes si hay
INSERT INTO simco.solicitudes SELECT * FROM solicitudes;
INSERT INTO simco.respuestas SELECT * FROM respuestas;
-- etc.
```

#### 4.3 Variables de entorno — eliminar todo rastro de SQLite

En `simco/backend/.env` (eliminar o unificar con `backend/.env`):

```env
# ❌ ELIMINAR TODO:
# DB_ENGINE=sqlite
# DATABASE_URL=sqlite:///./sige.db
# POSTGRES_URL=...
# (usar la conexión PostgreSQL de DatCorr)

# ✅ MANTENER solo lo necesario:
PUBLIC_URL=https://tu-dominio.com
```

**En los archivos de configuración**, asegurarse de que no quede ninguna referencia:

- `simco/backend/app/core/config.py` — revisar que no tenga defaults SQLite
- `simco/backend/app/db/init_db.py` — no debe crear tablas con engine SQLite
- `simco/requirements.txt` — eliminar `aiosqlite`, `sqllite3` si están
- `simco/backend/.env.production` — no debe tener variables SQLite

---

## 6. Matriz de Acceso por Rol/Nivel

| Nivel | Rol SIMCO | DatCorr               | SIMCO                          | Acciones SIMCO                   |
| ----- | --------- | --------------------- | ------------------------------ | -------------------------------- |
| 1     | consulta  | ❌ Bloqueado          | ✅ Solo lectura                | Ver dashboard, buscar            |
| 3     | oficina   | ✅ Lectura/operación | ✅ Lectura + crear solicitudes | Crear solicitudes, ver panel     |
| 5     | deposito  | ✅ Operación         | ✅ Lectura + responder         | Responder solicitudes, verificar |
| 10    | admin     | ✅ Completo           | ✅ Completo                    | Todos los módulos               |

---

## 7. Archivos a Modificar/Eliminar

### Backend DatCorr (modificar)

| Archivo                                 | Cambio                                           |
| --------------------------------------- | ------------------------------------------------ |
| `backend/main.py`                     | Montar routers SIMCO + servir frontend estático |
| `frontend/src/auth/usePermissions.js` | Agregar`canViewSimco`, `canViewDatcorr`      |
| `frontend/src/layouts/MainLayout.jsx` | Redirección a SIMCO si nivel < 3                |
| `frontend/src/layouts/Sidebar.jsx`    | Agregar sección SIMCO en menú                  |

### Backend SIMCO (modificar)

| Archivo                                       | Cambio                                           |
| --------------------------------------------- | ------------------------------------------------ |
| `backend/app/main.py`                       | Eliminar (funcionalidad pasa a DatCorr)          |
| `backend/app/db/session.py`                 | Usar engine de DatCorr                           |
| `backend/app/db/base.py`                    | Agregar schema="simco" a modelos                 |
| `backend/app/core/deps.py`                  | Usar`obtener_usuario_actual` de DatCorr        |
| `backend/app/core/rbac.py`                  | Adaptar a`nivel_seguridad`                     |
| `backend/app/core/audit.py`                 | Unificar con auditoría DatCorr                  |
| `backend/app/models/user.py`                | **ELIMINAR**                               |
| `backend/app/models/solicitud.py`           | Agregar schema + cambiar FK a`usuarios.id`     |
| `backend/app/models/respuesta.py`           | Agregar schema + cambiar FK                      |
| `backend/app/models/message.py`             | Agregar schema + cambiar FK                      |
| `backend/app/models/audit.py`               | Agregar schema                                   |
| `backend/app/services/auth_service.py`      | **ELIMINAR**                               |
| `backend/app/services/solicitud_service.py` | Cambiar`user.role` → `user.nivel_seguridad` |
| `backend/app/services/respuesta_service.py` | Cambiar`user.role` → `user.nivel_seguridad` |
| `backend/app/api/routes/auth.py`            | **ELIMINAR**                               |
| `backend/app/api/routes/users.py`           | **ELIMINAR**                               |

### Frontend SIMCO (modificar)

| Archivo                               | Cambio                                                         |
| ------------------------------------- | -------------------------------------------------------------- |
| `frontend/src/routes/AppRouter.tsx` | Agregar`basename="/simco"` + `ProtectedRoute`              |
| `frontend/src/auth/token.ts`        | Cambiar claves a`access_token`/`refresh_token`             |
| `frontend/src/auth/menu.ts`         | Adaptar filtrado por`nivel_seguridad`                        |
| `frontend/src/auth/user.ts`         | Adaptar decodificación a JWT DatCorr                          |
| `frontend/src/layouts/Sidebar.tsx`  | Usar menú filtrado por nivel                                  |
| `frontend/src/pages/Login.tsx`      | (Opcional) redirigir a`/` de DatCorr o mantener login propio |

---

## 8. Riesgos y Mitigaciones

| Riesgo                                                                    | Impacto | Mitigación                                                                      |
| ------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| ForeignKeys rotos al cambiar`users.id` → `usuarios.id`               | Alto    | Hacer migración de datos antes de eliminar modelo`User`                       |
| Tokens no sincronizados entre SPAs                                        | Alto    | Usar misma key`access_token` en ambos frontends                                |
| **SQLite residual** (código o scripts que referencien `sige.db`) | Alto    | Busqueda global con`grep -r "sige.db\|sqlite\|SQLite\|DB_ENGINE"` y eliminar todo |
| Conflictos de rutas`/simco/*`                                           | Medio   | Verificar que no haya rutas DatCorr que empiecen con`/simco`                   |
| WebSocket de SIMCO requiere adaptación                                   | Medio   | Usar mismo JWT, validar`nivel_seguridad` en conexión WS                       |
| CORS entre SPAs                                                           | Bajo    | Mismo origen, no hay CORS                                                        |
| TypeScript en SIMCO vs JS en DatCorr                                      | Bajo    | Builds independientes, sin conflicto                                             |

---

---

## 10. Próximos Pasos

1. ✅ Revisar este documento con el equipo y ajustar según feedback
2. **Paso 0:** **Eliminar SQLite completamente**
   - Buscar `sige.db`, `sige_orig.db`, `sqlite`, `SQLite`, `DB_ENGINE` en todo `simco/`
   - Eliminar `db/init_db.py` si usa engine SQLite
   - Eliminar archivos `.db` del repositorio y agregar `*.db` a `.gitignore`
   - Eliminar `aiosqlite` de `requirements.txt`
   - Verificar que ningún import o script use `sqlite:///`
3. **Paso 1:** Crear schema `simco` en PostgreSQL
4. **Paso 2:** Modificar modelos SIMCO con `schema="simco"` y cambiar FKs a `usuarios.id`
5. **Paso 3:** Eliminar modelo `User`, auth y users de SIMCO
6. **Paso 4:** Adaptar `deps.py`, `rbac.py` y servicios SIMCO a `nivel_seguridad`
7. **Paso 5:** Montar routers SIMCO en `datcorr/backend/main.py` bajo `/api/simco`
8. **Paso 6:** Configurar serving de frontend SIMCO bajo `/simco/` en `main.py`
9. **Paso 7:** Adaptar frontend SIMCO (`token.ts`, `AppRouter.tsx`, menús)
10. **Paso 8:** Adaptar frontend DatCorr (`Sidebar.jsx`, `usePermissions.js`, `MainLayout.jsx`)
11. **Paso 9:** Pruebas de integración (login único, navegación, permisos por rol)
12. **Paso 10:** Ajustes finales y despliegue

---
