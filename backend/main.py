from fastapi import FastAPI

from backend.routers.auth_router import (
    router as auth_router
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