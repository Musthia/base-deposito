from datetime import datetime
import logging

from services.usuarios_permisos_service import usuario_tiene_permiso

class SessionManager:

    _usuario_actual = None
    _fecha_login = None
    _sesion_activa = False

    # -----------------------------------
    # LOGIN
    # -----------------------------------

    @classmethod
    def login(cls, usuario: dict):
    
        cls._usuario_actual = usuario
        cls._fecha_login = datetime.now()
        cls._sesion_activa = True
    
        logging.debug(
            f"Sesión iniciada: {usuario.get('usuario')}"
        )

    # -----------------------------------
    # VALIDAR SESIÓN
    # -----------------------------------

    @classmethod
    def validar_sesion(cls):

        return bool(cls._sesion_activa and cls._usuario_actual)    

    # -----------------------------------
    # LOGOUT
    # -----------------------------------

    @classmethod
    def logout(cls):

        cls._usuario_actual = None
        cls._fecha_login = None
        cls._sesion_activa = False

        logging.debug("Sesión finalizada")

    # -----------------------------------
    # OBTENER USUARIO
    # -----------------------------------

    @classmethod
    def obtener_usuario(cls):
        return cls._usuario_actual

    """ # -----------------------------------
    # VALIDAR SESIÓN
    # -----------------------------------

    @classmethod
    def hay_sesion(cls):
        return cls._sesion_activa
 """
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

        return cls._usuario_actual.get("nivel_seguridad", 0)       
        
    # -----------------------------------
    # ROL
    # -----------------------------------

    @classmethod
    def obtener_rol(cls):

        if not cls._usuario_actual:
            return None

        return cls._usuario_actual.get("rol")

    # -----------------------------------
    # PERMISOS
    # -----------------------------------

    @classmethod
    def tiene_permiso(cls, codigo_permiso):

        if not cls._usuario_actual:
            return False

        # SUPERUSUARIO BYPASS TOTAL
        if cls.es_superusuario():
            return True

        return usuario_tiene_permiso(
            cls._usuario_actual.get("id"),
            codigo_permiso
        )
            
    @classmethod
    def es_superusuario(cls):

        if not cls._usuario_actual:
            return False

        return cls._usuario_actual.get("es_superusuario", False)


    @classmethod
    def obtener_usuario_id(cls):
    
        if not cls._usuario_actual:
            return None
    
        return cls._usuario_actual.get("id")