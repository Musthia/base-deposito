from backend.core.logger import logger

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
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
    actualizar_usuario_web
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

# -----------------------------------
# DB SESSION
# -----------------------------------

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

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

    db: Session = Depends(get_db),

    usuario_actual=Depends(
        requiere_permiso(
            "ADMIN_USUARIOS"
        )
    )

):

    logger.debug(
        "API WEB: listar usuarios"
    )

    usuarios_db = listar_usuarios_web(db)

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

        total=len(usuarios_response),

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

@router.put(

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