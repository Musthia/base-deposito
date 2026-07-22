# Plan de Ejecución: Integración Google OAuth con DatCorr

## 1. Estado Actual del Proyecto (Lo que ya existe)

| Componente | Estado |
|------------|--------|
| DB modelo `Usuarios` | Tiene `google_id` (UNIQUE, nullable) y `google_email` (nullable) |
| Endpoints vinculación | `/auth/vincular-google` y `/auth/desvincular-google` implementados |
| Schema `MeResponse` | Incluye `google_id` y `google_email` |
| Frontend MiCuenta | UI con botón Vincular/Desvincular (usa datos temporales) |
| Altas Pendientes | Página y backend completos (`RegistroPendiente`, API aprobar/rechazar) |
| JWT nativo | Access 15 min + Refresh 7 días, blacklist, JTI, reuse detection |
| Rate limiting | Middleware 5 intentos/5 min en `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| CORS | Configurado para localhost:5173, 4173, 3000 |

---

## 2. Contraste Plan 3 vs Plan 4

| Aspecto | Plan 3 (PKCE Nativo) | Plan 4 (@react-oauth/google) | Evaluación |
|---------|----------------------|------------------------------|------------|
| **Flujo** | Server-side PKCE con crypto.native | Client-side: Google popup → id_token → backend | Plan 4 es más simple y suficiente |
| **Complejidad frontend** | Alta (utils PKCE, callback manual, state validation) | Baja (biblioteca mantiene el flujo) | Plan 4 gana |
| **Dependencias** | Ninguna adicional | `@react-oauth/google` | Plan 4 introduce 1 lib bien mantenida |
| **Duración** | 4 semanas | 2 semanas | Plan 4 es 50% más rápido |
| **Botón Google** | Custom (diseño propio) | Oficial estandarizado | Plan 4 tiene mejor branding |
| **Nuevos usuarios** | Registro automático o vinculación | Flujo a "Altas Pendientes" + aprobación admin | Plan 4 alinea con modelo actual de negocio |
| **Auditoría** | Detallada | `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LOGIN_FAILED`, `GOOGLE_LINK`, `GOOGLE_UNLINK` | Ambos cubiertos |
| **Seguridad** | PKCE puro (estándar máximo) | Library-managed (Google oficial) | Plan 4 es seguro; Google maneja PKCE internamente |
| **Extensibilidad multi-provider** | Alta (diseñado para extender) | Media (orientado a Google) | Plan 3 gana si se planea agregar más providers |

---

## 3. Mejores Opciones Seleccionadas (Híbrido)

Se adopta la **base de Plan 4** (timeline 2 semanas, library `@react-oauth/google`, flujo Altas Pendientes) incorporando elementos clave de Plan 3:

| De Plan 4 (adoptar) | De Plan 3 (incorporar) |
|---------------------|------------------------|
| Timeline 2 semanas | Auditoría detallada con eventos específicos |
| `@react-oauth/google` en frontend | Rate limiting extendido al nuevo endpoint |
| Flujo client-side id_token → backend | CSRF / state validation |
| Nuevo usuario → Altas Pendientes | Validación `email_verified: true` |
| Google Client Secret solo backend | Vinculación/desvinculación ya existe |
| Botón oficial Google | |

---

## 4. Plan de Ejecución

### Fase 1: Backend - Endpoint Google Login + Auditoría (Días 1-3)

**4.1.1 Dependencias Backend**
- Instalar `google-auth` (o `google-auth>=2.x`) en el backend

**4.1.2 Modelo / DB**
- Agregar columna `auth_provider` a `Usuario`:
  - `auth_provider` String(20), default='local', nullable=False
- Agregar columnas complementarias:
  - `google_name` String(255), nullable=True
  - `google_picture` String(512), nullable=True
- *(Nota: `google_id` y `google_email` ya existen)*

**4.1.3 Endpoint nuevo: `POST /auth/google-login`**
```python
@router.post("/google-login", response_model=GoogleLoginResponse)
def google_login(body: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    # 1. Verificar id_token con Google (google.auth)
    # 2. Validar email_verified == True
    # 3. Buscar usuario por google_id
    #    - Si existe: actualizar google_name, google_picture, auth_provider='google', emitir JWT DatCorr
    #    - Si no existe: buscar por email
    #      - Si existe y tiene password_hash: ofrecer vincular o login local
    #      - Si no existe: crear RegistroPendiente y devolver 202 (pending_approval)
```

**4.1.4 Rate limiting**
- Extender `RateLimitMiddleware` para incluir `/auth/google-login`

**4.1.5 Auditoría**
- Eventos: `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LOGIN_FAILED`, `GOOGLE_LINK`, `GOOGLE_UNLINK`

---

### Fase 2: Frontend - Integración Botón Google (Días 4-7)

**4.2.1 Instalar dependencia**
```bash
npm install @react-oauth/google
```

**4.2.2 Configurar `GoogleOAuthProvider`**
- Envolver `App` o `AppRouter` con `GoogleOAuthProvider` usando `GOOGLE_CLIENT_ID`

**4.2.3 Componente `GoogleLoginButton`**
- Reutilizar componente oficial `<GoogleLogin>` de `@react-oauth/google`
- On success: enviar `credential` (id_token) a `/auth/google-login`
- On error: mostrar mensaje amigable

**4.2.4 Integrar en `Login.jsx`**
- Agregar botón Google debajo del formulario tradicional
- Loading state y manejo de errores

**4.2.5 Manejo de respuesta backend**
- Si `200` → guardar tokens y redirigir a `/dashboard`
- Si `202` (pending_approval) → mostrar mensaje: "Solicitud enviada. Un administrador aprobará su acceso."
- Si `400/401` → mostrar error

---

### Fase 3: Flujo Mi Cuenta (Días 8-9)

**4.3.1 Actualizar `MiCuentaPage.jsx`**
- Reemplazar lógica de "temp_google_id" por flujo real:
  1. Usuario hace clic "Vincular cuenta de Google"
  2. Se abre popup Google (`useGoogleLogin`)
  3. Se envía `credential` a `/auth/vincular-google` (backend ya valida google_id real)
- Mostrar datos reales: `google_email`, `google_name`, `google_picture`

**4.3.2 Endpoint backend ajustado**
- El endpoint `/auth/vincular-google` actual recibe `google_id` y `google_email`
- Se agrega validación: si el `google_id` ya está vinculado a otro usuario, rechazar
- *(Ya implementado parcialmente)*

---

### Fase 4: QA y Testing (Días 10-12)

**4.4.1 Casos de prueba**

| Caso | Resultado esperado |
|------|-------------------|
| Login usuario nuevo con Google | 202 Pending Approval, se crea `RegistroPendiente` |
| Login usuario existente con email coincidente y sin password | 202 Pending Approval o vinculación automática |
| Login usuario existente con google_id | 200 OK + JWT DatCorr |
| `email_verified == false` | 400 Bad Request |
| Token inválido / manipulado | 401 Unauthorized |
| Rate limit en /auth/google-login | 429 después de 5 intentos |
| Vincular/desvincular desde Mi Cuenta | Éxito y reflejado en `/auth/me` |
| Usuario bloqueado activo | No puede loguear por Google |

**4.4.2 Pruebas cross-browser**
- Chrome, Firefox, Edge

---

### Fase 5: Producción y Seguridad (Días 13-14)

**4.5.1 Google Cloud Console**
- Proyecto `datcorr-prod`
- URIs autorizadas: `https://tudominio.com` (producción) y `http://localhost:5173` (dev)

**4.5.2 Variables de entorno**
```bash
# Backend (.env)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=...
```

**4.5.3 Seguridad**
- `GOOGLE_CLIENT_SECRET` jamás en código frontend
- `COOKIE_SECURE=true` en producción
- CORS restringido a dominios HTTPS válidos
- HTTPS obligatorio en producción (requerido por Google)

---

## 5. Cambios en Código (Archivos afectados)

### Backend
| Archivo | Cambio |
|---------|--------|
| `database/modelos.py` | Agregar `auth_provider`, `google_name`, `google_picture` |
| `backend/schemas/auth_schema.py` | Agregar `GoogleLoginRequest`, `GoogleLoginResponse`, `GoogleLinkRequest` |
| `backend/routers/auth_router.py` | Agregar `POST /auth/google-login` |
| `backend/services/auth_service.py` | Agregar `login_usuario_google(...)` |
| `backend/middleware/rate_limit_middleware.py` | Incluir `/auth/google-login` |
| `backend/services/auditoria_service.py` | Eventos: `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LOGIN_FAILED`, `GOOGLE_LINK`, `GOOGLE_UNLINK` |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `frontend/src/App.jsx` | Envolver con `GoogleOAuthProvider` |
| `frontend/src/pages/Login.jsx` | Agregar botón Google |
| `frontend/src/pages/MiCuentaPage.jsx` | Flujo real de vinculación Google |
| `frontend/src/api/axiosClient.js` | (Opcional) Manejo específico 202 pending |

### Migración DB
| Archivo | Cambio |
|---------|--------|
| `database/crear_tablas.py` | Agregar nuevas columnas |
| Script SQL | `ALTER TABLE usuarios ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local'` etc. |

---

## 6. Riesgos y Mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Error configuración Google Cloud | Media | Media | Checklist pre-despliegue + Postman |
| Servicios Google caídos | Baja | Media | Login local intacto sigue funcionando |
| `email_verified` false | Media | Baja | Bloquear acceso, solicitar verificación Google |
| Duplicidad email en DB | Media | Media | Validación backend + manejo de vinculación |
| Google bloquea redirect URI | Baja | Media | Monitoreo logs + contacto soporte Google |
| Dependencia `@react-oauth/google` | Baja | Baja | Versionar en package.json, fallback a login local |

---

## 7. Criterios de Éxito

1. Usuario puede loguear con Google en ≤3 clics
2. Login local sigue funcionando sin cambios
3. Usuario nuevo con Google va a "Altas Pendientes"
4. Auditoría registra método de login
5. Vincular/desvincular Google desde Mi Cuenta
6. Rate limiting previene fuerza bruta
7. `GOOGLE_CLIENT_SECRET` no expuesto en frontend

---

## 8. Resumen de Decisión

**Ganador: Plan 4 con mejoras de Plan 3**

Razones:
- Proyecto ya tiene infraestructura de Altas Pendientes → Plan 4 aprovecha esto directamente
- DB ya tiene `google_id` / `google_email` → no requiere migración compleja
- Timeline 2 semanas vs 4 semanas es factible y realista
- Vincular/desvincular ya existe → solo hay que conectar el flujo real
- `@react-oauth/google` reduce riesgo de errores de implementación OAuth
- Seguridad adecuada: Google maneja PKCE, backend valida token firmado

**Tiempo estimado: 2 semanas**  
**Inversión: ~40 horas**  
**Retorno: Login social, reducción fricción, control de acceso empresarial**
