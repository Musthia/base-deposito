from fastapi import FastAPI

from backend.routers.auth_router import (
    router as auth_router
)

from backend.routers.admin_router import (
    router as admin_router
)

from backend.routers.usuarios_router import (
    router as usuarios_router
)

from backend.core.exceptions import (
    DatcorrException
)

from backend.core.handlers import (

    datcorr_exception_handler,

    generic_exception_handler
)

# -----------------------------------
# APP
# -----------------------------------

app = FastAPI(
    title="DatCorr API",
    version="1.0.0"
)

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

app.include_router(
    auth_router
)

app.include_router(admin_router)

app.include_router(usuarios_router)


# -----------------------------------
# ROOT
# -----------------------------------

@app.get("/")
def root():

    return {
        "mensaje": "DatCorr API funcionando"
    }

# -----------------------------------
# HEALTH
# -----------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok"
    }