from datetime import datetime


class SessionManager:

    # -----------------------------------
    # ESTADO GLOBAL SESIÓN
    # -----------------------------------

    _usuario_actual = None

    _fecha_login = None

    _sesion_activa = False

    # -----------------------------------
    # INICIAR SESIÓN
    # -----------------------------------

    @classmethod
    def login(cls, usuario):

        cls._usuario_actual = usuario

        cls._fecha_login = datetime.now()

        cls._sesion_activa = True

    # -----------------------------------
    # CERRAR SESIÓN
    # -----------------------------------

    @classmethod
    def logout(cls):

        cls._usuario_actual = None

        cls._fecha_login = None

        cls._sesion_activa = False

    # -----------------------------------
    # OBTENER USUARIO
    # -----------------------------------

    @classmethod
    def obtener_usuario(cls):

        return cls._usuario_actual

    # -----------------------------------
    # VALIDAR SESIÓN
    # -----------------------------------

    @classmethod
    def hay_sesion(cls):

        return cls._sesion_activa

    # -----------------------------------
    # FECHA LOGIN
    # -----------------------------------

    @classmethod
    def obtener_fecha_login(cls):

        return cls._fecha_login

    # -----------------------------------
    # NIVEL SEGURIDAD
    # -----------------------------------

    @classmethod
    def obtener_nivel_seguridad(cls):

        if not cls._usuario_actual:

            return 0

        return cls._usuario_actual.nivel_seguridad

    # -----------------------------------
    # ROL
    # -----------------------------------

    @classmethod
    def obtener_rol(cls):

        if not cls._usuario_actual:

            return None

        return cls._usuario_actual.rol