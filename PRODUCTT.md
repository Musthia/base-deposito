


# Producto

<!-- impeccable:product-schema 1 -->

## Plataforma

Web

## Usuarios

Usuarios internos y externos. Los operadores internos (personal administrativo, gerentes) consultan, exploran y actualizan registros en múltiples bases de datos PostgreSQL. Los usuarios externos (clientes o personal afiliado) acceden al sistema con vistas restringidas basadas en permisos. El sistema de permisos distingue roles como "Consultar", "Editar", "Eliminar", "Exportar", "Importar" y "ADMIN_USUARIOS".

## Propósito del producto

DatCorr es una plataforma interna de gestión de registros que proporciona una interfaz unificada para explorar, buscar, editar y administrar registros en múltiples bases de datos PostgreSQL. También incluye una aplicación de escritorio (PySide6) que comparte el mismo backend. La versión web (FastAPI + React) está reemplazando progresivamente la aplicación de escritorio anterior.

## Posicionamiento

Una plataforma de registros de múltiples bases de datos con acceso controlado por permisos que unifica varias bases de datos distintas bajo una única interfaz autenticada, con permisos granulares por usuario, registros de auditoría e integraciones con sistemas externos (SIMCO).

## Contexto Operativo

- Aplicación de escritorio (PySide6) en proceso de hibridación a web (frontend React + Vite + MUI, backend FastAPI)
- El backend se conecta a bases de datos PostgreSQL
- Autenticación basada en JWT con tokens de actualización
- Notificaciones en tiempo real mediante WebSocket (SIMCO WS)
- Recuperación de contraseña por correo electrónico
- Interfaz en español

## Capacidades y Limitaciones

- Autenticación y gestión de usuarios (inicio de sesión, registro, recuperación de contraseña)
- Control de acceso basado en roles con permisos granulares (CRUD por recurso)
- Navegación, búsqueda, edición e introducción de datos en múltiples bases de datos
- Panel de control con resúmenes
- Módulo de informes
- Integración con SIMCO (sistema externo, incluyendo canal WebSocket)
- Registro de auditoría de las acciones del usuario
- Sistema de notificaciones
- La aplicación de escritorio (PySide6) aún coexiste Sin fecha de descontinuación prevista
- La creación de tablas de base de datos se ejecuta automáticamente al iniciar el backend
- Limitación de velocidad y middleware JWT para mayor seguridad

## Compromisos de marca

- Nombre del producto: "DatCorr" (estilizado como "Datcorr" en el archivo de icono `img/Datcorr.ico`)
- Producto en español (interfaz de usuario, terminología, mensajes)
- Vocabulario de permisos existente: CONSULTAR, EDITAR, ELIMINAR, EXPORTAR, IMPORTAR, ADMIN_USUARIOS
- Iconos y recursos de marca en el directorio `img/`
- La integración con SIMCO es una funcionalidad comprometida

## Evidencia disponible

- Backend FastAPI funcional en `backend/main.py` con más de 12 enrutadores
- Frontend React funcional en `frontend/src/` usando MUI, Vite
- Punto de entrada de la aplicación de escritorio en `base_datcorr.py` (PySide6)
- Plan de trabajo en `plan_de_trabajo.md` que documenta la web Avances en la hibridación
- Esquemas de base de datos y migraciones existentes en `database/` y `db/`
- Modelo de permisos/por usuario documentado en `machete de cosas.txt`

## Principios del producto

1. Seguridad basada en permisos: cada operación se gestiona mediante el sistema de roles/permisos; no se permite el acceso a datos sin autenticación.
2. Acceso unificado a registros: todas las bases de datos conectadas se pueden explorar desde una única interfaz, independientemente de las diferencias de esquema.
3. Migración sin regresión: la versión web debe alcanzar la paridad de funcionalidades con la aplicación de escritorio sin interrumpir los flujos de trabajo de escritorio existentes.
4. Prioridad al español: todas las etiquetas, mensajes y terminología de la interfaz de usuario permanecen en español; no se presupone dominio del inglés.
5. Estabilidad de la integración externa: SIMCO y otras integraciones de sistemas externos deben sobrevivir a las actualizaciones del backend sin cambios de protocolo.

## Accesibilidad e inclusión

N/A: no se establecieron requisitos de accesibilidad específicos del producto más allá del cumplimiento web estándar.
