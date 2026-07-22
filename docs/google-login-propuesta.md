# Propuesta: Inicio de Sesión con Google OAuth

## 1. Estado Actual del Sistema de Autenticación

El proyecto actualmente implementa autenticación **local** con credenciales (usuario + contraseña):

| Componente        | Tecnología                                         |
| ----------------- | --------------------------------------------------- |
| Backend framework | FastAPI 0.128.8                                     |
| JWT               | python-jose (HS256, 15 min access / 7 days refresh) |
| Hashing           | bcrypt via passlib                                  |
| Refresh tokens    | HttpOnly cookie + tabla`refresh_tokens`           |
| Frontend auth     | Zustand store + axios interceptors                  |
| Login UI          | Página propia en`/login` con CSS personalizado   |

**No existe ningún mecanismo OAuth/social en el proyecto.**

---

## 2. Arquitectura Propuesta

### 2.1 Flujo General

```
[Usuario] → Click "Iniciar sesión con Google"
         → [Frontend] Google Identity Services muestra el selector de cuentas
         → Google devuelve un ID token (JWT firmado por Google)
         → [Frontend] Envía el ID token a POST /auth/google-login
         → [Backend] Verifica la firma del token con google-auth
         → [Backend] Busca usuario por email en tabla `usuarios`
         →   ¿Existe?  → Emite JWT normal (access + refresh)
         →   ¿No existe? → Crea usuario nuevo con datos de Google
         → [Backend] Devuelve access token (mismo formato que login normal)
         → [Frontend] setTokens() + redirige a /dashboard
```

### 2.2 Compatibilidad con el Sistema Existente

- El JWT emitido es **idéntico** al del login por usuario/contraseña
- El refresh token usa el mismo mecanismo (HttpOnly cookie + tabla `refresh_tokens`)
- Las sesiones existentes no se ven afectadas
- Los permisos y niveles de seguridad se asignan por defecto (nivel 1, rol "consulta")
- El usuario puede usar **ambos métodos** (Google y contraseña) con la misma cuenta (por email)

---

## 3. Cambios en el Backend

### 3.1 Nueva dependencia

**requirements.txt** — agregar:

```
google-auth>=2.38.0
```

### 3.2 Variables de entorno

**.env** — agregar:

```env
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

### 3.3 Nuevo endpoint: `POST /auth/google-login`

**Archivo:** `backend/routers/auth_router.py`

```python
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@router.post("/google-login")
async def google_login(request: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    # 1. Verificar el ID token con Google
    try:
        info = id_token.verify_oauth2_token(
            request.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise DatcorrException("Token de Google inválido", 401)

    email = info.get("email")
    if not email:
        raise DatcorrException("El token de Google no contiene email", 400)

    # 2. Buscar o crear usuario
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        usuario = Usuario(
            nombre=info.get("given_name", ""),
            apellido=info.get("family_name", ""),
            email=email,
            usuario=email.split("@")[0],
            password_hash="GOOGLE_OAUTH",  # No puede loguearse con contraseña
            rol="consulta",
            nivel_seguridad=1,
            activo=True,
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # 3. Generar JWT (misma función que login normal)
    return login_usuario_response(usuario, response, db)
```

### 3.4 Schema de entrada

**Archivo:** `backend/schemas/auth_schema.py`

```python
class GoogleLoginRequest(BaseModel):
    id_token: str
```

### 3.5 Auditoría

- Registrar `GOOGLE_LOGIN_SUCCESS` / `GOOGLE_LOGIN_FAILED` en la tabla de auditoría
- El `detalle` debe incluir `método: google`

---

## 4. Cambios en el Frontend

### 4.1 Nueva dependencia

```bash
npm install @react-oauth/google
```

### 4.2 Envolver app con GoogleOAuthProvider

**Archivo:** `frontend/src/main.jsx`

```jsx
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = createRoot(document.getElementById("root"));
root.render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
);
```

### 4.3 Variable de entorno

**Archivo:** `frontend/.env` (crear si no existe)

```
VITE_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

### 4.4 Botón Google en Login

**Archivo:** `frontend/src/pages/Login.jsx`

Agregar import:

```jsx
import { GoogleLogin } from "@react-oauth/google";
```

Agregar dentro del formulario (después del botón "Iniciar sesión"):

```jsx
<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
    <GoogleLogin
        onSuccess={async (credentialResponse) => {
            try {
                const res = await api.post("/auth/google-login", {
                    id_token: credentialResponse.credential,
                });
                setTokens(res.data.token);
                navigate("/dashboard");
            } catch (err) {
                setError("Error al iniciar sesión con Google");
            }
        }}
        onError={() => setError("Error al autenticar con Google")}
        theme="outline"
        size="large"
        text="signin_with"
    />
</Box>
```

---

## 5. Configuración en Google Cloud Console

Pasos necesarios antes de implementar:

1. Ir a https://console.cloud.google.com
2. Crear un proyecto nuevo o seleccionar uno existente
3. Ir a **APIs & Services → Credentials**
4. Crear **OAuth 2.0 Client ID** (tipo: Web application)
5. Agregar URI redireccionados autorizados:
   - `http://localhost:5173` (desarrollo)
   - `http://localhost:5173/login` (desarrollo)
   - `https://tudominio.com/login` (producción)
6. Copiar el **Client ID** a las variables de entorno
7. Habilitar **Google+ API** o asegurarse de que `people` y `profile` scopes estén disponibles

---

## 6. Consideraciones de Seguridad

| Aspecto                | Detalle                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Verificación de token | Siempre del lado del servidor con`google-auth`                                      |
| ID token expiration    | Google firma tokens con expiración (típicamente 1 hora)                             |
| Replay attacks         | El`nonce` puede implementarse opcionalmente                                         |
| Usuarios sin email     | Google no requiere email verificado — validar`email_verified: true`                |
| Cuentas existentes     | El matching es por**email**. Si el email ya existe, se vincula automáticamente |
| Contraseña local      | Si el usuario se registró con Google, no tiene password — no puede usar login local |

---

## 7. Buenas Prácticas

1. **Nunca confíes en el cliente**: La verificación del token Google debe hacerse **siempre** en el backend. Un token manipulado desde el frontend no pasa la verificación criptográfica.
2. **Usa `email_verified`**: Valida que Google reporte `email_verified: true` antes de crear la cuenta. Evita registros con emails no confirmados.
3. **Misma sesión, mismo JWT**: Reutiliza `crear_token()` y `crear_refresh_token()` exactamente igual que el login normal. La sesión no debe distinguir cómo se autenticó el usuario.
4. **Auditoría**: Registra el método de autenticación (`local` vs `google`) en la auditoría. Ayuda a investigar accesos no autorizados.
5. **Rate limiting**: Aplica el mismo rate limiting al endpoint `/auth/google-login` que al login normal.
6. **Separación de entornos**: Usa un Client ID de Google diferente para desarrollo y producción.
7. **No almacenes el ID token**: El token de Google solo se usa para la verificación inicial. No lo guardes en DB ni en sessionStorage.
8. **Múltiples proveedores**: Diseña el endpoint de forma genérica para poder agregar GitHub, Microsoft, etc. en el futuro. Un campo `auth_provider: "google" | "local"` en la tabla `usuarios` ayuda.
9. **Logout Google**: Si el usuario hace logout, también deberías llamar a `google.accounts.id.disableAutoSelect()` para evitar login automático en la próxima visita.

---

## 8. Preguntas Pendientes para Completar la Implementación

1. **¿Como se registra un nuevo usuario en el sistema?**

   - [X] El registro de nuevos usuarios solo es realizado por el administrador del sistema.
   - [X] Si un usuario es "invitado", no esta registrado en la base de datos aun, debera rellenar un formulario que sera enviado para su aprobacion a la seccion Altas Pendientes, un administrador, el cual le dara el alta y le impondra un rol y un nivel, solo puede hacerlo desde dentro del sistema.
   - [ ] 
2. **¿Necesitamos soporte para múltiples dominios de email?**

   - [X] Cualquier email verificado por Google
3. **¿Qué datos de Google guardamos además del email?**

   - [X] Nombre, apellido
   - [ ] Foto de perfil (requiere columna `avatar_url` en `usuarios`) opcional.
   - [X] Solo email
4. **¿Necesitamos un botón "Desvincular cuenta de Google" en el perfil?**

   - [X] Sí
   - [ ] No
5. **¿Manejamos el caso donde Google devuelve un email sin verificar?** (`email_verified: false`)

   - [X] Rechazamos el login
   - [ ] Permitimos pero marcamos la cuenta
6. **¿Aplicamos el mismo bloqueo por intentos fallidos al login con Google?**

   - [X] Sí (el token de Google puede ser válido, pero la cuenta puede estar bloqueada)
   - [ ] No (confiamos en la autenticación de Google)
7. **¿Necesitamos crear una tabla `auth_providers` para soportar múltiples proveedores en el futuro?**

   - [X] Sí, diseño extensible
   - [ ] No, solo Google por ahora (columna `google_id` en `usuarios`)
8. **¿El botón de Google en el login debe verse antes o después del formulario de credenciales?**

   - [ ] Antes (prioriza login social)
   - [X] Después (mantiene login local como primario)
   - [ ] Lado a lado
9. **¿Boton de desvincular cuenta de google**?

* [X] Boton de desvincular cuenta para ingresos futuros hasta una nueva vinculacion por lo cual podra ingresar nuevamete, si no se encuentra bloqueado, solo con usuario y contraseña
* [X] se mantendra el email en bd para recuperar contraseña
* [ ]
