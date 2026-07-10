from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from backend.schemas.database_schema import (
    BasesResponse,
    BaseInfo,
    ConsultaResponse,
    BusquedaResponse,
    ActualizarRequest,
    ActualizarResponse,
    TablasResponse,
    ColumnasResponse,
    ColumnaInfo,
    CrearRegistroRequest,
    CrearRegistroResponse,
)

from backend.services.database_service_web import (
    listar_bases,
    consultar_base,
    buscar_en_base,
    actualizar_registro,
    obtener_tablas,
    obtener_columnas,
    insertar_registro,
)

router = APIRouter(prefix="/databases", tags=["Databases"])


@router.get("/", response_model=BasesResponse)
def listar_bases_endpoint():
    bases = listar_bases()
    return BasesResponse(success=True, bases=[BaseInfo(**b) for b in bases])


@router.get("/{base}/tables", response_model=TablasResponse)
def listar_tablas(base: str):
    try:
        tablas = obtener_tablas(base)
        return TablasResponse(success=True, tablas=tablas)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{base}/data", response_model=ConsultaResponse)
def consultar_datos(
    base: str,
    table: str = Query("Datcorr_database"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
):
    try:
        columnas, registros = consultar_base(base, table)
        offset = (page - 1) * limit
        paginados = registros[offset : offset + limit]
        return ConsultaResponse(
            success=True,
            total=len(registros),
            columnas=columnas,
            registros=paginados,
        )
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{base}/search", response_model=BusquedaResponse)
def buscar_datos(
    base: str,
    q: str = Query("", min_length=1),
    table: str = Query("Datcorr_database"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="El parámetro 'q' es obligatorio")
    try:
        columnas, registros = buscar_en_base(base, q.strip(), table)
        offset = (page - 1) * limit
        paginados = registros[offset : offset + limit]
        return BusquedaResponse(
            success=True,
            total=len(registros),
            columnas=columnas,
            registros=paginados,
            base=base,
        )
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{base}/columns", response_model=ColumnasResponse)
def listar_columnas(
    base: str,
    table: str = Query("Datcorr_database"),
):
    try:
        columnas = obtener_columnas(base, table)
        return ColumnasResponse(
            success=True,
            columnas=[ColumnaInfo(**c) for c in columnas],
        )
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{base}/records", response_model=CrearRegistroResponse)
def crear_registro(
    base: str,
    body: CrearRegistroRequest,
    table: str = Query("Datcorr_database"),
):
    try:
        registro_id = insertar_registro(base, body.data, table)
        return CrearRegistroResponse(
            success=True,
            mensaje="Registro creado correctamente",
            registro_id=registro_id,
        )
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{base}/records/{record_id}", response_model=ActualizarResponse)
def actualizar(
    base: str,
    record_id: int,
    body: ActualizarRequest,
    table: str = Query("Datcorr_database"),
):
    try:
        actualizar_registro(base, record_id, body.data, table)
        return ActualizarResponse(success=True, mensaje="Registro actualizado correctamente")
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
