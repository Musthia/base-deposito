from fastapi import (
    Depends,
    HTTPException
)

from backend.security.jwt_bearer import (
    obtener_usuario_actual
)

from backend.core.permisos import (
    _registrar_acceso_denegado
)

from services.usuarios_permisos_service import (
    usuario_tiene_permiso
)

# -----------------------------------
# REQUIERE PERMISO
# -----------------------------------

def requiere_permiso(
    codigo_permiso
):

    def validador(

        usuario = Depends(
            obtener_usuario_actual
        )

    ):

        # -----------------------------
        # SUPERUSUARIO
        # -----------------------------

        if usuario.es_superusuario:

            return usuario

        permitido = (
            usuario_tiene_permiso(
                usuario.id,
                codigo_permiso
            )
        )

        if not permitido:

            _registrar_acceso_denegado(
                usuario.usuario,
                f"Permiso '{codigo_permiso}' denegado a usuario '{usuario.usuario}'"
            )

            raise HTTPException(
                status_code=403,
                detail=(
                    "Permiso denegado."
                )
            )

        return usuario

    return validador

# -----------------------------------
# REQUIERE NIVEL
# -----------------------------------

def requiere_nivel(
    nivel_requerido
):

    def validador(

        usuario = Depends(
            obtener_usuario_actual
        )

    ):

        # -----------------------------
        # SUPERUSUARIO
        # -----------------------------

        if usuario.es_superusuario:

            return usuario

        if (
            usuario.nivel_seguridad
            <
            nivel_requerido
        ):

            _registrar_acceso_denegado(
                usuario.usuario,
                f"Nivel insuficiente: {usuario.nivel_seguridad} < minimo {nivel_requerido} - usuario '{usuario.usuario}'"
            )

            raise HTTPException(
                status_code=403,
                detail=(
                    "Nivel insuficiente."
                )
            )

        return usuario

    return validador