# Plan de Ejecucion — Google OAuth en DatCorr

## Analisis Comparativo: Plan 3 vs Plan 4

| Aspecto | Plan 3 (PKCE + Code Flow) | Plan 4 (Implicit / GIS) | Eleccion |
|---|---|---|---|
| Flujo OAuth | Authorization Code + PKCE (redirect) | Google Identity Services (popup, id_token directo) | **Plan 4** — mas simple, Google recomienda GIS |
| Frontend | `pkce.js` manual con `crypto.subtle` | `@react-oauth/google` (componentes prontos) | **Plan 4** — menos codigo, mantenido por Google |
| Backend | `google-auth` + exchange code por tokens | `google-auth` verificacion directa del id_token | **Empate** — misma libreria |
| Seguridad | PKCE + state parameter + rate limiting | CSRF por token efimero + rate limiting | **Plan 3** ligeramente superior, pero GIS ya maneja CSRF |
| Tiempo estimado | ~4 semanas | ~2 semanas | **Plan 4** — 2x mas rapido |
| Vinculacion/Desvinculacion | No detallado | Si, explícito en perfil | **Plan 4** — ya implementado |
| Auth provider field | `auth_provider` en DB | `auth_provider` en DB | **Ambos** — mismo campo |
| Auditoria eventos | No detallado | `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LOGIN_FAILED`, `GOOGLE_LINK`, `GOOGLE_UNLINK` | **Plan 4** mas completo |

## Estado Actual del Proyecto (Scaffolding existente)

| Componente | Estado |
|---|---|
| Columnas `google_id`, `google_email` en modelo Usuario | ✅ Listo |
| `POST /auth/vincular-google` endpoint | ✅ Listo |
| `POST /auth/desvincular-google` endpoint | ✅ Listo |
| `MeResponse` con `google_id`, `google_email` | ✅ Listo |
| `VincularGoogleRequest` schema | ✅ Listo |
| `MiCuentaPage.jsx` (UI vinculacion/desvinculacion) | ✅ Listo (simulado, falta flujo OAuth real) |
| Ruta `/mi-cuenta` + sidebar link | ✅ Listo |
| **Auth provider field** | ❌ No implementado |
| **POST /auth/google-login** (verificacion + login) | ❌ No implementado |
| **GoogleLoginRequest schema** | ❌ No implementado |
| **google-auth en requirements** | ❌ No instalado |
| **google_auth_service.py** | ❌ No creado |
| **GoogleOAuthProvider + GoogleLogin button** | ❌ No implementado |
| **@react-oauth/google package** | ❌ No instalado |
| **Auditoria Google events** | ❌ No registrado |
| **.env variables (GOOGLE_CLIENT_ID, etc.)** | ❌ No configurado |
| **Google Cloud Console OAuth credentials** | ❌ No creado |

## Recomendacion: Plan 4 (implementacion rapida con GIS)

**Motivos:**
1. Ya tenemos ~40% del trabajo hecho (vincular/desvincular, DB columns, MiCuentaPage)
2. `@react-oauth/google` reduce drásticamente el codigo frontend
3. Google Identity Services es el approach moderno recomendado por Google
4. Tiempo estimado: ~1-2 semanas vs 4 semanas de PKCE
5. La vinculacion manual ya esta implementada — solo falta el login por Google

---

## Plan de Ejecucion (1-2 Semanas)

### Fase 0 — Google Cloud Console (Dia 1)

| Tarea | Detalle |
|---|---|
| Crear proyecto `datcorr-prod` en Google Cloud Console | Consola > Nuevo Proyecto |
| Configurar pantalla de consentimiento OAuth | Tipo: Externa, solo email+perfil scopes |
| Crear credencial OAuth 2.0 (Aplicacion Web) | Origenes JS autorizados: `http://localhost:5173`, `http://localhost:3000` |
| Anotar Client ID y Client Secret | Guardar en lugar seguro |
| Configurar `.env` | `GOOGLE_CLIENT_ID=xxx`, `GOOGLE_CLIENT_SECRET=xxx` en backend `.env` |
| Configurar `frontend/.env` | `VITE_GOOGLE_CLIENT_ID=xxx` |
| Agregar orígenes de produccion | Cuando se defina dominio, agregarlos |

### Fase 1 — Backend: Auth Provider y Token Verification (Dias 2-3)

| Tarea | Archivos | Detalle |
|---|---|---|
| 1. Agregar `auth_provider` al modelo Usuario | `database/modelos.py` | `Column(String(20), default='local')` |
| 2. Instalar `google-auth` | `requirements.txt` | `google-auth>=2.38.0` |
| 3. Crear `GoogleLoginRequest` schema | `backend/schemas/auth_schema.py` | `{ id_token: str }` |
| 4. Crear `google_auth_service.py` | `backend/services/google_auth_service.py` | `verificar_token_google(id_token)` → payload decodificado |
| 5. Crear endpoint `POST /auth/google-login` | `backend/routers/auth_router.py` | Verificar token, buscar usuario por email, crear si no existe (con estado pendiente), emitir JWT |
| 6. Agregar auditoria de eventos Google | `backend/routers/auth_router.py` + `AuditoriaPage.jsx` | `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LOGIN_FAILED`, `GOOGLE_LINK`, `GOOGLE_UNLINK` (agregar colores y labels) |
| 7. Agregar rate limiting al endpoint Google | `backend/middleware/` o decorador | Max 5 intentos por IP en 5 minutos |
| 8. Actualizar `vincular-google` con auditoria | `backend/routers/auth_router.py` | Llamar `registrar_auditoria(accion="GOOGLE_LINK")` |
| 9. Actualizar `desvincular-google` con auditoria | `backend/routers/auth_router.py` | Llamar `registrar_auditoria(accion="GOOGLE_UNLINK")` |
| 10. Actualizar `MeResponse` con `auth_provider` | `backend/schemas/auth_schema.py` | `auth_provider: Optional[str] = None` |

### Fase 2 — Frontend: Login con Google (Dias 4-6)

| Tarea | Archivos | Detalle |
|---|---|---|
| 1. Instalar `@react-oauth/google` | `package.json` | `npm install @react-oauth/google` |
| 2. Envolver App en `GoogleOAuthProvider` | `frontend/src/main.jsx` | `<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>` |
| 3. Agregar boton Google en Login.jsx | `frontend/src/pages/Login.jsx` | `<GoogleLogin onSuccess={...} onError={...} />` debajo del formulario local, separador "o" |
| 4. Llamar a `/auth/google-login` con id_token | Login.jsx handler | `onSuccess` → enviar `{ id_token }` → recibir JWT DatCorr |
| 5. Manejo de error Google | Login.jsx | Si email ya existe con otro metodo → fusionar cuentas. Si email no verificado → rechazar. |
| 6. Redirigir nuevos usuarios a altas-pendientes | Login.jsx + backend | Backend devuelve `es_nuevo: true` → frontend muestra mensaje "Sera notificado cuando un admin apruebe su acceso" |
| 7. Actualizar MiCuentaPage con flujo OAuth real | `MiCuentaPage.jsx` | Reemplazar `handleVincular` simulado por Google OAuth popup real con `useGoogleLogin` |
| 8. Agregar `authProviderService` o similar | `frontend/src/services/` | Endpoint helper para google-login |

### Fase 3 — QA y Ajustes (Dias 7-8)

| Tarea | Detalle |
|---|---|
| Probar login con Google (usuario existente) | Email coincide con usuario local → login exitoso |
| Probar login con Google (nuevo usuario) | Email no registrado → va a altas-pendientes |
| Probar vincular Google desde MiCuenta | Popup Google → vinculacion real |
| Probar desvincular Google | Se borra `google_id` → login solo con password |
| Probar email no verificado | Token sin `email_verified` → rechazo |
| Probar rate limiting | 5+ intentos fallidos → bloqueo temporal |
| Verificar eventos en AuditoriaPage | `GOOGLE_LOGIN_SUCCESS`, `GOOGLE_LINK`, etc. visibles con colores y labels |
| Build frontend y verificar | `npx vite build` sin errores |
| Probar servidor backend | `uvicorn backend.main:app --reload` sin errores |

---

## Resumen de Cambios por Archivo

### Backend
| Archivo | Cambio |
|---|---|
| `database/modelos.py` | Agregar columna `auth_provider` |
| `database/crear_tablas.py` | Migracion: ALTER TABLE usuarios ADD COLUMN auth_provider |
| `backend/schemas/auth_schema.py` | Agregar `GoogleLoginRequest`, `auth_provider` en `MeResponse` |
| `backend/services/google_auth_service.py` | **NUEVO**: verificar token Google con `google-auth` |
| `backend/routers/auth_router.py` | Agregar `POST /auth/google-login`, auditoria en vincular/desvincular |
| `backend/main.py` | Sin cambios (router ya registrado) |
| `requirements.txt` | Agregar `google-auth>=2.38.0` |
| `.env` | Agregar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

### Frontend
| Archivo | Cambio |
|---|---|
| `main.jsx` | Envolver en `GoogleOAuthProvider` |
| `Login.jsx` | Agregar boton `GoogleLogin` + separador + handler |
| `MiCuentaPage.jsx` | Reemplazar vincular simulado con OAuth real |
| `AuditoriaPage.jsx` | Agregar colores/labels para eventos Google |
| `package.json` | Agregar `@react-oauth/google` |
| `frontend/.env` | **NUEVO**: `VITE_GOOGLE_CLIENT_ID=xxx` |
