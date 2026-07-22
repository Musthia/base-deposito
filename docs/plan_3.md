
3.1 Estado Actual
✅ Sistema de autenticación local (usuario + contraseña) funciona
✅ Stack tecnológico: FastAPI + React + Vite
✅ JWT con 15 min access + 7 días refresh
❌ Sin integración social/OAuth
3.2 Objetivo
Integrar Login con Google como opción alternativa, manteniendo el login tradicional intacto. Mismo JWT interno para ambos métodos.

3.3 Beneficios para el Negocio
Beneficio	Descripción
Reducción de fricción	Usuarios no técnicos pueden acceder con cuenta ya existente
Mayor adopción	Menos errores de "usuario olvidado"
Seguridad	Autenticación verificada por Google
Flexibilidad	Los usuarios pueden vincular/desvincular cuenta sin perder acceso
Auditoría	Registro completo de accesos por método
4. Plan de Implementación (4 Semanas)
Semana 1 — Backend (FastAPI)
Día	Actividad	Responsable
1-2	Configurar Google OAuth en Cloud Console (Client ID, URIs autorizadas)	Backend Lead
3-4	Migración DB: agregar columnas google_id, google_email, auth_provider	DB Admin
5-6	Crear servicio google_auth_service.py (exchange code, verify token, find/create user)	Backend Lead
7	Crear endpoints /auth/google/url y /auth/google	Backend Lead
8	Rate limiting, auditoría, pruebas unitarias	QA
Semana 2 — Frontend (React + Vite)
Día	Actividad	Responsable
1-2	Crear utils PKCE (pkce.js con crypto.subtle)	Frontend Lead
3-4	Crear componente GoogleCallback.jsx	Frontend Lead
5-6	Integrar botón Google en Login.jsx	Frontend Lead
7	Configurar ruta /auth/google/callback	Frontend Lead
8	Pruebas de flujo completo (nuevo usuario, existente)	QA
Semana 3 — Testing y Validación
Actividad	Descripción
Casos de prueba	- Login usuario nuevo con Google

- Login usuario existente con email coincidente
- Usuario vincula/desvincula cuenta
- Google devuelve email no verificado
- PKCE por Chrome/Firefox/Safari
  Seguridad	- Rate limiting por IP
- CSRF protection (state validation)
- Token verification (id_token)
  UX	- Botón visible después del login local
- Mensajes de error amigables
- Loading states
  Semana 4 — Producción y Monitoreo
  Actividad	Descripción
  Configuración prod	- Google Cloud Console (dominios HTTPS)
- Variables de entorno seguras
- Certificados TLS
  Despliegue	- Backend en servidor prod
- Frontend en CDN/Vercel
- Validar HTTPS
  Monitoreo	- Logs de auditoría (GOOGLE_LOGIN, GOOGLE_LINK)
- Métricas de uso (porcentaje de login Google)
- Alertas de errores

5. Riesgos y Mitigaciones
   Riesgo	Probabilidad	Impacto	Mitigación
   Error en configuración Google Cloud	Media	Media	Checklist pre-despliegue + validación con Postman
   Usuarios no pueden vincular Google	Baja	Baja	Soporte técnico + documentación clara
   Token de Google expirado antes de backend	Baja	Baja	Timeout frontend + retry automático
   Email duplicado en DB	Media	Media	Validación en backend + email único
   Google bloquea redirect URI	Baja	Media	Monitoreo de logs + contacto con soporte Google
6. Presupuesto Estimado
   Item	Costo
   Desarrollo Backend	80 horas (2 semanas full-time)
   Desarrollo Frontend	80 horas (2 semanas full-time)
   Testing y QA	40 horas (1 semana)
   Configuración Google Cloud	8 horas (1 día)
   Total	208 horas (~2.5 semanas full-time)
7. Preguntas Clave para la Toma de Decisión
   Pregunta	Opciones
   ¿Priorizamos seguridad máxima o implementación rápida?	Propuesta 1 (seguridad) vs Propuesta 2 (rapidez)
   ¿Necesitamos soportar múltiples proveedores en futuro?	Sí → Propuesta 1 (extensible)
   ¿Los usuarios pueden ser invitados sin cuenta Google?	Sí → Propuesta 1 (soporta vinculación/desvinculación)
   ¿Budget disponible para 2.5 semanas full-time?	Sí → Propuesta 1
8. Siguientes Pasos Inmediatos
   Aprobación de propuesta (esta presentación)
   Crear cuenta en Google Cloud Console (propietario del proyecto)
   Asignar responsables (Backend Lead, Frontend Lead, QA)
   Comenzar desarrollo (Semana 1)
9. Conclusión
   La Propuesta 1 (PKCE con Crypto Nativo) es la opción recomendada por:

✅ Mayor seguridad (estándar de la industria)
✅ Mejor UX (gestión de vinculación de cuentas)
✅ Máxima flexibilidad (soporta múltiples proveedores)
✅ Auditoría completa (logs detallados)
✅ Menos dependencias (más ligero en producción)

Tiempo estimado: 4 semanas
Inversión: 2.5 semanas full-time
Retorno: Autenticación social + seguridad + escalabilidad
