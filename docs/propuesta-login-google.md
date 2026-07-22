# Propuesta Técnica — Login con Google (OAuth 2.0) en DatCorr

## Estado: Análisis y Propuesta | Pendiente de ajustes e implementación

---

## 1. Resumen Ejecutivo

El sistema **DatCorr** actualmente autentica usuarios exclusivamente mediante **usuario y contraseña** con JWT (access token de 15 minutos + refresh token de 7 días). El stack es **FastAPI (backend) + React + Vite (frontend) + SQLAlchemy/PostgreSQL**.

Esta propuesta integra **Google Sign-In (OAuth 2.0 / OpenID Connect)** como opción alternativa, manteniendo el flujo existente intacto. Los usuarios podrán elegir entre:

1. **Usuario + contraseña** (flujo actual, sin cambios)
2. **Clic en "Ingresar con Google"** (flujo OAuth 2.0 híbrido)

El resultado final es un **login unificado**: ambos métodos emiten el mismo tipo de JWT interno, por lo que **no se modifica** la lógica de permisos, roles, niveles de seguridad, refresh tokens, auditoría ni ninguna ruta protegida del backend.

---

## 2. Estado Actual del Sistema de Autenticación

### 2.1 Backend (FastAPI)

| Componente     | Detalle                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Router         | `backend/routers/auth_router.py` prefijo `/auth`                                                        |
| Endpoint login | `POST /auth/login`                                                                                        |
| Request        | `{ usuario: str, password: str }`                                                                         |
| Response       | `{ success, usuario, token, refresh_token, mensaje }`                                                     |
| JWT            | `python-jose` HS256                                                                                       |
| Access token   | 15 min de vida                                                                                              |
| Refresh token  | 7 días, guardado en DB + cookie HttpOnly                                                                   |
| Sesión        | Actividad registrada en DB con inactividad de 30 min                                                        |
| Rate limit     | 5 intentos POST por IP en 5 min                                                                             |
| Bloqueo        | 5 intentos fallidos → bloqueo 15 min                                                                       |
| Auditoría     | Tabla`auditoria` (LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT_SUCCESS, TOKEN_INVALID, TOKEN_REUSE_DETECTED, etc.) |
| Base de datos  | SQLAlchemy ORM con PostgreSQL                                                                               |

**Modelo de usuario (tabla `usuarios`):**

| Campo                      | Tipo        | Observación                                                                                        |
| -------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `id`                     | Integer PK  | Auto-incremental                                                                                    |
| `nombre`                 | String(100) | OBLIGATORIO, sin embargo acepta`null` en schema                                                   |
| `apellido`               | String(100) | OBLIGATORIO                                                                                         |
| `usuario`                | String(50)  | UNIQUE, nombre de usuario local                                                                     |
| `password_hash`          | String(255) | UNIQUE -**ese es el campo crítico para login con Google: no es requerido**                   |
| `rol`                    | String(50)  | OBLIGATORIO                                                                                         |
| `nivel_seguridad`        | Integer     | DEFAULT 1                                                                                           |
| `activo`                 | Boolean     | DEFAULT True                                                                                        |
| `es_superusuario`        | Boolean     | DEFAULT False                                                                                       |
| `email`                  | String(255) | UNIQUE, NULLABLE -**campo clave para vincular Google (debe ser único cuando se usa Google)** |
| `bloqueado_hasta`        | TIMESTAMP   | NULLABLE                                                                                            |
| `intentos_fallidos`      | Integer     | DEFAULT 0                                                                                           |
| `ultimo_login`           | TIMESTAMP   | NULLABLE                                                                                            |
| `ultimo_cambio_password` | TIMESTAMP   | NULLABLE                                                                                            |

**Esquema Pydantic (`auth_schema.py`):**

```python
class LoginRequest(BaseModel):
    usuario: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    usuario: Optional[UsuarioLoginResponse] = None
    mensaje: Optional[str] = None
    token: Optional[str] = None
    refresh_token: Optional[str] = None

class UsuarioLoginResponse(BaseModel):
    id: int
    usuario: str
    nombre: str
    apellido: str
    rol: str
    nivel_seguridad: int
    es_superusuario: bool
```

**Servicio de login (`auth_service.py` → `login_usuario`):**

- Busca el usuario por `Usuario.usuario.ilike(usuario)` → obtiene el hash local
- Verifica activo y bloqueo
- Compara `password` con `password_hash` usando `verificar_password(password, password_hash)`
- Genera access token + refresh token
- Guarda refresh token en DB
- Retorna `{ success, usuario, token, refresh_token, jti }`

### 2.2 Frontend (React + Vite)

| Componente   | Detalle                                                           |
| ------------ | ----------------------------------------------------------------- |
| Login activo | `frontend/src/pages/Login.jsx`                                  |
| Store auth   | `frontend/src/auth/authStore.js` (Zustand)                      |
| API client   | `frontend/src/api/axiosClient.js` (Axios + interceptor refresh) |
| Diseño      | Material UI, tema claro/oscuro                                    |
| Routing      | React Router DOM v7                                               |
| Build        | Vite                                                              |

**Login actual (`Login.jsx`):**

- Formulario POST a `/auth/login` con `{ usuario, password }`
- Recibe `res.data.token`, guarda en `sessionStorage`
- Navega a `/dashboard`

---

## 3. Estrategia de Integración — Google OAuth 2.0

### 3.1 Opción seleccionada: **Código de Autorización PKCE (Authorization Code + PKCE)**

Se elige **PKCE** (Proof Key for Code Exchange) sobre el flujo implícito por:

- Mayor seguridad: access token nunca viaja en el fragmento URL
- No requiere `client_secret` en el frontend
- Estándar actual recomendado por Google y OAuth 2.1
- Compatible con SPA (Single Page Applications) en Vite/React

### 3.2 Flujo Híbrido (dos caminos, un resultado)

```
  [Usuario ve pantalla login]
           |
      ┌────┴────┐
      |         |
 Usuario +    [Botón "Ingresar con Google"]
 Contraseña        |
      |            v
      |   [Redirect a Google OAuth 2.0]
      |            |
      |   [Usuario selecciona cuenta Google]
      |            |
      |   [Google redirige a /auth/google/callback?code=...]
      |            |
      v            v
 [POST /auth/login]   [POST /auth/google]
      |            |
      |       [Backend intercambia code por tokens Google]
      |       [Backend busca usuario por email]
      |       [Backend genera JWT interno propio]
      |            |
      +-----+------+
            |
     [Mismo JWT interno DatCorr]
     { token, refresh_token, usuario }
            |
      [Frontend guarda JWT]
      [Navega a /dashboard]
```

### 3.3 Estados de un usuario para el login Google

| Estado                   | email en DB    | `google_id` en DB | Acción                                               |
| ------------------------ | -------------- | ------------------- | ----------------------------------------------------- |
| Ya vinculado             | existe         | existe              | Login automático (es usuario registrado previamente) |
| Vinculación primera vez | existe         | NULL                | boton vincular cuenta google                          |
| Registro nuevo           | NO existe      | —                  | Enviar formulario de alta al administrador            |
| Boton desvicular cuenta  | mantener email | ---                 | proximo ingreso con usuario y contraseña             |

---

## 4. Cambios en el Backend

### 4.1 nueva dependencia

```bash
# requirements.txt (agregar)
google-auth==2.35.0
google-auth-oauthlib==1.2.1
requests==2.32.3
```

### 4.2 Nueva variable de entorno

```bash
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<solo para backend>tu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### 4.3 Modificar `database/modelos.py` — Tabla `usuarios`

Agregar columnas para soportar Google:

```python
google_id = Column(String(255), unique=True, nullable=True, index=True)
google_email = Column(String(255), nullable=True, index=True)
google_name = Column(String(255), nullable=True)
google_picture = Column(String(512), nullable=True)
actualizado_en = Column(TIMESTAMP, onupdate=text("CURRENT_TIMESTAMP"))
```

> **Consideración:** El campo `email` ya existe y es UNIQUE, pero NULLABLE. Se usa como pivote principal para vincular. `google_id` agrega una segunda clave única para evitar duplicados.

### 4.4 Nuevo endpoint: `POST /auth/google`

```
POST /auth/google
Content-Type: application/json

{
  "code": "4/0AX... código de autorización de Google PKCE",
  "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"  // PKCE
}
```

**Procesamiento backend:**

1. Verificar que `code` y `code_verifier` estén presentes.
2. Llamar a `https://oauth2.googleapis.com/token` con:
   - `code`
   - `code_verifier`
   - `client_id`
   - `client_secret` (solo backend)
   - `redirect_uri`
   - `grant_type=authorization_code`
3. Obtener `id_token` (JWT firmado por Google) y `access_token`.
4. Verificar `id_token` usando `google.oauth2.id_token.verify_oauth2_token()`.
5. Extraer del payload:
   - `sub` → `google_id`
   - `email`
   - `name`
   - `picture`
6. Buscar en DB: `SELECT * FROM usuarios WHERE email = <email>`.
7. Si existe:
   - Actualizar `google_id`, `google_email`, `google_name`, `google_picture`.
   - Mantener `password_hash` intacto.
8. Si no existe:
   - Enviar formulario de Alta al sistema y esperar respuesta.

### 4.5 Nuevo endpoint: `GET /auth/google/url`

Devuelve la URL de autorización de Google para que el frontend redirija al usuario:

```python
@router.get("/auth/google/url")
def get_google_auth_url():
    verifier = generate_pkce_verifier()  # 44-128 chars [A-Za-z0-9-._~]
    challenge = base64url_encode(sha256(verifier))
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    state = secrets.token_urlsafe(32)
  
    # Guardar verifier temporalmente (cache o sesión) asociado al state
    pkce_store.set(state, verifier, ttl=600)
  
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid profile email",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return {"url": url, "state": state}
```

### 4.6 Middleware de validación Google (opcional pero recomendado)

En `JWTMiddleware` no es necesario modificar lógica. El usuario Google autenticado tiene un JWT idéntico al de usuario local. **No hay distinción** en el token JWT interno.

Para saber si un usuario entró por Google, se puede agregar un claim opcional:

```python
# En el payload del JWT:
to_encode.update({
    ...
    "auth_provider": usuario_db.google_id and "google" or "local"
})
```

Esto es útil para mostrar "Conectado con Google" en la UI sin consultar DB nuevamente.

### 4.7 Nueva tabla para sesiones vinculadas (opcional)

Si se quiere auditar qué cuentas locales están vinculadas a Google:

```sql
CREATE TABLE google_vinculaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255),
    vinculado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    desvinculado_en TIMESTAMP NULL
);
```

Esta tabla es **opcional** dado que la tabla `usuarios` ya almacena `google_id`.

---

## 5. Cambios en el Frontend

### 5.1 Instalar dependencias

```bash
cd frontend
npm install @google-oauth/google-auth-js  # O solo usar API fetch nativa
```

> **Decisión:** Se recomienda usar `fetch` nativo en lugar de SDK para mantener la SPA liviana y evitar dependencias adicionales. El flujo PKCE se implementa con `crypto.subtle` (Web Crypto API, nativa en navegadores).

### 5.2 Modificar `frontend/src/pages/Login.jsx`

Agregar botón "Ingresar con Google" **después** del formulario tradicional:

```jsx
const [isGoogleLoading, setIsGoogleLoading] = useState(false);

const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
        // 1. Obtener URL de autorización del backend
        const urlRes = await api.get("/auth/google/url");
        const { url, state } = urlRes.data;

        // 2. Guardar state en sessionStorage para validar al volver
        sessionStorage.setItem("google_oauth_state", state);

        // 3. Redirigir a Google
        window.location.href = url;
    } catch (err) {
        setError("Error al iniciar Google Sign-In.");
        setIsGoogleLoading(false);
    }
};
```

En el JSX (dentro de `login-form-panel`):

```jsx
<div className="divider">
    <span>o continúe con</span>
</div>

<button
    type="button"
    className="google-button"
    onClick={handleGoogleLogin}
    disabled={loading || isGoogleLoading}
    aria-label="Ingresar con Google"
>
    <img src="/images/google-icon.svg" alt="" className="google-icon" />
    {isGoogleLoading ? "Conectando..." : "Ingresar con Google"}
</button>
```

**Nota sobre el callback:**

Google redirige a `http://localhost:5173/auth/google/callback?code=...&state=...`.

Se crea un componente `GoogleCallback.jsx` en `frontend/src/pages/GoogleCallback.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuthStore } from "../auth/authStore";

export default function GoogleCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");

    useEffect(() => {
        const procesar = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            // 1. Validar state para evitar CSRF
            const savedState = sessionStorage.getItem("google_oauth_state");
            if (!code || !state || state !== savedState) {
                setError("Sesión de autenticación inválida.");
                sessionStorage.removeItem("google_oauth_state");
                return;
            }
            sessionStorage.removeItem("google_oauth_state");

            // 2. Generar PKCE code_verifier (debe coincidir con el del paso 1)
            const verifier = sessionStorage.getItem("google_code_verifier");
            if (!verifier) {
                setError("Faltan datos de verificación PKCE.");
                return;
            }
            sessionStorage.removeItem("google_code_verifier");

            try {
                const res = await api.post("/auth/google", {
                    code,
                    code_verifier: verifier
                });

                const { token, usuario } = res.data;
                useAuthStore.getState().setTokens(token);

                navigate("/dashboard", { replace: true });
            } catch (err) {
                setError(err.response?.data?.mensaje || "Error al autenticar con Google.");
                setTimeout(() => navigate("/login"), 3000);
            }
        };

        procesar();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="google-callback-error">
                <p>{error}</p>
                <p>Redirigiendo al login...</p>
            </div>
        );
    }

    return (
        <div className="google-callback-loading">
            <div className="spinner" />
            <p>Autenticando con Google...</p>
        </div>
    );
}
```

### 5.3 PKCE Helper — `frontend/src/utils/pkce.js`

```js
export async function generateCodeVerifier(length = 64) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(new Uint8Array(digest));
}

export function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
```

### 5.4 React Router — Agregar callback route

En `frontend/src/router/AppRouter.jsx` (o `main.jsx`):

```jsx
<Route path="/auth/google/callback" element={<GoogleCallback />} />
```

### 5.5 Modificar `authStore.js` — Soportar nuevo payload

El store actual llama a `decodeToken(access)` que usa `jwt-decode`. Si se agrega el claim `auth_provider` en el backend, el store lo decodifica automáticamente sin cambios.

### 5.6 Modificar `axiosClient.js` — Soportar reroute 401 en /auth/google

El interceptor actual detecta 401 en cualquier ruta. No necesita cambios específicos.

---

## 6. Cambios en Base de Datos (Migración SQLAlchemy)

Se debe crear una **migración** en `database/` para agregar las columnas a la tabla `usuarios`.

### 6.1 Archivo migración — `database/migraciones/002_google_login.py`

```python
from database.conexion import engine
from sqlalchemy import text

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE usuarios
                ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
                ADD COLUMN IF NOT EXISTS google_email VARCHAR(255),
                ADD COLUMN IF NOT EXISTS google_name VARCHAR(255),
                ADD COLUMN IF NOT EXISTS google_picture VARCHAR(512),
                ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local',
                ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP;
      
            CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id);
            CREATE INDEX IF NOT EXISTS idx_usuarios_google_email ON usuarios(google_email);
        """))
        conn.commit()

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE usuarios
                DROP COLUMN IF EXISTS google_id,
                DROP COLUMN IF EXISTS google_email,
                DROP COLUMN IF EXISTS google_name,
                DROP COLUMN IF EXISTS google_picture,
                DROP COLUMN IF EXISTS auth_provider,
                DROP COLUMN IF EXISTS actualizado_en;
      
            DROP INDEX IF EXISTS idx_usuarios_google_id;
            DROP INDEX IF EXISTS idx_usuarios_google_email;
        """))
        conn.commit()
```

**Ejecutar en desarrollo:**

```bash
cd C:\data_datcorr
python database/migraciones/002_google_login.py
```

### 6.2 Modificar `database/modelos.py`

Agregar al modelo `Usuario`:

```python
google_id = Column(String(255), unique=True, nullable=True, index=True)
google_email = Column(String(255), nullable=True, index=True)
google_name = Column(String(255), nullable=True)
google_picture = Column(String(512), nullable=True)
auth_provider = Column(String(50), nullable=False, server_default=text("'local'"))
actualizado_en = Column(TIMESTAMP, nullable=True)
```

> **Nota:** `auth_provider` permite distinguir entre `local` (credenciales generadas por el sistema) y `google`. Future-proofing para agregar otros proveedores (Microsoft, GitHub, etc.).

---

## 7. Seguridad

### 7.1 Amenazas cubiertas

| Amenaza                         | Mitigación                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CSRF en callback                | Validación del parámetro`state` almacenado en `sessionStorage`                                                     |
| Código PKCE filtrado           | Code verifier solo existe en memoria del cliente (sessionStorage)                                                        |
| Suplantación de token Google   | Verificación asimétrica de`id_token` con clave pública de Google (no se confía en un token enviado por el cliente) |
| Replay attack                   | PKCE con código de un solo uso + state no reutilizable                                                                  |
| Cuenta comprometida Google      | El usuario puede revocar acceso desde su Google Account sin afectar contraseña local                                    |
| Cuenta vinculada maliciosamente | El admin puede desvincular`google_id` y cambiar contraseña                                                            |

### 7.2 Restricciones recomendadas

- **No** exponer `GOOGLE_CLIENT_SECRET` en el frontend (solo backend)
- **No** almacenar los tokens de Google en DB (solo los datos del perfil)
- **Sí** forzar `https` en producción
- **Sí** validar dominio del correo Google si se requiere (empresarial: `@empresa.com`)
- **Sí** registrar en auditoría cualquier vinculación con Google (evento `GOOGLE_LINK` y `GOOGLE_LOGIN`)

### 7.3 Auditoría adicional

Agregar al `registrar_auditoria`:

```python
accion="GOOGLE_LOGIN"      # Login exitoso con Google
accion="GOOGLE_LINK"       # Cuenta Google vinculada a usuario local
accion="GOOGLE_UNLINK"     # Cuenta Google desvinculada
```

---

## 8. Experiencia de Usuario (UX)

### 8.1 Pantalla de login actualizada

```
┌──────────────────────────────────────────────────────┐
│  [Logo DatCorr]        │    Iniciar sesión            │
│  Digitalización,       │    Usuario                   │
│  archivo y custodia    │    [input]                   │
│                        │                               │
│  ---------------  o continúe con ---------------      │
│                        │    [🔵 Ingresar con Google]  │
│  [Métricas 1, 2, 3, 4]│                               │
│                        │    [Acceder al sistema]       │
│  ● Sistema en línea    │    ¿Olvidó su contraseña?    │
│                        │    Conexión cifrada (TLS)     │
└──────────────────────────────────────────────────────┘
```

### 8.2 Pantalla de perfil — gestión de vinculación

Se debe agregar en la página del usuario la opción de vincular/desvincular Google:

```
Mi Perfil
├── Datos personales
├── Seguridad
│   ├── Solicitar Cambiar contraseña(realizado por admin)
│   └── Vincular cuenta Google  [Desvincular / Vincular]
└── Sesiones activas
```

## 9. Plan de Implementación

### Fase 1 — Backend (semana 1)

1. [X] Crear tabla/migración con columnas Google en `usuarios`
2. [X] Instalar dependencias: `pip install google-auth google-auth-oauthlib requests`
3. [X] Agregar variables de entorno en `.env`
4. [X] Crear servicio auxiliar `backend/services/google_auth_service.py`:
    - `get_google_auth_url(redirect_uri, state)` → URL de autorización
    - `exchange_code_for_tokens(code, code_verifier)` → tokens Google
    - `verify_google_token(id_token)` → validar y decodificar
    - `find_or_create_user(google_profile)` → lógica híbrida
5. [X] Crear router `backend/routers/google_router.py` con endpoints `GET /auth/google/url` y `POST /auth/google`
6. [X] Incluir router en `backend/main.py`
7. [ ] Probar con Postman: `POST /auth/google` con un `code` real de Google

### Fase 2 — Frontend (semana 1-2)

1. [X] Crear `frontend/src/utils/pkce.js` (PKCE helper)
2. [X] Crear `frontend/src/pages/GoogleCallback.jsx`
3. [X] Modificar `frontend/src/pages/Login.jsx`:
    - Agregar botón Google
    - Lógica PKCE + redirect
4. [X] Modificar `frontend/src/router/AppRouter.jsx`:
    - Ruta `/auth/google/callback`
5. [X] Crear estilos para el botón Google (reutilizar `.form-button` base)
6. [ ] Probar flujo completo en dev (http://localhost:5173)

### Fase 3 — Testing y Validación (semana 2)

### Fase 4 — Producción

1. [ ] Configurar Google OAuth 2.0 Client ID en [Google Cloud Console](https://console.cloud.google.com/):
    - Origen autorizado: `https://datcorr.tudominio.com`
    - URI de redireccionamiento: `https://datcorr.tudominio.com/auth/google/callback`
2. [ ] Establecer `GOOGLE_CLIENT_SECRET` en variables de entorno del servidor **NUNCA en `.env` del repo**
3. [ ] Validar desde navegadores reales (Chrome, Safari, Firefox)
4. [ ] Validar versión HTTPs

---

## 10. Preguntas Necesarias para Completar la Propuesta

### 10.1 Configuración

- [ ] **Google OAuth Client ID ya está creado en Google Cloud Console?** Si no, debemos crearlo y configurar orígenes autorizados.
- [ ] **Dominio(s) de producción:** ¿Cuál es la URL desde donde se accederá al sistema? (para configurar `GOOGLE_REDIRECT_URI` correctamente)
- [ ] **Correos institucionales permitidos:** ¿Debe limitarse a usuarios de un dominio específico (ej: `@empresa.com`)? Si es así, ¿cuál es el dominio?

### 10.2 Datos y Perfil

- [ ] **Datos de perfil mínimos requeridos:** ¿Deseamos capturar `picture` (foto de perfil) y `name` completo desde Google, o solo el email es suficiente?
- [ ] **Formato de `usuario` (username local):** Para usuarios Google sin `usuario` local preexistente, ¿deseamos usar `google_sub` como username, o generar uno automáticamente (ej: `gonzalez_juan_01`)?

### 10.3 Vinculación y Gestión

- [ ] **Vínculo obligatorio:** Si un usuario con cuenta local activa ingresa por Google y el email coincide, ¿se vincula automáticamente? ¿Debe pedir confirmación al usuario?
- [ ] **Desvincular:** ¿Se permite al usuario desvincular su Google desde el perfil? ¿O solo admin puede hacerlo?
- [ ] **Usuarios que cierran cuenta Google:** Si un usuario elimina su cuenta de Google, ¿su acceso a DatCorr debe desactivarse automáticamente o permitir con credenciales locales?

### 10.4 Seguridad adicional

- [ ] **Doble factor (2FA):** ¿El login Google se considera 2FA suficiente? ¿O se debe agregar un segundo factor en el flujo local?
- [ ] **Dominio Google Workspace:** ¿Desea limitar acceso a cuentas de un Google Workspace específico? (requiere `hd` parameter en OAuth).

---

## 11. Recomendaciones de Buenas Prácticas

### 11.1 Backend

1. ** nunca** confiar en datos del cliente: siempre validar `id_token` con la librería Google, nunca decodificar manualmente sin verificación de firma.
2. **Rate limiting específico:** El endpoint `/auth/google` debe aplicar el mismo rate limiting que `/auth/login` (5 intentos / 5 min por IP) porque el atacante puede hacer un flood de codes Google.
3. **Auditoría exhaustiva:** Registrar evento `GOOGLE_LOGIN` con `google_id`, `email` y timestamps. Es fundamental para forense en caso de compromiso.
4. **Principal (local) vs Delegado (Google):** Documentar claramente que el password local sigue existiendo y puede asignarse manualmente por el admin. Esto es un respaldo si Google falla o la cuenta se elimina.
5. **Desconexión de servicios de Google:** No revocar tokens de Google al hacer logout de DatCorr. El usuario puede querer usar DatCorr con credenciales locales en otro momento sin re-autenticarse en Google.

### 11.2 Frontend

1. **minimizar estado en sessionStorage:** Solo almacenar `google_code_verifier` y `google_oauth_state` durante el flujo PKCE. Limpiar inmediatamente después del callback (éxito o error).
2. **timeout de callback:** En `GoogleCallback.jsx`, agregar un timeout de 5 minutos por si Google no responde. Mostrar mensaje amigable al usuario.
3. **Skip iframe:** No usar iframes para Google. Debe ser un redirect completo (`window.location.href`) para evitar problemas con cookies de terceros (SameSite, ITP de Safari).
4. **CSS consistente:** Usar variables CSS existentes del Login (`--primary-color`, `--accent-color`). El botón Google debe tener bordes y sombra consistentes.
5. **Error boundary:** Envolver `GoogleCallback.jsx` en un `<ErrorBoundary>` para capturar crashes y redirigir a `/login`.

### 11.3 Google Cloud Console Checklist

1. Crear proyecto con nombre `datcorr-prod` (o similar).
2. Crear credenciales OAuth 2.0 (Tipo: Aplicación Web).
3. Configurar **Orígenes autorizados de JavaScript**: `http://localhost:5173` (dev) y `https://datcorr.tudominio.com` (prod).
4. Configurar **URIs de redireccionamiento autorizados**: `http://localhost:5173/auth/google/callback` (dev) y `https://datcorr.tudominio.com/auth/google/callback` (prod).
5. Agregar alcances Scopes: `openid`, `profile`, `email`.
6. (Opcional) Restricción de dominio Google Workspace: `hd=empresa.com`.
7. Descargar credenciales como JSON (no subir al repo).

### 11.4 Testing

1. **Usuarios nuevos:** Verificar que al hacer login por Google, se cree el usuario, se emita JWT y se pueda acceder a rutas protegidas.
2. **Usuarios existentes:** Verificar que un usuario SQL local que nunca vinculó Google, al hacer login por Google (mismo email), NO se cree uno duplicado sino que se vincule.
3. **Casos extremos:**
   - Google devuelve email no verificado (`email_verified: false`).
   - Google con devuelve `sub` pero sin email (raro, pero posible).
   - Email duplicado entre cuentas locales y Google (dos cuentas locales con emails diferentes, pero una ya está vinculada a ese email).
   - Usuario vinculado previamente elimina su cuenta de Google.
4. **PKCE por navegador:** Verificar en Chrome, Firefox y Safari. `crypto.subtle` tiene buena compatibilidad pero en Safari versions antiguas puede fallar (polyfill con `crypto-js`).

### 11.5 Producción

1. **TLS obligatorio:** Google rechaza URLs `http://` en producción. `GOOGLE_REDIRECT_URI` debe ser `https://`.
2. **Cookie Secure:** En producción, `COOKIE_SECURE=true`. En desarrollo puede seguir siendo `false`.
3. **Variable de entorno `FRONTEND_URL`:** Ya existe para el email de reset. Usar también para construir URLs absolutas en respuesta de Google (si aplica).
4. **Vincular `JWT_SECRET_KEY` al proyecto:** La clave JWT actual (`JWT_SECRET_KEY`) debe ser idéntica entre dev y prod. Un usuario creado en dev con Google no podrá acceder en prod si la clave JWT es distinta (por diseño, son ambientes separados).

---
