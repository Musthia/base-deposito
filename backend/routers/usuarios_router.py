from backend.core.logger import logger

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Query
)

from backend.schemas.usuario_schema import (
    UsuarioResponse,
    UsuarioCreate,
    UsuarioCreateResponse,
    UsuariosListadoResponse,
    UsuarioUpdate,
    UsuarioUpdateResponse
)

from backend.services.usuarios_service import (
    listar_usuarios_web,
    crear_usuario_web,
    actualizar_usuario_web,
    desactivar_usuario_web
)

from backend.security.jwt_bearer import (
    obtener_usuario_actual
)

from backend.security.permissions import (
    requiere_permiso
)

from sqlalchemy.orm import Session

from backend.dependencies import (
    get_db
)

from database.conexion import (
    SessionLocal
)

from backend.core.exceptions import (
    DatcorrException
)

from typing import Optional

from backend.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    RefreshResponse
)

from backend.schemas.auth_schema import (
    RefreshRequest,
    RefreshResponse
)

from backend.services.auth_service import (
    refresh_access_token
)

# -----------------------------------
# DB SESSION
# -----------------------------------

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# -----------------------------------
# LISTAR USUARIOS
# -----------------------------------

@router.get(
    "/",
    response_model=UsuariosListadoResponse
)

def listar_usuarios(

    page: int = 1,

    limit: int = 20,

    search: str = "",

    rol: str = "",

    activo: Optional[bool] = None,

    usuario_actual = Depends(
        requiere_permiso(
            "ADMIN_USUARIOS"
        )
    ),

    sort_by: str = Query(
        "id"
    ),

    order: str = Query(
        "asc"
    ),

    db: Session = Depends(
        get_db
    )
):


    logger.debug(
        "API WEB: listar usuarios"
    )

    resultado = listar_usuarios_web(

        db=db,

        page=page,

        limit=limit,

        search=search,

        rol=rol,

        activo=activo,

        sort_by=sort_by,

        order=order
    )

    usuarios_db = resultado[
        "usuarios"
    ]

    usuarios_response = []

    for usuario in usuarios_db:

        usuarios_response.append(

            UsuarioResponse(

                id=usuario.id,

                nombre=usuario.nombre,

                apellido=usuario.apellido,

                usuario=usuario.usuario,

                rol=usuario.rol,

                nivel_seguridad=(
                    usuario.nivel_seguridad
                ),

                activo=usuario.activo,

                es_superusuario=(
                    usuario.es_superusuario
                )
            )
        )

    logger.debug(
        f"Usuarios serializados: "
        f"{len(usuarios_response)}"
    )

    return UsuariosListadoResponse(

        success=True,

        total=resultado["total"],

        page=resultado["page"],

        limit=resultado["limit"],

        pages=resultado["pages"],

        usuarios=usuarios_response
    )

# -----------------------------------
# CREAR USUARIO
# -----------------------------------

@router.post(
    "/",
    response_model=UsuarioCreateResponse
)

def crear_usuario(

    datos: UsuarioCreate,

    db: Session = Depends(get_db),

    usuario_actual=Depends(
        obtener_usuario_actual
    )
):

    logger.debug(
        f"Usuario actual: "
        f"{usuario_actual.usuario}"
    )

    # -----------------------------
    # VALIDAR NIVEL
    # -----------------------------

    if (
        not usuario_actual.es_superusuario
        and
        usuario_actual.nivel_seguridad < 10
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "Sin permisos "
                "para crear usuarios."
            )
        )

    # -----------------------------
    # CREAR
    # -----------------------------

    resultado = crear_usuario_web(
        db,
        datos
    )

    # -----------------------------
    # ERROR
    # -----------------------------

    if not resultado["success"]:

        raise HTTPException(
            status_code=400,
            detail=resultado["mensaje"]
        )

    # -----------------------------
    # OK
    # -----------------------------

    return UsuarioCreateResponse(

        success=True,

        mensaje=resultado["mensaje"],

        usuario_id=(
            resultado["usuario_id"]
        )
    )

# -----------------------------------
# ACTUALIZAR USUARIO
# -----------------------------------

@router.patch(

    "/{usuario_id}",

    response_model=(
        UsuarioUpdateResponse
    )
)

def actualizar_usuario(

    usuario_id: int,

    datos: UsuarioUpdate,

    usuario_actual=Depends(
        obtener_usuario_actual
    ),

    db: Session = Depends(
        get_db
    )
):

    # -----------------------------
    # VALIDAR PERMISOS
    # -----------------------------

    if (
        not usuario_actual.es_superusuario
        and
        usuario_actual.nivel_seguridad < 10
    ):

        raise HTTPException(

            status_code=403,

            detail=(
                "Sin permisos "
                "para actualizar usuarios."
            )
        )

    # -----------------------------
    # ACTUALIZAR
    # -----------------------------

    resultado = actualizar_usuario_web(

        db=db,

        usuario_id=usuario_id,

        datos=datos
    )

    logger.debug(
        f"Resultado update: "
        f"{resultado}"
    )

    # -----------------------------
    # ERROR
    # -----------------------------

    if not resultado["success"]:

        raise HTTPException(

            status_code=400,

            detail=(
                resultado["mensaje"]
            )
        )

    # -----------------------------
    # OK
    # -----------------------------

    return UsuarioUpdateResponse(

        success=True,

        mensaje=(
            resultado["mensaje"]
        )
    )

# -----------------------------------
# DESACTIVAR USUARIO
# -----------------------------------

@router.delete(

    "/{usuario_id}"
)

def desactivar_usuario(

    usuario_id: int,

    usuario_actual=Depends(
        obtener_usuario_actual
    ),

    db: Session = Depends(
        get_db
    )
):

    # -----------------------------
    # VALIDAR PERMISOS
    # -----------------------------

    if (

        not usuario_actual.es_superusuario

        and

        usuario_actual.nivel_seguridad < 10
    ):

        raise HTTPException(

            status_code=403,

            detail=(
                "Sin permisos "
                "para desactivar usuarios."
            )
        )

    # -----------------------------
    # DESACTIVAR
    # -----------------------------

    resultado = desactivar_usuario_web(
        
        db=db,
    
        usuario_id=usuario_id,
    
        usuario_actual=usuario_actual.usuario
    )

    # -----------------------------
    # ERROR
    # -----------------------------

    if not resultado["success"]:

        raise HTTPException(

            status_code=400,

            detail=(
                resultado["mensaje"]
            )
        )

    # -----------------------------
    # OK
    # -----------------------------

    return resultado

@router.post(

    "/refresh",

    response_model=RefreshResponse
)

@router.post(

    "/refresh",

    response_model=RefreshResponse
)

def refresh_token(

    datos: RefreshRequest,

    db: Session = Depends(get_db)
):

    resultado = refresh_access_token(

        db=db,

        refresh_token=datos.refresh_token
    )

    # -------------------------
    # ERROR
    # -------------------------

    if not resultado["success"]:

        raise HTTPException(

            status_code=401,

            detail=resultado["mensaje"]
        )

    # -------------------------
    # OK
    # -------------------------

    return RefreshResponse(

        success=True,

        access_token=resultado[
            "access_token"
        ],

        refresh_token=resultado[
            "refresh_token"
        ]
    )