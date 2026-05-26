from fastapi import FastAPI

from backend.routers.auth_router import (
    router as auth_router
)

from backend.routers.test_router import (
    router as test_router
)


# -----------------------------------
# APP
# -----------------------------------

app = FastAPI(
    title="DatCorr API",
    version="1.0.0"
)

# -----------------------------------
# ROUTERS
# -----------------------------------

app.include_router(
    auth_router
)

app.include_router(test_router)


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