# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed internal and external users. Internal operators (administrative staff, managers) query, browse, and update records across multiple PostgreSQL databases. External users (clients or affiliated personnel) access the system with restricted, permission-based views. The permission system distinguishes roles like "Consultar", "Editar", "Eliminar", "Exportar", "Importar", and "ADMIN_USUARIOS".

## Product Purpose

DatCorr is an internal records management platform that provides a unified interface for browsing, searching, editing, and managing records across many PostgreSQL databases. It also includes a desktop companion (PySide6) that shares the same backend. The web version (FastAPI + React) is actively replacing the legacy desktop app.

## Positioning

A permission-gated multi-database records platform that unifies several distinct databases under a single authenticated interface, with granular per-user permissions, audit trails, and external system integrations (SIMCO).

## Operating Context

- Desktop app (PySide6) being hybridized to web (React + Vite + MUI frontend, FastAPI backend)
- Backend connects to PostgreSQL databases
- JWT-based authentication with refresh tokens
- Real-time notifications via WebSocket (SIMCO WS)
- Password recovery flow via email
- Spanish-language interface throughout

## Capabilities and Constraints

- Authentication & user management (login, registration, password recovery)
- Role-based access control with granular permissions (CRUD per resource)
- Multi-database record browsing, searching, editing, and data entry
- Dashboard with summaries
- Reporting module
- SIMCO integration (external system, including WebSocket channel)
- Audit logging of user actions
- Notification system
- Desktop app still coexists (PySide6); no planned deprecation date
- Database table creation runs automatically on backend startup
- Rate limiting and JWT middleware for security

## Brand Commitments

- Product name: "DatCorr" (stylized as "Datcorr" in the icon file `img/Datcorr.ico`)
- Spanish-language product (UI, terminology, messages)
- Existing permission vocabulary: CONSULTAR, EDITAR, ELIMINAR, EXPORTAR, IMPORTAR, ADMIN_USUARIOS
- Icon and branding assets in `img/` directory
- SIMCO integration is a committed feature

## Evidence on Hand

- Working FastAPI backend at `backend/main.py` with 12+ routers
- Working React frontend at `frontend/src/` using MUI, Vite
- Desktop app entry point at `base_datcorr.py` (PySide6)
- Plan de trabajo at `plan_de_trabajo.md` documenting the web hybridization progress
- Existing database schemas and migrations in `database/` and `db/`
- Permission/per-user model documented in `machete de cosas.txt`

## Product Principles

1. Permission-first security: every operation is gated through the roles/permissions system; no unauthenticated data access.
2. Unified records access: all connected databases are browsable from a single interface regardless of schema differences.
3. Migration without regression: the web version must reach feature parity with the desktop app without breaking existing desktop workflows.
4. Spanish-first: all UI labels, messages, and terminology remain in Spanish; no assumptions of English proficiency.
5. External integration stability: SIMCO and other external system integrations must survive backend updates without protocol changes.

## Accessibility & Inclusion

N/A — no product-specific accessibility requirements were established beyond standard web compliance.
