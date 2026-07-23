import os
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from backend.routers.auth_router import router as auth_router
from backend.routers.admin_router import router as admin_router
from backend.routers.usuarios_router import router as usuarios_router
from backend.routers.database_router import router as database_router
from backend.routers.dashboard_router import router as dashboard_router
from backend.routers.reportes_router import router as reportes_router
from backend.routers.roles_router import router as roles_router
from backend.routers.permisos_router import router as permisos_router
from backend.routers.simco_router import router as simco_router
from backend.routers.simco_ws import router as simco_ws_router
from backend.routers.notificaciones_router import router as notificaciones_router
from backend.routers.registro_router import router as registro_router

from backend.core.exceptions import DatcorrException
from backend.core.handlers import (
    datcorr_exception_handler,
    generic_exception_handler
)

from backend.middleware.jwt_middleware import JWTMiddleware
from backend.middleware.rate_limit_middleware import RateLimitMiddleware

from fastapi.middleware.cors import CORSMiddleware


# -----------------------------------
# LIFESPAN: run table creation on startup
# -----------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    import threading
    def run_migrations():
        import time
        max_retries = 5
        for attempt in range(1, max_retries + 1):
            try:
                from database.crear_tablas import crear_tablas
                crear_tablas()
                print("Database tables created successfully")
                return
            except Exception as e:
                if attempt < max_retries:
                    print(f"DB connection attempt {attempt}/{max_retries} failed, retrying in 5s... ({e})")
                    time.sleep(5)
                else:
                    print(f"Warning: table creation skipped after {max_retries} attempts ({e})")
    threading.Thread(target=run_migrations, daemon=True).start()
    yield


# -----------------------------------
# APP
# -----------------------------------

app = FastAPI(
    title="DatCorr API",
    version="1.0.0",
    lifespan=lifespan,
)

# -----------------------------------
# CORS
# -----------------------------------

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

if ENVIRONMENT == "production":
    allowed_origins = [FRONTEND_URL] if FRONTEND_URL else ["*"]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# MIDDLEWARE GLOBAL JWT (FASE 6E)
# -----------------------------------

app.add_middleware(RateLimitMiddleware, max_attempts=5, window_seconds=300, ban_seconds=900)
app.add_middleware(JWTMiddleware)

# -----------------------------------
# HANDLERS GLOBALES
# -----------------------------------

app.add_exception_handler(
    DatcorrException,
    datcorr_exception_handler
)

app.add_exception_handler(
    Exception,
    generic_exception_handler
)

# -----------------------------------
# ROUTERS
# -----------------------------------

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(usuarios_router)
app.include_router(database_router)
app.include_router(dashboard_router)
app.include_router(reportes_router)
app.include_router(roles_router)
app.include_router(permisos_router)
app.include_router(simco_router)
app.include_router(simco_ws_router)
app.include_router(notificaciones_router)
app.include_router(registro_router)
# -----------------------------------
# HEALTH (always available)
# -----------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


# -----------------------------------
# STATIC FILES & SPA (production) or API root (dev)
# -----------------------------------

FRONTEND_DIST = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

print(f"[STATIC] FRONTEND_DIST = {FRONTEND_DIST}")
print(f"[STATIC] exists = {os.path.isdir(FRONTEND_DIST)}")

if os.path.isdir(FRONTEND_DIST):
    print("[STATIC] Sirviendo frontend SPA via catch-all")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if not full_path:
            return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
        safe_path = os.path.realpath(os.path.join(FRONTEND_DIST, full_path))
        if safe_path.startswith(FRONTEND_DIST) and os.path.isfile(safe_path):
            return FileResponse(safe_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    print("[STATIC] frontend/dist no encontrado — solo API")
    @app.get("/")
    def root():
        return {"mensaje": "DatCorr API funcionando"}